"use client"

import { useEffect, useMemo, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { AlertTriangle, Loader2, RotateCw, Save, Search } from "lucide-react"
import { upsertAttendance, type AttendanceInput } from "@/app/actions/attendance.actions"
import { ActionFeedback } from "@/components/forms/action-feedback"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { ActionResult } from "@/lib/server/action-result"
import type { Database } from "@/types/database.types"

import { useRealtime } from "@/components/providers/realtime-provider"

type AttendanceStatus = Database["public"]["Enums"]["attendance_status"]
type Student = { id: string; name: string }
type InitialRecord = { student_id: string; status: AttendanceStatus; check_in_time: string | null; remark: string | null }
type AttendanceFormProps = { classroom: { id: string; name: string }; students: Student[]; initialRecords: InitialRecord[]; dateStr: string }
type Entry = { status: AttendanceStatus; checkInTime: string; remark: string }

const statusOptions: { value: AttendanceStatus; label: string }[] = [
  { value: "present", label: "มาเรียน" }, { value: "absent", label: "ขาดเรียน" }, { value: "late", label: "มาสาย" }, { value: "leave", label: "ลา" }, { value: "sick", label: "ป่วย" },
]

export function AttendanceForm({ classroom, students, initialRecords, dateStr }: AttendanceFormProps) {
  const router = useRouter()
  const { lastAttendanceChange } = useRealtime()
  const [pending, startTransition] = useTransition()
  const [query, setQuery] = useState("")
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

  const filteredStudents = useMemo(() => students.filter((student) => student.name.toLocaleLowerCase("th").includes(query.toLocaleLowerCase("th"))), [students, query])
  const updateEntry = (studentId: string, patch: Partial<Entry>) => setEntries((current) => ({ ...current, [studentId]: { ...current[studentId], ...patch } }))

  function changeDate(nextDate: string) {
    if (dirty && !window.confirm("มีข้อมูลที่ยังไม่ได้บันทึก ต้องการเปลี่ยนวันที่หรือไม่")) return
    setDate(nextDate)
    router.push(nextDate ? `/attendance?date=${nextDate}` : "/attendance")
  }

  function save() {
    const records: AttendanceInput[] = students.map((student) => ({ student_id: student.id, status: entries[student.id].status, check_in_time: entries[student.id].checkInTime || null, remark: entries[student.id].remark || null }))
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

  return <section className="space-y-4" aria-labelledby="attendance-editor-title">
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
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 shadow-sm sm:flex-row sm:items-end sm:justify-between"><div><h2 id="attendance-editor-title" className="font-semibold">บันทึกการมาเรียน · {classroom.name}</h2><p className="mt-1 text-sm text-muted-foreground">{students.length} คน{dirty ? " · มีรายการที่ยังไม่ได้บันทึก" : ""}</p></div><div className="flex flex-col gap-3 sm:flex-row sm:items-end"><label className="space-y-1 text-sm"><span className="block text-xs font-medium text-muted-foreground">วันที่</span><Input type="date" value={date} onChange={(event) => changeDate(event.target.value)} /></label><Button type="button" onClick={save} disabled={pending || students.length === 0 || !dirty} className="gap-2">{pending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}{pending ? "กำลังบันทึก..." : "บันทึกข้อมูล"}</Button></div></div>
    <ActionFeedback result={result} />
    <div className="flex items-center gap-2"><Search className="size-4 text-muted-foreground" aria-hidden="true" /><Input aria-label="ค้นหานักเรียน" placeholder="ค้นหานักเรียน..." value={query} onChange={(event) => setQuery(event.target.value)} className="max-w-sm" /></div>
    <div className="space-y-3 md:hidden">
      {filteredStudents.length ? filteredStudents.map((student, index) => {
        const entry = entries[student.id]
        return (
          <article key={student.id} className="rounded-xl border border-border bg-card p-4 shadow-sm">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">ลำดับ {index + 1}</p>
                <h3 className="truncate font-medium text-foreground">{student.name}</h3>
              </div>
              <span className="shrink-0 rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">{date}</span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="space-y-1.5 text-sm">
                <span className="block text-xs font-medium text-muted-foreground">สถานะ</span>
                <select aria-label={`สถานะของ ${student.name}`} value={entry.status} onChange={(event) => updateEntry(student.id, { status: event.target.value as AttendanceStatus })} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:border-ring focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
                  {statusOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
              </label>
              <label className="space-y-1.5 text-sm">
                <span className="block text-xs font-medium text-muted-foreground">เวลาเข้า</span>
                <Input aria-label={`เวลาเข้าของ ${student.name}`} type="time" value={entry.checkInTime} onChange={(event) => updateEntry(student.id, { checkInTime: event.target.value })} className="h-10" />
              </label>
            </div>
            <label className="mt-3 block space-y-1.5 text-sm">
              <span className="block text-xs font-medium text-muted-foreground">หมายเหตุ</span>
              <Input aria-label={`หมายเหตุของ ${student.name}`} placeholder="เพิ่มหมายเหตุ" value={entry.remark} onChange={(event) => updateEntry(student.id, { remark: event.target.value })} className="h-10" />
            </label>
          </article>
        )
      }) : <div className="rounded-xl border border-dashed border-border bg-card px-4 py-10 text-center text-sm text-muted-foreground">ไม่พบรายชื่อนักเรียน</div>}
    </div>
    <div className="hidden overflow-x-auto rounded-xl border border-border bg-card shadow-sm md:block"><table className="w-full min-w-[760px] text-left text-sm"><thead className="border-b border-border bg-muted/30 text-xs text-muted-foreground"><tr><th className="w-14 px-4 py-3">#</th><th className="px-4 py-3">นักเรียน</th><th className="w-48 px-4 py-3">สถานะ</th><th className="w-36 px-4 py-3">เวลาเข้า</th><th className="w-64 px-4 py-3">หมายเหตุ</th></tr></thead><tbody>{filteredStudents.length ? filteredStudents.map((student, index) => { const entry = entries[student.id]; return <tr key={student.id} className="border-b border-border last:border-0"><td className="px-4 py-3 text-muted-foreground">{index + 1}</td><td className="px-4 py-3 font-medium">{student.name}</td><td className="px-4 py-2"><select aria-label={`สถานะของ ${student.name}`} value={entry.status} onChange={(event) => updateEntry(student.id, { status: event.target.value as AttendanceStatus })} className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm">{statusOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></td><td className="px-4 py-2"><Input aria-label={`เวลาเข้าของ ${student.name}`} type="time" value={entry.checkInTime} onChange={(event) => updateEntry(student.id, { checkInTime: event.target.value })} /></td><td className="px-4 py-2"><Input aria-label={`หมายเหตุของ ${student.name}`} placeholder="เพิ่มหมายเหตุ" value={entry.remark} onChange={(event) => updateEntry(student.id, { remark: event.target.value })} /></td></tr> }) : <tr><td colSpan={5} className="h-24 px-4 text-center text-muted-foreground">ไม่พบรายชื่อนักเรียน</td></tr>}</tbody></table></div>
  </section>
}
