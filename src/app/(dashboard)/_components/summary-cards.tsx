import Link from "next/link"
import { AlertTriangle, ClipboardCheck, ListChecks, ShieldAlert, Users } from "lucide-react"

import { formatPercent } from "@/lib/student-care-formatters"
import type { StudentCareDashboard } from "@/lib/server/student-care-read-models"
import { cn } from "@/lib/utils"

type DashboardMetrics = StudentCareDashboard["metrics"]

function getPercent(count: number, total: number) {
  if (total <= 0) {
    return "0.0%"
  }
  return formatPercent((count / total) * 100)
}

function MiniSparkline({
  data,
  color,
}: {
  data: number[]
  color: string
}) {
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const points = data
    .map((val, idx) => {
      const x = (idx / (data.length - 1)) * 90 + 5
      const y = 26 - ((val - min) / range) * 20
      return `${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(" ")

  return (
    <svg viewBox="0 0 100 32" className="w-20 h-7 overflow-visible">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  )
}

export function SummaryCards({ metrics }: { metrics: DashboardMetrics }) {
  const attendanceRate = metrics.averageAttendance30d ?? 0
  const isAttendanceGood = attendanceRate >= 80

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      {/* 1. All Students */}
      <Link
        href="/students"
        className="group relative flex flex-col justify-between rounded-2xl border border-border bg-card p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
      >
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-muted-foreground">
            นักเรียนทั้งหมดในระบบ
          </span>
          <span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary/20">
            <Users className="size-4.5" />
          </span>
        </div>

        <div className="mt-4 flex items-baseline justify-between gap-2">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight text-foreground font-mono tabular-nums">
              {metrics.totalStudents.toLocaleString("th-TH")}
            </span>
            <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
              Primary
            </span>
          </div>
          <MiniSparkline
            data={[45, 47, 48, 49, 48, 50, 51]}
            color="var(--color-primary, #2563eb)"
          />
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-3 text-xs text-muted-foreground">
          <span>
            อัตรามาเรียน 30 วัน:{" "}
            <strong className="font-semibold text-foreground tabular-nums">
              {formatPercent(metrics.averageAttendance30d)}
            </strong>
          </span>
          <span
            className={cn(
              "inline-flex items-center rounded-md px-1.5 py-0.5 text-micro font-medium",
              isAttendanceGood
                ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                : "bg-destructive/10 text-destructive"
            )}
          >
            {isAttendanceGood ? "ปกติ" : "เฝ้าระวัง มส."}
          </span>
        </div>
      </Link>

      {/* 2. Watch Group */}
      <Link
        href="/risk-analysis"
        className="group relative flex flex-col justify-between rounded-2xl border border-border bg-card p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-amber-500/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/20"
      >
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-muted-foreground">
            กลุ่มเฝ้าระวัง (Watch)
          </span>
          <span className="flex size-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 transition-colors group-hover:bg-amber-500/20">
            <Users className="size-4.5" />
          </span>
        </div>

        <div className="mt-4 flex items-baseline justify-between gap-2">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight text-amber-600 dark:text-amber-400 font-mono tabular-nums">
              {metrics.watchStudents.toLocaleString("th-TH")}
            </span>
            <span className="inline-flex items-center rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-700 dark:text-amber-400">
              Watch
            </span>
          </div>
          <MiniSparkline
            data={[12, 14, 13, 16, 15, 14, 15]}
            color="#f59e0b"
          />
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-3 text-xs text-muted-foreground">
          <span>
            สัดส่วน:{" "}
            <strong className="font-semibold text-foreground tabular-nums">
              {getPercent(metrics.watchStudents, metrics.totalStudents)}
            </strong>{" "}
            ของทั้งโรงเรียน
          </span>
          <span className="inline-flex items-center rounded-md bg-amber-500/10 px-1.5 py-0.5 text-micro font-medium text-amber-700 dark:text-amber-400">
            เฝ้าระวัง
          </span>
        </div>
      </Link>

      {/* 3. High Risk Group */}
      <Link
        href="/risk-analysis"
        className="group relative flex flex-col justify-between rounded-2xl border border-border bg-card p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-rose-500/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/20"
      >
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-muted-foreground">
            กลุ่มเสี่ยงสูง (Critical/High)
          </span>
          <span className="flex size-9 items-center justify-center rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 transition-colors group-hover:bg-rose-500/20">
            {metrics.highRiskStudents > 0 ? (
              <ShieldAlert className="size-4.5" />
            ) : (
              <AlertTriangle className="size-4.5" />
            )}
          </span>
        </div>

        <div className="mt-4 flex items-baseline justify-between gap-2">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight text-rose-600 dark:text-rose-400 font-mono tabular-nums">
              {metrics.highRiskStudents.toLocaleString("th-TH")}
            </span>
            <span className="inline-flex items-center rounded-full bg-rose-500/10 px-2.5 py-0.5 text-xs font-semibold text-rose-700 dark:text-rose-400">
              High risk
            </span>
          </div>
          <MiniSparkline
            data={[8, 7, 9, 8, 7, 6, 6]}
            color="#f43f5e"
          />
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-3 text-xs text-muted-foreground">
          <span>
            สัดส่วน:{" "}
            <strong className="font-semibold text-foreground tabular-nums">
              {getPercent(metrics.highRiskStudents, metrics.totalStudents)}
            </strong>
          </span>
          <span
            className={cn(
              "inline-flex items-center rounded-md px-1.5 py-0.5 text-micro font-medium",
              metrics.highRiskStudents > 0
                ? "bg-rose-500/10 text-rose-700 dark:text-rose-400"
                : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
            )}
          >
            {metrics.highRiskStudents > 0 ? "ต้องช่วยเหลือ" : "ไม่มีเคสเสี่ยง"}
          </span>
        </div>
      </Link>

      {/* 4. Open Tasks */}
      <Link
        href="/support"
        className="group relative flex flex-col justify-between rounded-2xl border border-border bg-card p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-sky-500/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/20"
      >
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-muted-foreground">
            ภารกิจดูแลที่เปิดอยู่
          </span>
          <span className="flex size-9 items-center justify-center rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 transition-colors group-hover:bg-sky-500/20">
            {metrics.openActionItems > 0 ? (
              <ListChecks className="size-4.5" />
            ) : (
              <ClipboardCheck className="size-4.5" />
            )}
          </span>
        </div>

        <div className="mt-4 flex items-baseline justify-between gap-2">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight text-foreground font-mono tabular-nums">
              {(metrics.openSupportCases + metrics.openActionItems).toLocaleString("th-TH")}
            </span>
            <span className="inline-flex items-center rounded-full bg-sky-500/10 px-2.5 py-0.5 text-xs font-semibold text-sky-700 dark:text-sky-400">
              Info
            </span>
          </div>
          <MiniSparkline
            data={[28, 30, 31, 29, 32, 33, 33]}
            color="#0ea5e9"
          />
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-3 text-xs text-muted-foreground">
          <span>
            แผนพัฒนาติดตาม:{" "}
            <strong className="font-semibold text-foreground tabular-nums">
              {metrics.activePlans.toLocaleString("th-TH")}
            </strong>{" "}
            แผน
          </span>
          <span className="inline-flex items-center rounded-md bg-sky-500/10 px-1.5 py-0.5 text-micro font-medium text-sky-700 dark:text-sky-400">
            {metrics.openSupportCases} เคสเปิด
          </span>
        </div>
      </Link>
    </div>
  )
}
