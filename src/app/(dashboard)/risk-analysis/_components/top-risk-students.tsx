import Link from "next/link"
import { ChevronRight } from "lucide-react"

import { StatusBadge, StudentIdentity } from "@/components/dashboard"
import { DataTable, type DataTableColumn } from "@/components/data"
import { EmptyState } from "@/components/feedback"
import {
  formatClassroomSection,
  formatGradeLevel,
  getStudentRiskLabel,
  getStudentRiskTone,
} from "@/lib/student-care-formatters"
import type { StudentWorklistItem } from "@/lib/server/student-care-read-models"

function getMainRiskFactor(student: StudentWorklistItem) {
  const factors = []

  if (student.absentDays30d > 0) factors.push(`ขาด ${student.absentDays30d} วัน`)
  if (student.lateDays30d > 0) factors.push(`สาย ${student.lateDays30d} วัน`)
  if (student.openSupportCount > 0) factors.push(`เคส ${student.openSupportCount}`)
  if (student.openActionCount > 0) factors.push(`งาน ${student.openActionCount}`)
  if (student.activeFlagCount > 0) factors.push(`ธง ${student.activeFlagCount}`)

  return factors.length > 0 ? factors.join(", ") : "คะแนนความเสี่ยงสะสม"
}

const columns: Array<DataTableColumn<StudentWorklistItem>> = [
  {
    id: "student",
    header: "นักเรียน",
    className: "min-w-64",
    cell: (student) => (
      <StudentIdentity
        avatarUrl={student.photoUrl ?? ""}
        name={student.fullName}
        studentCode={student.studentCode}
        grade={formatGradeLevel(student.gradeLevel)}
        classroom={formatClassroomSection(student.section)}
        size="sm"
      />
    ),
  },
  {
    id: "risk",
    header: "ระดับ",
    align: "center",
    cell: (student) => (
      <StatusBadge
        status={getStudentRiskTone(student.riskLevel)}
        label={getStudentRiskLabel(student.riskLevel)}
        size="sm"
      />
    ),
  },
  {
    id: "factor",
    header: "ปัจจัยหลัก",
    className: "min-w-48 text-muted-foreground",
    cell: (student) => getMainRiskFactor(student),
  },
  {
    id: "score",
    header: "คะแนน",
    align: "center",
    cell: (student) => (
      <span className="font-semibold tabular-nums text-foreground">
        {student.riskScore.toLocaleString("th-TH")}
      </span>
    ),
  },
  {
    id: "action",
    header: <span className="sr-only">เปิด</span>,
    align: "right",
    cell: (student) => (
      <Link
        href={`/students/${student.studentId}`}
        aria-label={`เปิดข้อมูล ${student.fullName}`}
        className="inline-flex size-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
      >
        <ChevronRight className="size-4" />
      </Link>
    ),
  },
]

export function TopRiskStudents({
  students,
}: {
  students: StudentWorklistItem[]
}) {
  return (
    <DataTable
      className="min-h-[420px] flex-1"
      columns={columns}
      data={students}
      emptyState={
        <EmptyState
          size="compact"
          title="ยังไม่มีนักเรียนกลุ่มเสี่ยง"
          description="เมื่อมีผลประเมินหรือสัญญาณดูแล ระบบจะแสดงรายชื่อเรียงตาม priority"
        />
      }
      getRowKey={(student) => student.studentId}
      toolbar={
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 space-y-1">
            <h3 className="text-sm font-semibold text-foreground">
              นักเรียนที่มีความเสี่ยงสูงสุด
            </h3>
            <p className="text-sm text-muted-foreground">
              เรียงจากคะแนนความเสี่ยงและงานดูแลที่ยังเปิดอยู่
            </p>
          </div>
          <Link
            href="/students?status=high"
            className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
          >
            ดูทั้งหมด <ChevronRight className="size-3" />
          </Link>
        </div>
      }
    />
  )
}
