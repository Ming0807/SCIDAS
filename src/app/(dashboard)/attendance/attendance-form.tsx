"use client"

import { useEffect, useMemo, useState, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  AlertTriangle,
  CheckCircle2,
  Loader2,
  RotateCw,
  Save,
  Search,
} from "lucide-react"
import { upsertAttendance, type AttendanceInput } from "@/app/actions/attendance.actions"
import { StudentIdentity } from "@/components/dashboard"
import { ActionFeedback } from "@/components/forms/action-feedback"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { ActionResult } from "@/lib/server/action-result"

import { useRealtime } from "@/components/providers/realtime-provider"
import type {
  AttendanceRiskLevel,
  AttendanceStatus,
  MonthlyAttendanceSummary,
} from "@/lib/attendance-constants"

import { AttendanceAnalyticsBar } from "./_components/attendance-analytics-bar"
import { AttendancePrintableDialog } from "./_components/attendance-printable-dialog"

type Student = { id: string; name: string; studentCode?: string }
type InitialRecord = { student_id: string; status: AttendanceStatus; check_in_time: string | null; remark: string | null }
type AttendanceFormProps = {
  classroom: { id: string; name: string }
  classrooms?: Array<{ id: string; name: string }>
  students: Student[]
  initialRecords: InitialRecord[]
  dateStr: string
  monthlySummary?: MonthlyAttendanceSummary
}
type Entry = { status: AttendanceStatus; checkInTime: string; remark: string }

function AttendanceStatusButtons({
  studentName,
  value,
  onChange,
  size = "default",
}: {
  studentName: string
  value: AttendanceStatus
  onChange: (status: AttendanceStatus) => void
  size?: "default" | "sm"
}) {
  const configs: Array<{
    status: AttendanceStatus
    label: string
    activeClass: string
    inactiveClass: string
  }> = [
    {
      status: "present",
      label: "มา",
      activeClass: "bg-emerald-600 text-white font-semibold shadow-xs",
      inactiveClass: "text-muted-foreground hover:bg-emerald-500/10 hover:text-emerald-700 dark:hover:text-emerald-300",
    },
    {
      status: "absent",
      label: "ขาด",
      activeClass: "bg-rose-600 text-white font-semibold shadow-xs",
      inactiveClass: "text-muted-foreground hover:bg-rose-500/10 hover:text-rose-700 dark:hover:text-rose-300",
    },
    {
      status: "late",
      label: "สาย",
      activeClass: "bg-amber-600 text-white font-semibold shadow-xs",
      inactiveClass: "text-muted-foreground hover:bg-amber-500/10 hover:text-amber-700 dark:hover:text-amber-300",
    },
    {
      status: "leave",
      label: "ลา",
      activeClass: "bg-sky-600 text-white font-semibold shadow-xs",
      inactiveClass: "text-muted-foreground hover:bg-sky-500/10 hover:text-sky-700 dark:hover:text-sky-300",
    },
    {
      status: "sick",
      label: "ป่วย",
      activeClass: "bg-purple-600 text-white font-semibold shadow-xs",
      inactiveClass: "text-muted-foreground hover:bg-purple-500/10 hover:text-purple-700 dark:hover:text-purple-300",
    },
  ]

  return (
    <div
      role="radiogroup"
      aria-label={`สถานะของ ${studentName}`}
      className="inline-flex items-center rounded-lg border border-border bg-muted/40 p-0.5"
    >
      {configs.map((c) => {
        const isSelected = value === c.status
        return (
          <button
            key={c.status}
            type="button"
            role="radio"
            aria-checked={isSelected}
            onClick={() => onChange(c.status)}
            className={`rounded-md transition-all ${
              size === "sm" ? "px-2.5 py-1 text-xs" : "px-3 py-1.5 text-xs"
            } ${isSelected ? c.activeClass : c.inactiveClass}`}
          >
            {c.label}
          </button>
        )
      })}
    </div>
  )
}

