-- Migration 0016: Transactional guardian management and notification deletion.

DROP POLICY IF EXISTS "notifications_delete_recipient" ON public.notifications;
CREATE POLICY "notifications_delete_recipient"
    ON public.notifications
    FOR DELETE
    TO authenticated
    USING (
        recipient_id = auth.uid()
        AND school_id = public.get_user_school_id()
    );

-- Repair legacy duplicate primaries, then enforce the invariant under concurrency.
WITH ranked_primaries AS (
    SELECT id,
           row_number() OVER (
               PARTITION BY student_id
               ORDER BY created_at, id
           ) AS primary_rank
    FROM public.student_guardians
    WHERE is_primary = true
)
UPDATE public.student_guardians AS student_guardian
SET is_primary = false
FROM ranked_primaries
WHERE student_guardian.id = ranked_primaries.id
  AND ranked_primaries.primary_rank > 1;

CREATE UNIQUE INDEX IF NOT EXISTS uq_student_guardians_one_primary
    ON public.student_guardians (student_id)
    WHERE is_primary = true;

-- Remove the invalid first draft if it was created before this migration was repaired.
DROP FUNCTION IF EXISTS public.manage_student_guardian(
    uuid, uuid, varchar, boolean, varchar, varchar, varchar, varchar, varchar, numeric
);
DROP FUNCTION IF EXISTS public.manage_student_guardian(
    uuid, uuid, guardian_relation, boolean, boolean, varchar, varchar, varchar, varchar,
    varchar, varchar, numeric
);

CREATE FUNCTION public.manage_student_guardian(
    p_student_id uuid,
    p_guardian_id uuid DEFAULT NULL,
    p_relation guardian_relation DEFAULT 'guardian'::guardian_relation,
    p_is_primary boolean DEFAULT false,
    p_can_pickup boolean DEFAULT false,
    p_prefix varchar DEFAULT NULL,
    p_first_name varchar DEFAULT NULL,
    p_last_name varchar DEFAULT NULL,
    p_phone varchar DEFAULT NULL,
    p_email varchar DEFAULT NULL,
    p_occupation varchar DEFAULT NULL,
    p_monthly_income numeric DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_actor_id uuid := auth.uid();
    v_school_id uuid;
    v_user_role user_role;
    v_target_guardian_id uuid := p_guardian_id;
    v_student_guardian_id uuid;
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

    IF v_user_role NOT IN ('admin', 'homeroom_teacher', 'counselor') THEN
        RAISE EXCEPTION 'FORBIDDEN: User cannot manage guardians'
            USING ERRCODE = '42501';
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM public.students
        WHERE id = p_student_id
          AND school_id = v_school_id
    ) THEN
        RAISE EXCEPTION 'NOT_FOUND: Student not found in user school'
            USING ERRCODE = 'P0002';
    END IF;

    IF v_user_role = 'homeroom_teacher'
       AND NOT public.can_access_student(p_student_id) THEN
        RAISE EXCEPTION 'FORBIDDEN: Homeroom teacher cannot access this student'
            USING ERRCODE = '42501';
    END IF;

    IF NULLIF(btrim(p_first_name), '') IS NULL
       OR NULLIF(btrim(p_last_name), '') IS NULL THEN
        RAISE EXCEPTION 'VALIDATION_ERROR: Guardian first and last name are required'
            USING ERRCODE = '22023';
    END IF;

    IF v_target_guardian_id IS NULL THEN
        INSERT INTO public.guardians (
            school_id, prefix, first_name, last_name, phone, email, occupation, monthly_income
        ) VALUES (
            v_school_id,
            NULLIF(btrim(p_prefix), ''),
            btrim(p_first_name),
            btrim(p_last_name),
            NULLIF(btrim(p_phone), ''),
            NULLIF(btrim(p_email), ''),
            NULLIF(btrim(p_occupation), ''),
            p_monthly_income
        )
        RETURNING id INTO v_target_guardian_id;
    ELSE
        IF NOT EXISTS (
            SELECT 1
            FROM public.student_guardians
            WHERE student_id = p_student_id
              AND guardian_id = v_target_guardian_id
              AND school_id = v_school_id
        ) THEN
            RAISE EXCEPTION 'NOT_FOUND: Guardian is not linked to this student'
                USING ERRCODE = 'P0002';
        END IF;

        UPDATE public.guardians
        SET prefix = NULLIF(btrim(p_prefix), ''),
            first_name = btrim(p_first_name),
            last_name = btrim(p_last_name),
            phone = NULLIF(btrim(p_phone), ''),
            email = NULLIF(btrim(p_email), ''),
            occupation = NULLIF(btrim(p_occupation), ''),
            monthly_income = p_monthly_income,
            updated_at = now()
        WHERE id = v_target_guardian_id
          AND school_id = v_school_id;
    END IF;

    IF p_is_primary THEN
        UPDATE public.student_guardians
        SET is_primary = false
        WHERE student_id = p_student_id
          AND school_id = v_school_id
          AND guardian_id <> v_target_guardian_id
          AND is_primary = true;
    END IF;

    INSERT INTO public.student_guardians (
        school_id, student_id, guardian_id, relation, is_primary, can_pickup
    ) VALUES (
        v_school_id,
        p_student_id,
        v_target_guardian_id,
        p_relation,
        p_is_primary,
        p_can_pickup
    )
    ON CONFLICT (student_id, guardian_id) DO UPDATE
    SET relation = EXCLUDED.relation,
        is_primary = EXCLUDED.is_primary,
        can_pickup = EXCLUDED.can_pickup
    RETURNING id INTO v_student_guardian_id;

    RETURN jsonb_build_object(
        'guardian_id', v_target_guardian_id,
        'student_guardian_id', v_student_guardian_id
    );
