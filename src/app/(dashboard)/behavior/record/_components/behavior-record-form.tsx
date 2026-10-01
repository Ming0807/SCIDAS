"use client"

import { useActionState, useEffect, useState } from "react"
import { ArrowLeft, ArrowRight, Check, Loader2, Save } from "lucide-react"
import { useRouter } from "next/navigation"

import { createBehaviorRecordAction } from "@/app/actions/behavior.actions"
import { ActionFeedback, StudentSearchCombobox } from "@/components/forms"
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
import { behaviorCategoryOptions, behaviorSeverityOptions } from "@/lib/behavior-constants"
import { getTodayBangkok } from "@/lib/student-care-formatters"
import { cn } from "@/lib/utils"

type StudentOption = {
  id: string
  student_code: string
  first_name: string
  last_name: string
}

type BehaviorRecordFormProps = {
  students: StudentOption[]
  defaultStudentId?: string
}

const STEPS = [
  {
    id: 1,
    title: "1. ข้อมูลนักเรียนและประเภทพฤติกรรม",
    subtitle: "เลือกนักเรียน, ประเภท, หมวดหมู่, ระดับความรุนแรง",
  },
  {
    id: 2,
    title: "2. รายละเอียดและผลการดำเนินการ",
    subtitle: "วันที่, คะแนน, รายละเอียดเหตุการณ์, การดำเนินการ",
  },
]

