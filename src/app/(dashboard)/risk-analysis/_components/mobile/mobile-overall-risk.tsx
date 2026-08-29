import React from "react"
import { Info } from "lucide-react"

export function MobileOverallRisk({
  riskScore,
  riskLevel,
  isSchoolOverview,
  riskCounts,
}: {
  riskScore?: number | null
  riskLevel?: string | null
  isSchoolOverview?: boolean
  riskCounts?: { high: number; watch: number; normal: number; total: number }
}) {
  const hasData = riskScore != null
  const score = riskScore ?? 0
  const level = riskLevel ?? "normal"

  const levelLabel =
    level === "high" ? "เสี่ยงสูง (High Risk)" : level === "watch" ? "ต้องติดตาม (Watch)" : "ปกติ (Normal)"
  const levelColor =
    level === "high"
      ? "text-red-700 bg-red-50 border-red-200"
      : level === "watch"
        ? "text-amber-700 bg-amber-50 border-amber-200"
        : "text-emerald-700 bg-emerald-50 border-emerald-200"

  return (
    <div className="bg-card rounded-xl p-5 border border-border shadow-sm">
      <div className="flex items-center gap-1.5 mb-4 justify-center">
        <h3 className="text-sm font-semibold text-foreground">
          {isSchoolOverview ? "คะแนนความเสี่ยงเฉลี่ยทั้งโรงเรียน" : "ระดับความเสี่ยงของนักเรียน"}
        </h3>
        <Info className="w-4 h-4 text-muted-foreground" />
      </div>

      <div className="flex flex-col items-center">
        {hasData ? (
          <>
            <span className={`text-xs font-bold px-3 py-1 rounded-full border mb-2 ${levelColor}`}>
              {levelLabel}
            </span>
            <div className="text-xs text-muted-foreground mb-1">
              {isSchoolOverview ? "คะแนนเฉลี่ย" : "คะแนนความเสี่ยง"}
            </div>
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-4xl font-bold text-foreground leading-none">
                {score}
              </span>
              <span className="text-sm font-medium text-muted-foreground">
                / 100
              </span>
            </div>

            {isSchoolOverview && riskCounts ? (
              <div className="mt-4 grid grid-cols-3 gap-2 w-full pt-3 border-t border-border text-center">
                <div className="rounded-lg bg-red-50/60 p-1.5">
                  <div className="text-base font-bold text-red-600">{riskCounts.high}</div>
                  <div className="text-[10px] text-red-700 font-medium">เสี่ยงสูง</div>
                </div>
                <div className="rounded-lg bg-amber-50/60 p-1.5">
                  <div className="text-base font-bold text-amber-600">{riskCounts.watch}</div>
                  <div className="text-[10px] text-amber-700 font-medium">ต้องติดตาม</div>
                </div>
                <div className="rounded-lg bg-emerald-50/60 p-1.5">
                  <div className="text-base font-bold text-emerald-600">{riskCounts.normal}</div>
                  <div className="text-[10px] text-emerald-700 font-medium">ปกติ</div>
                </div>
              </div>
            ) : null}
          </>
        ) : (
          <div className="text-center py-6">
            <p className="text-sm text-muted-foreground">
              ยังไม่มีข้อมูลคะแนนความเสี่ยงในระบบ
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
