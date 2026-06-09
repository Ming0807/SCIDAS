-- ===================================================================
-- MIGRATION: 006_seed_data.sql
-- ===================================================================

INSERT INTO schools (id, name, school_code, director_name)
VALUES ('00000000-0000-0000-0000-000000000000', 'Default School', 'DEF001', 'Director Name')
ON CONFLICT (id) DO NOTHING;

INSERT INTO system_settings (school_id, key, value, description, category)
VALUES
    ('00000000-0000-0000-0000-000000000000', 'risk_threshold_watch', '31', 'Watch', 'risk'),
    ('00000000-0000-0000-0000-000000000000', 'risk_threshold_high', '61', 'High Risk', 'risk'),
    ('00000000-0000-0000-0000-000000000000', 'risk_factor_frequent_absence', '{"score": 20, "threshold_days": 3}', 'Absence', 'risk'),
    ('00000000-0000-0000-0000-000000000000', 'risk_factor_frequent_late', '{"score": 10, "threshold_times": 5}', 'Late', 'risk'),
    ('00000000-0000-0000-0000-000000000000', 'risk_factor_low_grades', '{"score": 20, "threshold_gpa": 1.5}', 'Low Grades', 'risk'),
    ('00000000-0000-0000-0000-000000000000', 'risk_factor_low_basic_skills', '{"score": 15}', 'Low Skills', 'risk'),
    ('00000000-0000-0000-0000-000000000000', 'risk_factor_missing_assignments', '{"score": 10, "threshold_percent": 30}', 'Missing Assignments', 'risk'),
    ('00000000-0000-0000-0000-000000000000', 'risk_factor_family_problems', '{"score": 15}', 'Family Problems', 'risk')
ON CONFLICT DO NOTHING;
