-- ===================================================================
-- MIGRATION 0021: Relax attachment path UUID validation (upload RLS fix)
--
-- Root cause: the documents-bucket storage policies (0009) validated the
-- <student_id> folder with a UUID v1-v5-only pattern
-- ([1-5]...[89ab]...). Demo/seed and legacy rows use synthetic UUIDs
-- such as c4000000-0000-0000-0000-000000000004, which fail that pattern,
-- so EVERY upload for those students failed with
-- "new row violates row-level security policy" even for admins.
-- Reads were unaffected (the SELECT policy joins via the table).
--
-- Fix: accept any 8-4-4-4-12 hex UUID shape in the path check. Structure
-- (student-attachments/<uuid>/...) is still enforced, and
-- can_access_student() still enforces school/role scoping.
-- ===================================================================

DROP POLICY IF EXISTS "Staff can upload student attachment documents" ON storage.objects;
CREATE POLICY "Staff can upload student attachment documents"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'documents'
        AND auth.role() = 'authenticated'
        AND get_user_role() IN ('admin', 'homeroom_teacher', 'subject_teacher', 'counselor')
        AND CASE
            WHEN array_length(storage.foldername(name), 1) >= 2
                 AND (storage.foldername(name))[1] = 'student-attachments'
                 AND (storage.foldername(name))[2] ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
            THEN can_access_student(((storage.foldername(name))[2])::uuid)
            ELSE false
        END
    );

DROP POLICY IF EXISTS "Update own student attachment documents" ON storage.objects;
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
                 AND (storage.foldername(name))[2] ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
            THEN can_access_student(((storage.foldername(name))[2])::uuid)
            ELSE false
        END
    );
