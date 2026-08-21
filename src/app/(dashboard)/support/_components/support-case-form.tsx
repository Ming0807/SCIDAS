"use client"

import { useActionState, useEffect } from "react"
import { ArrowLeft, LoaderCircle, Save, Send } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

import {
  createSupportRecord,
  updateSupportRecord,
  type SupportActionData,
  type SupportCase,
  type SupportType,
} from "@/app/actions/support.actions"
import { ActionFeedback } from "@/components/forms"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import type { ActionResult } from "@/lib/server/action-result"

type SupportStudentOption = {
  id: string
  first_name: string
  last_name: string
  student_code: string | null
}

type SupportCaseFormProps = {
  students: SupportStudentOption[]
  initialCase?: SupportCase
}

const supportTypeOptions: Array<{ value: SupportType; label: string }> = [
  { value: "academic", label: "ด้านวิชาการ" },
  { value: "behavioral", label: "ด้านพฤติกรรม" },
  { value: "emotional", label: "ด้านจิตใจ/อารมณ์" },
  { value: "financial", label: "ด้านเศรษฐกิจ" },
  { value: "health", label: "ด้านสุขภาพ" },
  { value: "family", label: "ด้านครอบครัว" },
  { value: "social", label: "ด้านสังคม" },
  { value: "other", label: "อื่น ๆ" },
]

const priorityOptions = [
  { value: "low", label: "ต่ำ - เฝ้าระวัง" },
  { value: "medium", label: "ปานกลาง - ต้องดำเนินการ" },
  { value: "high", label: "สูง - ต้องการความช่วยเหลือด่วน" },
  { value: "critical", label: "วิกฤต - ต้องดำเนินการทันที" },
] as const

function FieldError({
  result,
  field,
}: {
  result: ActionResult<SupportActionData> | null
  field: string
}) {
  if (!result || result.ok || !result.fieldErrors?.[field]) return null

  return (
    <p className="text-sm text-destructive" role="alert">
      {result.fieldErrors[field].join(" ")}
    </p>
  )
}

export function SupportCaseForm({ students, initialCase }: SupportCaseFormProps) {
  const router = useRouter()
  const action = initialCase ? updateSupportRecord : createSupportRecord
  const [result, formAction, pending] = useActionState<ActionResult<SupportActionData> | null, FormData>(
    action,
    null,
  )

  useEffect(() => {
    if (!result?.ok) return
    const id = result.data?.id ?? initialCase?.id
    if (id) router.push(`/support/${id}`)
  }, [initialCase?.id, result, router])

  const isEdit = Boolean(initialCase)

  return (
    <form action={formAction} className="space-y-4">
      {initialCase ? <input type="hidden" name="id" value={initialCase.id} /> : null}
      {initialCase ? <input type="hidden" name="semester_id" value={initialCase.semester_id} /> : null}

      <Card>
        <CardHeader>
          <CardTitle>{isEdit ? "แก้ไขข้อมูลเคส" : "ข้อมูลเคส"}</CardTitle>
          <CardDescription>
            {isEdit ? "ปรับรายละเอียดให้เป็นข้อมูลล่าสุดของเคส" : "ระบุรายละเอียดของนักเรียนและความช่วยเหลือที่ต้องการ"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <label htmlFor="support-student" className="text-sm font-medium text-foreground">
              นักเรียน
            </label>
            <Select name="student_id" defaultValue={initialCase?.student_id} required>
              <SelectTrigger id="support-student" className="w-full">
                <SelectValue placeholder="ค้นหาและเลือกนักเรียน..." />
              </SelectTrigger>
              <SelectContent>
                {students.map((student) => (
                  <SelectItem key={student.id} value={student.id}>
                    {student.first_name} {student.last_name} ({student.student_code ?? "ไม่มีรหัส"})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldError result={result} field="student_id" />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="support-type" className="text-sm font-medium text-foreground">
                หมวดหมู่ความช่วยเหลือ
              </label>
              <Select name="support_type" defaultValue={initialCase?.support_type} required>
                <SelectTrigger id="support-type" className="w-full">
                  <SelectValue placeholder="เลือกหมวดหมู่..." />
                </SelectTrigger>
                <SelectContent>
                  {supportTypeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError result={result} field="support_type" />
            </div>

            <div className="space-y-2">
              <label htmlFor="support-priority" className="text-sm font-medium text-foreground">
                ระดับความเร่งด่วน
              </label>
              <Select name="priority" defaultValue={initialCase?.priority ?? "medium"} required>
                <SelectTrigger id="support-priority" className="w-full">
                  <SelectValue placeholder="เลือกระดับความเร่งด่วน..." />
                </SelectTrigger>
                <SelectContent>
                  {priorityOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError result={result} field="priority" />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="support-title" className="text-sm font-medium text-foreground">
              หัวข้อ / สรุปเคสโดยย่อ
            </label>
            <Input
              id="support-title"
              name="title"
              defaultValue={initialCase?.title}
              placeholder="เช่น มีปัญหาในการเรียนคณิตศาสตร์ขั้นสูง"
              required
            />
            <FieldError result={result} field="title" />
          </div>

          <div className="space-y-2">
            <label htmlFor="support-description" className="text-sm font-medium text-foreground">
              รายละเอียดเพิ่มเติม
            </label>
            <Textarea
              id="support-description"
              name="description"
              defaultValue={initialCase?.description}
              placeholder="ให้ข้อมูลพื้นฐาน สาเหตุ สิ่งที่เคยลองแก้ไขมาแล้ว และบริบทอื่น ๆ ที่เกี่ยวข้อง..."
              className="min-h-36 resize-y"
              required
            />
            <FieldError result={result} field="description" />
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <div className="space-y-2">
              <label htmlFor="support-action-plan" className="text-sm font-medium text-foreground">
                แผนดำเนินการ
              </label>
              <Textarea
                id="support-action-plan"
                name="action_plan"
                defaultValue={initialCase?.action_plan ?? ""}
                placeholder="แนวทางช่วยเหลือและสิ่งที่ต้องติดตาม"
                className="min-h-28 resize-y"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="support-provided" className="text-sm font-medium text-foreground">
                การช่วยเหลือที่ดำเนินการแล้ว
              </label>
              <Textarea
                id="support-provided"
                name="provided_support"
                defaultValue={initialCase?.provided_support ?? ""}
                placeholder="บันทึกสิ่งที่ทีมได้ดำเนินการ"
                className="min-h-28 resize-y"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="support-referral" className="text-sm font-medium text-foreground">
                การส่งต่อภายนอก
              </label>
              <Textarea
                id="support-referral"
                name="external_referral"
                defaultValue={initialCase?.external_referral ?? ""}
                placeholder="หน่วยงานหรือข้อมูลการส่งต่อ ถ้ามี"
                className="min-h-28 resize-y"
              />
            </div>
          </div>

          <ActionFeedback result={result} />
        </CardContent>
        <CardFooter className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
          <Button nativeButton={false} variant="ghost" render={<Link href={isEdit ? `/support/${initialCase?.id}` : "/support"} />}>
            <ArrowLeft aria-hidden="true" />
            ยกเลิก
          </Button>
          <Button type="submit" disabled={pending || students.length === 0}>
            {pending ? <LoaderCircle aria-hidden="true" className="animate-spin motion-reduce:animate-none" /> : isEdit ? <Save aria-hidden="true" /> : <Send aria-hidden="true" />}
            {pending ? "กำลังบันทึก..." : isEdit ? "บันทึกการแก้ไข" : "เปิดเคส"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}
