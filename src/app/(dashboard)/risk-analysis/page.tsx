import React from "react"

import { ErrorState } from "@/components/feedback"
import { PageHeader, PageShell } from "@/components/dashboard"
import {
  getStudentWorklist,
  type StudentWorklistItem,
} from "@/lib/server/student-care-read-models"

import { RecalculateButton } from "./RecalculateButton"
import { RiskFactorsChart } from "./_components/risk-factors-chart"
import { RiskHistoryChart } from "./_components/risk-history-chart"
import { RiskMatrix } from "./_components/risk-matrix"
import { RiskOverviewCards } from "./_components/risk-overview-cards"
import { RiskRecommendations } from "./_components/risk-recommendations"
import { TopRiskStudents } from "./_components/top-risk-students"
import { MobileRiskProfile } from "./_components/mobile/mobile-risk-profile"

export default async function RiskAnalysisPage() {
  let students: StudentWorklistItem[] = []
  let loadError: string | null = null

  try {
    students = await getStudentWorklist({ limit: 500 })
  } catch (error) {
    loadError = error instanceof Error ? error.message : "Unknown risk data error"
  }

  const priorityStudents = students
    .filter(
      (student) =>
        student.riskLevel !== "normal" ||
        student.openActionCount > 0 ||
        student.openSupportCount > 0,
    )
    .sort((a, b) => b.priorityScore - a.priorityScore)
    .slice(0, 8)

  return (
    <div className="w-full overflow-x-hidden bg-background">
      <div className="block md:hidden">
        <MobileRiskProfile />
      </div>

      <div className="hidden md:block">
        <PageShell size="wide" spacing="default">
          <PageHeader
            title="วิเคราะห์ความเสี่ยง"
            description="จัดลำดับนักเรียนที่ควรดูแลก่อนจากคะแนนความเสี่ยง การมาเรียน เคส และงานติดตาม"
            actions={<RecalculateButton />}
          />

          {loadError ? (
            <ErrorState
              title="โหลดข้อมูลวิเคราะห์ความเสี่ยงไม่ได้"
              description="ตรวจสอบว่า Supabase ใช้ migration 0008_ux_data_foundation.sql แล้ว และผู้ใช้มีสิทธิ์เข้าถึงโรงเรียนนี้"
              details={loadError}
            />
          ) : null}

          <RiskOverviewCards students={students} />

          <div className="flex min-w-0 flex-col gap-6 xl:flex-row">
            <div className="flex min-w-0 shrink-0 xl:w-[65%]">
              <RiskMatrix />
            </div>
            <div className="flex min-w-0 flex-1">
              <TopRiskStudents students={priorityStudents} />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
            <RiskFactorsChart />
            <RiskHistoryChart />
            <RiskRecommendations students={students} />
          </div>
        </PageShell>
      </div>
    </div>
  )
}
