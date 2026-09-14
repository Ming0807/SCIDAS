"use client"

import { AlertTriangle, Award, GraduationCap, Printer } from "lucide-react"

import { MetricCard } from "@/components/dashboard/metric-card"
import { Button } from "@/components/ui/button"

interface AcademicAnalyticsBarProps {
  classGpa: number
  honorsCount: number
  atRiskCount: number
  totalStudents: number
  gradeCounts: Record<string, number>
  onPrintClick: () => void
}

const GRADES_LIST = ["4", "3.5", "3", "2.5", "2", "1.5", "1", "0"]

export function AcademicAnalyticsBar({
  classGpa,
  honorsCount,
  atRiskCount,
  totalStudents,
  gradeCounts,
  onPrintClick,
}: AcademicAnalyticsBarProps) {
  const hasScores = classGpa > 0

  return (
    <div className="space-y-4">
      {/* 4 Summary Cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="เกรดเฉลี่ยรวม (Class GPA)"
          value={hasScores ? classGpa.toFixed(2) : "-"}
          description={hasScores ? "คะแนนเฉลี่ยทั้งห้องเรียน" : "ยังไม่มีข้อมูลคะแนน"}
          icon={GraduationCap}
          status={classGpa >= 2.5 ? "normal" : classGpa >= 2.0 ? "watch" : "high-risk"}
          size="compact"
        />
        <MetricCard
          title="ผลการเรียนดีเด่น (GPA ≥ 3.0)"
          value={`${honorsCount} คน`}
          description={
            totalStudents > 0
              ? `${Math.round((honorsCount / totalStudents) * 100)}% ของนักเรียนในห้อง`
              : "0%"
          }
          icon={Award}
          status="normal"
          size="compact"
        />
        <MetricCard
          title="กลุ่มเสี่ยงทางวิชาการ"
          value={`${atRiskCount} คน`}
          description="มีคะแนน < 50 หรือ GPA < 1.50"
          icon={AlertTriangle}
          status={atRiskCount > 0 ? "high-risk" : "normal"}
          size="compact"
        />
        <div className="flex flex-col justify-between rounded-2xl border border-border bg-card p-4 shadow-xs">
          <div>
            <p className="text-xs font-medium text-muted-foreground">เอกสารวิชาการทางการ</p>
            <h4 className="mt-1 text-sm font-semibold text-foreground">
              แบบสรุปผลการเรียน (ปพ.5 ย่อ)
            </h4>
            <p className="mt-0.5 text-xs text-muted-foreground">
              พิมพ์สรุปเกรดรายห้องพร้อมช่องลงนาม
            </p>
          </div>
          <div className="pt-3 mt-2 border-t border-border">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onPrintClick}
              disabled={totalStudents === 0}
              className="w-full text-xs gap-1.5 h-8"
            >
              <Printer className="size-3.5" />
              พิมพ์สรุป ปพ.5 ย่อ
            </Button>
          </div>
        </div>
      </div>

      {/* Grade Distribution Bar */}
      <div className="rounded-2xl border border-border bg-card p-4 shadow-xs space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-semibold text-foreground">
            การกระจายตัวของระดับผลการเรียน (Grade Distribution)
          </h4>
          <span className="text-xs text-muted-foreground">
            คำนวณจากทุกรายวิชาที่มีการกรอกคะแนน
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          {GRADES_LIST.map((grade) => {
            const count = gradeCounts[grade] ?? 0
            const isFailing = grade === "0"
            const isTop = grade === "4" || grade === "3.5"

            return (
              <div
                key={grade}
                className={`flex items-center gap-1.5 rounded-xl border px-2.5 py-1 text-xs font-medium ${
                  isFailing && count > 0
                    ? "border-rose-300 bg-rose-50 text-rose-700 dark:border-rose-800/60 dark:bg-rose-950/40 dark:text-rose-300"
                    : isTop && count > 0
                      ? "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-800/60 dark:bg-emerald-950/40 dark:text-emerald-300"
                      : "border-border bg-muted/40 text-muted-foreground"
                }`}
              >
                <span>เกรด {grade}:</span>
                <span className="font-semibold text-foreground">{count}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
