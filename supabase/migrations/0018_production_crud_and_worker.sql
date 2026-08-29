-- Migration 0018: Production CRUD Hardening, Risk Recalculation, and Academic Batch RPCs

-- 1. Support Status Enum Verification & RLS
DO $$
BEGIN
    -- Ensure support_records delete policy exists for admin/leadership/counselor
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'support_records' 
          AND policyname = 'Leadership and counselors can delete support records'
    ) THEN
        CREATE POLICY "Leadership and counselors can delete support records"
            ON public.support_records FOR DELETE
            USING (
                school_id = public.get_user_school_id()
                AND (
                    public.get_user_role() IN ('admin', 'director', 'counselor')
                    OR provided_by = auth.uid()
                )
            );
    END IF;
END $$;

-- 2. Behavior Records Deletion Policy
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'behavior_records' 
          AND policyname = 'Recorders and leadership can delete behavior records'
    ) THEN
        CREATE POLICY "Recorders and leadership can delete behavior records"
            ON public.behavior_records FOR DELETE
            USING (
                school_id = public.get_user_school_id()
                AND (
                    public.get_user_role() IN ('admin', 'director')
                    OR reported_by = auth.uid()
                )
            );
    END IF;
END $$;

-- 3. Academic Score Batch Upsert RPC
CREATE OR REPLACE FUNCTION public.upsert_academic_scores_batch(
    p_classroom_id uuid,
    p_subject_id uuid,
    p_semester_id uuid,
    p_scores jsonb
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_actor_id uuid := auth.uid();
    v_school_id uuid;
    v_user_role user_role;
    v_is_assigned boolean := false;
    v_item jsonb;
    v_student_id uuid;
    v_score numeric;
    v_max_score numeric;
    v_eval_type text;
    v_term integer;
    v_notes text;
    v_count integer := 0;
BEGIN
    SELECT school_id, role
    INTO v_school_id, v_user_role
    FROM public.profiles
    WHERE id = v_actor_id
      AND is_active = true;

    IF v_actor_id IS NULL OR v_school_id IS NULL THEN
        RAISE EXCEPTION 'UNAUTHORIZED: Active user profile not found'
            USING ERRCODE = '42501';
    END IF;

    -- Check leadership or assigned teacher
    IF v_user_role IN ('admin', 'director') THEN
        v_is_assigned := true;
    ELSIF v_user_role = 'homeroom_teacher' THEN
        SELECT true INTO v_is_assigned
        FROM public.classrooms
        WHERE id = p_classroom_id
          AND school_id = v_school_id
          AND homeroom_teacher_id = v_actor_id;
    ELSIF v_user_role = 'subject_teacher' THEN
        SELECT true INTO v_is_assigned
        FROM public.classroom_subjects
        WHERE classroom_id = p_classroom_id
          AND subject_id = p_subject_id
          AND semester_id = p_semester_id
          AND school_id = v_school_id
          AND teacher_id = v_actor_id;
    END IF;

    IF NOT coalesce(v_is_assigned, false) THEN
        RAISE EXCEPTION 'FORBIDDEN: You do not have permission to enter scores for this class and subject'
            USING ERRCODE = '42501';
    END IF;

    -- Iterate and upsert scores
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_scores)
    LOOP
        v_student_id := (v_item->>'student_id')::uuid;
        v_score := (v_item->>'score')::numeric;
        v_max_score := coalesce((v_item->>'max_score')::numeric, 100);
        v_eval_type := coalesce(v_item->>'evaluation_type', 'assignment');
        v_term := coalesce((v_item->>'term')::integer, 1);
        v_notes := v_item->>'notes';

        -- Verify student belongs to classroom and school
        IF EXISTS (
            SELECT 1 FROM public.classroom_students
            WHERE classroom_id = p_classroom_id
              AND student_id = v_student_id
              AND school_id = v_school_id
        ) THEN
            -- Check for existing score with same student, subject, semester, eval_type, term
            IF EXISTS (
                SELECT 1 FROM public.academic_scores
                WHERE student_id = v_student_id
                  AND subject_id = p_subject_id
                  AND semester_id = p_semester_id
                  AND evaluation_type = v_eval_type
                  AND term = v_term
                  AND school_id = v_school_id
            ) THEN
                UPDATE public.academic_scores
                SET score = v_score,
                    max_score = v_max_score,
                    notes = v_notes,
                    recorded_by = v_actor_id,
                    updated_at = now()
                WHERE student_id = v_student_id
                  AND subject_id = p_subject_id
                  AND semester_id = p_semester_id
                  AND evaluation_type = v_eval_type
                  AND term = v_term
                  AND school_id = v_school_id;
            ELSE
                INSERT INTO public.academic_scores (
                    school_id,
                    student_id,
                    subject_id,
                    semester_id,
                    evaluation_type,
                    term,
                    score,
                    max_score,
                    notes,
                    recorded_by
                ) VALUES (
                    v_school_id,
                    v_student_id,
                    p_subject_id,
                    p_semester_id,
                    v_eval_type,
                    v_term,
                    v_score,
                    v_max_score,
                    v_notes,
                    v_actor_id
                );
            END IF;

            v_count := v_count + 1;
        END IF;
    END LOOP;

    RETURN v_count;
