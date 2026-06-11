-- ===================================================================
-- IDENTITY AND STUDENT EVIDENCE HARDENING
-- ===================================================================

-- Keep new OAuth signups resilient without rewriting the historical
-- function migration that may already be applied in shared environments.
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_school_id uuid;
    v_school_id_text text;
    v_role user_role := 'subject_teacher';
    v_role_text text;
    v_full_name text;
    v_first_name text;
    v_last_name text;
    v_avatar_url text;
BEGIN
    v_school_id_text := NULLIF(btrim(COALESCE(NEW.raw_user_meta_data->>'school_id', '')), '');

    IF v_school_id_text ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' THEN
        SELECT id INTO v_school_id
        FROM schools
        WHERE id = v_school_id_text::uuid
          AND is_active = true;
    END IF;

    IF v_school_id IS NULL THEN
        SELECT id INTO v_school_id
        FROM schools
        WHERE is_active = true
        ORDER BY created_at ASC
        LIMIT 1;
    END IF;

    IF v_school_id IS NULL THEN
        RAISE EXCEPTION 'Cannot create profile for %, no active school exists', NEW.id;
    END IF;

    v_role_text := NULLIF(btrim(COALESCE(NEW.raw_user_meta_data->>'role', '')), '');
    v_role := CASE
        WHEN v_role_text IN ('admin', 'director', 'homeroom_teacher', 'counselor', 'subject_teacher')
            THEN v_role_text::user_role
        WHEN v_role_text IN ('teacher', 'staff')
            THEN 'subject_teacher'::user_role
        WHEN v_role_text = 'homeroom'
            THEN 'homeroom_teacher'::user_role
        ELSE 'subject_teacher'::user_role
    END;

    v_full_name := NULLIF(btrim(COALESCE(
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'name',
        ''
    )), '');
    v_first_name := NULLIF(btrim(COALESCE(NEW.raw_user_meta_data->>'first_name', '')), '');
    v_last_name := NULLIF(btrim(COALESCE(NEW.raw_user_meta_data->>'last_name', '')), '');
    v_avatar_url := NULLIF(btrim(COALESCE(
        NEW.raw_user_meta_data->>'avatar_url',
        NEW.raw_user_meta_data->>'picture',
        ''
    )), '');

    IF v_first_name IS NULL AND v_full_name IS NOT NULL THEN
        v_first_name := NULLIF(split_part(v_full_name, ' ', 1), '');
    END IF;

    IF v_last_name IS NULL AND v_full_name IS NOT NULL AND position(' ' in v_full_name) > 0 THEN
        v_last_name := NULLIF(btrim(substr(v_full_name, position(' ' in v_full_name) + 1)), '');
    END IF;

    v_first_name := COALESCE(
        v_first_name,
        NULLIF(split_part(COALESCE(NEW.email, ''), '@', 1), ''),
        'User'
    );
    v_last_name := COALESCE(v_last_name, '-');

    INSERT INTO public.profiles (
        id,
        school_id,
        role,
        first_name,
        last_name,
        email,
        avatar_url
    ) VALUES (
        NEW.id,
        v_school_id,
        v_role,
        v_first_name,
        v_last_name,
        NEW.email,
        v_avatar_url
    )
    ON CONFLICT (id) DO UPDATE SET
        school_id = EXCLUDED.school_id,
        role = EXCLUDED.role,
        first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name,
        email = EXCLUDED.email,
        avatar_url = COALESCE(EXCLUDED.avatar_url, profiles.avatar_url),
        updated_at = now();

    RETURN NEW;
END;
$$;

-- Tighten table-level attachment policies into explicit read/write paths.
DROP POLICY IF EXISTS "View student attachments by access" ON student_attachments;
DROP POLICY IF EXISTS "Manage student attachments by staff" ON student_attachments;
DROP POLICY IF EXISTS "Insert student attachments by staff" ON student_attachments;
DROP POLICY IF EXISTS "Update own or care student attachments" ON student_attachments;
DROP POLICY IF EXISTS "Delete own or care student attachments" ON student_attachments;

CREATE POLICY "View student attachments by access"
    ON student_attachments FOR SELECT
    USING (
        can_access_student(student_id)
        AND (
            is_private = false
            OR uploaded_by = auth.uid()
            OR get_user_role() IN ('admin', 'director', 'homeroom_teacher', 'counselor')
        )
    );

