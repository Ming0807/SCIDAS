-- ===================================================================
-- MIGRATION 0020: IDP pre/post scores (FR-09-05/07)
--
-- Adds optional numeric before/after scores to development_evaluations
-- so teachers can record measurable outcomes and the plan detail page
-- can compare them (ดีขึ้น / เท่าเดิม / แย่ลง).
-- ===================================================================

ALTER TABLE development_evaluations
    ADD COLUMN IF NOT EXISTS pre_score numeric(5, 2) CHECK (pre_score IS NULL OR (pre_score >= 0 AND pre_score <= 100)),
    ADD COLUMN IF NOT EXISTS post_score numeric(5, 2) CHECK (post_score IS NULL OR (post_score >= 0 AND post_score <= 100));
