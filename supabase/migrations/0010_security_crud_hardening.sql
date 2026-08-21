-- Security and tenant hardening required before exposing production CRUD.

-- Some hosted databases were bootstrapped manually before migration 0007 was
-- introduced. Keep this migration self-contained because the policies below
-- require the student-to-auth identity link.
ALTER TABLE public.students
    ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_students_user_id_unique
    ON public.students (user_id)
    WHERE user_id IS NOT NULL;

-- OAuth/public signup metadata is user-controlled. Only app_metadata set by a
-- trusted server may provision a staff profile and choose its tenant/role.
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_school_id uuid;
    v_role user_role;
    v_school_text text;
    v_role_text text;
    v_full_name text;
    v_first_name text;
    v_last_name text;
    v_avatar_url text;
BEGIN
    v_school_text := NULLIF(btrim(COALESCE(NEW.raw_app_meta_data->>'school_id', '')), '');
    v_role_text := NULLIF(btrim(COALESCE(NEW.raw_app_meta_data->>'role', '')), '');

    IF v_school_text IS NULL OR v_role_text IS NULL THEN
        RETURN NEW;
    END IF;

    IF v_school_text !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
       OR v_role_text NOT IN ('admin', 'director', 'homeroom_teacher', 'counselor', 'subject_teacher') THEN
        RETURN NEW;
    END IF;

    SELECT id INTO v_school_id
    FROM schools
    WHERE id = v_school_text::uuid
      AND is_active = true;

    IF v_school_id IS NULL THEN
        RETURN NEW;
    END IF;

    v_role := v_role_text::user_role;
    v_full_name := NULLIF(btrim(COALESCE(
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'name',
        ''
    )), '');
    v_first_name := NULLIF(btrim(COALESCE(NEW.raw_user_meta_data->>'first_name', '')), '');
    v_last_name := NULLIF(btrim(COALESCE(NEW.raw_user_meta_data->>'last_name', '')), '');
    v_avatar_url := NULLIF(btrim(COALESCE(
        NEW.raw_user_meta_data->>'avatar_url',
        NEW.raw_user_meta_data->>'picture',
        ''
    )), '');

    IF v_first_name IS NULL AND v_full_name IS NOT NULL THEN
        v_first_name := NULLIF(split_part(v_full_name, ' ', 1), '');
    END IF;
    IF v_last_name IS NULL AND v_full_name IS NOT NULL AND position(' ' in v_full_name) > 0 THEN
        v_last_name := NULLIF(btrim(substr(v_full_name, position(' ' in v_full_name) + 1)), '');
    END IF;

    INSERT INTO profiles (id, school_id, role, first_name, last_name, email, avatar_url)
    VALUES (
        NEW.id,
        v_school_id,
        v_role,
        COALESCE(v_first_name, NULLIF(split_part(COALESCE(NEW.email, ''), '@', 1), ''), 'User'),
        COALESCE(v_last_name, '-'),
        NEW.email,
        v_avatar_url
    )
    ON CONFLICT (id) DO NOTHING;

    RETURN NEW;
END;
$$;

-- RLS cannot restrict individual columns. Guard tenant/role/activation fields
-- at the table boundary while still allowing users to edit their own profile.
CREATE OR REPLACE FUNCTION protect_profile_security_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_actor_role user_role;
BEGIN
    IF auth.uid() IS NULL THEN
        RETURN NEW;
    END IF;

    SELECT role INTO v_actor_role FROM profiles WHERE id = auth.uid();

    IF NEW.school_id IS DISTINCT FROM OLD.school_id
       OR NEW.role IS DISTINCT FROM OLD.role
       OR NEW.is_active IS DISTINCT FROM OLD.is_active THEN
        IF auth.uid() = OLD.id OR v_actor_role IS DISTINCT FROM 'admin'::user_role THEN
            RAISE EXCEPTION 'Only another administrator can change profile security fields'
                USING ERRCODE = '42501';
        END IF;
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_profile_security_fields ON profiles;
CREATE TRIGGER trg_protect_profile_security_fields
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION protect_profile_security_fields();