export function BehaviorRecordForm({ students, defaultStudentId }: BehaviorRecordFormProps) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<number>(1)
  const [isDirty, setIsDirty] = useState(false)
  const [state, formAction, pending] = useActionState<
    ActionResult<{ id: string }> | null,
    FormData
  >(createBehaviorRecordAction, null)

  useEffect(() => {
    if (state?.ok && state.redirectTo) router.push(state.redirectTo)
  }, [router, state])

  const fieldErrors = state?.ok === false ? state.fieldErrors : undefined
  const today = getTodayBangkok()

  // Jump to step with errors
  useEffect(() => {
    if (fieldErrors) {
      const step1Keys = ["student_id", "behavior_type", "category", "severity"]
      const step2Keys = ["date", "points", "description", "action_taken"]
      const errorKeys = Object.keys(fieldErrors)
      if (errorKeys.some((k) => step1Keys.includes(k))) {
        setCurrentStep(1)
      } else if (errorKeys.some((k) => step2Keys.includes(k))) {
        setCurrentStep(2)
      }
    }
  }, [fieldErrors])

  return (
    <form action={formAction} onChange={() => setIsDirty(true)} className="w-full space-y-5">
      {/* 2-Step Wizard Indicator */}
      <nav aria-label="ขั้นตอนการบันทึกพฤติกรรม" className="grid grid-cols-2 gap-2 sm:gap-3">
        {STEPS.map((s) => {
          const isActive = currentStep === s.id
          const isCompleted = currentStep > s.id
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => setCurrentStep(s.id)}
              className={cn(
                "flex flex-col sm:flex-row items-center sm:items-start gap-2 rounded-xl border p-2.5 sm:p-3 text-left transition-all cursor-pointer",
                isActive
                  ? "border-primary bg-primary/10 text-primary shadow-xs ring-1 ring-primary/30"
                  : isCompleted
                  ? "border-emerald-500/30 bg-emerald-500/5 text-foreground hover:bg-muted/40"
                  : "border-border bg-card text-muted-foreground hover:bg-muted/40"
              )}
            >
              <span
                className={cn(
                  "flex size-6 sm:size-7 shrink-0 items-center justify-center rounded-lg text-xs font-semibold",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : isCompleted
                    ? "bg-emerald-600 text-white"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {isCompleted ? <Check className="size-3.5" /> : s.id}
              </span>
              <div className="min-w-0 text-center sm:text-left">
                <p className="truncate text-xs font-semibold text-foreground">{s.title}</p>
                <p className="hidden sm:block truncate text-xs text-muted-foreground">{s.subtitle}</p>
              </div>
            </button>
          )
        })}
      </nav>

      <Card className="rounded-2xl border-border shadow-xs">
        <CardHeader>
          <CardTitle>
            {currentStep === 1
              ? "ขั้นตอนที่ 1: ข้อมูลนักเรียนและประเภทพฤติกรรม"
              : "ขั้นตอนที่ 2: รายละเอียดและผลการดำเนินการ"}
          </CardTitle>
          <CardDescription>
            {currentStep === 1
              ? "เลือกนักเรียนและระบุประเภท หมวดหมู่ และระดับความรุนแรงของพฤติกรรม"
              : "ระบุวันที่เกิดเหตุ คะแนนบวก/ลบ รายละเอียดพฤติกรรม และการดำเนินการ"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* STEP 1: Student and Behavior Classification */}
          <div className={currentStep === 1 ? "space-y-5" : "hidden"}>
            <div className="grid gap-5 md:grid-cols-2">
              <div className="md:col-span-2">
                <StudentSearchCombobox
                  students={students}
                  name="student_id"
                  id="student_id"
                  defaultValue={defaultStudentId}
                  required={currentStep === 1}
                  label="นักเรียน"
                  placeholder="-- ค้นหาและเลือกนักเรียน --"
                  error={fieldErrors?.student_id?.[0]}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="behavior_type" className="text-sm font-medium">
                  ประเภทพฤติกรรม *
                </label>
                <Select name="behavior_type" required={currentStep === 1}>
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

              <div className="space-y-2">
                <label htmlFor="category" className="text-sm font-medium">
                  หมวดหมู่
                </label>
                <Select name="category">
                  <SelectTrigger id="category" className="w-full" aria-invalid={!!fieldErrors?.category}>
                    <SelectValue placeholder="เลือกหมวดหมู่..." />
                  </SelectTrigger>
                  <SelectContent>
                    {behaviorCategoryOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldError message={fieldErrors?.category?.[0]} />
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="severity" className="text-sm font-medium">
                  ระดับความรุนแรง
                </label>
                <Select name="severity" defaultValue="low">
                  <SelectTrigger id="severity" className="w-full" aria-invalid={!!fieldErrors?.severity}>
                    <SelectValue placeholder="เลือกระดับ..." />
                  </SelectTrigger>
                  <SelectContent>
                    {behaviorSeverityOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldError message={fieldErrors?.severity?.[0]} />
              </div>
              <div className="flex items-end pb-1">
                <label className="flex cursor-pointer items-center gap-2 text-sm font-medium">
                  <input
                    type="checkbox"
                    name="parent_notified"
                    className="size-4 rounded border-input"
                  />
                  แจ้งผู้ปกครองแล้ว
                </label>
              </div>
            </div>
          </div>

          {/* STEP 2: Details and Actions */}
          <div className={currentStep === 2 ? "space-y-5" : "hidden"}>
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="date" className="text-sm font-medium">
                  วันที่ *
                </label>
                <Input
                  id="date"
                  type="date"
                  name="date"
                  required={currentStep === 2}
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
                รายละเอียดเพิ่มเติม *
              </label>
              <Textarea
                id="description"
                name="description"
                required={currentStep === 2}
                placeholder="อธิบายเหตุการณ์ที่เกิดขึ้น..."
                className="min-h-28 resize-y"
                aria-invalid={!!fieldErrors?.description}
              />
              <FieldError message={fieldErrors?.description?.[0]} />
            </div>

            <div className="space-y-2">
              <label htmlFor="action_taken" className="text-sm font-medium">
                การดำเนินการ (ถ้ามี)
              </label>
              <Textarea
                id="action_taken"
                name="action_taken"
                placeholder="เช่น ตักเตือนด้วยวาจา เชิญผู้ปกครองมาพบ..."
                className="min-h-20 resize-y"
                aria-invalid={!!fieldErrors?.action_taken}
              />
              <FieldError message={fieldErrors?.action_taken?.[0]} />
            </div>
          </div>

          <ActionFeedback result={state} />
        </CardContent>

        <CardFooter className="flex flex-col-reverse gap-3 border-t border-border pt-5 sm:flex-row sm:justify-between sm:items-center">
          <div>
            {currentStep > 1 ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => setCurrentStep(1)}
                className="w-full sm:w-auto gap-2"
              >
                <ArrowLeft className="size-4" />
                ย้อนกลับ
              </Button>
            ) : (
              <Button
                type="button"
                variant="ghost"
                onClick={() => router.push("/behavior")}
                className="w-full sm:w-auto"
              >
                ยกเลิก
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {currentStep === 1 ? (
              <Button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="w-full sm:w-auto gap-2"
              >
                <span>ถัดไป: กรอกรายละเอียด</span>
                <ArrowRight className="size-4" />
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={pending || students.length === 0}
                className="w-full sm:w-auto gap-2"
              >
                {pending ? <Loader2 className="animate-spin size-4" /> : <Save className="size-4" />}
                <span>{pending ? "กำลังบันทึก..." : "บันทึกข้อมูล"}</span>
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>

      {/* Sticky Save Bar on Dirty State */}
      {isDirty ? (
        <div className="sticky bottom-4 z-20 mt-4 flex items-center justify-between gap-3 rounded-2xl border border-amber-500/30 bg-card/95 p-3 shadow-lg backdrop-blur-sm sm:px-5">
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-sm font-medium text-foreground">
              มีข้อมูลพฤติกรรมที่ยังไม่ได้บันทึก
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => router.push("/behavior")}
              disabled={pending}
            >
              ยกเลิก
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={pending || students.length === 0}
              className="gap-2"
            >
              {pending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
              <span>{pending ? "กำลังบันทึก..." : "บันทึกข้อมูล"}</span>
            </Button>
          </div>
        </div>
      ) : null}
    </form>
  )
}

function FieldError({ message }: { message?: string }) {
  return message ? <p className="text-xs text-destructive">{message}</p> : null
}
