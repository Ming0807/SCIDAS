-- ===================================================================
-- MIGRATION: 001_create_schema.sql
-- ระบบสารสนเทศเพื่อวิเคราะห์และดูแลช่วยเหลือนักเรียนรายบุคคล
-- สำหรับโรงเรียนขนาดเล็ก
-- ===================================================================

-- เปิด Extensions ที่จำเป็น
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- -------------------------------------------------------------------
-- ENUM TYPES
-- -------------------------------------------------------------------

CREATE TYPE user_role AS ENUM (
    'admin', 'director', 'homeroom_teacher', 'counselor', 'subject_teacher'
);

CREATE TYPE gender_type AS ENUM ('male', 'female', 'other');

CREATE TYPE student_status AS ENUM (
    'active', 'graduated', 'transferred', 'dropped_out', 'suspended'
);

CREATE TYPE attendance_status AS ENUM (
    'present', 'absent', 'late', 'leave', 'sick'
);

CREATE TYPE semester_type AS ENUM ('semester_1', 'semester_2');

CREATE TYPE skill_level AS ENUM (
    'excellent', 'good', 'fair', 'poor', 'critical'
);

CREATE TYPE behavior_type AS ENUM ('positive', 'negative', 'neutral');

CREATE TYPE severity_level AS ENUM ('low', 'medium', 'high', 'critical');

CREATE TYPE submission_status AS ENUM (
    'submitted', 'late_submitted', 'not_submitted', 'resubmitted'
);

CREATE TYPE housing_condition AS ENUM ('good', 'moderate', 'poor', 'critical');

CREATE TYPE support_type AS ENUM (
    'academic', 'behavioral', 'emotional', 'financial',
    'health', 'family', 'social', 'other'
);

CREATE TYPE support_status AS ENUM (
    'pending', 'in_progress', 'completed', 'cancelled', 'referred'
);

CREATE TYPE risk_level AS ENUM ('normal', 'watch', 'high');

CREATE TYPE plan_status AS ENUM ('draft', 'active', 'completed', 'cancelled');

CREATE TYPE goal_status AS ENUM (
    'not_started', 'in_progress', 'achieved', 'not_achieved', 'cancelled'
);

CREATE TYPE notification_type AS ENUM (
    'risk_alert', 'attendance_alert', 'assignment_alert',
    'behavior_alert', 'home_visit_reminder', 'plan_review',
    'system', 'general'
);

CREATE TYPE audit_action AS ENUM (
    'INSERT', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'EXPORT', 'IMPORT'
);

CREATE TYPE guardian_relation AS ENUM (
    'father', 'mother', 'grandfather', 'grandmother',
    'uncle', 'aunt', 'sibling', 'other_relative', 'guardian'
);

CREATE TYPE grade_level AS ENUM (
    'p1', 'p2', 'p3', 'p4', 'p5', 'p6',
    'm1', 'm2', 'm3', 'm4', 'm5', 'm6'
);

-- -------------------------------------------------------------------
-- TABLE: schools
-- -------------------------------------------------------------------
CREATE TABLE schools (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name            varchar(255) NOT NULL,
    name_en         varchar(255),
    school_code     varchar(20) UNIQUE NOT NULL,
    address         text,
    subdistrict     varchar(100),
    district        varchar(100),
    province        varchar(100),
    postal_code     varchar(5),
    phone           varchar(20),
    email           varchar(255),
    website         varchar(255),
    logo_url        text,
    director_name   varchar(255),
    school_size     varchar(20) DEFAULT 'small',
    is_active       boolean NOT NULL DEFAULT true,
    created_at      timestamptz NOT NULL DEFAULT now(),
    updated_at      timestamptz NOT NULL DEFAULT now()
);

-- -------------------------------------------------------------------
-- TABLE: academic_years
-- -------------------------------------------------------------------
CREATE TABLE academic_years (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id       uuid NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    year            integer NOT NULL,
    start_date      date NOT NULL,
    end_date        date NOT NULL,
    is_current      boolean NOT NULL DEFAULT false,
    created_at      timestamptz NOT NULL DEFAULT now(),
    updated_at      timestamptz NOT NULL DEFAULT now()
);

-- ปีการศึกษาปัจจุบันได้เพียง 1 ต่อโรงเรียน
CREATE UNIQUE INDEX idx_academic_years_current
    ON academic_years (school_id) WHERE is_current = true;