-- Student identities use students.user_id, not students.id.
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
    IF EXISTS (
        SELECT 1 FROM students
        WHERE id = p_student_id AND user_id = auth.uid()
          AND (get_user_school_id() IS NULL OR school_id = get_user_school_id())
    ) THEN
        RETURN true;
    END IF;

    SELECT role, school_id INTO v_role, v_school_id
    FROM profiles WHERE id = auth.uid() AND is_active = true;

    IF v_role IN ('admin', 'director', 'counselor') THEN
        RETURN EXISTS (
            SELECT 1 FROM students
            WHERE id = p_student_id AND school_id = v_school_id
        );
    END IF;
    IF v_role = 'homeroom_teacher' THEN
        RETURN is_homeroom_teacher_of_student(p_student_id);
    END IF;
    IF v_role = 'subject_teacher' THEN
        RETURN is_subject_teacher_of_student(p_student_id);
    END IF;
    RETURN false;
END;
$$;

DROP POLICY IF EXISTS "Students can view own student row" ON students;
CREATE POLICY "Students can view own student row"
    ON students FOR SELECT
    USING (
        user_id = auth.uid()
        AND (get_user_school_id() IS NULL OR school_id = get_user_school_id())
    );

DROP POLICY IF EXISTS "Manage development plans" ON development_plans;
DROP POLICY IF EXISTS "Create development plans" ON development_plans;
DROP POLICY IF EXISTS "Update development plans" ON development_plans;
CREATE POLICY "Create development plans"
    ON development_plans FOR INSERT
    WITH CHECK (
        school_id = get_user_school_id()
        AND created_by = auth.uid()
        AND status = 'draft'
        AND can_access_student(student_id)
        AND get_user_role() IN ('admin', 'homeroom_teacher', 'counselor')
    );
CREATE POLICY "Update development plans"
    ON development_plans FOR UPDATE
    USING (
        school_id = get_user_school_id()
        AND can_access_student(student_id)
        AND get_user_role() IN ('admin', 'homeroom_teacher', 'counselor')
    )
    WITH CHECK (
        school_id = get_user_school_id()
        AND can_access_student(student_id)
        AND get_user_role() IN ('admin', 'homeroom_teacher', 'counselor')
    );

CREATE OR REPLACE FUNCTION protect_development_plan_lifecycle()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF auth.uid() IS NULL THEN
        RETURN NEW;
    END IF;

    IF NEW.school_id IS DISTINCT FROM OLD.school_id
       OR NEW.student_id IS DISTINCT FROM OLD.student_id
       OR NEW.semester_id IS DISTINCT FROM OLD.semester_id
       OR NEW.created_by IS DISTINCT FROM OLD.created_by THEN
        RAISE EXCEPTION 'Development plan ownership fields are immutable'
            USING ERRCODE = '42501';
    END IF;

    IF OLD.status IN ('completed', 'cancelled') AND NEW IS DISTINCT FROM OLD THEN
        RAISE EXCEPTION 'Closed development plans are read-only'
            USING ERRCODE = '23514';
    END IF;

    IF NEW.status IS DISTINCT FROM OLD.status AND NOT (
        (OLD.status = 'draft' AND NEW.status IN ('active', 'cancelled'))
        OR (OLD.status = 'active' AND NEW.status IN ('completed', 'cancelled'))
    ) THEN
        RAISE EXCEPTION 'Invalid development plan status transition'
            USING ERRCODE = '23514';
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_development_plan_lifecycle ON development_plans;
CREATE TRIGGER trg_protect_development_plan_lifecycle
    BEFORE UPDATE ON development_plans
    FOR EACH ROW EXECUTE FUNCTION protect_development_plan_lifecycle();

-- Mutation policies mirror the server-action ownership checks so direct
-- PostgREST calls cannot bypass tenant, assignment, or actor constraints.
DROP POLICY IF EXISTS "Record attendance" ON attendance_records;
CREATE POLICY "Record attendance"
    ON attendance_records FOR INSERT
    WITH CHECK (
        school_id = get_user_school_id()
        AND recorded_by = auth.uid()
        AND get_user_role() IN ('admin', 'homeroom_teacher')
        AND EXISTS (
            SELECT 1
            FROM classrooms c
            JOIN classroom_students cs
              ON cs.classroom_id = c.id
             AND cs.student_id = attendance_records.student_id
             AND cs.is_active = true
            WHERE c.id = attendance_records.classroom_id
              AND c.school_id = attendance_records.school_id
              AND cs.school_id = attendance_records.school_id
              AND (get_user_role() = 'admin' OR c.homeroom_teacher_id = auth.uid())
        )
    );

