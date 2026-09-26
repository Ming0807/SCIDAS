-- ===================================================================
-- MIGRATION 0022: Student profile photos (FR-02-07)
--
-- The student-photos bucket (created private in 0005) becomes public-read
-- so photo_url can hold a plain public URL rendered directly by <img>.
-- Uploads stay role-gated (admin/homeroom/counselor); deletes previously
-- had no policy at all, so photo replacement/removal gets one now.
-- URLs use unguessable uuid object names; listings remain key-gated.
-- ===================================================================

UPDATE storage.buckets SET public = true WHERE id = 'student-photos';

DROP POLICY IF EXISTS "Staff can delete student photos" ON storage.objects;
CREATE POLICY "Staff can delete student photos"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'student-photos'
        AND auth.role() = 'authenticated'
        AND get_user_role() IN ('admin', 'homeroom_teacher', 'counselor')
    );