END;
$$;

DROP FUNCTION IF EXISTS public.remove_student_guardian(uuid, uuid);
CREATE FUNCTION public.remove_student_guardian(
    p_student_id uuid,
    p_guardian_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_actor_id uuid := auth.uid();
    v_school_id uuid;
    v_user_role user_role;
    v_was_primary boolean;
    v_deleted_count integer;
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

    IF v_user_role NOT IN ('admin', 'homeroom_teacher', 'counselor') THEN
        RAISE EXCEPTION 'FORBIDDEN: User cannot manage guardians'
            USING ERRCODE = '42501';
    END IF;

    IF v_user_role = 'homeroom_teacher'
       AND NOT public.can_access_student(p_student_id) THEN
        RAISE EXCEPTION 'FORBIDDEN: Homeroom teacher cannot access this student'
            USING ERRCODE = '42501';
    END IF;

    SELECT is_primary
    INTO v_was_primary
    FROM public.student_guardians
    WHERE student_id = p_student_id
      AND guardian_id = p_guardian_id
      AND school_id = v_school_id;

    IF v_was_primary IS NULL THEN
        RAISE EXCEPTION 'NOT_FOUND: Guardian link not found in user school'
            USING ERRCODE = 'P0002';
    END IF;

    DELETE FROM public.student_guardians
    WHERE student_id = p_student_id
      AND guardian_id = p_guardian_id
      AND school_id = v_school_id;
    GET DIAGNOSTICS v_deleted_count = ROW_COUNT;

    IF v_was_primary THEN
        UPDATE public.student_guardians
        SET is_primary = true
        WHERE id = (
            SELECT id
            FROM public.student_guardians
            WHERE student_id = p_student_id
              AND school_id = v_school_id
            ORDER BY created_at, id
            LIMIT 1
        );
    END IF;

    DELETE FROM public.guardians
    WHERE id = p_guardian_id
      AND school_id = v_school_id
      AND NOT EXISTS (
          SELECT 1
          FROM public.student_guardians
          WHERE guardian_id = p_guardian_id
      );

    RETURN jsonb_build_object('deleted', v_deleted_count = 1);
END;
$$;

REVOKE ALL ON FUNCTION public.manage_student_guardian(
    uuid, uuid, guardian_relation, boolean, boolean, varchar, varchar, varchar, varchar,
    varchar, varchar, numeric
) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.manage_student_guardian(
    uuid, uuid, guardian_relation, boolean, boolean, varchar, varchar, varchar, varchar,
    varchar, varchar, numeric
) TO authenticated;

REVOKE ALL ON FUNCTION public.remove_student_guardian(uuid, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.remove_student_guardian(uuid, uuid) TO authenticated;
