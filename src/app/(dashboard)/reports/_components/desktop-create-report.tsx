"use client"

import { useActionState, useState } from "react"
import {
  Award,
  CalendarCheck,
  CheckCircle2,
  FileCheck2,
  FileSpreadsheet,
  FileText,
  GraduationCap,
  HeartHandshake,
  Home,
  Loader2,
  ShieldAlert,
  Sparkles,
  XCircle,
} from "lucide-react"

import { requestReportJobActionState } from "@/app/actions/reports.actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { ActionResult } from "@/lib/server/action-result"
import { cn } from "@/lib/utils"

const reportTypeOptions = [
  {
    value: "student_summary",
    label: "รายงานสรุปนักเรียน",
    icon: FileText,
  },
  {
    value: "screening_summary",
    label: "รายงานคัดกรอง SDQ",
    icon: FileCheck2,
  },
  {
    value: "risk_report",
    label: "รายงานกลุ่มเสี่ยง",
    icon: ShieldAlert,
  },
  {
    value: "attendance_report",
    label: "รายงานการมาเรียน",
    icon: CalendarCheck,
  },
  {
    value: "academic_report",
    label: "รายงานผลการเรียน",
    icon: GraduationCap,
  },
  {
    value: "behavior_summary",
    label: "รายงานความประพฤติ",
    icon: Award,
  },
  {
    value: "home_visit_summary",
    label: "รายงานการเยี่ยมบ้าน",
    icon: Home,
  },
  {
    value: "support_summary",
    label: "รายงานการช่วยเหลือ",
    icon: HeartHandshake,
  },
  {
    value: "comprehensive",
    label: "รายงานสรุปภาพรวม SAR",
    icon: Sparkles,
  },
]

const defaultTitleByType: Record<string, string> = {
  student_summary: "รายงานสรุปรายชื่อและข้อมูลนักเรียน",
  screening_summary: "รายงานผลการคัดกรองนักเรียน SDQ และ 5 ด้าน (สพฐ.)",
  risk_report: "รายงานคัดกรองนักเรียนกลุ่มเสี่ยง (Early Warning)",
  attendance_report: "รายงานสรุปสถิติการมาเรียน",
  academic_report: "รายงานสรุปผลการเรียนและคะแนนเก็บ",
  behavior_summary: "รายงานคะแนนความประพฤติและวินัยนักเรียน",
  home_visit_summary: "รายงานสรุปผลการเยี่ยมบ้านนักเรียน (สพฐ.)",
  support_summary: "รายงานสรุปการให้คำปรึกษาและช่วยเหลือผู้เรียน",
  comprehensive: "รายงานสรุปผลการดำเนินงานระบบดูแลช่วยเหลือ (SAR)",
}

export type ReportFilterOption = {
  id: string
  name: string
}

export type ReportSemesterOption = ReportFilterOption & {
  year?: number | null
}

