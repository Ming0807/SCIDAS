"use server"

import { getStudentCareDashboard } from "@/lib/server/student-care-read-models"

export async function getDashboardStats() {
  const dashboard = await getStudentCareDashboard()
  const riskGroup = dashboard.metrics.highRiskStudents + dashboard.metrics.watchStudents

  return {
    studentTotal: dashboard.metrics.totalStudents,
    attendanceToday: dashboard.metrics.averageAttendance30d ?? 0,
    riskGroup,
    openCases: dashboard.metrics.openSupportCases + dashboard.metrics.openActionItems,
    attendanceTrend: [],
    recentCases: dashboard.actionQueue.map((item) => ({
      id: item.id,
      title: item.title,
      studentName: item.studentName ?? "-",
      description: item.description,
      priority: item.priority,
    })),
  }
}
