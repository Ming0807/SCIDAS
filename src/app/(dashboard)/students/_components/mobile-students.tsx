import Link from "next/link"
import { ChevronRight } from "lucide-react"

import { StudentIdentity } from "@/components/dashboard"
import { MobileList, Pagination } from "@/components/data"
import { EmptyState } from "@/components/feedback"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

import type { StudentListItem } from "./student-data"

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

          </div>

          <div className="mt-3 flex items-center justify-between gap-3 text-sm text-muted-foreground">
            <span className="truncate">{student.guardian}</span>
            <Link
              href={`/students/${student.id}`}
              className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
            >
              ดูข้อมูล <ChevronRight />
            </Link>
          </div>
        </div>
      </div>
    </article>
  )
}

export function MobileStudents({
  students,
  totalFiltered,
  page,
  totalPages,
  pageSize,
  getPageHref,
}: {
  students: StudentListItem[]
  totalFiltered: number
  page: number
  totalPages: number
  pageSize: number
  getPageHref: (page: number) => string
}) {
  return (
    <MobileList
      items={students}
      getItemKey={(student) => student.id}
      title="รายชื่อนักเรียน"
      summary={`ทั้งหมด ${totalFiltered.toLocaleString("th-TH")} คน`}
      renderItem={(student, index) => <MobileStudentRow student={student} index={index} />}
      emptyState={
        <EmptyState
          size="compact"
          title="ไม่พบนักเรียนตามตัวกรอง"
          description="ลองล้างตัวกรองหรือค้นหาด้วยชื่อ รหัสนักเรียน หรือชื่อผู้ปกครอง"
        />
      }
      footer={
        <Pagination
          page={page}
          totalPages={totalPages}
          totalItems={totalFiltered}
          pageSize={pageSize}
          pageSizeLabel={`${pageSize} ต่อหน้า`}
          getPageHref={getPageHref}
          className="pt-1"
        />
      }
    />
  )
}
