import { ChevronRight } from "lucide-react"

import { StatusBadge, StudentIdentity } from "@/components/dashboard"
import { MobileList, Pagination } from "@/components/data"
import { Button } from "@/components/ui/button"

import {
  academicRiskStudents,
  academicSummary,
  type AcademicStudent,
} from "./academic-data"

function MobileAcademicRow({ student }: { student: AcademicStudent }) {
  return (
    <article className="rounded-xl border border-border bg-card p-4 text-card-foreground shadow-sm">
      <div className="flex items-start gap-3">
        <StudentIdentity
          avatarUrl={student.avatarUrl}
          name={student.name}
          grade={student.classroom}
          className="min-w-0 flex-1"
        />
        <StatusBadge
          status={student.statusTone}
          label={student.status}
          size="sm"
        />
      </div>

      <div className="mt-3 flex items-center justify-between gap-3 border-t border-border pt-3 text-sm text-muted-foreground">
        <span>
          GPA {student.gpa.toFixed(2)}, ต่ำกว่า 2.00: {student.weakSubject}
        </span>
        <Button size="sm" variant="outline">
          ดูข้อมูล <ChevronRight />
        </Button>
      </div>
    </article>
  )
}

export function MobileAcademicProfile() {
  return (
    <MobileList
      items={academicRiskStudents}
      getItemKey={(student) => student.id}
      title="ผลการเรียนรายบุคคล"
      summary={`นักเรียนทั้งหมด ${academicSummary.totalStudents} คน`}
      renderItem={(student) => <MobileAcademicRow student={student} />}
      footer={
        <Pagination
          page={1}
          totalPages={16}
          totalItems={academicSummary.totalStudents}
          pageSize={10}
          pageSizeLabel="10 ต่อหน้า"
          className="pt-1"
        />
      }
    />
  )
}
