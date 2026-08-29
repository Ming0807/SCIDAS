"use client"

import React, { useState, useTransition } from "react"
import {
  Briefcase,
  HeartHandshake,
  Loader2,
  Phone,
  Plus,
  Trash2,
  UserCheck,
  UserRound,
  X,
} from "lucide-react"
import { toast } from "sonner"

import {
  deleteStudentGuardianAction,
  upsertStudentGuardianAction,
} from "@/app/actions/student.actions"
import { EmptyState } from "@/components/feedback/empty-state"
import type { StudentGuardianItem } from "@/lib/server/student-care-read-models"

type StudentGuardianManagerProps = {
  studentId: string
  guardians: StudentGuardianItem[]
  canEdit: boolean
}

export function StudentGuardianManager({
  studentId,
  guardians,
  canEdit,
}: StudentGuardianManagerProps) {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingGuardian, setEditingGuardian] = useState<StudentGuardianItem | null>(null)
  const [isPending, startTransition] = useTransition()

  // Form states
  const [prefix, setPrefix] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [phone, setPhone] = useState("")
  const [relationship, setRelationship] = useState("father")
  const [isPrimary, setIsPrimary] = useState(false)

  const openAddForm = () => {
    setEditingGuardian(null)
    setPrefix("")
    setFirstName("")
    setLastName("")
    setPhone("")
    setRelationship("father")
    setIsPrimary(guardians.length === 0)
    setIsFormOpen(true)
  }

  const openEditForm = (g: StudentGuardianItem) => {
    setEditingGuardian(g)
    setPrefix(g.prefix || "")
    setFirstName(g.firstName)
    setLastName(g.lastName)
    setPhone(g.phone || "")
    setRelationship(g.relationship || "guardian")
    setIsPrimary(g.isPrimary)
    setIsFormOpen(true)
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (!firstName.trim()) {
      toast.error("กรุณากรอกชื่อผู้ปกครอง")
      return
    }

    startTransition(async () => {
      const formData = new FormData()
      formData.set("student_id", studentId)
      if (editingGuardian) {
        formData.set("guardian_id", editingGuardian.guardianId)
      }
      if (prefix) formData.set("prefix", prefix)
      formData.set("first_name", firstName.trim())
      formData.set("last_name", lastName.trim())
      if (phone) formData.set("phone", phone.trim())
      formData.set("relationship", relationship)
      if (isPrimary) formData.set("is_primary", "true")

      const res = await upsertStudentGuardianAction(null, formData)
      if (res.ok) {
        toast.success(res.message || "บันทึกข้อมูลผู้ปกครองสำเร็จ")
        setIsFormOpen(false)
      } else {
        toast.error(res.message || "เกิดข้อผิดพลาดในการบันทึกข้อมูลผู้ปกครอง")
      }
    })
  }

  const handleDelete = (guardianId: string, name: string) => {
    if (!confirm(`คุณต้องการลบข้อมูลผู้ปกครอง "${name}" หรือไม่?`)) {
      return
    }

    startTransition(async () => {
      const res = await deleteStudentGuardianAction(studentId, guardianId)
      if (res.ok) {
        toast.success("ลบข้อมูลผู้ปกครองเรียบร้อยแล้ว")
      } else {
        toast.error(res.message || "เกิดข้อผิดพลาดในการลบผู้ปกครอง")
      }
    })
  }

  const relationshipLabels: Record<string, string> = {
    father: "บิดา",
    mother: "มารดา",
    guardian: "ผู้ปกครอง",
    grandparent: "ปู่/ย่า/ตา/ยาย",
    relative: "ญาติ",
    other: "อื่นๆ",
  }

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <HeartHandshake className="size-5 text-primary" />
          <h3 className="text-base font-semibold">ข้อมูลผู้ปกครอง ({guardians.length} คน)</h3>
        </div>
        {canEdit && !isFormOpen && (
          <button
            type="button"
            onClick={openAddForm}
            className="inline-flex items-center gap-1.5 rounded-lg border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/20 transition-colors"
          >
            <Plus className="size-3.5" />
            เพิ่มผู้ปกครอง
          </button>
        )}
      </div>

      {/* Form Drawer / Dialog */}
      {isFormOpen && (
        <form onSubmit={handleSave} className="rounded-xl border border-primary/30 bg-primary/5 p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-border/50 pb-2">
            <h4 className="text-sm font-semibold">
              {editingGuardian ? "แก้ไขข้อมูลผู้ปกครอง" : "เพิ่มผู้ปกครองใหม่"}
            </h4>
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <label htmlFor="gPrefix" className="block text-xs font-medium mb-1">
                คำนำหน้า
              </label>
              <select
                id="gPrefix"
                value={prefix}
                onChange={(e) => setPrefix(e.target.value)}
                className="w-full rounded-lg border border-input bg-background px-3 py-1.5 text-sm"
              >
                <option value="">ไม่ระบุ</option>
                <option value="นาย">นาย</option>
                <option value="นาง">นาง</option>
                <option value="นางสาว">นางสาว</option>
              </select>
            </div>
            <div>
              <label htmlFor="gFirst" className="block text-xs font-medium mb-1">
                ชื่อ <span className="text-destructive">*</span>
              </label>
              <input
                id="gFirst"
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="ชื่อจริง"
                className="w-full rounded-lg border border-input bg-background px-3 py-1.5 text-sm"
              />
            </div>
            <div>
              <label htmlFor="gLast" className="block text-xs font-medium mb-1">
                นามสกุล
              </label>
              <input
                id="gLast"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="นามสกุล"
                className="w-full rounded-lg border border-input bg-background px-3 py-1.5 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="gPhone" className="block text-xs font-medium mb-1">
                เบอร์โทรศัพท์
              </label>
              <input
                id="gPhone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="เช่น 0812345678"
                className="w-full rounded-lg border border-input bg-background px-3 py-1.5 text-sm"
              />
            </div>
            <div>
              <label htmlFor="gRel" className="block text-xs font-medium mb-1">
                ความสัมพันธ์
              </label>
              <select
                id="gRel"
                value={relationship}
                onChange={(e) => setRelationship(e.target.value)}
                className="w-full rounded-lg border border-input bg-background px-3 py-1.5 text-sm"
              >
                <option value="father">บิดา</option>
                <option value="mother">มารดา</option>
                <option value="guardian">ผู้ปกครอง</option>
                <option value="grandparent">ปู่/ย่า/ตา/ยาย</option>
                <option value="relative">ญาติ</option>
                <option value="other">อื่นๆ</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="is_primary"
              checked={isPrimary}
              onChange={(e) => setIsPrimary(e.target.checked)}
              className="size-4 rounded border-input text-primary focus:ring-primary"
            />
            <label htmlFor="is_primary" className="text-xs font-medium cursor-pointer">
              ตั้งเป็นผู้ปกครองหลัก (Primary Guardian)
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-border/50">
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="rounded-lg border border-input bg-background px-3 py-1.5 text-xs font-medium hover:bg-muted"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90"
            >
              {isPending && <Loader2 className="size-3.5 animate-spin" />}
              {isPending ? "กำลังบันทึก..." : "บันทึก"}
            </button>
          </div>
        </form>
      )}

      {/* Guardians List */}
      {guardians.length === 0 ? (
        <EmptyState
          title="ยังไม่มีข้อมูลผู้ปกครอง"
          description="สามารถเพิ่มข้อมูลผู้ปกครองเพื่อใช้ในการติดต่อและประเมินความเสี่ยง"
          className="py-6"
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {guardians.map((g) => (
            <div
              key={g.id}
              className={
                "rounded-xl border p-4 transition-colors " +
                (g.isPrimary
                  ? "border-primary/40 bg-primary/5"
                  : "border-border bg-card hover:bg-muted/20")
              }
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div
                    className={
                      "flex size-9 items-center justify-center rounded-lg " +
                      (g.isPrimary ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")
                    }
                  >
                    <UserRound className="size-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                      {g.fullName}
                      {g.isPrimary && (
                        <span className="inline-flex items-center gap-0.5 rounded bg-primary/20 px-1.5 py-0.5 text-[10px] font-bold text-primary">
                          <UserCheck className="size-3" /> ผู้ปกครองหลัก
                        </span>
                      )}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      {relationshipLabels[g.relationship] || g.relationship}
                    </p>
                  </div>
                </div>

                {canEdit && (
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => openEditForm(g)}
                      className="rounded p-1 text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
                      title="แก้ไข"
                    >
                      แก้ไข
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(g.guardianId, g.fullName)}
                      disabled={isPending}
                      className="rounded p-1 text-xs text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      title="ลบ"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                )}
              </div>

              <div className="mt-3 grid grid-cols-1 gap-1 text-xs text-muted-foreground pt-2 border-t border-border/50">
                <div className="flex items-center gap-1.5">
                  <Phone className="size-3" />
                  <span>{g.phone || "ไม่ระบุเบอร์โทร"}</span>
                </div>
                {g.occupation && (
                  <div className="flex items-center gap-1.5">
                    <Briefcase className="size-3" />
                    <span>{g.occupation}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
