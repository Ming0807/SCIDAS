import React from "react"
import { Users, ShieldAlert, HeartPulse, CheckCircle2 } from "lucide-react"

import { MetricCard } from "@/components/dashboard"

type OverviewMetrics = {
  totalStudents: number
  highRiskStudents: number
  watchStudents: number
  openSupportCases: number
  activePlans: number
  openActionItems: number
  averageAttendance30d: number | null
}

export function DesktopOverviewStats({
  metrics,
}: {
  metrics?: OverviewMetrics | null
}) {
  const m = metrics

  return (
    <div className="bg-card rounded-xl p-5 border border-border shadow-sm mb-6">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-sm font-semibold text-foreground">
          ภาพรวมข้อมูลนักเรียน
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <MetricCard
          title="จำนวนนักเรียนทั้งหมด"
          value={m?.totalStudents?.toLocaleString() ?? "-"}
          icon={Users}
          status="neutral"
          statusLabel="คน"
        />
        <MetricCard
          title="กลุ่มเสี่ยง"
          value={m?.highRiskStudents?.toLocaleString() ?? "-"}
          icon={ShieldAlert}
          status="danger"
          statusLabel={
            m && m.totalStudents > 0
              ? `${Math.round((m.highRiskStudents / m.totalStudents) * 100)}%`
              : undefined
          }
        />
        <MetricCard
          title="อยู่ระหว่างการดูแล"
          value={m?.openSupportCases?.toLocaleString() ?? "-"}
          icon={HeartPulse}
          status="info"
          statusLabel={
            m && m.totalStudents > 0
              ? `${Math.round((m.openSupportCases / m.totalStudents) * 100)}%`
              : undefined
          }
        />
        <MetricCard
          title="แผนกำลังดำเนินการ"
          value={m?.activePlans?.toLocaleString() ?? "-"}
          icon={CheckCircle2}
          status="success"
          statusLabel="แผน"
        />
      </div>
    </div>
  )
}
