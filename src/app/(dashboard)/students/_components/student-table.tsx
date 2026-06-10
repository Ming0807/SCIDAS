import Link from "next/link"
import { Edit2, Eye, MoreHorizontal, Printer, Settings, Trash2, Users } from "lucide-react"

import { StudentIdentity } from "@/components/dashboard"
import { StatusBadge } from "@/components/dashboard/status-badge"
import { DataTable, Pagination, type DataTableColumn } from "@/components/data"
import { EmptyState } from "@/components/feedback"
import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

import type { StudentListItem, StudentSummary } from "./student-data"

const columns: Array<DataTableColumn<StudentListItem>> = [
  {
    id: "select",
    header: <span className="sr-only">เลือก</span>,
    align: "center",
    className: "w-12",
    cell: (_, index) => (
      <input
        aria-label={`เลือกนักเรียนลำดับ ${index + 1}`}
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
      <StatusBadge status={student.status} label={student.statusLabel} size="sm" />
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
    cell: (student) => (
      <div className="flex items-center justify-center gap-1">
        <Link
          aria-label={`ดูข้อมูล ${student.name}`}
          href={`/students/${student.id}`}
          className={cn(buttonVariants({ variant: "ghost", size: "icon-sm" }))}
        >
          <Eye />
        </Link>
        <Button aria-label={`แก้ไข ${student.name}`} size="icon-sm" variant="ghost">
          <Edit2 />
        </Button>
        <Button aria-label={`เมนูเพิ่มเติม ${student.name}`} size="icon-sm" variant="ghost">
          <MoreHorizontal />
        </Button>
      </div>
    ),
  },
]

function StudentTableToolbar({
  summary,
  totalFiltered,
}: {
  summary: StudentSummary
  totalFiltered: number
}) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" variant="secondary">
          รายการที่แสดง
          <span className="rounded-full bg-background px-1.5 py-0.5 text-xs">
            {totalFiltered.toLocaleString("th-TH")}
          </span>
        </Button>
        <Button size="sm" variant="ghost">
          ต้องติดตาม
          <span className="rounded-full bg-muted px-1.5 py-0.5 text-xs">
            {(summary.watch + summary.highRisk).toLocaleString("th-TH")}
          </span>
        </Button>
        <Button size="sm" variant="ghost">
          งานเปิด
          <span className="rounded-full bg-muted px-1.5 py-0.5 text-xs">
            {summary.openActions.toLocaleString("th-TH")}
          </span>
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

export function StudentTable({
  students,
  summary,
  totalFiltered,
  page,
  totalPages,
  pageSize,
  getPageHref,
}: {
  students: StudentListItem[]
  summary: StudentSummary
  totalFiltered: number
  page: number
  totalPages: number
  pageSize: number
  getPageHref: (page: number) => string
}) {
  return (
    <DataTable
      className="h-full min-h-[420px]"
      columns={columns}
      data={students}
      emptyState={
        <EmptyState
          size="compact"
          title="ไม่พบนักเรียนตามตัวกรอง"
          description="ลองล้างตัวกรองหรือค้นหาด้วยชื่อ รหัสนักเรียน หรือชื่อผู้ปกครอง"
        />
      }
      getRowKey={(student) => student.id}
      rowClassName={(student) =>
        student.riskLevel === "high" ? "bg-destructive/5 hover:bg-destructive/10" : undefined
      }
      toolbar={<StudentTableToolbar summary={summary} totalFiltered={totalFiltered} />}
      footer={
        <Pagination
          page={page}
          totalPages={totalPages}
          totalItems={totalFiltered}
          pageSize={pageSize}
          pageSizeLabel={`${pageSize} ต่อหน้า`}
          getPageHref={getPageHref}
        />
      }
    />
  )
}
