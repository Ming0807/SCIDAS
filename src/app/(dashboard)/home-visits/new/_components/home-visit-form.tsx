"use client"

import { useActionState, useState } from "react"
import { CheckCircle2, Loader2, Save } from "lucide-react"

import { createHomeVisitAction } from "@/app/actions/home-visit.actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { StudentAttachmentForm } from "@/components/care/student-attachment-form"
import type { ActionResult } from "@/lib/server/action-result"

type StudentOption = {
  id: string
  name: string
  classroom?: string
  code: string
}

type HomeVisitFormProps = {
  studentOptions: StudentOption[]
}

export function HomeVisitForm({ studentOptions }: HomeVisitFormProps) {
  const [state, formAction, pending] = useActionState<
    ActionResult<{ id: string }> | null,
    FormData
  >(createHomeVisitAction, null)

  const [selectedStudentId, setSelectedStudentId] = useState<string>("")

  const visitCreated = state?.ok && state.data?.id

  // ── After successful creation: show evidence upload (outside form) ──
  if (visitCreated && selectedStudentId) {
    return (
      <div className="space-y-6">
        <Card className="shadow-sm border-emerald-200 bg-emerald-50">
          <CardContent className="p-6 flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-emerald-900">
                บันทึกการเยี่ยมบ้านสำเร็จ
              </p>
              <p className="text-xs text-emerald-700">{state?.message}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border">
          <CardHeader>
            <CardTitle>หลักฐาน</CardTitle>
            <CardDescription>อัปโหลดรูปภาพหรือเอกสาร</CardDescription>
          </CardHeader>
          <CardContent>
            <StudentAttachmentForm
              studentId={selectedStudentId}
              referenceTable="home_visits"
              referenceId={state.data!.id}
            />
          </CardContent>
        </Card>
      </div>
    )
  }

  // ── Before creation: show visit form ──
  return (
    <form action={formAction}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left: Visit Details */}
        <div className="md:col-span-2 space-y-6">
          <Card className="shadow-sm border-border">
            <CardHeader>
              <CardTitle>รายละเอียดการเยี่ยมบ้าน</CardTitle>
              <CardDescription>กรอกข้อมูลพื้นฐานเกี่ยวกับการเยี่ยมบ้าน</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Student Selector */}
                <div className="space-y-2 sm:col-span-2">
                  <label htmlFor="studentId" className="text-sm font-medium">
                    นักเรียน
                  </label>
                  <select
                    id="studentId"
                    name="studentId"
                    required
                    value={selectedStudentId}
                    onChange={(e) => setSelectedStudentId(e.target.value)}
                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring/50"
                  >
                    <option value="">เลือกนักเรียน...</option>
                    {studentOptions.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                        {s.classroom ? ` (${s.classroom})` : ""}
                        {s.code ? ` — ${s.code}` : ""}
                      </option>
                    ))}
                  </select>
                  {state?.ok === false && state.fieldErrors?.studentId ? (
                    <p className="text-xs text-destructive">
                      {state.fieldErrors.studentId[0]}
                    </p>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <label htmlFor="visitDate" className="text-sm font-medium">
                    วันที่เยี่ยม
                  </label>
                  <Input
                    id="visitDate"
                    name="visitDate"
                    type="date"
                    required
                    defaultValue={new Date().toISOString().split("T")[0]}
                  />
                  {state?.ok === false && state.fieldErrors?.visitDate ? (
                    <p className="text-xs text-destructive">
                      {state.fieldErrors.visitDate[0]}
                    </p>
                  ) : null}
                </div>
                <div className="space-y-2">
                  <label htmlFor="visitTime" className="text-sm font-medium">
                    เวลา
                  </label>
                  <Input id="visitTime" name="visitTime" type="time" />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="addressVisited" className="text-sm font-medium">
                  ที่อยู่ที่เยี่ยม
                </label>
                <Input
                  id="addressVisited"
                  name="addressVisited"
                  placeholder="ที่อยู่..."
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="suggestions" className="text-sm font-medium">
                  บันทึกการเยี่ยม
                </label>
                <Textarea
                  id="suggestions"
                  name="suggestions"
                  placeholder="สรุปผลการเยี่ยมบ้าน..."
                  className="min-h-[100px]"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="overallAssessment"
                  className="text-sm font-medium"
                >
                  ผลประเมินโดยรวม
                </label>
                <Textarea
                  id="overallAssessment"
                  name="overallAssessment"
                  placeholder="ประเมินสภาพโดยรวมของครอบครัว..."
                  className="min-h-[80px]"
                />
              </div>

              {/* Checkboxes */}
              <div className="flex flex-wrap gap-4 text-sm">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="followUpNeeded"
                    className="size-4 rounded border-input"
                  />
                  ต้องติดตามต่อเนื่อง
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="hasFamilyProblem"
                    className="size-4 rounded border-input"
                  />
                  มีปัญหาครอบครัว
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="travelDifficulty"
                    className="size-4 rounded border-input"
                  />
                  เดินทางลำบาก
                </label>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Submit */}
        <div className="space-y-6">
          {selectedStudentId ? (
            <Card className="shadow-sm border-border bg-muted/30">
              <CardContent className="p-6 text-center text-sm text-muted-foreground">
                บันทึกการเยี่ยมบ้านก่อนเพื่ออัปโหลดหลักฐาน
              </CardContent>
            </Card>
          ) : (
            <Card className="shadow-sm border-border bg-muted/30">
              <CardContent className="p-6 text-center text-sm text-muted-foreground">
                เลือกนักเรียนก่อนเพื่ออัปโหลดหลักฐาน
              </CardContent>
            </Card>
          )}

          {/* Submit */}
          <Card className="shadow-sm border-border bg-primary/5">
            <CardContent className="p-6">
              <Button
                type="submit"
                disabled={pending || !selectedStudentId}
                className="w-full gap-2"
                size="lg"
              >
                {pending ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Save className="h-5 w-5" />
                )}
                {pending ? "กำลังบันทึก..." : "บันทึกการเยี่ยมบ้าน"}
              </Button>
            </CardContent>
          </Card>

          {/* Error feedback */}
          {state && !state.ok ? (
            <div
              aria-live="polite"
              className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
            >
              {state.message}
            </div>
          ) : null}
        </div>
      </div>
    </form>
  )
}
