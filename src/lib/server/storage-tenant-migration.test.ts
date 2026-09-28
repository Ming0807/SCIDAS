import fs from "fs"
import path from "path"
import { describe, it, expect } from "vitest"

const MIGRATION = "0029_storage_tenant_isolation.sql"

function readMigration(): string {
  return fs.readFileSync(
    path.resolve(process.cwd(), "supabase", "migrations", MIGRATION),
    "utf8",
  )
}

function selectPolicyBlocks(sql: string): string[] {
  return sql
    .split(/(?=CREATE POLICY)/g)
    .filter((block) => /FOR SELECT/.test(block))
}

describe("0029 storage tenant isolation migration contract", () => {
  it("drops the two leaky auth-only SELECT policies", () => {
    const sql = readMigration()
    expect(sql).toContain(
      'DROP POLICY IF EXISTS "Staff can view home visit images" ON storage.objects',
    )
    expect(sql).toContain(
      'DROP POLICY IF EXISTS "Authenticated users can view student photos" ON storage.objects',
    )
  })

  it("recreates SELECT policies for both buckets with school scoping", () => {
    const sql = readMigration()
    const blocks = selectPolicyBlocks(sql)
    expect(blocks.length).toBeGreaterThanOrEqual(2)

    const homeVisit = blocks.find((b) => b.includes("home-visit-images"))
    const studentPhotos = blocks.find((b) => b.includes("student-photos"))
    expect(homeVisit).toBeDefined()
    expect(studentPhotos).toBeDefined()

    for (const block of [homeVisit!, studentPhotos!]) {
      expect(block).toMatch(/can_access_student|get_user_school_id/)
    }
  })

  it("leaves INSERT/UPDATE/DELETE policies untouched", () => {
    const sql = readMigration()
    expect(sql).not.toMatch(/FOR INSERT/)
    expect(sql).not.toMatch(/FOR UPDATE/)
    expect(sql).not.toMatch(/FOR DELETE/)
  })

  it("has no auth.role()-only SELECT remaining for those two buckets", () => {
    const sql = readMigration()
    // Old leaky definitions must not be recreated.
    expect(sql).not.toMatch(/CREATE POLICY "Staff can view home visit images"/)
    expect(sql).not.toMatch(
      /CREATE POLICY "Authenticated users can view student photos"/,
    )
    // Every SELECT policy in this migration must carry school scoping,
    // not just `auth.role() = 'authenticated'`.
    for (const block of selectPolicyBlocks(sql)) {
      expect(block).toMatch(/can_access_student|get_user_school_id/)
    }
  })
})
