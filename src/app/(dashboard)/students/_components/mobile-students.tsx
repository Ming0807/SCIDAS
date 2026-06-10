import { ChevronRight, MoreVertical } from "lucide-react"

import { StudentIdentity } from "@/components/dashboard"
import { MobileList, Pagination } from "@/components/data"
import { Button } from "@/components/ui/button"

import { studentRows, studentSummary, type StudentListItem } from "./student-data"

function MobileStudentRow({
  student,
  index,
}: {
  student: StudentListItem
  index: number
}) {
  return (
    <article className="rounded-xl border border-border bg-card p-4 text-card-foreground shadow-sm">
      <div className="flex items-start gap-3">
        <span className="mt-1 flex size-6 shrink-0 items-center justify-center rounded-md bg-primary/10 text-xs font-medium text-primary">
          {index + 1}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-2">
            <StudentIdentity
              avatarUrl={student.avatarUrl}
              name={student.name}
              studentCode={student.studentCode}
              grade={student.grade}
              classroom={student.classroom}
              status={student.status}
              statusLabel={student.statusLabel}
              className="min-w-0 flex-1"
            />
            <Button aria-label="เมนูนักเรียน" size="icon-sm" variant="ghost">
              <MoreVertical />
            </Button>
          </div>

          <div className="mt-3 flex items-center justify-between gap-3 text-sm text-muted-foreground">
            <span className="truncate">{student.guardian}</span>
            <Button size="sm" variant="outline">
              ดูข้อมูล <ChevronRight />
            </Button>
          </div>
        </div>
      </div>
    </article>
  )
}

export function MobileStudents() {
  return (
    <MobileList
      items={studentRows}
      getItemKey={(student) => student.id}
      title="รายชื่อนักเรียน"
      summary={`ทั้งหมด ${studentSummary.total} คน`}
      renderItem={(student, index) => (
        <MobileStudentRow student={student} index={index} />
      )}
      footer={
        <Pagination
          page={1}
          totalPages={13}
          totalItems={studentSummary.total}
          pageSize={10}
          pageSizeLabel="10 ต่อหน้า"
          className="pt-1"
        />
      }
    />
  )
}
