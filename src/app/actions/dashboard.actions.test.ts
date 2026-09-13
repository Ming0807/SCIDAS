import { describe, it, expect, vi, beforeEach } from "vitest"

import { getDashboardStats } from "./dashboard.actions"
import type { StudentCareDashboard } from "@/lib/server/student-care-read-models"

vi.mock("@/lib/server/student-care-read-models", () => ({
  getStudentCareDashboard: vi.fn(),
}))

import { getStudentCareDashboard } from "@/lib/server/student-care-read-models"

describe("dashboard.actions", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("transforms student care dashboard read model into dashboard stats correctly", async () => {
    const mockDashboard: StudentCareDashboard = {
      currentSemesterId: "sem-1",
      metrics: {
        totalStudents: 150,
        averageAttendance30d: 94.5,
        highRiskStudents: 5,
        watchStudents: 10,
        openSupportCases: 3,
        activePlans: 1,
        openActionItems: 2,
      },
      priorityStudents: [],
      actionQueue: [
        {
          id: "queue-1",
          studentId: "stu-1",
          studentName: "Somchai Jaidee",
          title: "Follow up missing student",
          description: "Absent for 3 consecutive days",
          category: "attendance",
          priority: "high",
          status: "todo",
          dueDate: null,
          assignedTo: null,
          sourceTable: "attendance_records",
          sourceId: "att-1",
        },
      ],
    }

    vi.mocked(getStudentCareDashboard).mockResolvedValueOnce(mockDashboard)

    const stats = await getDashboardStats()

    expect(stats.studentTotal).toBe(150)
    expect(stats.attendanceToday).toBe(94.5)
    expect(stats.riskGroup).toBe(15) // 5 + 10
    expect(stats.openCases).toBe(5) // 3 + 2
    expect(stats.recentCases).toHaveLength(1)
    expect(stats.recentCases[0]).toEqual({
      id: "queue-1",
      title: "Follow up missing student",
      studentName: "Somchai Jaidee",
      description: "Absent for 3 consecutive days",
      priority: "high",
    })
  })

  it("handles null or missing studentName gracefully", async () => {
    const mockDashboard: StudentCareDashboard = {
      currentSemesterId: "sem-1",
      metrics: {
        totalStudents: 100,
        averageAttendance30d: null,
        highRiskStudents: 0,
        watchStudents: 0,
        openSupportCases: 0,
        activePlans: 0,
        openActionItems: 0,
      },
      priorityStudents: [],
      actionQueue: [
        {
          id: "queue-2",
          studentId: null,
          studentName: null,
          title: "System Notice",
          description: "Routine check",
          category: "system",
          priority: "low",
          status: "todo",
          dueDate: null,
          assignedTo: null,
          sourceTable: "system_tasks",
          sourceId: "task-1",
        },
      ],
    }

    vi.mocked(getStudentCareDashboard).mockResolvedValueOnce(mockDashboard)

    const stats = await getDashboardStats()
    expect(stats.attendanceToday).toBe(0)
    expect(stats.recentCases[0].studentName).toBe("-")
  })
})
