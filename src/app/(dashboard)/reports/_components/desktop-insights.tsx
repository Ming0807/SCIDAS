import React from "react"
import { TrendingUp, Users, GraduationCap } from "lucide-react"

type OverviewMetrics = {
  totalStudents: number
  highRiskStudents: number
  watchStudents: number
  openSupportCases: number
  activePlans: number
  openActionItems: number
  averageAttendance30d: number | null
}

export function DesktopInsights({
  metrics,
}: {
  metrics?: OverviewMetrics | null
}) {
  const m = metrics

  return (
    <div className="space-y-3">
      {/* Risk insight */}
      <div className="bg-card rounded-xl border border-border shadow-sm p-4 flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0">
          <TrendingUp className="w-5 h-5 text-red-600" />
        </div>
        <div className="min-w-0">
          <div className="text-sm font-semibold text-foreground">
            กลุ่มเสี่ยงที่ต้องดูแล
          </div>
          <div className="text-xs text-muted-foreground">
            {m
              ? `${m.highRiskStudents + m.watchStudents} คน จาก ${m.totalStudents} คน (${m.totalStudents > 0 ? Math.round(((m.highRiskStudents + m.watchStudents) / m.totalStudents) * 100) : 0}%)`
              : "กำลังโหลดข้อมูล..."}
          </div>
        </div>
      </div>

      {/* Attendance insight */}
      <div className="bg-card rounded-xl border border-border shadow-sm p-4 flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
          <Users className="w-5 h-5 text-emerald-600" />
        </div>
        <div className="min-w-0">
          <div className="text-sm font-semibold text-foreground">
            อัตราการมาเรียนเฉลี่ย 30 วัน
          </div>
          <div className="text-xs text-muted-foreground">
            {m?.averageAttendance30d != null
              ? `${m.averageAttendance30d.toFixed(1)}%`
              : "กำลังโหลดข้อมูล..."}
          </div>
        </div>
      </div>

      {/* Plans insight */}
      <div className="bg-card rounded-xl border border-border shadow-sm p-4 flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
          <GraduationCap className="w-5 h-5 text-blue-600" />
        </div>
        <div className="min-w-0">
          <div className="text-sm font-semibold text-foreground">
            แผนพัฒนาที่กำลังดำเนินการ
          </div>
          <div className="text-xs text-muted-foreground">
            {m
              ? `${m.activePlans} แผน, ${m.openActionItems} งานที่ต้องทำ`
              : "กำลังโหลดข้อมูล..."}
          </div>
        </div>
      </div>
    </div>
  )
}
