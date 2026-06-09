-- ===================================================================
-- RLS HELPER FUNCTIONS
-- ===================================================================

-- ดึง school_id ของ user ปัจจุบัน
CREATE OR REPLACE FUNCTION get_user_school_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT school_id FROM profiles WHERE id = auth.uid();
$$;

-- ดึง role ของ user ปัจจุบัน
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS user_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT role FROM profiles WHERE id = auth.uid();
$$;

-- ตรวจสอบว่า user เป็นครูประจำชั้นของนักเรียนหรือไม่
CREATE OR REPLACE FUNCTION is_homeroom_teacher_of_student(p_student_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM classroom_students cs
        JOIN classrooms c ON cs.classroom_id = c.id
        JOIN semesters s ON cs.semester_id = s.id
        WHERE cs.student_id = p_student_id
          AND cs.is_active = true
          AND s.is_current = true
          AND (c.homeroom_teacher_id = auth.uid() OR c.co_teacher_id = auth.uid())
    );
$$;

-- ตรวจสอบว่า user เป็นครูผู้สอนของนักเรียนหรือไม่
CREATE OR REPLACE FUNCTION is_subject_teacher_of_student(p_student_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM classroom_students cs
        JOIN classrooms c ON cs.classroom_id = c.id
        JOIN classroom_subjects csub ON csub.classroom_id = c.id
        JOIN semesters s ON cs.semester_id = s.id
        WHERE cs.student_id = p_student_id
          AND cs.is_active = true
          AND s.is_current = true
          AND csub.teacher_id = auth.uid()
    );
$$;

-- ตรวจสอบว่า user มีสิทธิ์เข้าถึงข้อมูลนักเรียนคนนี้หรือไม่
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


-- ===================================================================
-- ENABLE RLS ON ALL TABLES
-- ===================================================================
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE academic_years ENABLE ROW LEVEL SECURITY;
ALTER TABLE semesters ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE guardians ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_guardians ENABLE ROW LEVEL SECURITY;
ALTER TABLE classrooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE classroom_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE classroom_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE academic_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE basic_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE behavior_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignment_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE home_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE home_visit_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_followups ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_factors ENABLE ROW LEVEL SECURITY;
ALTER TABLE development_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE development_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE development_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE development_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- ===================================================================
-- RLS POLICIES
-- ===================================================================

-- ==================== schools ====================
-- ทุก role อ่านข้อมูลโรงเรียนตัวเองได้
CREATE POLICY "Users can view own school"
    ON schools FOR SELECT
    USING (id = get_user_school_id());

-- เฉพาะ Admin แก้ไขข้อมูลโรงเรียน
CREATE POLICY "Admin can update school"
    ON schools FOR UPDATE
    USING (id = get_user_school_id() AND get_user_role() = 'admin');

-- ==================== academic_years ====================
CREATE POLICY "Users can view own school academic years"
    ON academic_years FOR SELECT
    USING (school_id = get_user_school_id());

CREATE POLICY "Admin can manage academic years"
    ON academic_years FOR ALL
    USING (school_id = get_user_school_id() AND get_user_role() = 'admin');

-- ==================== semesters ====================
CREATE POLICY "Users can view semesters"
    ON semesters FOR SELECT
    USING (
        academic_year_id IN (
            SELECT id FROM academic_years WHERE school_id = get_user_school_id()
        )
    );

CREATE POLICY "Admin can manage semesters"
    ON semesters FOR ALL
    USING (
        academic_year_id IN (
            SELECT id FROM academic_years WHERE school_id = get_user_school_id()
        )
        AND get_user_role() = 'admin'
    );

-- ==================== profiles ====================
-- ทุกคนดูโปรไฟล์ในโรงเรียนเดียวกันได้
CREATE POLICY "Users can view profiles in same school"
    ON profiles FOR SELECT
    USING (school_id = get_user_school_id());

-- แก้ไขโปรไฟล์ตัวเอง
CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

