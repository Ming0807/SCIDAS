import { AlertTriangle, ListChecks, ShieldCheck, Users } from "lucide-react"

import { MetricCard } from "@/components/dashboard"
import { formatPercent } from "@/lib/student-care-formatters"
import type { StudentWorklistItem } from "@/lib/server/student-care-read-models"

function getPercent(count: number, total: number) {
  if (total <= 0) return "0.0%"
  return formatPercent((count / total) * 100)
}

export function RiskOverviewCards({
  students,
}: {
  students: StudentWorklistItem[]
}) {
  const total = students.length
  const highRisk = students.filter((student) => student.riskLevel === "high").length
  const watch = students.filter((student) => student.riskLevel === "watch").length
  const normal = students.filter((student) => student.riskLevel === "normal").length
  const openActions = students.reduce((count, student) => count + student.openActionCount, 0)

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <MetricCard
        title="นักเรียนทั้งหมด"
        value={total.toLocaleString("th-TH")}
        description="อยู่ในฐานวิเคราะห์ความเสี่ยง"
        icon={Users}
        status="primary"
      />
      <MetricCard
        title="เสี่ยงสูง"
        value={highRisk.toLocaleString("th-TH")}
        description={`${getPercent(highRisk, total)} ของนักเรียนทั้งหมด`}
        icon={AlertTriangle}
        status="high-risk"
      />
      <MetricCard
        title="เฝ้าระวัง"
        value={watch.toLocaleString("th-TH")}
        description={`${getPercent(watch, total)} ควรติดตามแนวโน้ม`}
        icon={ListChecks}
        status="watch"
      />
      <MetricCard
        title="ปกติ"
        value={normal.toLocaleString("th-TH")}
        description={`งานเปิด ${openActions.toLocaleString("th-TH")} รายการ`}
        icon={ShieldCheck}
        status="normal"
      />
    </div>
  )
}
