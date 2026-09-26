"use client"

import { useMemo, useState, useTransition } from "react"
import { Loader2, Plus, Save, Search } from "lucide-react"

import {
  createAssignmentAction,
  updateSubmissionStatusAction,
} from "@/app/actions/assignment.actions"
import { ActionFeedback } from "@/components/forms"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { ActionResult } from "@/lib/server/action-result"
import {
  SUBMISSION_STATUSES,
  getSubmissionStatusLabel,
  type SubmissionStatus,
} from "@/lib/assignment-constants"
import type {
  AssignmentItem,
  AssignmentSubjectOption,
} from "@/lib/server/assignment-read-models"

type StudentOption = {
  id: string
  name: string
  classroom: string | null
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10)
}

function RowEditor({ item }: { item: AssignmentItem }) {
  const [status, setStatus] = useState<SubmissionStatus>(item.status)
  const [score, setScore] = useState(item.score != null ? String(item.score) : "")
  const [pending, startTransition] = useTransition()
  const [message, setMessage] = useState<string | null>(null)
  const [isError, setIsError] = useState(false)

  function handleSave() {
    setMessage(null)
    setIsError(false)
    const parsedScore = score.trim() === "" ? null : Number(score)
    if (parsedScore !== null && (!Number.isFinite(parsedScore) || parsedScore < 0 || parsedScore > 1000)) {
      setIsError(true)
      setMessage("คะแนนต้องอยู่ระหว่าง 0-1000")
      return
    }
    startTransition(async () => {
      const res = await updateSubmissionStatusAction({
        id: item.id,
        status,
        submitted_date: status === "not_submitted" ? null : todayISO(),
        score: parsedScore,
      })
      setIsError(!res.ok)
      setMessage(res.message)
    })
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-1.5">
        <select
          aria-label={`สถานะงาน${item.title}ของ${item.studentName}`}
          value={status}
          onChange={(e) => setStatus(e.target.value as SubmissionStatus)}
          className="h-8 rounded-lg border border-input bg-background px-2 text-xs font-medium"
        >
          {SUBMISSION_STATUSES.map((s) => (
            <option key={s} value={s}>
              {getSubmissionStatusLabel(s)}
            </option>
          ))}
        </select>
        <Input
          aria-label={`คะแนนงาน${item.title}ของ${item.studentName}`}
          value={score}
          onChange={(e) => setScore(e.target.value)}
          inputMode="decimal"
          placeholder="คะแนน"
          className="h-8 w-20 text-xs"
        />
        <Button onClick={handleSave} disabled={pending} size="sm" variant="outline" className="h-8 gap-1 text-xs">
          {pending ? <Loader2 className="size-3 animate-spin" /> : <Save className="size-3" />}
          บันทึก
        </Button>
      </div>
      {message ? (
        <p className={`text-xs ${isError ? "text-destructive" : "text-emerald-600"}`}>{message}</p>
      ) : null}
    </div>
  )
}

