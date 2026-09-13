import React from "react"
import type { RiskFactorDistribution } from "@/lib/server/risk-read-models"
import { EmptyState } from "@/components/feedback/empty-state"

const palette = [
  { bg: "bg-red-500", stroke: "#ef4444", text: "text-red-600" },
  { bg: "bg-amber-500", stroke: "#f59e0b", text: "text-amber-600" },
  { bg: "bg-yellow-400", stroke: "#eab308", text: "text-yellow-600" },
  { bg: "bg-blue-500", stroke: "#3b82f6", text: "text-blue-600" },
  { bg: "bg-emerald-500", stroke: "#10b981", text: "text-emerald-600" },
  { bg: "bg-purple-500", stroke: "#a855f7", text: "text-purple-600" },
]

export function DesktopStatsCategory({
  factorDistribution,
}: {
  factorDistribution?: RiskFactorDistribution | null
}) {
  const factors = factorDistribution?.factors ?? []
  const totalStudents = factorDistribution?.totalStudents ?? 0
  const totalCount = factors.reduce((sum, f) => sum + f.count, 0)

  if (factors.length === 0 || totalCount === 0) {
    return (
      <div className="bg-card rounded-xl p-5 border border-border shadow-sm h-full flex flex-col">
        <h3 className="text-sm font-semibold text-foreground mb-4">สถิติจำแนกตามด้านความเสี่ยง</h3>
        <div className="flex-1 flex items-center justify-center p-4">
          <EmptyState
            title="ยังไม่มีข้อมูลปัจจัยเสี่ยง"
            description="เมื่อมีการประเมินความเสี่ยง สถิติจะปรากฏที่นี่"
          />
        </div>
      </div>
    )
  }

  const topFactors = factors.slice(0, 5)
  const otherCount = factors.slice(5).reduce((sum, f) => sum + f.count, 0)
  const displayItems = [...topFactors]
  if (otherCount > 0) {
    displayItems.push({ factorKey: "other", factorLabel: "ด้านอื่นๆ", count: otherCount })
  }

  let accumulatedPercent = 0
  const segments = displayItems.map((item, index) => {
    const percent = (item.count / totalCount) * 100
    const strokeDasharray = `${percent.toFixed(2)} ${(100 - percent).toFixed(2)}`
    const strokeDashoffset = -accumulatedPercent
    accumulatedPercent += percent
    const color = palette[index % palette.length]
    return {
      ...item,
      percent,
      strokeDasharray,
      strokeDashoffset,
      color,
    }
  })

  return (
    <div className="bg-card rounded-xl p-5 border border-border shadow-sm h-full flex flex-col">
      <h3 className="text-sm font-semibold text-foreground mb-4">สถิติจำแนกตามด้านความเสี่ยง</h3>
      
      <div className="flex flex-col xl:flex-row gap-6 items-center justify-center flex-1">
        {/* Donut Chart */}
        <div className="relative w-[160px] h-[160px] shrink-0">
          <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
            {segments.map((s) => (
              <circle
                key={s.factorKey}
                cx="50"
                cy="50"
                r="38"
                fill="none"
                stroke={s.color.stroke}
                strokeWidth="16"
                strokeDasharray={s.strokeDasharray}
                strokeDashoffset={s.strokeDashoffset}
                className="transition-all duration-300"
              />
            ))}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-2">
            <span className="text-micro font-medium text-muted-foreground">พบความเสี่ยง</span>
            <span className="text-xs font-bold text-foreground leading-tight">รวม {totalStudents} คน</span>
          </div>
        </div>

        {/* Legend Table */}
        <div className="flex-1 w-full min-w-0">
          <table className="w-full text-left text-xs">
            <tbody className="divide-y divide-border">
              {segments.map((s) => (
                <tr key={s.factorKey}>
                  <td className="py-2 pr-2">
                    <div className="flex items-center gap-2 truncate">
                      <div className={`w-2.5 h-2.5 rounded-sm ${s.color.bg} shrink-0`} />
                      <span className="text-foreground font-medium truncate" title={s.factorLabel}>
                        {s.factorLabel}
                      </span>
                    </div>
                  </td>
                  <td className="py-2 text-right font-bold text-foreground shrink-0">{s.count}</td>
                  <td className="py-2 pl-2 text-right text-muted-foreground shrink-0">{s.percent.toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
