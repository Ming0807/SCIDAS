import React from "react"

export function MobileRiskBenchmark() {
  return (
    <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
      <h3 className="text-sm font-bold text-slate-800 mb-5">เปรียบเทียบกับเกณฑ์</h3>

      <div className="flex flex-col gap-4">
        
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-slate-700 w-24 shrink-0">นักเรียนคนนี้</span>
          <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden flex items-center relative">
            <div className="h-full bg-red-500 rounded-full" style={{ width: '78%' }}></div>
          </div>
          <span className="text-xs font-bold text-slate-800 w-6 text-right">78</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-slate-600 w-24 shrink-0">ค่าเฉลี่ยระดับชั้น ม.2</span>
          <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden flex items-center relative">
            <div className="h-full bg-yellow-400 rounded-full" style={{ width: '45%' }}></div>
          </div>
          <span className="text-xs font-bold text-slate-600 w-6 text-right">45</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-slate-600 w-24 shrink-0">ค่าเฉลี่ยโรงเรียน</span>
          <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden flex items-center relative">
            <div className="h-full bg-green-500 rounded-full" style={{ width: '32%' }}></div>
          </div>
          <span className="text-xs font-bold text-slate-600 w-6 text-right">32</span>
        </div>

        <div className="flex items-center gap-3 relative pt-2 border-t border-slate-50 mt-1">
          <span className="text-xs text-slate-500 w-24 shrink-0">เกณฑ์เฝ้าระวัง (60)</span>
          <div className="flex-1 relative h-4 flex items-center">
            <div className="absolute left-0 right-0 h-[1px] bg-slate-300 border-t border-dashed border-slate-400 z-0 top-1/2"></div>
          </div>
          <span className="text-xs text-slate-500 w-6 text-right">60</span>
        </div>

        <div className="flex justify-between pl-28 pr-8 mt-1">
          <span className="text-xs text-slate-400">0</span>
          <span className="text-xs text-slate-400">25</span>
          <span className="text-xs text-slate-400">50</span>
          <span className="text-xs text-slate-400">75</span>
          <span className="text-xs text-slate-400">100</span>
        </div>

      </div>
    </div>
  )
}
