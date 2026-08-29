import React from "react"
import type { RiskTrendPoint } from "@/lib/server/risk-read-models"

export function RiskHistoryChart({ trendData = [] }: { trendData?: RiskTrendPoint[] }) {
  // If no trend data, provide empty/placeholder points based on current month
  const points =
    trendData.length > 0
      ? trendData
      : [
          { periodLabel: "พ.ค.", highCount: 0, watchCount: 0, normalCount: 0, totalCount: 0 },
          { periodLabel: "มิ.ย.", highCount: 0, watchCount: 0, normalCount: 0, totalCount: 0 },
          { periodLabel: "ก.ค.", highCount: 0, watchCount: 0, normalCount: 0, totalCount: 0 },
          { periodLabel: "ส.ค.", highCount: 0, watchCount: 0, normalCount: 0, totalCount: 0 },
        ]

  const maxTotal = Math.max(
    ...points.map((p) => Math.max(p.highCount, p.watchCount, p.normalCount, p.totalCount, 10)),
    10
  )

  const getY = (val: number) => {
    const ratio = Math.min(Math.max(val / maxTotal, 0), 1)
    return Math.round(90 - ratio * 75)
  }

  const getX = (idx: number, total: number) => {
    if (total <= 1) return 50
    return Math.round(10 + (idx / (total - 1)) * 80)
  }

  const highPath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${getX(i, points.length)},${getY(p.highCount)}`).join(" ")
  const watchPath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${getX(i, points.length)},${getY(p.watchCount)}`).join(" ")
  const normalPath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${getX(i, points.length)},${getY(p.normalCount)}`).join(" ")

  return (
    <div className="bg-card rounded-xl p-5 border border-border shadow-sm flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-foreground">แนวโน้มความเสี่ยงย้อนหลัง</h3>
        <span className="text-xs text-muted-foreground">สถิติจริงตามระบบ</span>
      </div>

      <div className="flex items-center justify-center gap-6 mb-6">
        <div className="flex items-center gap-2">
          <div className="w-4 h-0.5 bg-red-500 rounded-full"></div>
          <span className="text-xs font-medium text-muted-foreground">เสี่ยงสูง</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-0.5 bg-amber-500 rounded-full"></div>
          <span className="text-xs font-medium text-muted-foreground">ต้องติดตาม</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-0.5 bg-emerald-500 rounded-full"></div>
          <span className="text-xs font-medium text-muted-foreground">ปกติ</span>
        </div>
      </div>

      <div className="flex-1 relative min-h-[180px] pb-6 ml-6 mt-2">
        <div className="absolute -left-8 top-0 bottom-6 flex flex-col justify-between py-0 w-8 items-end pr-2">
          <span className="text-[10px] text-muted-foreground">จำนวน</span>
          <span className="text-xs text-muted-foreground font-mono">{maxTotal}</span>
          <span className="text-xs text-muted-foreground font-mono">{Math.round(maxTotal * 0.5)}</span>
          <span className="text-xs text-muted-foreground font-mono">0</span>
        </div>

        <svg className="w-full h-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
          {/* Grid lines */}
          <line x1="0" y1="15" x2="100" y2="15" stroke="currentColor" strokeOpacity="0.08" strokeWidth="0.5" />
          <line x1="0" y1="52" x2="100" y2="52" stroke="currentColor" strokeOpacity="0.08" strokeWidth="0.5" />
          <line x1="0" y1="90" x2="100" y2="90" stroke="currentColor" strokeOpacity="0.15" strokeWidth="1" />

          {/* Normal Line (Green) */}
          <path d={normalPath} fill="none" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          {points.map((p, i) => (
            <circle key={`n-${i}`} cx={getX(i, points.length)} cy={getY(p.normalCount)} r="1.5" fill="#fff" stroke="#10b981" strokeWidth="1" />
          ))}

          {/* Watch Line (Yellow) */}
          <path d={watchPath} fill="none" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          {points.map((p, i) => (
            <circle key={`w-${i}`} cx={getX(i, points.length)} cy={getY(p.watchCount)} r="1.5" fill="#fff" stroke="#f59e0b" strokeWidth="1" />
          ))}

          {/* High Line (Red) */}
          <path d={highPath} fill="none" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          {points.map((p, i) => (
            <circle key={`h-${i}`} cx={getX(i, points.length)} cy={getY(p.highCount)} r="1.5" fill="#fff" stroke="#ef4444" strokeWidth="1" />
          ))}

          {/* X Axis Labels */}
          {points.map((p, i) => (
            <text key={`lbl-${i}`} x={getX(i, points.length)} y="105" fontSize="4.5" fill="currentColor" fillOpacity="0.6" textAnchor="middle">
              {p.periodLabel}
            </text>
          ))}
        </svg>
      </div>
    </div>
  )
}
