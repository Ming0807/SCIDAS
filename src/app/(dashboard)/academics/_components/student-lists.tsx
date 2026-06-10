import { ChevronRight } from "lucide-react"

import { Section, StudentIdentity } from "@/components/dashboard"
import { Button } from "@/components/ui/button"

import {
  academicRiskStudents,
  academicTopStudents,
  type AcademicStudent,
} from "./academic-data"

function AcademicStudentList({
  title,
  students,
}: {
  title: string
  students: AcademicStudent[]
}) {
  return (
    <Section
      variant="surface"
      title={title}
      actions={
        <Button size="sm" variant="ghost">
          ดูทั้งหมด
        </Button>
      }
      className="h-full"
      contentClassName="flex flex-col gap-3"
    >
      {students.map((student, index) => (
        <div
          key={student.id}
          className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-muted"
        >
          <div className="flex size-6 shrink-0 items-center justify-center rounded-md bg-muted text-xs font-medium text-muted-foreground">
            {index + 1}
          </div>
          <StudentIdentity
            avatarUrl={student.avatarUrl}
            name={student.name}
            grade={student.classroom}
            status={student.statusTone}
            statusLabel={student.status}
            size="sm"
            className="min-w-0 flex-1"
          />
          <div className="text-right">
            <div className="text-xs text-muted-foreground">GPA</div>
            <div className="text-sm font-semibold text-foreground">
              {student.gpa.toFixed(2)}
            </div>
          </div>
          <ChevronRight className="size-4 text-muted-foreground" />
        </div>
      ))}
    </Section>
  )
}

export function AtRiskStudentsList() {
  return (
    <AcademicStudentList
      title="นักเรียนที่ต้องติดตามใกล้ชิด"
      students={academicRiskStudents}
    />
  )
}

export function TopStudentsList() {
  return (
    <AcademicStudentList
      title="นักเรียนผลการเรียนดีเด่น"
      students={academicTopStudents}
    />
  )
}
