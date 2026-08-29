import fs from "fs"
import path from "path"
import { describe, it, expect } from "vitest"

const VALID_USER_ROLES = new Set([
  "admin",
  "director",
  "homeroom_teacher",
  "counselor",
  "subject_teacher",
])

const FORBIDDEN_ROLES = [
  "super_admin",
  "teacher", // legacy unqualified literal
  "system_admin",
]

describe("Database Migration Enum & Security Integrity", () => {
  const migrationsDir = path.resolve(process.cwd(), "supabase", "migrations")
  const migrationFiles = fs.readdirSync(migrationsDir).filter((f) => f.endsWith(".sql"))

  it("should have migration files present", () => {
    expect(migrationFiles.length).toBeGreaterThan(0)
  })

  it("should define user_role enum with exact 5 members in 0001_core_schema.sql", () => {
    const initMigration = fs.readFileSync(path.join(migrationsDir, "0001_core_schema.sql"), "utf8")
    expect(initMigration).toContain("CREATE TYPE user_role AS ENUM")
    for (const role of VALID_USER_ROLES) {
      expect(initMigration).toContain("'" + role + "'")
    }
    // Verify legacy roles are NOT in enum
    for (const forbidden of FORBIDDEN_ROLES) {
      const regex = new RegExp("CREATE TYPE user_role AS ENUM[\\s\\S]*?'" + forbidden + "'")
      expect(initMigration).not.toMatch(regex)
    }
  })

  it("should never reference nonexistent role literals in any migration enum cast or role check", () => {
    for (const file of migrationFiles) {
      const content = fs.readFileSync(path.join(migrationsDir, file), "utf8")

      // Check no occurrence of super_admin anywhere in migrations
      expect(
        content.match(/'super_admin'/gi),
        "Migration " + file + " contains forbidden role literal 'super_admin'",
      ).toBeNull()

      // Check no occurrence of 'teacher'::user_role or role = 'teacher' or role IN (..., 'teacher')
      const invalidTeacherCast = content.match(/'teacher'::user_role/gi)
      expect(
        invalidTeacherCast,
        "Migration " + file + " attempts to cast invalid literal 'teacher' to user_role",
      ).toBeNull()

      const invalidTeacherComparison = content.match(/role\s*(=|IN|\bIS\b)\s*\(?[^;)]*?'teacher'/gi)
      expect(
        invalidTeacherComparison,
        "Migration " + file + " compares role with invalid literal 'teacher'",
      ).toBeNull()
    }
  })

  it("should ensure student import functions check valid user roles", () => {
    const importMigration = fs.readFileSync(
      path.join(migrationsDir, "0012_student_import_security.sql"),
      "utf8",
    )
    // Must include director, admin, homeroom_teacher
    expect(importMigration).toContain("'director'")
    expect(importMigration).toContain("'admin'")
    expect(importMigration).toContain("'homeroom_teacher'")
    expect(importMigration).not.toContain("'teacher'")
    expect(importMigration).not.toContain("'super_admin'")
  })

  it("should ensure risk analytics migration references only valid user roles", () => {
    const riskMigration = fs.readFileSync(
      path.join(migrationsDir, "0014_risk_analytics.sql"),
      "utf8",
    )
    expect(riskMigration).not.toContain("'teacher'")
    expect(riskMigration).not.toContain("'super_admin'")
  })
})