-- -------------------------------------------------------------------
-- TABLE: semesters
-- -------------------------------------------------------------------
CREATE TABLE semesters (
    school_id uuid NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000' REFERENCES schools(id) ON DELETE CASCADE,
    id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    academic_year_id    uuid NOT NULL REFERENCES academic_years(id) ON DELETE CASCADE,
    semester            semester_type NOT NULL,
    start_date          date NOT NULL,
    end_date            date NOT NULL,
    is_current          boolean NOT NULL DEFAULT false,
    created_at          timestamptz NOT NULL DEFAULT now(),
    updated_at          timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT uq_semester_per_year UNIQUE (academic_year_id, semester)
);

-- -------------------------------------------------------------------
-- TABLE: profiles
-- -------------------------------------------------------------------
CREATE TABLE profiles (
    id              uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    school_id       uuid NOT NULL REFERENCES schools(id),
    role            user_role NOT NULL,
    employee_id     varchar(20),
    prefix          varchar(50),
    first_name      varchar(100) NOT NULL,
    last_name       varchar(100) NOT NULL,
    nickname        varchar(50),
    gender          gender_type,
    phone           varchar(20),
    email           varchar(255) UNIQUE,
    avatar_url      text,
    position        varchar(100),
    department      varchar(100),
    is_active       boolean NOT NULL DEFAULT true,
    last_login_at   timestamptz,
    created_at      timestamptz NOT NULL DEFAULT now(),
    updated_at      timestamptz NOT NULL DEFAULT now()
);

-- -------------------------------------------------------------------
-- TABLE: students
-- -------------------------------------------------------------------
CREATE TABLE students (
    id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id               uuid NOT NULL REFERENCES schools(id),
    student_code            varchar(20) NOT NULL,
    national_id             varchar(13) UNIQUE,
    prefix                  varchar(50),
    first_name              varchar(100) NOT NULL,
    last_name               varchar(100) NOT NULL,
    nickname                varchar(50),
    gender                  gender_type NOT NULL,
    date_of_birth           date NOT NULL,
    blood_type              varchar(5),
    nationality             varchar(50) DEFAULT 'ไทย',
    ethnicity               varchar(50) DEFAULT 'ไทย',
    religion                varchar(50) DEFAULT 'พุทธ',
    address                 text,
    subdistrict             varchar(100),
    district                varchar(100),
    province                varchar(100),
    postal_code             varchar(5),
    latitude                decimal(10,7),
    longitude               decimal(10,7),
    distance_to_school_km   decimal(6,2),
    travel_method           varchar(100),
    photo_url               text,
    medical_conditions      text,
    special_needs           text,
    status                  student_status NOT NULL DEFAULT 'active',
    enrollment_date         date,
    graduation_date         date,
    previous_school         varchar(255),
    created_at              timestamptz NOT NULL DEFAULT now(),
    updated_at              timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT uq_student_code_per_school UNIQUE (school_id, student_code),
    CONSTRAINT chk_national_id_format CHECK (national_id IS NULL OR length(national_id) = 13)
);

-- -------------------------------------------------------------------
-- TABLE: guardians
-- -------------------------------------------------------------------
CREATE TABLE guardians (
    id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id           uuid NOT NULL REFERENCES schools(id),
    national_id         varchar(13) UNIQUE,
    prefix              varchar(50),
    first_name          varchar(100) NOT NULL,
    last_name           varchar(100) NOT NULL,
    gender              gender_type,
    date_of_birth       date,
    phone               varchar(20),
    phone_secondary     varchar(20),
    email               varchar(255),
    occupation          varchar(100),
    monthly_income      decimal(10,2),
    address             text,
    created_at          timestamptz NOT NULL DEFAULT now(),
    updated_at          timestamptz NOT NULL DEFAULT now()
);

-- -------------------------------------------------------------------
-- TABLE: student_guardians (junction)
-- -------------------------------------------------------------------
CREATE TABLE student_guardians (
    school_id uuid NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000' REFERENCES schools(id) ON DELETE CASCADE,
    id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id              uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    guardian_id             uuid NOT NULL REFERENCES guardians(id) ON DELETE CASCADE,
    relation                guardian_relation NOT NULL,
    is_primary              boolean NOT NULL DEFAULT false,
    is_emergency_contact    boolean NOT NULL DEFAULT false,
    can_pickup              boolean NOT NULL DEFAULT true,
    created_at              timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT uq_student_guardian UNIQUE (student_id, guardian_id)
);