DROP POLICY IF EXISTS "Update attendance" ON attendance_records;
CREATE POLICY "Update attendance"
    ON attendance_records FOR UPDATE
    USING (
        school_id = get_user_school_id()
        AND get_user_role() IN ('admin', 'homeroom_teacher')
        AND (get_user_role() = 'admin' OR recorded_by = auth.uid())
    )
    WITH CHECK (
        school_id = get_user_school_id()
        AND recorded_by = auth.uid()
        AND EXISTS (
            SELECT 1
            FROM classrooms c
            JOIN classroom_students cs
              ON cs.classroom_id = c.id
             AND cs.student_id = attendance_records.student_id
             AND cs.is_active = true
            WHERE c.id = attendance_records.classroom_id
              AND c.school_id = attendance_records.school_id
              AND cs.school_id = attendance_records.school_id
              AND (get_user_role() = 'admin' OR c.homeroom_teacher_id = auth.uid())
        )
    );

DROP POLICY IF EXISTS "Manage scores" ON academic_scores;
CREATE POLICY "Manage scores"
    ON academic_scores FOR ALL
    USING (
        school_id = get_user_school_id()
        AND EXISTS (
            SELECT 1
            FROM classroom_subjects csub
            JOIN classrooms c ON c.id = csub.classroom_id
            JOIN classroom_students cs
              ON cs.classroom_id = csub.classroom_id
             AND cs.semester_id = academic_scores.semester_id
             AND cs.student_id = academic_scores.student_id
             AND cs.is_active = true
            WHERE csub.id = academic_scores.classroom_subject_id
              AND csub.semester_id = academic_scores.semester_id
              AND csub.school_id = academic_scores.school_id
              AND cs.school_id = academic_scores.school_id
              AND (
                  get_user_role() = 'admin'
                  OR csub.teacher_id = auth.uid()
                  OR (get_user_role() = 'homeroom_teacher' AND c.homeroom_teacher_id = auth.uid())
              )
        )
    )
    WITH CHECK (
        school_id = get_user_school_id()
        AND EXISTS (
            SELECT 1
            FROM classroom_subjects csub
            JOIN classrooms c ON c.id = csub.classroom_id
            JOIN classroom_students cs
              ON cs.classroom_id = csub.classroom_id
             AND cs.semester_id = academic_scores.semester_id
             AND cs.student_id = academic_scores.student_id
             AND cs.is_active = true
            WHERE csub.id = academic_scores.classroom_subject_id
              AND csub.semester_id = academic_scores.semester_id
              AND csub.school_id = academic_scores.school_id
              AND cs.school_id = academic_scores.school_id
              AND (
                  get_user_role() = 'admin'
                  OR csub.teacher_id = auth.uid()
                  OR (get_user_role() = 'homeroom_teacher' AND c.homeroom_teacher_id = auth.uid())
              )
        )
    );

DROP POLICY IF EXISTS "Update own behavior records" ON behavior_records;
DROP POLICY IF EXISTS "Record behavior" ON behavior_records;
CREATE POLICY "Record behavior"
    ON behavior_records FOR INSERT
    WITH CHECK (
        school_id = get_user_school_id()
        AND can_access_student(student_id)
        AND reported_by = auth.uid()
        AND get_user_role() IN ('admin', 'homeroom_teacher', 'subject_teacher', 'counselor')
    );
CREATE POLICY "Update own behavior records"
    ON behavior_records FOR UPDATE
    USING (
        school_id = get_user_school_id()
        AND can_access_student(student_id)
        AND (get_user_role() = 'admin' OR reported_by = auth.uid())
    )
    WITH CHECK (
        school_id = get_user_school_id()
        AND can_access_student(student_id)
        AND (get_user_role() = 'admin' OR reported_by = auth.uid())
    );

DROP POLICY IF EXISTS "Manage home_visits" ON home_visits;
DROP POLICY IF EXISTS "Create home visits" ON home_visits;
DROP POLICY IF EXISTS "Update home visits" ON home_visits;
CREATE POLICY "Create home visits"
    ON home_visits FOR INSERT
    WITH CHECK (
        school_id = get_user_school_id()
        AND visitor_id = auth.uid()
        AND can_access_student(student_id)
        AND get_user_role() IN ('admin', 'homeroom_teacher', 'counselor')
    );
