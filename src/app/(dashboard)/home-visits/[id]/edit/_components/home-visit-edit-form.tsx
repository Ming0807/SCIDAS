"use client"

import { useActionState, useEffect, type ReactNode } from "react"
import { Loader2, Save } from "lucide-react"
import { useRouter } from "next/navigation"

import { updateHomeVisitAction } from "@/app/actions/home-visit.actions"
import { ActionFeedback } from "@/components/forms/action-feedback"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import type { ActionResult } from "@/lib/server/action-result"
import type { HomeVisitRecord } from "@/lib/server/home-visit-read-models"

type StudentOption = {
  id: string
  name: string
  classroom?: string
  code: string
}

type HomeVisitEditFormProps = {
  record: HomeVisitRecord
  studentOptions: StudentOption[]
}

export function HomeVisitEditForm({ record, studentOptions }: HomeVisitEditFormProps) {
  const router = useRouter()
  const [state, formAction, pending] = useActionState<
    ActionResult<{ id: string }> | null,
    FormData
  >(updateHomeVisitAction, null)

  useEffect(() => {
    if (state?.ok && state.redirectTo) router.push(state.redirectTo)
  }, [router, state])

  const fieldErrors = state?.ok === false ? state.fieldErrors : undefined

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="record_id" value={record.id} />

      <Card>
        <CardHeader>
          <CardTitle>รายละเอียดการเยี่ยมบ้าน</CardTitle>
          <CardDescription>
            แก้ไขเฉพาะข้อมูลการเยี่ยมบ้าน ระบบจะคงโรงเรียน ผู้บันทึก และภาคเรียนเดิมไว้
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <label htmlFor="studentId" className="text-sm font-medium">
                นักเรียน
              </label>
              <select
                id="studentId"
                name="studentId"
                required
                defaultValue={record.studentId}
                aria-invalid={!!fieldErrors?.studentId}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-3 focus:ring-ring/50"
              >
                <option value="">เลือกนักเรียน...</option>
                {studentOptions.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.name}
                    {student.classroom ? ` (${student.classroom})` : ""}
                    {student.code ? ` — ${student.code}` : ""}
                  </option>
                ))}
              </select>
              <FieldError message={fieldErrors?.studentId?.[0]} />
            </div>

            <Field id="visitDate" label="วันที่เยี่ยม" error={fieldErrors?.visitDate?.[0]}>
              <Input
                id="visitDate"
                name="visitDate"
                type="date"
                required
                defaultValue={record.visitDate}
                aria-invalid={!!fieldErrors?.visitDate}
              />
            </Field>
            <Field id="visitTime" label="เวลา" error={fieldErrors?.visitTime?.[0]}>
              <Input
                id="visitTime"
                name="visitTime"
                type="time"
                defaultValue={record.visitTime?.slice(0, 5) ?? ""}
                aria-invalid={!!fieldErrors?.visitTime}
              />
            </Field>
          </div>

          <Field id="addressVisited" label="ที่อยู่ที่เยี่ยม" error={fieldErrors?.addressVisited?.[0]}>
            <Input
              id="addressVisited"
              name="addressVisited"
              defaultValue={record.address ?? ""}
              maxLength={2000}
              placeholder="ที่อยู่ที่ไปเยี่ยม..."
              aria-invalid={!!fieldErrors?.addressVisited}
            />
          </Field>

          <div className="space-y-2">
            <label htmlFor="housingCondition" className="text-sm font-medium">
              สภาพบ้าน
            </label>
            <select
              id="housingCondition"
              name="housingCondition"
              defaultValue={record.housingCondition ?? ""}
              aria-invalid={!!fieldErrors?.housingCondition}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-3 focus:ring-ring/50"
            >
              <option value="">ไม่ระบุ</option>
              <option value="good">ดี</option>
              <option value="moderate">พอใช้</option>
              <option value="poor">ควรดูแล</option>
              <option value="critical">เร่งดูแล</option>
            </select>
            <FieldError message={fieldErrors?.housingCondition?.[0]} />
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <Checkbox name="followUpNeeded" checked={record.followUpNeeded}>
              ต้องติดตามต่อเนื่อง
            </Checkbox>
            <Checkbox name="hasFamilyProblem" checked={record.hasFamilyProblem}>
              มีปัญหาครอบครัว
            </Checkbox>
            <Checkbox name="travelDifficulty" checked={record.travelDifficulty}>
              เดินทางลำบาก
            </Checkbox>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <Field id="overallAssessment" label="ผลประเมินโดยรวม" error={fieldErrors?.overallAssessment?.[0]}>
              <Textarea
                id="overallAssessment"
                name="overallAssessment"
                defaultValue={record.overallAssessment ?? ""}
                maxLength={5000}
                className="min-h-28 resize-y"
                aria-invalid={!!fieldErrors?.overallAssessment}
              />
            </Field>
            <Field id="familyProblemDetail" label="รายละเอียดปัญหาครอบครัว" error={fieldErrors?.familyProblemDetail?.[0]}>
              <Textarea
                id="familyProblemDetail"
                name="familyProblemDetail"
                defaultValue={record.familyProblemDetail ?? ""}
                maxLength={5000}
                className="min-h-28 resize-y"
                aria-invalid={!!fieldErrors?.familyProblemDetail}
              />
            </Field>
            <Field id="suggestions" label="ข้อเสนอแนะ" error={fieldErrors?.suggestions?.[0]}>
              <Textarea
                id="suggestions"
                name="suggestions"
                defaultValue={record.suggestions ?? ""}
                maxLength={5000}
                className="min-h-28 resize-y"
                aria-invalid={!!fieldErrors?.suggestions}
              />
            </Field>
            <Field id="followUpDetail" label="รายละเอียดการติดตาม" error={fieldErrors?.followUpDetail?.[0]}>
              <Textarea
                id="followUpDetail"
                name="followUpDetail"
                defaultValue={record.followUpDetail ?? ""}
                maxLength={5000}
                className="min-h-28 resize-y"
                aria-invalid={!!fieldErrors?.followUpDetail}
              />
            </Field>
          </div>

          <ActionFeedback result={state} />
        </CardContent>
        <CardFooter className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button type="button" variant="ghost" onClick={() => router.push(`/home-visits/${record.id}`)}>
            ยกเลิก
          </Button>
          <Button type="submit" disabled={pending || studentOptions.length === 0} className="w-full gap-2 sm:w-auto">
            {pending ? <Loader2 className="animate-spin" /> : <Save />}
            {pending ? "กำลังบันทึก..." : "บันทึกการแก้ไข"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}

function Field({
  id,
  label,
  error,
  children,
}: {
  id: string
  label: string
  error?: string
  children: ReactNode
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-sm font-medium">{label}</label>
      {children}
      <FieldError message={error} />
    </div>
  )
}

function Checkbox({
  name,
  checked,
  children,
}: {
  name: string
  checked: boolean
  children: ReactNode
}) {
  return (
    <label className="flex items-center gap-2 text-sm text-foreground">
      <input
        type="checkbox"
        name={name}
        defaultChecked={checked}
        className="size-4 rounded border-input text-primary focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      />
      {children}
    </label>
  )
}

function FieldError({ message }: { message?: string }) {
  return message ? <p className="text-xs text-destructive">{message}</p> : null
}
