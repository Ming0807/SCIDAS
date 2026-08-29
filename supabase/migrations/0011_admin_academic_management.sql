-- Migration 0011: Admin Academic Management Security and Invariant Triggers

-- 1. Function & trigger to maintain single-current academic year per school
CREATE OR REPLACE FUNCTION public.maintain_single_current_academic_year()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF NEW.is_current = true THEN
        UPDATE academic_years
        SET is_current = false
        WHERE school_id = NEW.school_id
          AND id <> NEW.id
          AND is_current = true;
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_maintain_single_current_academic_year ON academic_years;
CREATE TRIGGER trg_maintain_single_current_academic_year
    BEFORE INSERT OR UPDATE OF is_current ON academic_years
    FOR EACH ROW
    WHEN (NEW.is_current = true)
    EXECUTE FUNCTION maintain_single_current_academic_year();

-- 2. Function & trigger to maintain single-current semester per school
CREATE OR REPLACE FUNCTION public.maintain_single_current_semester()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_school_id uuid;
BEGIN
    -- Resolve school_id from academic_years if not explicitly set
    IF NEW.school_id IS NULL OR NEW.school_id = '00000000-0000-0000-0000-000000000000'::uuid THEN
        SELECT school_id INTO v_school_id
        FROM academic_years
        WHERE id = NEW.academic_year_id;
        NEW.school_id := v_school_id;
    END IF;

    IF NEW.is_current = true THEN
        -- Set all other semesters in this school to is_current = false
        UPDATE semesters
        SET is_current = false
        WHERE school_id = NEW.school_id
          AND id <> NEW.id
          AND is_current = true;

        -- Also ensure the parent academic year is set to is_current = true
        UPDATE academic_years
        SET is_current = true
        WHERE id = NEW.academic_year_id;
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_maintain_single_current_semester ON semesters;
CREATE TRIGGER trg_maintain_single_current_semester
    BEFORE INSERT OR UPDATE OF is_current, academic_year_id ON semesters
    FOR EACH ROW
    EXECUTE FUNCTION maintain_single_current_semester();

-- 3. Validation triggers for teacher assignments and school tenancy
CREATE OR REPLACE FUNCTION public.validate_classroom_teacher()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF NEW.homeroom_teacher_id IS NOT NULL THEN
        IF NOT EXISTS (
            SELECT 1 FROM profiles
            WHERE id = NEW.homeroom_teacher_id
              AND school_id = NEW.school_id
              AND is_active = true
        ) THEN
            RAISE EXCEPTION 'Homeroom teacher must be an active profile belonging to the same school'
                USING ERRCODE = '23503';
        END IF;
    END IF;

    IF NEW.co_teacher_id IS NOT NULL THEN
        IF NOT EXISTS (
            SELECT 1 FROM profiles
            WHERE id = NEW.co_teacher_id
              AND school_id = NEW.school_id
              AND is_active = true
        ) THEN
            RAISE EXCEPTION 'Co-teacher must be an active profile belonging to the same school'
                USING ERRCODE = '23503';
        END IF;
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_validate_classroom_teacher ON classrooms;
CREATE TRIGGER trg_validate_classroom_teacher
    BEFORE INSERT OR UPDATE OF homeroom_teacher_id, co_teacher_id, school_id ON classrooms
    FOR EACH ROW
    EXECUTE FUNCTION validate_classroom_teacher();

CREATE OR REPLACE FUNCTION public.validate_classroom_subject_assignment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_classroom_school_id uuid;
    v_subject_school_id uuid;
BEGIN
    SELECT school_id INTO v_classroom_school_id FROM classrooms WHERE id = NEW.classroom_id;
    SELECT school_id INTO v_subject_school_id FROM subjects WHERE id = NEW.subject_id;

    IF v_classroom_school_id IS NULL OR v_subject_school_id IS NULL THEN
        RAISE EXCEPTION 'Classroom or Subject does not exist' USING ERRCODE = '23503';
    END IF;

    IF v_classroom_school_id <> v_subject_school_id THEN
        RAISE EXCEPTION 'Classroom and Subject must belong to the same school' USING ERRCODE = '23514';
    END IF;

    NEW.school_id := v_classroom_school_id;

    IF NEW.teacher_id IS NOT NULL THEN
        IF NOT EXISTS (
            SELECT 1 FROM profiles
            WHERE id = NEW.teacher_id
              AND school_id = NEW.school_id
              AND is_active = true
        ) THEN
            RAISE EXCEPTION 'Assigned teacher must be an active staff profile in the same school'
                USING ERRCODE = '23503';
        END IF;
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_validate_classroom_subject_assignment ON classroom_subjects;
CREATE TRIGGER trg_validate_classroom_subject_assignment
    BEFORE INSERT OR UPDATE ON classroom_subjects
    FOR EACH ROW
    EXECUTE FUNCTION validate_classroom_subject_assignment();

-- 4. Strengthen RLS policies for academic management
-- academic_years
DROP POLICY IF EXISTS "Admin can manage academic years" ON academic_years;
DROP POLICY IF EXISTS "Leadership can manage academic years" ON academic_years;
CREATE POLICY "Leadership can manage academic years"
    ON academic_years FOR ALL
    USING (
        school_id = get_user_school_id()
        AND get_user_role() IN ('admin', 'director')
    )
    WITH CHECK (
        school_id = get_user_school_id()
        AND get_user_role() IN ('admin', 'director')
    );

-- semesters
DROP POLICY IF EXISTS "Admin can manage semesters" ON semesters;
DROP POLICY IF EXISTS "Leadership can manage semesters" ON semesters;
CREATE POLICY "Leadership can manage semesters"
    ON semesters FOR ALL
    USING (
        school_id = get_user_school_id()
        AND get_user_role() IN ('admin', 'director')
    )
    WITH CHECK (
        school_id = get_user_school_id()
        AND get_user_role() IN ('admin', 'director')
    );

-- classrooms
DROP POLICY IF EXISTS "Admin can manage classrooms" ON classrooms;
DROP POLICY IF EXISTS "Leadership can manage classrooms" ON classrooms;
CREATE POLICY "Leadership can manage classrooms"
    ON classrooms FOR ALL
    USING (
        school_id = get_user_school_id()
        AND get_user_role() IN ('admin', 'director')
    )
    WITH CHECK (
        school_id = get_user_school_id()
        AND get_user_role() IN ('admin', 'director')
    );

-- subjects
DROP POLICY IF EXISTS "Admin can manage subjects" ON subjects;
DROP POLICY IF EXISTS "Leadership can manage subjects" ON subjects;
CREATE POLICY "Leadership can manage subjects"
    ON subjects FOR ALL
    USING (
        school_id = get_user_school_id()
        AND get_user_role() IN ('admin', 'director')
    )
    WITH CHECK (
        school_id = get_user_school_id()
        AND get_user_role() IN ('admin', 'director')
    );

-- classroom_subjects
DROP POLICY IF EXISTS "Admin can manage classroom subjects" ON classroom_subjects;
DROP POLICY IF EXISTS "Leadership can manage classroom subjects" ON classroom_subjects;
CREATE POLICY "Leadership can manage classroom subjects"
    ON classroom_subjects FOR ALL
    USING (
        school_id = get_user_school_id()
        AND get_user_role() IN ('admin', 'director')
    )
    WITH CHECK (
        school_id = get_user_school_id()
        AND get_user_role() IN ('admin', 'director')
    );