CREATE POLICY "Insert student attachments by staff"
    ON student_attachments FOR INSERT
    WITH CHECK (
        can_access_student(student_id)
        AND uploaded_by = auth.uid()
        AND get_user_role() IN ('admin', 'homeroom_teacher', 'subject_teacher', 'counselor')
    );

CREATE POLICY "Update own or care student attachments"
    ON student_attachments FOR UPDATE
    USING (
        can_access_student(student_id)
        AND (
            uploaded_by = auth.uid()
            OR get_user_role() IN ('admin', 'homeroom_teacher', 'counselor')
        )
    )
    WITH CHECK (
        can_access_student(student_id)
        AND (
            uploaded_by = auth.uid()
            OR get_user_role() IN ('admin', 'homeroom_teacher', 'counselor')
        )
    );

CREATE POLICY "Delete own or care student attachments"
    ON student_attachments FOR DELETE
    USING (
        can_access_student(student_id)
        AND (
            uploaded_by = auth.uid()
            OR get_user_role() IN ('admin', 'homeroom_teacher', 'counselor')
        )
    );

-- Add storage policies for the private documents bucket path used by
-- student_attachments. Paths must be:
-- student-attachments/<student_id>/<generated-file-name>
DROP POLICY IF EXISTS "Staff can upload student attachment documents" ON storage.objects;
DROP POLICY IF EXISTS "View student attachment documents by access" ON storage.objects;
DROP POLICY IF EXISTS "Update own student attachment documents" ON storage.objects;
DROP POLICY IF EXISTS "Delete own student attachment documents" ON storage.objects;

CREATE POLICY "Staff can upload student attachment documents"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'documents'
        AND auth.role() = 'authenticated'
        AND get_user_role() IN ('admin', 'homeroom_teacher', 'subject_teacher', 'counselor')
        AND CASE
            WHEN array_length(storage.foldername(name), 1) >= 2
                 AND (storage.foldername(name))[1] = 'student-attachments'
                 AND (storage.foldername(name))[2] ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
            THEN can_access_student(((storage.foldername(name))[2])::uuid)
            ELSE false
        END
    );

CREATE POLICY "View student attachment documents by access"
    ON storage.objects FOR SELECT
    USING (
        bucket_id = 'documents'
        AND EXISTS (
            SELECT 1
            FROM student_attachments sa
            WHERE sa.bucket = storage.objects.bucket_id
              AND sa.storage_path = storage.objects.name
              AND can_access_student(sa.student_id)
              AND (
                  sa.is_private = false
                  OR sa.uploaded_by = auth.uid()
                  OR get_user_role() IN ('admin', 'director', 'homeroom_teacher', 'counselor')
              )
        )
    );

CREATE POLICY "Update own student attachment documents"
    ON storage.objects FOR UPDATE
    USING (
        bucket_id = 'documents'
        AND EXISTS (
            SELECT 1
            FROM student_attachments sa
            WHERE sa.bucket = storage.objects.bucket_id
              AND sa.storage_path = storage.objects.name
              AND can_access_student(sa.student_id)
              AND (
                  sa.uploaded_by = auth.uid()
                  OR get_user_role() IN ('admin', 'homeroom_teacher', 'counselor')
              )
        )
    )
    WITH CHECK (
        bucket_id = 'documents'
        AND CASE
            WHEN array_length(storage.foldername(name), 1) >= 2
                 AND (storage.foldername(name))[1] = 'student-attachments'
                 AND (storage.foldername(name))[2] ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
            THEN can_access_student(((storage.foldername(name))[2])::uuid)
            ELSE false
        END
    );

CREATE POLICY "Delete own student attachment documents"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'documents'
        AND EXISTS (
            SELECT 1
            FROM student_attachments sa
            WHERE sa.bucket = storage.objects.bucket_id
              AND sa.storage_path = storage.objects.name
              AND can_access_student(sa.student_id)
              AND (
                  sa.uploaded_by = auth.uid()
                  OR get_user_role() IN ('admin', 'homeroom_teacher', 'counselor')
              )
        )
    );