-- Admin จัดการโปรไฟล์ทั้งหมด
CREATE POLICY "Admin can manage all profiles"
    ON profiles FOR ALL
    USING (school_id = get_user_school_id() AND get_user_role() = 'admin');

-- ==================== students ====================
-- อ่านข้อมูลนักเรียน (ตาม role)
CREATE POLICY "View students based on role"
    ON students FOR SELECT
    USING (
        school_id = get_user_school_id()
        AND (
            get_user_role() IN ('admin', 'director', 'counselor')
            OR can_access_student(id)
        )
    );

-- เพิ่ม/แก้ไขนักเรียน
CREATE POLICY "Admin and homeroom can manage students"
    ON students FOR INSERT
    WITH CHECK (
        school_id = get_user_school_id()
        AND get_user_role() IN ('admin', 'homeroom_teacher', 'counselor')
    );

CREATE POLICY "Admin and homeroom can update students"
    ON students FOR UPDATE
    USING (
        school_id = get_user_school_id()
        AND (
            get_user_role() IN ('admin', 'counselor')
            OR (get_user_role() = 'homeroom_teacher' AND can_access_student(id))
        )
    );

-- ==================== guardians ====================
CREATE POLICY "View guardians based on role"
    ON guardians FOR SELECT
    USING (school_id = get_user_school_id());

CREATE POLICY "Manage guardians"
    ON guardians FOR ALL
    USING (
        school_id = get_user_school_id()
        AND get_user_role() IN ('admin', 'homeroom_teacher', 'counselor')
    );

-- ==================== student_guardians ====================
CREATE POLICY "View student_guardians"
    ON student_guardians FOR SELECT
    USING (can_access_student(student_id));

CREATE POLICY "Manage student_guardians"
    ON student_guardians FOR ALL
    USING (
        get_user_role() IN ('admin', 'homeroom_teacher', 'counselor')
        AND can_access_student(student_id)
    );

-- ==================== classrooms ====================
CREATE POLICY "View classrooms in school"
    ON classrooms FOR SELECT
    USING (school_id = get_user_school_id());

CREATE POLICY "Admin can manage classrooms"
    ON classrooms FOR ALL
    USING (
        school_id = get_user_school_id()
        AND get_user_role() IN ('admin', 'director')
    );

-- ==================== classroom_students ====================
CREATE POLICY "View classroom_students"
    ON classroom_students FOR SELECT
    USING (
        classroom_id IN (
            SELECT id FROM classrooms WHERE school_id = get_user_school_id()
        )
    );

CREATE POLICY "Admin and homeroom manage enrollment"
    ON classroom_students FOR ALL
    USING (
        classroom_id IN (
            SELECT id FROM classrooms WHERE school_id = get_user_school_id()
        )
        AND get_user_role() IN ('admin', 'homeroom_teacher')
    );

-- ==================== subjects ====================
CREATE POLICY "View subjects in school"
    ON subjects FOR SELECT
    USING (school_id = get_user_school_id());

CREATE POLICY "Admin can manage subjects"
    ON subjects FOR ALL
    USING (
        school_id = get_user_school_id()
        AND get_user_role() = 'admin'
    );

-- ==================== classroom_subjects ====================
CREATE POLICY "View classroom_subjects"
    ON classroom_subjects FOR SELECT
    USING (
        classroom_id IN (
            SELECT id FROM classrooms WHERE school_id = get_user_school_id()
        )
    );

CREATE POLICY "Admin can manage classroom_subjects"
    ON classroom_subjects FOR ALL
    USING (
        classroom_id IN (
            SELECT id FROM classrooms WHERE school_id = get_user_school_id()
        )
        AND get_user_role() IN ('admin', 'director')
    );

-- ==================== attendance_records ====================
CREATE POLICY "View attendance based on role"
    ON attendance_records FOR SELECT
    USING (can_access_student(student_id));

CREATE POLICY "Record attendance"
    ON attendance_records FOR INSERT
    WITH CHECK (
        can_access_student(student_id)
        AND get_user_role() IN ('admin', 'homeroom_teacher', 'subject_teacher')
    );

