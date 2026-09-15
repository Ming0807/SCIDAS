import { describe, expect, it } from "vitest"
import {
  dashboardNavItems,
  getActiveNavigationItem,
  getBreadcrumbItems,
  getMobilePrimaryNavigation,
  getNavigationLabel,
  getNavItemsForRole,
  getSidebarNavigation,
  getGroupedSidebarNavigation,
  isActivePath,
} from "./navigation"

describe("Navigation Configuration and Helpers", () => {
  describe("Role-based navigation filtering", () => {
    it("returns only studentVisible items for student role", () => {
      const studentItems = getNavItemsForRole("student")
      expect(studentItems.length).toBeLessThan(dashboardNavItems.length)
      expect(studentItems.every((item) => item.studentVisible)).toBe(true)
      expect(studentItems.map((i) => i.key)).toEqual(["overview", "settings"])
    })

    it("returns all items for staff roles", () => {
      const staffRoles = [
        "admin",
        "director",
        "homeroom_teacher",
        "counselor",
        "subject_teacher",
      ]

      for (const role of staffRoles) {
        const items = getNavItemsForRole(role)
        expect(items.length).toBe(dashboardNavItems.length)
      }
    })

    it("filters sidebar navigation correctly", () => {
      const sidebarItems = getSidebarNavigation("admin")
      expect(sidebarItems.every((item) => item.placements.includes("sidebar"))).toBe(true)
    })

    it("filters mobile primary navigation correctly", () => {
      const mobileItems = getMobilePrimaryNavigation()
      expect(mobileItems.every((item) => item.placements.includes("mobilePrimary"))).toBe(true)
      expect(mobileItems.map((i) => i.key)).toEqual([
        "overview",
        "students",
        "notifications",
        "reports",
      ])
    })
  })

  describe("Path matching and active items", () => {
    it("matches exact paths correctly", () => {
      expect(isActivePath("/", "/")).toBe(true)
      expect(isActivePath("/students", "/students")).toBe(true)
      expect(isActivePath("/reports", "/reports")).toBe(true)
    })

    it("matches child routes without false positives on root", () => {
      expect(isActivePath("/students/123", "/students")).toBe(true)
      expect(isActivePath("/students", "/")).toBe(false)
      expect(isActivePath("/reports", "/")).toBe(false)
    })

    it("finds the most specific active navigation item", () => {
      const active = getActiveNavigationItem("/students/123")
      expect(active?.key).toBe("students")
    })
  })

  describe("Navigation labels and breadcrumbs", () => {
    it("resolves exact and dynamic navigation labels", () => {
      expect(getNavigationLabel("/")).toBe("ภาพรวม")
      expect(getNavigationLabel("/students")).toBe("นักเรียน")
      expect(getNavigationLabel("/students/std-123")).toBe("ข้อมูลนักเรียน")
      expect(getNavigationLabel("/behavior/record")).toBe("บันทึกพฤติกรรม")
      expect(getNavigationLabel("/home-visits/new")).toBe("บันทึกเยี่ยมบ้าน")
      expect(getNavigationLabel("/support/new")).toBe("สร้างเคสดูแลช่วยเหลือ")
      expect(getNavigationLabel("/development-plans/plan-1")).toBe("รายละเอียดแผน")
    })

    it("constructs breadcrumb items with correct labels and current flags", () => {
      const crumbs = getBreadcrumbItems("/students/std-123")
      expect(crumbs).toHaveLength(2)
      expect(crumbs[0]).toEqual({
        href: "/students",
        label: "นักเรียน",
        title: "นักเรียน",
        isCurrent: false,
        isLast: false,
      })
      expect(crumbs[1]).toEqual({
        href: "/students/std-123",
        label: "ข้อมูลนักเรียน",
        title: "ข้อมูลนักเรียน",
        isCurrent: true,
        isLast: true,
      })
    })

    it("groups sidebar navigation into 3 clear enterprise sections for staff", () => {
      const sections = getGroupedSidebarNavigation("admin")
      expect(sections.map((s) => s.key)).toEqual(["core", "care", "admin"])
      expect(sections[0].title).toBe("งานประจำวัน")
      expect(sections[1].title).toBe("ระบบดูแลช่วยเหลือ")
      expect(sections[2].title).toBe("ผลการเรียนและบริหาร")
    })

    it("returns single student-main group for student role", () => {
      const sections = getGroupedSidebarNavigation("student")
      expect(sections).toHaveLength(1)
      expect(sections[0].key).toBe("student-main")
    })
  })
})
