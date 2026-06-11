"use client"

import { useActionState, useState } from "react"
import {
  CheckCircle2,
  FileText,
  HeartPulse,
  LineChart,
  Loader2,
  ShieldAlert,
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
    iconColor: "text-indigo-600",
    iconBg: "bg-indigo-50",
    iconBorder: "border-indigo-200",
    selectedBorder: "border-indigo-300 bg-indigo-50/60",
  },
  {
    value: "risk_report",
    label: "รายงานกลุ่มเสี่ยง",
    icon: ShieldAlert,
    iconColor: "text-orange-600",
    iconBg: "bg-orange-50",
    iconBorder: "border-orange-200",
    selectedBorder: "border-orange-300 bg-orange-50/60",
  },
  {
    value: "behavior_report",
    label: "รายงานพฤติกรรม",
    icon: LineChart,
    iconColor: "text-emerald-600",
    iconBg: "bg-emerald-50",
    iconBorder: "border-emerald-200",
    selectedBorder: "border-emerald-300 bg-emerald-50/60",
  },
  {
    value: "academic_report",
    label: "รายงานผลการเรียน",
    icon: HeartPulse,
    iconColor: "text-blue-600",
    iconBg: "bg-blue-50",
    iconBorder: "border-blue-200",
    selectedBorder: "border-blue-300 bg-blue-50/60",
  },
]

const defaultTitleByType: Record<string, string> = {
  student_summary: "รายงานสรุปนักเรียน",
  risk_report: "รายงานกลุ่มเสี่ยง",
  behavior_report: "รายงานพฤติกรรม",
  academic_report: "รายงานผลการเรียน",
  support_report: "รายงานการดูแลช่วยเหลือ",
  idp_report: "รายงานพัฒนารายบุคคล",
  attendance_report: "รายงานการมาเรียน",
  admin_summary: "รายงานสำหรับผู้บริหาร",
  home_visit_report: "รายงานเยี่ยมบ้าน",
  intervention_summary: "รายงานการช่วยเหลือ",
}

export function DesktopCreateReport() {
  const [state, formAction, pending] = useActionState<
    ActionResult<{ id: string }> | null,
    FormData
  >(requestReportJobActionState, null)

  const [selectedType, setSelectedType] = useState<string>("student_summary")
  const [title, setTitle] = useState<string>(defaultTitleByType.student_summary)

  const typeErrors = state?.ok === false ? state.fieldErrors?.reportType : undefined
  const titleErrors = state?.ok === false ? state.fieldErrors?.title : undefined

  function handleTypeSelect(value: string) {
    setSelectedType(value)
    setTitle(defaultTitleByType[value] ?? "")
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData()
    fd.set("reportType", selectedType)
    fd.set("title", title)
    formAction(fd)
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm mb-6">
      <h3 className="text-sm font-semibold text-slate-800 mb-4">สร้างรายงานใหม่</h3>

      {/* Report type cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        {reportTypeOptions.map((opt) => {
          const Icon = opt.icon
          const isSelected = selectedType === opt.value

          return (
            <label
              key={opt.value}
              className={cn(
                "rounded-xl p-3 border flex flex-col items-center justify-center text-center cursor-pointer transition-colors",
                isSelected
                  ? opt.selectedBorder
                  : "bg-slate-50/80 border-slate-100 hover:bg-indigo-50 hover:border-indigo-100",
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
                    ? `${opt.iconBg} ${opt.iconBorder}`
                    : "bg-white border-slate-100",
                )}
              >
                <Icon className={cn("w-4 h-4", opt.iconColor)} />
              </div>
              <span
                className={cn(
                  "text-xs font-semibold transition-colors",
                  isSelected ? "text-slate-800" : "text-slate-700",
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

      {/* Title input */}
      <div className="mb-4">
        <label htmlFor="report-title" className="block text-xs font-medium text-slate-600 mb-1.5">
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
