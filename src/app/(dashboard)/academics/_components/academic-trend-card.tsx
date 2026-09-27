import { TrendingDown, TrendingUp } from "lucide-react"

import { EmptyState } from "@/components/feedback/empty-state"
import { cn } from "@/lib/utils"
import type { AcademicTrendPoint } from "@/lib/server/academic-read-models"

export function AcademicTrendCard({ trend }: { trend: AcademicTrendPoint[] }) {
  const withScores = trend.filter((point) => point.averageGpa !== null)
  const maxGpa = Math.max(4, ...withScores.map((point) => point.averageGpa ?? 0))

  if (withScores.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
        <EmptyState
          size="compact"
          title="ยังไม่มีแนวโน้มคะแนนข้ามเทอม"
          description="เมื่อมีการบันทึกคะแนนมากกว่าหนึ่งภาคเรียน ระบบจะแสดงแนวโน้มเกรดเฉลี่ยที่นี่"
        />
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-xs space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-semibold text-foreground">
          แนวโน้มเกรดเฉลี่ยข้ามภาคเรียน (GPA Trend)
        </h4>
        <span className="text-xs text-muted-foreground">
          ค่าเฉลี่ยรายคนต่อภาคเรียน
        </span>
      </div>

      <ol className="space-y-2">
        {trend.map((point, index) => {
          const previous = index > 0 ? trend[index - 1].averageGpa : null
          const delta =
            point.averageGpa !== null && previous !== null
              ? Math.round((point.averageGpa - previous) * 100) / 100
              : null
          const width =
            point.averageGpa !== null ? `${Math.max((point.averageGpa / maxGpa) * 100, 4)}%` : "0%"

          return (
            <li key={point.semesterId} className="flex items-center gap-3">
              <span className="w-32 shrink-0 truncate text-xs font-medium text-muted-foreground">
                {point.label}
              </span>
              <div className="h-2.5 min-w-0 flex-1 overflow-hidden rounded-full bg-muted">
                <div
                  className={cn(
                    "h-full rounded-full transition-all",
                    (point.averageGpa ?? 0) >= 2.5
                      ? "bg-emerald-500"
                      : (point.averageGpa ?? 0) >= 2.0
                        ? "bg-amber-500"
                        : "bg-rose-500",
                  )}
                  style={{ width }}
                />
              </div>
              <span className="w-12 shrink-0 text-right text-xs font-semibold tabular-nums text-foreground">
                {point.averageGpa !== null ? point.averageGpa.toFixed(2) : "-"}
              </span>
              <span className="flex w-20 shrink-0 items-center justify-end gap-1 text-xs tabular-nums">
                {delta === null || delta === 0 ? (
                  <span className="text-muted-foreground">-</span>
                ) : delta > 0 ? (
                  <span className="inline-flex items-center gap-0.5 font-medium text-emerald-600 dark:text-emerald-400">
                    <TrendingUp className="size-3" />+{delta.toFixed(2)}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-0.5 font-medium text-rose-600 dark:text-rose-400">
                    <TrendingDown className="size-3" />{delta.toFixed(2)}
                  </span>
                )}
              </span>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
