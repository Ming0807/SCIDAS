import Link from "next/link"
import { Edit2, Eye } from "lucide-react"

import { StudentIdentity } from "@/components/dashboard"
import { StatusBadge } from "@/components/dashboard/status-badge"
import { DataTable, Pagination, type DataTableColumn } from "@/components/data"
import { EmptyState } from "@/components/feedback"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

import type { StudentListItem, StudentSummary } from "./student-data"

const columns: Array<DataTableColumn<StudentListItem>> = [
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
          title="ดูข้อมูลนักเรียน"
          href={`/students/${student.id}`}
          className={cn(buttonVariants({ variant: "ghost", size: "icon-sm" }))}
        >
          <Eye />
        </Link>
        <Link
          aria-label={`แก้ไขข้อมูล ${student.name}`}
          title="แก้ไขข้อมูลนักเรียน"
          href={`/students/${student.id}/edit`}
          className={cn(buttonVariants({ variant: "ghost", size: "icon-sm" }))}
        >
          <Edit2 />
        </Link>
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
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex h-7 items-center gap-1.5 rounded-lg bg-secondary px-2.5 text-[0.8rem] font-medium text-secondary-foreground">
          รายการที่แสดง
          <span className="rounded-full bg-background px-1.5 py-0.5 text-xs">
            {totalFiltered.toLocaleString("th-TH")}
          </span>
        </span>
        <span className="inline-flex h-7 items-center gap-1.5 rounded-lg px-2.5 text-[0.8rem] font-medium text-muted-foreground">
          ต้องติดตาม
          <span className="rounded-full bg-muted px-1.5 py-0.5 text-xs">
            {(summary.watch + summary.highRisk).toLocaleString("th-TH")}
          </span>
        </span>
        <span className="inline-flex h-7 items-center gap-1.5 rounded-lg px-2.5 text-[0.8rem] font-medium text-muted-foreground">
          งานเปิด
          <span className="rounded-full bg-muted px-1.5 py-0.5 text-xs">
            {summary.openActions.toLocaleString("th-TH")}
          </span>
        </span>
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
  canEdit,
}: {
  students: StudentListItem[]
  summary: StudentSummary
  totalFiltered: number
  page: number
  totalPages: number
  pageSize: number
  getPageHref: (page: number) => string
  canEdit: boolean
}) {
  return (
    <DataTable
      className="h-full min-h-[420px]"
      columns={canEdit ? columns : columns.filter((column) => column.id !== "actions")}
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
