import React from "react"

import type { RiskFactorDistribution } from "@/lib/server/risk-read-models"

export function RiskFactorsChart({
  factorDistribution,
}: {
  factorDistribution?: RiskFactorDistribution | null
}) {
  const factors = factorDistribution?.factors ?? []

  return (
    <div className="bg-card rounded-xl p-5 border border-border shadow-sm flex flex-col min-w-0">
      <h3 className="text-sm font-semibold text-foreground mb-4">
        ปัจจัยความเสี่ยง
      </h3>

      {factors.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">
          ไม่มีข้อมูลปัจจัยความเสี่ยงในภาคการศึกษานี้
        </p>
      ) : (
        <div className="space-y-3">
          {factors.map((f) => {
            const maxCount = factors[0]?.count ?? 1
            const pct = Math.round((f.count / maxCount) * 100)

            return (
              <div key={f.factorKey} className="flex items-center gap-2">
                <span className="text-xs font-medium text-foreground w-28 shrink-0 truncate">
                  {f.factorLabel}
                </span>
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-xs font-semibold text-muted-foreground w-8 text-right">
                  {f.count}
                </span>
              </div>
            )
          })}
        </div>
      )}

      {factorDistribution?.totalStudents ? (
        <div className="mt-4 pt-3 border-t border-border text-xs text-muted-foreground">
          จากนักเรียน {factorDistribution.totalStudents} คนที่มีผลประเมิน
        </div>
      ) : null}
    </div>
  )
}
