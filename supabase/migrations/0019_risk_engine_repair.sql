-- ===================================================================
-- MIGRATION 0019: Risk engine repair — real schema, 8 factors, weights,
-- teacher flags, and automatic recalculation triggers.
--
-- Background:
-- * `recalculate_student_risk_signals` (0018) is the live engine used by
--   `risk.actions.ts`, but it referenced columns that do not exist
--   (`overall_score`, `assessment_date`, `assessment_id`, `category`,
--   `severity`, `description`, `notes`, `academic_scores.score/max_score`)
--   and an invalid support status ('open'). Every RPC call failed.
-- * It also ignored basic_skills, assignment_submissions, home_visits,
--   and manual teacher flags, so Phase-1B data never affected risk.
--
-- This migration rewrites the RPC against the real 0001 schema, adds the
-- missing REQUIREMENTS (FR-08) signals, makes weights admin-configurable
-- via `risk_weights` (FR-08-07), and adds AFTER triggers so scores are
-- recalculated automatically when source data changes (FR-08-03).
-- ===================================================================

-- -------------------------------------------------------------------
-- 1. risk_weights: admin-configurable factor weights per school
-- -------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS risk_weights (
    school_id   uuid NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    factor_key  varchar(50) NOT NULL,
    weight      integer NOT NULL CHECK (weight >= 0 AND weight <= 100),
    updated_by  uuid REFERENCES profiles(id),
    created_at  timestamptz NOT NULL DEFAULT now(),
    updated_at  timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT uq_risk_weight_per_school UNIQUE (school_id, factor_key)
);

-- Seed REQUIREMENTS default weights for every existing school.
INSERT INTO risk_weights (school_id, factor_key, weight)
SELECT s.id, w.factor_key, w.weight
FROM schools s
CROSS JOIN (VALUES
    ('frequent_absence', 20),
    ('frequent_late', 10),
    ('low_grades', 20),
    ('low_basic_skills', 15),
    ('missing_assignments', 10),
    ('family_problems', 15),
    ('travel_difficulty', 10),
    ('teacher_flagged', 10)
) AS w(factor_key, weight)
ON CONFLICT (school_id, factor_key) DO NOTHING;

ALTER TABLE risk_weights ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "View risk weights in own school" ON risk_weights;
CREATE POLICY "View risk weights in own school"
    ON risk_weights FOR SELECT
    USING (school_id = get_user_school_id());

DROP POLICY IF EXISTS "Manage risk weights by leadership" ON risk_weights;
CREATE POLICY "Manage risk weights by leadership"
    ON risk_weights FOR ALL
    USING (
        school_id = get_user_school_id()
        AND get_user_role() IN ('admin', 'director')
    )
    WITH CHECK (
        school_id = get_user_school_id()
        AND get_user_role() IN ('admin', 'director')
    );

-- Helper: weight with REQUIREMENTS fallback when a row is missing.
CREATE OR REPLACE FUNCTION get_risk_weight(
    p_school_id uuid,
    p_factor_key varchar
)
RETURNS integer
LANGUAGE plpgsql
STABLE
SET search_path = public
AS $$
DECLARE
    v_weight integer;
BEGIN
    SELECT weight INTO v_weight
    FROM risk_weights
    WHERE school_id = p_school_id
      AND factor_key = p_factor_key;

    IF v_weight IS NOT NULL THEN
        RETURN v_weight;
    END IF;

    RETURN CASE p_factor_key
        WHEN 'frequent_absence' THEN 20
        WHEN 'frequent_late' THEN 10
        WHEN 'low_grades' THEN 20
        WHEN 'low_basic_skills' THEN 15
        WHEN 'missing_assignments' THEN 10
        WHEN 'family_problems' THEN 15
        WHEN 'travel_difficulty' THEN 10
        WHEN 'teacher_flagged' THEN 10
        ELSE 0
    END;
END;
$$;

