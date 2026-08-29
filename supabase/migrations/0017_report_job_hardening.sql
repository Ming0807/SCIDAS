-- Migration 0017: Harden report-job lifecycle and report artifact deletion.

ALTER TABLE public.report_jobs
    ADD COLUMN IF NOT EXISTS claim_token uuid;

CREATE INDEX IF NOT EXISTS idx_report_jobs_queued_claim
    ON public.report_jobs (school_id, status, requested_at, id)
    WHERE status = 'queued';

CREATE INDEX IF NOT EXISTS idx_report_jobs_running_started
    ON public.report_jobs (school_id, started_at, id)
    WHERE status = 'running';

-- Reporters use this policy for the initial upload. Requesters may also delete
-- the artifact referenced by their own report job; leadership keeps school-wide
-- deletion access.
DROP POLICY IF EXISTS "Leadership and requester can delete school report artifacts" ON storage.objects;
CREATE POLICY "Leadership and requester can delete school report artifacts"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'reports'
        AND auth.role() = 'authenticated'
        AND (storage.foldername(name))[1] = public.get_user_school_id()::text
        AND (
            public.get_user_role() IN ('admin', 'director')
            OR EXISTS (
                SELECT 1
                FROM public.report_jobs AS rj
                WHERE rj.school_id = public.get_user_school_id()
                  AND rj.requested_by = auth.uid()
                  AND rj.output_bucket = 'reports'
                  AND rj.output_path = storage.objects.name
            )
        )
    );

-- All report-job lifecycle writes below go through narrowly scoped functions.
DROP POLICY IF EXISTS "Staff can update or retry report jobs" ON public.report_jobs;
DROP POLICY IF EXISTS "Update report jobs by requester or admin" ON public.report_jobs;

CREATE OR REPLACE FUNCTION public.claim_report_job(p_job_id uuid DEFAULT NULL)
RETURNS SETOF public.report_jobs
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_actor_id uuid := auth.uid();
    v_school_id uuid;
    v_user_role user_role;
    v_job public.report_jobs;
