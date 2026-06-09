-- ===================================================================
-- INDEXES
-- ===================================================================

-- ==================== schools ====================
CREATE INDEX idx_schools_code ON schools (school_code);
CREATE INDEX idx_schools_active ON schools (is_active) WHERE is_active = true;

-- ==================== academic_years ====================
CREATE INDEX idx_academic_years_school ON academic_years (school_id);
CREATE INDEX idx_academic_years_year ON academic_years (school_id, year);
-- Partial unique index สำหรับ is_current (ดูที่ Section 4.1.2)

-- ==================== semesters ====================
CREATE INDEX idx_semesters_academic_year ON semesters (academic_year_id);
CREATE INDEX idx_semesters_current ON semesters (is_current) WHERE is_current = true;

-- ==================== profiles ====================
CREATE INDEX idx_profiles_school ON profiles (school_id);
CREATE INDEX idx_profiles_role ON profiles (school_id, role);
CREATE INDEX idx_profiles_active ON profiles (school_id, is_active) WHERE is_active = true;
CREATE INDEX idx_profiles_email ON profiles (email);

-- ==================== students ====================
CREATE INDEX idx_students_school ON students (school_id);
CREATE INDEX idx_students_status ON students (school_id, status);
CREATE INDEX idx_students_name ON students (school_id, first_name, last_name);
CREATE INDEX idx_students_national_id ON students (national_id) WHERE national_id IS NOT NULL;
CREATE INDEX idx_students_code ON students (school_id, student_code);

-- ==================== guardians ====================
CREATE INDEX idx_guardians_school ON guardians (school_id);
CREATE INDEX idx_guardians_name ON guardians (first_name, last_name);

-- ==================== student_guardians ====================
CREATE INDEX idx_student_guardians_student ON student_guardians (student_id);
CREATE INDEX idx_student_guardians_guardian ON student_guardians (guardian_id);
CREATE INDEX idx_student_guardians_primary ON student_guardians (student_id)
    WHERE is_primary = true;

-- ==================== classrooms ====================
CREATE INDEX idx_classrooms_school ON classrooms (school_id);
CREATE INDEX idx_classrooms_year ON classrooms (academic_year_id);
CREATE INDEX idx_classrooms_teacher ON classrooms (homeroom_teacher_id);
CREATE INDEX idx_classrooms_grade ON classrooms (academic_year_id, grade_level);

-- ==================== classroom_students ====================
CREATE INDEX idx_classroom_students_classroom ON classroom_students (classroom_id);
CREATE INDEX idx_classroom_students_student ON classroom_students (student_id);
CREATE INDEX idx_classroom_students_semester ON classroom_students (semester_id);
CREATE INDEX idx_classroom_students_active ON classroom_students (classroom_id, is_active)
    WHERE is_active = true;

-- ==================== subjects ====================
CREATE INDEX idx_subjects_school ON subjects (school_id);
CREATE INDEX idx_subjects_grade ON subjects (school_id, grade_level);
CREATE INDEX idx_subjects_area ON subjects (school_id, learning_area);

-- ==================== classroom_subjects ====================
CREATE INDEX idx_classroom_subjects_classroom ON classroom_subjects (classroom_id);
CREATE INDEX idx_classroom_subjects_teacher ON classroom_subjects (teacher_id);
CREATE INDEX idx_classroom_subjects_semester ON classroom_subjects (semester_id);

-- ==================== attendance_records ====================
CREATE INDEX idx_attendance_student ON attendance_records (student_id);
CREATE INDEX idx_attendance_classroom ON attendance_records (classroom_id);
CREATE INDEX idx_attendance_date ON attendance_records (date);
CREATE INDEX idx_attendance_status ON attendance_records (student_id, status);
CREATE INDEX idx_attendance_student_date ON attendance_records (student_id, date DESC);
-- สำหรับรายงานขาดเรียนประจำเดือน
CREATE INDEX idx_attendance_absent_monthly
    ON attendance_records (student_id, date)
    WHERE status = 'absent';

-- ==================== academic_scores ====================
CREATE INDEX idx_academic_scores_student ON academic_scores (student_id);
CREATE INDEX idx_academic_scores_subject ON academic_scores (classroom_subject_id);
CREATE INDEX idx_academic_scores_semester ON academic_scores (semester_id);
CREATE INDEX idx_academic_scores_grade ON academic_scores (student_id, grade_point);

-- ==================== basic_skills ====================
CREATE INDEX idx_basic_skills_student ON basic_skills (student_id);
CREATE INDEX idx_basic_skills_semester ON basic_skills (semester_id);

