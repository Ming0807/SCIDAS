import React from "react"
import { ShieldAlert, AlertTriangle, CheckCircle2, Users } from "lucide-react"

type RiskCounts = {
  high: number
  watch: number
  normal: number
  total: number
}

export function RiskMatrix({ riskCounts }: { riskCounts?: RiskCounts | null }) {
  const high = riskCounts?.high ?? 0
  const watch = riskCounts?.watch ?? 0
  const normal = riskCounts?.normal ?? 0
  const total = riskCounts?.total ?? 0

  const highPct = total > 0 ? Math.round((high / total) * 100) : 0
  const watchPct = total > 0 ? Math.round((watch / total) * 100) : 0
  const normalPct = total > 0 ? Math.round((normal / total) * 100) : 0

  return (
    <div className="bg-card rounded-xl p-5 border border-border shadow-sm flex-1 flex flex-col xl:flex-row gap-6 xl:items-stretch min-w-0">
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-foreground">สัดส่วนและระดับการคัดกรองความเสี่ยง</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              วิเคราะห์จากสถิติมาเรียน ผลการเรียน พฤติกรรม และสภาพแวดล้อมครอบครัว
            </p>
          </div>
          <span className="text-xs font-medium text-muted-foreground">
            ทั้งหมด {total} คน
          </span>
        </div>

        {/* Dynamic Proportion Visualizer */}
        <div className="mt-2 space-y-4">
          <div className="h-4 w-full rounded-full bg-muted overflow-hidden flex">
            {high > 0 && (
              <div
                style={{ width: `${highPct}%` }}
                className="bg-red-500 transition-all"
                title={`เสี่ยงสูง ${high} คน (${highPct}%)`}
              />
            )}
            {watch > 0 && (
              <div
                style={{ width: `${watchPct}%` }}
                className="bg-amber-500 transition-all"
                title={`ต้องติดตาม ${watch} คน (${watchPct}%)`}
              />
            )}
            {normal > 0 && (
              <div
                style={{ width: `${normalPct}%` }}
                className="bg-emerald-500 transition-all"
                title={`ปกติ ${normal} คน (${normalPct}%)`}
              />
            )}
          </div>

          {/* 3 Tier Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="rounded-xl border border-red-200 bg-red-50/50 p-3.5 text-left">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-red-900 flex items-center gap-1.5">
                  <ShieldAlert className="size-3.5 text-red-600" />
                  กลุ่มเสี่ยงสูง
                </span>
                <span className="text-xs font-bold text-red-700">{highPct}%</span>
              </div>
              <p className="text-xl font-bold text-red-950 font-mono">{high}</p>
              <p className="text-xs text-red-700 mt-1">ต้องการการดูแลช่วยเหลือเร่งด่วน</p>
            </div>

            <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-3.5 text-left">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-amber-900 flex items-center gap-1.5">
                  <AlertTriangle className="size-3.5 text-amber-600" />
                  กลุ่มต้องติดตาม
                </span>
                <span className="text-xs font-bold text-amber-700">{watchPct}%</span>
              </div>
              <p className="text-xl font-bold text-amber-950 font-mono">{watch}</p>
              <p className="text-xs text-amber-700 mt-1">เฝ้าระวังและติดตามพฤติกรรม</p>
            </div>

            <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-3.5 text-left">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-emerald-900 flex items-center gap-1.5">
                  <CheckCircle2 className="size-3.5 text-emerald-600" />
                  กลุ่มปกติ
                </span>
                <span className="text-xs font-bold text-emerald-700">{normalPct}%</span>
              </div>
              <p className="text-xl font-bold text-emerald-950 font-mono">{normal}</p>
              <p className="text-xs text-emerald-700 mt-1">พัฒนาการและผลการเรียนอยู่ในเกณฑ์</p>
            </div>
          </div>
        </div>
      </div>

      <div className="w-px bg-border hidden xl:block"></div>

      {/* Right Rail Legend */}
      <div className="xl:w-[220px] shrink-0 flex flex-col justify-between">
        <div className="bg-muted/40 rounded-xl p-4 border border-border h-full flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-semibold text-foreground mb-3 flex items-center gap-1.5">
              <Users className="size-3.5 text-primary" />
              สรุปภาพรวมโรงเรียน
            </h4>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">นักเรียนทั้งหมด</span>
                <span className="font-semibold text-foreground font-mono">{total} คน</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">อัตราความเสี่ยง</span>
                <span className="font-semibold text-red-600 font-mono">{highPct + watchPct}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">อัตราปกติ</span>
                <span className="font-semibold text-emerald-600 font-mono">{normalPct}%</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-border text-xs text-muted-foreground">
            อัปเดตอัตโนมัติจากฐานข้อมูลกลาง
          </div>
        </div>
      </div>
    </div>
  )
}
