"use client"

import { useActionState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Archive, ArrowLeft, Loader2, Save } from "lucide-react"

import {
  archiveStudentAction,
  createStudentAction,
  updateStudentAction,
  type StudentRow,
} from "@/app/actions/student.actions"
import { ActionFeedback, ConfirmActionButton } from "@/components/forms"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import type { ActionResult } from "@/lib/server/action-result"

type StudentFormProps =
  | { mode: "create"; student?: never }
  | { mode: "edit"; student: StudentRow }

function FieldError({ message }: { message?: string }) {
  return message ? (
    <p className="text-xs text-destructive" aria-live="polite">
      {message}
    </p>
  ) : null
}

export function StudentForm({ mode, student }: StudentFormProps) {
  const router = useRouter()
  const action = mode === "create" ? createStudentAction : updateStudentAction
  const [state, formAction, pending] = useActionState<
    ActionResult<{ id: string }> | null,
    FormData
  >(action, null)
  const fieldErrors = state?.ok === false ? state.fieldErrors : undefined
  const isEdit = mode === "edit"

  useEffect(() => {
    if (state?.ok && state.redirectTo) {
      router.replace(state.redirectTo)
    }
  }, [router, state])

  const heading = isEdit ? "แก้ไขข้อมูลนักเรียน" : "เพิ่มนักเรียนใหม่"
  const description = isEdit
    ? "ปรับปรุงข้อมูลพื้นฐานของนักเรียน"
    : "กรอกข้อมูลพื้นฐานของนักเรียน"

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 p-6">
      <div className="flex items-center gap-4">
        <Button nativeButton={false} variant="ghost" size="icon" aria-label="ย้อนกลับ" render={<Link href={isEdit ? `/students/${student.id}` : "/students"} />}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-semibold text-foreground">{heading}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
      </div>

      <form action={formAction}>
        {isEdit ? <input type="hidden" name="student_id" value={student.id} /> : null}
        <Card className="border-border shadow-sm">
          <CardHeader>
            <CardTitle>ข้อมูลนักเรียน</CardTitle>
            <CardDescription>
              กรอกข้อมูลที่จำเป็น (*) เพื่อ{isEdit ? "บันทึกการแก้ไข" : "เพิ่มนักเรียนใหม่"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="student_code" className="text-sm font-medium">
                  รหัสนักเรียน *
                </label>
                <Input
                  id="student_code"
                  name="student_code"
                  required
                  defaultValue={student?.student_code ?? ""}
                  placeholder="เช่น 66001"
                  aria-invalid={fieldErrors?.student_code ? true : undefined}
                />
                <FieldError message={fieldErrors?.student_code?.[0]} />
              </div>
              <div className="space-y-2">
                <label htmlFor="prefix" className="text-sm font-medium">
                  คำนำหน้า
                </label>
                <select
                  id="prefix"
                  name="prefix"
                  defaultValue={student?.prefix ?? ""}
                  className="h-8 w-full rounded-lg border border-input bg-background px-3 py-1 text-sm"
                >
                  <option value="">ไม่ระบุ</option>
                  <option value="เด็กชาย">เด็กชาย</option>
                  <option value="เด็กหญิง">เด็กหญิง</option>
                  <option value="นาย">นาย</option>
                  <option value="นางสาว">นางสาว</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="first_name" className="text-sm font-medium">
                  ชื่อ *
                </label>
                <Input
                  id="first_name"
                  name="first_name"
                  required
                  defaultValue={student?.first_name ?? ""}
                  placeholder="ชื่อจริง"
                  aria-invalid={fieldErrors?.first_name ? true : undefined}
                />
                <FieldError message={fieldErrors?.first_name?.[0]} />
              </div>
              <div className="space-y-2">
                <label htmlFor="last_name" className="text-sm font-medium">
                  นามสกุล *
                </label>
                <Input
                  id="last_name"
                  name="last_name"
                  required
                  defaultValue={student?.last_name ?? ""}
                  placeholder="นามสกุล"
                  aria-invalid={fieldErrors?.last_name ? true : undefined}
                />
                <FieldError message={fieldErrors?.last_name?.[0]} />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <label htmlFor="nickname" className="text-sm font-medium">
                  ชื่อเล่น
                </label>
                <Input
                  id="nickname"
                  name="nickname"
                  defaultValue={student?.nickname ?? ""}
                  placeholder="ชื่อเล่น"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="gender" className="text-sm font-medium">
                  เพศ *
                </label>
                <select
                  id="gender"
                  name="gender"
                  required
                  defaultValue={student?.gender ?? ""}
                  className="h-8 w-full rounded-lg border border-input bg-background px-3 py-1 text-sm"
                  aria-invalid={fieldErrors?.gender ? true : undefined}
                >
                  <option value="">เลือก...</option>
                  <option value="male">ชาย</option>
                  <option value="female">หญิง</option>
                  <option value="other">อื่นๆ</option>
                </select>
                <FieldError message={fieldErrors?.gender?.[0]} />
              </div>
              <div className="space-y-2">
                <label htmlFor="date_of_birth" className="text-sm font-medium">
                  วันเกิด *
                </label>
                <Input
                  id="date_of_birth"
                  name="date_of_birth"
                  type="date"
                  required
                  defaultValue={student?.date_of_birth ?? ""}
                  aria-invalid={fieldErrors?.date_of_birth ? true : undefined}
                />
                <FieldError message={fieldErrors?.date_of_birth?.[0]} />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="address" className="text-sm font-medium">
                ที่อยู่
              </label>
              <Input
                id="address"
                name="address"
                defaultValue={student?.address ?? ""}
                placeholder="ที่อยู่ตามทะเบียนบ้าน"
              />
            </div>

            {isEdit ? (
              <div className="space-y-2">
                <label htmlFor="status" className="text-sm font-medium">
                  สถานะการศึกษา
                </label>
                <select
                  id="status"
                  name="status"
                  defaultValue={student?.status ?? "active"}
                  className="h-8 w-full rounded-lg border border-input bg-background px-3 py-1 text-sm shadow-sm"
                >
                  <option value="active">กำลังศึกษา (Active)</option>
                  <option value="graduated">สำเร็จการศึกษา (Graduated)</option>
                  <option value="transferred">ย้ายสถานศึกษา (Transferred)</option>
                  <option value="dropped_out">ออกกลางคัน (Dropped out)</option>
                  <option value="suspended">พักการเรียน (Suspended)</option>
                </select>
              </div>
            ) : null}

            <ActionFeedback result={state} />

            <div className="flex flex-col-reverse gap-3 border-t border-border pt-4 sm:flex-row sm:justify-end">
              <Button nativeButton={false} variant="ghost" className="w-full sm:w-auto" render={<Link href={isEdit ? `/students/${student.id}` : "/students"} />}>
                ยกเลิก
              </Button>
              <Button type="submit" disabled={pending} className="gap-2">
                {pending ? (
                  <Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {pending ? "กำลังบันทึก..." : "บันทึก"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>

      {isEdit ? (
        <Card className="border-destructive/30 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Archive className="size-4" />
              เปลี่ยนสถานะการออกจากโรงเรียน
            </CardTitle>
            <CardDescription>
              เลือกสถานะให้ตรงกับกรณีจริง ข้อมูลนักเรียนจะยังคงอยู่ในระบบและไม่ถูกลบ
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 sm:flex-row">
            <ConfirmActionButton
              action={() => archiveStudentAction(student.id, "transferred")}
              label="ย้ายออก"
              title="ยืนยันสถานะย้ายออก"
              description="ระบบจะเปลี่ยนสถานะนักเรียนเป็นย้ายออก และเก็บข้อมูลเดิมไว้"
              confirmLabel="ยืนยันย้ายออก"
              pendingLabel="กำลังบันทึก"
              onSuccessHref={`/students/${student.id}`}
            />
            <ConfirmActionButton
              action={() => archiveStudentAction(student.id, "dropped_out")}
              label="ออกกลางคัน"
              title="ยืนยันสถานะออกกลางคัน"
              description="ระบบจะเปลี่ยนสถานะนักเรียนเป็นออกกลางคัน และเก็บข้อมูลเดิมไว้"
              confirmLabel="ยืนยันออกกลางคัน"
              pendingLabel="กำลังบันทึก"
              onSuccessHref={`/students/${student.id}`}
            />
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}
