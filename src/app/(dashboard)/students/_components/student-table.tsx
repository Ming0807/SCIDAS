import { Edit2, Eye, MoreHorizontal, Printer, Settings, Trash2, Users } from "lucide-react"

import { StudentIdentity } from "@/components/dashboard"
import { DataTable, Pagination, type DataTableColumn } from "@/components/data"
import { StatusBadge } from "@/components/dashboard/status-badge"
import { Button } from "@/components/ui/button"

import { studentRows, studentSummary, type StudentListItem } from "./student-data"

const columns: Array<DataTableColumn<StudentListItem>> = [
  {
    id: "select",
    header: <span className="sr-only">เลือก</span>,
    align: "center",
    className: "w-12",
    cell: (_, index) => (
      <input
        aria-label={`เลือกนักเรียนลำดับ ${index + 1}`}
        checked={index === 0}
        readOnly
        type="checkbox"
        className="size-4 rounded border-input text-primary focus:ring-ring"
      />
    ),
  },
  {
    id: "student",
    header: "นักเรียน",
    className: "min-w-64",
    cell: (student) => (
      <StudentIdentity
        avatarUrl={student.avatarUrl}
        name={student.name}
        studentCode={student.studentCode}
        status={student.status}
        statusLabel={student.statusLabel}
        size="sm"
      />
    ),
  },
  {
    id: "classroom",
    header: "ชั้นเรียน",
    cell: (student) => (
      <span className="text-muted-foreground">
        {student.grade}/{student.classroom}
      </span>
    ),
  },
  {
    id: "status",
    header: "สถานะ",
    cell: (student) => (
      <StatusBadge
        status={student.status}
        label={student.statusLabel}
        size="sm"
      />
    ),
  },
  {
    id: "guardian",
    header: "ผู้ปกครอง",
    className: "min-w-44 text-muted-foreground",
    cell: (student) => student.guardian,
  },
  {
    id: "phone",
    header: "เบอร์โทร",
    className: "text-muted-foreground",
    cell: (student) => student.phone,
  },
  {
    id: "actions",
    header: "จัดการ",
    align: "center",
    sticky: "right",
    cell: () => (
      <div className="flex items-center justify-center gap-1">
        <Button aria-label="ดูข้อมูลนักเรียน" size="icon-sm" variant="ghost">
          <Eye />
        </Button>
        <Button aria-label="แก้ไขนักเรียน" size="icon-sm" variant="ghost">
          <Edit2 />
        </Button>
        <Button aria-label="เมนูเพิ่มเติม" size="icon-sm" variant="ghost">
          <MoreHorizontal />
        </Button>
      </div>
    ),
  },
]

function StudentTableToolbar() {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" variant="secondary">
          รายการทั้งหมด
          <span className="rounded-full bg-background px-1.5 py-0.5 text-xs">
            {studentSummary.total}
          </span>
        </Button>
        <Button size="sm" variant="ghost">
          รอตรวจสอบ
          <span className="rounded-full bg-muted px-1.5 py-0.5 text-xs">12</span>
        </Button>
        <Button size="sm" variant="ghost">
          ติดตาม
          <span className="rounded-full bg-muted px-1.5 py-0.5 text-xs">18</span>
        </Button>
      </div>

      <div className="flex min-w-0 flex-wrap items-center gap-1">
        <Button disabled size="sm" variant="ghost">
          <Edit2 /> แก้ไข
        </Button>
        <Button disabled size="sm" variant="ghost">
          <Users /> กำหนดครู
        </Button>
        <Button disabled size="sm" variant="ghost">
          <Printer /> พิมพ์บัตร
        </Button>
        <Button disabled size="sm" variant="destructive">
          <Trash2 /> ลบ
        </Button>
        <Button aria-label="ตั้งค่าตาราง" size="icon-sm" variant="ghost">
          <Settings />
        </Button>
      </div>
    </div>
  )
}

export function StudentTable() {
  return (
    <DataTable
      className="h-full min-h-[420px]"
      columns={columns}
      data={studentRows}
      getRowKey={(student) => student.id}
      rowClassName={(_, index) =>
        index === 0 ? "bg-primary/5 hover:bg-primary/10" : undefined
      }
      toolbar={<StudentTableToolbar />}
      footer={
        <Pagination
          page={1}
          totalPages={13}
          totalItems={studentSummary.total}
          pageSize={10}
          pageSizeLabel="10 ต่อหน้า"
        />
      }
    />
  )
}
