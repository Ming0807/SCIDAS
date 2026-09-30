"use client"

import { useMemo, useState, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { CheckSquare, ChevronRight, Edit2, Loader2, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { StudentIdentity } from "@/components/dashboard"
import { MobileList, Pagination } from "@/components/data"
import { EmptyState } from "@/components/feedback"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  deleteStudentAction,
  deleteStudentsBatchAction,
} from "@/app/actions/student.actions"

import type { StudentFilterState, StudentListItem } from "./student-data"
import { createStudentPageHref } from "./student-data"

function MobileStudentRow({
  student,
  index,
  canEdit,
  isSelected,
  onToggleSelect,
  onDeleteRequest,
}: {
  student: StudentListItem
  index: number
  canEdit: boolean
  isSelected: boolean
  onToggleSelect: (id: string) => void
  onDeleteRequest: (student: { id: string; name: string; studentCode: string }) => void
}) {
  return (
    <article
      className={cn(
        "rounded-xl border bg-card p-4 text-card-foreground shadow-sm transition-colors",
        isSelected
          ? "border-primary/50 bg-primary/5 ring-1 ring-primary/30"
          : "border-border"
      )}
    >
      <div className="flex items-start gap-3">
        {canEdit ? (
          <label className="mt-0.5 flex items-center justify-center p-1 -m-1 cursor-pointer">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => onToggleSelect(student.id)}
              className="size-4.5 rounded border-border text-primary accent-primary cursor-pointer focus:ring-2 focus:ring-primary/20"
              aria-label={`เลือก ${student.name}`}
            />
          </label>
        ) : (
          <span className="mt-1 flex size-6 shrink-0 items-center justify-center rounded-md bg-primary/10 text-xs font-medium text-primary">
            {index + 1}
          </span>
        )}
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
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set())
  const [studentToDelete, setStudentToDelete] = useState<{
    id: string
    name: string
    studentCode: string
  } | null>(null)
  const [isBatchDeleteModalOpen, setIsBatchDeleteModalOpen] = useState(false)
  const [isDeleting, startDeleteTransition] = useTransition()
  const [isBatchDeleting, startBatchDeleteTransition] = useTransition()

  const getPageHref = createStudentPageHref(filters)
  const rowOffset = (page - 1) * pageSize

  // Optimistic visible list
  const visibleStudents = useMemo(() => {
    return students.filter((s) => !deletedIds.has(s.id))
  }, [students, deletedIds])

  const isAllSelected =
    visibleStudents.length > 0 &&
    visibleStudents.every((s) => selectedIds.has(s.id))

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(visibleStudents.map((s) => s.id)))
    }
  }

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const handleExecuteSingleDelete = () => {
    if (!studentToDelete) return
    const id = studentToDelete.id
    startDeleteTransition(async () => {
      // Optimistic delete
      setDeletedIds((prev) => new Set([...prev, id]))
      setSelectedIds((prev) => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
      setStudentToDelete(null)

      const res = await deleteStudentAction(id)
      if (res.ok) {
        toast.success(res.message)
        router.refresh()
      } else {
        // Rollback optimistic delete on error
        setDeletedIds((prev) => {
          const next = new Set(prev)
          next.delete(id)
          return next
        })
        toast.error(res.message || "ไม่สามารถลบนักเรียนได้")
      }
    })
  }

  const handleExecuteBatchDelete = () => {
    if (selectedIds.size === 0) return
    const ids = Array.from(selectedIds)
    startBatchDeleteTransition(async () => {
      // Optimistic delete
      setDeletedIds((prev) => new Set([...prev, ...ids]))
      setSelectedIds(new Set())
      setIsBatchDeleteModalOpen(false)

      const res = await deleteStudentsBatchAction(ids)
      if (res.ok) {
        toast.success(res.message)
        router.refresh()
      } else {
        // Rollback optimistic delete on error
        setDeletedIds((prev) => {
          const next = new Set(prev)
          ids.forEach((id) => next.delete(id))
          return next
        })
        toast.error(res.message || "ไม่สามารถลบนักเรียนได้")
      }
    })
  }

  const displayCount = Math.max(0, totalFiltered - deletedIds.size)

  return (
    <>
      <MobileList
        items={visibleStudents}
        getItemKey={(student) => student.id}
        title="รายชื่อนักเรียน"
        summary={`ทั้งหมด ${displayCount.toLocaleString("th-TH")} คน`}
        toolbar={
          canEdit && visibleStudents.length > 0 ? (
            <div className="flex items-center justify-between gap-2 pt-1 pb-1">
              <button
                type="button"
                onClick={toggleSelectAll}
                className={cn(
                  "inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-colors cursor-pointer",
                  isAllSelected
                    ? "bg-primary/10 border-primary/30 text-primary font-semibold"
                    : "bg-background border-border text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                <CheckSquare className="size-3.5" />
                <span>{isAllSelected ? "ยกเลิกเลือกทั้งหมด" : "เลือกทั้งหมดในหน้านี้"}</span>
              </button>
              {selectedIds.size > 0 && (
                <span className="text-xs font-medium text-primary">
                  เลือกแล้ว {selectedIds.size} คน
                </span>
              )}
            </div>
          ) : undefined
        }
        renderItem={(student, index) => (
          <MobileStudentRow
            key={student.id}
            student={student}
            index={rowOffset + index}
            canEdit={canEdit}
            isSelected={selectedIds.has(student.id)}
            onToggleSelect={toggleSelect}
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
            totalItems={displayCount}
            pageSize={pageSize}
            pageSizeLabel={`${pageSize} ต่อหน้า`}
            getPageHref={getPageHref}
            className="pt-1"
          />
        }
      />

      {/* Floating Bottom Bar for Mobile Bulk Actions */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-4 left-4 right-4 z-40 flex items-center justify-between gap-2 rounded-2xl border border-primary/30 bg-card/95 p-3 shadow-2xl backdrop-blur-md animate-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs font-bold text-foreground">
              เลือกแล้ว{" "}
              <span className="text-primary font-mono tabular-nums">
                {selectedIds.size}
              </span>{" "}
              คน
            </span>
          </div>
          <div className="flex items-center gap-2">
            {canEdit && (
              <button
                type="button"
                onClick={() => setIsBatchDeleteModalOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-destructive px-3 py-1.5 text-xs font-semibold text-destructive-foreground shadow-xs active:scale-95 transition-transform cursor-pointer"
              >
                <Trash2 className="size-3.5" />
                <span>ลบ ({selectedIds.size})</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => setSelectedIds(new Set())}
              className="rounded-xl border border-border bg-background px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground active:scale-95 transition-transform cursor-pointer"
            >
              ยกเลิก
            </button>
          </div>
        </div>
      )}

      {/* Mobile Single Delete Confirmation Modal */}
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
                onClick={handleExecuteSingleDelete}
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

      {/* Mobile Batch Delete Confirmation Modal */}
      {isBatchDeleteModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4"
        >
          <div className="w-full max-w-sm rounded-2xl border border-destructive/30 bg-card p-5 shadow-2xl animate-in fade-in-0 zoom-in-95">
            <div className="flex items-start gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
                <Trash2 className="size-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-semibold text-foreground">
                  ยืนยันการลบนักเรียนหลายคน
                </h3>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                  คุณกำลังจะลบนักเรียนที่เลือกทั้งหมด{" "}
                  <strong className="text-destructive font-bold">{selectedIds.size} คน</strong>{" "}
                  ออกจากระบบ การดำเนินการนี้จะลบข้อมูลที่เกี่ยวข้องและไม่สามารถย้อนกลับได้
                </p>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                disabled={isBatchDeleting}
                onClick={() => setIsBatchDeleteModalOpen(false)}
                className="rounded-xl border border-input bg-background px-3.5 py-1.5 text-xs font-semibold hover:bg-muted cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                disabled={isBatchDeleting}
                onClick={handleExecuteBatchDelete}
                className="inline-flex items-center gap-1.5 rounded-xl bg-destructive px-3.5 py-1.5 text-xs font-semibold text-destructive-foreground shadow-xs hover:bg-destructive/90 disabled:opacity-50 cursor-pointer"
              >
                {isBatchDeleting ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    กำลังลบ...
                  </>
                ) : (
                  <>
                    <Trash2 className="size-3.5" />
                    ลบ {selectedIds.size} คน
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
