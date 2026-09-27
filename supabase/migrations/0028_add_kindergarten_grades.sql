-- ===================================================================
-- MIGRATION 0026: Add kindergarten grade levels to grade_level enum
--
-- Enables support for Early Childhood / Kindergarten classrooms
-- (อนุบาล 1, อนุบาล 2, อนุบาล 3) across primary schools.
-- ===================================================================

ALTER TYPE grade_level ADD VALUE IF NOT EXISTS 'k1' BEFORE 'p1';
ALTER TYPE grade_level ADD VALUE IF NOT EXISTS 'k2' BEFORE 'p1';
ALTER TYPE grade_level ADD VALUE IF NOT EXISTS 'k3' BEFORE 'p1';
