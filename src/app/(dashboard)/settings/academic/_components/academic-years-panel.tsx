"use client"

import React, { useState, useTransition } from "react"
import { Calendar, CheckCircle2, Edit2, Plus, Star, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { deleteAcademicYearAction, deleteSemesterAction, setCurrentSemesterAction } from "@/app/actions/academic-admin.actions"
import { StatusBadge } from "@/components/dashboard/status-badge"
import { EmptyState } from "@/components/feedback/empty-state"
import { formatThaiShortDate } from "@/lib/student-care-formatters"
import type { AcademicYearItem, SemesterItem } from "@/lib/server/academic-admin-read-models"
import { AcademicYearDialog, SemesterDialog } from "./academic-forms"

export function AcademicYearsPanel({
  academicYears,
  semesters,
}: {
  academicYears: AcademicYearItem[]
  semesters: SemesterItem[]
}) {
  const [editingYear, setEditingYear] = useState<AcademicYearItem | null>(null)
  const [isYearDialogOpen, setIsYearDialogOpen] = useState(false)
  const [editingSemester, setEditingSemester] = useState<SemesterItem | null>(null)
  const [isSemesterDialogOpen, setIsSemesterDialogOpen] = useState(false)
  const [selectedYearId, setSelectedYearId] = useState<string>(
    academicYears.find((y) => y.isCurrent)?.id || academicYears[0]?.id || ""
  )
  const [isPending, startTransition] = useTransition()

  const handleDeleteYear = (id: string, year: number) => {
    if (!confirm(`ยืนยันการลบปีการศึกษา ${year}?`)) return
    startTransition(async () => {
      const res = await deleteAcademicYearAction(id)
      if (res.ok) {
        toast.success(res.message)
      } else {
        toast.error(res.message)
      }
    })
  }

  const handleDeleteSemester = (id: string, label: string) => {
    if (!confirm(`ยืนยันการลบภาคเรียน ${label}?`)) return
    startTransition(async () => {
      const res = await deleteSemesterAction(id)
      if (res.ok) {
        toast.success(res.message)
      } else {
        toast.error(res.message)
      }
    })
  }

  const handleSetCurrentSemester = (id: string, label: string) => {
    startTransition(async () => {
      const res = await setCurrentSemesterAction(id)
      if (res.ok) {
        toast.success(`ตั้งภาคเรียน ${label} เป็นภาคเรียนปัจจุบันเรียบร้อยแล้ว`)
      } else {
        toast.error(res.message)
      }
    })
  }

  const filteredSemesters = semesters.filter(
    (s) => !selectedYearId || s.academicYearId === selectedYearId
  )

  return (
    <div className="space-y-6">
      {/* Top action bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold">ปีการศึกษาและภาคเรียน</h3>
          <p className="text-sm text-muted-foreground">
            จัดการโครงสร้างปีการศึกษา และกำหนดภาคเรียนปัจจุบันของโรงเรียน
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setEditingYear(null)
              setIsYearDialogOpen(true)
            }}
            className="inline-flex items-center gap-1.5 rounded-lg border border-input bg-background px-3 py-1.5 text-sm font-medium hover:bg-muted shadow-sm"
          >
            <Plus className="size-4" />
            เพิ่มปีการศึกษา
          </button>
          <button
            type="button"
            onClick={() => {
              setEditingSemester(null)
              setIsSemesterDialogOpen(true)
            }}
            disabled={academicYears.length === 0}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 shadow-sm"
          >
            <Plus className="size-4" />
            เพิ่มภาคเรียน
          </button>
        </div>
      </div>

      {/* Academic Years Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {academicYears.map((y) => (
          <div
            key={y.id}
            onClick={() => setSelectedYearId(y.id)}
            className={`cursor-pointer rounded-xl border p-4 shadow-sm transition-all ${
              selectedYearId === y.id
                ? "border-primary bg-primary/5 ring-1 ring-primary"
                : "border-border bg-card hover:border-border/80 hover:bg-muted/40"
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="size-5 text-primary" />
                <h4 className="font-semibold">ปีการศึกษา {y.year}</h4>
              </div>
              {y.isCurrent && (
                <StatusBadge status="normal">ปีปัจจุบัน</StatusBadge>
              )}
            </div>

            <div className="mt-3 space-y-1 text-xs text-muted-foreground">
              <p>
                ระยะเวลา: {formatThaiShortDate(y.startDate)} - {formatThaiShortDate(y.endDate)}
              </p>
              <p>
                {y.semestersCount} ภาคเรียน · {y.classroomsCount} ห้องเรียน
              </p>
            </div>

            <div className="mt-4 flex items-center justify-end gap-2 border-t border-border pt-3">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  setEditingYear(y)
                  setIsYearDialogOpen(true)
                }}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-background hover:text-foreground"
                title="แก้ไข"
              >
                <Edit2 className="size-4" />
              </button>
              <button
                type="button"
                disabled={isPending || y.semestersCount > 0 || y.classroomsCount > 0}
                onClick={(e) => {
                  e.stopPropagation()
                  handleDeleteYear(y.id, y.year)
                }}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive disabled:opacity-30"
                title={
                  y.semestersCount > 0 || y.classroomsCount > 0
                    ? "ไม่สามารถลบปีการศึกษาที่มีข้อมูลผูกอยู่ได้"
                    : "ลบ"
                }
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Semesters Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold">
            รายการภาคเรียน{" "}
            {selectedYearId &&
              `สำหรับปีการศึกษา ${academicYears.find((y) => y.id === selectedYearId)?.year || ""}`}
          </h4>
        </div>

        {filteredSemesters.length === 0 ? (
          <EmptyState
            title="ไม่พบข้อมูลภาคเรียน"
            description="ยังไม่มีการสร้างภาคเรียนสำหรับปีการศึกษานี้ คลิก 'เพิ่มภาคเรียน' เพื่อเริ่มต้น"
          />
        ) : (
          <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-border bg-muted/50 text-xs font-semibold text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3">ภาคเรียน</th>
                    <th className="px-4 py-3">ปีการศึกษา</th>
                    <th className="px-4 py-3">ระยะเวลา</th>
                    <th className="px-4 py-3">สถานะ</th>
                    <th className="px-4 py-3 text-right">การจัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredSemesters.map((sem) => {
                    const semLabel = sem.semester === "semester_1" ? "1" : "2"
                    const label = `${semLabel}/${sem.academicYear}`
                    return (
                      <tr key={sem.id} className="hover:bg-muted/30">
                        <td className="px-4 py-3 font-medium">
                          ภาคเรียนที่ {semLabel}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{sem.academicYear}</td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {formatThaiShortDate(sem.startDate)} - {formatThaiShortDate(sem.endDate)}
                        </td>
                        <td className="px-4 py-3">
                          {sem.isCurrent ? (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                              <CheckCircle2 className="size-3.5" />
                              ภาคเรียนปัจจุบัน
                            </span>
                          ) : (
                            <button
                              type="button"
                              disabled={isPending}
                              onClick={() => handleSetCurrentSemester(sem.id, label)}
                              className="inline-flex items-center gap-1 rounded-md border border-input bg-background px-2 py-1 text-xs font-medium hover:bg-muted"
                            >
                              <Star className="size-3 text-amber-500" />
                              ตั้งเป็นปัจจุบัน
                            </button>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingSemester(sem)
                                setIsSemesterDialogOpen(true)
                              }}
                              className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                              title="แก้ไข"
                            >
                              <Edit2 className="size-4" />
                            </button>
                            <button
                              type="button"
                              disabled={isPending || sem.isCurrent}
                              onClick={() => handleDeleteSemester(sem.id, label)}
                              className="rounded-lg p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive disabled:opacity-30"
                              title={sem.isCurrent ? "ไม่สามารถลบภาคเรียนปัจจุบันได้" : "ลบ"}
                            >
                              <Trash2 className="size-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {isYearDialogOpen && (
        <AcademicYearDialog
          initialData={editingYear}
          onClose={() => setIsYearDialogOpen(false)}
        />
      )}

      {isSemesterDialogOpen && (
        <SemesterDialog
          academicYears={academicYears}
          initialData={editingSemester}
          defaultYearId={selectedYearId}
          onClose={() => setIsSemesterDialogOpen(false)}
        />
      )}
    </div>
  )
}
