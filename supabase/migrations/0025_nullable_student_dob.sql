-- Migration 0013: Allow Nullable Date of Birth & Smart Duplicate Handling in Atomic Import

-- 1. Relax NOT NULL constraint on students.date_of_birth
ALTER TABLE public.students ALTER COLUMN date_of_birth DROP NOT NULL;

-- 2. Drop old functions to avoid signature conflicts
DROP FUNCTION IF EXISTS public.import_students_atomic(uuid, uuid, jsonb);
DROP FUNCTION IF EXISTS public.import_students_atomic(uuid, uuid, jsonb, text);

-- 3. Update import_students_atomic RPC with p_duplicate_mode ('skip' | 'enroll_existing' | 'error')
CREATE OR REPLACE FUNCTION public.import_students_atomic(
    p_classroom_id uuid,
    p_semester_id uuid,
    p_students jsonb,
    p_duplicate_mode text DEFAULT 'skip'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_actor_id uuid;
    v_role user_role;
    v_school_id uuid;
    v_classroom_school_id uuid;
    v_semester_school_id uuid;
    v_student_elem jsonb;
    v_student_id uuid;
    v_guardian_id uuid;
    v_student_code varchar(20);
    v_national_id varchar(13);
    v_first_name varchar(100);
    v_last_name varchar(100);
    v_prefix varchar(50);
    v_nickname varchar(50);
    v_gender gender_type;
    v_dob date;
    v_blood_type varchar(5);
    v_address text;
    v_student_number integer;
    v_g_prefix varchar(50);
    v_g_first_name varchar(100);
    v_g_last_name varchar(100);
    v_g_phone varchar(20);
    v_g_relation guardian_relation;
    v_imported_count integer := 0;
    v_skipped_count integer := 0;
    v_enrolled_existing_count integer := 0;
    v_student_ids uuid[] := ARRAY[]::uuid[];
    v_idx integer := 0;
    v_existing_student_id uuid;
BEGIN
    -- 1. Verify caller authentication
    v_actor_id := auth.uid();
    IF v_actor_id IS NULL THEN
        RAISE EXCEPTION 'Authentication required for importing students'
            USING ERRCODE = '42501';
    END IF;

    -- 2. Resolve caller profile and tenant
    SELECT role, school_id INTO v_role, v_school_id
    FROM profiles
    WHERE id = v_actor_id AND is_active = true;

    IF v_role IS NULL OR v_school_id IS NULL THEN
        RAISE EXCEPTION 'Active profile in a valid school is required'
            USING ERRCODE = '42501';
    END IF;

    -- 3. Verify classroom and semester belong to actor's school
    SELECT school_id INTO v_classroom_school_id FROM classrooms WHERE id = p_classroom_id;
    SELECT school_id INTO v_semester_school_id FROM semesters WHERE id = p_semester_id;

    IF v_classroom_school_id IS NULL OR v_classroom_school_id <> v_school_id THEN
        RAISE EXCEPTION 'Target classroom does not belong to your school'
            USING ERRCODE = '23503';
    END IF;

    IF v_semester_school_id IS NULL OR v_semester_school_id <> v_school_id THEN
        RAISE EXCEPTION 'Target semester does not belong to your school'
            USING ERRCODE = '23503';
    END IF;

    -- 4. Check permissions
    IF v_role IN ('admin', 'director') THEN
        NULL;
    ELSIF v_role = 'homeroom_teacher' THEN
        IF NOT is_homeroom_teacher_of_classroom(p_classroom_id) THEN
            RAISE EXCEPTION 'Teachers can only import students into their assigned classroom'
                USING ERRCODE = '42501';
        END IF;
    ELSE
        RAISE EXCEPTION 'Role % is not authorized to import students', v_role
            USING ERRCODE = '42501';
    END IF;

    -- 5. Validate batch size
    IF jsonb_typeof(p_students) <> 'array' OR jsonb_array_length(p_students) = 0 THEN
        RAISE EXCEPTION 'Student data must be a non-empty JSON array'
            USING ERRCODE = '22023';
    END IF;

    IF jsonb_array_length(p_students) > 500 THEN
        RAISE EXCEPTION 'Batch size exceeds maximum limit of 500 students per import'
            USING ERRCODE = '22023';
    END IF;

    -- 6. Process each student row atomically
    FOR v_student_elem IN SELECT * FROM jsonb_array_elements(p_students)
    LOOP
        v_idx := v_idx + 1;
        v_student_code := NULLIF(btrim(v_student_elem->>'student_code'), '');
        v_national_id := NULLIF(btrim(v_student_elem->>'national_id'), '');
        v_first_name := NULLIF(btrim(v_student_elem->>'first_name'), '');
        v_last_name := NULLIF(btrim(v_student_elem->>'last_name'), '');
        v_prefix := NULLIF(btrim(v_student_elem->>'prefix'), '');
        v_nickname := NULLIF(btrim(v_student_elem->>'nickname'), '');
        v_blood_type := NULLIF(btrim(v_student_elem->>'blood_type'), '');
        v_address := NULLIF(btrim(v_student_elem->>'address'), '');

        -- Required fields check
        IF v_student_code IS NULL THEN
            RAISE EXCEPTION 'Row %: Student code (รหัสนักเรียน) is required', v_idx USING ERRCODE = '23502';
        END IF;
        IF v_first_name IS NULL OR v_last_name IS NULL THEN
            RAISE EXCEPTION 'Row % (%): First name and last name are required', v_idx, v_student_code USING ERRCODE = '23502';
        END IF;

        -- Validate Gender enum
        BEGIN
            v_gender := (v_student_elem->>'gender')::gender_type;
        EXCEPTION WHEN OTHERS THEN
            RAISE EXCEPTION 'Row % (%): Invalid gender. Must be male, female, or other', v_idx, v_student_code USING ERRCODE = '22023';
        END;

        -- Validate Date of Birth (Optional)
        IF v_student_elem->>'date_of_birth' IS NOT NULL AND btrim(v_student_elem->>'date_of_birth') <> '' THEN
            BEGIN
                v_dob := (v_student_elem->>'date_of_birth')::date;
            EXCEPTION WHEN OTHERS THEN
                RAISE EXCEPTION 'Row % (%): Invalid date of birth format (YYYY-MM-DD)', v_idx, v_student_code USING ERRCODE = '22023';
            END;
        ELSE
            v_dob := NULL;
        END IF;

        -- Validate National ID format if present (must be 13 digits)
        IF v_national_id IS NOT NULL AND v_national_id !~ '^[0-9]{13}$' THEN
            RAISE EXCEPTION 'Row % (%): National ID must be exactly 13 numeric digits', v_idx, v_student_code USING ERRCODE = '23514';
        END IF;

        -- Student number in class
        IF v_student_elem->>'student_number' IS NOT NULL AND v_student_elem->>'student_number' <> '' THEN
            v_student_number := (v_student_elem->>'student_number')::integer;
        ELSE
            v_student_number := v_idx;
        END IF;

        -- Check duplicate student in school (by student_code or national_id)
        v_existing_student_id := NULL;
        SELECT id INTO v_existing_student_id
        FROM students
        WHERE school_id = v_school_id
          AND (
              student_code = v_student_code
              OR (v_national_id IS NOT NULL AND national_id = v_national_id)
          )
        LIMIT 1;

        IF v_existing_student_id IS NOT NULL THEN
            IF p_duplicate_mode = 'error' THEN
                RAISE EXCEPTION 'Row %: Student code % or National ID already exists in this school', v_idx, v_student_code
                    USING ERRCODE = '23505';
            ELSIF p_duplicate_mode = 'enroll_existing' THEN
                -- Check if already enrolled in this classroom & semester
                IF NOT EXISTS (
                    SELECT 1 FROM classroom_students
                    WHERE classroom_id = p_classroom_id
                      AND semester_id = p_semester_id
                      AND student_id = v_existing_student_id
                      AND is_active = true
                ) THEN
                    INSERT INTO classroom_students (
                        school_id,
                        classroom_id,
                        student_id,
                        semester_id,
                        student_number,
                        enrolled_at,
                        is_active
                    ) VALUES (
                        v_school_id,
                        p_classroom_id,
                        v_existing_student_id,
                        p_semester_id,
                        v_student_number,
                        CURRENT_DATE,
                        true
                    );
                    v_enrolled_existing_count := v_enrolled_existing_count + 1;
                    v_student_ids := array_append(v_student_ids, v_existing_student_id);
                ELSE
                    v_skipped_count := v_skipped_count + 1;
                END IF;
                CONTINUE;
            ELSE -- 'skip'
                v_skipped_count := v_skipped_count + 1;
                CONTINUE;
            END IF;
        END IF;

        -- Insert Student
        INSERT INTO students (
            school_id,
            student_code,
            national_id,
            prefix,
            first_name,
            last_name,
            nickname,
            gender,
            date_of_birth,
            blood_type,
            address,
            status,
            enrollment_date
        ) VALUES (
            v_school_id,
            v_student_code,
            v_national_id,
            v_prefix,
            v_first_name,
            v_last_name,
            v_nickname,
            v_gender,
            v_dob,
            v_blood_type,
            v_address,
            'active',
            CURRENT_DATE
        )
        RETURNING id INTO v_student_id;

        -- Optional Guardian insert
        v_g_first_name := NULLIF(btrim(v_student_elem->>'guardian_first_name'), '');
        v_g_last_name := NULLIF(btrim(v_student_elem->>'guardian_last_name'), '');
        v_g_prefix := NULLIF(btrim(v_student_elem->>'guardian_prefix'), '');
        v_g_phone := NULLIF(btrim(v_student_elem->>'guardian_phone'), '');

        IF v_g_first_name IS NOT NULL THEN
            BEGIN
                v_g_relation := COALESCE(NULLIF(v_student_elem->>'guardian_relation', '')::guardian_relation, 'guardian'::guardian_relation);
            EXCEPTION WHEN OTHERS THEN
                v_g_relation := 'guardian'::guardian_relation;
            END;

            INSERT INTO guardians (
                school_id,
                prefix,
                first_name,
                last_name,
                phone
            ) VALUES (
                v_school_id,
                v_g_prefix,
                v_g_first_name,
                COALESCE(v_g_last_name, '-'),
                v_g_phone
            )
            RETURNING id INTO v_guardian_id;

            INSERT INTO student_guardians (
                school_id,
                student_id,
                guardian_id,
                relation,
                is_primary,
                can_pickup
            ) VALUES (
                v_school_id,
                v_student_id,
                v_guardian_id,
                v_g_relation,
                true,
                true
            );
        END IF;

        -- Insert Classroom Student Enrollment
        INSERT INTO classroom_students (
            school_id,
            classroom_id,
            student_id,
            semester_id,
            student_number,
            enrolled_at,
            is_active
        ) VALUES (
            v_school_id,
            p_classroom_id,
            v_student_id,
            p_semester_id,
            v_student_number,
            CURRENT_DATE,
            true
        );

        v_student_ids := array_append(v_student_ids, v_student_id);
        v_imported_count := v_imported_count + 1;
    END LOOP;

    -- Audit log
    INSERT INTO audit_logs (
        school_id,
        user_id,
        action,
        table_name,
        record_id,
        new_data
    ) VALUES (
        v_school_id,
        v_actor_id,
        'IMPORT',
        'students',
        p_classroom_id,
        jsonb_build_object(
            'classroom_id', p_classroom_id,
            'semester_id', p_semester_id,
            'imported_count', v_imported_count,
            'skipped_count', v_skipped_count,
            'enrolled_existing_count', v_enrolled_existing_count,
            'duplicate_mode', p_duplicate_mode
        )
    );

    RETURN jsonb_build_object(
        'success', true,
        'imported_count', v_imported_count,
        'skipped_count', v_skipped_count,
        'enrolled_existing_count', v_enrolled_existing_count,
        'student_ids', to_jsonb(v_student_ids)
    );
END;
$$;

-- Backward-compatible 3-argument signature
CREATE OR REPLACE FUNCTION public.import_students_atomic(
    p_classroom_id uuid,
    p_semester_id uuid,
    p_students jsonb
)
RETURNS jsonb
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT public.import_students_atomic(p_classroom_id, p_semester_id, p_students, 'skip');
$$;

REVOKE ALL ON FUNCTION public.import_students_atomic(uuid, uuid, jsonb, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.import_students_atomic(uuid, uuid, jsonb, text) TO authenticated;

REVOKE ALL ON FUNCTION public.import_students_atomic(uuid, uuid, jsonb) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.import_students_atomic(uuid, uuid, jsonb) TO authenticated;