CREATE POLICY "Update home visits"
    ON home_visits FOR UPDATE
    USING (
        school_id = get_user_school_id()
        AND can_access_student(student_id)
        AND get_user_role() IN ('admin', 'homeroom_teacher', 'counselor')
        AND (get_user_role() = 'admin' OR visitor_id = auth.uid())
    )
    WITH CHECK (
        school_id = get_user_school_id()
        AND can_access_student(student_id)
        AND (get_user_role() = 'admin' OR visitor_id = auth.uid())
    );

-- Child records must match both role and tenant. school_id is populated and
-- parent-validated by migration 0008 triggers.
DROP POLICY IF EXISTS "Manage followups" ON support_followups;
CREATE POLICY "Manage followups"
    ON support_followups FOR ALL
    USING (
        school_id = get_user_school_id()
        AND get_user_role() IN ('admin', 'homeroom_teacher', 'counselor')
    )
    WITH CHECK (
        school_id = get_user_school_id()
        AND get_user_role() IN ('admin', 'homeroom_teacher', 'counselor')
    );

DROP POLICY IF EXISTS "Manage risk factors" ON risk_factors;
CREATE POLICY "Manage risk factors"
    ON risk_factors FOR ALL
    USING (
        school_id = get_user_school_id()
        AND get_user_role() IN ('admin', 'homeroom_teacher', 'counselor')
    )
    WITH CHECK (
        school_id = get_user_school_id()
        AND get_user_role() IN ('admin', 'homeroom_teacher', 'counselor')
    );

DROP POLICY IF EXISTS "Manage goals" ON development_goals;
CREATE POLICY "Manage goals"
    ON development_goals FOR ALL
    USING (
        school_id = get_user_school_id()
        AND get_user_role() IN ('admin', 'homeroom_teacher', 'counselor')
        AND EXISTS (
            SELECT 1 FROM development_plans dp
            WHERE dp.id = development_goals.plan_id
              AND dp.school_id = development_goals.school_id
              AND dp.status NOT IN ('completed', 'cancelled')
        )
    )
    WITH CHECK (
        school_id = get_user_school_id()
        AND get_user_role() IN ('admin', 'homeroom_teacher', 'counselor')
        AND EXISTS (
            SELECT 1 FROM development_plans dp
            WHERE dp.id = development_goals.plan_id
              AND dp.school_id = development_goals.school_id
              AND dp.status NOT IN ('completed', 'cancelled')
        )
    );

DROP POLICY IF EXISTS "Manage activities" ON development_activities;
CREATE POLICY "Manage activities"
    ON development_activities FOR ALL
    USING (
        school_id = get_user_school_id()
        AND get_user_role() IN ('admin', 'homeroom_teacher', 'counselor')
        AND EXISTS (
            SELECT 1
            FROM development_goals dg
            JOIN development_plans dp ON dp.id = dg.plan_id
            WHERE dg.id = development_activities.goal_id
              AND dg.school_id = development_activities.school_id
              AND dp.school_id = development_activities.school_id
              AND dp.status NOT IN ('completed', 'cancelled')
        )
    )
    WITH CHECK (
        school_id = get_user_school_id()
        AND get_user_role() IN ('admin', 'homeroom_teacher', 'counselor')
        AND EXISTS (
            SELECT 1
            FROM development_goals dg
            JOIN development_plans dp ON dp.id = dg.plan_id
            WHERE dg.id = development_activities.goal_id
              AND dg.school_id = development_activities.school_id
              AND dp.school_id = development_activities.school_id
              AND dp.status NOT IN ('completed', 'cancelled')
        )
    );

DROP POLICY IF EXISTS "Manage evaluations" ON development_evaluations;
CREATE POLICY "Manage evaluations"
    ON development_evaluations FOR ALL
    USING (
        school_id = get_user_school_id()
        AND get_user_role() IN ('admin', 'director', 'homeroom_teacher', 'counselor')
        AND EXISTS (
            SELECT 1 FROM development_plans dp
            WHERE dp.id = development_evaluations.plan_id
              AND dp.school_id = development_evaluations.school_id
              AND dp.status NOT IN ('completed', 'cancelled')
        )
    )
    WITH CHECK (
        school_id = get_user_school_id()
        AND get_user_role() IN ('admin', 'director', 'homeroom_teacher', 'counselor')
        AND EXISTS (
            SELECT 1 FROM development_plans dp
            WHERE dp.id = development_evaluations.plan_id
              AND dp.school_id = development_evaluations.school_id
              AND dp.status NOT IN ('completed', 'cancelled')
        )
    );

