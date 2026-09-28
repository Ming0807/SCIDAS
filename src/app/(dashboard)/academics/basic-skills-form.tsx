"use client"

import { useMemo, useState, useTransition } from "react"
import { Loader2, Save, Search } from "lucide-react"

import { upsertBasicSkills, type BasicSkillInput } from "@/app/actions/basic-skills.actions"
import { ActionFeedback } from "@/components/forms"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { ActionResult } from "@/lib/server/action-result"
import {
  SKILL_LEVELS,
  getSkillLevelLabel,
  type SkillLevel,
} from "@/lib/basic-skills-constants"
import type { BasicSkillRow } from "@/lib/server/basic-skills-read-models"

type Student = {
  id: string
  name: string
}

type SkillField = "reading" | "writing" | "math"

const skillFields: Array<{ key: SkillField; label: string }> = [
  { key: "reading", label: "การอ่าน" },
  { key: "writing", label: "การเขียน" },
  { key: "math", label: "การคิดเลข" },
]

type SkillEntry = {
  reading_level: SkillLevel
  reading_score: string
  writing_level: SkillLevel
  writing_score: string
  math_level: SkillLevel
  math_score: string
  remark: string
}

const defaultEntry: SkillEntry = {
  reading_level: "good",
  reading_score: "",
  writing_level: "good",
  writing_score: "",
  math_level: "good",
  math_score: "",
  remark: "",
}

function toScoreInput(value: number | null | undefined) {
  return value == null ? "" : String(value)
}

