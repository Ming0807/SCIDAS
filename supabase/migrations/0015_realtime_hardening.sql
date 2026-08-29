-- Migration 0015: Realtime Hardening and Postgres Publication

-- 1. Ensure REPLICA IDENTITY is configured for real-time change tracking
ALTER TABLE IF EXISTS notifications REPLICA IDENTITY FULL;
ALTER TABLE IF EXISTS attendance_records REPLICA IDENTITY FULL;
ALTER TABLE IF EXISTS report_jobs REPLICA IDENTITY FULL;
ALTER TABLE IF EXISTS risk_assessments REPLICA IDENTITY FULL;

-- 2. Add tables to supabase_realtime publication (wrapped safely)
DO $$
BEGIN
    -- Check if publication exists
    IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
        -- Add notifications table if not already in publication
        IF NOT EXISTS (
            SELECT 1 FROM pg_publication_tables
            WHERE pubname = 'supabase_realtime' AND tablename = 'notifications'
        ) THEN
            ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
        END IF;

        -- Add attendance_records table if not already in publication
        IF NOT EXISTS (
            SELECT 1 FROM pg_publication_tables
            WHERE pubname = 'supabase_realtime' AND tablename = 'attendance_records'
        ) THEN
            ALTER PUBLICATION supabase_realtime ADD TABLE attendance_records;
        END IF;

        -- Add report_jobs table if not already in publication
        IF NOT EXISTS (
            SELECT 1 FROM pg_publication_tables
            WHERE pubname = 'supabase_realtime' AND tablename = 'report_jobs'
        ) THEN
            ALTER PUBLICATION supabase_realtime ADD TABLE report_jobs;
        END IF;

        -- Add risk_assessments table if not already in publication
        IF NOT EXISTS (
            SELECT 1 FROM pg_publication_tables
            WHERE pubname = 'supabase_realtime' AND tablename = 'risk_assessments'
        ) THEN
            ALTER PUBLICATION supabase_realtime ADD TABLE risk_assessments;
        END IF;
    END IF;
END $$;
