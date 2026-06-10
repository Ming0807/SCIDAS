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

function getFollowReason(student: StudentWorklistItem) {
  if (student.absentDays30d > 0) {
    return `ขาดเรียน ${student.absentDays30d} วันใน 30 วัน`
  }

  if (student.openActionCount > 0) {
    return `มีงานติดตาม ${student.openActionCount} งาน`
  }

  if (student.openSupportCount > 0) {
    return `มีเคสดูแล ${student.openSupportCount} เคส`
  }

  if (student.activePlanCount > 0) {
    return `มีแผนพัฒนา ${student.activePlanCount} แผน`
  }

  return "คะแนนความเสี่ยงสูงกว่ากลุ่มปกติ"
}

const columns: Array<DataTableColumn<StudentWorklistItem>> = [
  {
    id: "student",
    header: "ชื่อ",
    className: "min-w-64",
    cell: (student) => (
      <StudentIdentity
        avatarUrl={student.photoUrl ?? ""}
        name={student.fullName}
        studentCode={student.studentCode}
        size="sm"
      />
    ),
  },
  {
    id: "classroom",
    header: "ชั้น",
    cell: (student) => (
      <span className="text-muted-foreground">
        {formatGradeLevel(student.gradeLevel)}/{formatClassroomSection(student.section)}
      </span>
    ),
  },
  {
    id: "risk",
    header: "ความเสี่ยง",
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
    header: "สาเหตุ",
    className: "min-w-48 text-muted-foreground",
    cell: (student) => getFollowReason(student),
  },
  {
    id: "status",
    header: "สถานะ",
    align: "right",
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
]

export function TrackingTable({ students }: { students: StudentWorklistItem[] }) {
  return (
    <DataTable
      className="col-span-1 min-h-[360px] lg:col-span-7"
      columns={columns}
      data={students}
      emptyState={
        <EmptyState
          size="compact"
          title="ยังไม่มีนักเรียนที่ต้องติดตามเร่งด่วน"
          description="เมื่อตรวจพบความเสี่ยง ระบบจะเรียงรายชื่อที่ควรดูแลก่อนให้ตรงนี้"
        />
      }
      getRowKey={(student) => student.studentId}
      rowClassName={(student) =>
        student.riskLevel === "high" ? "bg-destructive/5 hover:bg-destructive/10" : undefined
      }
      toolbar={
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 space-y-1">
            <h3 className="text-sm font-semibold text-foreground">
              นักเรียนที่ควรติดตามวันนี้
            </h3>
            <p className="text-sm text-muted-foreground">
              เรียงตามคะแนน priority จากความเสี่ยง งานเปิด และการมาเรียน
            </p>
          </div>
          <Link
            href="/students?status=high"
            className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-primary hover:underline"
          >
            ดูทั้งหมด <ChevronRight className="size-3" />
          </Link>
        </div>
      }
    />
  )
}
