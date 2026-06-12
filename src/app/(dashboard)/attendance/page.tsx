import React from "react"

import { PageHeader, PageShell, MetricCard } from "@/components/dashboard"
import { StatusBadge } from "@/components/dashboard/status-badge"
import { EmptyState } from "@/components/feedback/empty-state"
import { ErrorState } from "@/components/feedback/error-state"
import { cn } from "@/lib/utils"
import { getStudentInitials, formatGradeLevel } from "@/lib/student-care-formatters"
import {
  getAttendanceDashboard,
  getAttendanceStatusTone,
  type AttendanceRecordItem,
} from "@/lib/server/attendance-read-models"

export default async function AttendancePage() {
  let dashboard: Awaited<ReturnType<typeof getAttendanceDashboard>>

  try {
    dashboard = await getAttendanceDashboard()
  } catch {
    return (
      <PageShell size="wide">
        <ErrorState
          title="ไม่สามารถโหลดข้อมูลการมาเรียนได้"
          description="กรุณาลองใหม่อีกครั้ง"
        />
      </PageShell>
    )
  }

  const { summary, records } = dashboard

  return (
    <PageShell size="wide">
      <PageHeader
        title="การมาเรียน"
        description={`ข้อมูลวันที่ ${new Intl.DateTimeFormat("th-TH", { day: "numeric", month: "long", year: "numeric" }).format(new Date(dashboard.date))}`}
        actions={null}
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <MetricCard
          title="ทั้งหมด"
          value={summary.total.toLocaleString()}
          status="neutral"
          size="compact"
          statusLabel="คน"
        />
        <MetricCard
          title="มาเรียน"
          value={summary.present.toLocaleString()}
          status="success"
          size="compact"
          statusLabel={summary.presentRate != null ? `${summary.presentRate}%` : undefined}
        />
        <MetricCard
          title="ขาด"
          value={summary.absent.toLocaleString()}
          status="danger"
          size="compact"
        />
        <MetricCard
          title="มาสาย"
          value={summary.late.toLocaleString()}
          status="info"
          size="compact"
        />
        <MetricCard
          title="ลา / ป่วย"
          value={(summary.leave + summary.sick).toLocaleString()}
          status="warning"
          size="compact"
        />
      </div>

      {/* Attendance Table */}
      <div className="bg-card rounded-xl border border-border shadow-sm flex flex-col min-h-0">
        <div className="p-5 border-b border-border flex items-center justify-between">
          <h2 className="text-base font-semibold text-foreground">
            รายชื่อนักเรียน
          </h2>
          <span className="text-xs text-muted-foreground">
            {summary.total} คน · อัตราการมา {summary.presentRate ?? "-"}%
          </span>
        </div>

        {records.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title="ไม่มีข้อมูลการมาเรียนวันนี้"
              description="ยังไม่มีการบันทึกการมาเรียนสำหรับวันนี้"
            />
          </div>
        ) : (
          <div className="p-0 overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[650px]">
              <thead>
                <tr className="border-b border-border text-xs font-semibold text-muted-foreground bg-muted/30">
                  <th className="py-3 px-4 whitespace-nowrap">#</th>
                  <th className="py-3 px-4 whitespace-nowrap">นักเรียน</th>
                  <th className="py-3 px-4 whitespace-nowrap">ชั้น</th>
                  <th className="py-3 px-4 whitespace-nowrap">สถานะ</th>
                  <th className="py-3 px-4 whitespace-nowrap">เวลา</th>
                  <th className="py-3 px-4 hidden md:table-cell whitespace-nowrap">หมายเหตุ</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {records.map((record, i) => (
                  <AttendanceRow key={record.id} record={record} index={i + 1} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </PageShell>
  )
}

function AttendanceRow({
  record,
  index,
}: {
  record: AttendanceRecordItem
  index: number
}) {
  const initials = getStudentInitials(record.studentName)
  const tone = getAttendanceStatusTone(record.status)

  return (
    <tr className="border-b border-border hover:bg-muted/30 transition-colors">
      <td className="py-3 px-4 text-muted-foreground text-xs">{index}</td>
      <td className="py-3 px-4 whitespace-nowrap">
        <div className="flex items-center gap-3">
          <span
            className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
              record.status === "present"
                ? "bg-emerald-100 text-emerald-700"
                : record.status === "absent"
                  ? "bg-red-100 text-red-700"
                  : "bg-amber-100 text-amber-700",
            )}
            aria-hidden="true"
          >
            {initials}
          </span>
          <div>
            <div className="font-semibold text-foreground">
              {record.studentName}
            </div>
            <div className="text-xs text-muted-foreground">
              {record.studentCode ?? "-"}
            </div>
          </div>
        </div>
      </td>
      <td className="py-3 px-4 text-muted-foreground whitespace-nowrap">
        {formatGradeLevel(record.gradeLevel)}
        {record.classroomName ? `/${record.classroomName}` : ""}
      </td>
      <td className="py-3 px-4 whitespace-nowrap">
        <StatusBadge
          status={tone}
          label={record.statusLabel}
          size="sm"
        />
      </td>
      <td className="py-3 px-4 text-muted-foreground whitespace-nowrap">
        {record.checkInTime ?? "-"}
      </td>
      <td className="py-3 px-4 text-muted-foreground hidden md:table-cell max-w-48 truncate">
        {record.remark ?? "-"}
      </td>
    </tr>
  )
}
