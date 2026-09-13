import { describe, it, expect, vi, beforeEach } from "vitest"

import {
  recalculateStudentRiskAction,
  calculateRiskScore,
  recalculateAllRiskScores,
  getRiskAssessments,
} from "./risk.actions"

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}))

vi.mock("@/lib/server/current-user", () => ({
  getCurrentUserContext: vi.fn(),
  getCurrentSemesterId: vi.fn(),
}))

vi.mock("@/utils/supabase/server", () => ({
  createClient: vi.fn(),
}))

import { getCurrentSemesterId, getCurrentUserContext } from "@/lib/server/current-user"
import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"

const validUuid = "123e4567-e89b-12d3-a456-426614174000"

describe("risk.actions", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("recalculateStudentRiskAction", () => {
    it("fails with VALIDATION_ERROR when studentId is not a valid UUID", async () => {
      const result = await recalculateStudentRiskAction("invalid-id")
      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.code).toBe("VALIDATION_ERROR")
      }
    })

    it("fails with UNAUTHORIZED when user is not authenticated", async () => {
      vi.mocked(getCurrentUserContext).mockResolvedValueOnce({
        userId: "user-1",
        schoolId: "sch-1",
        role: "homeroom_teacher",
        profileId: null,
        studentId: null,
      })

      const result = await recalculateStudentRiskAction(validUuid)
      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.code).toBe("UNAUTHORIZED")
      }
    })

    it("fails with NOT_FOUND if current semester cannot be resolved", async () => {
      vi.mocked(getCurrentUserContext).mockResolvedValueOnce({
        userId: "user-1",
        schoolId: "sch-1",
        role: "homeroom_teacher",
        profileId: "prof-1",
        studentId: null,
      })
      vi.mocked(getCurrentSemesterId).mockResolvedValueOnce(null)

      const result = await recalculateStudentRiskAction(validUuid)
      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.code).toBe("NOT_FOUND")
      }
    })

    it("calls database RPC and revalidates paths on success", async () => {
      vi.mocked(getCurrentUserContext).mockResolvedValueOnce({
        userId: "user-1",
        schoolId: "sch-1",
        role: "homeroom_teacher",
        profileId: "prof-1",
        studentId: null,
      })
      vi.mocked(getCurrentSemesterId).mockResolvedValueOnce("sem-1")

      const mockRiskData = {
        studentId: validUuid,
        semesterId: "sem-1",
        assessmentId: "asm-1",
        overallScore: 65,
        riskLevel: "medium",
        attendanceRate: 85,
        behaviorPoints: 10,
        failingGrades: 1,
        openSupportCases: 1,
      }

      const mockRpc = vi.fn().mockResolvedValue({
        data: mockRiskData,
        error: null,
      })

      // @ts-expect-error mock supabase client
      vi.mocked(createClient).mockResolvedValueOnce({
        rpc: mockRpc,
      })

      const result = await recalculateStudentRiskAction(validUuid)
      expect(result.ok).toBe(true)
      if (result.ok && result.data) {
        expect(result.data.overallScore).toBe(65)
        expect(result.data.riskLevel).toBe("medium")
      }

      expect(mockRpc).toHaveBeenCalledWith("recalculate_student_risk_signals", {
        p_student_id: validUuid,
        p_semester_id: "sem-1",
      })
      expect(revalidatePath).toHaveBeenCalledWith("/risk-analysis")
      expect(revalidatePath).toHaveBeenCalledWith(`/students/${validUuid}`)
    })

    it("returns INTERNAL_ERROR if rpc call fails", async () => {
      vi.mocked(getCurrentUserContext).mockResolvedValueOnce({
        userId: "user-1",
        schoolId: "sch-1",
        role: "homeroom_teacher",
        profileId: "prof-1",
        studentId: null,
      })
      vi.mocked(getCurrentSemesterId).mockResolvedValueOnce("sem-1")

      // @ts-expect-error mock supabase client
      vi.mocked(createClient).mockResolvedValueOnce({
        rpc: vi.fn().mockResolvedValue({
          data: null,
          error: { message: "RPC error" },
        }),
      })

      const result = await recalculateStudentRiskAction(validUuid)
      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.code).toBe("INTERNAL_ERROR")
      }
    })
  })

  describe("calculateRiskScore", () => {
    it("returns success format when recalculation succeeds", async () => {
      vi.mocked(getCurrentUserContext).mockResolvedValueOnce({
        userId: "user-1",
        schoolId: "sch-1",
        role: "homeroom_teacher",
        profileId: "prof-1",
        studentId: null,
      })
      vi.mocked(getCurrentSemesterId).mockResolvedValueOnce("sem-1")

      // @ts-expect-error mock supabase client
      vi.mocked(createClient).mockResolvedValueOnce({
        rpc: vi.fn().mockResolvedValue({
          data: {
            overallScore: 80,
            riskLevel: "high",
          },
          error: null,
        }),
      })

      const result = await calculateRiskScore(validUuid)
      expect(result).toEqual({
        success: true,
        score: 80,
        level: "high",
      })
    })

    it("returns default fallback when recalculation fails", async () => {
      const result = await calculateRiskScore("invalid")
      expect(result).toEqual({
        success: false,
        score: 0,
        level: "normal",
      })
    })
  })

  describe("recalculateAllRiskScores", () => {
    it("returns unauthorized if user context is missing", async () => {
      vi.mocked(getCurrentUserContext).mockResolvedValueOnce({
        userId: "user-1",
        schoolId: "",
        role: "homeroom_teacher",
        profileId: null,
        studentId: null,
      })

      const result = await recalculateAllRiskScores()
      expect(result.success).toBe(false)
      expect(result.error).toBe("Unauthorized")
    })

    it("iterates through active students and runs rpc for each", async () => {
      vi.mocked(getCurrentUserContext).mockResolvedValueOnce({
        userId: "user-1",
        schoolId: "sch-1",
        role: "admin",
        profileId: "prof-1",
        studentId: null,
      })
      vi.mocked(getCurrentSemesterId).mockResolvedValueOnce("sem-1")

      const mockRpc = vi.fn().mockResolvedValue({ error: null })
      const mockClient = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({
                data: [{ id: "stu-1" }, { id: "stu-2" }],
                error: null,
              }),
            }),
          }),
        }),
        rpc: mockRpc,
      }
      // @ts-expect-error mock supabase client
      vi.mocked(createClient).mockResolvedValueOnce(mockClient)

      const result = await recalculateAllRiskScores()
      expect(result.success).toBe(true)
      expect(result.processedCount).toBe(2)
      expect(mockRpc).toHaveBeenCalledTimes(2)
      expect(revalidatePath).toHaveBeenCalledWith("/risk-analysis")
    })
  })

  describe("getRiskAssessments", () => {
    it("returns empty array if schoolId is missing", async () => {
      vi.mocked(getCurrentUserContext).mockResolvedValueOnce({
        userId: "user-1",
        schoolId: "",
        role: "homeroom_teacher",
        profileId: null,
        studentId: null,
      })
      // @ts-expect-error mock supabase client
      vi.mocked(createClient).mockResolvedValueOnce({})

      const result = await getRiskAssessments()
      expect(result).toEqual([])
    })

    it("returns ordered assessments", async () => {
      vi.mocked(getCurrentUserContext).mockResolvedValueOnce({
        userId: "user-1",
        schoolId: "sch-1",
        role: "homeroom_teacher",
        profileId: "prof-1",
        studentId: null,
      })

      const mockData = [
        { id: "asm-1", overall_score: 90, risk_level: "critical" },
        { id: "asm-2", overall_score: 40, risk_level: "low" },
      ]

      const mockClient = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({ data: mockData, error: null }),
            }),
          }),
        }),
      }
      // @ts-expect-error mock supabase client
      vi.mocked(createClient).mockResolvedValueOnce(mockClient)

      const result = await getRiskAssessments()
      expect(result).toHaveLength(2)
      expect((result[0] as unknown as { overall_score: number }).overall_score).toBe(90)
    })
  })
})
