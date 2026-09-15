import React from "react"
import { Compass, AlertTriangle, CheckCircle2 } from "lucide-react"

import type { RiskDimensionBenchmark } from "@/lib/server/risk-read-models"
import { cn } from "@/lib/utils"

const DEFAULT_OBEC_DIMENSIONS = [
  { key: "academic", label: "ด้านการเรียน", defaultScore: 1 },
  { key: "health", label: "สุขภาพ/SDQ", defaultScore: 1 },
  { key: "economic", label: "เศรษฐกิจ/ครอบครัว", defaultScore: 1 },
  { key: "safety", label: "ความปลอดภัย", defaultScore: 1 },
  { key: "substance", label: "สารเสพติด", defaultScore: 1 },
  { key: "relationship", label: "เพศ/สัมพันธ์", defaultScore: 1 },
  { key: "gaming", label: "เกม/สื่อออนไลน์", defaultScore: 1 },
  { key: "environment", label: "สิ่งแวดล้อม", defaultScore: 1 },
]

export function RiskDimensionRadar({
  benchmarks = [],
}: {
  benchmarks?: RiskDimensionBenchmark[]
}) {
  const dimensionData = DEFAULT_OBEC_DIMENSIONS.map((dim, i) => {
    const found = benchmarks.find(
      (b) =>
        b.dimensionKey.toLowerCase().includes(dim.key) ||
        dim.label.includes(b.dimensionLabel) ||
        b.dimensionLabel.includes(dim.label.split("/")[0])
    )

    return {
      key: dim.key,
      label: dim.label,
      score: found ? Math.min(Math.max(found.averageScore, 0), 5) : 0,
      highCount: found?.highRiskCount ?? 0,
      watchCount: found?.watchRiskCount ?? 0,
      angle: (i * 2 * Math.PI) / 8 - Math.PI / 2,
    }
  })

  const cx = 130
  const cy = 130
  const maxR = 85

  const maxScore = 5
  const dataPoints = dimensionData.map((d) => {
    const r = Math.max(10, (d.score / maxScore) * maxR)
    const x = cx + r * Math.cos(d.angle)
    const y = cy + r * Math.sin(d.angle)
    return `${x.toFixed(1)},${y.toFixed(1)}`
  })
  const polygonPath = dataPoints.join(" ")

  const vulnerable = [...dimensionData].sort((a, b) => b.highCount - a.highCount || b.score - a.score)[0]

  return (
    <div className="bg-card rounded-xl p-5 border border-border shadow-xs flex flex-col h-full min-w-0">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Compass className="size-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">เรดาร์วิเคราะห์ 8 มิติ สพฐ.</h3>
        </div>
        <span className="text-xs text-muted-foreground font-mono">OBEC 8-Radar</span>
      </div>
      <p className="text-xs text-muted-foreground mb-4">
        กระจายตัวความเปราะบางของนักเรียนใน 8 มิติตามมาตรฐานกระทรวงศึกษาธิการ
      </p>

      <div className="relative flex items-center justify-center my-auto py-2">
        <svg viewBox="0 0 260 260" className="w-full max-w-[240px] aspect-square overflow-visible">
          {[0.25, 0.5, 0.75, 1].map((level) => {
            const r = maxR * level
            const ringPoints = dimensionData.map((d) => {
              const x = cx + r * Math.cos(d.angle)
              const y = cy + r * Math.sin(d.angle)
              return `${x.toFixed(1)},${y.toFixed(1)}`
            })
            return (
              <polygon
                key={level}
                points={ringPoints.join(" ")}
                fill="none"
                stroke="currentColor"
                className="text-border/60"
                strokeWidth="1"
                strokeDasharray={level === 1 ? "none" : "2,2"}
              />
            )
          })}

          {dimensionData.map((d) => {
            const x2 = cx + maxR * Math.cos(d.angle)
            const y2 = cy + maxR * Math.sin(d.angle)
            return (
              <line
                key={d.key}
                x1={cx}
                y1={cy}
                x2={x2}
                y2={y2}
                stroke="currentColor"
                className="text-border/40"
                strokeWidth="1"
              />
            )
          })}

          <polygon
            points={polygonPath}
            fill="currentColor"
            fillOpacity="0.2"
            stroke="currentColor"
            strokeWidth="2"
            className="text-primary transition-all duration-500"
          />

          {dimensionData.map((d) => {
            const r = Math.max(10, (d.score / maxScore) * maxR)
            const x = cx + r * Math.cos(d.angle)
            const y = cy + r * Math.sin(d.angle)
            const hasHigh = d.highCount > 0

            return (
              <circle
                key={d.key}
                cx={x}
                cy={y}
                r={hasHigh ? 4 : 3}
                className={cn(
                  hasHigh
                    ? "fill-rose-500 stroke-card stroke-2"
                    : "fill-primary stroke-card stroke-2"
                )}
              />
            )
          })}

          {dimensionData.map((d) => {
            const labelR = maxR + 18
            const x = cx + labelR * Math.cos(d.angle)
            const y = cy + labelR * Math.sin(d.angle)
            const isLeft = Math.cos(d.angle) < -0.2
            const isRight = Math.cos(d.angle) > 0.2

            return (
              <text
                key={`lbl-${d.key}`}
                x={x}
                y={y + 3}
                textAnchor={isLeft ? "end" : isRight ? "start" : "middle"}
                className="fill-muted-foreground text-xs font-medium select-none"
              >
                {d.label.split("/")[0]}
              </text>
            )
          })}
        </svg>
      </div>

      <div className="mt-auto pt-3 border-t border-border flex items-center justify-between text-xs">
        {vulnerable && vulnerable.highCount > 0 ? (
          <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-medium">
            <AlertTriangle className="size-3.5 shrink-0" />
            <span className="truncate">จุดเปราะบางสูงสุด: {vulnerable.label} ({vulnerable.highCount} คน)</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-medium">
            <CheckCircle2 className="size-3.5 shrink-0" />
            <span>สัญญาณทั้ง 8 มิติอยู่ในเกณฑ์ควบคุม</span>
          </div>
        )}
      </div>
    </div>
  )
}