-- -------------------------------------------------------------------
-- 2. Rewrite the live recalculation RPC against the real schema.
--    Same signature, same auth checks, same grants (preserved by
--    CREATE OR REPLACE). Score model: 8 REQUIREMENTS factors with
--    configurable weights + open support cases (+10), capped at 100.
--    Levels follow the documented spec: normal 0-30, watch 31-60,
--    high 61-100.
-- -------------------------------------------------------------------
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
    v_semester_start date;
    v_semester_end date;
    v_score integer := 0;
    v_level risk_level := 'normal';
    v_assessment_id uuid;
    v_previous_level risk_level;
    -- signal values
    v_absent_30 integer := 0;
    v_late_30 integer := 0;
    v_avg_grade numeric;
    v_failing_count integer := 0;
    v_has_low_skills boolean := false;
    v_total_assign integer := 0;
    v_missing_assign integer := 0;
    v_missing_rate numeric := 0;
    v_has_family_problem boolean := false;
    v_has_travel_difficulty boolean := false;
    v_teacher_flagged boolean := false;
    v_teacher_flag_reason text;
    v_open_support_count integer := 0;
    v_att_60_total integer := 0;
    v_att_60_present integer := 0;
    v_att_rate numeric := 100.0;
    v_neg_behavior_points integer := 0;
    -- weights
    w_absence integer;
    w_late integer;
    w_grades integer;
    w_skills integer;
    w_assign integer;
    w_family integer;
    w_travel integer;
    w_flag integer;
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

    SELECT school_id INTO v_student_school_id
    FROM public.students
    WHERE id = p_student_id;

    IF v_student_school_id IS NULL OR v_student_school_id <> v_school_id THEN
        RAISE EXCEPTION 'NOT_FOUND: Student does not exist in this school'
            USING ERRCODE = 'P0002';
    END IF;

    SELECT start_date, end_date INTO v_semester_start, v_semester_end
    FROM public.semesters
    WHERE id = p_semester_id AND school_id = v_school_id;

    w_absence := get_risk_weight(v_school_id, 'frequent_absence');
    w_late := get_risk_weight(v_school_id, 'frequent_late');
    w_grades := get_risk_weight(v_school_id, 'low_grades');
    w_skills := get_risk_weight(v_school_id, 'low_basic_skills');
    w_assign := get_risk_weight(v_school_id, 'missing_assignments');
    w_family := get_risk_weight(v_school_id, 'family_problems');
    w_travel := get_risk_weight(v_school_id, 'travel_difficulty');
    w_flag := get_risk_weight(v_school_id, 'teacher_flagged');

    -- Factor 1: frequent absence (>3 days in 30 days)
    SELECT count(*) INTO v_absent_30
    FROM public.attendance_records
    WHERE student_id = p_student_id
      AND school_id = v_school_id
      AND date >= (current_date - interval '30 days')
      AND status = 'absent';

    -- Factor 2: frequent late (>5 times in 30 days)
    SELECT count(*) INTO v_late_30
    FROM public.attendance_records
    WHERE student_id = p_student_id
      AND school_id = v_school_id
      AND date >= (current_date - interval '30 days')
      AND status = 'late';

    -- Factor 3: low grades (average grade_point < 1.5) + failing subjects
    SELECT AVG(grade_point) INTO v_avg_grade
    FROM public.academic_scores
    WHERE student_id = p_student_id
      AND school_id = v_school_id
      AND semester_id = p_semester_id
      AND grade_point IS NOT NULL;

    SELECT count(*) INTO v_failing_count
    FROM public.academic_scores
    WHERE student_id = p_student_id
      AND school_id = v_school_id
      AND semester_id = p_semester_id
      AND total_score IS NOT NULL
      AND total_score < 50;

    -- Factor 4: low basic skills (reading/writing/math poor or critical)
    SELECT EXISTS (
        SELECT 1 FROM public.basic_skills
        WHERE student_id = p_student_id
          AND school_id = v_school_id
          AND semester_id = p_semester_id
          AND (
              reading_level IN ('poor', 'critical')
              OR writing_level IN ('poor', 'critical')
              OR math_level IN ('poor', 'critical')
          )
    ) INTO v_has_low_skills;

    -- Factor 5: missing assignments (>30% not submitted this semester)
    SELECT count(*), count(*) FILTER (WHERE status = 'not_submitted')
    INTO v_total_assign, v_missing_assign
    FROM public.assignment_submissions
    WHERE student_id = p_student_id
      AND school_id = v_school_id
      AND (
        v_semester_start IS NULL
        OR assigned_date BETWEEN v_semester_start AND COALESCE(v_semester_end, current_date)
      );

    IF v_total_assign > 0 THEN
        v_missing_rate := (v_missing_assign::numeric / v_total_assign::numeric) * 100.0;
    END IF;

    -- Factor 6: family problems (home visit flag)
    SELECT EXISTS (
        SELECT 1 FROM public.home_visits
        WHERE student_id = p_student_id
          AND school_id = v_school_id
          AND semester_id = p_semester_id
          AND has_family_problem = true
    ) INTO v_has_family_problem;

    -- Factor 7: difficult commute (home visit flag or distance > 10 km)
    SELECT EXISTS (
        SELECT 1 FROM public.home_visits
        WHERE student_id = p_student_id
          AND school_id = v_school_id
          AND semester_id = p_semester_id
          AND travel_difficulty = true
    ) INTO v_has_travel_difficulty;

    IF NOT v_has_travel_difficulty THEN
        SELECT EXISTS (
            SELECT 1 FROM public.students
            WHERE id = p_student_id
              AND distance_to_school_km > 10
        ) INTO v_has_travel_difficulty;
    END IF;

    -- Factor 8: manual teacher flag (active student_flags row)
    SELECT EXISTS (
        SELECT 1 FROM public.student_flags
        WHERE student_id = p_student_id
          AND school_id = v_school_id
          AND flag_key = 'teacher_flagged'
          AND status = 'active'
    ) INTO v_teacher_flagged;

    IF v_teacher_flagged THEN
        SELECT description INTO v_teacher_flag_reason
        FROM public.student_flags
        WHERE student_id = p_student_id
          AND school_id = v_school_id
          AND flag_key = 'teacher_flagged'
          AND status = 'active'
        ORDER BY updated_at DESC
        LIMIT 1;
    END IF;

    -- Extra signal: open support cases (pending / in_progress)
    SELECT count(*) INTO v_open_support_count
    FROM public.support_records
    WHERE student_id = p_student_id
      AND school_id = v_school_id
      AND status IN ('pending', 'in_progress');

    -- Extra context: 60-day attendance rate + negative behavior points
    SELECT count(*), count(*) FILTER (WHERE status = 'present')
    INTO v_att_60_total, v_att_60_present
    FROM public.attendance_records
    WHERE student_id = p_student_id
      AND school_id = v_school_id
      AND date >= (current_date - interval '60 days');

    IF v_att_60_total > 0 THEN
        v_att_rate := round((v_att_60_present::numeric / v_att_60_total::numeric) * 100.0, 1);
    END IF;

    SELECT coalesce(sum(abs(points)), 0) INTO v_neg_behavior_points
    FROM public.behavior_records
    WHERE student_id = p_student_id
      AND school_id = v_school_id
      AND behavior_type = 'negative'
      AND date >= (current_date - interval '180 days');

    -- Compose score
    IF v_absent_30 > 3 THEN
        v_score := v_score + w_absence;
    END IF;
    IF v_late_30 > 5 THEN
        v_score := v_score + w_late;
    END IF;
    IF v_avg_grade IS NOT NULL AND v_avg_grade < 1.5 THEN
        v_score := v_score + w_grades;
    END IF;
    IF v_has_low_skills THEN
        v_score := v_score + w_skills;
    END IF;
    IF v_total_assign > 0 AND v_missing_rate > 30 THEN
        v_score := v_score + w_assign;
    END IF;
    IF v_has_family_problem THEN
        v_score := v_score + w_family;
    END IF;
    IF v_has_travel_difficulty THEN
        v_score := v_score + w_travel;
    END IF;
    IF v_teacher_flagged THEN
        v_score := v_score + w_flag;
    END IF;
    IF v_open_support_count > 0 THEN
        v_score := v_score + 10;
    END IF;

    IF v_score > 100 THEN
        v_score := 100;
    END IF;

    IF v_score >= 61 THEN
        v_level := 'high';
    ELSIF v_score >= 31 THEN
        v_level := 'watch';
    ELSE
        v_level := 'normal';
    END IF;

    -- Upsert assessment (real 0001 columns)
    SELECT risk_level INTO v_previous_level
    FROM public.risk_assessments
    WHERE student_id = p_student_id
      AND semester_id = p_semester_id
      AND school_id = v_school_id;

    INSERT INTO public.risk_assessments (
        school_id,
        student_id,
        semester_id,
        risk_score,
        risk_level,
        auto_calculated,
        assessed_by,
        assessed_at,
        previous_risk_level,
        trend,
        summary
    ) VALUES (
        v_school_id,
        p_student_id,
        p_semester_id,
        v_score,
        v_level,
        true,
        v_actor_id,
        now(),
        v_previous_level,
        CASE
            WHEN v_previous_level IS NULL THEN 'new'
            WHEN v_level = v_previous_level THEN 'stable'
            WHEN (v_level = 'high') OR (v_level = 'watch' AND v_previous_level = 'normal') THEN 'worsening'
            ELSE 'improving'
        END,
        'คำนวณอัตโนมัติจากสัญญาณ 8 ปัจจัย (มาเรียน ผลการเรียน ทักษะพื้นฐาน การส่งงาน ครอบครัว การเดินทาง ครูระบุ) และเคสช่วยเหลือ'
    )
    ON CONFLICT (student_id, semester_id) DO UPDATE SET
        risk_score = EXCLUDED.risk_score,
        risk_level = EXCLUDED.risk_level,
        auto_calculated = true,
        assessed_by = EXCLUDED.assessed_by,
        assessed_at = EXCLUDED.assessed_at,
        previous_risk_level = public.risk_assessments.risk_level,
        trend = CASE
            WHEN EXCLUDED.risk_level = public.risk_assessments.risk_level THEN 'stable'
            WHEN (EXCLUDED.risk_level = 'high')
              OR (EXCLUDED.risk_level = 'watch' AND public.risk_assessments.risk_level = 'normal') THEN 'worsening'
            ELSE 'improving'
        END,
        summary = EXCLUDED.summary,
        updated_at = now()
    RETURNING id INTO v_assessment_id;

    -- Rebuild factors (real 0001 columns)
    DELETE FROM public.risk_factors WHERE risk_assessment_id = v_assessment_id;

    IF v_absent_30 > 3 THEN
        INSERT INTO public.risk_factors (school_id, risk_assessment_id, factor_key, factor_label, score, evidence, data_source)
        VALUES (v_school_id, v_assessment_id, 'frequent_absence', 'ขาดเรียนบ่อย', w_absence,
            format('ขาดเรียน %s วัน ใน 30 วันที่ผ่านมา', v_absent_30), 'attendance_records');
    END IF;

    IF v_late_30 > 5 THEN
        INSERT INTO public.risk_factors (school_id, risk_assessment_id, factor_key, factor_label, score, evidence, data_source)
        VALUES (v_school_id, v_assessment_id, 'frequent_late', 'มาสายบ่อย', w_late,
            format('มาสาย %s ครั้ง ใน 30 วันที่ผ่านมา', v_late_30), 'attendance_records');
    END IF;

    IF v_avg_grade IS NOT NULL AND v_avg_grade < 1.5 THEN
        INSERT INTO public.risk_factors (school_id, risk_assessment_id, factor_key, factor_label, score, evidence, data_source)
        VALUES (v_school_id, v_assessment_id, 'low_grades', 'คะแนนต่ำ', w_grades,
            format('เกรดเฉลี่ย %.2f (ต่ำกว่า 1.5)', v_avg_grade), 'academic_scores');
    END IF;

    IF v_has_low_skills THEN
        INSERT INTO public.risk_factors (school_id, risk_assessment_id, factor_key, factor_label, score, evidence, data_source)
        VALUES (v_school_id, v_assessment_id, 'low_basic_skills', 'อ่าน/เขียน/คิดเลขต่ำกว่าเกณฑ์', w_skills,
            'ทักษะพื้นฐานอยู่ในระดับ "ปรับปรุง" หรือ "ไม่ผ่าน"', 'basic_skills');
    END IF;

    IF v_total_assign > 0 AND v_missing_rate > 30 THEN
        INSERT INTO public.risk_factors (school_id, risk_assessment_id, factor_key, factor_label, score, evidence, data_source)
        VALUES (v_school_id, v_assessment_id, 'missing_assignments', 'ไม่ส่งงานบ่อย', w_assign,
            format('ไม่ส่งงาน %s/%s ชิ้น (%.0f%%)', v_missing_assign, v_total_assign, v_missing_rate), 'assignment_submissions');
    END IF;

    IF v_has_family_problem THEN
        INSERT INTO public.risk_factors (school_id, risk_assessment_id, factor_key, factor_label, score, evidence, data_source)
        VALUES (v_school_id, v_assessment_id, 'family_problems', 'มีปัญหาครอบครัว', w_family,
            'พบปัญหาครอบครัวจากการเยี่ยมบ้าน', 'home_visits');
    END IF;

    IF v_has_travel_difficulty THEN
        INSERT INTO public.risk_factors (school_id, risk_assessment_id, factor_key, factor_label, score, evidence, data_source)
        VALUES (v_school_id, v_assessment_id, 'travel_difficulty', 'เดินทางมาเรียนลำบาก', w_travel,
            'เดินทางมาเรียนลำบากหรือระยะทางไกล', 'home_visits/students');
    END IF;

    IF v_teacher_flagged THEN
        INSERT INTO public.risk_factors (school_id, risk_assessment_id, factor_key, factor_label, score, evidence, data_source)
        VALUES (v_school_id, v_assessment_id, 'teacher_flagged', 'ครูระบุว่าควรติดตาม', w_flag,
            COALESCE(v_teacher_flag_reason, 'ครูระบุว่าควรติดตามเป็นพิเศษ'), 'student_flags');
    END IF;

    RETURN jsonb_build_object(
        'studentId', p_student_id,
        'semesterId', p_semester_id,
        'assessmentId', v_assessment_id,
        'overallScore', v_score,
        'riskLevel', v_level,
        'attendanceRate', v_att_rate,
        'behaviorPoints', v_neg_behavior_points,
        'failingGrades', v_failing_count,
        'openSupportCases', v_open_support_count,
        'lowBasicSkills', v_has_low_skills,
        'missingAssignmentRate', round(v_missing_rate, 1),
        'hasFamilyProblem', v_has_family_problem,
        'hasTravelDifficulty', v_has_travel_difficulty,
        'teacherFlagged', v_teacher_flagged
    );
