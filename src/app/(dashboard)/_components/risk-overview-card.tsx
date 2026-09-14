import Link from "next/link"
import {
  AlertCircle,
  ArrowRight,
  Brain,
  CheckCircle2,
  ChevronRight,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react"

import { formatPercent } from "@/lib/student-care-formatters"
import type { StudentCareDashboard } from "@/lib/server/student-care-read-models"
import { cn } from "@/lib/utils"

type DashboardMetrics = StudentCareDashboard["metrics"]

export function RiskOverviewCard({
  metrics,
  className,
}: {
  metrics: DashboardMetrics
  className?: string
}) {
  const total = metrics.totalStudents || 0
  const highRisk = metrics.highRiskStudents || 0
  const watch = metrics.watchStudents || 0
  const normal = Math.max(0, total - highRisk - watch)

  const normalPct = total > 0 ? (normal / total) * 100 : 0
  const watchPct = total > 0 ? (watch / total) * 100 : 0
  const highRiskPct = total > 0 ? (highRisk / total) * 100 : 0

  return (
    <div
      className={cn(
        "flex flex-col justify-between rounded-2xl border border-border bg-card p-6 shadow-xs transition-all",
        className,
      )}
    >
      {/* Header */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-border/60">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Brain className="size-4" />
              </span>
              <h3 className="text-base font-bold text-foreground tracking-tight">
                ภาพรวมระดับความเสี่ยงนักเรียน
              </h3>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              ระบบคัดกรอง 5 ด้าน สพฐ. และการแจ้งเตือนสัญญาณเสี่ยงล่วงหน้า (Early Warning System)
            </p>
          </div>
          <Link
            href="/risk-analysis"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary/80 transition-colors shrink-0 group"
          >
            <span>วิเคราะห์เชิงลึก</span>
            <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        {/* Visual Segmented Distribution Bar */}
        <div className="my-5">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
            <span className="font-medium text-foreground">สัดส่วนประชากรนักเรียน ({total.toLocaleString("th-TH")} คน)</span>
            <span className="tabular-nums">
              เสี่ยงรวม <strong className="text-foreground">{formatPercent(watchPct + highRiskPct)}</strong>
            </span>
          </div>
          <div className="h-3.5 w-full overflow-hidden rounded-full bg-muted/60 p-0.5 flex gap-0.5">
            {normalPct > 0 && (
              <div
                style={{ width: `${normalPct}%` }}
                className="h-full rounded-l-full bg-emerald-500 transition-all duration-500"
                title={`ปกติ: ${normal} คน (${formatPercent(normalPct)})`}
              />
            )}
            {watchPct > 0 && (
              <div
                style={{ width: `${watchPct}%` }}
                className={cn(
                  "h-full bg-amber-500 transition-all duration-500",
                  normalPct === 0 && "rounded-l-full",
                  highRiskPct === 0 && "rounded-r-full"
                )}
                title={`เฝ้าระวัง: ${watch} คน (${formatPercent(watchPct)})`}
              />
            )}
            {highRiskPct > 0 && (
              <div
                style={{ width: `${highRiskPct}%` }}
                className="h-full rounded-r-full bg-rose-600 transition-all duration-500"
                title={`เสี่ยงสูง: ${highRisk} คน (${formatPercent(highRiskPct)})`}
              />
            )}
            {total === 0 && (
              <div className="h-full w-full rounded-full bg-muted" />
            )}
          </div>
        </div>

        {/* 3 Detailed Category Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Normal */}
          <Link
            href="/students"
            className="group flex flex-col justify-between rounded-xl border border-emerald-500/20 bg-emerald-500/[0.03] p-4 transition-all hover:bg-emerald-500/[0.08] hover:border-emerald-500/40"
          >
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                <span className="size-2 rounded-full bg-emerald-500" />
                กลุ่มปกติ
              </span>
              <ShieldCheck className="size-4 text-emerald-600/70" />
            </div>
            <div className="mt-3">
              <div className="text-2xl font-bold tabular-nums text-foreground tracking-tight">
                {normal.toLocaleString("th-TH")}
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
                <span>{formatPercent(normalPct)}</span>
                <span className="text-micro text-emerald-600 group-hover:underline flex items-center">
                  ดูรายชื่อ <ChevronRight className="size-3" />
                </span>
              </div>
            </div>
          </Link>

          {/* Watch */}
          <Link
            href="/risk-analysis"
            className="group flex flex-col justify-between rounded-xl border border-amber-500/20 bg-amber-500/[0.03] p-4 transition-all hover:bg-amber-500/[0.08] hover:border-amber-500/40"
          >
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 dark:text-amber-400">
                <span className="size-2 rounded-full bg-amber-500" />
                กลุ่มเฝ้าระวัง
              </span>
              <AlertCircle className="size-4 text-amber-600/70" />
            </div>
            <div className="mt-3">
              <div className="text-2xl font-bold tabular-nums text-foreground tracking-tight">
                {watch.toLocaleString("th-TH")}
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
                <span>{formatPercent(watchPct)}</span>
                <span className="text-micro text-amber-600 group-hover:underline flex items-center">
                  คัดกรอง <ChevronRight className="size-3" />
                </span>
              </div>
            </div>
          </Link>

          {/* High Risk */}
          <Link
            href="/risk-analysis"
            className="group flex flex-col justify-between rounded-xl border border-rose-500/20 bg-rose-500/[0.03] p-4 transition-all hover:bg-rose-500/[0.08] hover:border-rose-500/40"
          >
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-rose-700 dark:text-rose-400">
                <span className="size-2 rounded-full bg-rose-600" />
                กลุ่มเสี่ยงสูง
              </span>
              <ShieldAlert className="size-4 text-rose-600/70" />
            </div>
            <div className="mt-3">
              <div className="text-2xl font-bold tabular-nums text-destructive tracking-tight">
                {highRisk.toLocaleString("th-TH")}
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
                <span>{formatPercent(highRiskPct)}</span>
                <span className="text-micro text-rose-600 group-hover:underline flex items-center font-medium">
                  ช่วยเหลือด่วน <ChevronRight className="size-3" />
                </span>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Summary Footer Advice */}
      <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <CheckCircle2 className="size-3.5 text-emerald-500" />
          <span>ข้อมูลอัปเดตอัตโนมัติตามเวลาเรียนและพฤติกรรมล่าสุด</span>
        </span>
        <span className="text-micro text-muted-foreground/80">ระบบ สพฐ. 2569</span>
      </div>
    </div>
  )
}
