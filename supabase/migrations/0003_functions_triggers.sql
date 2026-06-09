-- ===================================================================
-- RISK SCORE CALCULATION FUNCTION
-- ===================================================================

CREATE OR REPLACE FUNCTION calculate_risk_score(
    p_student_id uuid,
    p_semester_id uuid
)
RETURNS TABLE (
    total_score integer,
    calculated_level risk_level,
    factors jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_score integer := 0;
    v_factors jsonb := '[]'::jsonb;
    v_classroom_id uuid;
    v_semester_start date;
    v_semester_end date;
    -- ตัวแปรสำหรับคำนวณ
    v_absent_count integer;
    v_late_count integer;
    v_avg_grade decimal;
    v_has_low_skills boolean;
    v_total_assignments integer;
    v_missing_assignments integer;
    v_missing_rate decimal;
    v_has_family_problem boolean;
    v_has_travel_difficulty boolean;
    v_teacher_flagged boolean;
BEGIN
    -- ดึงข้อมูลภาคเรียน
    SELECT start_date, end_date INTO v_semester_start, v_semester_end
    FROM semesters WHERE id = p_semester_id;

    -- ดึง classroom_id ปัจจุบัน
    SELECT cs.classroom_id INTO v_classroom_id
    FROM classroom_students cs
    WHERE cs.student_id = p_student_id
      AND cs.semester_id = p_semester_id
      AND cs.is_active = true
    LIMIT 1;

    -- ============================================
    -- ปัจจัยที่ 1: ขาดเรียนบ่อย (+20)
    -- เงื่อนไข: ขาดเรียนเกิน 3 วัน ในเดือนล่าสุด
    -- ============================================
    SELECT COUNT(*) INTO v_absent_count
    FROM attendance_records
    WHERE student_id = p_student_id
      AND date >= (CURRENT_DATE - INTERVAL '30 days')
      AND status = 'absent';

    IF v_absent_count > 3 THEN
        v_score := v_score + 20;
        v_factors := v_factors || jsonb_build_object(
            'key', 'frequent_absence',
            'label', 'ขาดเรียนบ่อย',
            'score', 20,
            'evidence', format('ขาดเรียน %s วัน ใน 30 วันที่ผ่านมา', v_absent_count),
            'data_source', 'attendance_records'
        );
    END IF;

    -- ============================================
    -- ปัจจัยที่ 2: มาสายบ่อย (+10)
    -- เงื่อนไข: มาสายเกิน 5 ครั้ง ในเดือนล่าสุด
    -- ============================================
    SELECT COUNT(*) INTO v_late_count
    FROM attendance_records
    WHERE student_id = p_student_id
      AND date >= (CURRENT_DATE - INTERVAL '30 days')
      AND status = 'late';

    IF v_late_count > 5 THEN
        v_score := v_score + 10;
        v_factors := v_factors || jsonb_build_object(
            'key', 'frequent_late',
            'label', 'มาสายบ่อย',
            'score', 10,
            'evidence', format('มาสาย %s ครั้ง ใน 30 วันที่ผ่านมา', v_late_count),
            'data_source', 'attendance_records'
        );
    END IF;

    -- ============================================
    -- ปัจจัยที่ 3: คะแนนต่ำ (+20)
    -- เงื่อนไข: เกรดเฉลี่ยต่ำกว่า 1.5
    -- ============================================
    SELECT AVG(grade_point) INTO v_avg_grade
    FROM academic_scores
    WHERE student_id = p_student_id
      AND semester_id = p_semester_id
      AND grade_point IS NOT NULL;

    IF v_avg_grade IS NOT NULL AND v_avg_grade < 1.5 THEN
        v_score := v_score + 20;
        v_factors := v_factors || jsonb_build_object(
            'key', 'low_grades',
            'label', 'คะแนนต่ำ',
            'score', 20,
            'evidence', format('เกรดเฉลี่ย %.2f (ต่ำกว่า 1.5)', v_avg_grade),
            'data_source', 'academic_scores'
        );
    END IF;

    -- ============================================
    -- ปัจจัยที่ 4: อ่าน/เขียนต่ำกว่าเกณฑ์ (+15)
    -- เงื่อนไข: ทักษะอ่าน/เขียน ระดับ poor หรือ critical
    -- ============================================
    SELECT EXISTS (
        SELECT 1 FROM basic_skills
        WHERE student_id = p_student_id
          AND semester_id = p_semester_id
          AND (
              reading_level IN ('poor', 'critical')
              OR writing_level IN ('poor', 'critical')
          )
    ) INTO v_has_low_skills;

    IF v_has_low_skills THEN
        v_score := v_score + 15;
        v_factors := v_factors || jsonb_build_object(
            'key', 'low_basic_skills',
            'label', 'อ่าน/เขียนต่ำกว่าเกณฑ์',
            'score', 15,
            'evidence', 'ทักษะการอ่านหรือเขียนอยู่ในระดับ "ปรับปรุง" หรือ "ต้องได้รับการช่วยเหลือเร่งด่วน"',
            'data_source', 'basic_skills'
        );
    END IF;

    -- ============================================
    -- ปัจจัยที่ 5: ไม่ส่งงานบ่อย (+10)
    -- เงื่อนไข: ไม่ส่งงานเกิน 30% ของงานทั้งหมด
    -- ============================================
    SELECT COUNT(*),
           COUNT(*) FILTER (WHERE status = 'not_submitted')
    INTO v_total_assignments, v_missing_assignments
    FROM assignment_submissions
    WHERE student_id = p_student_id
      AND assigned_date >= v_semester_start
      AND assigned_date <= COALESCE(v_semester_end, CURRENT_DATE);

    IF v_total_assignments > 0 THEN
        v_missing_rate := (v_missing_assignments::decimal / v_total_assignments) * 100;
        IF v_missing_rate > 30 THEN
            v_score := v_score + 10;
            v_factors := v_factors || jsonb_build_object(
                'key', 'missing_assignments',
                'label', 'ไม่ส่งงานบ่อย',
                'score', 10,
                'evidence', format('ไม่ส่งงาน %s/%s ชิ้น (%.0f%%)', v_missing_assignments, v_total_assignments, v_missing_rate),
                'data_source', 'assignment_submissions'
            );
        END IF;
    END IF;

    -- ============================================
    -- ปัจจัยที่ 6: มีปัญหาครอบครัว (+15)
    -- ข้อมูลจากการเยี่ยมบ้าน
    -- ============================================
    SELECT EXISTS (
        SELECT 1 FROM home_visits
        WHERE student_id = p_student_id
          AND semester_id = p_semester_id
          AND has_family_problem = true
    ) INTO v_has_family_problem;

    IF v_has_family_problem THEN
        v_score := v_score + 15;
        v_factors := v_factors || jsonb_build_object(
            'key', 'family_problems',
            'label', 'มีปัญหาครอบครัว',
            'score', 15,
            'evidence', 'พบปัญหาครอบครัวจากการเยี่ยมบ้าน',
            'data_source', 'home_visits'
        );
    END IF;

    -- ============================================
    -- ปัจจัยที่ 7: เดินทางมาเรียนลำบาก (+10)
    -- ข้อมูลจากการเยี่ยมบ้านหรือข้อมูลนักเรียน
    -- ============================================
    SELECT EXISTS (
        SELECT 1 FROM home_visits
        WHERE student_id = p_student_id
          AND semester_id = p_semester_id
          AND travel_difficulty = true
    ) INTO v_has_travel_difficulty;

    -- ตรวจจากข้อมูลนักเรียน (ระยะทาง > 10 กม.)
    IF NOT v_has_travel_difficulty THEN
        SELECT EXISTS (
            SELECT 1 FROM students
            WHERE id = p_student_id
              AND distance_to_school_km > 10
        ) INTO v_has_travel_difficulty;
    END IF;

    IF v_has_travel_difficulty THEN
        v_score := v_score + 10;
        v_factors := v_factors || jsonb_build_object(
            'key', 'travel_difficulty',
            'label', 'เดินทางมาเรียนลำบาก',
            'score', 10,
            'evidence', 'เดินทางมาเรียนลำบาก/ระยะทางไกล',
            'data_source', 'home_visits/students'
        );
    END IF;

    -- ============================================
    -- ปัจจัยที่ 8: ครูระบุว่าควรติดตาม (+10)
    -- ดูจากพฤติกรรมระดับ high/critical ในเดือนล่าสุด
    -- ============================================
    SELECT EXISTS (
        SELECT 1 FROM behavior_records
        WHERE student_id = p_student_id
          AND date >= (CURRENT_DATE - INTERVAL '60 days')
          AND behavior_type = 'negative'
          AND severity IN ('high', 'critical')
    ) INTO v_teacher_flagged;

    IF v_teacher_flagged THEN
        v_score := v_score + 10;
        v_factors := v_factors || jsonb_build_object(
            'key', 'teacher_flagged',
            'label', 'ครูระบุว่าควรติดตาม',
            'score', 10,
            'evidence', 'มีพฤติกรรมเชิงลบระดับรุนแรงใน 60 วันที่ผ่านมา',
            'data_source', 'behavior_records'
        );
    END IF;

    -- ============================================
    -- จำกัดคะแนนสูงสุดไม่เกิน 100
    -- ============================================
    IF v_score > 100 THEN
        v_score := 100;
    END IF;

    -- ============================================
    -- กำหนดระดับความเสี่ยง
    -- ============================================
    RETURN QUERY SELECT
        v_score,
        CASE
            WHEN v_score <= 30 THEN 'normal'::risk_level
            WHEN v_score <= 60 THEN 'watch'::risk_level
            ELSE 'high'::risk_level
        END,
        v_factors;
END;
$$;


-- ===================================================================
-- UPSERT RISK ASSESSMENT
-- ===================================================================

CREATE OR REPLACE FUNCTION upsert_risk_assessment(
    p_student_id uuid,
    p_semester_id uuid,
    p_assessed_by uuid DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_result RECORD;
    v_assessment_id uuid;
    v_previous_level risk_level;
    v_assessor uuid;
BEGIN
    v_assessor := COALESCE(p_assessed_by, auth.uid());

    -- คำนวณคะแนนความเสี่ยง
    SELECT * INTO v_result
    FROM calculate_risk_score(p_student_id, p_semester_id);

    -- ดึงระดับเก่า (ถ้ามี)
    SELECT risk_level INTO v_previous_level
    FROM risk_assessments
    WHERE student_id = p_student_id AND semester_id = p_semester_id;

    -- Upsert
    INSERT INTO risk_assessments (
        student_id, semester_id, risk_score, risk_level,
        auto_calculated, assessed_by, assessed_at,
        previous_risk_level,
        trend
    ) VALUES (
        p_student_id, p_semester_id, v_result.total_score, v_result.calculated_level,
        true, v_assessor, now(),
        v_previous_level,
        CASE
            WHEN v_previous_level IS NULL THEN 'new'
            WHEN v_result.calculated_level < v_previous_level THEN 'improving'
            WHEN v_result.calculated_level = v_previous_level THEN 'stable'
            ELSE 'worsening'
        END
    )
    ON CONFLICT (student_id, semester_id) DO UPDATE SET
        risk_score = EXCLUDED.risk_score,
        risk_level = EXCLUDED.risk_level,
        auto_calculated = true,
        assessed_by = EXCLUDED.assessed_by,
        assessed_at = EXCLUDED.assessed_at,
        previous_risk_level = risk_assessments.risk_level,
        trend = CASE
            WHEN risk_assessments.risk_level IS NULL THEN 'new'
            WHEN EXCLUDED.risk_level < risk_assessments.risk_level THEN 'improving'
            WHEN EXCLUDED.risk_level = risk_assessments.risk_level THEN 'stable'
            ELSE 'worsening'
        END,
        updated_at = now()
    RETURNING id INTO v_assessment_id;

    -- ลบ risk_factors เก่าแล้วเพิ่มใหม่
    DELETE FROM risk_factors WHERE risk_assessment_id = v_assessment_id;

    INSERT INTO risk_factors (risk_assessment_id, factor_key, factor_label, score, evidence, data_source)
    SELECT
        v_assessment_id,
        f->>'key',
        f->>'label',
        (f->>'score')::integer,
        f->>'evidence',
        f->>'data_source'
    FROM jsonb_array_elements(v_result.factors) AS f;

    -- แจ้งเตือนถ้าความเสี่ยงสูง
    IF v_result.calculated_level = 'high' AND
       (v_previous_level IS NULL OR v_previous_level != 'high') THEN
        PERFORM notify_risk_alert(p_student_id, v_assessment_id);
    END IF;

    RETURN v_assessment_id;
END;
$$;


-- ===================================================================
-- RISK ALERT NOTIFICATION
-- ===================================================================

CREATE OR REPLACE FUNCTION notify_risk_alert(
    p_student_id uuid,
    p_assessment_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_student_name text;
    v_school_id uuid;
    v_recipient RECORD;
BEGIN
    -- ดึงชื่อนักเรียน
    SELECT
        first_name || ' ' || last_name,
        school_id
    INTO v_student_name, v_school_id
    FROM students WHERE id = p_student_id;

    -- แจ้งเตือนครูประจำชั้น
    FOR v_recipient IN
        SELECT DISTINCT c.homeroom_teacher_id AS user_id
        FROM classroom_students cs
        JOIN classrooms c ON cs.classroom_id = c.id
        JOIN semesters s ON cs.semester_id = s.id
        WHERE cs.student_id = p_student_id
          AND cs.is_active = true
          AND s.is_current = true
          AND c.homeroom_teacher_id IS NOT NULL
    LOOP
        INSERT INTO notifications (
            recipient_id, type, title, message,
            reference_type, reference_id
        ) VALUES (
            v_recipient.user_id,
            'risk_alert',
            '⚠️ แจ้งเตือนนักเรียนเสี่ยงสูง',
            format('นักเรียน %s ได้รับการประเมินว่ามีความเสี่ยงสูง กรุณาตรวจสอบและดำเนินการช่วยเหลือ', v_student_name),
            'risk_assessment',
            p_assessment_id
        );
    END LOOP;

    -- แจ้งเตือน Counselor และ Director
    FOR v_recipient IN
        SELECT id AS user_id
        FROM profiles
        WHERE school_id = v_school_id
          AND role IN ('counselor', 'director')
          AND is_active = true
    LOOP
        INSERT INTO notifications (
            recipient_id, type, title, message,
            reference_type, reference_id
        ) VALUES (
            v_recipient.user_id,
            'risk_alert',
            '⚠️ แจ้งเตือนนักเรียนเสี่ยงสูง',
            format('นักเรียน %s ได้รับการประเมินว่ามีความเสี่ยงสูง', v_student_name),
            'risk_assessment',
            p_assessment_id
        );
    END LOOP;
END;
$$;


-- ===================================================================
-- BATCH RISK CALCULATION FOR ENTIRE SCHOOL
-- ===================================================================

CREATE OR REPLACE FUNCTION batch_calculate_risk_scores(
    p_school_id uuid,
    p_semester_id uuid
)
RETURNS TABLE (
    student_id uuid,
    student_name text,
    risk_score integer,
    risk_level risk_level
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_student RECORD;
    v_assessment_id uuid;
    v_result RECORD;
BEGIN
    FOR v_student IN
        SELECT s.id, s.first_name || ' ' || s.last_name AS full_name
        FROM students s
        JOIN classroom_students cs ON cs.student_id = s.id
        WHERE s.school_id = p_school_id
          AND s.status = 'active'
          AND cs.semester_id = p_semester_id
          AND cs.is_active = true
    LOOP
        SELECT * INTO v_result
        FROM calculate_risk_score(v_student.id, p_semester_id);

        v_assessment_id := upsert_risk_assessment(v_student.id, p_semester_id);

        student_id := v_student.id;
        student_name := v_student.full_name;
        risk_score := v_result.total_score;
        risk_level := v_result.calculated_level;
        RETURN NEXT;
    END LOOP;
END;
$$;


-- ===================================================================
-- AUTO-CREATE PROFILE ON USER SIGNUP
-- ===================================================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (
        id,
        school_id,
        role,
        first_name,
        last_name,
        email
    ) VALUES (
        NEW.id,
        (NEW.raw_user_meta_data->>'school_id')::uuid,
        COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'subject_teacher'),
        COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
        NEW.email
    );
    RETURN NEW;
END;
$$;


-- ===================================================================
-- DASHBOARD SUMMARY FUNCTION
-- ===================================================================

CREATE OR REPLACE FUNCTION get_dashboard_summary(
    p_school_id uuid,
    p_semester_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_result jsonb;
BEGIN
    SELECT jsonb_build_object(
        -- จำนวนนักเรียนทั้งหมด (active)
        'total_students', (
            SELECT COUNT(DISTINCT cs.student_id)
            FROM classroom_students cs
            JOIN classrooms c ON cs.classroom_id = c.id
            WHERE c.school_id = p_school_id
              AND cs.semester_id = p_semester_id
              AND cs.is_active = true
        ),
        -- จำนวนนักเรียนเสี่ยงสูง
        'high_risk_count', (
            SELECT COUNT(*)
            FROM risk_assessments ra
            JOIN students s ON ra.student_id = s.id
            WHERE s.school_id = p_school_id
              AND ra.semester_id = p_semester_id
              AND ra.risk_level = 'high'
        ),
        -- จำนวนนักเรียนเฝ้าระวัง
        'watch_count', (
            SELECT COUNT(*)
            FROM risk_assessments ra
            JOIN students s ON ra.student_id = s.id
            WHERE s.school_id = p_school_id
              AND ra.semester_id = p_semester_id
              AND ra.risk_level = 'watch'
        ),
        -- อัตราการเข้าเรียนวันนี้
        'today_attendance_rate', (
            SELECT
                CASE WHEN COUNT(*) > 0
                THEN ROUND(
                    COUNT(*) FILTER (WHERE status = 'present') * 100.0 / COUNT(*),
                    1
                )
                ELSE 0 END
            FROM attendance_records ar
            JOIN students s ON ar.student_id = s.id
            WHERE s.school_id = p_school_id
              AND ar.date = CURRENT_DATE
        ),
        -- จำนวนการเยี่ยมบ้านในภาคเรียนนี้
        'home_visit_count', (
            SELECT COUNT(*)
            FROM home_visits hv
            JOIN students s ON hv.student_id = s.id
            WHERE s.school_id = p_school_id
              AND hv.semester_id = p_semester_id
        ),
        -- จำนวน IDP ที่กำลังดำเนินการ
        'active_plans_count', (
            SELECT COUNT(*)
            FROM development_plans dp
            JOIN students s ON dp.student_id = s.id
            WHERE s.school_id = p_school_id
              AND dp.semester_id = p_semester_id
              AND dp.status = 'active'
        ),
        -- จำนวนการช่วยเหลือที่ค้างอยู่
        'pending_support_count', (
            SELECT COUNT(*)
            FROM support_records sr
            JOIN students s ON sr.student_id = s.id
            WHERE s.school_id = p_school_id
              AND sr.semester_id = p_semester_id
              AND sr.status IN ('pending', 'in_progress')
        ),
        -- จำนวนครู
        'total_teachers', (
            SELECT COUNT(*)
            FROM profiles
            WHERE school_id = p_school_id
              AND is_active = true
              AND role != 'admin'
        )
    ) INTO v_result;

    RETURN v_result;
END;
$$;


-- ===================================================================
-- GENERIC AUDIT LOG FUNCTION
-- ===================================================================

CREATE OR REPLACE FUNCTION log_audit_event()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_school_id uuid;
    v_old_data jsonb;
    v_new_data jsonb;
    v_action audit_action;
    v_record_id uuid;
BEGIN
    -- กำหนด action
    IF TG_OP = 'INSERT' THEN
        v_action := 'INSERT';
        v_new_data := to_jsonb(NEW);
        v_record_id := NEW.id;
    ELSIF TG_OP = 'UPDATE' THEN
        v_action := 'UPDATE';
        v_old_data := to_jsonb(OLD);
        v_new_data := to_jsonb(NEW);
        v_record_id := NEW.id;
    ELSIF TG_OP = 'DELETE' THEN
        v_action := 'DELETE';
        v_old_data := to_jsonb(OLD);
        v_record_id := OLD.id;
    END IF;

    -- ดึง school_id จาก user profile
    SELECT school_id INTO v_school_id
    FROM profiles WHERE id = auth.uid();

    INSERT INTO audit_logs (
        user_id, school_id, action, table_name,
        record_id, old_data, new_data
    ) VALUES (
        auth.uid(), v_school_id, v_action, TG_TABLE_NAME,
        v_record_id, v_old_data, v_new_data
    );

    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    END IF;
    RETURN NEW;
END;
$$;


-- ===================================================================
-- TRIGGERS
-- ===================================================================

-- สร้างโปรไฟล์อัตโนมัติเมื่อสมัครสมาชิก
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();


-- ฟังก์ชันอัปเดต updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

-- สร้าง Trigger สำหรับทุกตารางที่มี updated_at
DO $$
DECLARE
    t text;
BEGIN
    FOR t IN
        SELECT unnest(ARRAY[
            'schools', 'academic_years', 'semesters', 'profiles',
            'students', 'guardians', 'classrooms', 'classroom_subjects',
            'attendance_records', 'academic_scores', 'basic_skills',
            'behavior_records', 'assignment_submissions',
            'home_visits', 'support_records',
            'risk_assessments', 'development_plans',
            'development_goals', 'development_activities',
            'development_evaluations', 'system_settings', 'subjects'
        ])
    LOOP
        EXECUTE format(
            'CREATE TRIGGER set_updated_at
             BEFORE UPDATE ON %I
             FOR EACH ROW
             EXECUTE FUNCTION update_updated_at_column();',
            t
        );
    END LOOP;
END;
$$;


-- แจ้งเตือนเมื่อนักเรียนขาดเรียน 3 วันติดต่อกัน
CREATE OR REPLACE FUNCTION check_consecutive_absence()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_consecutive integer;
    v_student_name text;
    v_homeroom_teacher_id uuid;
BEGIN
    IF NEW.status != 'absent' THEN
        RETURN NEW;
    END IF;

    -- นับจำนวนวันขาดเรียนติดต่อกัน
    WITH consecutive_absences AS (
        SELECT date,
               date - (ROW_NUMBER() OVER (ORDER BY date))::integer AS grp
        FROM attendance_records
        WHERE student_id = NEW.student_id
          AND classroom_id = NEW.classroom_id
          AND status = 'absent'
          AND date <= NEW.date
        ORDER BY date DESC
    )
    SELECT COUNT(*) INTO v_consecutive
    FROM consecutive_absences
    WHERE grp = (SELECT grp FROM consecutive_absences WHERE date = NEW.date);

    -- แจ้งเตือนถ้าขาด 3 วันติดต่อกัน
    IF v_consecutive >= 3 THEN
        SELECT first_name || ' ' || last_name INTO v_student_name
        FROM students WHERE id = NEW.student_id;

        SELECT homeroom_teacher_id INTO v_homeroom_teacher_id
        FROM classrooms WHERE id = NEW.classroom_id;

        IF v_homeroom_teacher_id IS NOT NULL THEN
            INSERT INTO notifications (
                recipient_id, type, title, message,
                reference_type, reference_id
            ) VALUES (
                v_homeroom_teacher_id,
                'attendance_alert',
                '🚨 แจ้งเตือนขาดเรียนต่อเนื่อง',
                format('นักเรียน %s ขาดเรียนติดต่อกัน %s วัน กรุณาติดตามและติดต่อผู้ปกครอง',
                       v_student_name, v_consecutive),
                'student',
                NEW.student_id
            );
        END IF;
    END IF;

    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_check_consecutive_absence
    AFTER INSERT ON attendance_records
    FOR EACH ROW
    EXECUTE FUNCTION check_consecutive_absence();


-- สร้าง Audit Trigger สำหรับตารางที่ต้องการตรวจสอบ
DO $$
DECLARE
    t text;
BEGIN
    FOR t IN
        SELECT unnest(ARRAY[
            'students', 'risk_assessments', 'support_records',
            'development_plans', 'home_visits', 'profiles'
        ])
    LOOP
        EXECUTE format(
            'CREATE TRIGGER audit_%s
             AFTER INSERT OR UPDATE OR DELETE ON %I
             FOR EACH ROW
             EXECUTE FUNCTION log_audit_event();',
            t, t
        );
    END LOOP;
END;
$$;


-- อัปเดต overall_progress ของ development_plans เมื่อ goal เปลี่ยนสถานะ
CREATE OR REPLACE FUNCTION update_plan_progress()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_plan_id uuid;
    v_avg_progress integer;
BEGIN
    v_plan_id := COALESCE(NEW.plan_id, OLD.plan_id);

    SELECT COALESCE(AVG(progress), 0)::integer INTO v_avg_progress
    FROM development_goals
    WHERE plan_id = v_plan_id;

    UPDATE development_plans
    SET overall_progress = v_avg_progress
    WHERE id = v_plan_id;

    RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER trg_update_plan_progress
    AFTER INSERT OR UPDATE OR DELETE ON development_goals
    FOR EACH ROW
    EXECUTE FUNCTION update_plan_progress();