CREATE POLICY "Update attendance"
    ON attendance_records FOR UPDATE
    USING (
        can_access_student(student_id)
        AND (
            get_user_role() = 'admin'
            OR recorded_by = auth.uid()
        )
    );

-- ==================== academic_scores ====================
CREATE POLICY "View scores based on role"
    ON academic_scores FOR SELECT
    USING (can_access_student(student_id));

CREATE POLICY "Manage scores"
    ON academic_scores FOR ALL
    USING (
        can_access_student(student_id)
        AND get_user_role() IN ('admin', 'subject_teacher', 'homeroom_teacher')
    );

-- ==================== basic_skills ====================
CREATE POLICY "View basic_skills based on role"
    ON basic_skills FOR SELECT
    USING (can_access_student(student_id));

CREATE POLICY "Manage basic_skills"
    ON basic_skills FOR ALL
    USING (
        can_access_student(student_id)
        AND get_user_role() IN ('admin', 'homeroom_teacher', 'subject_teacher')
    );

-- ==================== behavior_records ====================
CREATE POLICY "View behavior based on role"
    ON behavior_records FOR SELECT
    USING (can_access_student(student_id));

CREATE POLICY "Record behavior"
    ON behavior_records FOR INSERT
    WITH CHECK (
        can_access_student(student_id)
        AND get_user_role() IN ('admin', 'homeroom_teacher', 'subject_teacher', 'counselor')
    );

CREATE POLICY "Update own behavior records"
    ON behavior_records FOR UPDATE
    USING (
        get_user_role() = 'admin'
        OR reported_by = auth.uid()
    );

-- ==================== assignment_submissions ====================
CREATE POLICY "View assignments based on role"
    ON assignment_submissions FOR SELECT
    USING (can_access_student(student_id));

CREATE POLICY "Manage assignments"
    ON assignment_submissions FOR ALL
    USING (
        can_access_student(student_id)
        AND get_user_role() IN ('admin', 'subject_teacher', 'homeroom_teacher')
    );

-- ==================== home_visits ====================
CREATE POLICY "View home_visits based on role"
    ON home_visits FOR SELECT
    USING (
        can_access_student(student_id)
        AND get_user_role() IN ('admin', 'director', 'homeroom_teacher', 'counselor')
    );

CREATE POLICY "Manage home_visits"
    ON home_visits FOR ALL
    USING (
        can_access_student(student_id)
        AND get_user_role() IN ('admin', 'homeroom_teacher', 'counselor')
    );

-- ==================== home_visit_images ====================
CREATE POLICY "View visit images"
    ON home_visit_images FOR SELECT
    USING (
        home_visit_id IN (
            SELECT id FROM home_visits
            WHERE can_access_student(student_id)
        )
    );

CREATE POLICY "Manage visit images"
    ON home_visit_images FOR ALL
    USING (
        home_visit_id IN (
            SELECT id FROM home_visits
            WHERE visitor_id = auth.uid()
                  OR get_user_role() = 'admin'
        )
    );

-- ==================== support_records ====================
CREATE POLICY "View support based on role"
    ON support_records FOR SELECT
    USING (
        can_access_student(student_id)
        AND get_user_role() IN ('admin', 'director', 'homeroom_teacher', 'counselor')
    );

CREATE POLICY "Manage support records"
    ON support_records FOR ALL
    USING (
        can_access_student(student_id)
        AND get_user_role() IN ('admin', 'homeroom_teacher', 'counselor')
    );

-- ==================== support_followups ====================
CREATE POLICY "View followups"
    ON support_followups FOR SELECT
    USING (
        support_record_id IN (
            SELECT id FROM support_records
            WHERE can_access_student(student_id)
        )
    );

CREATE POLICY "Manage followups"
    ON support_followups FOR ALL
    USING (
        get_user_role() IN ('admin', 'homeroom_teacher', 'counselor')
    );

