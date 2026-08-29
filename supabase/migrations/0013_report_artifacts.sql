-- Migration 0013: Report Artifacts Storage Bucket and Hardened Policies

-- 1. Create Private Storage Bucket for Reports
INSERT INTO storage.buckets (id, name, public)
VALUES ('reports', 'reports', false)
ON CONFLICT (id) DO NOTHING;

-- 2. Storage Policies for 'reports' Bucket
DROP POLICY IF EXISTS "School staff can view school report artifacts" ON storage.objects;
CREATE POLICY "School staff can view school report artifacts"
    ON storage.objects FOR SELECT
    USING (
        bucket_id = 'reports'
        AND (
            auth.role() = 'authenticated'
            AND (storage.foldername(name))[1] = get_user_school_id()::text
        )
    );

DROP POLICY IF EXISTS "Staff can upload school report artifacts" ON storage.objects;
CREATE POLICY "Staff can upload school report artifacts"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'reports'
        AND auth.role() = 'authenticated'
        AND (storage.foldername(name))[1] = get_user_school_id()::text
        AND get_user_role() IN ('admin', 'director', 'homeroom_teacher', 'counselor', 'subject_teacher')
    );

DROP POLICY IF EXISTS "Staff can update school report artifacts" ON storage.objects;
CREATE POLICY "Staff can update school report artifacts"
    ON storage.objects FOR UPDATE
    USING (
        bucket_id = 'reports'
        AND auth.role() = 'authenticated'
        AND (storage.foldername(name))[1] = get_user_school_id()::text
        AND get_user_role() IN ('admin', 'director', 'homeroom_teacher', 'counselor', 'subject_teacher')
    );

DROP POLICY IF EXISTS "Leadership and requester can delete school report artifacts" ON storage.objects;
CREATE POLICY "Leadership and requester can delete school report artifacts"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'reports'
        AND auth.role() = 'authenticated'
        AND (storage.foldername(name))[1] = get_user_school_id()::text
        AND get_user_role() IN ('admin', 'director')
    );

-- 3. Hardened RLS policies for report_jobs table
DROP POLICY IF EXISTS "View report jobs by requester or leadership" ON report_jobs;
DROP POLICY IF EXISTS "School staff can view report jobs" ON report_jobs;
CREATE POLICY "School staff can view report jobs"
    ON report_jobs FOR SELECT
    USING (
        school_id = get_user_school_id()
    );

DROP POLICY IF EXISTS "Request own report jobs" ON report_jobs;
DROP POLICY IF EXISTS "School staff can request report jobs" ON report_jobs;
CREATE POLICY "School staff can request report jobs"
    ON report_jobs FOR INSERT
    WITH CHECK (
        school_id = get_user_school_id()
        AND requested_by = auth.uid()
        AND get_user_role() IN ('admin', 'director', 'homeroom_teacher', 'counselor', 'subject_teacher')
    );

DROP POLICY IF EXISTS "Update report jobs by requester or admin" ON report_jobs;
DROP POLICY IF EXISTS "Staff can update or retry report jobs" ON report_jobs;
CREATE POLICY "Staff can update or retry report jobs"
    ON report_jobs FOR UPDATE
    USING (
        school_id = get_user_school_id()
        AND (
            requested_by = auth.uid()
            OR get_user_role() IN ('admin', 'director')
        )
    )
    WITH CHECK (
        school_id = get_user_school_id()
        AND (
            requested_by = auth.uid()
            OR get_user_role() IN ('admin', 'director')
        )
    );

DROP POLICY IF EXISTS "Staff can delete report jobs" ON report_jobs;
CREATE POLICY "Staff can delete report jobs"
    ON report_jobs FOR DELETE
    USING (
        school_id = get_user_school_id()
        AND (
            requested_by = auth.uid()
            OR get_user_role() IN ('admin', 'director')
        )
    );
