"use client"

import {
  AlertTriangle,
  Award,
  Calendar,
  Clock,
  Printer,
  ShieldAlert,
} from "lucide-react"

import type {
  AttendanceRiskLevel,
  MonthlyAttendanceSummary,
} from "@/lib/attendance-constants"
import { Button } from "@/components/ui/button"

interface AttendanceAnalyticsBarProps {
  monthlySummary: MonthlyAttendanceSummary
  classroomName: string
  onOpenPrint: () => void
  selectedRiskFilter: AttendanceRiskLevel | "all"
  onSelectRiskFilter: (filter: AttendanceRiskLevel | "all") => void
}

export function AttendanceAnalyticsBar({
  monthlySummary,
  classroomName,
  onOpenPrint,
  selectedRiskFilter,
  onSelectRiskFilter,
}: AttendanceAnalyticsBarProps) {
  const {
    monthLabel,
    totalSchoolDays,
    averageAttendanceRate,
    criticalRiskCount,
    watchRiskCount,
    perfectAttendanceCount,
    items,
  } = monthlySummary

  return (
    <div className="space-y-4 rounded-xl border border-border bg-card p-5 shadow-sm">
      {/* Top row: Title and Print Button */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Calendar className="size-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-foreground">
                สถิติเวลาเรียนประจำเดือน ({monthLabel})
              </h2>
              <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                {classroomName}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              ประเมินเกณฑ์เวลาเรียนขั้นต่ำ 80% เพื่อสิทธิ์สอบปลายภาค (สพฐ.)
            </p>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onOpenPrint}
          className="inline-flex items-center gap-1.5 self-start sm:self-auto text-xs font-medium"
        >
          <Printer className="size-4 text-muted-foreground" />
          <span>พิมพ์บันทึกเวลาเรียน ปพ.5</span>
        </Button>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {/* Metric 1: Average rate */}
        <div className="rounded-lg border border-border bg-background p-3.5">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">เวลาเรียนเฉลี่ย</span>
            <Clock className="size-4 text-primary" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold tracking-tight text-foreground">
              {averageAttendanceRate}%
            </span>
            <span className="text-xs text-muted-foreground">ทั้งห้อง</span>
          </div>
          <div className="mt-1 flex items-center gap-1 text-xs">
            <span
              className={`font-medium ${
                averageAttendanceRate >= 85
                  ? "text-emerald-600"
                  : averageAttendanceRate >= 80
                    ? "text-amber-600"
                    : "text-rose-600"
              }`}
            >
              {averageAttendanceRate >= 80 ? "ผ่านเกณฑ์มาตรฐาน" : "ต่ำกว่าเกณฑ์ 80%"}
            </span>
          </div>
        </div>

        {/* Metric 2: School Days Recorded */}
        <div className="rounded-lg border border-border bg-background p-3.5">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">วันเปิดเรียน</span>
            <Calendar className="size-4 text-sky-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold tracking-tight text-foreground">
              {totalSchoolDays}
            </span>
            <span className="text-xs text-muted-foreground">วัน</span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            นักเรียนทั้งหมด {items.length} คน
          </p>
        </div>

        {/* Metric 3: Critical Risk (มส. < 80%) */}
        <button
          type="button"
          onClick={() =>
            onSelectRiskFilter(
              selectedRiskFilter === "critical" ? "all" : "critical",
            )
          }
          className={`rounded-lg border p-3.5 text-left transition-all ${
            criticalRiskCount > 0
              ? "border-rose-200 bg-rose-50/50 hover:bg-rose-50"
              : "border-border bg-background"
          } ${selectedRiskFilter === "critical" ? "ring-2 ring-rose-500" : ""}`}
        >
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium text-rose-700">เสี่ยง มส. (&lt; 80%)</span>
            <ShieldAlert className="size-4 text-rose-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold tracking-tight text-rose-700">
              {criticalRiskCount}
            </span>
            <span className="text-xs text-rose-600">คน</span>
          </div>
          <p className="mt-1 text-xs text-rose-600">
            {criticalRiskCount > 0 ? "เวลาเรียนไม่พอสอบ" : "ไม่มีนักเรียนเสี่ยง"}
          </p>
        </button>

        {/* Metric 4: Perfect Attendance */}
        <button
          type="button"
          onClick={() =>
            onSelectRiskFilter(
              selectedRiskFilter === "normal" ? "all" : "normal",
            )
          }
          className={`rounded-lg border p-3.5 text-left transition-all ${
            perfectAttendanceCount > 0
              ? "border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50"
              : "border-border bg-background"
          } ${selectedRiskFilter === "normal" ? "ring-2 ring-emerald-500" : ""}`}
        >
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium text-emerald-700">มาเรียน 100%</span>
            <Award className="size-4 text-emerald-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold tracking-tight text-emerald-700">
              {perfectAttendanceCount}
            </span>
            <span className="text-xs text-emerald-600">คน</span>
          </div>
          <p className="mt-1 text-xs text-emerald-600">ไม่เคยขาด/ลา/สาย</p>
        </button>
      </div>

      {/* Filter and Warning Alert if critical */}
      {criticalRiskCount > 0 && (
        <div className="flex items-start gap-2.5 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-900">
          <AlertTriangle className="size-4 shrink-0 text-rose-600 mt-0.5" />
          <div>
            <span className="font-semibold">
              แจ้งเตือนเกณฑ์เวลาเรียน สพฐ.:{" "}
            </span>
            พบนักเรียนจำนวน {criticalRiskCount} คน มีเวลาเรียนสะสมต่ำกว่า 80%
            ซึ่งอาจส่งผลให้หมดสิทธิ์สอบปลายภาค (มส.)
            กรุณาประสานครูที่ปรึกษาและผู้ปกครองเพื่อแก้ไขปัญหาโดยด่วน
          </div>
        </div>
      )}

      {/* Filter Chips */}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        <span className="text-xs font-medium text-muted-foreground">ตัวกรองรายชื่อ:</span>
        <button
          type="button"
          onClick={() => onSelectRiskFilter("all")}
          className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
            selectedRiskFilter === "all"
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
        >
          ทั้งหมด ({items.length})
        </button>
        <button
          type="button"
          onClick={() => onSelectRiskFilter("critical")}
          className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
            selectedRiskFilter === "critical"
              ? "bg-rose-600 text-white"
              : "bg-rose-50 text-rose-700 hover:bg-rose-100"
          }`}
        >
          เสี่ยง มส. ({criticalRiskCount})
        </button>
        <button
          type="button"
          onClick={() => onSelectRiskFilter("watch")}
          className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
            selectedRiskFilter === "watch"
              ? "bg-amber-600 text-white"
              : "bg-amber-50 text-amber-700 hover:bg-amber-100"
          }`}
        >
          เฝ้าระวัง 80-85% ({watchRiskCount})
        </button>
        <button
          type="button"
          onClick={() => onSelectRiskFilter("normal")}
          className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
            selectedRiskFilter === "normal"
              ? "bg-emerald-600 text-white"
              : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
          }`}
        >
          ปกติ ≥ 85% ({items.length - criticalRiskCount - watchRiskCount})
        </button>
      </div>
    </div>
  )
}
