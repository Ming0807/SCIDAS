"use client"

import { useActionState, useEffect } from "react"
import { Loader2, Save } from "lucide-react"
import { useRouter } from "next/navigation"

import { updateBehaviorRecordAction } from "@/app/actions/behavior.actions"
import { ActionFeedback } from "@/components/forms/action-feedback"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import type { ActionResult } from "@/lib/server/action-result"
import type { BehaviorRecordItem } from "@/lib/server/behavior-read-models"

type StudentOption = {
  id: string
  student_code: string
  first_name: string
  last_name: string
}

type BehaviorEditFormProps = {
  record: BehaviorRecordItem
  students: StudentOption[]
}

export function BehaviorEditForm({ record, students }: BehaviorEditFormProps) {
  const router = useRouter()
  const [state, formAction, pending] = useActionState<
    ActionResult<{ id: string }> | null,
    FormData
  >(updateBehaviorRecordAction, null)

  useEffect(() => {
    if (state?.ok && state.redirectTo) router.push(state.redirectTo)
  }, [router, state])

  const fieldErrors = state?.ok === false ? state.fieldErrors : undefined

  return (
    <form action={formAction} className="w-full">
      <input type="hidden" name="record_id" value={record.id} />
      <Card>
        <CardHeader>
          <CardTitle>รายละเอียดพฤติกรรม</CardTitle>
          <CardDescription>
            แก้ไขเฉพาะข้อมูลเหตุการณ์ ไม่เปลี่ยนผู้บันทึกหรือโรงเรียนของรายการ
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="student_id" className="text-sm font-medium">
                นักเรียน
              </label>
              <Select name="student_id" required defaultValue={record.studentId}>
                <SelectTrigger id="student_id" className="w-full" aria-invalid={!!fieldErrors?.student_id}>
                  <SelectValue placeholder="เลือกนักเรียน..." />
                </SelectTrigger>
                <SelectContent>
                  {students.map((student) => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.first_name} {student.last_name} ({student.student_code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError message={fieldErrors?.student_id?.[0]} />
            </div>

            <div className="space-y-2">
              <label htmlFor="behavior_type" className="text-sm font-medium">
                ประเภทพฤติกรรม
              </label>
              <Select name="behavior_type" required defaultValue={record.behaviorType}>
                <SelectTrigger id="behavior_type" className="w-full" aria-invalid={!!fieldErrors?.behavior_type}>
                  <SelectValue placeholder="เลือกประเภท..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="positive">เชิงบวก (+)</SelectItem>
                  <SelectItem value="negative">เชิงลบ (-)</SelectItem>
                  <SelectItem value="neutral">ทั่วไป</SelectItem>
                </SelectContent>
              </Select>
              <FieldError message={fieldErrors?.behavior_type?.[0]} />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="category" className="text-sm font-medium">
              หมวดหมู่
            </label>
            <Input
              id="category"
              name="category"
              defaultValue={record.category ?? ""}
              maxLength={100}
              placeholder="เช่น ระเบียบวินัย หรือมีน้ำใจช่วยเหลือ"
              aria-invalid={!!fieldErrors?.category}
            />
            <FieldError message={fieldErrors?.category?.[0]} />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="date" className="text-sm font-medium">
                วันที่
              </label>
              <Input
                id="date"
                type="date"
                name="date"
                required
                defaultValue={record.date}
                aria-invalid={!!fieldErrors?.date}
              />
              <FieldError message={fieldErrors?.date?.[0]} />
            </div>
            <div className="space-y-2">
              <label htmlFor="points" className="text-sm font-medium">
                คะแนน (บวก/หัก)
              </label>
              <Input
                id="points"
                type="number"
                name="points"
                step="1"
                defaultValue={record.points}
                placeholder="เช่น 5 หรือ -2"
                aria-invalid={!!fieldErrors?.points}
              />
              <FieldError message={fieldErrors?.points?.[0]} />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">
              รายละเอียดเพิ่มเติม
            </label>
            <Textarea
              id="description"
              name="description"
              required
              defaultValue={record.description}
              placeholder="อธิบายเหตุการณ์ที่เกิดขึ้น..."
              className="min-h-28 resize-y"
              aria-invalid={!!fieldErrors?.description}
            />
            <FieldError message={fieldErrors?.description?.[0]} />
          </div>

          <ActionFeedback result={state} />
        </CardContent>
        <CardFooter className="flex flex-col-reverse gap-3 border-t border-border pt-5 sm:flex-row sm:justify-end">
          <Button type="button" variant="ghost" onClick={() => router.push(`/behavior/${record.id}`)}>
            ยกเลิก
          </Button>
          <Button type="submit" disabled={pending || students.length === 0} className="w-full gap-2 sm:w-auto">
            {pending ? <Loader2 className="animate-spin" /> : <Save />}
            {pending ? "กำลังบันทึก..." : "บันทึกการแก้ไข"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}

function FieldError({ message }: { message?: string }) {
  return message ? <p className="text-xs text-destructive">{message}</p> : null
}
