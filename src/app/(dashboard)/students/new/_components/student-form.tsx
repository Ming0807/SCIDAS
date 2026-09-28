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
import { familyStatusOptions } from "@/lib/student-constants"

type StudentFormProps =
  | { mode: "create"; student?: never; classrooms?: Array<{ id: string; name: string }> }
  | { mode: "edit"; student: StudentRow; classrooms?: never }

function FieldError({ message }: { message?: string }) {
  return message ? (
    <p className="text-xs text-destructive" aria-live="polite">
      {message}
    </p>
  ) : null
}

export function StudentForm({ mode, student, classrooms }: StudentFormProps) {
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
        <Card className="rounded-2xl border-border shadow-xs">
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

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="subdistrict" className="text-sm font-medium">
                  ตำบล/แขวง
                </label>
                <Input
                  id="subdistrict"
                  name="subdistrict"
                  defaultValue={student?.subdistrict ?? ""}
                  placeholder="ตำบล"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="district" className="text-sm font-medium">
                  อำเภอ/เขต
                </label>
                <Input
                  id="district"
                  name="district"
                  defaultValue={student?.district ?? ""}
                  placeholder="อำเภอ"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="province" className="text-sm font-medium">
                  จังหวัด
                </label>
                <Input
                  id="province"
                  name="province"
                  defaultValue={student?.province ?? ""}
                  placeholder="จังหวัด"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="postal_code" className="text-sm font-medium">
                  รหัสไปรษณีย์
                </label>
                <Input
                  id="postal_code"
                  name="postal_code"
                  inputMode="numeric"
                  maxLength={5}
                  defaultValue={student?.postal_code ?? ""}
                  placeholder="เช่น 36110"
                  aria-invalid={fieldErrors?.postal_code ? true : undefined}
                />
                <FieldError message={fieldErrors?.postal_code?.[0]} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="travel_method" className="text-sm font-medium">
                  วิธีเดินทางมาโรงเรียน
                </label>
                <Input
                  id="travel_method"
                  name="travel_method"
                  defaultValue={student?.travel_method ?? ""}
                  placeholder="เช่น เดิน, จักรยาน, รถรับส่ง"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="distance_to_school_km" className="text-sm font-medium">
                  ระยะทางมาโรงเรียน (กม.)
                </label>
                <Input
                  id="distance_to_school_km"
                  name="distance_to_school_km"
                  type="number"
                  min={0}
                  step="0.1"
                  defaultValue={student?.distance_to_school_km ?? ""}
                  placeholder="เช่น 2.5"
                  aria-invalid={fieldErrors?.distance_to_school_km ? true : undefined}
                />
                <FieldError message={fieldErrors?.distance_to_school_km?.[0]} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="national_id" className="text-sm font-medium">
                  เลขบัตรประชาชน (13 หลัก)
                </label>
                <Input
                  id="national_id"
                  name="national_id"
                  inputMode="numeric"
                  maxLength={13}
                  defaultValue={student?.national_id ?? ""}
                  placeholder="เช่น 1369900123456"
                  aria-invalid={fieldErrors?.national_id ? true : undefined}
                />
                <FieldError message={fieldErrors?.national_id?.[0]} />
              </div>
              <div className="space-y-2">
                <label htmlFor="blood_type" className="text-sm font-medium">
                  หมู่โลหิต
                </label>
                <select
                  id="blood_type"
                  name="blood_type"
                  defaultValue={student?.blood_type ?? ""}
                  className="h-8 w-full rounded-lg border border-input bg-background px-3 py-1 text-sm shadow-sm"
                >
                  <option value="">ไม่ระบุ</option>
                  {["A", "B", "AB", "O", "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
                <FieldError message={fieldErrors?.blood_type?.[0]} />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="medical_conditions" className="text-sm font-medium">
                โรคประจำตัว / ประวัติการแพ้
              </label>
              <Input
                id="medical_conditions"
                name="medical_conditions"
                defaultValue={student?.medical_conditions ?? ""}
                placeholder="เช่น หอบหืด, แพ้ถั่ว"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="special_needs" className="text-sm font-medium">
                ความต้องการจำเป็นพิเศษ
              </label>
              <Input
                id="special_needs"
                name="special_needs"
                defaultValue={student?.special_needs ?? ""}
                placeholder="เช่น ต้องการที่นั่งหน้าชั้น"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="family_status" className="text-sm font-medium">
                สถานะครอบครัว
              </label>
              <select
                id="family_status"
                name="family_status"
                defaultValue={student?.family_status ?? ""}
                className="h-8 w-full rounded-lg border border-input bg-background px-3 py-1 text-sm shadow-sm"
              >
                <option value="">ไม่ระบุ</option>
                {familyStatusOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <FieldError message={fieldErrors?.family_status?.[0]} />
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
                  <option value="active">กำลังศึกษา</option>
                  <option value="graduated">สำเร็จการศึกษา</option>
                  <option value="transferred">ย้ายสถานศึกษา</option>
                  <option value="dropped_out">ออกกลางคัน</option>
                  <option value="suspended">พักการเรียน</option>
                </select>
              </div>
            ) : null}

            <ActionFeedback result={state} />

            {!isEdit && classrooms && classrooms.length > 0 ? (
              <div className="space-y-2">
                <label htmlFor="classroom_id" className="text-sm font-medium">
                  จัดเข้าห้องเรียน (ไม่บังคับ)
                </label>
                <select
                  id="classroom_id"
                  name="classroom_id"
                  defaultValue=""
                  className="h-8 w-full rounded-lg border border-input bg-background px-3 py-1 text-sm shadow-sm"
                >
                  <option value="">ยังไม่จัดห้อง (เพิ่มภายหลังได้)</option>
                  {classrooms.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <FieldError message={fieldErrors?.classroom_id?.[0]} />
              </div>
            ) : null}

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
        <Card className="rounded-2xl border-destructive/30 shadow-xs">
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
