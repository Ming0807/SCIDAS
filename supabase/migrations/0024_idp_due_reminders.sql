-- ===================================================================
-- MIGRATION 0024: IDP due-date reminders (FR-09-09, FR-11-02)
--
-- Adds an idempotent, tenant-scoped function that enqueues In-App
-- `plan_review` notifications for active/draft development plans whose
-- end date is overdue or falls within the next 7 days.
--
-- Recipients mirror notify_risk_alert (homeroom teacher of the student's
-- current classroom + active counselors/directors of the school) plus the
-- plan creator when they are still active staff. A reminder is skipped
-- when the recipient already has an UNREAD plan_review notification for
-- the same plan, so daily runs never spam.
--
-- Scheduling is guarded: pg_cron is used only where the extension
-- exists (Supabase Cloud). Local stacks without pg_cron keep working
-- and can invoke the function manually or from a worker.
-- ===================================================================

CREATE OR REPLACE FUNCTION enqueue_idp_due_reminders()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_plan RECORD;
    v_recipient RECORD;
    v_student_name text;
    v_inserted integer := 0;
    v_is_overdue boolean;
BEGIN
    FOR v_plan IN
        SELECT
            p.id AS plan_id,
            p.school_id,
            p.student_id,
            p.title,
            p.end_date,
            p.created_by,
            (s.first_name || ' ' || s.last_name) AS student_name
        FROM development_plans p
        JOIN students s ON s.id = p.student_id
        WHERE p.status IN ('active', 'draft')
          AND p.end_date IS NOT NULL
          AND p.end_date <= (CURRENT_DATE + 7)
        ORDER BY p.end_date ASC, p.id ASC
    LOOP
        v_student_name := NULLIF(trim(v_plan.student_name), '');
        IF v_student_name IS NULL THEN
            v_student_name := 'นักเรียน';
        END IF;
        v_is_overdue := v_plan.end_date < CURRENT_DATE;

        -- Owner + homeroom + counselor/director recipients, deduped.
        FOR v_recipient IN
            SELECT DISTINCT user_id FROM (
                -- Plan creator (when still active staff of the same school).
                SELECT prof.id AS user_id
                FROM profiles prof
                WHERE prof.id = v_plan.created_by
                  AND prof.school_id = v_plan.school_id
                  AND prof.is_active = true
                UNION
                -- Homeroom teacher of the student's current classroom.
                SELECT c.homeroom_teacher_id AS user_id
                FROM classroom_students cs
                JOIN classrooms c ON c.id = cs.classroom_id
                JOIN semesters sem ON sem.id = cs.semester_id
                WHERE cs.student_id = v_plan.student_id
                  AND cs.is_active = true
                  AND sem.is_current = true
                  AND c.homeroom_teacher_id IS NOT NULL
                UNION
                -- Counselors and directors of the school.
                SELECT prof.id AS user_id
                FROM profiles prof
                WHERE prof.school_id = v_plan.school_id
                  AND prof.role IN ('counselor', 'director')
                  AND prof.is_active = true
            ) recipients
            WHERE user_id IS NOT NULL
        LOOP
            -- Idempotency: one unread reminder per (recipient, plan).
            IF EXISTS (
                SELECT 1 FROM notifications n
                WHERE n.recipient_id = v_recipient.user_id
                  AND n.type = 'plan_review'
                  AND n.reference_type = 'development_plans'
                  AND n.reference_id = v_plan.plan_id
                  AND n.is_read = false
            ) THEN
                CONTINUE;
            END IF;

            INSERT INTO notifications (
                school_id, recipient_id, type, title, message,
                link, reference_type, reference_id
            ) VALUES (
                v_plan.school_id,
                v_recipient.user_id,
                'plan_review',
                CASE WHEN v_is_overdue
                    THEN 'เลยกำหนดติดตามแผน IDP'
                    ELSE 'แผน IDP ใกล้ครบกำหนด'
                END,
                CASE WHEN v_is_overdue
                    THEN format(
                        'แผน "%s" ของ%s เลยกำหนดแล้ว (สิ้นสุด %s) กรุณาติดตามและประเมินผล',
                        v_plan.title, v_student_name,
                        to_char(v_plan.end_date, 'DD/MM/YYYY')
                    )
                    ELSE format(
                        'แผน "%s" ของ%s จะสิ้นสุดวันที่ %s กรุณาเตรียมติดตามและประเมินผล',
                        v_plan.title, v_student_name,
                        to_char(v_plan.end_date, 'DD/MM/YYYY')
                    )
                END,
                '/development-plans/' || v_plan.plan_id::text,
                'development_plans',
                v_plan.plan_id
            );
            v_inserted := v_inserted + 1;
        END LOOP;
    END LOOP;

    RETURN v_inserted;
END;
$$;

-- Internal-only execution like notify_risk_alert (0010): the scheduler
-- (postgres/pg_cron owner) and service_role workers may call it; app
-- users reach reminders through RLS-scoped notification reads only.
REVOKE ALL ON FUNCTION enqueue_idp_due_reminders() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION enqueue_idp_due_reminders() TO service_role;

-- Daily schedule at 07:00 local server time, only where pg_cron exists.
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
        IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'idp-due-reminders') THEN
            PERFORM cron.unschedule('idp-due-reminders');
        END IF;
        PERFORM cron.schedule(
            'idp-due-reminders',
            '0 7 * * *',
            $job$SELECT public.enqueue_idp_due_reminders()$job$
        );
    END IF;
END;
$$;
