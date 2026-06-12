import React from "react"
import { Info } from "lucide-react"

export function MobileOverallRisk({
  riskScore,
  riskLevel,
}: {
  riskScore?: number | null
  riskLevel?: string | null
}) {
  const hasData = riskScore != null && riskLevel != null
  const score = riskScore ?? 0
  const level = riskLevel ?? "normal"

  const levelLabel =
    level === "high" ? "เสี่ยงสูง" : level === "watch" ? "เฝ้าระวัง" : "ปกติ"
  const levelColor =
    level === "high"
      ? "text-red-600 bg-red-50 border-red-100"
      : level === "watch"
        ? "text-amber-600 bg-amber-50 border-amber-100"
        : "text-emerald-600 bg-emerald-50 border-emerald-100"

  return (
    <div className="bg-card rounded-xl p-5 border border-border shadow-sm">
      <div className="flex items-center gap-1.5 mb-6 justify-center">
        <h3 className="text-sm font-semibold text-foreground">
          ระดับความเสี่ยงโดยรวม
        </h3>
        <Info className="w-4 h-4 text-muted-foreground" />
      </div>

      <div className="flex flex-col items-center">
        {hasData ? (
          <>
            <span className={`text-xs font-bold px-3 py-1 rounded-full border mb-1 ${levelColor}`}>
              {levelLabel}
            </span>
            <div className="text-xs text-muted-foreground mt-2 mb-0.5">
              คะแนนความเสี่ยง
            </div>
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-4xl font-bold text-foreground leading-none">
                {score}
              </span>
              <span className="text-sm font-medium text-muted-foreground">
                / 100
              </span>
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">
              เลือกนักเรียนเพื่อดูคะแนนความเสี่ยง
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
