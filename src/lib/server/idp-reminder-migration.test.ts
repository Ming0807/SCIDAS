import fs from "fs"
import path from "path"
import { describe, it, expect } from "vitest"

const MIGRATION = "0024_idp_due_reminders.sql"

function readMigration(): string {
  return fs.readFileSync(
    path.resolve(process.cwd(), "supabase", "migrations", MIGRATION),
    "utf8",
  )
}

describe("0024 IDP due reminders migration contract", () => {
  it("defines an internal-only SECURITY DEFINER function", () => {
    const sql = readMigration()
    expect(sql).toContain("CREATE OR REPLACE FUNCTION enqueue_idp_due_reminders()")
    expect(sql).toMatch(/SECURITY DEFINER/)
    expect(sql).toMatch(/SET search_path = public/)
  })

  it("revokes app roles and grants only service_role (0010 convention)", () => {
    const sql = readMigration()
    expect(sql).toMatch(/REVOKE ALL ON FUNCTION enqueue_idp_due_reminders\(\) FROM PUBLIC, anon, authenticated/)
    expect(sql).toMatch(/GRANT EXECUTE ON FUNCTION enqueue_idp_due_reminders\(\) TO service_role/)
  })

  it("only notifies active/draft plans due within 7 days with unread dedupe", () => {
    const sql = readMigration()
    expect(sql).toContain("p.status IN ('active', 'draft')")
    expect(sql).toContain("CURRENT_DATE + 7")
    expect(sql).toMatch(/is_read = false/)
    expect(sql).toContain("'plan_review'")
    expect(sql).toContain("'development_plans'")
  })

  it("guards pg_cron scheduling behind a pg_extension check", () => {
    const sql = readMigration()
    expect(sql).toMatch(/IF EXISTS \(SELECT 1 FROM pg_extension WHERE extname = 'pg_cron'\)/)
    expect(sql).toContain("idp-due-reminders")
  })

  it("does not nest identical dollar-quote tags inside the schedule block", () => {
    const sql = readMigration()
    // cron.schedule's command must not reuse the DO block's $$ tag,
    // which would terminate the outer string early (caught live 2026-09-27).
    const doBlocks = sql.match(/\$\$[\s\S]*?\$\$/g) ?? []
    for (const block of doBlocks) {
      expect(block).not.toMatch(/\$\$SELECT/)
    }
  })
})