export function AttendanceForm({
  classroom,
  classrooms = [],
  students,
  initialRecords,
  dateStr,
  monthlySummary,
}: AttendanceFormProps) {
  const router = useRouter()
  const { lastAttendanceChange } = useRealtime()
  const [pending, startTransition] = useTransition()
  const [query, setQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "non_present">("all")
  const [riskFilter, setRiskFilter] = useState<AttendanceRiskLevel | "all">("all")
  const [isPrintOpen, setIsPrintOpen] = useState(false)
  const [date, setDate] = useState(dateStr)
  const [result, setResult] = useState<ActionResult<{ count: number }> | null>(null)
  const [hasExternalUpdate, setHasExternalUpdate] = useState(false)
  const [entries, setEntries] = useState<Record<string, Entry>>(() => Object.fromEntries(students.map((student) => {
    const record = initialRecords.find((item) => item.student_id === student.id)
    return [student.id, { status: record?.status ?? "present", checkInTime: record?.check_in_time?.slice(0, 5) ?? "", remark: record?.remark ?? "" }]
  })))
  const [savedSnapshot, setSavedSnapshot] = useState(() => JSON.stringify(entries))
  const dirty = JSON.stringify(entries) !== savedSnapshot
  const [prevInitialRecords, setPrevInitialRecords] = useState(initialRecords)
  if (prevInitialRecords !== initialRecords) {
    setPrevInitialRecords(initialRecords)
    if (!dirty) {
      const nextEntries = Object.fromEntries(
        students.map((student) => {
          const record = initialRecords.find((item) => item.student_id === student.id)
          return [
            student.id,
            {
              status: record?.status ?? "present",
              checkInTime: record?.check_in_time?.slice(0, 5) ?? "",
              remark: record?.remark ?? "",
            },
          ]
        }),
      )
      setEntries(nextEntries)
      setSavedSnapshot(JSON.stringify(nextEntries))
      setHasExternalUpdate(false)
    }
  }

  // Live count summary
  const counters = useMemo(() => {
    let present = 0
    let absent = 0
    let late = 0
    let leave = 0
    let sick = 0
    for (const student of students) {
      const st = entries[student.id]?.status ?? "present"
      if (st === "present") present++
      else if (st === "absent") absent++
      else if (st === "late") late++
      else if (st === "leave") leave++
      else if (st === "sick") sick++
    }
    return { present, absent, late, leave, sick, total: students.length }
  }, [students, entries])

  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const matchesQuery = student.name.toLocaleLowerCase("th").includes(query.toLocaleLowerCase("th"))
      if (!matchesQuery) return false
      if (statusFilter === "non_present") {
        if (entries[student.id]?.status === "present") return false
      }
      if (riskFilter !== "all" && monthlySummary) {
        const item = monthlySummary.items.find((i) => i.studentId === student.id)
        if (item?.riskLevel !== riskFilter) return false
      }
      return true
    })
  }, [students, query, statusFilter, riskFilter, monthlySummary, entries])

  const updateEntry = (studentId: string, patch: Partial<Entry>) =>
    setEntries((current) => ({ ...current, [studentId]: { ...current[studentId], ...patch } }))

  function markAllPresent() {
    const nextEntries: Record<string, Entry> = {}
    for (const student of students) {
      nextEntries[student.id] = {
        ...entries[student.id],
        status: "present",
      }
    }
    setEntries(nextEntries)
  }

  useEffect(() => {
    if (lastAttendanceChange) {
      if (!dirty) {
        router.refresh()
      } else {
        const timer = setTimeout(() => {
          setHasExternalUpdate(true)
        }, 0)
        return () => clearTimeout(timer)
      }
    }
  }, [lastAttendanceChange, dirty, router])

  useEffect(() => {
    if (!dirty) return
    const handleBeforeUnload = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = "" }
    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => window.removeEventListener("beforeunload", handleBeforeUnload)
  }, [dirty])

  function changeDate(nextDate: string) {
    if (dirty && !window.confirm("มีข้อมูลที่ยังไม่ได้บันทึก ต้องการเปลี่ยนวันที่หรือไม่")) return
    setDate(nextDate)
    const params = new URLSearchParams()
    if (nextDate) params.set("date", nextDate)
    if (classroom.id) params.set("classroomId", classroom.id)
    router.push(`/attendance?${params.toString()}`)
  }

  function changeClassroom(nextClassroomId: string) {
    if (dirty && !window.confirm("มีข้อมูลที่ยังไม่ได้บันทึก ต้องการเปลี่ยนห้องเรียนหรือไม่")) return
    const params = new URLSearchParams()
    if (date) params.set("date", date)
    if (nextClassroomId) params.set("classroomId", nextClassroomId)
    router.push(`/attendance?${params.toString()}`)
  }

  function save() {
    const records: AttendanceInput[] = students.map((student) => ({
      student_id: student.id,
      status: entries[student.id].status,
      check_in_time: entries[student.id].checkInTime || null,
      remark: entries[student.id].remark || null,
    }))
    startTransition(async () => {
      const nextResult = await upsertAttendance(classroom.id, date, records)
      setResult(nextResult)
      if (nextResult.ok) {
        setSavedSnapshot(JSON.stringify(entries))
        setHasExternalUpdate(false)
        router.refresh()
      }
    })
  }

  return (
    <section className="space-y-4" aria-labelledby="attendance-editor-title">
      {hasExternalUpdate && dirty ? (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-amber-300 bg-amber-50 p-4 text-xs text-amber-900 shadow-sm">
          <div className="flex items-center gap-2">
            <AlertTriangle className="size-4 text-amber-600 shrink-0" />
            <span>มีข้อมูลบันทึกการมาเรียนใหม่จากระบบ โดยคุณมีรายการที่แก้ไขค้างอยู่</span>
          </div>
          <button
            type="button"
            onClick={() => {
              setSavedSnapshot(JSON.stringify(entries))
              router.refresh()
            }}
            className="inline-flex items-center gap-1 rounded-md bg-amber-200/80 px-2.5 py-1 font-semibold text-amber-900 hover:bg-amber-300 transition"
          >
            <RotateCw className="size-3" />
            โหลดข้อมูลใหม่
          </button>
        </div>
      ) : null}

      <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 shadow-sm sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 id="attendance-editor-title" className="font-semibold">
            บันทึกการมาเรียน · {classroom.name}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {students.length} คน{dirty ? " · มีรายการที่ยังไม่ได้บันทึก" : ""}
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          {classrooms.length > 1 && (
            <label className="space-y-1 text-sm">
              <span className="block text-xs font-medium text-muted-foreground">ห้องเรียน</span>
              <select
                aria-label="เลือกห้องเรียน"
                value={classroom.id}
                onChange={(event) => changeClassroom(event.target.value)}
                className="h-10 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {classrooms.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
          )}
          <label className="space-y-1 text-sm">
            <span className="block text-xs font-medium text-muted-foreground">วันที่</span>
            <Input type="date" value={date} onChange={(event) => changeDate(event.target.value)} />
          </label>
          <Button
            type="button"
            onClick={save}
            disabled={pending || students.length === 0 || !dirty}
            className="gap-2"
          >
            {pending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            {pending ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
          </Button>
        </div>
      </div>

      {/* Monthly Attendance Analytics & 80% Rule Bar */}
      {monthlySummary && (
        <AttendanceAnalyticsBar
          monthlySummary={monthlySummary}
          classroomName={classroom.name}
          onOpenPrint={() => setIsPrintOpen(true)}
          selectedRiskFilter={riskFilter}
          onSelectRiskFilter={setRiskFilter}
        />
      )}

      <ActionFeedback result={result} />

      {/* Live Counters & One-Click Attendance Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-3 shadow-xs">
        <div className="flex flex-wrap items-center gap-2 text-xs font-medium">
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-2.5 py-1 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
            <span className="size-2 rounded-full bg-emerald-500" />
            มาเรียน: <strong className="font-semibold tabular-nums">{counters.present}</strong>
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-rose-50 px-2.5 py-1 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300">
            <span className="size-2 rounded-full bg-rose-500" />
            ขาดเรียน: <strong className="font-semibold tabular-nums">{counters.absent}</strong>
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-amber-50 px-2.5 py-1 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300">
            <span className="size-2 rounded-full bg-amber-500" />
            มาสาย: <strong className="font-semibold tabular-nums">{counters.late}</strong>
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-sky-50 px-2.5 py-1 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300">
            <span className="size-2 rounded-full bg-sky-500" />
            ลา/ป่วย: <strong className="font-semibold tabular-nums">{counters.leave + counters.sick}</strong>
          </span>
          <span className="text-muted-foreground ml-1 tabular-nums">
            (รวม {counters.total} คน)
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={markAllPresent}
            className="gap-1.5 text-xs text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 dark:text-emerald-400 dark:hover:bg-emerald-950/40"
          >
            <CheckCircle2 className="size-3.5" />
            มาเรียนทุกคน (One-Click)
          </Button>
        </div>
      </div>

      {/* Search & Status Filter */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 flex-1 max-w-sm">
          <Search className="size-4 text-muted-foreground" aria-hidden="true" />
          <Input
            aria-label="ค้นหานักเรียน"
            placeholder="ค้นหานักเรียนในห้อง..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>

        <div className="flex items-center gap-1 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setStatusFilter("all")}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              statusFilter === "all"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            ทั้งหมด <span className="tabular-nums">({counters.total})</span>
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("non_present")}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              statusFilter === "non_present"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            เฉพาะขาด/สาย/ลา <span className="tabular-nums">({counters.absent + counters.late + counters.leave + counters.sick})</span>
          </button>
        </div>
      </div>

      {/* Mobile Student List View */}
      <div className="space-y-3 md:hidden">
        {filteredStudents.length ? (
          filteredStudents.map((student, index) => {
            const entry = entries[student.id]
            const isAbsent = entry.status === "absent"
            const isLate = entry.status === "late"
            const isLeaveOrSick = entry.status === "leave" || entry.status === "sick"

            return (
              <article
                key={student.id}
                className={`rounded-xl border p-4 shadow-xs transition-colors ${
                  isAbsent
                    ? "border-rose-200 bg-rose-50/30 dark:border-rose-900/40 dark:bg-rose-950/20"
                    : isLate
                      ? "border-amber-200 bg-amber-50/30 dark:border-amber-900/40 dark:bg-amber-950/20"
                      : isLeaveOrSick
                        ? "border-sky-200 bg-sky-50/25 dark:border-sky-900/40 dark:bg-sky-950/15"
                        : "border-border bg-card"
                }`}
              >
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-muted text-xs font-medium tabular-nums text-muted-foreground">
                      {index + 1}
                    </span>
                    <StudentIdentity
                      name={
                        <Link
                          href={`/students/${student.id}`}
                          className="font-medium text-foreground hover:underline"
                        >
                          {student.name}
                        </Link>
                      }
                      studentCode={student.studentCode}
                      size="sm"
                    />
                  </div>
                  <span className="shrink-0 font-mono text-xs tabular-nums text-muted-foreground">
                    {date}
                  </span>
                </div>

                <div className="space-y-3">
                  <div>
                    <span className="mb-1.5 block text-xs font-medium text-muted-foreground">
                      สถานะการมาเรียน
                    </span>
                    <AttendanceStatusButtons
                      studentName={student.name}
                      value={entry.status}
                      onChange={(status) => updateEntry(student.id, { status })}
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {entry.status === "late" ? (
                      <label className="space-y-1 text-sm">
                        <span className="block text-xs font-medium text-muted-foreground">เวลาเข้า</span>
                        <Input
                          aria-label={`เวลาเข้าของ ${student.name}`}
                          type="time"
                          value={entry.checkInTime}
                          onChange={(event) => updateEntry(student.id, { checkInTime: event.target.value })}
                          className="h-9 font-mono tabular-nums text-xs"
                        />
                      </label>
                    ) : null}
                    <label className="space-y-1 text-sm flex-1">
                      <span className="block text-xs font-medium text-muted-foreground">หมายเหตุ</span>
                      <Input
                        aria-label={`หมายเหตุของ ${student.name}`}
                        placeholder={
                          entry.status === "sick"
                            ? "อาการป่วย..."
                            : entry.status === "leave"
                              ? "เหตุผลการลา..."
                              : "ระบุหมายเหตุ (ถ้ามี)"
                        }
                        value={entry.remark}
                        onChange={(event) => updateEntry(student.id, { remark: event.target.value })}
                        className="h-9 text-xs"
                      />
                    </label>
                  </div>
                </div>
              </article>
            )
          })
        ) : (
          <div className="rounded-xl border border-dashed border-border bg-card px-4 py-10 text-center text-sm text-muted-foreground">
            ไม่พบรายชื่อนักเรียน
          </div>
        )}
      </div>

      {/* Desktop Attendance Table */}
      <div className="hidden overflow-x-auto rounded-xl border border-border bg-card shadow-xs md:block">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="border-b border-border bg-muted/40 text-xs text-muted-foreground">
            <tr>
              <th className="w-12 px-4 py-3 font-medium">#</th>
              <th className="px-4 py-3 font-medium">นักเรียน</th>
              <th className="w-72 px-4 py-3 font-medium">สถานะ</th>
              <th className="w-32 px-4 py-3 font-medium">เวลาเข้า</th>
              <th className="px-4 py-3 font-medium">หมายเหตุ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredStudents.length ? (
              filteredStudents.map((student, index) => {
                const entry = entries[student.id]
                const isAbsent = entry.status === "absent"
                const isLate = entry.status === "late"
                const isLeaveOrSick = entry.status === "leave" || entry.status === "sick"

                const rowBg = isAbsent
                  ? "bg-rose-50/30 hover:bg-rose-50/50 dark:bg-rose-950/20"
                  : isLate
                    ? "bg-amber-50/30 hover:bg-amber-50/50 dark:bg-amber-950/20"
                    : isLeaveOrSick
                      ? "bg-sky-50/20 hover:bg-sky-50/35 dark:bg-sky-950/15"
                      : "hover:bg-muted/30"

                return (
                  <tr key={student.id} className={`transition-colors ${rowBg}`}>
                    <td className="px-4 py-3 font-mono text-xs tabular-nums text-muted-foreground">
                      {index + 1}
                    </td>
                    <td className="px-4 py-3">
                      <StudentIdentity
                        name={
                          <Link
                            href={`/students/${student.id}`}
                            className="font-medium text-foreground hover:underline"
                          >
                            {student.name}
                          </Link>
                        }
                        studentCode={student.studentCode}
                        size="sm"
                      />
                    </td>
                    <td className="px-4 py-2.5">
                      <AttendanceStatusButtons
                        studentName={student.name}
                        value={entry.status}
                        onChange={(status) => updateEntry(student.id, { status })}
                        size="sm"
                      />
                    </td>
                    <td className="px-4 py-2.5">
                      <Input
                        aria-label={`เวลาเข้าของ ${student.name}`}
                        type="time"
                        value={entry.checkInTime}
                        onChange={(event) => updateEntry(student.id, { checkInTime: event.target.value })}
                        className="h-8 font-mono text-xs tabular-nums"
                      />
                    </td>
                    <td className="px-4 py-2.5">
                      <Input
                        aria-label={`หมายเหตุของ ${student.name}`}
                        placeholder={
                          entry.status === "sick"
                            ? "อาการป่วย..."
                            : entry.status === "leave"
                              ? "เหตุผลการลา..."
                              : "เพิ่มหมายเหตุ"
                        }
                        value={entry.remark}
                        onChange={(event) => updateEntry(student.id, { remark: event.target.value })}
                        className="h-8 text-xs"
                      />
                    </td>
                  </tr>
                )
              })
            ) : (
              <tr>
                <td colSpan={5} className="h-24 px-4 text-center text-muted-foreground">
                  ไม่พบรายชื่อนักเรียน
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {monthlySummary && (
        <AttendancePrintableDialog
          isOpen={isPrintOpen}
          onClose={() => setIsPrintOpen(false)}
          classroomName={classroom.name}
          monthlySummary={monthlySummary}
        />
      )}
    </section>
  )
}
