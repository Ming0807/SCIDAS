"use client"

import { useActionState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, LoaderCircle, Save } from "lucide-react"

import {
  createDevelopmentPlanAction,
  updateDevelopmentPlanAction,
  type DevelopmentPlan,
} from "@/app/actions/idp.actions"
import { ActionFeedback } from "@/components/forms"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import type { ActionResult } from "@/lib/server/action-result"

export type PlanStudentOption = {
  id: string
  student_code: string
  prefix: string | null
  first_name: string
  last_name: string
  status: string
}

export type PlanSemesterOption = {
  id: string
  semester: string
  start_date: string
  end_date: string
  academic_year_label: string
  is_current: boolean
}

type PlanFormProps =
  | { mode: "create"; students: PlanStudentOption[]; semesters: PlanSemesterOption[] }
  | { mode: "edit"; plan: DevelopmentPlan }

function FieldError({ message }: { message?: string }) {
  return message ? (
    <p className="text-xs text-destructive" role="alert">
      {message}
    </p>
  ) : null
}

function formatStudent(student: PlanStudentOption) {
  return `${student.prefix ? `${student.prefix} ` : ""}${student.first_name} ${student.last_name} · ${student.student_code}`
}

function formatSemester(semester: PlanSemesterOption) {
  const number = semester.semester === "semester_1" ? "ภาคเรียนที่ 1" : "ภาคเรียนที่ 2"
  return `${number} · ${semester.academic_year_label}`
}

