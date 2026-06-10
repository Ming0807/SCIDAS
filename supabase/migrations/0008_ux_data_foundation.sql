-- ===================================================================
-- MIGRATION: 008_ux_data_foundation.sql
-- Purpose:
--   Add the cross-module data layer that lets the UI read one coherent
--   student care state instead of rebuilding it page by page.
-- ===================================================================

-- -------------------------------------------------------------------
-- Keep school_id consistent on child rows.
-- Existing migrations intentionally default several child tables to the
-- seed school. Real multi-school data needs the value to follow the
-- linked student or parent record.
-- -------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.set_school_id_from_student()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_school_id uuid;
BEGIN
    SELECT school_id INTO v_school_id
    FROM students
    WHERE id = NEW.student_id;

    IF v_school_id IS NULL THEN
        RAISE EXCEPTION 'Student % was not found while setting school_id', NEW.student_id;
    END IF;

    IF NEW.school_id IS NULL
       OR NEW.school_id = '00000000-0000-0000-0000-000000000000'::uuid THEN
        NEW.school_id := v_school_id;
    ELSIF NEW.school_id <> v_school_id THEN
        RAISE EXCEPTION 'school_id % does not match student % school_id %',
            NEW.school_id, NEW.student_id, v_school_id;
    END IF;

    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.set_school_id_from_academic_year()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_school_id uuid;
BEGIN
    SELECT school_id INTO v_school_id
    FROM academic_years
    WHERE id = NEW.academic_year_id;

    IF v_school_id IS NULL THEN
        RAISE EXCEPTION 'Academic year % was not found while setting school_id', NEW.academic_year_id;
    END IF;

    IF NEW.school_id IS NULL
       OR NEW.school_id = '00000000-0000-0000-0000-000000000000'::uuid THEN
        NEW.school_id := v_school_id;
    ELSIF NEW.school_id <> v_school_id THEN
        RAISE EXCEPTION 'school_id % does not match academic_year % school_id %',
            NEW.school_id, NEW.academic_year_id, v_school_id;
    END IF;

    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.set_school_id_from_support_record()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_school_id uuid;
BEGIN
    SELECT school_id INTO v_school_id
    FROM support_records
    WHERE id = NEW.support_record_id;

    IF v_school_id IS NULL THEN
        RAISE EXCEPTION 'Support record % was not found while setting school_id', NEW.support_record_id;
    END IF;

    IF NEW.school_id IS NULL
       OR NEW.school_id = '00000000-0000-0000-0000-000000000000'::uuid THEN
        NEW.school_id := v_school_id;
    ELSIF NEW.school_id <> v_school_id THEN
        RAISE EXCEPTION 'school_id % does not match support_record % school_id %',
            NEW.school_id, NEW.support_record_id, v_school_id;
    END IF;

    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.set_school_id_from_risk_assessment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_school_id uuid;
BEGIN
    SELECT school_id INTO v_school_id
    FROM risk_assessments
    WHERE id = NEW.risk_assessment_id;

    IF v_school_id IS NULL THEN
        RAISE EXCEPTION 'Risk assessment % was not found while setting school_id', NEW.risk_assessment_id;
    END IF;

    IF NEW.school_id IS NULL
       OR NEW.school_id = '00000000-0000-0000-0000-000000000000'::uuid THEN
        NEW.school_id := v_school_id;
    ELSIF NEW.school_id <> v_school_id THEN
        RAISE EXCEPTION 'school_id % does not match risk_assessment % school_id %',
            NEW.school_id, NEW.risk_assessment_id, v_school_id;
    END IF;

    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.set_school_id_from_development_plan()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_school_id uuid;
BEGIN
    SELECT school_id INTO v_school_id
    FROM development_plans
    WHERE id = COALESCE(NEW.plan_id, NEW.id);

    IF v_school_id IS NULL THEN
        RAISE EXCEPTION 'Development plan % was not found while setting school_id',
            COALESCE(NEW.plan_id, NEW.id);
    END IF;

    IF NEW.school_id IS NULL
       OR NEW.school_id = '00000000-0000-0000-0000-000000000000'::uuid THEN
        NEW.school_id := v_school_id;
    ELSIF NEW.school_id <> v_school_id THEN
        RAISE EXCEPTION 'school_id % does not match development plan school_id %',
            NEW.school_id, v_school_id;
    END IF;

    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.set_school_id_from_development_goal()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_school_id uuid;
BEGIN
    SELECT dg.school_id INTO v_school_id
    FROM development_goals dg
    WHERE dg.id = NEW.goal_id;

    IF v_school_id IS NULL THEN
        RAISE EXCEPTION 'Development goal % was not found while setting school_id', NEW.goal_id;
    END IF;

    IF NEW.school_id IS NULL
       OR NEW.school_id = '00000000-0000-0000-0000-000000000000'::uuid THEN
        NEW.school_id := v_school_id;
    ELSIF NEW.school_id <> v_school_id THEN
        RAISE EXCEPTION 'school_id % does not match development goal school_id %',
            NEW.school_id, v_school_id;
    END IF;

    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.set_school_id_from_home_visit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_school_id uuid;
