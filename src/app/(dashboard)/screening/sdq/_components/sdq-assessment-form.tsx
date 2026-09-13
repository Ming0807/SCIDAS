"use client"

import { useMemo, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft,
  Loader2,
  Save,
} from "lucide-react"
import {
  calculateSdqScores,
  getSdqClassificationLabel,
  SDQ_DIMENSIONS,
  SDQ_QUESTIONS,
  type SdqDimension,
  type SdqEvaluatorType,
} from "@/lib/sdq-constants"
import { saveSdqAssessmentAction, type SdqActionResponse } from "@/app/actions/sdq.actions"
import { Button } from "@/components/ui/button"
import { ActionFeedback } from "@/components/forms/action-feedback"
import type { ActionResult } from "@/lib/server/action-result"

interface SdqAssessmentFormProps {
  student: {
    id: string
    name: string
    code: string
    classroom?: string | null
  }
}

export function SdqAssessmentForm({ student }: SdqAssessmentFormProps) {
  const router = useRouter()
  const [evaluatorType, setEvaluatorType] = useState<SdqEvaluatorType>("teacher")
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [pending, startTransition] = useTransition()
  const [result, setResult] = useState<ActionResult<SdqActionResponse> | null>(null)

  const answeredCount = Object.keys(answers).length
  const isComplete = answeredCount === 25

  // Live scoring calculations
  const liveResult = useMemo(() => {
    return calculateSdqScores(answers)
  }, [answers])

  function handleSelectAnswer(questionId: number, value: number) {
    setAnswers((prev) => ({ ...prev, [questionId]: value }))
  }

  function fillSampleAnswers(mode: "normal" | "risk") {
    const nextAnswers: Record<number, number> = {}
    for (const q of SDQ_QUESTIONS) {
      if (mode === "normal") {
        nextAnswers[q.id] = q.isReversed || q.dimension === "prosocial" ? 2 : 0
      } else {
        nextAnswers[q.id] = q.isReversed ? 1 : 1
      }
    }
    setAnswers(nextAnswers)
  }

  function handleSubmit() {
    const formData = new FormData()
    formData.set("student_id", student.id)
    formData.set("evaluator_type", evaluatorType)
    for (let i = 1; i <= 25; i++) {
      if (answers[i] !== undefined) {
        formData.set(`q_${i}`, String(answers[i]))
      }
    }

    startTransition(async () => {
      const res = await saveSdqAssessmentAction(null, formData)
      setResult(res)
      if (res.ok) {
        setTimeout(() => {
          router.push("/screening/sdq")
        }, 1200)
      }
    })
  }

  const overallBadge = getSdqClassificationLabel(liveResult.overallClassification)

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-border bg-card p-5 shadow-xs">
        <div className="flex items-center gap-3">
          <Link href="/screening/sdq">
            <Button variant="outline" size="sm" className="size-9 p-0 rounded-full">
              <ArrowLeft className="size-4" />
              <span className="sr-only">ย้อนกลับ</span>
            </Button>
          </Link>
          <div>
            <h1 className="text-lg font-bold text-foreground">{student.name}</h1>
            <p className="text-xs text-muted-foreground">
              รหัสประจำตัว: {student.code} · ชั้น {student.classroom ?? "ไม่ระบุ"}
            </p>
          </div>
        </div>

        {/* Evaluator Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">ผู้ประเมิน:</span>
          <div className="inline-flex rounded-xl border border-border bg-muted/40 p-1">
            <button
              type="button"
              onClick={() => setEvaluatorType("teacher")}
              className={`rounded-lg px-3 py-1 text-xs font-medium transition-colors ${
                evaluatorType === "teacher"
                  ? "bg-card text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              ครูประเมิน
            </button>
            <button
              type="button"
              onClick={() => setEvaluatorType("student")}
              className={`rounded-lg px-3 py-1 text-xs font-medium transition-colors ${
                evaluatorType === "student"
                  ? "bg-card text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              นักเรียนประเมินตนเอง
            </button>
            <button
              type="button"
              onClick={() => setEvaluatorType("parent")}
              className={`rounded-lg px-3 py-1 text-xs font-medium transition-colors ${
                evaluatorType === "parent"
                  ? "bg-card text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              ผู้ปกครองประเมิน
            </button>
          </div>
        </div>
      </div>

      <ActionFeedback result={result} />

      {/* Live Preview Score Card */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs flex flex-col justify-between">
          <div>
            <span className="text-xs font-medium text-muted-foreground">ความคืบหน้าการตอบ</span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-bold text-foreground">{answeredCount}</span>
              <span className="text-xs text-muted-foreground">/ 25 ข้อ</span>
            </div>
            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${(answeredCount / 25) * 100}%` }}
              />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground pt-3 border-t border-border">
            <span>{isComplete ? "ตอบครบถ้วนแล้ว" : "ยังตอบไม่ครบทุกข้อ"}</span>
            <button
              type="button"
              onClick={() => fillSampleAnswers("normal")}
              className="text-primary hover:underline text-xs"
            >
              กรอกตัวอย่างปกติ
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs flex flex-col justify-between">
          <div>
            <span className="text-xs font-medium text-muted-foreground">คะแนนรวมความยากลำบาก</span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-bold text-foreground">
                {liveResult.totalDifficultiesScore}
              </span>
              <span className="text-xs text-muted-foreground">/ 40 คะแนน</span>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              เกณฑ์: 0-15 ปกติ · 16-18 เสี่ยง · 19-40 มีปัญหา
            </p>
          </div>
          <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
            <span className="text-xs text-muted-foreground">ระดับผลการประเมิน:</span>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${overallBadge.color}`}>
              {overallBadge.text}
            </span>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-2">
          <span className="text-xs font-medium text-muted-foreground">คะแนนแยกตาม 5 มิติ</span>
          <div className="space-y-1.5 text-xs">
            {(Object.keys(SDQ_DIMENSIONS) as SdqDimension[]).map((dim) => {
              const score = liveResult.dimensionScores[dim]
              const classification = liveResult.dimensionClassifications[dim]
              const badge = getSdqClassificationLabel(classification)

              return (
                <div key={dim} className="flex items-center justify-between py-0.5">
                  <span className="text-muted-foreground truncate max-w-[130px]">
                    {SDQ_DIMENSIONS[dim].label}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-medium">{score}</span>
                    <span className={`px-1.5 py-0.2 rounded text-xs border ${badge.color}`}>
                      {badge.text}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* 25 Questions List */}
      <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-xs space-y-6">
        <div>
          <h2 className="text-base font-semibold text-foreground">คำถาม 25 ข้อ</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            โปรดเลือกคำตอบที่ตรงกับพฤติกรรมของนักเรียนในช่วง 6 เดือนที่ผ่านมามากที่สุด
          </p>
        </div>

        <div className="divide-y divide-border">
          {SDQ_QUESTIONS.map((q) => {
            const selectedVal = answers[q.id]
            const dimensionInfo = SDQ_DIMENSIONS[q.dimension]

            return (
              <div key={q.id} className="py-4 space-y-2 first:pt-0 last:pb-0">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
                  <div className="flex items-start gap-2">
                    <span className="text-xs font-semibold text-muted-foreground shrink-0 w-6">
                      {q.id}.
                    </span>
                    <p className="text-sm font-medium text-foreground">{q.text}</p>
                  </div>
                  <span className="text-xs text-muted-foreground ml-8 sm:ml-0">
                    {dimensionInfo.label}
                  </span>
                </div>

                <div className="ml-8 grid grid-cols-3 gap-2 max-w-md pt-1">
                  {[
                    { value: 0, label: "ไม่จริง" },
                    { value: 1, label: "จริงบางครั้ง" },
                    { value: 2, label: "จริงแน่นอน" },
                  ].map((option) => {
                    const isSelected = selectedVal === option.value

                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => handleSelectAnswer(q.id, option.value)}
                        className={`rounded-xl border py-2 px-3 text-xs font-medium transition-all ${
                          isSelected
                            ? "border-primary bg-primary text-primary-foreground shadow-xs font-semibold"
                            : "border-border bg-card text-foreground hover:bg-muted/50"
                        }`}
                      >
                        {option.label}
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>

        {/* Submit action */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <span className="text-xs text-muted-foreground">
            {isComplete
              ? "พร้อมบันทึกผลการประเมิน"
              : `กรุณาตอบคำถามอีก ${25 - answeredCount} ข้อ`}
          </span>

          <Button
            type="button"
            onClick={handleSubmit}
            disabled={pending || !isComplete}
            className="gap-2"
          >
            {pending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            {pending ? "กำลังบันทึก..." : "บันทึกผลการประเมิน SDQ"}
          </Button>
        </div>
      </div>
    </div>
  )
}