export function PlanForm(props: PlanFormProps) {
  const router = useRouter()
  const editPlan = props.mode === "edit" ? props.plan : null
  const isEdit = editPlan !== null
  const action = isEdit ? updateDevelopmentPlanAction : createDevelopmentPlanAction
  const [state, formAction, pending] = useActionState<ActionResult<{ id: string }> | null, FormData>(action, null)
  const fieldErrors = state?.ok === false ? state.fieldErrors : undefined

  useEffect(() => {
    if (state?.ok && state.redirectTo) router.replace(state.redirectTo)
  }, [router, state])

  const initialFocusAreas = editPlan?.focus_areas?.join(", ") ?? ""

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <div className="flex items-start gap-3">
        <Button nativeButton={false} variant="ghost" size="icon" aria-label="ย้อนกลับ" render={<Link href={editPlan ? `/development-plans/${editPlan.id}` : "/development-plans"} />}>
          <ArrowLeft aria-hidden="true" className="size-4" />
        </Button>
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold text-foreground">{isEdit ? "แก้ไขแผนพัฒนา" : "สร้างแผนพัฒนารายบุคคล"}</h1>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            {isEdit ? "ปรับข้อมูลแผนและติดตามความก้าวหน้าให้ตรงกับสถานการณ์ล่าสุด" : "เริ่มต้นด้วยข้อมูลนักเรียน ภาคเรียน และช่วงเวลาที่ต้องการติดตาม"}
          </p>
        </div>
      </div>

      <form action={formAction} className="space-y-6">
        {isEdit ? <input type="hidden" name="id" value={editPlan.id} /> : null}
        <Card>
          <CardHeader>
            <CardTitle>ข้อมูลหลักของแผน</CardTitle>
            <CardDescription>ข้อมูลนักเรียนและภาคเรียนใช้กำหนดขอบเขตของแผนนี้</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <label htmlFor="title" className="text-sm font-medium">ชื่อแผน <span className="text-destructive">*</span></label>
              <Input id="title" name="title" required defaultValue={editPlan?.title ?? ""} placeholder="เช่น แผนพัฒนาทักษะการอ่านจับใจความ" aria-invalid={fieldErrors?.title ? true : undefined} />
              <FieldError message={fieldErrors?.title?.[0]} />
            </div>

            {isEdit ? (
              <>
                <div className="space-y-1 sm:col-span-2">
                  <p className="text-sm font-medium">นักเรียน</p>
                  <p className="rounded-md border bg-muted/30 px-3 py-2 text-sm text-muted-foreground">ไม่สามารถเปลี่ยนนักเรียนของแผนเดิมได้</p>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-2 sm:col-span-2">
                  <label htmlFor="student_id" className="text-sm font-medium">นักเรียน <span className="text-destructive">*</span></label>
                  <select id="student_id" name="student_id" required defaultValue="" className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" aria-invalid={fieldErrors?.student_id ? true : undefined}>
                    <option value="" disabled>เลือกนักเรียน</option>
                    {(props.mode === "create" ? props.students : []).map((student) => <option key={student.id} value={student.id}>{formatStudent(student)}</option>)}
                  </select>
                  {props.mode === "create" && props.students.length === 0 ? <p className="text-xs text-muted-foreground">ยังไม่มีนักเรียนที่พร้อมสร้างแผน</p> : null}
                  <FieldError message={fieldErrors?.student_id?.[0]} />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <label htmlFor="semester_id" className="text-sm font-medium">ภาคเรียน <span className="text-destructive">*</span></label>
                  <select id="semester_id" name="semester_id" required defaultValue="" className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" aria-invalid={fieldErrors?.semester_id ? true : undefined}>
                    <option value="" disabled>เลือกภาคเรียน</option>
                    {(props.mode === "create" ? props.semesters : []).map((semester) => <option key={semester.id} value={semester.id}>{formatSemester(semester)}{semester.is_current ? " · ปัจจุบัน" : ""}</option>)}
                  </select>
                  {props.mode === "create" && props.semesters.length === 0 ? <p className="text-xs text-muted-foreground">ยังไม่มีข้อมูลภาคเรียนในโรงเรียน</p> : null}
                  <FieldError message={fieldErrors?.semester_id?.[0]} />
                </div>
              </>
            )}

            <div className="space-y-2">
              <label htmlFor="start_date" className="text-sm font-medium">วันเริ่มต้น <span className="text-destructive">*</span></label>
              <Input id="start_date" name="start_date" type="date" required defaultValue={editPlan?.start_date ?? ""} aria-invalid={fieldErrors?.start_date ? true : undefined} />
              <FieldError message={fieldErrors?.start_date?.[0]} />
            </div>
            <div className="space-y-2">
              <label htmlFor="end_date" className="text-sm font-medium">วันสิ้นสุด <span className="text-destructive">*</span></label>
              <Input id="end_date" name="end_date" type="date" required defaultValue={editPlan?.end_date ?? ""} aria-invalid={fieldErrors?.end_date ? true : undefined} />
              <FieldError message={fieldErrors?.end_date?.[0]} />
            </div>
            {isEdit ? (
              <div className="space-y-2 sm:col-span-2">
                <label htmlFor="overall_progress" className="text-sm font-medium">ความก้าวหน้าโดยรวม (%)</label>
                <Input id="overall_progress" name="overall_progress" type="number" min="0" max="100" step="1" defaultValue={editPlan?.overall_progress ?? 0} />
              </div>
            ) : null}
            <div className="space-y-2 sm:col-span-2">
              <label htmlFor="focus_areas" className="text-sm font-medium">ประเด็นที่เน้น</label>
              <Input id="focus_areas" name="focus_areas" defaultValue={initialFocusAreas} placeholder="คั่นแต่ละประเด็นด้วยเครื่องหมายจุลภาค" />
              <p className="text-xs text-muted-foreground">เช่น การอ่าน, การสื่อสาร, การจัดการอารมณ์</p>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <label htmlFor="description" className="text-sm font-medium">รายละเอียด</label>
              <Textarea id="description" name="description" rows={4} defaultValue={editPlan?.description ?? ""} placeholder="อธิบายปัญหา เป้าหมายภาพรวม หรือบริบทที่ควรรู้" />
            </div>
          </CardContent>
        </Card>

        <ActionFeedback result={state} />
        <div className="flex flex-col-reverse gap-3 border-t border-border pt-4 sm:flex-row sm:justify-end">
          <Button nativeButton={false} variant="ghost" className="w-full sm:w-auto" render={<Link href={editPlan ? `/development-plans/${editPlan.id}` : "/development-plans"} />}>ยกเลิก</Button>
          <Button type="submit" disabled={pending} className="gap-2">
            {pending ? <LoaderCircle aria-hidden="true" className="size-4 animate-spin motion-reduce:animate-none" /> : <Save aria-hidden="true" className="size-4" />}
            {pending ? "กำลังบันทึก..." : isEdit ? "บันทึกการแก้ไข" : "สร้างแผน"}
          </Button>
        </div>
      </form>
    </div>
  )
}