BEGIN
    SELECT school_id, role
    INTO v_school_id, v_user_role
    FROM public.profiles
    WHERE id = v_actor_id
      AND is_active = true;

    IF v_actor_id IS NULL OR v_school_id IS NULL THEN
        RAISE EXCEPTION 'UNAUTHORIZED: Active user profile not found'
            USING ERRCODE = '42501';
    END IF;

    IF v_user_role NOT IN ('admin', 'director', 'homeroom_teacher', 'counselor', 'subject_teacher') THEN
        RAISE EXCEPTION 'FORBIDDEN: User cannot process report jobs'
            USING ERRCODE = '42501';
    END IF;

    SELECT *
    INTO v_job
    FROM public.report_jobs
    WHERE school_id = v_school_id
      AND status = 'queued'
      AND (p_job_id IS NULL OR id = p_job_id)
    ORDER BY requested_at, id
    FOR UPDATE SKIP LOCKED
    LIMIT 1;

    IF NOT FOUND THEN
        RETURN;
    END IF;

    UPDATE public.report_jobs
    SET status = 'running',
        started_at = now(),
        completed_at = NULL,
        error_message = NULL,
        output_bucket = NULL,
        output_path = NULL,
        claim_token = gen_random_uuid(),
        updated_at = now()
    WHERE id = v_job.id
      AND school_id = v_school_id
      AND status = 'queued'
    RETURNING * INTO v_job;

    IF FOUND THEN
        RETURN NEXT v_job;
    END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.complete_report_job(
    p_job_id uuid,
    p_claim_token uuid,
    p_output_path text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_actor_id uuid := auth.uid();
    v_school_id uuid;
    v_user_role user_role;
    v_updated_count integer;
BEGIN
    SELECT school_id, role
    INTO v_school_id, v_user_role
    FROM public.profiles
    WHERE id = v_actor_id
      AND is_active = true;

    IF v_actor_id IS NULL OR v_school_id IS NULL THEN
        RAISE EXCEPTION 'UNAUTHORIZED: Active user profile not found'
            USING ERRCODE = '42501';
    END IF;

    IF v_user_role NOT IN ('admin', 'director', 'homeroom_teacher', 'counselor', 'subject_teacher') THEN
        RAISE EXCEPTION 'FORBIDDEN: User cannot complete report jobs'
            USING ERRCODE = '42501';
    END IF;

    IF p_output_path IS NULL
       OR p_output_path !~ ('^' || v_school_id::text || '/[^/]+$') THEN
        RAISE EXCEPTION 'VALIDATION_ERROR: Report artifact path is invalid'
            USING ERRCODE = '22023';
    END IF;

    UPDATE public.report_jobs
    SET status = 'completed',
        completed_at = now(),
        output_bucket = 'reports',
        output_path = p_output_path,
        error_message = NULL,
        claim_token = NULL,
        updated_at = now()
    WHERE id = p_job_id
      AND school_id = v_school_id
      AND status = 'running'
      AND claim_token = p_claim_token;

    GET DIAGNOSTICS v_updated_count = ROW_COUNT;
    RETURN v_updated_count = 1;
END;
$$;

CREATE OR REPLACE FUNCTION public.fail_report_job(
    p_job_id uuid,
    p_claim_token uuid,
    p_error_message text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_actor_id uuid := auth.uid();
    v_school_id uuid;
    v_user_role user_role;
    v_updated_count integer;
BEGIN
    SELECT school_id, role
    INTO v_school_id, v_user_role
    FROM public.profiles
    WHERE id = v_actor_id
      AND is_active = true;

    IF v_actor_id IS NULL OR v_school_id IS NULL THEN
        RAISE EXCEPTION 'UNAUTHORIZED: Active user profile not found'
            USING ERRCODE = '42501';
    END IF;

    IF v_user_role NOT IN ('admin', 'director', 'homeroom_teacher', 'counselor', 'subject_teacher') THEN
        RAISE EXCEPTION 'FORBIDDEN: User cannot fail report jobs'
            USING ERRCODE = '42501';
    END IF;

    UPDATE public.report_jobs
    SET status = 'failed',
        completed_at = now(),
        output_bucket = NULL,
        output_path = NULL,
        error_message = left(coalesce(nullif(btrim(p_error_message), ''), 'Report processing failed'), 1000),
        claim_token = NULL,
        updated_at = now()
    WHERE id = p_job_id
      AND school_id = v_school_id
      AND status = 'running'
      AND claim_token = p_claim_token;

    GET DIAGNOSTICS v_updated_count = ROW_COUNT;
    RETURN v_updated_count = 1;
END;
$$;

CREATE OR REPLACE FUNCTION public.recover_stale_report_jobs(
    p_stale_before timestamptz DEFAULT NULL
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_actor_id uuid := auth.uid();
    v_school_id uuid;
    v_user_role user_role;
    v_stale_before timestamptz;
    v_recovered_count integer;
BEGIN
    SELECT school_id, role
    INTO v_school_id, v_user_role
    FROM public.profiles
    WHERE id = v_actor_id
      AND is_active = true;

    IF v_actor_id IS NULL OR v_school_id IS NULL THEN
        RAISE EXCEPTION 'UNAUTHORIZED: Active user profile not found'
            USING ERRCODE = '42501';
    END IF;

    IF v_user_role NOT IN ('admin', 'director') THEN
        RAISE EXCEPTION 'FORBIDDEN: Only school leadership can recover stale report jobs'
            USING ERRCODE = '42501';
    END IF;

    -- Never accept a cutoff newer than the server-side timeout threshold.
    v_stale_before := LEAST(
        coalesce(p_stale_before, now() - interval '10 minutes'),
        now() - interval '10 minutes'
    );

    UPDATE public.report_jobs
    SET status = 'failed',
        completed_at = now(),
        output_bucket = NULL,
        output_path = NULL,
        error_message = 'การประมวลผลหมดเวลา (Timeout) กรุณาลองใหม่',
        claim_token = NULL,
        updated_at = now()
    WHERE school_id = v_school_id
      AND status = 'running'
      AND started_at < v_stale_before;

    GET DIAGNOSTICS v_recovered_count = ROW_COUNT;
    RETURN v_recovered_count;
END;
$$;

CREATE OR REPLACE FUNCTION public.retry_report_job(p_job_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_actor_id uuid := auth.uid();
    v_school_id uuid;
    v_user_role user_role;
    v_updated_count integer;
BEGIN
    SELECT school_id, role
    INTO v_school_id, v_user_role
    FROM public.profiles
    WHERE id = v_actor_id
      AND is_active = true;

    IF v_actor_id IS NULL OR v_school_id IS NULL THEN
        RAISE EXCEPTION 'UNAUTHORIZED: Active user profile not found'
            USING ERRCODE = '42501';
    END IF;

    IF v_user_role NOT IN ('admin', 'director', 'homeroom_teacher', 'counselor', 'subject_teacher') THEN
        RAISE EXCEPTION 'FORBIDDEN: User cannot retry report jobs'
            USING ERRCODE = '42501';
    END IF;

    UPDATE public.report_jobs
    SET status = 'queued',
        started_at = NULL,
        completed_at = NULL,
        output_bucket = NULL,
        output_path = NULL,
        error_message = NULL,
        claim_token = NULL,
        updated_at = now()
    WHERE id = p_job_id
      AND school_id = v_school_id
      AND status = 'failed'
      AND (requested_by = v_actor_id OR v_user_role IN ('admin', 'director'));

    GET DIAGNOSTICS v_updated_count = ROW_COUNT;
    RETURN v_updated_count = 1;
END;
$$;

REVOKE ALL ON FUNCTION public.claim_report_job(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.claim_report_job(uuid) TO authenticated;

REVOKE ALL ON FUNCTION public.complete_report_job(uuid, uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.complete_report_job(uuid, uuid, text) TO authenticated;

REVOKE ALL ON FUNCTION public.fail_report_job(uuid, uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.fail_report_job(uuid, uuid, text) TO authenticated;

REVOKE ALL ON FUNCTION public.recover_stale_report_jobs(timestamptz) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.recover_stale_report_jobs(timestamptz) TO authenticated;

REVOKE ALL ON FUNCTION public.retry_report_job(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.retry_report_job(uuid) TO authenticated;