END;
$$;

-- 4. Explainable Risk Recalculation RPC
CREATE OR REPLACE FUNCTION public.recalculate_student_risk_signals(
    p_student_id uuid,
    p_semester_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_actor_id uuid := auth.uid();
    v_school_id uuid;
    v_user_role user_role;
    v_student_school_id uuid;
    v_total_att integer := 0;
    v_present_att integer := 0;
    v_att_rate numeric := 100.0;
    v_neg_behavior_points integer := 0;
    v_failing_grades_count integer := 0;
    v_open_support_count integer := 0;
    v_calculated_score integer := 0;
    v_calculated_level risk_level := 'normal';
    v_assessment_id uuid;
BEGIN
    SELECT school_id, role
    INTO v_school_id, v_user_role
    FROM public.profiles
    WHERE id = v_actor_id
      AND is_active = true;

    IF v_actor_id IS NULL OR v_school_id IS NULL THEN
        RAISE EXCEPTION 'UNAUTHORIZED: Active user profile not found'
            USING ERRCODE = '42501';
    END IF;

    -- Verify student school
    SELECT school_id INTO v_student_school_id
    FROM public.students
    WHERE id = p_student_id;

    IF v_student_school_id IS NULL OR v_student_school_id <> v_school_id THEN
        RAISE EXCEPTION 'NOT_FOUND: Student does not exist in this school'
            USING ERRCODE = 'P0002';
    END IF;

    -- 1. Attendance Signal (last 60 days)
    SELECT count(*), count(*) FILTER (WHERE status = 'present')
    INTO v_total_att, v_present_att
    FROM public.attendance_records
    WHERE student_id = p_student_id
      AND school_id = v_school_id
      AND date >= (current_date - interval '60 days');

    IF v_total_att > 0 THEN
        v_att_rate := round((v_present_att::numeric / v_total_att::numeric) * 100.0, 1);
    END IF;

    -- 2. Behavioral Signal (recent negative behavior points)
    SELECT coalesce(sum(abs(points)), 0)
    INTO v_neg_behavior_points
    FROM public.behavior_records
    WHERE student_id = p_student_id
      AND school_id = v_school_id
      AND behavior_type = 'negative'
      AND date >= (current_date - interval '180 days');

    -- 3. Academic Signal (failing grades < 50%)
    SELECT count(*)
    INTO v_failing_grades_count
    FROM public.academic_scores
    WHERE student_id = p_student_id
      AND school_id = v_school_id
      AND semester_id = p_semester_id
      AND (score / nullif(max_score, 0)) < 0.5;

    -- 4. Open Support Cases
    SELECT count(*)
    INTO v_open_support_count
    FROM public.support_records
    WHERE student_id = p_student_id
      AND school_id = v_school_id
      AND status IN ('open', 'in_progress');

    -- Compute composite risk score (0 - 100)
    -- Attendance weight: up to 40 pts
    IF v_att_rate < 70 THEN
        v_calculated_score := v_calculated_score + 40;
    ELSIF v_att_rate < 80 THEN
        v_calculated_score := v_calculated_score + 25;
    ELSIF v_att_rate < 90 THEN
        v_calculated_score := v_calculated_score + 10;
    END IF;

    -- Behavior weight: up to 30 pts
    IF v_neg_behavior_points >= 20 THEN
        v_calculated_score := v_calculated_score + 30;
    ELSIF v_neg_behavior_points >= 10 THEN
        v_calculated_score := v_calculated_score + 15;
    ELSIF v_neg_behavior_points >= 5 THEN
        v_calculated_score := v_calculated_score + 5;
    END IF;

    -- Academic weight: up to 20 pts
    IF v_failing_grades_count >= 3 THEN
        v_calculated_score := v_calculated_score + 20;
    ELSIF v_failing_grades_count >= 1 THEN
        v_calculated_score := v_calculated_score + 10;
    END IF;

    -- Support case presence: 10 pts
    IF v_open_support_count > 0 THEN
        v_calculated_score := v_calculated_score + 10;
    END IF;

    -- Determine risk level
    IF v_calculated_score >= 50 THEN
        v_calculated_level := 'high';
    ELSIF v_calculated_score >= 20 THEN
        v_calculated_level := 'watch';
    ELSE
        v_calculated_level := 'normal';
    END IF;

    -- Upsert risk_assessments for this student and semester
    SELECT id INTO v_assessment_id
    FROM public.risk_assessments
    WHERE student_id = p_student_id
      AND semester_id = p_semester_id
      AND school_id = v_school_id
    ORDER BY assessment_date DESC
    LIMIT 1;

    IF v_assessment_id IS NOT NULL THEN
        UPDATE public.risk_assessments
        SET overall_score = v_calculated_score,
            risk_level = v_calculated_level,
            assessment_date = current_date,
            assessed_by = v_actor_id,
            updated_at = now()
        WHERE id = v_assessment_id;
    ELSE
        INSERT INTO public.risk_assessments (
            school_id,
            student_id,
            semester_id,
            assessed_by,
            assessment_date,
            overall_score,
            risk_level,
            notes
        ) VALUES (
            v_school_id,
            p_student_id,
            p_semester_id,
            v_actor_id,
            current_date,
            v_calculated_score,
            v_calculated_level,
            'คำนวณอัตโนมัติจากสัญญาณการเข้าเรียน พฤติกรรม และผลการเรียน'
        ) RETURNING id INTO v_assessment_id;
    END IF;

    -- Rebuild risk_factors for this assessment
    DELETE FROM public.risk_factors WHERE assessment_id = v_assessment_id;

    IF v_att_rate < 85 THEN
        INSERT INTO public.risk_factors (
            school_id,
            assessment_id,
            category,
            severity,
            description
        ) VALUES (
            v_school_id,
            v_assessment_id,
            'attendance',
            CASE WHEN v_att_rate < 75 THEN 'high'::risk_level ELSE 'watch'::risk_level END,
            'อัตราการเข้าเรียนย้อนหลัง ' || v_att_rate || '% (ต่ำกว่าเกณฑ์ 85%)'
        );
    END IF;

    IF v_neg_behavior_points >= 5 THEN
        INSERT INTO public.risk_factors (
            school_id,
            assessment_id,
            category,
            severity,
            description
        ) VALUES (
            v_school_id,
            v_assessment_id,
            'behavioral',
            CASE WHEN v_neg_behavior_points >= 15 THEN 'high'::risk_level ELSE 'watch'::risk_level END,
            'มีบันทึกพฤติกรรมเชิงลบสะสม ' || v_neg_behavior_points || ' คะแนน'
        );
    END IF;

    IF v_failing_grades_count > 0 THEN
        INSERT INTO public.risk_factors (
            school_id,
            assessment_id,
            category,
            severity,
            description
        ) VALUES (
            v_school_id,
            v_assessment_id,
            'academic',
            CASE WHEN v_failing_grades_count >= 2 THEN 'high'::risk_level ELSE 'watch'::risk_level END,
            'มีผลการเรียนไม่ผ่านเกณฑ์ ' || v_failing_grades_count || ' รายวิชา'
        );
    END IF;

    RETURN jsonb_build_object(
        'studentId', p_student_id,
        'semesterId', p_semester_id,
        'assessmentId', v_assessment_id,
        'overallScore', v_calculated_score,
        'riskLevel', v_calculated_level,
        'attendanceRate', v_att_rate,
        'behaviorPoints', v_neg_behavior_points,
        'failingGrades', v_failing_grades_count,
        'openSupportCases', v_open_support_count
    );
END;
$$;

REVOKE ALL ON FUNCTION public.upsert_academic_scores_batch(uuid, uuid, uuid, jsonb) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.upsert_academic_scores_batch(uuid, uuid, uuid, jsonb) TO authenticated;

REVOKE ALL ON FUNCTION public.recalculate_student_risk_signals(uuid, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.recalculate_student_risk_signals(uuid, uuid) TO authenticated;