END;
$$;

-- -------------------------------------------------------------------
-- 3. Automatic recalculation when source data changes (FR-08-03).
--    Trigger functions run as the writing user, so auth.uid() is
--    available for assessed_by. Service-role writes without a user
--    context are skipped (covered by the manual recalculate-all).
-- -------------------------------------------------------------------
CREATE OR REPLACE FUNCTION auto_recalculate_student_risk()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_student_id uuid;
    v_school_id uuid;
    v_semester_id uuid;
    v_actor_id uuid := auth.uid();
BEGIN
    v_student_id := COALESCE(
        (to_jsonb(NEW) ->> 'student_id')::uuid,
        (to_jsonb(OLD) ->> 'student_id')::uuid
    );
    v_school_id := COALESCE(
        (to_jsonb(NEW) ->> 'school_id')::uuid,
        (to_jsonb(OLD) ->> 'school_id')::uuid
    );

    -- Reentrancy guard: the risk follow-up automation writes
    -- student_flags/action_items, which must never loop back here.
    IF pg_trigger_depth() > 1 THEN
        RETURN COALESCE(NEW, OLD);
    END IF;

    IF v_student_id IS NULL OR v_school_id IS NULL THEN
        RETURN COALESCE(NEW, OLD);
    END IF;

    -- Prefer the row semester when the table has one.
    BEGIN
        v_semester_id := NULLIF(to_jsonb(NEW) ->> 'semester_id', '')::uuid;
    EXCEPTION WHEN OTHERS THEN
        v_semester_id := NULL;
    END;

    IF v_semester_id IS NULL THEN
        SELECT id INTO v_semester_id
        FROM semesters
        WHERE school_id = v_school_id AND is_current = true
        ORDER BY start_date DESC
        LIMIT 1;
    END IF;

    IF v_semester_id IS NULL OR v_actor_id IS NULL THEN
        RETURN COALESCE(NEW, OLD);
    END IF;

    PERFORM recalculate_student_risk_signals(v_student_id, v_semester_id);

    RETURN COALESCE(NEW, OLD);
