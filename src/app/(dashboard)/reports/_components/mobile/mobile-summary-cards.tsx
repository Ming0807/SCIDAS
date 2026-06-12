import React from "react"
import {
  Calendar as CalendarIcon,
  BookOpen,
  Smile,
  HeartPulse,
} from "lucide-react"

type SummaryMetrics = {
  totalStudents?: number
  highRiskStudents?: number
  watchStudents?: number
  openSupportCases?: number
  activePlans?: number
  openActionItems?: number
  averageAttendance30d?: number | null
}

export function MobileSummaryCards({
  metrics,
}: {
  metrics?: SummaryMetrics | null
}) {
  const m = metrics

  return (
    <div className="px-4 mb-6">
      <h3 className="text-sm font-semibold text-foreground mb-4">
        สรุปภาพรวม
      </h3>

      <div className="grid grid-cols-2 gap-3">
        {/* Attendance */}
        <div className="bg-card rounded-xl p-4 border border-border shadow-sm flex flex-col justify-between items-center text-center">
          <div className="flex items-center gap-1.5 mb-2">
            <div className="w-6 h-6 rounded-md bg-blue-50 flex items-center justify-center shrink-0">
              <CalendarIcon className="w-3.5 h-3.5 text-blue-500" />
            </div>
            <span className="text-xs font-semibold text-foreground">
              การมาเรียน
            </span>
          </div>
          <span className="text-lg font-bold text-foreground mb-1">
            {m?.averageAttendance30d != null
              ? `${m.averageAttendance30d.toFixed(1)}%`
              : "-"}
          </span>
          <span className="text-xs text-muted-foreground mb-3">
            เฉลี่ย 30 วัน
          </span>
        </div>

        {/* Total Students */}
        <div className="bg-card rounded-xl p-4 border border-border shadow-sm flex flex-col justify-between items-center text-center">
          <div className="flex items-center gap-1.5 mb-2">
            <div className="w-6 h-6 rounded-md bg-orange-50 flex items-center justify-center shrink-0">
              <BookOpen className="w-3.5 h-3.5 text-orange-500" />
            </div>
            <span className="text-xs font-semibold text-foreground">
              นักเรียน
            </span>
          </div>
          <span className="text-lg font-bold text-foreground mb-1">
            {m?.totalStudents?.toLocaleString() ?? "-"}
          </span>
          <span className="text-xs text-muted-foreground mb-3">คนทั้งหมด</span>
        </div>

        {/* Risk */}
        <div className="bg-card rounded-xl p-4 border border-border shadow-sm flex flex-col justify-between items-center text-center">
          <div className="flex items-center gap-1.5 mb-2">
            <div className="w-6 h-6 rounded-md bg-amber-50 flex items-center justify-center shrink-0">
              <Smile className="w-3.5 h-3.5 text-amber-500" />
            </div>
            <span className="text-xs font-semibold text-foreground">
              กลุ่มเสี่ยง
            </span>
          </div>
          <span className="text-lg font-bold text-foreground mb-1">
            {m ? (m.highRiskStudents ?? 0) + (m.watchStudents ?? 0) : "-"}
          </span>
          <span className="text-xs text-muted-foreground mb-3">คน</span>
        </div>

        {/* Support */}
        <div className="bg-card rounded-xl p-4 border border-border shadow-sm flex flex-col justify-between items-center text-center">
          <div className="flex items-center gap-1.5 mb-2">
            <div className="w-6 h-6 rounded-md bg-purple-50 flex items-center justify-center shrink-0">
              <HeartPulse className="w-3.5 h-3.5 text-purple-500" />
            </div>
            <span className="text-xs font-semibold text-foreground">
              แผนพัฒนา
            </span>
          </div>
          <span className="text-lg font-bold text-foreground mb-1">
            {m?.activePlans?.toLocaleString() ?? "-"}
          </span>
          <span className="text-xs text-muted-foreground mb-3">
            กำลังดำเนินการ
          </span>
        </div>
      </div>
    </div>
  )
}