export function BasicSkillsForm({
  students,
  initialSkills,
  semesterId,
  semesters,
}: {
  students: Student[]
  initialSkills: BasicSkillRow[]
  semesterId: string
  semesters: Array<{ id: string; name: string; is_current: boolean }>
}) {
  const [query, setQuery] = useState("")
  const [pending, startTransition] = useTransition()
  const [result, setResult] = useState<ActionResult<{ count: number }> | null>(null)

  const [entries, setEntries] = useState<Record<string, SkillEntry>>(() => {
    const map = new Map(initialSkills.map((s) => [s.studentId, s]))
    const data: Record<string, SkillEntry> = {}
    for (const student of students) {
      const saved = map.get(student.id)
      data[student.id] = saved
        ? {
            reading_level: saved.readingLevel,
            reading_score: toScoreInput(saved.readingScore),
            writing_level: saved.writingLevel,
            writing_score: toScoreInput(saved.writingScore),
            math_level: saved.mathLevel,
            math_score: toScoreInput(saved.mathScore),
            remark: saved.remark ?? "",
          }
        : { ...defaultEntry }
    }
    return data
  })

  const filteredStudents = useMemo(() => {
    const q = query.trim()
    if (!q) return students
    return students.filter((s) => s.name.includes(q))
  }, [students, query])

  const needsHelpCount = useMemo(
    () =>
      students.filter((s) => {
        const entry = entries[s.id]
        if (!entry) return false
        return (
          entry.reading_level === "poor" ||
          entry.reading_level === "critical" ||
          entry.writing_level === "poor" ||
          entry.writing_level === "critical" ||
          entry.math_level === "poor" ||
          entry.math_level === "critical"
        )
      }).length,
    [students, entries],
  )

  function updateEntry(studentId: string, patch: Partial<SkillEntry>) {
    setEntries((prev) => ({
      ...prev,
      [studentId]: { ...(prev[studentId] ?? { ...defaultEntry }), ...patch },
    }))
  }

  function handleSave() {
    const records: BasicSkillInput[] = students.map((student) => {
      const entry = entries[student.id] ?? { ...defaultEntry }
      const parseScore = (raw: string) => (raw.trim() === "" ? null : Number(raw))
      return {
        student_id: student.id,
        reading_level: entry.reading_level,
        reading_score: parseScore(entry.reading_score),
        writing_level: entry.writing_level,
        writing_score: parseScore(entry.writing_score),
        math_level: entry.math_level,
        math_score: parseScore(entry.math_score),
        remark: entry.remark.trim() || null,
      }
    })

    const invalid = records.some((record) =>
      [record.reading_score ?? null, record.writing_score ?? null, record.math_score ?? null].some(
        (score) => score !== null && (!Number.isFinite(score) || score < 0 || score > 100),
      ),
    )
    if (invalid) {
      setResult({
        ok: false,
        code: "VALIDATION_ERROR",
        message: "คะแนนต้องเป็นตัวเลขระหว่าง 0-100",
      })
      return
    }

    startTransition(async () => {
      const res = await upsertBasicSkills(semesterId, records)
      setResult(res)
    })
  }

  const currentSemester = semesters.find((s) => s.id === semesterId)

  return (
    <section aria-label="บันทึกทักษะพื้นฐาน" className="rounded-xl border border-border bg-card shadow-sm">
      <div className="flex flex-col gap-3 border-b border-border p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-foreground">ทักษะพื้นฐาน (อ่าน-เขียน-คิดเลข)</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {currentSemester?.name ?? "เลือกภาคเรียน"} • นักเรียน {students.length} คน
            {needsHelpCount > 0 ? ` • ต้องช่วยเสริม ${needsHelpCount} คน` : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ค้นหาชื่อนักเรียน..."
              className="h-8 w-48 pl-8 text-xs"
            />
          </div>
          <Button onClick={handleSave} disabled={pending || students.length === 0} size="sm" className="gap-1.5">
            {pending ? <Loader2 className="size-3.5 animate-spin" /> : <Save className="size-3.5" />}
            {pending ? "กำลังบันทึก..." : "บันทึกทักษะ"}
          </Button>
        </div>
      </div>

      <div className="p-5">
        <ActionFeedback result={result} />
      </div>

      {filteredStudents.length === 0 ? (
        <p className="px-5 pb-5 text-sm text-muted-foreground">ไม่พบนักเรียนตามคำค้น</p>
      ) : (
        <>
          {/* Mobile cards */}
          <div className="space-y-3 px-5 pb-2 md:hidden">
            {filteredStudents.map((student) => {
              const entry = entries[student.id] ?? { ...defaultEntry }
              return (
                <article key={student.id} className="rounded-xl border border-border bg-background p-4">
                  <p className="text-sm font-semibold text-foreground">{student.name}</p>
                  <div className="mt-3 space-y-3">
                    {skillFields.map((field) => (
                      <div key={field.key} className="space-y-1.5">
                        <span className="block text-xs font-medium text-muted-foreground">
                          {field.label} (ระดับ/คะแนน)
                        </span>
                        <div className="flex items-center gap-1.5">
                          <select
                            aria-label={`${field.label}ของ${student.name}`}
                            value={entry[`${field.key}_level` as keyof SkillEntry] as string}
                            onChange={(e) =>
                              updateEntry(student.id, {
                                [`${field.key}_level`]: e.target.value as SkillLevel,
                              } as Partial<SkillEntry>)
                            }
                            className="h-9 flex-1 rounded-lg border border-input bg-background px-2 text-xs font-medium"
                          >
                            {SKILL_LEVELS.map((level) => (
                              <option key={level} value={level}>
                                {getSkillLevelLabel(level)}
                              </option>
                            ))}
                          </select>
                          <Input
                            aria-label={`คะแนน${field.label}ของ${student.name}`}
                            value={entry[`${field.key}_score` as keyof SkillEntry] as string}
                            onChange={(e) =>
                              updateEntry(student.id, {
                                [`${field.key}_score`]: e.target.value,
                              } as Partial<SkillEntry>)
                            }
                            inputMode="decimal"
                            placeholder="0-100"
                            className="h-9 w-24 text-xs"
                          />
                        </div>
                      </div>
                    ))}
                    <div className="space-y-1.5">
                      <span className="block text-xs font-medium text-muted-foreground">หมายเหตุ</span>
                      <Input
                        aria-label={`หมายเหตุทักษะของ${student.name}`}
                        value={entry.remark}
                        onChange={(e) => updateEntry(student.id, { remark: e.target.value })}
                        placeholder="เช่น อ่านคล่องขึ้น"
                        className="h-9 text-xs"
                      />
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
          {/* Desktop table */}
          <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[760px] border-collapse text-left">
            <thead>
              <tr className="border-y border-border bg-muted/30 text-xs font-semibold text-muted-foreground">
                <th className="px-5 py-3">นักเรียน</th>
                {skillFields.map((field) => (
                  <th key={field.key} className="px-3 py-3">
                    {field.label} (ระดับ/คะแนน)
                  </th>
                ))}
                <th className="px-5 py-3">หมายเหตุ</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {filteredStudents.map((student) => {
                const entry = entries[student.id] ?? { ...defaultEntry }
                return (
                  <tr key={student.id} className="border-b border-border transition-colors hover:bg-muted/30">
                    <td className="px-5 py-3 font-medium text-foreground">{student.name}</td>
                    {skillFields.map((field) => (
                      <td key={field.key} className="px-3 py-3">
                        <div className="flex items-center gap-1.5">
                          <select
                            aria-label={`${field.label}ของ${student.name}`}
                            value={entry[`${field.key}_level` as keyof SkillEntry] as string}
                            onChange={(e) =>
                              updateEntry(student.id, {
                                [`${field.key}_level`]: e.target.value as SkillLevel,
                              } as Partial<SkillEntry>)
                            }
                            className="h-8 rounded-lg border border-input bg-background px-2 text-xs font-medium"
                          >
                            {SKILL_LEVELS.map((level) => (
                              <option key={level} value={level}>
                                {getSkillLevelLabel(level)}
                              </option>
                            ))}
                          </select>
                          <Input
                            aria-label={`คะแนน${field.label}ของ${student.name}`}
                            value={entry[`${field.key}_score` as keyof SkillEntry] as string}
                            onChange={(e) =>
                              updateEntry(student.id, {
                                [`${field.key}_score`]: e.target.value,
                              } as Partial<SkillEntry>)
                            }
                            inputMode="decimal"
                            placeholder="0-100"
                            className="h-8 w-20 text-xs"
                          />
                        </div>
                      </td>
                    ))}
                    <td className="px-5 py-3">
                      <Input
                        aria-label={`หมายเหตุทักษะของ${student.name}`}
                        value={entry.remark}
                        onChange={(e) => updateEntry(student.id, { remark: e.target.value })}
                        placeholder="เช่น อ่านคล่องขึ้น"
                        className="h-8 min-w-36 text-xs"
                      />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          </div>
        </>
      )}

      <p className="px-5 py-4 text-xs text-muted-foreground">
        เกณฑ์ระดับ: ดีมาก / ดี / พอใช้ / ปรับปรุง / ไม่ผ่าน — นักเรียนที่ได้ “ปรับปรุง” หรือ “ไม่ผ่าน” จะถูกนับเป็นปัจจัยเสี่ยงทักษะพื้นฐานอัตโนมัติ
      </p>
    </section>
  )
}
