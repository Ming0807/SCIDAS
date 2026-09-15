import Link from "next/link"
import { ArrowRight, ChevronRight, UserCheck } from "lucide-react"

import { StatusBadge, StudentIdentity } from "@/components/dashboard"
import { DataTable, type DataTableColumn } from "@/components/data"
import { EmptyState } from "@/components/feedback"
import {
  formatClassroomSection,
  formatGradeLevel,
  formatPercent,
  getStudentRiskLabel,
  getStudentRiskTone,
} from "@/lib/student-care-formatters"
import type { StudentWorklistItem } from "@/lib/server/student-care-read-models"
import { cn } from "@/lib/utils"

function getFollowReason(student: StudentWorklistItem) {
  if (student.absentDays30d > 0) {
    return `ขาดเรียน ${student.absentDays30d} วัน (30 วันล่าสุด)`
  }

  if (student.openActionCount > 0) {
    return `มีงานดูแลค้าง ${student.openActionCount} รายการ`
  }

  if (student.openSupportCount > 0) {
    return `มีเคสช่วยเหลือเปิดอยู่ ${student.openSupportCount} เคส`
  }

  if (student.activePlanCount > 0) {
    return `มีแผนพัฒนา ${student.activePlanCount} แผน`
  }

  return "คะแนนความเสี่ยงสูงกว่าเกณฑ์ปกติ"
}

const columns: Array<DataTableColumn<StudentWorklistItem>> = [
  {
    id: "student",
    header: "นักเรียน",
    className: "min-w-64",
    cell: (student) => (
      <Link
        href={`/students/${student.studentId}`}
        className="group/link block rounded-lg transition-colors hover:opacity-90"
      >
        <StudentIdentity
          avatarUrl={student.photoUrl ?? ""}
          name={
            <span className="group-hover/link:text-primary group-hover/link:underline">
              {student.fullName}
            </span>
          }
          studentCode={student.studentCode}
          size="sm"
        />
      </Link>
    ),
  },
  {
    id: "classroom",
    header: "ชั้น/ห้อง",
    className: "min-w-24",
    cell: (student) => {
      const grade = Number(student.gradeLevel) || 0
      const isSenior = grade >= 4
      return (
        <span
          className={cn(
            "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold",
            isSenior
              ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20"
              : "bg-sky-500/10 text-sky-700 dark:text-sky-300 border border-sky-500/20"
          )}
        >
          {formatGradeLevel(student.gradeLevel)}/{formatClassroomSection(student.section)}
        </span>
      )
    },
  },
  {
    id: "risk",
    header: "ระดับความเสี่ยง",
    className: "min-w-28",
    cell: (student) => (
      <StatusBadge
        status={getStudentRiskTone(student.riskLevel)}
        label={getStudentRiskLabel(student.riskLevel)}
        size="sm"
      />
    ),
  },
  {
    id: "reason",
    header: "เหตุผลที่จัดลำดับ",
    className: "min-w-56 text-muted-foreground text-xs",
    cell: (student) => getFollowReason(student),
  },
  {
    id: "attendance",
    header: "มาเรียน 30 วัน",
    align: "center",
    className: "min-w-32 tabular-nums text-xs",
    cell: (student) => {
      const rate = student.attendanceRate30d
      if (rate == null) return <span className="text-muted-foreground">-</span>
      const isLow = rate < 80
      const clamped = Math.max(0, Math.min(100, rate))
      return (
        <div className="flex flex-col items-center gap-1">
          <span
            className={cn(
              "font-semibold text-xs",
              isLow ? "text-destructive" : "text-foreground",
            )}
          >
            {formatPercent(rate)}
          </span>
          <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
            <div
              style={{ width: `${clamped}%` }}
              className={cn(
                "h-full rounded-full transition-all",
                isLow ? "bg-rose-500" : rate >= 90 ? "bg-emerald-500" : "bg-teal-500"
              )}
            />
          </div>
        </div>
      )
    },
  },
  {
    id: "status",
    header: "งานติดตาม",
    align: "center",
    className: "min-w-28",
    cell: (student) => (
      <StatusBadge
        status={student.openActionCount > 0 ? "info" : "watch"}
        label={
          student.openActionCount > 0
            ? `${student.openActionCount} งานเปิด`
            : "รอติดตาม"
        }
        size="sm"
      />
    ),
  },
  {
    id: "action",
    header: "",
    align: "right",
    className: "w-28",
    cell: (student) => (
      <Link
        href={`/students/${student.studentId}`}
        className="inline-flex items-center gap-1 rounded-lg border border-border/80 bg-background/80 px-2.5 py-1 text-xs font-medium text-foreground transition-all hover:bg-muted hover:border-primary/40 hover:text-primary"
      >
        <span>ประวัติ</span>
        <ChevronRight className="size-3" />
      </Link>
    ),
  },
]

export function TrackingTable({
  students,
  className,
}: {
  students: StudentWorklistItem[]
  className?: string
}) {
  return (
    <DataTable
      className={cn("rounded-2xl border border-border shadow-xs", className)}
      columns={columns}
      data={students}
      emptyState={
        <EmptyState
          icon={UserCheck}
          size="compact"
          title="ยังไม่มีนักเรียนที่ต้องติดตามเร่งด่วน"
          description="เมื่อตรวจพบความเสี่ยง ระบบจะเรียงรายชื่อที่ควรดูแลก่อนให้ตรงนี้"
        />
      }
      getRowKey={(student) => student.studentId}
      rowClassName={(student) =>
        student.riskLevel === "high"
          ? "bg-destructive/[0.02] hover:bg-destructive/[0.06]"
          : "hover:bg-muted/40"
      }
      toolbar={
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between py-1">
          <div className="min-w-0 space-y-0.5">
            <h3 className="text-base font-bold text-foreground tracking-tight">
              นักเรียนที่ควรติดตามเป็นลำดับแรก (Priority Worklist)
            </h3>
            <p className="text-xs text-muted-foreground">
              จัดลำดับตามระดับความเสี่ยง สถิติการขาดเรียน และงานติดตามคั่งค้าง
            </p>
          </div>
          <Link
            href="/students?status=high"
            className="inline-flex shrink-0 items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary/80 transition-colors group"
          >
            <span>ดูรายชื่อนักเรียนทั้งหมด</span>
            <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      }
    />
  )
}