BEGIN
    SELECT school_id INTO v_school_id
    FROM home_visits
    WHERE id = NEW.home_visit_id;

    IF v_school_id IS NULL THEN
        RAISE EXCEPTION 'Home visit % was not found while setting school_id', NEW.home_visit_id;
    END IF;

    IF NEW.school_id IS NULL
       OR NEW.school_id = '00000000-0000-0000-0000-000000000000'::uuid THEN
        NEW.school_id := v_school_id;
    ELSIF NEW.school_id <> v_school_id THEN
        RAISE EXCEPTION 'school_id % does not match home_visit % school_id %',
            NEW.school_id, NEW.home_visit_id, v_school_id;
    END IF;

    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.set_school_id_from_classroom()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_school_id uuid;
BEGIN
    SELECT school_id INTO v_school_id
    FROM classrooms
    WHERE id = NEW.classroom_id;

    IF v_school_id IS NULL THEN
        RAISE EXCEPTION 'Classroom % was not found while setting school_id', NEW.classroom_id;
    END IF;

    IF NEW.school_id IS NULL
       OR NEW.school_id = '00000000-0000-0000-0000-000000000000'::uuid THEN
        NEW.school_id := v_school_id;
    ELSIF NEW.school_id <> v_school_id THEN
        RAISE EXCEPTION 'school_id % does not match classroom % school_id %',
            NEW.school_id, NEW.classroom_id, v_school_id;
    END IF;

    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.set_school_id_from_notification_recipient()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_school_id uuid;
BEGIN
    SELECT school_id INTO v_school_id
    FROM profiles
    WHERE id = NEW.recipient_id;

    IF v_school_id IS NULL THEN
        RAISE EXCEPTION 'Notification recipient % was not found while setting school_id', NEW.recipient_id;
    END IF;

    IF NEW.school_id IS NULL
       OR NEW.school_id = '00000000-0000-0000-0000-000000000000'::uuid THEN
        NEW.school_id := v_school_id;
    ELSIF NEW.school_id <> v_school_id THEN
        RAISE EXCEPTION 'school_id % does not match recipient % school_id %',
            NEW.school_id, NEW.recipient_id, v_school_id;
    END IF;

    RETURN NEW;
END;
$$;

DO $$
DECLARE
    t text;
BEGIN
    FOREACH t IN ARRAY ARRAY[
        'student_guardians',
        'classroom_students',
        'attendance_records',
        'academic_scores',
        'basic_skills',
        'behavior_records',
        'assignment_submissions',
        'home_visits',
        'support_records',
        'risk_assessments',
        'development_plans'
    ]
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS %I ON %I;', 'trg_' || t || '_set_school_id', t);
        EXECUTE format(
            'CREATE TRIGGER %I
             BEFORE INSERT OR UPDATE OF student_id, school_id ON %I
             FOR EACH ROW
             EXECUTE FUNCTION public.set_school_id_from_student();',
            'trg_' || t || '_set_school_id',
            t
        );
    END LOOP;
END;
$$;

DROP TRIGGER IF EXISTS trg_semesters_set_school_id ON semesters;
CREATE TRIGGER trg_semesters_set_school_id
    BEFORE INSERT OR UPDATE OF academic_year_id, school_id ON semesters
    FOR EACH ROW
    EXECUTE FUNCTION public.set_school_id_from_academic_year();

DROP TRIGGER IF EXISTS trg_classroom_subjects_set_school_id ON classroom_subjects;
CREATE TRIGGER trg_classroom_subjects_set_school_id
    BEFORE INSERT OR UPDATE OF classroom_id, school_id ON classroom_subjects
    FOR EACH ROW
    EXECUTE FUNCTION public.set_school_id_from_classroom();

DROP TRIGGER IF EXISTS trg_support_followups_set_school_id ON support_followups;
CREATE TRIGGER trg_support_followups_set_school_id
    BEFORE INSERT OR UPDATE OF support_record_id, school_id ON support_followups
    FOR EACH ROW
    EXECUTE FUNCTION public.set_school_id_from_support_record();

DROP TRIGGER IF EXISTS trg_risk_factors_set_school_id ON risk_factors;
CREATE TRIGGER trg_risk_factors_set_school_id
    BEFORE INSERT OR UPDATE OF risk_assessment_id, school_id ON risk_factors
    FOR EACH ROW
    EXECUTE FUNCTION public.set_school_id_from_risk_assessment();

DROP TRIGGER IF EXISTS trg_development_goals_set_school_id ON development_goals;
CREATE TRIGGER trg_development_goals_set_school_id
    BEFORE INSERT OR UPDATE OF plan_id, school_id ON development_goals
    FOR EACH ROW
    EXECUTE FUNCTION public.set_school_id_from_development_plan();

DROP TRIGGER IF EXISTS trg_development_evaluations_set_school_id ON development_evaluations;
CREATE TRIGGER trg_development_evaluations_set_school_id
    BEFORE INSERT OR UPDATE OF plan_id, school_id ON development_evaluations
    FOR EACH ROW
    EXECUTE FUNCTION public.set_school_id_from_development_plan();

DROP TRIGGER IF EXISTS trg_development_activities_set_school_id ON development_activities;
CREATE TRIGGER trg_development_activities_set_school_id
    BEFORE INSERT OR UPDATE OF goal_id, school_id ON development_activities
    FOR EACH ROW
    EXECUTE FUNCTION public.set_school_id_from_development_goal();