-- ==================== risk_assessments ====================
CREATE POLICY "View risk based on role"
    ON risk_assessments FOR SELECT
    USING (
        can_access_student(student_id)
        AND get_user_role() IN ('admin', 'director', 'homeroom_teacher', 'counselor')
    );

CREATE POLICY "Manage risk assessments"
    ON risk_assessments FOR ALL
    USING (
        can_access_student(student_id)
        AND get_user_role() IN ('admin', 'homeroom_teacher', 'counselor')
    );

-- ==================== risk_factors ====================
CREATE POLICY "View risk factors"
    ON risk_factors FOR SELECT
    USING (
        risk_assessment_id IN (
            SELECT id FROM risk_assessments
            WHERE can_access_student(student_id)
        )
    );

CREATE POLICY "Manage risk factors"
    ON risk_factors FOR ALL
    USING (
        get_user_role() IN ('admin', 'homeroom_teacher', 'counselor')
    );

-- ==================== development_plans ====================
CREATE POLICY "View plans based on role"
    ON development_plans FOR SELECT
    USING (
        can_access_student(student_id)
        AND get_user_role() IN ('admin', 'director', 'homeroom_teacher', 'counselor')
    );

CREATE POLICY "Manage development plans"
    ON development_plans FOR ALL
    USING (
        can_access_student(student_id)
        AND get_user_role() IN ('admin', 'homeroom_teacher', 'counselor')
    );

-- ==================== development_goals ====================
CREATE POLICY "View goals"
    ON development_goals FOR SELECT
    USING (
        plan_id IN (
            SELECT id FROM development_plans
            WHERE can_access_student(student_id)
        )
    );

CREATE POLICY "Manage goals"
    ON development_goals FOR ALL
    USING (
        get_user_role() IN ('admin', 'homeroom_teacher', 'counselor')
    );

-- ==================== development_activities ====================
CREATE POLICY "View activities"
    ON development_activities FOR SELECT
    USING (
        goal_id IN (
            SELECT id FROM development_goals
            WHERE plan_id IN (
                SELECT id FROM development_plans
                WHERE can_access_student(student_id)
            )
        )
    );

CREATE POLICY "Manage activities"
    ON development_activities FOR ALL
    USING (
        get_user_role() IN ('admin', 'homeroom_teacher', 'counselor')
    );

-- ==================== development_evaluations ====================
CREATE POLICY "View evaluations"
    ON development_evaluations FOR SELECT
    USING (
        plan_id IN (
            SELECT id FROM development_plans
            WHERE can_access_student(student_id)
        )
    );

CREATE POLICY "Manage evaluations"
    ON development_evaluations FOR ALL
    USING (
        get_user_role() IN ('admin', 'director', 'homeroom_teacher', 'counselor')
    );

-- ==================== notifications ====================
CREATE POLICY "View own notifications"
    ON notifications FOR SELECT
    USING (recipient_id = auth.uid());

CREATE POLICY "Update own notifications (mark read)"
    ON notifications FOR UPDATE
    USING (recipient_id = auth.uid());

CREATE POLICY "System can insert notifications"
    ON notifications FOR INSERT
    WITH CHECK (true); -- จัดการผ่าน Service Role Key

-- ==================== system_settings ====================
CREATE POLICY "View system settings"
    ON system_settings FOR SELECT
    USING (school_id = get_user_school_id());

CREATE POLICY "Admin can manage settings"
    ON system_settings FOR ALL
    USING (
        school_id = get_user_school_id()
        AND get_user_role() = 'admin'
    );

-- ==================== audit_logs ====================
-- เฉพาะ Admin อ่าน Audit Log
CREATE POLICY "Admin can view audit logs"
    ON audit_logs FOR SELECT
    USING (
        school_id = get_user_school_id()
        AND get_user_role() = 'admin'
    );

-- Insert ผ่าน Trigger / Service Role เท่านั้น
CREATE POLICY "System can insert audit logs"
    ON audit_logs FOR INSERT
    WITH CHECK (true);
