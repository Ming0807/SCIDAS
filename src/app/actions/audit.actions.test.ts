import { describe, it, expect, vi, beforeEach } from "vitest"

vi.mock("@/lib/server/current-user", () => ({
  getCurrentUserContext: vi.fn(),
}))

vi.mock("@/utils/supabase/server", () => ({
  createClient: vi.fn(),
}))

import { getCurrentUserContext } from "@/lib/server/current-user"
import { createClient } from "@/utils/supabase/server"
import { getAuditLogsAction } from "./audit.actions"

describe("audit.actions", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("fails with FORBIDDEN if user is a teacher or student", async () => {
    vi.mocked(getCurrentUserContext).mockResolvedValueOnce({
      userId: "user-teacher",
      schoolId: "sch-1",
      role: "homeroom_teacher",
      profileId: "prof-1",
      studentId: null,
    })

    const result = await getAuditLogsAction()
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.code).toBe("FORBIDDEN")
    }
  })

  it("successfully returns audit logs and metrics for admin", async () => {
    vi.mocked(getCurrentUserContext).mockResolvedValueOnce({
      userId: "user-admin",
      schoolId: "sch-1",
      role: "admin",
      profileId: "prof-admin",
      studentId: null,
    })

    const mockLogs = [
      {
        id: "log-1",
        action: "UPDATE",
        table_name: "students",
        record_id: "stu-123",
        school_id: "sch-1",
        user_id: "user-teacher",
        ip_address: "127.0.0.1",
        user_agent: "Mozilla/5.0",
        old_data: { risk_level: "normal" },
        new_data: { risk_level: "watch" },
        created_at: "2026-09-10T12:00:00Z",
        actor: {
          first_name: "สมศรี",
          last_name: "มีสุข",
          role: "homeroom_teacher",
        },
      },
      {
        id: "log-2",
        action: "EXPORT",
        table_name: "reports",
        record_id: null,
        school_id: "sch-1",
        user_id: "user-admin",
        ip_address: "127.0.0.1",
        user_agent: "Mozilla/5.0",
        old_data: null,
        new_data: { reportType: "student_care_summary", format: "pdf" },
        created_at: "2026-09-10T13:00:00Z",
        actor: {
          first_name: "แอดมิน",
          last_name: "ระบบ",
          role: "admin",
        },
      },
    ]

    const mockQuery = {
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      range: vi.fn().mockResolvedValue({
        data: mockLogs,
        count: 2,
        error: null,
      }),
    }

    vi.mocked(createClient).mockResolvedValueOnce({
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue(mockQuery),
      }),
    } as unknown as Awaited<ReturnType<typeof createClient>>)

    const result = await getAuditLogsAction()
    expect(result.ok).toBe(true)
    if (result.ok && result.data) {
      expect(result.data.items).toHaveLength(2)
      expect(result.data.items[0].actor_name).toBe("สมศรี มีสุข")
      expect(result.data.items[0].action).toBe("UPDATE")
      expect(result.data.metrics.mutationEvents).toBe(1)
      expect(result.data.metrics.exportEvents).toBe(1)
    }
  })
})