-- ==================== behavior_records ====================
CREATE INDEX idx_behavior_student ON behavior_records (student_id);
CREATE INDEX idx_behavior_date ON behavior_records (student_id, date DESC);
CREATE INDEX idx_behavior_type ON behavior_records (student_id, behavior_type);
CREATE INDEX idx_behavior_reporter ON behavior_records (reported_by);
CREATE INDEX idx_behavior_negative ON behavior_records (student_id, date)
    WHERE behavior_type = 'negative';

-- ==================== assignment_submissions ====================
CREATE INDEX idx_assignments_student ON assignment_submissions (student_id);
CREATE INDEX idx_assignments_subject ON assignment_submissions (classroom_subject_id);
CREATE INDEX idx_assignments_status ON assignment_submissions (student_id, status);
CREATE INDEX idx_assignments_not_submitted ON assignment_submissions (student_id)
    WHERE status = 'not_submitted';

-- ==================== home_visits ====================
CREATE INDEX idx_home_visits_student ON home_visits (student_id);
CREATE INDEX idx_home_visits_visitor ON home_visits (visitor_id);
CREATE INDEX idx_home_visits_semester ON home_visits (semester_id);
CREATE INDEX idx_home_visits_date ON home_visits (visit_date DESC);
CREATE INDEX idx_home_visits_family_problem ON home_visits (student_id)
    WHERE has_family_problem = true;

-- ==================== home_visit_images ====================
CREATE INDEX idx_home_visit_images_visit ON home_visit_images (home_visit_id);

-- ==================== support_records ====================
CREATE INDEX idx_support_student ON support_records (student_id);
CREATE INDEX idx_support_semester ON support_records (semester_id);
CREATE INDEX idx_support_status ON support_records (status);
CREATE INDEX idx_support_type ON support_records (student_id, support_type);
CREATE INDEX idx_support_provider ON support_records (provided_by);
CREATE INDEX idx_support_pending ON support_records (status)
    WHERE status IN ('pending', 'in_progress');

-- ==================== support_followups ====================
CREATE INDEX idx_followups_record ON support_followups (support_record_id);
CREATE INDEX idx_followups_date ON support_followups (followup_date DESC);

-- ==================== risk_assessments ====================
CREATE INDEX idx_risk_student ON risk_assessments (student_id);
CREATE INDEX idx_risk_semester ON risk_assessments (semester_id);
CREATE INDEX idx_risk_level ON risk_assessments (risk_level);
CREATE INDEX idx_risk_score ON risk_assessments (risk_score DESC);
-- สำหรับ Dashboard แสดงนักเรียนที่มีความเสี่ยงสูง
CREATE INDEX idx_risk_high ON risk_assessments (semester_id, risk_level)
    WHERE risk_level IN ('watch', 'high');

-- ==================== risk_factors ====================
CREATE INDEX idx_risk_factors_assessment ON risk_factors (risk_assessment_id);
CREATE INDEX idx_risk_factors_key ON risk_factors (factor_key);

-- ==================== development_plans ====================
CREATE INDEX idx_plans_student ON development_plans (student_id);
CREATE INDEX idx_plans_semester ON development_plans (semester_id);
CREATE INDEX idx_plans_status ON development_plans (status);
CREATE INDEX idx_plans_creator ON development_plans (created_by);

-- ==================== development_goals ====================
CREATE INDEX idx_goals_plan ON development_goals (plan_id);
CREATE INDEX idx_goals_status ON development_goals (status);

-- ==================== development_activities ====================
CREATE INDEX idx_activities_goal ON development_activities (goal_id);

-- ==================== development_evaluations ====================
CREATE INDEX idx_evaluations_plan ON development_evaluations (plan_id);
CREATE INDEX idx_evaluations_date ON development_evaluations (evaluation_date DESC);

-- ==================== notifications ====================
CREATE INDEX idx_notifications_recipient ON notifications (recipient_id);
CREATE INDEX idx_notifications_unread ON notifications (recipient_id, is_read)
    WHERE is_read = false;
CREATE INDEX idx_notifications_type ON notifications (recipient_id, type);
CREATE INDEX idx_notifications_created ON notifications (created_at DESC);

-- ==================== system_settings ====================
CREATE INDEX idx_settings_school ON system_settings (school_id);
CREATE INDEX idx_settings_category ON system_settings (school_id, category);

-- ==================== audit_logs ====================
CREATE INDEX idx_audit_user ON audit_logs (user_id);
CREATE INDEX idx_audit_school ON audit_logs (school_id);
CREATE INDEX idx_audit_table ON audit_logs (table_name);
CREATE INDEX idx_audit_action ON audit_logs (action);
CREATE INDEX idx_audit_created ON audit_logs (created_at DESC);
CREATE INDEX idx_audit_record ON audit_logs (table_name, record_id);
