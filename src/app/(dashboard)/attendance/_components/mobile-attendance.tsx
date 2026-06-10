import { ChevronRight, Clock } from "lucide-react"

import { StatusBadge, StudentIdentity } from "@/components/dashboard"
import { MobileList, Pagination } from "@/components/data"
import { Button } from "@/components/ui/button"

import {
  attendanceRows,
  attendanceSummary,
  type AttendanceRow,
} from "./attendance-data"

function MobileAttendanceRow({ row }: { row: AttendanceRow }) {
  return (
    <article className="rounded-xl border border-border bg-card p-4 text-card-foreground shadow-sm">
      <div className="flex items-start gap-3">
        <StudentIdentity
          avatarUrl={row.avatarUrl}
          name={row.name}
          studentCode={row.studentCode}
          grade={row.grade}
          classroom={row.classroom}
          className="min-w-0 flex-1"
        />
        <StatusBadge status={row.statusTone} label={row.statusLabel} size="sm" />
      </div>

      <div className="mt-3 flex items-center justify-between gap-3 border-t border-border pt-3 text-sm text-muted-foreground">
        <span className="inline-flex min-w-0 items-center gap-1">
          <Clock className="size-4" />
          {row.time === "-" ? row.note : row.time}
        </span>
        <Button size="sm" variant="outline">
          แก้ไข <ChevronRight />
        </Button>
      </div>
    </article>
  )
}

export function MobileAttendance() {
  return (
    <MobileList
      items={attendanceRows}
      getItemKey={(row) => row.id}
      title="รายการการมาเรียนวันนี้"
      summary={`ทั้งหมด ${attendanceSummary.total} รายการ`}
      renderItem={(row) => <MobileAttendanceRow row={row} />}
      footer={
        <Pagination
          page={1}
          totalPages={22}
          totalItems={attendanceSummary.total}
          pageSize={6}
          pageSizeLabel="6 ต่อหน้า"
          className="pt-1"
        />
      }
    />
  )
}
