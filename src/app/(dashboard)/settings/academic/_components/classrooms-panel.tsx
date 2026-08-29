"use client"

import React, { useState, useTransition } from "react"
import { Building, Edit2, Plus, Trash2, Users } from "lucide-react"
import { toast } from "sonner"

import { deleteClassroomAction } from "@/app/actions/academic-admin.actions"
import { StatusBadge } from "@/components/dashboard/status-badge"
import { EmptyState } from "@/components/feedback/empty-state"
import type {
  AcademicYearItem,
  ClassroomItem,
  TeacherOption,
} from "@/lib/server/academic-admin-read-models"
import { ClassroomDialog } from "./academic-forms"

const GRADE_LABELS: Record<string, string> = {
  p1: "ประถมศึกษาปีที่ 1",
  p2: "ประถมศึกษาปีที่ 2",
  p3: "ประถมศึกษาปีที่ 3",
  p4: "ประถมศึกษาปีที่ 4",
  p5: "ประถมศึกษาปีที่ 5",
  p6: "ประถมศึกษาปีที่ 6",
  m1: "มัธยมศึกษาปีที่ 1",
  m2: "มัธยมศึกษาปีที่ 2",
  m3: "มัธยมศึกษาปีที่ 3",
  m4: "มัธยมศึกษาปีที่ 4",
  m5: "มัธยมศึกษาปีที่ 5",
  m6: "มัธยมศึกษาปีที่ 6",
}

export function ClassroomsPanel({
  academicYears,
  classrooms,
  teachers,
}: {
  academicYears: AcademicYearItem[]
  classrooms: ClassroomItem[]
  teachers: TeacherOption[]
}) {
  const [editingClassroom, setEditingClassroom] = useState<ClassroomItem | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedYearId, setSelectedYearId] = useState<string>(
    academicYears.find((y) => y.isCurrent)?.id || academicYears[0]?.id || ""
  )
  const [isPending, startTransition] = useTransition()

  const handleDelete = (id: string, name: string) => {
    if (!confirm(`ยืนยันการลบห้องเรียน ${name}?`)) return
    startTransition(async () => {
      const res = await deleteClassroomAction(id)
      if (res.ok) {
        toast.success(res.message)
      } else {
        toast.error(res.message)
      }
    })
  }

  const filteredClassrooms = classrooms.filter(
    (c) => !selectedYearId || c.academicYearId === selectedYearId
  )

  return (
    <div className="space-y-6">
      {/* Action and Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold">ห้องเรียนและครูประจำชั้น</h3>
          <p className="text-sm text-muted-foreground">
            จัดการรายชื่อห้องเรียน กำหนดครูประจำชั้น และตรวจสอบจำนวนนักเรียน
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedYearId}
            onChange={(e) => setSelectedYearId(e.target.value)}
            className="rounded-lg border border-input bg-background px-3 py-1.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">ทุกปีการศึกษา</option>
            {academicYears.map((y) => (
              <option key={y.id} value={y.id}>
                ปีการศึกษา {y.year} {y.isCurrent ? "(ปัจจุบัน)" : ""}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => {
              setEditingClassroom(null)
              setIsDialogOpen(true)
            }}
            disabled={academicYears.length === 0}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 shadow-sm"
          >
            <Plus className="size-4" />
            เพิ่มห้องเรียน
          </button>
        </div>
      </div>

      {/* Classrooms Table */}
      {filteredClassrooms.length === 0 ? (
        <EmptyState
          title="ไม่พบข้อมูลห้องเรียน"
          description="ยังไม่มีห้องเรียนในระบบสำหรับเงื่อนไขที่เลือก คลิก 'เพิ่มห้องเรียน' เพื่อสร้างห้องเรียนใหม่"
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-muted/50 text-xs font-semibold text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">ห้องเรียน</th>
                  <th className="px-4 py-3">ระดับชั้น</th>
                  <th className="px-4 py-3">ปีการศึกษา</th>
                  <th className="px-4 py-3">ครูประจำชั้น</th>
                  <th className="px-4 py-3">จำนวนนักเรียน</th>
                  <th className="px-4 py-3">สถานะ</th>
                  <th className="px-4 py-3 text-right">การจัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredClassrooms.map((cr) => (
                  <tr key={cr.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Building className="size-4 text-primary shrink-0" />
                        <div>
                          <p className="font-semibold">{cr.name}</p>
                          {cr.roomNumber && (
                            <p className="text-xs text-muted-foreground">ห้อง {cr.roomNumber}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {GRADE_LABELS[cr.gradeLevel] || cr.gradeLevel} (ห้อง {cr.section})
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{cr.academicYear}</td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium">{cr.homeroomTeacherName || "-"}</p>
                        {cr.coTeacherName && (
                          <p className="text-xs text-muted-foreground">ร่วม: {cr.coTeacherName}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 text-xs">
                        <Users className="size-3.5 text-muted-foreground" />
                        <span>
                          {cr.studentCount} / {cr.maxStudents || 40} คน
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={cr.isActive ? "normal" : "neutral"}>
                        {cr.isActive ? "เปิดใช้งาน" : "ปิดใช้งาน"}
                      </StatusBadge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingClassroom(cr)
                            setIsDialogOpen(true)
                          }}
                          className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                          title="แก้ไข"
                        >
                          <Edit2 className="size-4" />
                        </button>
                        <button
                          type="button"
                          disabled={isPending || cr.studentCount > 0}
                          onClick={() => handleDelete(cr.id, cr.name)}
                          className="rounded-lg p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive disabled:opacity-30"
                          title={
                            cr.studentCount > 0
                              ? "ไม่สามารถลบห้องเรียนที่มีนักเรียนลงทะเบียนอยู่ได้"
                              : "ลบ"
                          }
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {isDialogOpen && (
        <ClassroomDialog
          academicYears={academicYears}
          teachers={teachers}
          initialData={editingClassroom}
          onClose={() => setIsDialogOpen(false)}
        />
      )}
    </div>
  )
}