DROP TRIGGER IF EXISTS trg_home_visit_images_set_school_id ON home_visit_images;
CREATE TRIGGER trg_home_visit_images_set_school_id
    BEFORE INSERT OR UPDATE OF home_visit_id, school_id ON home_visit_images
    FOR EACH ROW
    EXECUTE FUNCTION public.set_school_id_from_home_visit();

DROP TRIGGER IF EXISTS trg_notifications_set_school_id ON notifications;
CREATE TRIGGER trg_notifications_set_school_id
    BEFORE INSERT OR UPDATE OF recipient_id, school_id ON notifications
    FOR EACH ROW
    EXECUTE FUNCTION public.set_school_id_from_notification_recipient();

-- -------------------------------------------------------------------
-- UX orchestration tables
-- -------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS student_timeline_events (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id       uuid NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    student_id      uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    event_at        timestamptz NOT NULL DEFAULT now(),
    event_type      varchar(50) NOT NULL,
    title           varchar(255) NOT NULL,
    description     text,
    severity        severity_level,
    source_table    varchar(80) NOT NULL,
    source_id       uuid NOT NULL,
    actor_id        uuid REFERENCES profiles(id),
    metadata        jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_at      timestamptz NOT NULL DEFAULT now(),
    updated_at      timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT uq_student_timeline_source UNIQUE (school_id, student_id, source_table, source_id)
);

CREATE TABLE IF NOT EXISTS student_flags (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id       uuid NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    student_id      uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    flag_key        varchar(80) NOT NULL,
    label           varchar(255) NOT NULL,
    description     text,
    severity        severity_level NOT NULL DEFAULT 'medium',
    status          varchar(20) NOT NULL DEFAULT 'active',
    source_table    varchar(80),
    source_id       uuid,
    owner_id        uuid REFERENCES profiles(id),
    due_date        date,
    resolved_at     timestamptz,
    resolved_by     uuid REFERENCES profiles(id),
    created_by      uuid REFERENCES profiles(id),
    metadata        jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_at      timestamptz NOT NULL DEFAULT now(),
    updated_at      timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT chk_student_flags_status CHECK (status IN ('active', 'resolved', 'dismissed')),
    CONSTRAINT uq_student_flag_key UNIQUE (school_id, student_id, flag_key)
);

CREATE TABLE IF NOT EXISTS action_items (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id       uuid NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    student_id      uuid REFERENCES students(id) ON DELETE CASCADE,
    title           varchar(255) NOT NULL,
    description     text,
    category        varchar(80) NOT NULL DEFAULT 'general',
    priority        severity_level NOT NULL DEFAULT 'medium',
    status          varchar(20) NOT NULL DEFAULT 'todo',
    assigned_to     uuid REFERENCES profiles(id),
    created_by      uuid REFERENCES profiles(id),
    due_date        date,
    completed_at    timestamptz,
    completed_by    uuid REFERENCES profiles(id),
    source_table    varchar(80) NOT NULL DEFAULT 'manual',
    source_id       uuid NOT NULL DEFAULT gen_random_uuid(),
    metadata        jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_at      timestamptz NOT NULL DEFAULT now(),
    updated_at      timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT chk_action_items_status CHECK (status IN ('todo', 'in_progress', 'done', 'cancelled')),
    CONSTRAINT uq_action_item_source UNIQUE (school_id, source_table, source_id)
);

CREATE TABLE IF NOT EXISTS student_notes (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id       uuid NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    student_id      uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    author_id       uuid NOT NULL REFERENCES profiles(id),
    category        varchar(80) NOT NULL DEFAULT 'general',
    body            text NOT NULL,
    visibility      varchar(20) NOT NULL DEFAULT 'team',
    pinned          boolean NOT NULL DEFAULT false,
    source_table    varchar(80),
    source_id       uuid,
    metadata        jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_at      timestamptz NOT NULL DEFAULT now(),
    updated_at      timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT chk_student_notes_visibility CHECK (visibility IN ('team', 'private', 'leadership'))
);