-- Client sessions may not forge notifications or audit history.
DROP POLICY IF EXISTS "System can insert notifications" ON notifications;
DROP POLICY IF EXISTS "System can insert audit logs" ON audit_logs;

REVOKE INSERT, UPDATE, DELETE ON audit_logs FROM anon, authenticated;

-- Privileged RPCs are internal-only until each function enforces caller scope.
REVOKE EXECUTE ON FUNCTION calculate_risk_score(uuid, uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION upsert_risk_assessment(uuid, uuid, uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION notify_risk_alert(uuid, uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION batch_calculate_risk_scores(uuid, uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION get_dashboard_summary(uuid, uuid) FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION calculate_risk_score(uuid, uuid) TO service_role;
GRANT EXECUTE ON FUNCTION upsert_risk_assessment(uuid, uuid, uuid) TO service_role;
GRANT EXECUTE ON FUNCTION notify_risk_alert(uuid, uuid) TO service_role;
GRANT EXECUTE ON FUNCTION batch_calculate_risk_scores(uuid, uuid) TO service_role;
GRANT EXECUTE ON FUNCTION get_dashboard_summary(uuid, uuid) TO service_role;

-- CRUD-relevant records must be auditable.
DROP TRIGGER IF EXISTS audit_attendance_records ON attendance_records;
CREATE TRIGGER audit_attendance_records
    AFTER INSERT OR UPDATE OR DELETE ON attendance_records
    FOR EACH ROW EXECUTE FUNCTION log_audit_event();

DROP TRIGGER IF EXISTS audit_academic_scores ON academic_scores;
CREATE TRIGGER audit_academic_scores
    AFTER INSERT OR UPDATE OR DELETE ON academic_scores
    FOR EACH ROW EXECUTE FUNCTION log_audit_event();

DROP TRIGGER IF EXISTS audit_behavior_records ON behavior_records;
CREATE TRIGGER audit_behavior_records
    AFTER INSERT OR UPDATE OR DELETE ON behavior_records
    FOR EACH ROW EXECUTE FUNCTION log_audit_event();

DROP TRIGGER IF EXISTS audit_students ON students;
CREATE TRIGGER audit_students
    AFTER INSERT OR UPDATE OR DELETE ON students
    FOR EACH ROW EXECUTE FUNCTION log_audit_event();

DROP TRIGGER IF EXISTS audit_support_records ON support_records;
CREATE TRIGGER audit_support_records
    AFTER INSERT OR UPDATE OR DELETE ON support_records
    FOR EACH ROW EXECUTE FUNCTION log_audit_event();

DROP TRIGGER IF EXISTS audit_home_visits ON home_visits;
CREATE TRIGGER audit_home_visits
    AFTER INSERT OR UPDATE OR DELETE ON home_visits
    FOR EACH ROW EXECUTE FUNCTION log_audit_event();

DROP TRIGGER IF EXISTS audit_development_plans ON development_plans;
CREATE TRIGGER audit_development_plans
    AFTER INSERT OR UPDATE OR DELETE ON development_plans
    FOR EACH ROW EXECUTE FUNCTION log_audit_event();

DROP TRIGGER IF EXISTS audit_development_goals ON development_goals;
CREATE TRIGGER audit_development_goals
    AFTER INSERT OR UPDATE OR DELETE ON development_goals
    FOR EACH ROW EXECUTE FUNCTION log_audit_event();

DROP TRIGGER IF EXISTS audit_development_activities ON development_activities;
CREATE TRIGGER audit_development_activities
    AFTER INSERT OR UPDATE OR DELETE ON development_activities
    FOR EACH ROW EXECUTE FUNCTION log_audit_event();

DROP TRIGGER IF EXISTS audit_development_evaluations ON development_evaluations;
CREATE TRIGGER audit_development_evaluations
    AFTER INSERT OR UPDATE OR DELETE ON development_evaluations
    FOR EACH ROW EXECUTE FUNCTION log_audit_event();