-- -------------------------------------------------------------------
-- TABLE: classrooms
-- -------------------------------------------------------------------
CREATE TABLE classrooms (
    id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id               uuid NOT NULL REFERENCES schools(id),
    academic_year_id        uuid NOT NULL REFERENCES academic_years(id),
    grade_level             grade_level NOT NULL,
    section                 integer NOT NULL DEFAULT 1,
    name                    varchar(100) NOT NULL,
    homeroom_teacher_id     uuid REFERENCES profiles(id),
    co_teacher_id           uuid REFERENCES profiles(id),
    max_students            integer DEFAULT 40,
    room_number             varchar(20),
    is_active               boolean NOT NULL DEFAULT true,
    created_at              timestamptz NOT NULL DEFAULT now(),
    updated_at              timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT uq_classroom_per_year UNIQUE (academic_year_id, grade_level, section)
);

-- -------------------------------------------------------------------
-- TABLE: classroom_students
-- -------------------------------------------------------------------
CREATE TABLE classroom_students (
    school_id uuid NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000' REFERENCES schools(id) ON DELETE CASCADE,
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    classroom_id    uuid NOT NULL REFERENCES classrooms(id) ON DELETE CASCADE,
    student_id      uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    semester_id     uuid NOT NULL REFERENCES semesters(id),
    student_number  integer,
    enrolled_at     date NOT NULL DEFAULT CURRENT_DATE,
    is_active       boolean NOT NULL DEFAULT true,
    created_at      timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT uq_student_per_semester UNIQUE (student_id, semester_id)
);

-- -------------------------------------------------------------------
-- TABLE: subjects
-- -------------------------------------------------------------------
CREATE TABLE subjects (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id       uuid NOT NULL REFERENCES schools(id),
    subject_code    varchar(20) NOT NULL,
    name            varchar(255) NOT NULL,
    name_en         varchar(255),
    learning_area   varchar(100),
    grade_level     grade_level,
    credit          decimal(3,1) DEFAULT 1.0,
    hours_per_week  integer DEFAULT 1,
    description     text,
    is_active       boolean NOT NULL DEFAULT true,
    created_at      timestamptz NOT NULL DEFAULT now(),
    updated_at      timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT uq_subject_code_per_school UNIQUE (school_id, subject_code)
);

-- -------------------------------------------------------------------
-- TABLE: classroom_subjects
-- -------------------------------------------------------------------
CREATE TABLE classroom_subjects (
    school_id uuid NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000' REFERENCES schools(id) ON DELETE CASCADE,
    id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    classroom_id        uuid NOT NULL REFERENCES classrooms(id) ON DELETE CASCADE,
    subject_id          uuid NOT NULL REFERENCES subjects(id),
    teacher_id          uuid NOT NULL REFERENCES profiles(id),
    semester_id         uuid NOT NULL REFERENCES semesters(id),
    midterm_max_score   decimal(5,2) DEFAULT 20,
    final_max_score     decimal(5,2) DEFAULT 20,
    classwork_max_score decimal(5,2) DEFAULT 60,
    created_at          timestamptz NOT NULL DEFAULT now(),
    updated_at          timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT uq_classroom_subject_semester UNIQUE (classroom_id, subject_id, semester_id)
);

-- -------------------------------------------------------------------
-- TABLE: attendance_records
-- -------------------------------------------------------------------
CREATE TABLE attendance_records (
    school_id uuid NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000' REFERENCES schools(id) ON DELETE CASCADE,
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id      uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    classroom_id    uuid NOT NULL REFERENCES classrooms(id),
    date            date NOT NULL,
    status          attendance_status NOT NULL,
    check_in_time   time,
    remark          text,
    recorded_by     uuid NOT NULL REFERENCES profiles(id),
    created_at      timestamptz NOT NULL DEFAULT now(),
    updated_at      timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT uq_attendance_per_day UNIQUE (student_id, classroom_id, date)
);

-- -------------------------------------------------------------------
-- TABLE: academic_scores
-- -------------------------------------------------------------------
CREATE TABLE academic_scores (
    school_id uuid NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000' REFERENCES schools(id) ON DELETE CASCADE,
    id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id              uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    classroom_subject_id    uuid NOT NULL REFERENCES classroom_subjects(id),
    semester_id             uuid NOT NULL REFERENCES semesters(id),
    midterm_score           decimal(5,2) CHECK (midterm_score >= 0),
    final_score             decimal(5,2) CHECK (final_score >= 0),
    classwork_score         decimal(5,2) CHECK (classwork_score >= 0),
    total_score             decimal(5,2) GENERATED ALWAYS AS (
                                COALESCE(midterm_score, 0) + COALESCE(final_score, 0) + COALESCE(classwork_score, 0)
                            ) STORED,
    grade                   varchar(5),
    grade_point             decimal(2,1) CHECK (grade_point >= 0 AND grade_point <= 4),
    remark                  text,
    created_at              timestamptz NOT NULL DEFAULT now(),
    updated_at              timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT uq_score_per_student_subject UNIQUE (student_id, classroom_subject_id, semester_id)
);