CREATE TABLE IF NOT EXISTS student_attachments (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id       uuid NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    student_id      uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    uploaded_by     uuid REFERENCES profiles(id),
    bucket          varchar(80) NOT NULL DEFAULT 'documents',
    storage_path    text NOT NULL,
    file_name       varchar(255) NOT NULL,
    mime_type       varchar(120),
    file_size       bigint,
    reference_table varchar(80),
    reference_id    uuid,
    is_private      boolean NOT NULL DEFAULT true,
    metadata        jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_at      timestamptz NOT NULL DEFAULT now(),
    updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS report_jobs (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id       uuid NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    requested_by    uuid NOT NULL REFERENCES profiles(id),
    report_type     varchar(80) NOT NULL,
    title           varchar(255) NOT NULL,
    status          varchar(20) NOT NULL DEFAULT 'queued',
    filters         jsonb NOT NULL DEFAULT '{}'::jsonb,
    output_bucket   varchar(80) DEFAULT 'reports',
    output_path     text,
    error_message   text,
    requested_at    timestamptz NOT NULL DEFAULT now(),
    started_at      timestamptz,
    completed_at    timestamptz,
    created_at      timestamptz NOT NULL DEFAULT now(),
    updated_at      timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT chk_report_jobs_status CHECK (status IN ('queued', 'running', 'completed', 'failed', 'cancelled'))
);

CREATE TABLE IF NOT EXISTS user_dashboard_preferences (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id       uuid NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    user_id         uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    scope           varchar(80) NOT NULL DEFAULT 'dashboard',
    key             varchar(120) NOT NULL,
    value           jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_at      timestamptz NOT NULL DEFAULT now(),
    updated_at      timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT uq_user_dashboard_preference UNIQUE (school_id, user_id, scope, key)
);

CREATE INDEX IF NOT EXISTS idx_timeline_student_time
    ON student_timeline_events (student_id, event_at DESC);
CREATE INDEX IF NOT EXISTS idx_timeline_school_type_time
    ON student_timeline_events (school_id, event_type, event_at DESC);

CREATE INDEX IF NOT EXISTS idx_student_flags_active
    ON student_flags (school_id, student_id, severity)
    WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_student_flags_owner_due
    ON student_flags (owner_id, due_date)
    WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_action_items_open_school
    ON action_items (school_id, due_date, priority)
    WHERE status IN ('todo', 'in_progress');
CREATE INDEX IF NOT EXISTS idx_action_items_assigned
    ON action_items (assigned_to, status, due_date);
CREATE INDEX IF NOT EXISTS idx_action_items_student
    ON action_items (student_id, status, due_date);

CREATE INDEX IF NOT EXISTS idx_student_notes_student_time
    ON student_notes (student_id, pinned DESC, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_student_attachments_student
    ON student_attachments (student_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_student_attachments_reference
    ON student_attachments (reference_table, reference_id);

CREATE INDEX IF NOT EXISTS idx_report_jobs_school_status
    ON report_jobs (school_id, status, requested_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_dashboard_preferences_user
    ON user_dashboard_preferences (user_id, scope);

DO $$
DECLARE
    t text;
BEGIN
    FOREACH t IN ARRAY ARRAY[
        'student_timeline_events',
        'student_flags',
        'action_items',
        'student_notes',
        'student_attachments',
        'report_jobs',
        'user_dashboard_preferences'
    ]
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS %I ON %I;', 'set_updated_at_' || t, t);
        EXECUTE format(
            'CREATE TRIGGER %I
             BEFORE UPDATE ON %I
             FOR EACH ROW
             EXECUTE FUNCTION public.update_updated_at_column();',
            'set_updated_at_' || t,
            t
        );
    END LOOP;
END;
$$;

DO $$
DECLARE
    t text;
BEGIN
    FOREACH t IN ARRAY ARRAY[
        'student_timeline_events',
        'student_flags',
        'student_notes',
        'student_attachments'
    ]
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS %I ON %I;', 'trg_' || t || '_set_school_id', t);
        EXECUTE format(
            'CREATE TRIGGER %I
             BEFORE INSERT OR UPDATE OF student_id, school_id ON %I
             FOR EACH ROW
             EXECUTE FUNCTION public.set_school_id_from_student();',
            'trg_' || t || '_set_school_id',
            t
        );
    END LOOP;
END;
$$;

CREATE OR REPLACE FUNCTION public.validate_action_item_school()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_school_id uuid;
BEGIN
    IF NEW.student_id IS NOT NULL THEN
        SELECT school_id INTO v_school_id
        FROM students
        WHERE id = NEW.student_id;

        IF v_school_id IS NULL THEN
            RAISE EXCEPTION 'Student % was not found while setting action item school_id', NEW.student_id;
        END IF;

        IF NEW.school_id IS NULL
           OR NEW.school_id = '00000000-0000-0000-0000-000000000000'::uuid THEN
            NEW.school_id := v_school_id;
        ELSIF NEW.school_id <> v_school_id THEN
            RAISE EXCEPTION 'school_id % does not match student % school_id %',
                NEW.school_id, NEW.student_id, v_school_id;
        END IF;
    ELSIF NEW.school_id IS NULL
       OR NEW.school_id = '00000000-0000-0000-0000-000000000000'::uuid THEN
        NEW.school_id := get_user_school_id();
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_action_items_validate_school ON action_items;
CREATE TRIGGER trg_action_items_validate_school
    BEFORE INSERT OR UPDATE OF student_id, school_id ON action_items
    FOR EACH ROW
    EXECUTE FUNCTION public.validate_action_item_school();

-- -------------------------------------------------------------------
-- Timeline and action queue automation.
-- -------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.sync_student_timeline_from_source()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_event_at timestamptz;
    v_event_type varchar(50);
    v_title varchar(255);
    v_description text;
    v_severity severity_level;
    v_actor_id uuid;
    v_metadata jsonb := '{}'::jsonb;
BEGIN
    IF TG_TABLE_NAME = 'attendance_records' THEN
        v_event_at := NEW.date::timestamptz;
        v_event_type := 'attendance';
        v_title := 'Attendance: ' || NEW.status::text;
        v_description := NEW.remark;
        v_severity := CASE
            WHEN NEW.status = 'absent' THEN 'high'::severity_level
            WHEN NEW.status = 'late' THEN 'medium'::severity_level
            ELSE 'low'::severity_level
        END;
        v_actor_id := NEW.recorded_by;
        v_metadata := jsonb_build_object('status', NEW.status, 'classroom_id', NEW.classroom_id);
    ELSIF TG_TABLE_NAME = 'behavior_records' THEN
        v_event_at := NEW.date::timestamptz;
        v_event_type := 'behavior';
        v_title := COALESCE(NEW.category, NEW.behavior_type::text);
        v_description := NEW.description;
        v_severity := COALESCE(NEW.severity, 'low'::severity_level);
        v_actor_id := NEW.reported_by;
        v_metadata := jsonb_build_object('behavior_type', NEW.behavior_type, 'points', NEW.points);
    ELSIF TG_TABLE_NAME = 'support_records' THEN
        v_event_at := NEW.created_at;
        v_event_type := 'support';
        v_title := NEW.title;
        v_description := NEW.description;
        v_severity := COALESCE(NEW.priority, 'medium'::severity_level);
        v_actor_id := NEW.provided_by;
        v_metadata := jsonb_build_object('status', NEW.status, 'support_type', NEW.support_type);
    ELSIF TG_TABLE_NAME = 'risk_assessments' THEN
        v_event_at := NEW.assessed_at;
        v_event_type := 'risk';
        v_title := 'Risk assessment: ' || NEW.risk_level::text;
        v_description := NEW.summary;
        v_severity := CASE
            WHEN NEW.risk_level = 'high' THEN 'high'::severity_level
            WHEN NEW.risk_level = 'watch' THEN 'medium'::severity_level
            ELSE 'low'::severity_level
        END;
        v_actor_id := NEW.assessed_by;
        v_metadata := jsonb_build_object('risk_score', NEW.risk_score, 'risk_level', NEW.risk_level, 'trend', NEW.trend);
    ELSIF TG_TABLE_NAME = 'development_plans' THEN
        v_event_at := NEW.created_at;
        v_event_type := 'idp';
        v_title := NEW.title;
        v_description := NEW.description;
        v_severity := 'low'::severity_level;
        v_actor_id := NEW.created_by;
        v_metadata := jsonb_build_object('status', NEW.status, 'progress', NEW.overall_progress);
    ELSIF TG_TABLE_NAME = 'home_visits' THEN
        v_event_at := NEW.visit_date::timestamptz;
        v_event_type := 'home_visit';
        v_title := 'Home visit';
        v_description := COALESCE(NEW.overall_assessment, NEW.follow_up_detail, NEW.suggestions);
        v_severity := CASE
            WHEN NEW.has_family_problem OR NEW.travel_difficulty OR NEW.follow_up_needed THEN 'medium'::severity_level
            ELSE 'low'::severity_level
        END;
        v_actor_id := NEW.visitor_id;
        v_metadata := jsonb_build_object(
            'housing_condition', NEW.housing_condition,
            'follow_up_needed', NEW.follow_up_needed,
            'has_family_problem', NEW.has_family_problem
        );
    ELSE
        RETURN NEW;
    END IF;

    INSERT INTO student_timeline_events (
        school_id,
        student_id,
        event_at,
        event_type,
        title,
        description,
        severity,
        source_table,
        source_id,
        actor_id,
        metadata
    ) VALUES (
        NEW.school_id,
        NEW.student_id,
        v_event_at,
        v_event_type,
        v_title,
        v_description,
        v_severity,
        TG_TABLE_NAME,
        NEW.id,
        v_actor_id,
        v_metadata
    )
    ON CONFLICT (school_id, student_id, source_table, source_id)
    DO UPDATE SET
        event_at = EXCLUDED.event_at,
        event_type = EXCLUDED.event_type,
        title = EXCLUDED.title,
        description = EXCLUDED.description,
        severity = EXCLUDED.severity,
        actor_id = EXCLUDED.actor_id,
        metadata = EXCLUDED.metadata,
        updated_at = now();

    RETURN NEW;
END;
$$;

DO $$
DECLARE
    t text;
BEGIN
    FOREACH t IN ARRAY ARRAY[
        'attendance_records',
        'behavior_records',
        'support_records',
        'risk_assessments',
        'development_plans',
        'home_visits'
    ]
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS %I ON %I;', 'trg_' || t || '_timeline', t);
        EXECUTE format(
            'CREATE TRIGGER %I
             AFTER INSERT OR UPDATE ON %I
             FOR EACH ROW
             EXECUTE FUNCTION public.sync_student_timeline_from_source();',
            'trg_' || t || '_timeline',
            t
        );
    END LOOP;
END;
$$;

CREATE OR REPLACE FUNCTION public.sync_risk_follow_up()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_owner_id uuid;
    v_priority severity_level;
    v_due_date date;
    v_label varchar(255);
    v_description text;
BEGIN
    SELECT c.homeroom_teacher_id INTO v_owner_id
    FROM classroom_students cs
    JOIN classrooms c ON c.id = cs.classroom_id
    JOIN semesters sem ON sem.id = cs.semester_id
    WHERE cs.student_id = NEW.student_id
      AND cs.is_active = true
      AND sem.is_current = true
    LIMIT 1;

    IF NEW.risk_level IN ('watch', 'high') THEN
        v_priority := CASE
            WHEN NEW.risk_level = 'high' THEN 'high'::severity_level
            ELSE 'medium'::severity_level
        END;
        v_due_date := CURRENT_DATE + CASE WHEN NEW.risk_level = 'high' THEN 7 ELSE 14 END;
        v_label := CASE
            WHEN NEW.risk_level = 'high' THEN 'High-risk student'
            ELSE 'Watch student'
        END;
        v_description := 'Risk score ' || NEW.risk_score::text || '. Review factors and create a support path.';

        INSERT INTO student_flags (
            school_id,
            student_id,
            flag_key,
            label,
            description,
            severity,
            status,
            source_table,
            source_id,
            owner_id,
            due_date,
            created_by,
            metadata
        ) VALUES (
            NEW.school_id,
            NEW.student_id,
            'risk_level',
            v_label,
            v_description,
            v_priority,
            'active',
            'risk_assessments',
            NEW.id,
            v_owner_id,
            v_due_date,
            NEW.assessed_by,
            jsonb_build_object('risk_level', NEW.risk_level, 'risk_score', NEW.risk_score)
        )
        ON CONFLICT (school_id, student_id, flag_key)
        DO UPDATE SET
            label = EXCLUDED.label,
            description = EXCLUDED.description,
            severity = EXCLUDED.severity,
            status = 'active',
            source_table = EXCLUDED.source_table,
            source_id = EXCLUDED.source_id,
            owner_id = COALESCE(student_flags.owner_id, EXCLUDED.owner_id),
            due_date = EXCLUDED.due_date,
            resolved_at = NULL,
            resolved_by = NULL,
            metadata = EXCLUDED.metadata,
            updated_at = now();

        INSERT INTO action_items (
            school_id,
            student_id,
            title,
            description,
            category,
            priority,
            status,
            assigned_to,
            created_by,
            due_date,
            source_table,
            source_id,
            metadata
        ) VALUES (
            NEW.school_id,
            NEW.student_id,
            'Review ' || lower(v_label),
            v_description,
            'risk_follow_up',
            v_priority,
            'todo',
            v_owner_id,
            NEW.assessed_by,
            v_due_date,
            'risk_assessments',
            NEW.id,
            jsonb_build_object('risk_level', NEW.risk_level, 'risk_score', NEW.risk_score)
        )
        ON CONFLICT (school_id, source_table, source_id)
        DO UPDATE SET
            title = EXCLUDED.title,
            description = EXCLUDED.description,
            category = EXCLUDED.category,
            priority = EXCLUDED.priority,
            assigned_to = COALESCE(action_items.assigned_to, EXCLUDED.assigned_to),
            due_date = CASE
                WHEN action_items.status IN ('done', 'cancelled') THEN action_items.due_date
                ELSE EXCLUDED.due_date
            END,
            status = CASE
                WHEN action_items.status IN ('done', 'cancelled') THEN action_items.status
                ELSE 'todo'
            END,
            metadata = EXCLUDED.metadata,
            updated_at = now();
    ELSE
        UPDATE student_flags
        SET status = 'resolved',
            resolved_at = now(),
            resolved_by = NEW.assessed_by,
            updated_at = now()
        WHERE school_id = NEW.school_id
          AND student_id = NEW.student_id
          AND flag_key = 'risk_level'
          AND status = 'active';

        UPDATE action_items
        SET status = 'cancelled',
            updated_at = now()
        WHERE school_id = NEW.school_id
          AND source_table = 'risk_assessments'
          AND source_id = NEW.id
          AND status IN ('todo', 'in_progress');
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_risk_assessments_follow_up ON risk_assessments;
CREATE TRIGGER trg_risk_assessments_follow_up
    AFTER INSERT OR UPDATE OF risk_level, risk_score ON risk_assessments
    FOR EACH ROW
    EXECUTE FUNCTION public.sync_risk_follow_up();

-- -------------------------------------------------------------------
-- Read models for server components and dashboard pages.
-- -------------------------------------------------------------------

CREATE OR REPLACE VIEW v_current_student_directory
WITH (security_invoker = true)
AS
SELECT
    s.school_id,
    s.id AS student_id,
    s.student_code,
    s.user_id,
    s.prefix,
    s.first_name,
    s.last_name,
    trim(concat(COALESCE(s.prefix, ''), s.first_name, ' ', s.last_name)) AS full_name,
    s.nickname,
    s.gender,
    s.photo_url,
    s.status,
    s.distance_to_school_km,
    s.travel_method,
    cs.classroom_id,
    c.name AS classroom_name,
    c.grade_level,
    c.section,
    cs.student_number,
    cs.semester_id,
    pg.guardian_id AS primary_guardian_id,
    pg.guardian_name AS primary_guardian_name,
    pg.guardian_phone AS primary_guardian_phone
FROM students s
LEFT JOIN classroom_students cs
    ON cs.student_id = s.id
   AND cs.is_active = true
   AND EXISTS (
        SELECT 1
        FROM semesters sem
        WHERE sem.id = cs.semester_id
          AND sem.is_current = true
   )
LEFT JOIN classrooms c ON c.id = cs.classroom_id
LEFT JOIN LATERAL (
    SELECT
        g.id AS guardian_id,
        trim(concat(COALESCE(g.prefix, ''), g.first_name, ' ', g.last_name)) AS guardian_name,
        g.phone AS guardian_phone
    FROM student_guardians sg
    JOIN guardians g ON g.id = sg.guardian_id
    WHERE sg.student_id = s.id
    ORDER BY sg.is_primary DESC, sg.is_emergency_contact DESC, sg.created_at ASC
    LIMIT 1
) pg ON true
WHERE s.status = 'active';

CREATE OR REPLACE VIEW v_student_latest_risk
WITH (security_invoker = true)
AS
SELECT DISTINCT ON (ra.student_id)
    ra.school_id,
    ra.student_id,
    ra.id AS risk_assessment_id,
    ra.semester_id,
    ra.risk_score,
    ra.risk_level,
    ra.trend,
    ra.summary,
    ra.recommendations,
    ra.assessed_at,
    ra.assessed_by
FROM risk_assessments ra
ORDER BY ra.student_id, ra.assessed_at DESC, ra.created_at DESC;

CREATE OR REPLACE VIEW v_student_support_state
WITH (security_invoker = true)
AS
SELECT
    s.school_id,
    s.id AS student_id,
    COUNT(DISTINCT sr.id) FILTER (WHERE sr.status IN ('pending', 'in_progress'))::integer AS open_support_count,
    COUNT(DISTINCT dp.id) FILTER (WHERE dp.status = 'active')::integer AS active_plan_count,
    COUNT(DISTINCT ai.id) FILTER (WHERE ai.status IN ('todo', 'in_progress'))::integer AS open_action_count,
    COUNT(DISTINCT sf.id) FILTER (WHERE sf.status = 'active')::integer AS active_flag_count,
    MAX(sr.updated_at) AS latest_support_at,
    MIN(ai.due_date) FILTER (WHERE ai.status IN ('todo', 'in_progress')) AS next_due_date
FROM students s
LEFT JOIN support_records sr ON sr.student_id = s.id
LEFT JOIN development_plans dp ON dp.student_id = s.id
LEFT JOIN action_items ai ON ai.student_id = s.id
LEFT JOIN student_flags sf ON sf.student_id = s.id
GROUP BY s.school_id, s.id;

CREATE OR REPLACE VIEW v_student_worklist
WITH (security_invoker = true)
AS
WITH attendance_30 AS (
    SELECT
        ar.student_id,
        COUNT(*) FILTER (WHERE ar.status = 'absent')::integer AS absent_days_30d,
        COUNT(*) FILTER (WHERE ar.status = 'late')::integer AS late_days_30d,
        COUNT(*)::integer AS recorded_days_30d,
        CASE
            WHEN COUNT(*) = 0 THEN NULL
            ELSE ROUND(
                COUNT(*) FILTER (WHERE ar.status IN ('present', 'late', 'leave', 'sick')) * 100.0 / COUNT(*),
                1
            )
        END AS attendance_rate_30d
    FROM attendance_records ar
    WHERE ar.date >= CURRENT_DATE - INTERVAL '30 days'
    GROUP BY ar.student_id
)
SELECT
    d.school_id,
    d.student_id,
    d.student_code,
    d.full_name,
    d.photo_url,
    d.classroom_id,
    d.classroom_name,
    d.grade_level,
    d.section,
    d.student_number,
    d.primary_guardian_name,
    d.primary_guardian_phone,
    COALESCE(lr.risk_level, 'normal'::risk_level) AS risk_level,
    COALESCE(lr.risk_score, 0)::integer AS risk_score,
    lr.trend AS risk_trend,
    COALESCE(ss.open_support_count, 0)::integer AS open_support_count,
    COALESCE(ss.active_plan_count, 0)::integer AS active_plan_count,
    COALESCE(ss.open_action_count, 0)::integer AS open_action_count,
    COALESCE(ss.active_flag_count, 0)::integer AS active_flag_count,
    ss.next_due_date,
    COALESCE(a.absent_days_30d, 0)::integer AS absent_days_30d,
    COALESCE(a.late_days_30d, 0)::integer AS late_days_30d,
    COALESCE(a.recorded_days_30d, 0)::integer AS recorded_days_30d,
    a.attendance_rate_30d,
    LEAST(
        100,
        COALESCE(lr.risk_score, 0)
        + COALESCE(a.absent_days_30d, 0) * 4
        + COALESCE(a.late_days_30d, 0) * 2
        + COALESCE(ss.open_action_count, 0) * 6
        + COALESCE(ss.active_flag_count, 0) * 8
    )::integer AS priority_score
FROM v_current_student_directory d
LEFT JOIN v_student_latest_risk lr ON lr.student_id = d.student_id
LEFT JOIN v_student_support_state ss ON ss.student_id = d.student_id
LEFT JOIN attendance_30 a ON a.student_id = d.student_id;

-- -------------------------------------------------------------------
-- RLS policies for UX orchestration tables.
-- -------------------------------------------------------------------

ALTER TABLE student_timeline_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE action_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_dashboard_preferences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "View timeline by student access" ON student_timeline_events;
CREATE POLICY "View timeline by student access"
    ON student_timeline_events FOR SELECT
    USING (can_access_student(student_id));

DROP POLICY IF EXISTS "Manage timeline by staff access" ON student_timeline_events;
CREATE POLICY "Manage timeline by staff access"
    ON student_timeline_events FOR ALL
    USING (
        can_access_student(student_id)
        AND get_user_role() IN ('admin', 'homeroom_teacher', 'subject_teacher', 'counselor')
    )
    WITH CHECK (
        can_access_student(student_id)
        AND get_user_role() IN ('admin', 'homeroom_teacher', 'subject_teacher', 'counselor')
    );

DROP POLICY IF EXISTS "View flags by student access" ON student_flags;
CREATE POLICY "View flags by student access"
    ON student_flags FOR SELECT
    USING (can_access_student(student_id));

DROP POLICY IF EXISTS "Manage flags by care team" ON student_flags;
CREATE POLICY "Manage flags by care team"
    ON student_flags FOR ALL
    USING (
        can_access_student(student_id)
        AND get_user_role() IN ('admin', 'homeroom_teacher', 'counselor')
    )
    WITH CHECK (
        can_access_student(student_id)
        AND get_user_role() IN ('admin', 'homeroom_teacher', 'counselor')
    );

DROP POLICY IF EXISTS "View action items by access" ON action_items;
CREATE POLICY "View action items by access"
    ON action_items FOR SELECT
    USING (
        school_id = get_user_school_id()
        AND (student_id IS NULL OR can_access_student(student_id))
    );

DROP POLICY IF EXISTS "Manage action items by staff access" ON action_items;
CREATE POLICY "Manage action items by staff access"
    ON action_items FOR ALL
    USING (
        school_id = get_user_school_id()
        AND (student_id IS NULL OR can_access_student(student_id))
        AND get_user_role() IN ('admin', 'director', 'homeroom_teacher', 'subject_teacher', 'counselor')
    )
    WITH CHECK (
        school_id = get_user_school_id()
        AND (student_id IS NULL OR can_access_student(student_id))
        AND get_user_role() IN ('admin', 'director', 'homeroom_teacher', 'subject_teacher', 'counselor')
    );

DROP POLICY IF EXISTS "View student notes by visibility" ON student_notes;
CREATE POLICY "View student notes by visibility"
    ON student_notes FOR SELECT
    USING (
        can_access_student(student_id)
        AND (
            visibility = 'team'
            OR author_id = auth.uid()
            OR get_user_role() IN ('admin', 'director', 'counselor')
        )
    );

DROP POLICY IF EXISTS "Manage own or care notes" ON student_notes;
CREATE POLICY "Manage own or care notes"
    ON student_notes FOR ALL
    USING (
        can_access_student(student_id)
        AND (
            author_id = auth.uid()
            OR get_user_role() IN ('admin', 'counselor')
        )
    )
    WITH CHECK (
        can_access_student(student_id)
        AND get_user_role() IN ('admin', 'homeroom_teacher', 'subject_teacher', 'counselor')
    );

DROP POLICY IF EXISTS "View student attachments by access" ON student_attachments;
CREATE POLICY "View student attachments by access"
    ON student_attachments FOR SELECT
    USING (
        can_access_student(student_id)
        AND (
            is_private = false
            OR uploaded_by = auth.uid()
            OR get_user_role() IN ('admin', 'director', 'homeroom_teacher', 'counselor')
        )
    );

DROP POLICY IF EXISTS "Manage student attachments by staff" ON student_attachments;
CREATE POLICY "Manage student attachments by staff"
    ON student_attachments FOR ALL
    USING (
        can_access_student(student_id)
        AND get_user_role() IN ('admin', 'homeroom_teacher', 'counselor')
    )
    WITH CHECK (
        can_access_student(student_id)
        AND get_user_role() IN ('admin', 'homeroom_teacher', 'counselor')
    );

DROP POLICY IF EXISTS "View report jobs by requester or leadership" ON report_jobs;
CREATE POLICY "View report jobs by requester or leadership"
    ON report_jobs FOR SELECT
    USING (
        school_id = get_user_school_id()
        AND (
            requested_by = auth.uid()
            OR get_user_role() IN ('admin', 'director')
        )
    );

DROP POLICY IF EXISTS "Request own report jobs" ON report_jobs;
CREATE POLICY "Request own report jobs"
    ON report_jobs FOR INSERT
    WITH CHECK (
        school_id = get_user_school_id()
        AND requested_by = auth.uid()
    );

DROP POLICY IF EXISTS "Update report jobs by requester or admin" ON report_jobs;
CREATE POLICY "Update report jobs by requester or admin"
    ON report_jobs FOR UPDATE
    USING (
        school_id = get_user_school_id()
        AND (
            requested_by = auth.uid()
            OR get_user_role() = 'admin'
        )
    )
    WITH CHECK (
        school_id = get_user_school_id()
        AND (
            requested_by = auth.uid()
            OR get_user_role() = 'admin'
        )
    );

DROP POLICY IF EXISTS "Manage own dashboard preferences" ON user_dashboard_preferences;
CREATE POLICY "Manage own dashboard preferences"
    ON user_dashboard_preferences FOR ALL
    USING (
        school_id = get_user_school_id()
        AND user_id = auth.uid()
    )
    WITH CHECK (
        school_id = get_user_school_id()
        AND user_id = auth.uid()
    );
