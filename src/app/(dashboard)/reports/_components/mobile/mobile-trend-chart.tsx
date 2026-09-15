import React from "react"
import type { RiskTrendPoint } from "@/lib/server/risk-read-models"
import { EmptyState } from "@/components/feedback/empty-state"

export function MobileTrendChart({
  trendData,
}: {
  trendData?: RiskTrendPoint[] | null
}) {
  const points = trendData ?? []

  if (points.length === 0) {
    return (
      <div className="px-4 mb-6">
        <div className="bg-card rounded-2xl p-5 border border-border shadow-xs">
          <h3 className="text-sm font-semibold text-foreground mb-3">แนวโน้มย้อนหลัง</h3>
          <EmptyState
            title="ยังไม่มีข้อมูลแนวโน้มย้อนหลัง"
            description="เมื่อมีการประเมินหลายช่วงเวลา ข้อมูลจะปรากฏที่นี่"
          />
        </div>
      </div>
    )
  }

  const maxVal = Math.max(...points.map((p) => Math.max(p.highCount, p.watchCount, p.normalCount)), 10)
  const stepX = points.length > 1 ? 80 / (points.length - 1) : 0
  const coords = points.map((p, i) => {
    const x = points.length === 1 ? 50 : 10 + i * stepX
    const yHigh = 85 - (p.highCount / maxVal) * 70
    const yWatch = 85 - (p.watchCount / maxVal) * 70
    const yNormal = 85 - (p.normalCount / maxVal) * 70
    return { ...p, x, yHigh, yWatch, yNormal }
  })

  const highPath = coords.map((c, i) => `${i === 0 ? "M" : "L"} ${c.x.toFixed(1)},${c.yHigh.toFixed(1)}`).join(" ")
  const watchPath = coords.map((c, i) => `${i === 0 ? "M" : "L"} ${c.x.toFixed(1)},${c.yWatch.toFixed(1)}`).join(" ")
  const normalPath = coords.map((c, i) => `${i === 0 ? "M" : "L"} ${c.x.toFixed(1)},${c.yNormal.toFixed(1)}`).join(" ")

  return (
    <div className="px-4 mb-6">
      <div className="bg-card rounded-2xl p-5 border border-border shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-foreground">แนวโน้มย้อนหลัง</h3>
          <span className="text-xs text-muted-foreground font-mono tabular-nums">{points.length} ช่วงเวลา</span>
        </div>

        <div className="flex items-center gap-4 mb-4 flex-wrap">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
            <span className="text-xs text-muted-foreground">เสี่ยงสูง</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span className="text-xs text-muted-foreground">ต้องติดตาม</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-xs text-muted-foreground">ปกติ</span>
          </div>
        </div>

        <div className="relative h-[150px] pb-6 ml-6">
          <div className="absolute -left-6 top-0 bottom-6 flex flex-col justify-between py-0 w-5 items-end pr-1 text-micro font-mono tabular-nums text-muted-foreground">
            <span>{maxVal}</span>
            <span>{Math.round(maxVal / 2)}</span>
            <span>0</span>
          </div>

          <svg className="w-full h-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
            <line x1="0" y1="15" x2="100" y2="15" stroke="currentColor" className="text-border" strokeWidth="0.5" />
            <line x1="0" y1="50" x2="100" y2="50" stroke="currentColor" className="text-border" strokeWidth="0.5" />
            <line x1="0" y1="85" x2="100" y2="85" stroke="currentColor" className="text-border" strokeWidth="0.75" />

            {points.length > 1 && (
              <path d={highPath} fill="none" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            )}
            {coords.map((c) => (
              <circle key={`mh-${c.periodLabel}`} cx={c.x} cy={c.yHigh} r="2" fill="#fff" stroke="#ef4444" strokeWidth="1.2" />
            ))}

            {points.length > 1 && (
              <path d={watchPath} fill="none" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            )}
            {coords.map((c) => (
              <circle key={`mw-${c.periodLabel}`} cx={c.x} cy={c.yWatch} r="2" fill="#fff" stroke="#f59e0b" strokeWidth="1.2" />
            ))}

            {points.length > 1 && (
              <path d={normalPath} fill="none" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            )}
            {coords.map((c) => (
              <circle key={`mn-${c.periodLabel}`} cx={c.x} cy={c.yNormal} r="2" fill="#fff" stroke="#10b981" strokeWidth="1.2" />
            ))}

            {coords.map((c) => (
              <text
                key={`mlbl-${c.periodLabel}`}
                x={c.x}
                y="97"
                fontSize="4.5"
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
    </div>
  )
}
