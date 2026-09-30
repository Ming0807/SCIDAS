"use client"

import { useCallback, useMemo, useState, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  AlertTriangle,
  CheckSquare,
  Download,
  Edit2,
  Eye,
  Loader2,
  SlidersHorizontal,
  Square,
  Trash2,
  X,
} from "lucide-react"
import { toast } from "sonner"

import { StudentIdentity } from "@/components/dashboard"
import { StatusBadge } from "@/components/dashboard/status-badge"
import { DataTable, Pagination, type DataTableColumn } from "@/components/data"
import { EmptyState } from "@/components/feedback"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  deleteStudentAction,
  deleteStudentsBatchAction,
  clearAllStudentsInSchoolAction,
} from "@/app/actions/student.actions"

import type { StudentFilterState, StudentListItem, StudentSummary } from "./student-data"
import { createStudentPageHref } from "./student-data"

export function StudentTable({
  students,
  summary,
  totalFiltered,
  page,
  totalPages,
  pageSize,
  filters,
  canEdit,
  allFilteredIds,
}: {
  students: StudentListItem[]
  summary: StudentSummary
  totalFiltered: number
  page: number
  totalPages: number
  pageSize: number
  filters: StudentFilterState
  canEdit: boolean
  allFilteredIds?: string[]
}) {
  const router = useRouter()
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [isCompact, setIsCompact] = useState(false)

  // Deletion modals state
  const [isBatchDeleteModalOpen, setIsBatchDeleteModalOpen] = useState(false)
  const [isBatchDeleting, startBatchDeleteTransition] = useTransition()

  const [studentToDelete, setStudentToDelete] = useState<{
    id: string
    name: string
    studentCode: string
  } | null>(null)
  const [isSingleDeleting, startSingleDeleteTransition] = useTransition()

  const [isClearAllModalOpen, setIsClearAllModalOpen] = useState(false)
  const [clearConfirmText, setClearConfirmText] = useState("")
  const [isClearingAll, startClearAllTransition] = useTransition()

  const getPageHref = createStudentPageHref(filters)

  const isAllSelected = students.length > 0 && students.every((s) => selectedIds.has(s.id))
  const isSomeSelected = students.some((s) => selectedIds.has(s.id)) && !isAllSelected

  const toggleSelectAll = useCallback(() => {
    if (isAllSelected) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(students.map((s) => s.id)))
    }
  }, [isAllSelected, students])

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }, [])

  const handleExportSelected = () => {
    const selectedStudents = students.filter((s) => selectedIds.has(s.id))
    if (selectedStudents.length === 0) return

    const headers = ["รหัสนักเรียน", "ชื่อ-สกุล", "ชั้นเรียน", "ระดับความเสี่ยง", "ผู้ปกครอง", "เบอร์โทร"]
    const rows = selectedStudents.map((s) => [
      `"${s.studentCode}"`,
      `"${s.name}"`,
      `"${s.grade}/${s.classroom}"`,
      `"${s.statusLabel}"`,
      `"${s.guardian || "-"}"`,
      `"${s.phone || "-"}"`,
    ])
    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n")
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `นักเรียน_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const selectAllFiltered = useCallback(() => {
    if (allFilteredIds && allFilteredIds.length > 0) {
      setSelectedIds(new Set(allFilteredIds))
    }
  }, [allFilteredIds])

  const selectedStudentsPreview = useMemo(() => {
    return students.filter((s) => selectedIds.has(s.id))
  }, [students, selectedIds])

  const handleExecuteBatchDelete = () => {
    if (selectedIds.size === 0) return
    startBatchDeleteTransition(async () => {
      const ids = Array.from(selectedIds)
      const res = await deleteStudentsBatchAction(ids)
      if (res.ok) {
        toast.success(res.message)
        setSelectedIds(new Set())
        setIsBatchDeleteModalOpen(false)
        router.refresh()
      } else {
        toast.error(res.message || "ไม่สามารถลบนักเรียนได้")
      }
    })
  }

  const handleExecuteSingleDelete = () => {
    if (!studentToDelete) return
    startSingleDeleteTransition(async () => {
      const res = await deleteStudentAction(studentToDelete.id)
      if (res.ok) {
        toast.success(res.message)
        setSelectedIds((prev) => {
          const next = new Set(prev)
          next.delete(studentToDelete.id)
          return next
        })
        setStudentToDelete(null)
        router.refresh()
      } else {
        toast.error(res.message || "ไม่สามารถลบนักเรียนได้")
      }
    })
  }

  const handleExecuteClearAll = () => {
    if (clearConfirmText.trim() !== "ยืนยัน") return
    startClearAllTransition(async () => {
      const res = await clearAllStudentsInSchoolAction()
      if (res.ok) {
        toast.success(res.message)
        setSelectedIds(new Set())
        setIsClearAllModalOpen(false)
        setClearConfirmText("")
        router.refresh()
      } else {
        toast.error(res.message || "ไม่สามารถล้างข้อมูลนักเรียนได้")
      }
    })
  }

  const columns: Array<DataTableColumn<StudentListItem>> = useMemo(() => {
    const cols: Array<DataTableColumn<StudentListItem>> = [
      {
        id: "select",
        header: (
          <button
            type="button"
            onClick={toggleSelectAll}
            aria-label={isAllSelected ? "ยกเลิกเลือกทั้งหมด" : "เลือกทั้งหมดในหน้านี้"}
            className="flex items-center justify-center p-1 text-muted-foreground hover:text-foreground cursor-pointer"
          >
            {isAllSelected ? (
              <CheckSquare className="size-4 text-primary" />
            ) : isSomeSelected ? (
              <div className="size-4 rounded-xs border-2 border-primary bg-primary/20 flex items-center justify-center">
                <div className="size-2 bg-primary rounded-2xs" />
              </div>
            ) : (
              <Square className="size-4 text-muted-foreground/60" />
            )}
          </button>
        ),
        className: "w-10 px-2",
        headerClassName: "w-10 px-2",
        cell: (student) => {
          const isSelected = selectedIds.has(student.id)
          return (
            <button
              type="button"
              onClick={() => toggleSelect(student.id)}
              aria-label={`เลือก ${student.name}`}
              className="flex items-center justify-center p-1 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              {isSelected ? (
                <CheckSquare className="size-4 text-primary" />
              ) : (
                <Square className="size-4 text-muted-foreground/40 hover:text-foreground" />
              )}
            </button>
          )
        },
      },
      {
        id: "student",
        header: "นักเรียน",
        className: isCompact ? "min-w-56 py-1.5" : "min-w-64 py-2.5",
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
        cell: (student) =>
          student.phone ? (
            <a href={`tel:${student.phone.replace(/[\s-]/g, "")}`} className="hover:text-primary hover:underline">
              {student.phone}
            </a>
          ) : (
            "-"
          ),
      },
      {
        id: "actions",
        header: "จัดการ",
        align: "right",
        sticky: "right",
        className: "w-36",
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
            {canEdit && (
              <>
                <Link
                  aria-label={`แก้ไขข้อมูล ${student.name}`}
                  title="แก้ไขข้อมูลนักเรียน"
                  href={`/students/${student.id}/edit`}
                  className={cn(buttonVariants({ variant: "ghost", size: "icon-sm" }))}
                >
                  <Edit2 className="size-3.5" />
                </Link>
                <button
                  type="button"
                  aria-label={`ลบข้อมูล ${student.name}`}
                  title="ลบข้อมูลนักเรียน"
                  onClick={() =>
                    setStudentToDelete({
                      id: student.id,
                      name: student.name,
                      studentCode: student.studentCode,
                    })
                  }
                  className={cn(
                    buttonVariants({ variant: "ghost", size: "icon-sm" }),
                    "text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer",
                  )}
                >
                  <Trash2 className="size-3.5" />
                </button>
              </>
            )}
          </div>
        ),
      },
    ]

    return cols
  }, [selectedIds, isAllSelected, isSomeSelected, isCompact, canEdit, toggleSelect, toggleSelectAll])

  return (
    <div className="relative flex flex-col h-full">
      {/* Banner when selecting all on current page while more exist across other pages */}
      {isAllSelected && allFilteredIds && allFilteredIds.length > students.length && selectedIds.size < allFilteredIds.length && (
        <div className="mb-3 flex items-center justify-between rounded-xl border border-primary/30 bg-primary/10 px-4 py-2 text-xs text-primary animate-in fade-in-0 duration-150">
          <span>
            เลือกนักเรียนในหน้านี้แล้ว <strong>{students.length}</strong> คน
          </span>
          <button
            type="button"
            onClick={selectAllFiltered}
            className="font-bold underline hover:opacity-80 cursor-pointer"
          >
            เลือกนักเรียนทั้งหมด {allFilteredIds.length} คนในผลการค้นหานี้
          </button>
        </div>
      )}

      {allFilteredIds && selectedIds.size === allFilteredIds.length && allFilteredIds.length > students.length && (
        <div className="mb-3 flex items-center justify-between rounded-xl border border-primary/30 bg-primary/10 px-4 py-2 text-xs text-primary animate-in fade-in-0 duration-150">
          <span>
            เลือกนักเรียนทั้งหมด <strong>{allFilteredIds.length}</strong> คนในผลการค้นหานี้แล้ว
          </span>
          <button
            type="button"
            onClick={() => setSelectedIds(new Set())}
            className="font-bold underline hover:opacity-80 cursor-pointer"
          >
            ยกเลิกการเลือก
          </button>
        </div>
      )}

      <DataTable
        className="h-full min-h-[420px]"
        columns={columns}
        data={students}
        emptyState={
          <EmptyState
            size="compact"
            title="ไม่พบนักเรียนตามตัวกรอง"
            description="ลองล้างตัวกรองหรือค้นหาด้วยชื่อ รหัสนักเรียน หรือชื่อผู้ปกครอง"
          />
        }
        getRowKey={(student) => student.id}
        rowClassName={(student) => {
          const isSelected = selectedIds.has(student.id)
          if (isSelected) return "bg-primary/10 hover:bg-primary/15"
          if (student.riskLevel === "high") return "bg-destructive/5 hover:bg-destructive/10"
          return undefined
        }}
        toolbar={
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

            <div className="flex items-center gap-2">
              {canEdit && summary.total > 0 && (
                <button
                  type="button"
                  onClick={() => setIsClearAllModalOpen(true)}
                  title="ล้างข้อมูลนักเรียนทั้งหมดในโรงเรียน"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-destructive/30 bg-destructive/10 text-destructive text-xs font-medium hover:bg-destructive/20 transition-colors cursor-pointer"
                >
                  <Trash2 className="size-3.5" />
                  <span>ล้างข้อมูลทั้งหมด ({summary.total})</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsCompact((prev) => !prev)}
                title={isCompact ? "แสดงแบบปกติ" : "แสดงแบบกะทัดรัด"}
                className={cn(
                  "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium transition-colors cursor-pointer",
                  isCompact
                    ? "bg-primary/10 border-primary/30 text-primary"
                    : "bg-background border-border text-muted-foreground hover:text-foreground"
                )}
              >
                <SlidersHorizontal className="size-3.5" />
                <span>{isCompact ? "กะทัดรัด" : "ปกติ"}</span>
              </button>
            </div>
          </div>
        }
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

      {/* Floating Bulk Operations Toolbar */}
      {selectedIds.size > 0 && (
        <div className="sticky bottom-4 z-30 mt-3 mx-auto flex items-center justify-between gap-4 rounded-xl border border-primary/30 bg-card/95 px-4 py-2.5 shadow-xl backdrop-blur-md animate-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs font-semibold text-foreground">
              เลือกแล้ว{" "}
              <span className="text-primary font-mono tabular-nums font-bold">
                {selectedIds.size}
              </span>{" "}
              คน
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportSelected}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground shadow-xs transition-colors hover:bg-primary/90 cursor-pointer"
            >
              <Download className="size-3.5" />
              <span>ส่งออก CSV (Excel)</span>
            </button>
            {canEdit && (
              <button
                type="button"
                onClick={() => setIsBatchDeleteModalOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-destructive px-3 py-1.5 text-xs font-semibold text-destructive-foreground shadow-xs transition-colors hover:bg-destructive/90 cursor-pointer"
              >
                <Trash2 className="size-3.5" />
                <span>ลบที่เลือก ({selectedIds.size})</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => setSelectedIds(new Set())}
              className="inline-flex items-center gap-1 rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground hover:bg-muted cursor-pointer"
            >
              <X className="size-3.5" />
              <span>ยกเลิก</span>
            </button>
          </div>
        </div>
      )}

      {/* Modal 1: Batch Delete Confirmation */}
      {isBatchDeleteModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4"
        >
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl animate-in fade-in-0 zoom-in-95">
            <div className="flex items-start gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
                <Trash2 className="size-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-semibold text-foreground">
                  ยืนยันการลบนักเรียน {selectedIds.size} คน
                </h3>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                  ข้อมูลที่เกี่ยวข้องทั้งหมด เช่น ประวัติการเข้าเรียน ข้อมูลผู้ปกครอง และบันทึกพฤติกรรม จะถูกลบถาวรออกจากระบบและไม่สามารถกู้คืนได้
                </p>
              </div>
            </div>

            <div className="mt-4 max-h-36 overflow-y-auto rounded-lg border border-border bg-muted/40 p-2.5 text-xs text-muted-foreground divide-y divide-border/50">
              {selectedStudentsPreview.map((s) => (
                <div key={s.id} className="py-1 flex items-center justify-between">
                  <span className="font-medium text-foreground">{s.name}</span>
                  <span className="font-mono text-muted-foreground">
                    {s.studentCode} ({s.grade}/{s.classroom})
                  </span>
                </div>
              ))}
              {selectedIds.size > selectedStudentsPreview.length && (
                <div className="py-1 text-center font-medium text-muted-foreground">
                  ...และอีก {selectedIds.size - selectedStudentsPreview.length} คน
                </div>
              )}
            </div>

            <div className="mt-6 flex items-center justify-end gap-2.5">
              <button
                type="button"
                disabled={isBatchDeleting}
                onClick={() => setIsBatchDeleteModalOpen(false)}
                className="rounded-xl border border-input bg-background px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                disabled={isBatchDeleting}
                onClick={handleExecuteBatchDelete}
                className="inline-flex items-center gap-1.5 rounded-xl bg-destructive px-4 py-2 text-xs font-semibold text-destructive-foreground shadow-xs hover:bg-destructive/90 disabled:opacity-50 cursor-pointer"
              >
                {isBatchDeleting ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    กำลังลบ...
                  </>
                ) : (
                  <>
                    <Trash2 className="size-3.5" />
                    ยืนยันการลบ ({selectedIds.size} คน)
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Single Student Delete Confirmation */}
      {studentToDelete && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4"
        >
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl animate-in fade-in-0 zoom-in-95">
            <div className="flex items-start gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
                <Trash2 className="size-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-semibold text-foreground">
                  ยืนยันการลบข้อมูลนักเรียน
                </h3>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                  คุณต้องการลบ <strong className="text-foreground">{studentToDelete.name}</strong> (รหัสประจำตัว: <span className="font-mono">{studentToDelete.studentCode}</span>) ใช่หรือไม่? ข้อมูลทั้งหมดที่เกี่ยวข้องจะถูกลบถาวร
                </p>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2.5">
              <button
                type="button"
                disabled={isSingleDeleting}
                onClick={() => setStudentToDelete(null)}
                className="rounded-xl border border-input bg-background px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                disabled={isSingleDeleting}
                onClick={handleExecuteSingleDelete}
                className="inline-flex items-center gap-1.5 rounded-xl bg-destructive px-4 py-2 text-xs font-semibold text-destructive-foreground shadow-xs hover:bg-destructive/90 disabled:opacity-50 cursor-pointer"
              >
                {isSingleDeleting ? (
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

      {/* Modal 3: Clear All Students Confirmation */}
      {isClearAllModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4"
        >
          <div className="w-full max-w-md rounded-2xl border border-destructive/30 bg-card p-6 shadow-2xl animate-in fade-in-0 zoom-in-95">
            <div className="flex items-start gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
                <AlertTriangle className="size-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-semibold text-destructive">
                  ล้างข้อมูลนักเรียนทั้งหมดในโรงเรียน
                </h3>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                  การดำเนินการนี้จะลบข้อมูลนักเรียนทั้งหมด <strong className="text-foreground font-semibold">{summary.total} คน</strong> ในโรงเรียน เพื่อให้คุณสามารถเริ่มต้นระบบใหม่หรือนำเข้าไฟล์นักเรียนใหม่ได้
                </p>
              </div>
            </div>

            <div className="mt-4 rounded-lg bg-destructive/10 p-3 text-xs text-destructive border border-destructive/20">
              คำเตือน: ข้อมูลการเข้าเรียน บันทึกพฤติกรรม และประวัติทั้งหมดของนักเรียนจะถูกลบถาวร ไม่สามารถกู้คืนได้
            </div>

            <div className="mt-4">
              <label htmlFor="clearConfirmInput" className="block text-xs font-medium text-foreground">
                พิมพ์คำว่า <span className="font-bold text-destructive">ยืนยัน</span> เพื่อดำเนินการ:
              </label>
              <input
                id="clearConfirmInput"
                type="text"
                value={clearConfirmText}
                onChange={(e) => setClearConfirmText(e.target.value)}
                placeholder="พิมพ์ 'ยืนยัน'"
                className="mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-destructive"
              />
            </div>

            <div className="mt-6 flex items-center justify-end gap-2.5">
              <button
                type="button"
                disabled={isClearingAll}
                onClick={() => {
                  setIsClearAllModalOpen(false)
                  setClearConfirmText("")
                }}
                className="rounded-xl border border-input bg-background px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                disabled={isClearingAll || clearConfirmText.trim() !== "ยืนยัน"}
                onClick={handleExecuteClearAll}
                className="inline-flex items-center gap-1.5 rounded-xl bg-destructive px-4 py-2 text-xs font-semibold text-destructive-foreground shadow-xs hover:bg-destructive/90 disabled:opacity-40 cursor-pointer"
              >
                {isClearingAll ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    กำลังล้างข้อมูล...
                  </>
                ) : (
                  <>
                    <Trash2 className="size-3.5" />
                    ล้างข้อมูลทั้งหมด ({summary.total} คน)
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