EXCEPTION WHEN OTHERS THEN
    -- Never block the source write because risk recalculation failed.
    RAISE NOTICE 'auto_recalculate_student_risk skipped: %', SQLERRM;
    RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS trg_auto_risk_attendance ON attendance_records;
CREATE TRIGGER trg_auto_risk_attendance
    AFTER INSERT OR UPDATE OF status ON attendance_records
    FOR EACH ROW EXECUTE FUNCTION auto_recalculate_student_risk();

DROP TRIGGER IF EXISTS trg_auto_risk_academic ON academic_scores;
CREATE TRIGGER trg_auto_risk_academic
    AFTER INSERT OR UPDATE ON academic_scores
    FOR EACH ROW EXECUTE FUNCTION auto_recalculate_student_risk();

DROP TRIGGER IF EXISTS trg_auto_risk_basic_skills ON basic_skills;
CREATE TRIGGER trg_auto_risk_basic_skills
    AFTER INSERT OR UPDATE ON basic_skills
    FOR EACH ROW EXECUTE FUNCTION auto_recalculate_student_risk();

DROP TRIGGER IF EXISTS trg_auto_risk_behavior ON behavior_records;
CREATE TRIGGER trg_auto_risk_behavior
    AFTER INSERT OR UPDATE ON behavior_records
    FOR EACH ROW EXECUTE FUNCTION auto_recalculate_student_risk();