-- -------------------------------------------------------------------
-- TABLE: basic_skills
-- -------------------------------------------------------------------
CREATE TABLE basic_skills (
    school_id uuid NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000' REFERENCES schools(id) ON DELETE CASCADE,
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id      uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    semester_id     uuid NOT NULL REFERENCES semesters(id),
    reading_level   skill_level NOT NULL,
    reading_score   decimal(5,2),
    reading_note    text,
    writing_level   skill_level NOT NULL,
    writing_score   decimal(5,2),
    writing_note    text,
    math_level      skill_level NOT NULL,
    math_score      decimal(5,2),
    math_note       text,
    assessed_by     uuid NOT NULL REFERENCES profiles(id),
    assessed_at     date NOT NULL DEFAULT CURRENT_DATE,
    remark          text,
    created_at      timestamptz NOT NULL DEFAULT now(),
    updated_at      timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT uq_basic_skills_per_semester UNIQUE (student_id, semester_id)
);

-- -------------------------------------------------------------------
-- TABLE: behavior_records
-- -------------------------------------------------------------------
CREATE TABLE behavior_records (
    school_id uuid NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000' REFERENCES schools(id) ON DELETE CASCADE,
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id      uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    date            date NOT NULL DEFAULT CURRENT_DATE,
    behavior_type   behavior_type NOT NULL,
    category        varchar(100),
    description     text NOT NULL,
    severity        severity_level DEFAULT 'low',
    action_taken    text,
    points          integer DEFAULT 0,
    reported_by     uuid NOT NULL REFERENCES profiles(id),
    witness         varchar(255),
    parent_notified boolean DEFAULT false,
    created_at      timestamptz NOT NULL DEFAULT now(),
    updated_at      timestamptz NOT NULL DEFAULT now()
);

-- -------------------------------------------------------------------
-- TABLE: assignment_submissions
-- -------------------------------------------------------------------
CREATE TABLE assignment_submissions (
    school_id uuid NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000' REFERENCES schools(id) ON DELETE CASCADE,
    id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id              uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    classroom_subject_id    uuid NOT NULL REFERENCES classroom_subjects(id),
    assignment_title        varchar(255) NOT NULL,
    assignment_description  text,
    assigned_date           date NOT NULL,
    due_date                date NOT NULL,
    submitted_date          date,
    status                  submission_status NOT NULL DEFAULT 'not_submitted',
    score                   decimal(5,2),
    max_score               decimal(5,2),
    feedback                text,
    assigned_by             uuid NOT NULL REFERENCES profiles(id),
    created_at              timestamptz NOT NULL DEFAULT now(),
    updated_at              timestamptz NOT NULL DEFAULT now()
);

-- -------------------------------------------------------------------
-- TABLE: home_visits
-- -------------------------------------------------------------------
CREATE TABLE home_visits (
    school_id uuid NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000' REFERENCES schools(id) ON DELETE CASCADE,
    id                          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id                  uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    semester_id                 uuid NOT NULL REFERENCES semesters(id),
    visit_date                  date NOT NULL,
    visit_time                  time,
    visitor_id                  uuid NOT NULL REFERENCES profiles(id),
    co_visitors                 text[],
    guardian_met_id             uuid REFERENCES guardians(id),
    address_visited             text,
    latitude                    decimal(10,7),
    longitude                   decimal(10,7),
    housing_condition           housing_condition,
    housing_type                varchar(100),
    housing_ownership           varchar(100),
    family_members_count        integer,
    family_income               decimal(10,2),
    family_situation            text,
    has_family_problem          boolean DEFAULT false,
    family_problem_detail       text,
    student_behavior_at_home    text,
    environment_safety          text,
    has_study_space             boolean,
    has_internet                boolean,
    travel_difficulty           boolean DEFAULT false,
    travel_difficulty_detail    text,
    suggestions                 text,
    overall_assessment          text,
    follow_up_needed            boolean DEFAULT false,
    follow_up_detail            text,
    created_at                  timestamptz NOT NULL DEFAULT now(),
    updated_at                  timestamptz NOT NULL DEFAULT now()
);