export function AssignmentManager({
  recent,
  subjects,
  students,
  canCreate,
}: {
  recent: AssignmentItem[]
  subjects: AssignmentSubjectOption[]
  students: StudentOption[]
  canCreate: boolean
}) {
  const [showForm, setShowForm] = useState(false)
  const [subjectId, setSubjectId] = useState(subjects[0]?.id ?? "")
  const [title, setTitle] = useState("")
  const [dueDate, setDueDate] = useState(todayISO())
  const [studentQuery, setStudentQuery] = useState("")
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [pending, startTransition] = useTransition()
  const [result, setResult] = useState<ActionResult<{ count: number }> | null>(null)

  const filteredStudents = useMemo(() => {
    const q = studentQuery.trim()
    if (!q) return students.slice(0, 60)
    return students.filter((s) => s.name.includes(q) || (s.classroom ?? "").includes(q)).slice(0, 60)
  }, [students, studentQuery])

  function toggleStudent(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function handleCreate() {
    setResult(null)
    startTransition(async () => {
      const res = await createAssignmentAction({
        classroom_subject_id: subjectId,
        title,
        due_date: dueDate,
        student_ids: [...selectedIds],
      })
      setResult(res)
      if (res.ok) {
        setTitle("")
        setSelectedIds(new Set())
        setShowForm(false)
      }
    })
  }

  return (
    <div className="space-y-4">
      {canCreate ? (
        <div>
          <Button
            onClick={() => setShowForm((v) => !v)}
            variant={showForm ? "outline" : "default"}
            size="sm"
            className="gap-1.5"
          >
            <Plus className="size-3.5" />
            {showForm ? "ซ่อนฟอร์มมอบหมายงาน" : "มอบหมายงานใหม่"}
          </Button>

          {showForm ? (
            <div className="mt-3 space-y-3 rounded-xl border border-border bg-muted/20 p-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="assign-subject">วิชา</Label>
                  <select
                    id="assign-subject"
                    value={subjectId}
                    onChange={(e) => setSubjectId(e.target.value)}
                    className="h-9 w-full rounded-lg border border-input bg-background px-2.5 text-sm"
                  >
                    {subjects.length === 0 ? <option value="">ยังไม่มีวิชาที่รับผิดชอบ</option> : null}
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.subjectName} ({s.subjectCode}) • {s.classroomName}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="assign-due">กำหนดส่ง</Label>
                  <Input
                    id="assign-due"
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="h-9 text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="assign-title">ชื่องาน</Label>
                <Input
                  id="assign-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="เช่น แบบฝึกหัดบทที่ 3 หน้า 45"
                  className="h-9 text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <Label>เลือกนักเรียน ({selectedIds.size} คน)</Label>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={studentQuery}
                    onChange={(e) => setStudentQuery(e.target.value)}
                    placeholder="ค้นหาชื่อหรือห้อง..."
                    className="h-8 pl-8 text-xs"
                  />
                </div>
                <div className="max-h-44 space-y-1 overflow-y-auto rounded-lg border border-border bg-card p-2">
                  {filteredStudents.length === 0 ? (
                    <p className="p-2 text-xs text-muted-foreground">ไม่พบนักเรียน</p>
                  ) : (
                    filteredStudents.map((s) => (
                      <label key={s.id} className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-xs hover:bg-muted/50">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(s.id)}
                          onChange={() => toggleStudent(s.id)}
                          className="size-3.5 accent-primary"
                        />
                        <span className="font-medium text-foreground">{s.name}</span>
                        {s.classroom ? <span className="text-muted-foreground">• {s.classroom}</span> : null}
                      </label>
                    ))
                  )}
                </div>
              </div>

              <ActionFeedback result={result} />

              <Button onClick={handleCreate} disabled={pending || !subjectId} size="sm" className="gap-1.5">
                {pending ? <Loader2 className="size-3.5 animate-spin" /> : <Plus className="size-3.5" />}
                {pending ? "กำลังมอบหมาย..." : `มอบหมายให้ ${selectedIds.size} คน`}
              </Button>
            </div>
          ) : null}
        </div>
      ) : null}

      {recent.length === 0 ? (
        <p className="text-sm text-muted-foreground">ยังไม่มีงานที่มอบหมาย</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full min-w-[720px] border-collapse text-left">
            <thead>
              <tr className="bg-muted/30 text-xs font-semibold text-muted-foreground">
                <th className="px-4 py-2.5">งาน / วิชา</th>
                <th className="px-4 py-2.5">นักเรียน</th>
                <th className="px-4 py-2.5">กำหนดส่ง</th>
                <th className="px-4 py-2.5">บันทึกการส่ง</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {recent.map((item) => (
                <tr key={item.id} className="border-t border-border hover:bg-muted/20">
                  <td className="px-4 py-3">
                    <p className="font-medium text-foreground">{item.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.subjectName} ({item.subjectCode})
                      {item.maxScore != null ? ` • เต็ม ${item.maxScore}` : ""}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-foreground">{item.studentName}</p>
                    {item.classroomName ? <p className="text-xs text-muted-foreground">{item.classroomName}</p> : null}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{item.dueDate}</td>
                  <td className="px-4 py-3">
                    {canCreate ? (
                      <RowEditor item={item} />
                    ) : (
                      <span className="text-xs font-medium text-foreground">
                        {getSubmissionStatusLabel(item.status)}
                        {item.score != null ? ` • ${item.score}` : ""}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
