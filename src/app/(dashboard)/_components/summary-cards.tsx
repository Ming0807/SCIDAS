import Link from "next/link"
import { AlertTriangle, ClipboardCheck, ListChecks, ShieldAlert, Users } from "lucide-react"

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
  const attendanceRate = metrics.averageAttendance30d ?? 0
  const isAttendanceGood = attendanceRate >= 80

  return (
    <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2 xl:grid-cols-4">
      <Link href="/students" className="block group focus-visible:outline-none">
        <MetricCard
          title="นักเรียนทั้งหมดในระบบ"
          value={<span className="tabular-nums font-bold tracking-tight">{metrics.totalStudents.toLocaleString("th-TH")}</span>}
          description={
            <span className="flex items-center gap-1 text-xs">
              อัตรามาเรียน 30 วัน: <strong className="tabular-nums text-foreground">{formatPercent(metrics.averageAttendance30d)}</strong>
            </span>
          }
          icon={Users}
          status="primary"
          delta={{
            value: isAttendanceGood ? "ปกติ" : "เฝ้าระวัง มส.",
            trend: isAttendanceGood ? "up" : "down",
            tone: isAttendanceGood ? "success" : "danger",
          }}
          className="transition-all duration-200 group-hover:border-primary/40 group-hover:shadow-xs cursor-pointer rounded-2xl"
        />
      </Link>

      <Link href="/risk-analysis" className="block group focus-visible:outline-none">
        <MetricCard
          title="กลุ่มเฝ้าระวัง (Watch)"
          value={<span className="tabular-nums font-bold tracking-tight text-amber-600 dark:text-amber-400">{metrics.watchStudents.toLocaleString("th-TH")}</span>}
          description={
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              สัดส่วน: <strong className="tabular-nums text-foreground">{getPercent(metrics.watchStudents, metrics.totalStudents)}</strong> ของทั้งโรงเรียน
            </span>
          }
          icon={Users}
          status="watch"
          delta={{
            value: "เฝ้าระวัง",
            tone: "watch",
          }}
          className="transition-all duration-200 group-hover:border-amber-400/50 group-hover:shadow-xs cursor-pointer rounded-2xl"
        />
      </Link>

      <Link href="/risk-analysis" className="block group focus-visible:outline-none">
        <MetricCard
          title="กลุ่มเสี่ยงสูง (Critical/High)"
          value={<span className="tabular-nums font-bold tracking-tight text-destructive">{metrics.highRiskStudents.toLocaleString("th-TH")}</span>}
          description={
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              ต้องมีครูผู้รับผิดชอบดูแล <strong className="tabular-nums text-foreground">{getPercent(metrics.highRiskStudents, metrics.totalStudents)}</strong>
            </span>
          }
          icon={metrics.highRiskStudents > 0 ? ShieldAlert : AlertTriangle}
          status="high-risk"
          delta={{
            value: metrics.highRiskStudents > 0 ? "ต้องช่วยเหลือ" : "ไม่มีเคสเสี่ยง",
            tone: metrics.highRiskStudents > 0 ? "danger" : "success",
          }}
          className="transition-all duration-200 group-hover:border-destructive/40 group-hover:shadow-xs cursor-pointer rounded-2xl"
        />
      </Link>

      <Link href="/support" className="block group focus-visible:outline-none">
        <MetricCard
          title="ภารกิจดูแลที่เปิดอยู่"
          value={
            <span className="tabular-nums font-bold tracking-tight">
              {(metrics.openSupportCases + metrics.openActionItems).toLocaleString("th-TH")}
            </span>
          }
          description={
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              แผนพัฒนาติดตาม: <strong className="tabular-nums text-foreground">{metrics.activePlans.toLocaleString("th-TH")}</strong> แผน
            </span>
          }
          icon={metrics.openActionItems > 0 ? ListChecks : ClipboardCheck}
          status={metrics.openActionItems > 0 ? "info" : "normal"}
          delta={{
            value: `${metrics.openSupportCases} เคสเปิด`,
            tone: metrics.openSupportCases > 0 ? "info" : "neutral",
          }}
          className="transition-all duration-200 group-hover:border-sky-400/50 group-hover:shadow-xs cursor-pointer rounded-2xl"
        />
      </Link>
    </div>
  )
}
