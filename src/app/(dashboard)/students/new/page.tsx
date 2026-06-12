"use client"

import { useActionState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, CheckCircle2, Loader2, Save } from "lucide-react"

import { createStudentAction } from "@/app/actions/student.actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import type { ActionResult } from "@/lib/server/action-result"

export default function NewStudentPage() {
  const router = useRouter()
  const [state, formAction, pending] = useActionState<
    ActionResult<{ id: string }> | null,
    FormData
  >(createStudentAction, null)

  // Redirect on success
  useEffect(() => {
    if (state?.ok && state.redirectTo) {
      router.push(state.redirectTo)
    }
  }, [state, router])

  const fieldErrors = state?.ok === false ? state.fieldErrors : undefined

  return (
    <div className="flex flex-col gap-6 p-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/students">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            เพิ่มนักเรียนใหม่
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            กรอกข้อมูลพื้นฐานของนักเรียน
          </p>
        </div>
      </div>

      <form action={formAction}>
        <Card className="shadow-sm border-border">
          <CardHeader>
            <CardTitle>ข้อมูลนักเรียน</CardTitle>
            <CardDescription>
              กรอกข้อมูลที่จำเป็น (*) เพื่อเพิ่มนักเรียนใหม่
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="student_code" className="text-sm font-medium">
                  รหัสนักเรียน *
                </label>
                <Input
                  id="student_code"
                  name="student_code"
                  required
                  placeholder="เช่น 66001"
                  aria-invalid={fieldErrors?.student_code ? true : undefined}
                />
                {fieldErrors?.student_code ? (
                  <p className="text-xs text-destructive">{fieldErrors.student_code[0]}</p>
                ) : null}
              </div>
              <div className="space-y-2">
                <label htmlFor="prefix" className="text-sm font-medium">
                  คำนำหน้า
                </label>
                <select
                  id="prefix"
                  name="prefix"
                  className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                  defaultValue=""
                >
                  <option value="">ไม่ระบุ</option>
                  <option value="เด็กชาย">เด็กชาย</option>
                  <option value="เด็กหญิง">เด็กหญิง</option>
                  <option value="นาย">นาย</option>
                  <option value="นางสาว">นางสาว</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="first_name" className="text-sm font-medium">
                  ชื่อ *
                </label>
                <Input
                  id="first_name"
                  name="first_name"
                  required
                  placeholder="ชื่อจริง"
                  aria-invalid={fieldErrors?.first_name ? true : undefined}
                />
                {fieldErrors?.first_name ? (
                  <p className="text-xs text-destructive">{fieldErrors.first_name[0]}</p>
                ) : null}
              </div>
              <div className="space-y-2">
                <label htmlFor="last_name" className="text-sm font-medium">
                  นามสกุล *
                </label>
                <Input
                  id="last_name"
                  name="last_name"
                  required
                  placeholder="นามสกุล"
                  aria-invalid={fieldErrors?.last_name ? true : undefined}
                />
                {fieldErrors?.last_name ? (
                  <p className="text-xs text-destructive">{fieldErrors.last_name[0]}</p>
                ) : null}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label htmlFor="nickname" className="text-sm font-medium">
                  ชื่อเล่น
                </label>
                <Input id="nickname" name="nickname" placeholder="ชื่อเล่น" />
              </div>
              <div className="space-y-2">
                <label htmlFor="gender" className="text-sm font-medium">
                  เพศ *
                </label>
                <select
                  id="gender"
                  name="gender"
                  required
                  className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                  defaultValue=""
                >
                  <option value="">เลือก...</option>
                  <option value="male">ชาย</option>
                  <option value="female">หญิง</option>
                  <option value="other">อื่นๆ</option>
                </select>
                {fieldErrors?.gender ? (
                  <p className="text-xs text-destructive">{fieldErrors.gender[0]}</p>
                ) : null}
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
                  aria-invalid={fieldErrors?.date_of_birth ? true : undefined}
                />
                {fieldErrors?.date_of_birth ? (
                  <p className="text-xs text-destructive">{fieldErrors.date_of_birth[0]}</p>
                ) : null}
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="address" className="text-sm font-medium">
                ที่อยู่
              </label>
              <Input
                id="address"
                name="address"
                placeholder="ที่อยู่ตามทะเบียนบ้าน"
              />
            </div>

            {state && state.ok ? (
              <div
                aria-live="polite"
                className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 flex items-center gap-2"
              >
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                {state.message} กำลังนำทาง...
              </div>
            ) : state && !state.ok ? (
              <div
                aria-live="polite"
                className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
              >
                {state.message}
              </div>
            ) : null}

            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              <Link href="/students">
                <Button type="button" variant="ghost">
                  ยกเลิก
                </Button>
              </Link>
              <Button type="submit" disabled={pending} className="gap-2">
                {pending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {pending ? "กำลังบันทึก..." : "บันทึก"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
