"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ChevronRight, Edit2, Loader2, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { StudentIdentity } from "@/components/dashboard"
import { MobileList, Pagination } from "@/components/data"
import { EmptyState } from "@/components/feedback"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { deleteStudentAction } from "@/app/actions/student.actions"

import type { StudentFilterState, StudentListItem } from "./student-data"
import { createStudentPageHref } from "./student-data"

function MobileStudentRow({
  student,
  index,
  canEdit,
  onDeleteRequest,
}: {
  student: StudentListItem
  index: number
  canEdit: boolean
  onDeleteRequest: (student: { id: string; name: string; studentCode: string }) => void
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

          <div className="mt-3 flex items-center justify-between gap-2 text-sm text-muted-foreground">
            <span className="truncate">{student.guardian}</span>
            <div className="flex items-center gap-1.5 shrink-0">
              <Link
                href={`/students/${student.id}`}
                className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
              >
                ดูข้อมูล <ChevronRight className="size-3.5" />
              </Link>
              {canEdit ? (
                <>
                  <Link
                    href={`/students/${student.id}/edit`}
                    aria-label={`แก้ไขข้อมูล ${student.name}`}
                    title="แก้ไขข้อมูลนักเรียน"
                    className={cn(buttonVariants({ variant: "ghost", size: "icon-sm" }))}
                  >
                    <Edit2 className="size-3.5" />
                  </Link>
                  <button
                    type="button"
                    onClick={() =>
                      onDeleteRequest({
                        id: student.id,
                        name: student.name,
                        studentCode: student.studentCode,
                      })
                    }
                    aria-label={`ลบข้อมูล ${student.name}`}
                    title="ลบข้อมูลนักเรียน"
                    className={cn(
                      buttonVariants({ variant: "ghost", size: "icon-sm" }),
                      "text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer",
                    )}
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </>
              ) : null}
            </div>
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
  filters,
  canEdit,
}: {
  students: StudentListItem[]
  totalFiltered: number
  page: number
  totalPages: number
  pageSize: number
  filters: StudentFilterState
  canEdit: boolean
}) {
  const router = useRouter()
  const [studentToDelete, setStudentToDelete] = useState<{
    id: string
    name: string
    studentCode: string
  } | null>(null)
  const [isDeleting, startDeleteTransition] = useTransition()

  const getPageHref = createStudentPageHref(filters)
  const rowOffset = (page - 1) * pageSize

  const handleExecuteDelete = () => {
    if (!studentToDelete) return
    startDeleteTransition(async () => {
      const res = await deleteStudentAction(studentToDelete.id)
      if (res.ok) {
        toast.success(res.message)
        setStudentToDelete(null)
        router.refresh()
      } else {
        toast.error(res.message || "ไม่สามารถลบนักเรียนได้")
      }
    })
  }

  return (
    <>
      <MobileList
        items={students}
        getItemKey={(student) => student.id}
        title="รายชื่อนักเรียน"
        summary={`ทั้งหมด ${totalFiltered.toLocaleString("th-TH")} คน`}
        renderItem={(student, index) => (
          <MobileStudentRow
            student={student}
            index={rowOffset + index}
            canEdit={canEdit}
            onDeleteRequest={setStudentToDelete}
          />
        )}
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

      {/* Mobile Delete Confirmation Modal */}
      {studentToDelete && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4"
        >
          <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-5 shadow-2xl animate-in fade-in-0 zoom-in-95">
            <div className="flex items-start gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
                <Trash2 className="size-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-semibold text-foreground">
                  ยืนยันการลบนักเรียน
                </h3>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                  คุณต้องการลบ <strong className="text-foreground">{studentToDelete.name}</strong> (รหัส {studentToDelete.studentCode}) ใช่หรือไม่? ข้อมูลจะถูกลบถาวร
                </p>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setStudentToDelete(null)}
                className="rounded-xl border border-input bg-background px-3.5 py-1.5 text-xs font-semibold hover:bg-muted cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleExecuteDelete}
                className="inline-flex items-center gap-1.5 rounded-xl bg-destructive px-3.5 py-1.5 text-xs font-semibold text-destructive-foreground shadow-xs hover:bg-destructive/90 disabled:opacity-50 cursor-pointer"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    กำลังลบ...
                  </>
                ) : (
                  <>
                    <Trash2 className="size-3.5" />
                    ลบนักเรียน
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
