import { describe, expect, it } from "vitest"
import {
  getSupportPriorityLabel,
  getSupportStatusLabel,
  getSupportStatusTone,
  getSupportTypeLabel,
} from "./support-constants"

describe("support-constants", () => {
  it("returns correct labels for support types", () => {
    expect(getSupportTypeLabel("academic")).toBe("ด้านวิชาการ/การเรียน")
    expect(getSupportTypeLabel("behavioral")).toBe("ด้านพฤติกรรม/วินัย")
    expect(getSupportTypeLabel("emotional")).toBe("ด้านจิตใจและอารมณ์")
    expect(getSupportTypeLabel("financial")).toBe("ด้านเศรษฐกิจ/ทุนทรัพย์")
    expect(getSupportTypeLabel("health")).toBe("ด้านสุขภาพกาย")
  })

  it("returns correct labels for support statuses", () => {
    expect(getSupportStatusLabel("pending")).toBe("รอดำเนินการ")
    expect(getSupportStatusLabel("in_progress")).toBe("กำลังดำเนินการช่วยเหลือ")
    expect(getSupportStatusLabel("completed")).toBe("เสร็จสิ้น/บรรลุผล")
    expect(getSupportStatusLabel("referred")).toBe("ส่งต่อหน่วยงานอื่น")
    expect(getSupportStatusLabel("cancelled")).toBe("ยกเลิก/ยุติเคส")
  })

  it("returns correct priority labels", () => {
    expect(getSupportPriorityLabel("low")).toBe("ต่ำ (ทั่วไป)")
    expect(getSupportPriorityLabel("critical")).toBe("วิกฤต (เร่งด่วนที่สุด)")
    expect(getSupportPriorityLabel(null)).toBe("ไม่ระบุ")
  })

  it("returns appropriate badge tone for status", () => {
    expect(getSupportStatusTone("completed")).toBe("normal")
    expect(getSupportStatusTone("in_progress")).toBe("info")
    expect(getSupportStatusTone("pending")).toBe("watch")
    expect(getSupportStatusTone("referred")).toBe("high-risk")
    expect(getSupportStatusTone("cancelled")).toBe("neutral")
  })
})
