-- ===================================================================
-- MIGRATION 0023: Parent Portal access (Phase 2)
--
-- Links guardian rows to auth users so parents can sign in and view
-- their own children's read-only data through RLS (no service key).
-- Staff flows are untouched: existing role allow-lists exclude 'parent'.
-- ===================================================================

-- 1. New role value (additive; existing 5 members unchanged).
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'parent';

-- 2. Guardian <-> auth user link.
ALTER TABLE guardians
    ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_guardians_user_id ON guardians (user_id);
CREATE UNIQUE INDEX IF NOT EXISTS uq_guardians_user_id ON guardians (user_id) WHERE user_id IS NOT NULL;

-- 3. Parents see their linked students through the shared access helper.
CREATE OR REPLACE FUNCTION can_access_student(p_student_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_role user_role;
    v_school_id uuid;
BEGIN
    SELECT role, school_id INTO v_role, v_school_id
    FROM profiles WHERE id = auth.uid();

    -- Admin, Director, Counselor เห็นนักเรียนทั้งหมดในโรงเรียน
    IF v_role IN ('admin', 'director', 'counselor') THEN
        RETURN EXISTS (
            SELECT 1 FROM students
            WHERE id = p_student_id AND school_id = v_school_id
        );
    END IF;

    -- Parent เห็นเฉพาะนักเรียนที่ผูกกับบัญชีผู้ปกครองของตน
    IF v_role = 'parent' THEN
        RETURN EXISTS (
            SELECT 1
            FROM student_guardians sg
            JOIN guardians g ON g.id = sg.guardian_id
            WHERE sg.student_id = p_student_id
              AND g.user_id = auth.uid()
              AND g.school_id = v_school_id
        );
    END IF;

    -- Homeroom Teacher เห็นเฉพาะนักเรียนในชั้นเรียน
    IF v_role = 'homeroom_teacher' THEN
        RETURN is_homeroom_teacher_of_student(p_student_id);
    END IF;

    -- Subject Teacher เห็นเฉพาะนักเรียนที่ตนสอน
    IF v_role = 'subject_teacher' THEN
        RETURN is_subject_teacher_of_student(p_student_id);
    END IF;

    RETURN false;
END;
$$;

-- 4. Parents read their own guardian row; writes stay staff-only.
DROP POLICY IF EXISTS "Parents can view own guardian row" ON guardians;
CREATE POLICY "Parents can view own guardian row"
    ON guardians FOR SELECT
    USING (user_id = auth.uid());

-- 5. Parents read their own profile like everyone else in the school.
-- (Covered by "Users can view profiles in same school" + "Users can update
-- own profile"; no change needed. Stated here for audit clarity.)
