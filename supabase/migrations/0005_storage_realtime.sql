-- ===================================================================
-- STORAGE BUCKETS
-- ===================================================================

-- Bucket สำหรับรูปโปรไฟล์
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true);

-- Bucket สำหรับรูปนักเรียน
INSERT INTO storage.buckets (id, name, public)
VALUES ('student-photos', 'student-photos', false);

-- Bucket สำหรับรูปภาพเยี่ยมบ้าน
INSERT INTO storage.buckets (id, name, public)
VALUES ('home-visit-images', 'home-visit-images', false);

-- Bucket สำหรับโลโก้โรงเรียน
INSERT INTO storage.buckets (id, name, public)
VALUES ('school-assets', 'school-assets', true);

-- Bucket สำหรับเอกสารอื่นๆ
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', false);


-- ==================== avatars ====================
CREATE POLICY "Avatar images are publicly accessible"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload own avatar"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'avatars'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

CREATE POLICY "Users can update own avatar"
    ON storage.objects FOR UPDATE
    USING (
        bucket_id = 'avatars'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

-- ==================== student-photos ====================
CREATE POLICY "Authenticated users can view student photos"
    ON storage.objects FOR SELECT
    USING (
        bucket_id = 'student-photos'
        AND auth.role() = 'authenticated'
    );

CREATE POLICY "Staff can upload student photos"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'student-photos'
        AND get_user_role() IN ('admin', 'homeroom_teacher', 'counselor')
    );

-- ==================== home-visit-images ====================
CREATE POLICY "Staff can view home visit images"
    ON storage.objects FOR SELECT
    USING (
        bucket_id = 'home-visit-images'
        AND auth.role() = 'authenticated'
    );

CREATE POLICY "Teachers can upload home visit images"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'home-visit-images'
        AND get_user_role() IN ('admin', 'homeroom_teacher', 'counselor')
    );
