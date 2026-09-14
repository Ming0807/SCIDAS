import { describe, expect, it } from "vitest"

import {
  getAttendanceRisk,
  getAttendanceStatusLabel,
  getAttendanceStatusTone,
} from "./attendance-constants"

describe("attendance-constants", () => {
  describe("getAttendanceStatusLabel", () => {
    it("returns correct Thai labels for statuses", () => {
      expect(getAttendanceStatusLabel("present")).toBe("มาเรียน")
      expect(getAttendanceStatusLabel("absent")).toBe("ขาด")
      expect(getAttendanceStatusLabel("late")).toBe("มาสาย")
      expect(getAttendanceStatusLabel("leave")).toBe("ลา")
      expect(getAttendanceStatusLabel("sick")).toBe("ป่วย")
    })
  })

  describe("getAttendanceStatusTone", () => {
    it("returns correct tone for each status", () => {
      expect(getAttendanceStatusTone("present")).toBe("success")
      expect(getAttendanceStatusTone("absent")).toBe("danger")
      expect(getAttendanceStatusTone("late")).toBe("info")
      expect(getAttendanceStatusTone("leave")).toBe("warning")
      expect(getAttendanceStatusTone("sick")).toBe("warning")
    })
  })

  describe("getAttendanceRisk", () => {
    it("classifies attendance rate under 80% as critical risk (เสี่ยง มส.)", () => {
      const risk = getAttendanceRisk(79.9)
      expect(risk.riskLevel).toBe("critical")
      expect(risk.riskLabel).toContain("เสี่ยง มส.")
    })

    it("classifies attendance rate between 80% and 84.9% as watch risk", () => {
      const risk = getAttendanceRisk(82.5)
      expect(risk.riskLevel).toBe("watch")
      expect(risk.riskLabel).toContain("เฝ้าระวัง")
    })

    it("classifies attendance rate >= 85% as normal", () => {
      const risk = getAttendanceRisk(85)
      expect(risk.riskLevel).toBe("normal")
      expect(risk.riskLabel).toContain("ปกติ")

      const perfect = getAttendanceRisk(100)
      expect(perfect.riskLevel).toBe("normal")
    })
  })
})