-- -------------------------------------------------------------------
-- TABLE: home_visit_images
-- -------------------------------------------------------------------
CREATE TABLE home_visit_images (
    school_id uuid NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000' REFERENCES schools(id) ON DELETE CASCADE,
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    home_visit_id   uuid NOT NULL REFERENCES home_visits(id) ON DELETE CASCADE,
    image_url       text NOT NULL,
    caption         varchar(255),
    display_order   integer DEFAULT 0,
    created_at      timestamptz NOT NULL DEFAULT now()
);

-- -------------------------------------------------------------------
-- TABLE: support_records
-- -------------------------------------------------------------------
CREATE TABLE support_records (
    school_id uuid NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000' REFERENCES schools(id) ON DELETE CASCADE,
    id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id          uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    semester_id         uuid NOT NULL REFERENCES semesters(id),
    support_type        support_type NOT NULL,
    title               varchar(255) NOT NULL,
    description         text NOT NULL,
    action_plan         text,
    provided_support    text,
    resources_used      text,
    external_referral   text,
    status              support_status NOT NULL DEFAULT 'pending',
    priority            severity_level DEFAULT 'medium',
    started_at          date DEFAULT CURRENT_DATE,
    completed_at        date,
    provided_by         uuid NOT NULL REFERENCES profiles(id),
    approved_by         uuid REFERENCES profiles(id),
    created_at          timestamptz NOT NULL DEFAULT now(),
    updated_at          timestamptz NOT NULL DEFAULT now()
);

-- -------------------------------------------------------------------
-- TABLE: support_followups
-- -------------------------------------------------------------------
CREATE TABLE support_followups (
    school_id uuid NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000' REFERENCES schools(id) ON DELETE CASCADE,
    id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    support_record_id   uuid NOT NULL REFERENCES support_records(id) ON DELETE CASCADE,
    followup_date       date NOT NULL,
    description         text NOT NULL,
    result              text,
    improvement_noted   boolean DEFAULT false,
    next_action         text,
    next_followup_date  date,
    followed_by         uuid NOT NULL REFERENCES profiles(id),
    created_at          timestamptz NOT NULL DEFAULT now()
);

-- -------------------------------------------------------------------
-- TABLE: risk_assessments
-- -------------------------------------------------------------------
CREATE TABLE risk_assessments (
    school_id uuid NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000' REFERENCES schools(id) ON DELETE CASCADE,
    id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id              uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    semester_id             uuid NOT NULL REFERENCES semesters(id),
    risk_score              integer NOT NULL CHECK (risk_score >= 0 AND risk_score <= 100),
    risk_level              risk_level NOT NULL,
    auto_calculated         boolean DEFAULT true,
    manual_override         boolean DEFAULT false,
    override_reason         text,
    summary                 text,
    recommendations         text,
    assessed_by             uuid NOT NULL REFERENCES profiles(id),
    assessed_at             timestamptz NOT NULL DEFAULT now(),
    previous_risk_level     risk_level,
    trend                   varchar(20),
    created_at              timestamptz NOT NULL DEFAULT now(),
    updated_at              timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT uq_risk_per_semester UNIQUE (student_id, semester_id)
);

-- -------------------------------------------------------------------
-- TABLE: risk_factors
-- -------------------------------------------------------------------
CREATE TABLE risk_factors (
    school_id uuid NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000' REFERENCES schools(id) ON DELETE CASCADE,
    id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    risk_assessment_id  uuid NOT NULL REFERENCES risk_assessments(id) ON DELETE CASCADE,
    factor_key          varchar(50) NOT NULL,
    factor_label        varchar(255) NOT NULL,
    score               integer NOT NULL CHECK (score >= 0),
    is_active           boolean NOT NULL DEFAULT true,
    evidence            text,
    data_source         varchar(100),
    created_at          timestamptz NOT NULL DEFAULT now()
);

-- -------------------------------------------------------------------
-- TABLE: development_plans
-- -------------------------------------------------------------------
CREATE TABLE development_plans (
    school_id uuid NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000' REFERENCES schools(id) ON DELETE CASCADE,
    id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id          uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    semester_id         uuid NOT NULL REFERENCES semesters(id),
    title               varchar(255) NOT NULL,
    description         text,
    focus_areas         text[],
    start_date          date NOT NULL,
    end_date            date NOT NULL,
    status              plan_status NOT NULL DEFAULT 'draft',
    overall_progress    integer DEFAULT 0 CHECK (overall_progress >= 0 AND overall_progress <= 100),
    created_by          uuid NOT NULL REFERENCES profiles(id),
    approved_by         uuid REFERENCES profiles(id),
    approved_at         timestamptz,
    risk_assessment_id  uuid REFERENCES risk_assessments(id),
    created_at          timestamptz NOT NULL DEFAULT now(),
    updated_at          timestamptz NOT NULL DEFAULT now()
);

