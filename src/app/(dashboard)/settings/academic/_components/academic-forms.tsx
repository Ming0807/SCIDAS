"use client"

import React, { useActionState, useEffect } from "react"
import { Loader2, X } from "lucide-react"
import { toast } from "sonner"

import {
  upsertAcademicYearAction,
  upsertSemesterAction,
  upsertClassroomAction,
  upsertSubjectAction,
  assignClassroomSubjectAction,
} from "@/app/actions/academic-admin.actions"
import type { ActionResult } from "@/lib/server/action-result"
import type {
  AcademicYearItem,
  SemesterItem,
  ClassroomItem,
  SubjectItem,
  ClassroomSubjectItem,
  TeacherOption,
} from "@/lib/server/academic-admin-read-models"

const GRADE_LEVELS = [
  { value: "p1", label: "ประถมศึกษาปีที่ 1 (ป.1)" },
  { value: "p2", label: "ประถมศึกษาปีที่ 2 (ป.2)" },
  { value: "p3", label: "ประถมศึกษาปีที่ 3 (ป.3)" },
  { value: "p4", label: "ประถมศึกษาปีที่ 4 (ป.4)" },
  { value: "p5", label: "ประถมศึกษาปีที่ 5 (ป.5)" },
  { value: "p6", label: "ประถมศึกษาปีที่ 6 (ป.6)" },
  { value: "m1", label: "มัธยมศึกษาปีที่ 1 (ม.1)" },
  { value: "m2", label: "มัธยมศึกษาปีที่ 2 (ม.2)" },
  { value: "m3", label: "มัธยมศึกษาปีที่ 3 (ม.3)" },
  { value: "m4", label: "มัธยมศึกษาปีที่ 4 (ม.4)" },
  { value: "m5", label: "มัธยมศึกษาปีที่ 5 (ม.5)" },
  { value: "m6", label: "มัธยมศึกษาปีที่ 6 (ม.6)" },
]

const LEARNING_AREAS = [
  "ภาษาไทย",
  "คณิตศาสตร์",
  "วิทยาศาสตร์และเทคโนโลยี",
  "สังคมศึกษา ศาสนา และวัฒนธรรม",
  "สุขศึกษาและพลศึกษา",
  "ศิลปะ",
  "การงานอาชีพ",
  "ภาษาต่างประเทศ",
  "กิจกรรมพัฒนาผู้เรียน",
]

const initialState: ActionResult<{ id: string }> = {
  ok: true,
  message: "",
}

