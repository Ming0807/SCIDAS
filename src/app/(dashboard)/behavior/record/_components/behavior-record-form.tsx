"use client"

import { useActionState, useEffect } from "react"
import { Loader2, Save } from "lucide-react"
import { useRouter } from "next/navigation"

import { createBehaviorRecordAction } from "@/app/actions/behavior.actions"
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

type StudentOption = {
  id: string
  student_code: string
  first_name: string
  last_name: string
}

type BehaviorRecordFormProps = {
  students: StudentOption[]
}

export function BehaviorRecordForm({ students }: BehaviorRecordFormProps) {
  const router = useRouter()
  const [state, formAction, pending] = useActionState<
    ActionResult<{ id: string }> | null,
    FormData
  >(createBehaviorRecordAction, null)

  useEffect(() => {
    if (state?.ok && state.redirectTo) router.push(state.redirectTo)
  }, [router, state])

  const fieldErrors = state?.ok === false ? state.fieldErrors : undefined
  const today = new Date().toISOString().slice(0, 10)

  return (
    <form action={formAction} className="w-full">
      <Card>
        <CardHeader>
          <CardTitle>รายละเอียดพฤติกรรม</CardTitle>
          <CardDescription>กรอกข้อมูลที่ต้องการบันทึกให้ครบถ้วน</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="student_id" className="text-sm font-medium">
                นักเรียน
              </label>
              <Select name="student_id" required>
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
              <Select name="behavior_type" required>
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
            <Select name="category">
              <SelectTrigger id="category" className="w-full" aria-invalid={!!fieldErrors?.category}>
                <SelectValue placeholder="เลือกหมวดหมู่..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="academic">ผลการเรียนโดดเด่น / ทุ่มเท</SelectItem>
                <SelectItem value="helpfulness">มีน้ำใจช่วยเหลือ</SelectItem>
                <SelectItem value="discipline">ระเบียบวินัย</SelectItem>
                <SelectItem value="disruption">ก่อกวนในชั้นเรียน</SelectItem>
                <SelectItem value="tardiness">มาสาย / ขาดเรียน</SelectItem>
                <SelectItem value="other">อื่นๆ</SelectItem>
              </SelectContent>
            </Select>
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
                defaultValue={today}
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
                defaultValue="0"
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
              placeholder="อธิบายเหตุการณ์ที่เกิดขึ้น..."
              className="min-h-28 resize-y"
              aria-invalid={!!fieldErrors?.description}
            />
            <FieldError message={fieldErrors?.description?.[0]} />
          </div>

          <ActionFeedback result={state} />
        </CardContent>
        <CardFooter className="flex flex-col-reverse gap-3 border-t border-border pt-5 sm:flex-row sm:justify-end">
          <Button type="button" variant="ghost" onClick={() => router.push("/behavior")}>
            ยกเลิก
          </Button>
          <Button type="submit" disabled={pending || students.length === 0} className="w-full gap-2 sm:w-auto">
            {pending ? <Loader2 className="animate-spin" /> : <Save />}
            {pending ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}

function FieldError({ message }: { message?: string }) {
  return message ? <p className="text-xs text-destructive">{message}</p> : null
}
