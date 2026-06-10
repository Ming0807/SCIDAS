import { Edit2, Eye } from "lucide-react"

import { StatusBadge, StudentIdentity } from "@/components/dashboard"
import { DataTable, Pagination, type DataTableColumn } from "@/components/data"
import { Button } from "@/components/ui/button"

import {
  attendanceRows,
  attendanceSummary,
  type AttendanceRow,
} from "./attendance-data"

const columns: Array<DataTableColumn<AttendanceRow>> = [
  {
    id: "index",
    header: "#",
    align: "center",
    className: "w-12 text-muted-foreground",
    cell: (_, index) => index + 1,
  },
  {
    id: "student",
    header: "นักเรียน",
    className: "min-w-64",
    cell: (row) => (
      <StudentIdentity
        avatarUrl={row.avatarUrl}
        name={row.name}
        studentCode={row.studentCode}
        grade={row.grade}
        classroom={row.classroom}
        size="sm"
      />
    ),
  },
  {
    id: "status",
    header: "สถานะ",
    cell: (row) => (
      <StatusBadge
        status={row.statusTone}
        label={row.statusLabel}
        size="sm"
      />
    ),
  },
  {
    id: "time",
    header: "เวลาเข้าเรียน",
    className: "text-muted-foreground",
    cell: (row) => row.time,
  },
  {
    id: "note",
    header: "หมายเหตุ",
    className: "min-w-44 text-muted-foreground",
    cell: (row) => row.note,
  },
  {
    id: "recorder",
    header: "ผู้บันทึก",
    className: "min-w-36 text-muted-foreground",
    cell: (row) => row.recorder,
  },
  {
    id: "actions",
    header: "จัดการ",
    align: "center",
    sticky: "right",
    cell: () => (
      <div className="flex items-center justify-center gap-1">
        <Button aria-label="ดูข้อมูลการมาเรียน" size="icon-sm" variant="ghost">
          <Eye />
        </Button>
        <Button size="sm" variant="outline">
          <Edit2 /> แก้ไข
        </Button>
      </div>
    ),
  },
]

export function AttendanceTable() {
  return (
    <DataTable
      className="min-h-[420px]"
      columns={columns}
      data={attendanceRows}
      getRowKey={(row) => row.id}
      toolbar={
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-foreground">
            รายการการมาเรียนวันนี้
          </h2>
          <span className="text-sm text-muted-foreground">
            ทั้งหมด {attendanceSummary.total} รายการ
          </span>
        </div>
      }
      footer={
        <Pagination
          page={1}
          totalPages={22}
          totalItems={attendanceSummary.total}
          pageSize={6}
          pageSizeLabel="6 ต่อหน้า"
        />
      }
    />
  )
}