// ----------------------------------------------------------------------
// Academic Year Modal / Form
// ----------------------------------------------------------------------
export function AcademicYearDialog({
  initialData,
  onClose,
}: {
  initialData?: AcademicYearItem | null
  onClose: () => void
}) {
  const [state, formAction, isPending] = useActionState(upsertAcademicYearAction, initialState)

  useEffect(() => {
    if (!state.ok && state.message) {
      toast.error(state.message)
    } else if (state.ok && state.message) {
      toast.success(state.message)
      onClose()
    }
  }, [state, onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true">
      <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-lg">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <h3 className="text-base font-semibold">
            {initialData ? "แก้ไขปีการศึกษา" : "เพิ่มปีการศึกษาใหม่"}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-muted-foreground hover:bg-muted"
            aria-label="ปิด"
          >
            <X className="size-5" />
          </button>
        </div>

        <form action={formAction} className="mt-5 space-y-4">
          {initialData?.id && <input type="hidden" name="id" value={initialData.id} />}

          <div>
            <label htmlFor="year" className="block text-sm font-medium">
              ปีการศึกษา (พ.ศ.) <span className="text-destructive">*</span>
            </label>
            <input
              id="year"
              name="year"
              type="number"
              required
              defaultValue={initialData?.year ?? new Date().getFullYear() + 543}
              placeholder="2569"
              className="mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium">
                วันเริ่มต้น <span className="text-destructive">*</span>
              </label>
              <input
                id="startDate"
                name="startDate"
                type="date"
                required
                defaultValue={initialData?.startDate ?? `${new Date().getFullYear()}-05-16`}
                className="mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label htmlFor="endDate" className="block text-sm font-medium">
                วันสิ้นสุด <span className="text-destructive">*</span>
              </label>
              <input
                id="endDate"
                name="endDate"
                type="date"
                required
                defaultValue={initialData?.endDate ?? `${new Date().getFullYear() + 1}-04-30`}
                className="mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              id="isCurrent"
              name="isCurrent"
              type="checkbox"
              defaultChecked={initialData?.isCurrent ?? false}
              className="size-4 rounded border-input text-primary focus:ring-ring"
            />
            <label htmlFor="isCurrent" className="text-sm font-medium">
              ตั้งเป็นปีการศึกษาปัจจุบัน
            </label>
          </div>

          {!state.ok && state.message && (
            <p className="text-sm text-destructive">{state.message}</p>
          )}

          <div className="flex justify-end gap-2 border-t border-border pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="rounded-lg border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-muted"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {isPending && <Loader2 className="size-4 animate-spin" />}
              {initialData ? "บันทึกการแก้ไข" : "สร้างปีการศึกษา"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ----------------------------------------------------------------------
// Semester Modal / Form
// ----------------------------------------------------------------------
export function SemesterDialog({
  academicYears,
  initialData,
  defaultYearId,
  onClose,
}: {
  academicYears: AcademicYearItem[]
  initialData?: SemesterItem | null
  defaultYearId?: string
  onClose: () => void
}) {
  const [state, formAction, isPending] = useActionState(upsertSemesterAction, initialState)

  useEffect(() => {
    if (!state.ok && state.message) {
      toast.error(state.message)
    } else if (state.ok && state.message) {
      toast.success(state.message)
      onClose()
    }
  }, [state, onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true">
      <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-lg">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <h3 className="text-base font-semibold">
            {initialData ? "แก้ไขภาคเรียน" : "เพิ่มภาคเรียนใหม่"}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-muted-foreground hover:bg-muted"
            aria-label="ปิด"
          >
            <X className="size-5" />
          </button>
        </div>

        <form action={formAction} className="mt-5 space-y-4">
          {initialData?.id && <input type="hidden" name="id" value={initialData.id} />}

          <div>
            <label htmlFor="academicYearId" className="block text-sm font-medium">
              ปีการศึกษา <span className="text-destructive">*</span>
            </label>
            <select
              id="academicYearId"
              name="academicYearId"
              required
              defaultValue={initialData?.academicYearId ?? defaultYearId ?? academicYears[0]?.id}
              className="mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {academicYears.map((y) => (
                <option key={y.id} value={y.id}>
                  ปีการศึกษา {y.year} {y.isCurrent ? "(ปัจจุบัน)" : ""}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="semester" className="block text-sm font-medium">
              ภาคเรียน <span className="text-destructive">*</span>
            </label>
            <select
              id="semester"
              name="semester"
              required
              defaultValue={initialData?.semester ?? "semester_1"}
              className="mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="semester_1">ภาคเรียนที่ 1</option>
              <option value="semester_2">ภาคเรียนที่ 2</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="semStartDate" className="block text-sm font-medium">
                วันเริ่มต้น <span className="text-destructive">*</span>
              </label>
              <input
                id="semStartDate"
                name="startDate"
                type="date"
                required
                defaultValue={initialData?.startDate ?? `${new Date().getFullYear()}-05-16`}
                className="mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label htmlFor="semEndDate" className="block text-sm font-medium">
                วันสิ้นสุด <span className="text-destructive">*</span>
              </label>
              <input
                id="semEndDate"
                name="endDate"
                type="date"
                required
                defaultValue={initialData?.endDate ?? `${new Date().getFullYear()}-10-15`}
                className="mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              id="isSemCurrent"
              name="isCurrent"
              type="checkbox"
              defaultChecked={initialData?.isCurrent ?? false}
              className="size-4 rounded border-input text-primary focus:ring-ring"
            />
            <label htmlFor="isSemCurrent" className="text-sm font-medium">
              ตั้งเป็นภาคเรียนปัจจุบัน (ระบบจะปรับภาคเรียนอื่นเป็นไม่ใช่โดยอัตโนมัติ)
            </label>
          </div>

          {!state.ok && state.message && (
            <p className="text-sm text-destructive">{state.message}</p>
          )}

          <div className="flex justify-end gap-2 border-t border-border pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="rounded-lg border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-muted"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {isPending && <Loader2 className="size-4 animate-spin" />}
              {initialData ? "บันทึกการแก้ไข" : "สร้างภาคเรียน"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ----------------------------------------------------------------------
// Classroom Modal / Form
// ----------------------------------------------------------------------
export function ClassroomDialog({
  academicYears,
  teachers,
  initialData,
  onClose,
}: {
  academicYears: AcademicYearItem[]
  teachers: TeacherOption[]
  initialData?: ClassroomItem | null
  onClose: () => void
}) {
  const [state, formAction, isPending] = useActionState(upsertClassroomAction, initialState)

  useEffect(() => {
    if (!state.ok && state.message) {
      toast.error(state.message)
    } else if (state.ok && state.message) {
      toast.success(state.message)
      onClose()
    }
  }, [state, onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true">
      <div className="w-full max-w-lg rounded-xl border border-border bg-card p-6 shadow-lg">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <h3 className="text-base font-semibold">
            {initialData ? "แก้ไขห้องเรียน" : "เพิ่มห้องเรียนใหม่"}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-muted-foreground hover:bg-muted"
            aria-label="ปิด"
          >
            <X className="size-5" />
          </button>
        </div>

        <form action={formAction} className="mt-5 space-y-4">
          {initialData?.id && <input type="hidden" name="id" value={initialData.id} />}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="crYear" className="block text-sm font-medium">
                ปีการศึกษา <span className="text-destructive">*</span>
              </label>
              <select
                id="crYear"
                name="academicYearId"
                required
                defaultValue={initialData?.academicYearId ?? academicYears.find((y) => y.isCurrent)?.id ?? academicYears[0]?.id}
                className="mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {academicYears.map((y) => (
                  <option key={y.id} value={y.id}>
                    {y.year} {y.isCurrent ? "(ปัจจุบัน)" : ""}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="gradeLevel" className="block text-sm font-medium">
                ระดับชั้น <span className="text-destructive">*</span>
              </label>
              <select
                id="gradeLevel"
                name="gradeLevel"
                required
                defaultValue={initialData?.gradeLevel ?? "p1"}
                className="mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {GRADE_LEVELS.map((g) => (
                  <option key={g.value} value={g.value}>
                    {g.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="name" className="block text-sm font-medium">
                ชื่อห้องเรียน <span className="text-destructive">*</span>
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                defaultValue={initialData?.name ?? "ป.1/1"}
                placeholder="ป.1/1"
                className="mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label htmlFor="section" className="block text-sm font-medium">
                ห้อง / ลำดับห้อง <span className="text-destructive">*</span>
              </label>
              <input
                id="section"
                name="section"
                type="number"
                min="1"
                required
                defaultValue={initialData?.section ?? 1}
                className="mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="roomNumber" className="block text-sm font-medium">
                เลขห้องเรียน (ถ้ามี)
              </label>
              <input
                id="roomNumber"
                name="roomNumber"
                type="text"
                defaultValue={initialData?.roomNumber ?? ""}
                placeholder="อาคาร 1 ห้อง 101"
                className="mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label htmlFor="maxStudents" className="block text-sm font-medium">
                จำนวนนักเรียนสูงสุด
              </label>
              <input
                id="maxStudents"
                name="maxStudents"
                type="number"
                min="1"
                max="100"
                defaultValue={initialData?.maxStudents ?? 40}
                className="mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="homeroomTeacherId" className="block text-sm font-medium">
                ครูประจำชั้น
              </label>
              <select
                id="homeroomTeacherId"
                name="homeroomTeacherId"
                defaultValue={initialData?.homeroomTeacherId ?? ""}
                className="mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">-- ไม่ระบุ --</option>
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.fullName}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="coTeacherId" className="block text-sm font-medium">
                ครูประจำชั้นร่วม
              </label>
              <select
                id="coTeacherId"
                name="coTeacherId"
                defaultValue={initialData?.coTeacherId ?? ""}
                className="mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">-- ไม่ระบุ --</option>
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.fullName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {!state.ok && state.message && (
            <p className="text-sm text-destructive">{state.message}</p>
          )}

          <div className="flex justify-end gap-2 border-t border-border pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="rounded-lg border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-muted"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {isPending && <Loader2 className="size-4 animate-spin" />}
              {initialData ? "บันทึกการแก้ไข" : "สร้างห้องเรียน"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ----------------------------------------------------------------------
// Subject Modal / Form
// ----------------------------------------------------------------------
export function SubjectDialog({
  initialData,
  onClose,
}: {
  initialData?: SubjectItem | null
  onClose: () => void
}) {
  const [state, formAction, isPending] = useActionState(upsertSubjectAction, initialState)

  useEffect(() => {
    if (!state.ok && state.message) {
      toast.error(state.message)
    } else if (state.ok && state.message) {
      toast.success(state.message)
      onClose()
    }
  }, [state, onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true">
      <div className="w-full max-w-lg rounded-xl border border-border bg-card p-6 shadow-lg">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <h3 className="text-base font-semibold">
            {initialData ? "แก้ไขรายวิชา" : "เพิ่มรายวิชาใหม่"}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-muted-foreground hover:bg-muted"
            aria-label="ปิด"
          >
            <X className="size-5" />
          </button>
        </div>

        <form action={formAction} className="mt-5 space-y-4">
          {initialData?.id && <input type="hidden" name="id" value={initialData.id} />}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="subjectCode" className="block text-sm font-medium">
                รหัสวิชา <span className="text-destructive">*</span>
              </label>
              <input
                id="subjectCode"
                name="subjectCode"
                type="text"
                required
                defaultValue={initialData?.subjectCode ?? ""}
                placeholder="ท11101"
                className="mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label htmlFor="subName" className="block text-sm font-medium">
                ชื่อวิชา (ภาษาไทย) <span className="text-destructive">*</span>
              </label>
              <input
                id="subName"
                name="name"
                type="text"
                required
                defaultValue={initialData?.name ?? ""}
                placeholder="ภาษาไทย 1"
                className="mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="nameEn" className="block text-sm font-medium">
                ชื่อวิชา (ภาษาอังกฤษ)
              </label>
              <input
                id="nameEn"
                name="nameEn"
                type="text"
                defaultValue={initialData?.nameEn ?? ""}
                placeholder="Thai Language 1"
                className="mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label htmlFor="learningArea" className="block text-sm font-medium">
                กลุ่มสาระการเรียนรู้
              </label>
              <select
                id="learningArea"
                name="learningArea"
                defaultValue={initialData?.learningArea ?? LEARNING_AREAS[0]}
                className="mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {LEARNING_AREAS.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label htmlFor="subGrade" className="block text-sm font-medium">
                ระดับชั้น
              </label>
              <select
                id="subGrade"
                name="gradeLevel"
                defaultValue={initialData?.gradeLevel ?? ""}
                className="mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">ทุกระดับชั้น</option>
                {GRADE_LEVELS.map((g) => (
                  <option key={g.value} value={g.value}>
                    {g.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="credit" className="block text-sm font-medium">
                หน่วยกิต
              </label>
              <input
                id="credit"
                name="credit"
                type="number"
                step="0.5"
                min="0.5"
                max="10"
                defaultValue={initialData?.credit ?? 1.0}
                className="mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label htmlFor="hoursPerWeek" className="block text-sm font-medium">
                ชั่วโมง/สัปดาห์
              </label>
              <input
                id="hoursPerWeek"
                name="hoursPerWeek"
                type="number"
                min="1"
                max="20"
                defaultValue={initialData?.hoursPerWeek ?? 1}
                className="mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium">
              คำอธิบายรายวิชา
            </label>
            <textarea
              id="description"
              name="description"
              rows={2}
              defaultValue={initialData?.description ?? ""}
              placeholder="คำอธิบายรายวิชาและจุดประสงค์การเรียนรู้..."
              className="mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {!state.ok && state.message && (
            <p className="text-sm text-destructive">{state.message}</p>
          )}

          <div className="flex justify-end gap-2 border-t border-border pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="rounded-lg border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-muted"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {isPending && <Loader2 className="size-4 animate-spin" />}
              {initialData ? "บันทึกการแก้ไข" : "สร้างรายวิชา"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ----------------------------------------------------------------------
// Assignment Modal / Form
// ----------------------------------------------------------------------
export function AssignmentDialog({
  classrooms,
  subjects,
  teachers,
  semesters,
  initialData,
  onClose,
}: {
  classrooms: ClassroomItem[]
  subjects: SubjectItem[]
  teachers: TeacherOption[]
  semesters: SemesterItem[]
  initialData?: ClassroomSubjectItem | null
  onClose: () => void
}) {
  const [state, formAction, isPending] = useActionState(assignClassroomSubjectAction, initialState)

  useEffect(() => {
    if (!state.ok && state.message) {
      toast.error(state.message)
    } else if (state.ok && state.message) {
      toast.success(state.message)
      onClose()
    }
  }, [state, onClose])

  const currentSem = semesters.find((s) => s.isCurrent) || semesters[0]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true">
      <div className="w-full max-w-lg rounded-xl border border-border bg-card p-6 shadow-lg">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <h3 className="text-base font-semibold">
            {initialData ? "แก้ไขการมอบหมายวิชา" : "มอบหมายวิชาและครูผู้สอน"}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-muted-foreground hover:bg-muted"
            aria-label="ปิด"
          >
            <X className="size-5" />
          </button>
        </div>

        <form action={formAction} className="mt-5 space-y-4">
          {initialData?.id && <input type="hidden" name="id" value={initialData.id} />}

          <div>
            <label htmlFor="assignSem" className="block text-sm font-medium">
              ภาคเรียน <span className="text-destructive">*</span>
            </label>
            <select
              id="assignSem"
              name="semesterId"
              required
              defaultValue={initialData?.semesterId ?? currentSem?.id}
              className="mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {semesters.map((s) => (
                <option key={s.id} value={s.id}>
                  ภาคเรียนที่ {s.semester === "semester_1" ? "1" : "2"}/{s.academicYear} {s.isCurrent ? "(ปัจจุบัน)" : ""}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="assignClass" className="block text-sm font-medium">
                ห้องเรียน <span className="text-destructive">*</span>
              </label>
              <select
                id="assignClass"
                name="classroomId"
                required
                defaultValue={initialData?.classroomId ?? classrooms[0]?.id}
                className="mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {classrooms.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} (ปี {c.academicYear})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="assignSubject" className="block text-sm font-medium">
                รายวิชา <span className="text-destructive">*</span>
              </label>
              <select
                id="assignSubject"
                name="subjectId"
                required
                defaultValue={initialData?.subjectId ?? subjects[0]?.id}
                className="mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.subjectCode} - {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="assignTeacher" className="block text-sm font-medium">
              ครูผู้สอน <span className="text-destructive">*</span>
            </label>
            <select
              id="assignTeacher"
              name="teacherId"
              required
              defaultValue={initialData?.teacherId ?? teachers[0]?.id}
              className="mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.fullName} ({t.role})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-3 gap-3 border-t border-border pt-3">
            <div>
              <label htmlFor="classworkMax" className="block text-xs font-medium text-muted-foreground">
                คะแนนเก็บ (เต็ม)
              </label>
              <input
                id="classworkMax"
                name="classworkMaxScore"
                type="number"
                min="0"
                max="100"
                defaultValue={initialData?.classworkMaxScore ?? 60}
                className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label htmlFor="midtermMax" className="block text-xs font-medium text-muted-foreground">
                คะแนนกลางภาค
              </label>
              <input
                id="midtermMax"
                name="midtermMaxScore"
                type="number"
                min="0"
                max="100"
                defaultValue={initialData?.midtermMaxScore ?? 20}
                className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label htmlFor="finalMax" className="block text-xs font-medium text-muted-foreground">
                คะแนนปลายภาค
              </label>
              <input
                id="finalMax"
                name="finalMaxScore"
                type="number"
                min="0"
                max="100"
                defaultValue={initialData?.finalMaxScore ?? 20}
                className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          {!state.ok && state.message && (
            <p className="text-sm text-destructive">{state.message}</p>
          )}

          <div className="flex justify-end gap-2 border-t border-border pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="rounded-lg border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-muted"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {isPending && <Loader2 className="size-4 animate-spin" />}
              {initialData ? "บันทึกการแก้ไข" : "มอบหมายวิชา"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
