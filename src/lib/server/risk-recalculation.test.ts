import { describe, it, expect, vi, beforeEach } from "vitest"
import { recalculateStudentRiskAction, recalculateAllRiskScores } from "@/app/actions/risk.actions"

const mockRpc = vi.fn()
const mockFrom = vi.fn()

vi.mock("@/utils/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    rpc: mockRpc,
    from: mockFrom,
  })),
}))

vi.mock("@/lib/server/current-user", () => ({
  getCurrentUserContext: vi.fn(async () => ({
    userId: "user-1",
    profileId: "profile-1",
    schoolId: "school-1",
    role: "admin",
  })),
  getCurrentSemesterId: vi.fn(async () => "semester-1"),
}))

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}))

describe("Risk Recalculation Server Actions", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("recalculateStudentRiskAction", () => {
    it("should reject invalid UUID", async () => {
      const res = await recalculateStudentRiskAction("not-a-uuid")
      expect(res.ok).toBe(false)
      expect(res.message).toContain("รหัสนักเรียนไม่ถูกต้อง")
    })

    it("should call recalculate_student_risk_signals RPC and return calculated risk data", async () => {
      const validStudentId = "a0000000-0000-4000-8000-000000000001"
      mockRpc.mockResolvedValue({
        data: {
          studentId: validStudentId,
          semesterId: "semester-1",
          assessmentId: "b0000000-0000-4000-8000-000000000001",
          overallScore: 65,
          riskLevel: "high",
          attendanceRate: 72.5,
          behaviorPoints: 15,
          failingGrades: 2,
          openSupportCases: 1,
        },
        error: null,
      })

      const res = await recalculateStudentRiskAction(validStudentId)
      expect(res.ok).toBe(true)
      if (res.ok) {
        expect(res.data?.riskLevel).toBe("high")
        expect(res.data?.overallScore).toBe(65)
      }
      expect(mockRpc).toHaveBeenCalledWith("recalculate_student_risk_signals", {
        p_student_id: validStudentId,
        p_semester_id: "semester-1",
      })
    })
  })

  describe("recalculateAllRiskScores", () => {
    it("should iterate through active students and recalculate risk", async () => {
      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({
              data: [
                { id: "a0000000-0000-0000-0000-000000000001" },
                { id: "a0000000-0000-0000-0000-000000000002" },
              ],
              error: null,
            }),
          }),
        }),
      })

      mockRpc.mockResolvedValue({ data: {}, error: null })

      const res = await recalculateAllRiskScores()
      expect(res.success).toBe(true)
      expect(res.processedCount).toBe(2)
      expect(mockRpc).toHaveBeenCalledTimes(2)
    })
  })
})
