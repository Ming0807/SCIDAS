import React from "react"
import type { RiskTrendPoint } from "@/lib/server/risk-read-models"
import { EmptyState } from "@/components/feedback/empty-state"

export function DesktopTrendComparison({
  trendData,
}: {
  trendData?: RiskTrendPoint[] | null
}) {
  const points = trendData ?? []

  if (points.length === 0) {
    return (
      <div className="bg-card rounded-2xl p-5 border border-border shadow-xs h-full flex flex-col">
        <h3 className="text-sm font-semibold text-foreground mb-4">แนวโน้มเปรียบเทียบ</h3>
        <div className="flex-1 flex items-center justify-center p-4">
          <EmptyState
            title="ยังไม่มีข้อมูลแนวโน้มย้อนหลัง"
            description="เมื่อมีการประเมินความเสี่ยงหลายช่วงเวลา ระบบจะแสดงกราฟเปรียบเทียบที่นี่"
          />
        </div>
      </div>
    )
  }

  const maxVal = Math.max(...points.map((p) => Math.max(p.highCount, p.watchCount, p.normalCount)), 10)

  // Normalize points to SVG coordinates (viewBox 0 0 100 100)
  // X coordinates distributed across available width
  const stepX = points.length > 1 ? 80 / (points.length - 1) : 0
  const coords = points.map((p, i) => {
    const x = points.length === 1 ? 50 : 10 + i * stepX
    // Y inverted: 100 is bottom, 10 is top
    const yHigh = 85 - (p.highCount / maxVal) * 70
    const yWatch = 85 - (p.watchCount / maxVal) * 70
    const yNormal = 85 - (p.normalCount / maxVal) * 70
    return { ...p, x, yHigh, yWatch, yNormal }
  })

  const highPath = coords.map((c, i) => `${i === 0 ? "M" : "L"} ${c.x.toFixed(1)},${c.yHigh.toFixed(1)}`).join(" ")
  const watchPath = coords.map((c, i) => `${i === 0 ? "M" : "L"} ${c.x.toFixed(1)},${c.yWatch.toFixed(1)}`).join(" ")
  const normalPath = coords.map((c, i) => `${i === 0 ? "M" : "L"} ${c.x.toFixed(1)},${c.yNormal.toFixed(1)}`).join(" ")

  return (
    <div className="bg-card rounded-2xl p-5 border border-border shadow-xs h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-foreground">แนวโน้มเปรียบเทียบ</h3>
        <span className="text-xs text-muted-foreground font-mono tabular-nums">
          {points.length} ช่วงเวลา
        </span>
      </div>

      <div className="flex items-center justify-center gap-6 mb-4">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-0.5 bg-red-500 rounded-full" />
          <span className="text-xs font-medium text-muted-foreground">เสี่ยงสูง</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-0.5 bg-amber-500 rounded-full" />
          <span className="text-xs font-medium text-muted-foreground">ต้องติดตาม</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-0.5 bg-emerald-500 rounded-full" />
          <span className="text-xs font-medium text-muted-foreground">ปกติ</span>
        </div>
      </div>

      <div className="flex-1 relative min-h-[160px] pb-6 ml-6 mt-1">
        <div className="absolute -left-7 top-0 bottom-6 flex flex-col justify-between py-0 w-6 items-end pr-1 text-micro font-mono tabular-nums text-muted-foreground">
          <span>{maxVal}</span>
          <span>{Math.round(maxVal / 2)}</span>
          <span>0</span>
        </div>

        <svg className="w-full h-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
          {/* Grid lines */}
          <line x1="0" y1="15" x2="100" y2="15" stroke="currentColor" className="text-border" strokeWidth="0.5" />
          <line x1="0" y1="50" x2="100" y2="50" stroke="currentColor" className="text-border" strokeWidth="0.5" />
          <line x1="0" y1="85" x2="100" y2="85" stroke="currentColor" className="text-border" strokeWidth="0.75" />

          {/* High risk line & points */}
          {points.length > 1 && (
            <path d={highPath} fill="none" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          )}
          {coords.map((c) => (
            <circle key={`h-${c.periodLabel}`} cx={c.x} cy={c.yHigh} r="2" fill="#fff" stroke="#ef4444" strokeWidth="1.2" />
          ))}

          {/* Watch risk line & points */}
          {points.length > 1 && (
            <path d={watchPath} fill="none" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          )}
          {coords.map((c) => (
            <circle key={`w-${c.periodLabel}`} cx={c.x} cy={c.yWatch} r="2" fill="#fff" stroke="#f59e0b" strokeWidth="1.2" />
          ))}

          {/* Normal risk line & points */}
          {points.length > 1 && (
            <path d={normalPath} fill="none" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          )}
          {coords.map((c) => (
            <circle key={`n-${c.periodLabel}`} cx={c.x} cy={c.yNormal} r="2" fill="#fff" stroke="#10b981" strokeWidth="1.2" />
          ))}

          {/* X Axis Labels */}
          {coords.map((c) => (
            <text
              key={`lbl-${c.periodLabel}`}
              x={c.x}
              y="97"
              fontSize="4"
              fill="currentColor"
              className="text-muted-foreground"
              textAnchor="middle"
            >
              {c.periodLabel}
            </text>
          ))}
        </svg>
      </div>
    </div>
  )
}
