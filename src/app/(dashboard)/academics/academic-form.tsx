"use client"

import { useMemo, useState, useTransition } from "react"
import { Loader2, Save, Search } from "lucide-react"
import { useRouter } from "next/navigation"

import { upsertAcademicScores } from "@/app/actions/academic.actions"
import { ActionFeedback } from "@/components/forms"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { ActionResult } from "@/lib/server/action-result"

type Student = {
  id: string
  name: string
}

type Subject = {
  id: string
  subject_id: string
  name: string
  code: string
}

type InitialScore = {
  student_id: string
  classroom_subject_id: string
  classwork_score: number | null
  midterm_score: number | null
  final_score: number | null
  remark: string | null
}

type Semester = {
  id: string
  name: string
  is_current: boolean
}

type AcademicFormProps = {
  classroom: { id: string; name: string }
  students: Student[]
  subjects: Subject[]
  initialScores: InitialScore[]
  semesters: Semester[]
  currentSemesterId: string
}

type ScoreField = "classwork_score" | "midterm_score" | "final_score"

type ScoreEntry = {
  classwork_score: string
  midterm_score: string
  final_score: string
  remark: string
}

type RowSummary = {
  total: number | null
  grade: string
  error: string | null
}

const scoreFields: Array<{ key: ScoreField; label: string }> = [
  { key: "classwork_score", label: "คะแนนเก็บ" },
  { key: "midterm_score", label: "กลางภาค" },
  { key: "final_score", label: "ปลายภาค" },
]

function scoreKey(studentId: string, subjectId: string) {
  return `${studentId}:${subjectId}`
}

function scoreInputValue(value: number | null | undefined) {
  return value == null ? "" : String(value)
}

function createInitialScoreData(students: Student[], subjects: Subject[], scores: InitialScore[]) {
  const scoreMap = new Map(
    scores.map((score) => [scoreKey(score.student_id, score.classroom_subject_id), score]),
  )
  const data: Record<string, ScoreEntry> = {}

  for (const student of students) {
    for (const subject of subjects) {
      const score = scoreMap.get(scoreKey(student.id, subject.id))
      data[scoreKey(student.id, subject.id)] = {
        classwork_score: scoreInputValue(score?.classwork_score),
        midterm_score: scoreInputValue(score?.midterm_score),
        final_score: scoreInputValue(score?.final_score),
        remark: score?.remark ?? "",
      }
    }
  }

  return data
}

