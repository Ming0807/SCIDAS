"use client"

import React, { useState, useTransition } from "react"
import { Edit2, GraduationCap, Plus, Trash2, UserCheck } from "lucide-react"
import { toast } from "sonner"

import { deleteClassroomSubjectAction } from "@/app/actions/academic-admin.actions"
import { EmptyState } from "@/components/feedback/empty-state"
import type {
  ClassroomItem,
  ClassroomSubjectItem,
  SemesterItem,
  SubjectItem,
  TeacherOption,
} from "@/lib/server/academic-admin-read-models"
import { AssignmentDialog } from "./academic-forms"

export function AssignmentsPanel({
  classrooms,
  subjects,
  classroomSubjects,
  teachers,
  semesters,
}: {
  classrooms: ClassroomItem[]
  subjects: SubjectItem[]
  classroomSubjects: ClassroomSubjectItem[]
  teachers: TeacherOption[]
  semesters: SemesterItem[]
}) {
  const [editingAssignment, setEditingAssignment] = useState<ClassroomSubjectItem | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedSemesterId, setSelectedSemesterId] = useState<string>(
    semesters.find((s) => s.isCurrent)?.id || semesters[0]?.id || ""
  )
  const [selectedClassroomId, setSelectedClassroomId] = useState<string>("")
  const [isPending, startTransition] = useTransition()

  const handleDelete = (id: string, label: string) => {
    if (!confirm(`ยืนยันการยกเลิกการมอบหมายวิชา ${label}?`)) return
    startTransition(async () => {
      const res = await deleteClassroomSubjectAction(id)
      if (res.ok) {
        toast.success(res.message)
      } else {
        toast.error(res.message)
      }
    })
  }

  const filteredAssignments = classroomSubjects.filter((a) => {
    const matchSem = !selectedSemesterId || a.semesterId === selectedSemesterId
    const matchClass = !selectedClassroomId || a.classroomId === selectedClassroomId
    return matchSem && matchClass
  })

  return (
    <div className="space-y-6">
      {/* Action and Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold">มอบหมายครูประจำวิชา</h3>
          <p className="text-sm text-muted-foreground">
            กำหนดครูผู้สอนประจำห้องเรียนและสัดส่วนคะแนน (คะแนนเก็บ/กลางภาค/ปลายภาค)
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setEditingAssignment(null)
            setIsDialogOpen(true)
          }}
          disabled={classrooms.length === 0 || subjects.length === 0 || teachers.length === 0}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 shadow-sm"
        >
          <Plus className="size-4" />
          มอบหมายวิชา
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={selectedSemesterId}
          onChange={(e) => setSelectedSemesterId(e.target.value)}
          className="rounded-lg border border-input bg-background px-3 py-1.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">ทุกภาคเรียน</option>
          {semesters.map((s) => (
            <option key={s.id} value={s.id}>
              ภาคเรียนที่ {s.semester === "semester_1" ? "1" : "2"}/{s.academicYear} {s.isCurrent ? "(ปัจจุบัน)" : ""}
            </option>
          ))}
        </select>

        <select
          value={selectedClassroomId}
          onChange={(e) => setSelectedClassroomId(e.target.value)}
          className="rounded-lg border border-input bg-background px-3 py-1.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">ทุกห้องเรียน</option>
          {classrooms.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} (ปี {c.academicYear})
            </option>
          ))}
        </select>
      </div>

      {/* Assignments Table */}
      {filteredAssignments.length === 0 ? (
        <EmptyState
          title="ไม่พบข้อมูลการมอบหมายวิชา"
          description="ยังไม่มีการมอบหมายครูผู้สอนในเงื่อนไขที่เลือก คลิก 'มอบหมายวิชา' เพื่อเริ่มต้น"
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-muted/50 text-xs font-semibold text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">ห้องเรียน</th>
                  <th className="px-4 py-3">รหัสวิชา - ชื่อวิชา</th>
                  <th className="px-4 py-3">ครูผู้สอน</th>
                  <th className="px-4 py-3">ภาคเรียน</th>
                  <th className="px-4 py-3 text-center">สัดส่วนคะแนน (เก็บ:กลาง:ปลาย)</th>
                  <th className="px-4 py-3 text-right">การจัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredAssignments.map((as) => (
                  <tr key={as.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <GraduationCap className="size-4 text-primary shrink-0" />
                        <span className="font-semibold">{as.classroomName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium">
                          <span className="text-primary font-semibold mr-1.5">{as.subjectCode}</span>
                          {as.subjectName}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <UserCheck className="size-3.5 text-muted-foreground" />
                        <span className="font-medium">{as.teacherName || "-"}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {as.semester === "semester_1" ? "1" : "2"}/{as.academicYear}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium">
                        {as.classworkMaxScore ?? 60} : {as.midtermMaxScore ?? 20} : {as.finalMaxScore ?? 20}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingAssignment(as)
                            setIsDialogOpen(true)
                          }}
                          className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                          title="แก้ไข"
                        >
                          <Edit2 className="size-4" />
                        </button>
                        <button
                          type="button"
                          disabled={isPending}
                          onClick={() => handleDelete(as.id, `${as.subjectCode} (${as.classroomName})`)}
                          className="rounded-lg p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive disabled:opacity-30"
                          title="ลบ"
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
        <AssignmentDialog
          classrooms={classrooms}
          subjects={subjects}
          teachers={teachers}
          semesters={semesters}
          initialData={editingAssignment}
          onClose={() => setIsDialogOpen(false)}
        />
      )}
    </div>
  )
}
