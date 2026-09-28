-- ===================================================================
-- MIGRATION 0029: T1 tenant isolation — home-visit-images + student-photos (SELECT)
--
-- รูรั่ว T1 (lead pen-test 2026-09-28 บน local DB): SELECT policy ของ 2 bucket นี้
-- คือ `auth.role() = 'authenticated'` อย่างเดียว — ครูโรงเรียน B อ่านรูป
-- โรงเรียน A ได้ เปลี่ยนเป็น school-scoped ตาม GOOD patterns:
-- `documents` (join ตาราง + can_access_student) และ `reports` (folder = school)
--
-- กติกา path ที่บังคับต่อจากนี้:
--   home-visit-images/<home_visit_id>/...  (folder แรก = visit UUID)
--   student-photos/<student_id>/...        (folder แรก = student UUID,
--                                           ตรงกับ student-photo.actions.ts)
-- INSERT/UPDATE/DELETE ไม่แตะ (คงเดิมทั้งหมด)
-- ===================================================================

-- ==================== home-visit-images (SELECT) ====================
DROP POLICY IF EXISTS "Staff can view home visit images" ON storage.objects;
DROP POLICY IF EXISTS "School staff can view home visit images by access" ON storage.objects;
CREATE POLICY "School staff can view home visit images by access"
    ON storage.objects FOR SELECT
    USING (
        bucket_id = 'home-visit-images'
        AND auth.role() = 'authenticated'
        AND get_user_role() IN ('admin', 'director', 'homeroom_teacher', 'counselor')
        AND (
            -- ทางหลัก: folder แรกของ path คือ home_visit_id ของโรงเรียนตัวเอง
            -- และผู้อ่านเข้าถึงนักเรียนเจ้าของ visit ได้ (role เซ็ตเดียวกับ home_visits)
            CASE
                WHEN array_length(storage.foldername(name), 1) >= 1
                     AND (storage.foldername(name))[1] ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
                THEN EXISTS (
                    SELECT 1
                    FROM home_visits hv
                    WHERE hv.id = ((storage.foldername(name))[1])::uuid
                      AND hv.school_id = get_user_school_id()
                      AND can_access_student(hv.student_id)
                )
                ELSE false
            END
            -- ทางรอง (แถวเดิม): home_visit_images.image_url อ้างถึง object นี้
            -- (image_url เก็บ full URL จึง match แบบ suffix ให้ตรง segment)
            -- + visit อยู่ในโรงเรียนตัวเอง และผู้อ่านเข้าถึงนักเรียนได้
            OR EXISTS (
                SELECT 1
                FROM home_visit_images hvi
                JOIN home_visits hv ON hv.id = hvi.home_visit_id
                WHERE (
                        hvi.image_url = storage.objects.name
                        OR RIGHT(hvi.image_url, char_length(storage.objects.name) + 1) = '/' || storage.objects.name
                      )
                  AND hv.school_id = get_user_school_id()
                  AND can_access_student(hv.student_id)
            )
        )
    );

-- ==================== student-photos (SELECT) ====================
DROP POLICY IF EXISTS "Authenticated users can view student photos" ON storage.objects;
DROP POLICY IF EXISTS "School staff can view student photos by access" ON storage.objects;
CREATE POLICY "School staff can view student photos by access"
    ON storage.objects FOR SELECT
    USING (
        bucket_id = 'student-photos'
        AND auth.role() = 'authenticated'
        AND CASE
            WHEN array_length(storage.foldername(name), 1) >= 1
                 AND (storage.foldername(name))[1] ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
            THEN EXISTS (
                SELECT 1
                FROM students s
                WHERE s.id = ((storage.foldername(name))[1])::uuid
                  AND s.school_id = get_user_school_id()
                  AND can_access_student(s.id)
            )
            ELSE false
        END
    );