-- -------------------------------------------------------------------
-- TABLE: development_goals
-- -------------------------------------------------------------------
CREATE TABLE development_goals (
    school_id uuid NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000' REFERENCES schools(id) ON DELETE CASCADE,
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id         uuid NOT NULL REFERENCES development_plans(id) ON DELETE CASCADE,
    goal_number     integer NOT NULL,
    title           varchar(255) NOT NULL,
    description     text,
    category        varchar(100),
    target_value    varchar(100),
    current_value   varchar(100),
    status          goal_status NOT NULL DEFAULT 'not_started',
    progress        integer DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    target_date     date,
    achieved_at     date,
    created_at      timestamptz NOT NULL DEFAULT now(),
    updated_at      timestamptz NOT NULL DEFAULT now()
);

-- -------------------------------------------------------------------
-- TABLE: development_activities
-- -------------------------------------------------------------------
CREATE TABLE development_activities (
    school_id uuid NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000' REFERENCES schools(id) ON DELETE CASCADE,
    id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    goal_id             uuid NOT NULL REFERENCES development_goals(id) ON DELETE CASCADE,
    title               varchar(255) NOT NULL,
    description         text,
    responsible_person  varchar(255),
    start_date          date,
    end_date            date,
    is_completed        boolean NOT NULL DEFAULT false,
    completed_at        date,
    result              text,
    display_order       integer DEFAULT 0,
    created_at          timestamptz NOT NULL DEFAULT now(),
    updated_at          timestamptz NOT NULL DEFAULT now()
);

-- -------------------------------------------------------------------
-- TABLE: development_evaluations
-- -------------------------------------------------------------------
CREATE TABLE development_evaluations (
    school_id uuid NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000' REFERENCES schools(id) ON DELETE CASCADE,
    id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id                 uuid NOT NULL REFERENCES development_plans(id) ON DELETE CASCADE,
    evaluation_date         date NOT NULL,
    evaluation_round        integer NOT NULL,
    overall_result          text NOT NULL,
    strengths               text,
    areas_for_improvement   text,
    recommendations         text,
    continue_plan           boolean DEFAULT false,
    evaluated_by            uuid NOT NULL REFERENCES profiles(id),
    parent_feedback         text,
    student_feedback        text,
    created_at              timestamptz NOT NULL DEFAULT now(),
    updated_at              timestamptz NOT NULL DEFAULT now()
);

-- -------------------------------------------------------------------
-- TABLE: notifications
-- -------------------------------------------------------------------
CREATE TABLE notifications (
    school_id uuid NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000' REFERENCES schools(id) ON DELETE CASCADE,
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_id    uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    sender_id       uuid REFERENCES profiles(id),
    type            notification_type NOT NULL,
    title           varchar(255) NOT NULL,
    message         text NOT NULL,
    link            text,
    reference_type  varchar(50),
    reference_id    uuid,
    is_read         boolean NOT NULL DEFAULT false,
    read_at         timestamptz,
    created_at      timestamptz NOT NULL DEFAULT now()
);

-- -------------------------------------------------------------------
-- TABLE: system_settings
-- -------------------------------------------------------------------
CREATE TABLE system_settings (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id   uuid NOT NULL REFERENCES schools(id),
    key         varchar(100) NOT NULL,
    value       jsonb NOT NULL,
    description text,
    category    varchar(50),
    updated_by  uuid REFERENCES profiles(id),
    created_at  timestamptz NOT NULL DEFAULT now(),
    updated_at  timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT uq_setting_per_school UNIQUE (school_id, key)
);

-- -------------------------------------------------------------------
-- TABLE: audit_logs
-- -------------------------------------------------------------------
CREATE TABLE audit_logs (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     uuid REFERENCES profiles(id),
    school_id   uuid REFERENCES schools(id),
    action      audit_action NOT NULL,
    table_name  varchar(100) NOT NULL,
    record_id   uuid,
    old_data    jsonb,
    new_data    jsonb,
    ip_address  inet,
    user_agent  text,
    created_at  timestamptz NOT NULL DEFAULT now()
);
