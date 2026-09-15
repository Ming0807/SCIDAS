"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { CheckSquare, Download, Edit2, Eye, SlidersHorizontal, Square, X } from "lucide-react"

import { StudentIdentity } from "@/components/dashboard"
import { StatusBadge } from "@/components/dashboard/status-badge"
import { DataTable, Pagination, type DataTableColumn } from "@/components/data"
import { EmptyState } from "@/components/feedback"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

import type { StudentListItem, StudentSummary } from "./student-data"

export function StudentTable({
  students,
  summary,
  totalFiltered,
  page,
  totalPages,
  pageSize,
  getPageHref,
  canEdit,
}: {
  students: StudentListItem[]
  summary: StudentSummary
  totalFiltered: number
  page: number
  totalPages: number
  pageSize: number
  getPageHref: (page: number) => string
  canEdit: boolean
}) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [isCompact, setIsCompact] = useState(false)

  const isAllSelected = students.length > 0 && students.every((s) => selectedIds.has(s.id))
  const isSomeSelected = students.some((s) => selectedIds.has(s.id)) && !isAllSelected

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(students.map((s) => s.id)))
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
        cell: (student) => student.phone || "-",
      },
      {
        id: "actions",
        header: "จัดการ",
        align: "right",
        sticky: "right",
        className: "w-32",
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
              <Link
                aria-label={`แก้ไขข้อมูล ${student.name}`}
                title="แก้ไขข้อมูลนักเรียน"
                href={`/students/${student.id}/edit`}
                className={cn(buttonVariants({ variant: "ghost", size: "icon-sm" }))}
              >
                <Edit2 className="size-3.5" />
              </Link>
            )}
          </div>
        ),
      },
    ]

    return cols
  }, [students, selectedIds, isAllSelected, isSomeSelected, isCompact, canEdit])

  return (
    <div className="relative flex flex-col h-full">
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
    </div>
  )
}