function numericScore(value: string) {
  if (value.trim() === "") return 0
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

function rowSummary(entry: ScoreEntry): RowSummary {
  const values = scoreFields.map(({ key }) => numericScore(entry[key]))
  const hasInvalidValue = values.some((value) => value == null)
  const hasNegativeValue = values.some((value) => value != null && value < 0)
  const hasTooLargeValue = values.some((value) => value != null && value > 100)

  if (hasInvalidValue) {
    return { total: null, grade: "-", error: "คะแนนต้องเป็นตัวเลข" }
  }
  if (hasNegativeValue) {
    return { total: null, grade: "-", error: "คะแนนต้องไม่น้อยกว่า 0" }
  }
  if (hasTooLargeValue) {
    return { total: null, grade: "-", error: "คะแนนแต่ละส่วนต้องไม่เกิน 100" }
  }

  const validValues = values.filter((value): value is number => value !== null)
  const total = validValues.reduce((sum, value) => sum + value, 0)
  if (total > 100) {
    return { total, grade: "-", error: "คะแนนรวมต้องไม่เกิน 100" }
  }

  const hasEnteredScore = scoreFields.some(({ key }) => entry[key].trim() !== "")
  return { total, grade: hasEnteredScore ? gradeFromTotal(total) : "-", error: null }
}

function gradeFromTotal(total: number) {
  if (total >= 80) return "4"
  if (total >= 75) return "3.5"
  if (total >= 70) return "3"
  if (total >= 65) return "2.5"
  if (total >= 60) return "2"
  if (total >= 55) return "1.5"
  if (total >= 50) return "1"
  return "0"
}

function gradeClass(grade: string) {
  if (grade === "-" || grade === "0") return "text-muted-foreground"
  if (grade === "4" || grade === "3.5" || grade === "3") return "text-emerald-700"
  return "text-amber-700"
}

export function AcademicForm({
  students,
  subjects,
  initialScores,
  semesters,
  currentSemesterId,
}: AcademicFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [searchTerm, setSearchTerm] = useState("")
  const [isDirty, setIsDirty] = useState(false)
  const [result, setResult] = useState<ActionResult<{ count: number }> | null>(null)
  const [scoreData, setScoreData] = useState<Record<string, ScoreEntry>>(() =>
    createInitialScoreData(students, subjects, initialScores),
  )

  const filteredStudents = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLocaleLowerCase("th-TH")
    if (!normalizedSearch) return students
    return students.filter((student) => student.name.toLocaleLowerCase("th-TH").includes(normalizedSearch))
  }, [searchTerm, students])

  const updateScore = (studentId: string, subjectId: string, field: ScoreField, value: string) => {
    const key = scoreKey(studentId, subjectId)
    setScoreData((previous) => ({
      ...previous,
      [key]: { ...previous[key], [field]: value },
    }))
    setIsDirty(true)
    setResult(null)
  }

  const updateRemark = (studentId: string, subjectId: string, value: string) => {
    const key = scoreKey(studentId, subjectId)
    setScoreData((previous) => ({
      ...previous,
      [key]: { ...previous[key], remark: value },
    }))
    setIsDirty(true)
    setResult(null)
  }

  const handleSemesterChange = (semesterId: string) => {
    if (isDirty && !window.confirm("มีคะแนนที่ยังไม่ได้บันทึก ต้องการเปลี่ยนภาคเรียนหรือไม่")) return
    router.push(`/academics?semesterId=${encodeURIComponent(semesterId)}`)
  }

  const handleSave = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const invalidRow = students
      .flatMap((student) => subjects.map((subject) => scoreData[scoreKey(student.id, subject.id)]))
      .map(rowSummary)
      .find((summary) => summary.error)

    if (invalidRow?.error) {
      setResult({ ok: false, code: "VALIDATION_ERROR", message: invalidRow.error })
      return
    }

    const records = students.flatMap((student) =>
      subjects.map((subject) => {
        const entry = scoreData[scoreKey(student.id, subject.id)]
        return {
          student_id: student.id,
          classroom_subject_id: subject.id,
          classwork_score: numericScore(entry.classwork_score) ?? 0,
          midterm_score: numericScore(entry.midterm_score) ?? 0,
          final_score: numericScore(entry.final_score) ?? 0,
          remark: entry.remark.trim() || null,
        }
      }),
    )

    setResult(null)
    startTransition(async () => {
      try {
        const nextResult = await upsertAcademicScores(currentSemesterId, records)
        setResult(nextResult)
        if (nextResult.ok) setIsDirty(false)
      } catch {
        setResult({
          ok: false,
          code: "INTERNAL_ERROR",
          message: "ไม่สามารถบันทึกคะแนนได้ กรุณาลองใหม่",
        })
      }
    })
  }

  const feedback = isPending
    ? ({ ok: true, message: "กำลังบันทึกคะแนน..." } satisfies ActionResult<unknown>)
    : result

  return (
    <form className="space-y-5" onSubmit={handleSave}>
      <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4 shadow-sm lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="space-y-1.5">
            <label htmlFor="academic-semester" className="text-xs font-semibold text-muted-foreground">
              ภาคเรียน
            </label>
            <select
              id="academic-semester"
              value={currentSemesterId}
              onChange={(event) => handleSemesterChange(event.target.value)}
              disabled={isPending}
              className="h-9 min-w-56 rounded-lg border border-input bg-background px-3 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {semesters.map((semester) => (
                <option key={semester.id} value={semester.id}>
                  {semester.name}{semester.is_current ? " (ปัจจุบัน)" : ""}
                </option>
              ))}
            </select>
          </div>

          <div className="relative w-full sm:w-72">
            <label htmlFor="academic-student-search" className="sr-only">
              ค้นหานักเรียน
            </label>
            <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-2.5 size-4 text-muted-foreground" />
            <Input
              id="academic-student-search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="ค้นหานักเรียน..."
              className="h-9 pl-9"
            />
          </div>
        </div>

        <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
          <div className="min-h-5 text-xs text-muted-foreground" aria-live="polite">
            {isPending ? "กำลังบันทึก..." : isDirty ? "มีการแก้ไขที่ยังไม่ได้บันทึก" : "ข้อมูลล่าสุดถูกบันทึกแล้ว"}
          </div>
          <Button type="submit" disabled={isPending || students.length === 0 || subjects.length === 0} className="gap-2">
            {isPending ? <Loader2 aria-hidden="true" className="size-4 animate-spin motion-reduce:animate-none" /> : <Save aria-hidden="true" className="size-4" />}
            {isPending ? "กำลังบันทึก..." : "บันทึกคะแนน"}
          </Button>
        </div>
      </div>

      <ActionFeedback result={feedback} />

      {students.length === 0 || subjects.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card px-6 py-12 text-center text-sm text-muted-foreground">
          ยังไม่มีรายชื่อนักเรียนหรือรายวิชาในภาคเรียนนี้
        </div>
      ) : (
        <>
          <div className="space-y-3 md:hidden">
            {filteredStudents.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border bg-card px-4 py-10 text-center text-sm text-muted-foreground">
                ไม่พบรายชื่อนักเรียนที่ค้นหา
              </div>
            ) : filteredStudents.map((student, studentIndex) => (
              <article key={student.id} className="rounded-xl border border-border bg-card p-4 shadow-sm">
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">นักเรียนลำดับ {studentIndex + 1}</p>
                    <h3 className="truncate font-medium text-foreground">{student.name}</h3>
                  </div>
                  <span className="shrink-0 rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">{subjects.length} วิชา</span>
                </div>
                <div className="space-y-4">
                  {subjects.map((subject, subjectIndex) => {
                    const key = scoreKey(student.id, subject.id)
                    const entry = scoreData[key]
                    const summary = rowSummary(entry)
                    const rowNumber = studentIndex * subjects.length + subjectIndex + 1

                    return (
                      <div key={key} className="border-t border-border pt-4 first:border-t-0 first:pt-0">
                        <div className="mb-3 flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-xs text-muted-foreground">รายการ {rowNumber}</p>
                            <p className="font-medium text-foreground">{subject.name}</p>
                            <p className="text-xs text-muted-foreground">{subject.code}</p>
                          </div>
                          <div className="shrink-0 text-right">
                            <p className="text-xs text-muted-foreground">รวม / เกรด</p>
                            <p className={`font-semibold tabular-nums ${summary.error ? "text-red-700" : "text-foreground"}`}>
                              {summary.total == null ? "-" : summary.total.toFixed(1)} <span className={gradeClass(summary.grade)}>({summary.grade})</span>
                            </p>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                          {scoreFields.map((field) => {
                            const inputId = `${key}-${field.key}-mobile`
                            return (
                              <label key={field.key} htmlFor={inputId} className="space-y-1.5 text-sm">
                                <span className="block text-xs font-medium text-muted-foreground">{field.label}</span>
                                <Input
                                  id={inputId}
                                  type="number"
                                  inputMode="decimal"
                                  min={0}
                                  max={100}
                                  step="0.1"
                                  value={entry[field.key]}
                                  onChange={(event) => updateScore(student.id, subject.id, field.key, event.target.value)}
                                  aria-invalid={Boolean(summary.error) || undefined}
                                  className="h-10 text-center tabular-nums"
                                  placeholder="-"
                                />
                              </label>
                            )
                          })}
                        </div>
                        {summary.error ? <p className="mt-2 text-xs leading-4 text-red-700" role="alert">{summary.error}</p> : null}
                        <label htmlFor={`${key}-remark-mobile`} className="mt-3 block space-y-1.5 text-sm">
                          <span className="block text-xs font-medium text-muted-foreground">หมายเหตุ</span>
                          <Input
                            id={`${key}-remark-mobile`}
                            value={entry.remark}
                            onChange={(event) => updateRemark(student.id, subject.id, event.target.value)}
                            placeholder="เพิ่มหมายเหตุ"
                            className="h-10"
                          />
                        </label>
                      </div>
                    )
                  })}
                </div>
              </article>
            ))}
          </div>

          <div className="hidden overflow-x-auto rounded-xl border border-border bg-card shadow-sm md:block">
          <table className="w-full min-w-[1180px] border-collapse text-sm">
            <caption className="sr-only">ตารางบันทึกผลการเรียนรายนักเรียนและรายวิชา</caption>
            <thead>
              <tr className="border-b border-border bg-muted/40 text-left text-xs font-semibold text-muted-foreground">
                <th className="w-14 px-4 py-3 text-center">#</th>
                <th className="min-w-56 px-4 py-3">นักเรียน</th>
                <th className="min-w-48 px-4 py-3">วิชา</th>
                {scoreFields.map((field) => (
                  <th key={field.key} className="w-32 px-3 py-3 text-center">{field.label}</th>
                ))}
                <th className="w-28 px-3 py-3 text-center">รวม</th>
                <th className="w-24 px-3 py-3 text-center">เกรด</th>
                <th className="min-w-56 px-4 py-3">หมายเหตุ</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-sm text-muted-foreground">
                    ไม่พบรายชื่อนักเรียนที่ค้นหา
                  </td>
                </tr>
              ) : (
                filteredStudents.flatMap((student, studentIndex) =>
                  subjects.map((subject, subjectIndex) => {
                    const key = scoreKey(student.id, subject.id)
                    const entry = scoreData[key]
                    const summary = rowSummary(entry)
                    const rowNumber = studentIndex * subjects.length + subjectIndex + 1

                    return (
                      <tr key={key} className="border-b border-border align-top last:border-0 hover:bg-muted/20">
                        <td className="px-4 py-3 text-center text-xs text-muted-foreground">{rowNumber}</td>
                        <td className="px-4 py-3 font-medium text-foreground">{student.name}</td>
                        <td className="px-4 py-3">
                          <div className="font-medium text-foreground">{subject.name}</div>
                          <div className="mt-0.5 text-xs text-muted-foreground">{subject.code}</div>
                        </td>
                        {scoreFields.map((field) => {
                          const inputId = `${key}-${field.key}`
                          return (
                            <td key={field.key} className="px-3 py-3">
                              <label htmlFor={inputId} className="sr-only">{`${field.label} ${student.name} ${subject.name}`}</label>
                              <Input
                                id={inputId}
                                type="number"
                                inputMode="decimal"
                                min={0}
                                max={100}
                                step="0.1"
                                value={entry[field.key]}
                                onChange={(event) => updateScore(student.id, subject.id, field.key, event.target.value)}
                                aria-invalid={Boolean(summary.error) || undefined}
                                className="h-9 text-center tabular-nums"
                                placeholder="-"
                              />
                            </td>
                          )
                        })}
                        <td className="px-3 py-3 text-center">
                          <div className={`font-semibold tabular-nums ${summary.error ? "text-red-700" : "text-foreground"}`}>
                            {summary.total == null ? "-" : summary.total.toFixed(1)}
                          </div>
                          {summary.error ? <div className="mt-1 max-w-28 text-xs leading-4 text-red-700">{summary.error}</div> : null}
                        </td>
                        <td className={`px-3 py-3 text-center font-semibold tabular-nums ${gradeClass(summary.grade)}`}>
                          {summary.grade}
                        </td>
                        <td className="px-4 py-3">
                          <label htmlFor={`${key}-remark`} className="sr-only">{`หมายเหตุ ${student.name} ${subject.name}`}</label>
                          <Input
                            id={`${key}-remark`}
                            value={entry.remark}
                            onChange={(event) => updateRemark(student.id, subject.id, event.target.value)}
                            placeholder="เพิ่มหมายเหตุ"
                            className="h-9"
                          />
                        </td>
                      </tr>
                    )
                  }),
                )
              )}
            </tbody>
          </table>
          </div>
        </>
      )}
    </form>
  )
}
