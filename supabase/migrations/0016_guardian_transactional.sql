-- Migration 0016: Transactional Guardian Management & Notification Delete RLS

-- 1. Notification DELETE RLS Policy
DROP POLICY IF EXISTS "notifications_delete_recipient" ON notifications;
CREATE POLICY "notifications_delete_recipient" ON notifications
    FOR DELETE
    TO authenticated
    USING (
        recipient_id IN (
            SELECT id FROM profiles WHERE auth_user_id = auth.uid()
        )
    );

-- 2. Transactional manage_student_guardian RPC
CREATE OR REPLACE FUNCTION public.manage_student_guardian(
    p_student_id UUID,
    p_guardian_id UUID DEFAULT NULL,
    p_relationship VARCHAR DEFAULT 'guardian',
    p_is_primary BOOLEAN DEFAULT FALSE,
    p_first_name VARCHAR DEFAULT NULL,
    p_last_name VARCHAR DEFAULT NULL,
    p_phone VARCHAR DEFAULT NULL,
    p_email VARCHAR DEFAULT NULL,
    p_occupation VARCHAR DEFAULT NULL,
    p_monthly_income NUMERIC DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_school_id UUID;
    v_user_role user_role;
    v_profile_id UUID;
    v_student_school_id UUID;
    v_target_guardian_id UUID := p_guardian_id;
    v_sg_id UUID;
BEGIN
    -- 1. Authenticate caller
    SELECT id, school_id, role INTO v_profile_id, v_school_id, v_user_role
    FROM profiles
    WHERE auth_user_id = auth.uid();

    IF v_profile_id IS NULL OR v_school_id IS NULL THEN
        RAISE EXCEPTION 'UNAUTHORIZED: User profile not found';
    END IF;

    -- 2. Role authorization (strictly valid enum values)
    IF v_user_role NOT IN ('admin', 'director', 'homeroom_teacher', 'counselor') THEN
        RAISE EXCEPTION 'FORBIDDEN: User does not have permission to manage guardians';
    END IF;

    -- 3. Verify student belongs to caller school
    SELECT school_id INTO v_student_school_id
    FROM students
    WHERE id = p_student_id;

    IF v_student_school_id IS NULL OR v_student_school_id <> v_school_id THEN
        RAISE EXCEPTION 'FORBIDDEN: Student does not belong to user school';
    END IF;

    -- 4. Upsert or create guardian record
    IF v_target_guardian_id IS NOT NULL THEN
        -- Verify existing guardian belongs to school
        IF NOT EXISTS (SELECT 1 FROM guardians WHERE id = v_target_guardian_id AND school_id = v_school_id) THEN
            RAISE EXCEPTION 'NOT_FOUND: Guardian not found in school';
        END IF;

        UPDATE guardians
        SET
            first_name = COALESCE(NULLIF(TRIM(p_first_name), ''), first_name),
            last_name = COALESCE(NULLIF(TRIM(p_last_name), ''), last_name),
            phone = COALESCE(NULLIF(TRIM(p_phone), ''), phone),
            email = NULLIF(TRIM(p_email), ''),
            occupation = NULLIF(TRIM(p_occupation), ''),
            monthly_income = p_monthly_income,
            updated_at = NOW()
        WHERE id = v_target_guardian_id;
    ELSE
        IF p_first_name IS NULL OR TRIM(p_first_name) = '' THEN
            RAISE EXCEPTION 'VALIDATION_ERROR: First name is required for new guardian';
        END IF;

        INSERT INTO guardians (
            school_id,
            first_name,
            last_name,
            phone,
            email,
            occupation,
            monthly_income
        ) VALUES (
            v_school_id,
            TRIM(p_first_name),
            COALESCE(TRIM(p_last_name), ''),
            NULLIF(TRIM(p_phone), ''),
            NULLIF(TRIM(p_email), ''),
            NULLIF(TRIM(p_occupation), ''),
            p_monthly_income
        ) RETURNING id INTO v_target_guardian_id;
    END IF;

    -- 5. Primary Guardian Invariant Maintenance
    IF p_is_primary = TRUE THEN
        UPDATE student_guardians
        SET is_primary = FALSE, updated_at = NOW()
        WHERE student_id = p_student_id
          AND is_primary = TRUE
          AND guardian_id <> v_target_guardian_id;
    END IF;

    -- 6. Upsert student_guardians relationship
    INSERT INTO student_guardians (
        student_id,
        guardian_id,
        relationship,
        is_primary
    ) VALUES (
        p_student_id,
        v_target_guardian_id,
        COALESCE(NULLIF(TRIM(p_relationship), ''), 'guardian'),
        COALESCE(p_is_primary, FALSE)
    )
    ON CONFLICT (student_id, guardian_id) DO UPDATE
    SET
        relationship = COALESCE(NULLIF(TRIM(EXCLUDED.relationship), ''), student_guardians.relationship),
        is_primary = COALESCE(EXCLUDED.is_primary, student_guardians.is_primary),
        updated_at = NOW()
    RETURNING id INTO v_sg_id;

    RETURN jsonb_build_object(
        'success', true,
        'guardian_id', v_target_guardian_id,
        'student_guardian_id', v_sg_id,
        'is_primary', COALESCE(p_is_primary, FALSE)
    );
END;
$$;

-- Grant execution to authenticated users
GRANT EXECUTE ON FUNCTION public.manage_student_guardian TO authenticated;
