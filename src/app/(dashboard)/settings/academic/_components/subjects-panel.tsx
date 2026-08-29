"use client"

import React, { useState, useTransition } from "react"
import { BookOpen, Edit2, Plus, Search, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { deleteSubjectAction } from "@/app/actions/academic-admin.actions"
import { StatusBadge } from "@/components/dashboard/status-badge"
import { EmptyState } from "@/components/feedback/empty-state"
import type { SubjectItem } from "@/lib/server/academic-admin-read-models"
import { SubjectDialog } from "./academic-forms"

const GRADE_LABELS: Record<string, string> = {
  p1: "ป.1",
  p2: "ป.2",
  p3: "ป.3",
  p4: "ป.4",
  p5: "ป.5",
  p6: "ป.6",
  m1: "ม.1",
  m2: "ม.2",
  m3: "ม.3",
  m4: "ม.4",
  m5: "ม.5",
  m6: "ม.6",
}

export function SubjectsPanel({ subjects }: { subjects: SubjectItem[] }) {
  const [editingSubject, setEditingSubject] = useState<SubjectItem | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedArea, setSelectedArea] = useState("")
  const [isPending, startTransition] = useTransition()

  const handleDelete = (id: string, name: string) => {
    if (!confirm(`ยืนยันการลบรายวิชา ${name}?`)) return
    startTransition(async () => {
      const res = await deleteSubjectAction(id)
      if (res.ok) {
        toast.success(res.message)
      } else {
        toast.error(res.message)
      }
    })
  }

  const learningAreas = Array.from(
    new Set(subjects.map((s) => s.learningArea).filter(Boolean))
  ) as string[]

  const filteredSubjects = subjects.filter((s) => {
    const matchQuery =
      !searchQuery ||
      s.subjectCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.nameEn && s.nameEn.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchArea = !selectedArea || s.learningArea === selectedArea

    return matchQuery && matchArea
  })

  return (
    <div className="space-y-6">
      {/* Action and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold">รายวิชาและหลักสูตร</h3>
          <p className="text-sm text-muted-foreground">
            จัดการรหัสวิชา ชื่อวิชา กลุ่มสาระ หน่วยกิต และชั่วโมงเรียน
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setEditingSubject(null)
            setIsDialogOpen(true)
          }}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 shadow-sm"
        >
          <Plus className="size-4" />
          เพิ่มรายวิชา
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[240px] flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ค้นหารหัสวิชา หรือชื่อวิชา..."
            className="w-full rounded-lg border border-input bg-background pl-9 pr-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <select
          value={selectedArea}
          onChange={(e) => setSelectedArea(e.target.value)}
          className="rounded-lg border border-input bg-background px-3 py-1.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">ทุกกลุ่มสาระการเรียนรู้</option>
          {learningAreas.map((area) => (
            <option key={area} value={area}>
              {area}
            </option>
          ))}
        </select>
      </div>

      {/* Subjects Table */}
      {filteredSubjects.length === 0 ? (
        <EmptyState
          title="ไม่พบข้อมูลรายวิชา"
          description="ไม่พบรายวิชาตามเงื่อนไขที่ค้นหา หรือยังไม่ได้สร้างรายวิชาในระบบ"
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-muted/50 text-xs font-semibold text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">รหัสวิชา</th>
                  <th className="px-4 py-3">ชื่อวิชา</th>
                  <th className="px-4 py-3">กลุ่มสาระ</th>
                  <th className="px-4 py-3">ระดับชั้น</th>
                  <th className="px-4 py-3">หน่วยกิต</th>
                  <th className="px-4 py-3">ชม./สัปดาห์</th>
                  <th className="px-4 py-3">สถานะ</th>
                  <th className="px-4 py-3 text-right">การจัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredSubjects.map((sub) => (
                  <tr key={sub.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3 font-semibold text-primary">
                      {sub.subjectCode}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <BookOpen className="size-4 text-muted-foreground shrink-0" />
                        <div>
                          <p className="font-medium">{sub.name}</p>
                          {sub.nameEn && (
                            <p className="text-xs text-muted-foreground">{sub.nameEn}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {sub.learningArea || "-"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {sub.gradeLevel ? GRADE_LABELS[sub.gradeLevel] || sub.gradeLevel : "ทุกระดับชั้น"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {sub.credit ?? 1.0}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {sub.hoursPerWeek ?? 1}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={sub.isActive ? "normal" : "neutral"}>
                        {sub.isActive ? "เปิดสอน" : "ปิดสอน"}
                      </StatusBadge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingSubject(sub)
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
                          onClick={() => handleDelete(sub.id, sub.name)}
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
        <SubjectDialog
          initialData={editingSubject}
          onClose={() => setIsDialogOpen(false)}
        />
      )}
    </div>
  )
}