export function DesktopCreateReport({
  classrooms = [],
  semesters = [],
}: {
  classrooms?: ReportFilterOption[]
  semesters?: ReportSemesterOption[]
}) {
  const [state, formAction, pending] = useActionState<
    ActionResult<{ id: string }> | null,
    FormData
  >(requestReportJobActionState, null)

  const [selectedType, setSelectedType] = useState<string>("student_summary")
  const [selectedFormat, setSelectedFormat] = useState<"pdf" | "xlsx">("pdf")
  const [title, setTitle] = useState<string>(defaultTitleByType.student_summary)
  const [classroomId, setClassroomId] = useState<string>("")
  const [academicYear, setAcademicYear] = useState<string>("")
  const [semesterId, setSemesterId] = useState<string>("")
  const [dateFrom, setDateFrom] = useState<string>("")
  const [dateTo, setDateTo] = useState<string>("")

  const typeErrors = state?.ok === false ? state.fieldErrors?.reportType : undefined
  const titleErrors = state?.ok === false ? state.fieldErrors?.title : undefined
  const filterErrors = state?.ok === false ? state.fieldErrors?.filters : undefined

  const academicYears = [...new Set(semesters.map((s) => s.year).filter((y): y is number => y !== null && y !== undefined))].sort((a, b) => b - a)
  const visibleSemesters = academicYear
    ? semesters.filter((s) => s.year === Number(academicYear))
    : semesters

  function handleYearSelect(value: string) {
    setAcademicYear(value)
    setSemesterId((current) => {
      if (!value) return current
      const stillVisible = semesters.some((s) => s.id === current && s.year === Number(value))
      return stillVisible ? current : ""
    })
  }

  function handleTypeSelect(value: string) {
    setSelectedType(value)
    setTitle(defaultTitleByType[value] ?? "")
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData()
    fd.set("reportType", selectedType)
    fd.set("format", selectedFormat)
    fd.set("title", title)
    if (classroomId) fd.set("classroomId", classroomId)
    if (semesterId) fd.set("semesterId", semesterId)
    if (dateFrom) fd.set("dateFrom", dateFrom)
    if (dateTo) fd.set("dateTo", dateTo)
    formAction(fd)
  }

  return (
    <form onSubmit={handleSubmit} className="bg-card rounded-2xl p-5 border border-border shadow-xs mb-6">
      <h3 className="text-sm font-semibold text-foreground mb-4">สร้างรายงานใหม่</h3>

      {/* Report type cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-4">
        {reportTypeOptions.map((opt) => {
          const Icon = opt.icon
          const isSelected = selectedType === opt.value

          return (
            <label
              key={opt.value}
              className={cn(
                "rounded-xl p-3 border flex flex-col items-center justify-center text-center cursor-pointer transition-colors",
                isSelected
                  ? "border-primary/50 bg-primary/5 dark:bg-primary/10 shadow-xs"
                  : "bg-muted/30 border-border hover:bg-muted/50 hover:border-primary/30",
              )}
            >
              <input
                type="radio"
                name="reportType"
                value={opt.value}
                checked={isSelected}
                onChange={() => handleTypeSelect(opt.value)}
                className="sr-only"
              />
              <div
                className={cn(
                  "w-10 h-10 rounded-full border flex items-center justify-center mb-2 transition-colors",
                  isSelected
                    ? "bg-primary/15 border-primary/30"
                    : "bg-card border-border",
                )}
              >
                <Icon className={cn("w-4 h-4", isSelected ? "text-primary" : "text-muted-foreground")} />
              </div>
              <span
                className={cn(
                  "text-xs font-semibold transition-colors",
                  isSelected ? "text-primary" : "text-foreground",
                )}
              >
                {opt.label}
              </span>
            </label>
          )
        })}
      </div>

      {typeErrors ? (
        <p className="mb-3 text-xs text-destructive" aria-live="polite">
          {typeErrors[0]}
        </p>
      ) : null}

      {/* Format Selector (PDF vs XLSX) */}
      <div className="mb-4">
        <label className="block text-xs font-medium text-muted-foreground mb-1.5">
          รูปแบบไฟล์เอกสาร
        </label>
        <div className="flex items-center gap-3">
          <label
            className={cn(
              "flex items-center gap-2 px-3.5 py-2 rounded-lg border text-xs font-medium cursor-pointer transition-colors",
              selectedFormat === "pdf"
                ? "bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-950/40 dark:border-rose-800/60 dark:text-rose-300 shadow-xs"
                : "bg-muted/30 border-border text-muted-foreground hover:bg-muted/50"
            )}
          >
            <input
              type="radio"
              name="format"
              value="pdf"
              checked={selectedFormat === "pdf"}
              onChange={() => setSelectedFormat("pdf")}
              className="sr-only"
            />
            <FileText className="w-4 h-4 text-rose-600 dark:text-rose-400" />
            <span>PDF Document (.pdf)</span>
          </label>

          <label
            className={cn(
              "flex items-center gap-2 px-3.5 py-2 rounded-lg border text-xs font-medium cursor-pointer transition-colors",
              selectedFormat === "xlsx"
                ? "bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/40 dark:border-emerald-800/60 dark:text-emerald-300 shadow-xs"
                : "bg-muted/30 border-border text-muted-foreground hover:bg-muted/50"
            )}
          >
            <input
              type="radio"
              name="format"
              value="xlsx"
              checked={selectedFormat === "xlsx"}
              onChange={() => setSelectedFormat("xlsx")}
              className="sr-only"
            />
            <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Excel Spreadsheet (.xlsx)</span>
          </label>
        </div>
      </div>

      {/* Title input */}
      <div className="mb-4">
        <label htmlFor="report-title" className="block text-xs font-medium text-muted-foreground mb-1.5">
          ชื่อรายงาน
        </label>
        <Input
          id="report-title"
          type="text"
          name="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="ระบุชื่อรายงาน"
          aria-invalid={titleErrors ? true : undefined}
          aria-describedby={titleErrors ? "report-title-error" : undefined}
          className="h-9 text-sm"
        />
        {titleErrors ? (
          <p id="report-title-error" className="mt-1 text-xs text-destructive" aria-live="polite">
            {titleErrors[0]}
          </p>
        ) : null}
      </div>

      {/* Scope filters (persisted into the job snapshot; generators honor them) */}
      <fieldset className="mb-4 rounded-xl border border-border bg-muted/20 p-3">
        <legend className="px-1 text-xs font-semibold text-foreground">ขอบเขตข้อมูลในรายงาน</legend>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="report-classroom" className="block text-xs font-medium text-muted-foreground mb-1.5">
              ชั้น/ห้อง
            </label>
            <select
              id="report-classroom"
              name="classroomId"
              value={classroomId}
              onChange={(e) => setClassroomId(e.target.value)}
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="">ทุกห้องเรียน</option>
              {classrooms.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="report-year" className="block text-xs font-medium text-muted-foreground mb-1.5">
              ปีการศึกษา
            </label>
            <select
              id="report-year"
              value={academicYear}
              onChange={(e) => handleYearSelect(e.target.value)}
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="">ทุกปีการศึกษา</option>
              {academicYears.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="report-semester" className="block text-xs font-medium text-muted-foreground mb-1.5">
              ภาคเรียน
            </label>
            <select
              id="report-semester"
              name="semesterId"
              value={semesterId}
              onChange={(e) => setSemesterId(e.target.value)}
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="">ทุกภาคเรียน</option>
              {visibleSemesters.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="report-date-from" className="block text-xs font-medium text-muted-foreground mb-1.5">
              ตั้งแต่วันที่
            </label>
            <Input
              id="report-date-from"
              type="date"
              name="dateFrom"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="h-9 text-sm"
            />
          </div>
          <div>
            <label htmlFor="report-date-to" className="block text-xs font-medium text-muted-foreground mb-1.5">
              ถึงวันที่
            </label>
            <Input
              id="report-date-to"
              type="date"
              name="dateTo"
              value={dateTo}
              min={dateFrom || undefined}
              onChange={(e) => setDateTo(e.target.value)}
              className="h-9 text-sm"
            />
          </div>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          ตัวกรองชั้น/ห้องใช้กับรายงานรายชื่อนักเรียน ช่วงวันที่ใช้กับรายงานการมาเรียน พฤติกรรม เยี่ยมบ้าน และการช่วยเหลือ
        </p>
        {filterErrors ? (
          <p className="mt-1 text-xs text-destructive" aria-live="polite">
            {filterErrors[0]}
          </p>
        ) : null}
      </fieldset>

      {/* Submit button + feedback */}
      <div className="flex items-center justify-between">
        <Button type="submit" disabled={pending} className="min-w-[140px]">
          {pending ? (
            <>
              <Loader2 className="animate-spin" />
              กำลังสร้าง...
            </>
          ) : (
            "สร้างรายงาน"
          )}
        </Button>

        {state ? (
          <div
            aria-live="polite"
            className={cn(
              "flex items-center gap-1.5 text-xs font-medium",
              state.ok ? "text-emerald-600" : "text-destructive",
            )}
          >
            {state.ok ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : (
              <XCircle className="w-4 h-4" />
            )}
            {state.ok ? "สร้างรายงานเรียบร้อย" : state.message}
          </div>
        ) : null}
      </div>
    </form>
  )
}
