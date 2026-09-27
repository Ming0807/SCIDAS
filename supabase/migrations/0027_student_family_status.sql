-- ===================================================================
-- MIGRATION 0027: Student family status (FR-02-05 Must)
--
-- Adds an optional family_status code on students. Family composition
-- details can still be recorded per home visit (family_situation);
-- this column keeps the current headline status on the profile.
-- Codes: together | separated | single_parent | orphan | guardian | other
-- ===================================================================

ALTER TABLE students
    ADD COLUMN IF NOT EXISTS family_status text;

ALTER TABLE students
    DROP CONSTRAINT IF EXISTS students_family_status_check;

ALTER TABLE students
    ADD CONSTRAINT students_family_status_check
    CHECK (
        family_status IS NULL
        OR family_status IN (
            'together',
            'separated',
            'single_parent',
            'orphan',
            'guardian',
            'other'
        )
    );
