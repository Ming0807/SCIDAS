import { AlertTriangle, ClipboardCheck, ListChecks, Users } from "lucide-react"

import { MetricCard } from "@/components/dashboard"
import { formatPercent } from "@/lib/student-care-formatters"
import type { StudentCareDashboard } from "@/lib/server/student-care-read-models"

type DashboardMetrics = StudentCareDashboard["metrics"]

function getPercent(count: number, total: number) {
  if (total <= 0) {
    return "0.0%"
  }

  return formatPercent((count / total) * 100)
}

export function SummaryCards({ metrics }: { metrics: DashboardMetrics }) {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
      <MetricCard
        title="นักเรียนทั้งหมด"
        value={metrics.totalStudents.toLocaleString("th-TH")}
        description={`อัตรามาเรียน 30 วัน ${formatPercent(metrics.averageAttendance30d)}`}
        icon={Users}
        status="primary"
      />
      <MetricCard
        title="กลุ่มเฝ้าระวัง"
        value={metrics.watchStudents.toLocaleString("th-TH")}
        description={`${getPercent(metrics.watchStudents, metrics.totalStudents)} ของนักเรียนทั้งหมด`}
        icon={Users}
        status="watch"
      />
      <MetricCard
        title="เสี่ยงสูง"
        value={metrics.highRiskStudents.toLocaleString("th-TH")}
        description={`${getPercent(metrics.highRiskStudents, metrics.totalStudents)} ต้องมีผู้รับผิดชอบ`}
        icon={AlertTriangle}
        status="high-risk"
      />
      <MetricCard
        title="งานดูแลที่เปิดอยู่"
        value={(metrics.openSupportCases + metrics.openActionItems).toLocaleString("th-TH")}
        description={`แผนกำลังติดตาม ${metrics.activePlans.toLocaleString("th-TH")} แผน`}
        icon={metrics.openActionItems > 0 ? ListChecks : ClipboardCheck}
        status={metrics.openActionItems > 0 ? "info" : "normal"}
      />
    </div>
  )
}