DROP TRIGGER IF EXISTS trg_auto_risk_assignments ON assignment_submissions;
CREATE TRIGGER trg_auto_risk_assignments
    AFTER INSERT OR UPDATE OF status ON assignment_submissions
    FOR EACH ROW EXECUTE FUNCTION auto_recalculate_student_risk();

DROP TRIGGER IF EXISTS trg_auto_risk_home_visits ON home_visits;
CREATE TRIGGER trg_auto_risk_home_visits
    AFTER INSERT OR UPDATE ON home_visits
    FOR EACH ROW EXECUTE FUNCTION auto_recalculate_student_risk();

DROP TRIGGER IF EXISTS trg_auto_risk_support ON support_records;
CREATE TRIGGER trg_auto_risk_support
    AFTER INSERT OR UPDATE OF status ON support_records
    FOR EACH ROW EXECUTE FUNCTION auto_recalculate_student_risk();

DROP TRIGGER IF EXISTS trg_auto_risk_flags ON student_flags;
DROP TRIGGER IF EXISTS trg_auto_risk_flags_insert ON student_flags;
CREATE TRIGGER trg_auto_risk_flags_insert
    AFTER INSERT ON student_flags
    FOR EACH ROW
    WHEN (NEW.flag_key = 'teacher_flagged')
    EXECUTE FUNCTION auto_recalculate_student_risk();

DROP TRIGGER IF EXISTS trg_auto_risk_flags_update ON student_flags;
CREATE TRIGGER trg_auto_risk_flags_update
    AFTER UPDATE OF status ON student_flags
    FOR EACH ROW
    WHEN (NEW.flag_key = 'teacher_flagged' AND NEW.status IS DISTINCT FROM OLD.status)
    EXECUTE FUNCTION auto_recalculate_student_risk();

-- Helpful indexes for the recalculation queries.
CREATE INDEX IF NOT EXISTS idx_attendance_risk_lookup
    ON attendance_records (student_id, school_id, date, status);
CREATE INDEX IF NOT EXISTS idx_basic_skills_risk_lookup
    ON basic_skills (student_id, school_id, semester_id);
CREATE INDEX IF NOT EXISTS idx_assignments_risk_lookup
    ON assignment_submissions (student_id, school_id, assigned_date, status);
CREATE INDEX IF NOT EXISTS idx_flags_teacher_active
    ON student_flags (student_id, school_id)
    WHERE flag_key = 'teacher_flagged' AND status = 'active';
