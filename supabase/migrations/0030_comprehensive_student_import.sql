-- ===================================================================
-- MIGRATION 0030: Comprehensive Student Import & Sync
--
-- Enhances import_students_atomic RPC to store full DMC attributes:
-- address components (subdistrict, district, province, postal_code),
-- distance_to_school_km, travel_method, family_status, religion,
-- nationality, ethnicity, and guardian profile details (national_id,
-- occupation, monthly_income).
-- Also syncs/updates existing students when re-imported.
-- ===================================================================

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
    v_subdistrict varchar(100);
    v_district varchar(100);
    v_province varchar(100);
    v_postal_code varchar(5);
    v_distance_to_school_km decimal(6,2);
    v_travel_method varchar(100);
    v_nationality varchar(50);
    v_ethnicity varchar(50);
    v_religion varchar(50);
    v_family_status text;
    v_student_number integer;
    v_g_prefix varchar(50);
    v_g_first_name varchar(100);
    v_g_last_name varchar(100);
    v_g_phone varchar(20);
    v_g_national_id varchar(13);
    v_g_occupation varchar(100);
    v_g_income decimal(10,2);
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
        v_subdistrict := NULLIF(btrim(v_student_elem->>'subdistrict'), '');
        v_district := NULLIF(btrim(v_student_elem->>'district'), '');
        v_province := NULLIF(btrim(v_student_elem->>'province'), '');
        v_postal_code := NULLIF(btrim(v_student_elem->>'postal_code'), '');
        v_travel_method := NULLIF(btrim(v_student_elem->>'travel_method'), '');
        v_nationality := COALESCE(NULLIF(btrim(v_student_elem->>'nationality'), ''), 'ไทย');
        v_ethnicity := COALESCE(NULLIF(btrim(v_student_elem->>'ethnicity'), ''), 'ไทย');
        v_religion := COALESCE(NULLIF(btrim(v_student_elem->>'religion'), ''), 'พุทธ');

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

        -- Distance to school (decimal)
        IF v_student_elem->>'distance_to_school_km' IS NOT NULL AND btrim(v_student_elem->>'distance_to_school_km') <> '' THEN
            BEGIN
                v_distance_to_school_km := (v_student_elem->>'distance_to_school_km')::decimal(6,2);
            EXCEPTION WHEN OTHERS THEN
                v_distance_to_school_km := NULL;
            END;
        ELSE
            v_distance_to_school_km := NULL;
        END IF;

        -- Family status validation
        v_family_status := NULLIF(btrim(v_student_elem->>'family_status'), '');
        IF v_family_status IS NOT NULL AND v_family_status NOT IN ('together', 'separated', 'single_parent', 'orphan', 'guardian', 'other') THEN
            v_family_status := 'other';
        END IF;

        -- Guardian attributes
        v_g_first_name := NULLIF(btrim(v_student_elem->>'guardian_first_name'), '');
        v_g_last_name := NULLIF(btrim(v_student_elem->>'guardian_last_name'), '');
        v_g_prefix := NULLIF(btrim(v_student_elem->>'guardian_prefix'), '');
        v_g_phone := NULLIF(btrim(v_student_elem->>'guardian_phone'), '');
        v_g_national_id := NULLIF(btrim(v_student_elem->>'guardian_national_id'), '');
        IF v_g_national_id IS NOT NULL AND v_g_national_id !~ '^[0-9]{13}$' THEN
            v_g_national_id := NULL;
        END IF;
        v_g_occupation := NULLIF(btrim(v_student_elem->>'guardian_occupation'), '');
        IF v_student_elem->>'guardian_monthly_income' IS NOT NULL AND btrim(v_student_elem->>'guardian_monthly_income') <> '' THEN
            BEGIN
                v_g_income := (v_student_elem->>'guardian_monthly_income')::decimal(10,2);
            EXCEPTION WHEN OTHERS THEN
                v_g_income := NULL;
            END;
        ELSE
            v_g_income := NULL;
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
            -- Always update / sync existing student's address and profile data
            UPDATE students
            SET
                address = COALESCE(v_address, address),
                subdistrict = COALESCE(v_subdistrict, subdistrict),
                district = COALESCE(v_district, district),
                province = COALESCE(v_province, province),
                postal_code = COALESCE(v_postal_code, postal_code),
                distance_to_school_km = COALESCE(v_distance_to_school_km, distance_to_school_km),
                travel_method = COALESCE(v_travel_method, travel_method),
                family_status = COALESCE(v_family_status, family_status),
                religion = COALESCE(v_religion, religion),
                nationality = COALESCE(v_nationality, nationality),
                ethnicity = COALESCE(v_ethnicity, ethnicity),
                blood_type = COALESCE(v_blood_type, blood_type),
                prefix = COALESCE(v_prefix, prefix),
                nickname = COALESCE(v_nickname, nickname),
                date_of_birth = COALESCE(v_dob, date_of_birth),
                updated_at = now()
            WHERE id = v_existing_student_id;

            -- Sync guardian if provided
            IF v_g_first_name IS NOT NULL THEN
                SELECT guardian_id INTO v_guardian_id
                FROM student_guardians
                WHERE student_id = v_existing_student_id AND is_primary = true
                LIMIT 1;

                IF v_guardian_id IS NOT NULL THEN
                    UPDATE guardians
                    SET
                        phone = COALESCE(v_g_phone, phone),
                        occupation = COALESCE(v_g_occupation, occupation),
                        monthly_income = COALESCE(v_g_income, monthly_income),
                        national_id = COALESCE(v_g_national_id, national_id),
                        updated_at = now()
                    WHERE id = v_guardian_id;
                ELSE
                    INSERT INTO guardians (
                        school_id, prefix, first_name, last_name, phone, national_id, occupation, monthly_income
                    ) VALUES (
                        v_school_id, v_g_prefix, v_g_first_name, COALESCE(v_g_last_name, '-'), v_g_phone, v_g_national_id, v_g_occupation, v_g_income
                    )
                    RETURNING id INTO v_guardian_id;

                    BEGIN
                        v_g_relation := COALESCE(NULLIF(v_student_elem->>'guardian_relation', '')::guardian_relation, 'guardian'::guardian_relation);
                    EXCEPTION WHEN OTHERS THEN
                        v_g_relation := 'guardian'::guardian_relation;
                    END;

                    INSERT INTO student_guardians (
                        school_id, student_id, guardian_id, relation, is_primary, can_pickup
                    ) VALUES (
                        v_school_id, v_existing_student_id, v_guardian_id, v_g_relation, true, true
                    )
                    ON CONFLICT (student_id, guardian_id) DO NOTHING;
                END IF;
            END IF;

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
            subdistrict,
            district,
            province,
            postal_code,
            distance_to_school_km,
            travel_method,
            nationality,
            ethnicity,
            religion,
            family_status,
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
            v_subdistrict,
            v_district,
            v_province,
            v_postal_code,
            v_distance_to_school_km,
            v_travel_method,
            v_nationality,
            v_ethnicity,
            v_religion,
            v_family_status,
            'active',
            CURRENT_DATE
        )
        RETURNING id INTO v_student_id;

        -- Optional Guardian insert
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
                phone,
                national_id,
                occupation,
                monthly_income
            ) VALUES (
                v_school_id,
                v_g_prefix,
                v_g_first_name,
                COALESCE(v_g_last_name, '-'),
                v_g_phone,
                v_g_national_id,
                v_g_occupation,
                v_g_income
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

        v_imported_count := v_imported_count + 1;
        v_student_ids := array_append(v_student_ids, v_student_id);
    END LOOP;

    RETURN jsonb_build_object(
        'success', true,
        'imported_count', v_imported_count,
        'skipped_count', v_skipped_count,
        'enrolled_existing_count', v_enrolled_existing_count,
        'student_ids', v_student_ids
    );
END;
$$;

-- Backward-compatible overload
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
