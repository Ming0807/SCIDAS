import React from "react"
import { Calendar as CalendarIcon, BookOpen, Smile, Home, Activity } from "lucide-react"

import { EmptyState } from "@/components/feedback/empty-state"
import type { RiskFactorDistribution } from "@/lib/server/risk-read-models"

const defaultIcons = [CalendarIcon, BookOpen, Smile, Activity, Home]

export function MobileRiskSpiderChart({
  factorDistribution,
}: {
  factorDistribution: RiskFactorDistribution
}) {
  const factors = factorDistribution.factors || []

  if (factors.length === 0) {
    return (
      <div className="bg-card rounded-xl p-5 border border-border shadow-sm flex flex-col h-full">
        <h3 className="text-sm font-semibold text-foreground mb-3">ปัจจัยความเสี่ยง 5 ด้าน</h3>
        <EmptyState
          title="ไม่มีข้อมูลปัจจัยเสี่ยง"
          description="ยังไม่พบการกระจายตัวของปัจจัยความเสี่ยงในระบบ"
          className="py-6"
        />
      </div>
    )
  }

  // Calculate polygon points based on up to 5 factors
  const center = 50
  const radius = 38
  const angles = [0, 72, 144, 216, 288].map((deg) => (deg - 90) * (Math.PI / 180))

  const gridPoints = angles.map((a) => `${center + radius * Math.cos(a)},${center + radius * Math.sin(a)}`).join(" ")
  const midPoints = angles.map((a) => `${center + radius * 0.5 * Math.cos(a)},${center + radius * 0.5 * Math.sin(a)}`).join(" ")

  const totalStudents = factorDistribution.totalStudents || 1
  const factorsWithPct = factors.map((f) => ({
    ...f,
    percentage: Math.round((f.count / totalStudents) * 100),
  }))

  const maxPct = Math.max(...factorsWithPct.map((f) => f.percentage), 1)
  const dataPointsArr = angles.map((a, i) => {
    const factor = factorsWithPct[i]
    const factorVal = factor ? factor.percentage / maxPct : 0.2
    const r = radius * Math.max(0.15, Math.min(factorVal, 1))
    return {
      x: center + r * Math.cos(a),
      y: center + r * Math.sin(a),
    }
  })
  const dataPoints = dataPointsArr.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ")

  return (
    <div className="bg-card rounded-xl p-5 border border-border shadow-sm flex flex-col h-full">
      <h3 className="text-sm font-semibold text-foreground mb-4">สัดส่วนปัจจัยความเสี่ยง</h3>

      <div className="flex-1 flex items-center justify-center relative mb-4">
        <div className="relative w-[180px] h-[180px]">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {/* Outer Grid */}
            <polygon points={gridPoints} fill="none" stroke="currentColor" strokeOpacity="0.15" strokeWidth="1" />
            {/* Inner Grid */}
            <polygon points={midPoints} fill="none" stroke="currentColor" strokeOpacity="0.1" strokeWidth="1" />

            {/* Axis Lines */}
            {angles.map((a, i) => (
              <line
                key={i}
                x1={center}
                y1={center}
                x2={center + radius * Math.cos(a)}
                y2={center + radius * Math.sin(a)}
                stroke="currentColor"
                strokeOpacity="0.12"
                strokeWidth="1"
              />
            ))}

            {/* Data Polygon */}
            <polygon points={dataPoints} fill="rgba(239, 68, 68, 0.15)" stroke="#ef4444" strokeWidth="1.5" />

            {dataPointsArr.map((p, i) => (
              <circle key={i} cx={p.x} cy={p.y} r="2.2" fill="#ef4444" />
            ))}
          </svg>
        </div>
      </div>

      {/* Factor Legend Badges */}
      <div className="space-y-1.5 pt-2 border-t border-border">
        {factorsWithPct.slice(0, 5).map((f, i) => {
          const Icon = defaultIcons[i % defaultIcons.length]
          return (
            <div key={f.factorKey} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Icon className="size-3.5 text-primary" />
                <span className="text-muted-foreground truncate max-w-[150px]">{f.factorLabel}</span>
              </div>
              <span className="font-semibold text-foreground">{f.percentage}% ({f.count} คน)</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
