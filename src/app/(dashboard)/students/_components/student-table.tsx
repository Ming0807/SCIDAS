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
      <Link
        href={`/students/${student.id}`}
        className="group/link block rounded-lg transition-colors hover:opacity-90"
      >
        <StudentIdentity
          avatarUrl={student.avatarUrl}
          name={
            <span className="group-hover/link:text-primary group-hover/link:underline">
              {student.name}
            </span>
          }
          studentCode={student.studentCode}
          status={student.status}
          statusLabel={student.statusLabel}
          size="sm"
        />
      </Link>
    ),
  },
  {
    id: "classroom",
    header: "ชั้นเรียน",
    className: "min-w-24",
    cell: (student) => (
      <span className="inline-flex items-center rounded-md bg-muted/60 px-2 py-0.5 text-xs font-medium text-foreground">
        {student.grade}/{student.classroom}
      </span>
    ),
  },
  {
    id: "status",
    header: "ระดับความเสี่ยง",
    className: "min-w-28",
    cell: (student) => (
      <StatusBadge status={student.status} label={student.statusLabel} size="sm" />
    ),
  },
  {
    id: "guardian",
    header: "ผู้ปกครอง",
    className: "min-w-44 text-muted-foreground text-xs",
    cell: (student) => (
      <span className="truncate block font-medium text-foreground">
        {student.guardian || "-"}
      </span>
    ),
  },
  {
    id: "phone",
    header: "เบอร์โทร",
    className: "text-muted-foreground text-xs tabular-nums",
    cell: (student) => student.phone || "-",
  },
  {
    id: "actions",
    header: "จัดการ",
    align: "right",
    sticky: "right",
    className: "w-32",
    cell: (student) => (
      <div className="flex items-center justify-end gap-1.5">
        <Link
          aria-label={`ดูข้อมูล ${student.name}`}
          title="ดูข้อมูลนักเรียน"
          href={`/students/${student.id}`}
          className="inline-flex items-center gap-1 rounded-lg border border-border/80 bg-background/80 px-2 py-1 text-xs font-medium text-foreground transition-all hover:bg-muted hover:border-primary/40 hover:text-primary"
        >
          <Eye className="size-3" />
          <span>ประวัติ</span>
        </Link>
        <Link
          aria-label={`แก้ไขข้อมูล ${student.name}`}
          title="แก้ไขข้อมูลนักเรียน"
          href={`/students/${student.id}/edit`}
          className={cn(buttonVariants({ variant: "ghost", size: "icon-sm" }))}
        >
          <Edit2 className="size-3.5" />
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
    <div className="flex flex-wrap items-center justify-between gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex h-7 items-center gap-1.5 rounded-lg bg-secondary px-2.5 text-xs font-medium text-secondary-foreground">
          แสดงอยู่
          <span className="rounded-full bg-background px-1.5 py-0.5 text-xs font-bold tabular-nums">
            {totalFiltered.toLocaleString("th-TH")}
          </span>
        </span>
        <span className="inline-flex h-7 items-center gap-1.5 rounded-lg border border-border/60 bg-muted/30 px-2.5 text-xs font-medium text-muted-foreground">
          กลุ่มเฝ้าระวัง & เสี่ยงสูง
          <span className="rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 font-semibold px-1.5 py-0.5 text-xs tabular-nums">
            {(summary.watch + summary.highRisk).toLocaleString("th-TH")}
          </span>
        </span>
        <span className="inline-flex h-7 items-center gap-1.5 rounded-lg border border-border/60 bg-muted/30 px-2.5 text-xs font-medium text-muted-foreground">
          งานเปิด
          <span className="rounded-full bg-primary/10 text-primary font-semibold px-1.5 py-0.5 text-xs tabular-nums">
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
