import { describe, expect, it } from "vitest"

import { STAFF_ROLE_LABELS } from "./staff-constants"

describe("staff-constants", () => {
  it("defines human-readable labels for all 5 user roles", () => {
    expect(STAFF_ROLE_LABELS.admin).toBe("ผู้ดูแลระบบ")
    expect(STAFF_ROLE_LABELS.director).toBe("ผู้อำนวยการ")
    expect(STAFF_ROLE_LABELS.counselor).toBe("ครูแนะแนว")
    expect(STAFF_ROLE_LABELS.homeroom_teacher).toBe("ครูที่ปรึกษา / ครูประจำชั้น")
    expect(STAFF_ROLE_LABELS.subject_teacher).toBe("ครูประจำวิชา")
  })
})
