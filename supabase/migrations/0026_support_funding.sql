-- ===================================================================
-- MIGRATION 0026: Support funding source and budget (FR-07-08 Should,
-- FR-07-07 Could)
--
-- Adds optional funding_source (free text: scholarship fund, agency,
-- donors, ...) and budget_amount (THB) on support_records.
-- ===================================================================

ALTER TABLE support_records
    ADD COLUMN IF NOT EXISTS funding_source text;

ALTER TABLE support_records
    ADD COLUMN IF NOT EXISTS budget_amount numeric(10, 2);

ALTER TABLE support_records
    DROP CONSTRAINT IF EXISTS support_records_budget_amount_check;

ALTER TABLE support_records
    ADD CONSTRAINT support_records_budget_amount_check
    CHECK (budget_amount IS NULL OR budget_amount >= 0);
