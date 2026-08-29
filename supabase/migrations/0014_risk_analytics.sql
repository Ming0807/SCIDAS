-- Migration 0014: Real Risk Analytics Functions and Aggregations

-- 1. Function to get real risk trend history for the current school
CREATE OR REPLACE FUNCTION public.get_school_risk_trend(p_school_id uuid)
RETURNS TABLE (
    period_label text,
    high_count bigint,
    watch_count bigint,
    normal_count bigint,
    total_count bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_target_school uuid;
BEGIN
    v_target_school := COALESCE(p_school_id, get_user_school_id());

    RETURN QUERY
    WITH monthly_assessments AS (
        SELECT
            to_char(ra.assessed_at, 'Mon YYYY') AS p_label,
            date_trunc('month', ra.assessed_at) AS sort_date,
            ra.risk_level
        FROM risk_assessments ra
        WHERE ra.school_id = v_target_school
          AND ra.assessed_at >= (CURRENT_DATE - INTERVAL '6 months')
    )
    SELECT
        m.p_label::text AS period_label,
        COUNT(*) FILTER (WHERE m.risk_level = 'high') AS high_count,
        COUNT(*) FILTER (WHERE m.risk_level = 'watch') AS watch_count,
        COUNT(*) FILTER (WHERE m.risk_level = 'normal') AS normal_count,
        COUNT(*) AS total_count
    FROM monthly_assessments m
    GROUP BY m.p_label, m.sort_date
    ORDER BY m.sort_date ASC;
END;
$$;

-- 2. Function to get real multi-factor risk dimension benchmarks
CREATE OR REPLACE FUNCTION public.get_risk_dimension_benchmarks(p_school_id uuid)
RETURNS TABLE (
    dimension_key text,
    dimension_label text,
    average_score numeric,
    high_risk_count bigint,
    watch_risk_count bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_target_school uuid;
BEGIN
    v_target_school := COALESCE(p_school_id, get_user_school_id());

    RETURN QUERY
    WITH factors AS (
        SELECT
            rf.factor_key,
            rf.factor_label,
            rf.weight,
            ra.risk_level
        FROM risk_factors rf
        JOIN risk_assessments ra ON rf.risk_assessment_id = ra.id
        WHERE rf.school_id = v_target_school
    )
    SELECT
        f.factor_key::text AS dimension_key,
        MAX(f.factor_label)::text AS dimension_label,
        ROUND(AVG(f.weight)::numeric, 1) AS average_score,
        COUNT(*) FILTER (WHERE f.risk_level = 'high') AS high_risk_count,
        COUNT(*) FILTER (WHERE f.risk_level = 'watch') AS watch_risk_count
    FROM factors f
    GROUP BY f.factor_key
    ORDER BY average_score DESC;
END;
$$;

-- 3. Function to get classroom risk breakdown
CREATE OR REPLACE FUNCTION public.get_classroom_risk_breakdown(p_school_id uuid)
RETURNS TABLE (
    classroom_id uuid,
    classroom_name text,
    grade_level grade_level,
    section integer,
    high_risk_count bigint,
    watch_risk_count bigint,
    normal_risk_count bigint,
    total_students bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_target_school uuid;
    v_curr_sem uuid;
BEGIN
    v_target_school := COALESCE(p_school_id, get_user_school_id());
    SELECT id INTO v_curr_sem FROM semesters WHERE school_id = v_target_school AND is_current = true LIMIT 1;

    RETURN QUERY
    SELECT
        c.id AS classroom_id,
        c.name::text AS classroom_name,
        c.grade_level,
        c.section,
        COUNT(ra.id) FILTER (WHERE ra.risk_level = 'high') AS high_risk_count,
        COUNT(ra.id) FILTER (WHERE ra.risk_level = 'watch') AS watch_risk_count,
        COUNT(ra.id) FILTER (WHERE ra.risk_level = 'normal' OR ra.risk_level IS NULL) AS normal_risk_count,
        COUNT(cs.student_id) AS total_students
    FROM classrooms c
    LEFT JOIN classroom_students cs ON cs.classroom_id = c.id AND cs.is_active = true
    LEFT JOIN risk_assessments ra ON ra.student_id = cs.student_id AND (v_curr_sem IS NULL OR ra.semester_id = v_curr_sem)
    WHERE c.school_id = v_target_school AND c.is_active = true
    GROUP BY c.id, c.name, c.grade_level, c.section
    ORDER BY c.grade_level ASC, c.section ASC;
END;
$$;
