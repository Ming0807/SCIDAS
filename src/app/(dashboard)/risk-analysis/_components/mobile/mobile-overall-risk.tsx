import React from "react"
import { Info } from "lucide-react"

export function MobileOverallRisk() {
  return (
    <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
      <div className="flex items-center gap-1.5 mb-6 justify-center">
        <h3 className="text-[14px] font-bold text-slate-800">ระดับความเสี่ยงโดยรวม</h3>
        <Info className="w-4 h-4 text-slate-400" />
      </div>

      <div className="flex flex-col items-center relative pb-2">
        {/* Gauge Chart SVG */}
        <div className="relative w-[200px] h-[100px] overflow-hidden">
          <svg viewBox="0 0 200 100" className="w-full h-[200px] transform">
            {/* Background Arc */}
            <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="#f1f5f9" strokeWidth="20" strokeLinecap="round" />
            
            {/* Colors Arc */}
            {/* Green part */}
            <path d="M 20 100 A 80 80 0 0 1 60 30" fill="none" stroke="#22c55e" strokeWidth="20" strokeLinecap="round" opacity="0.8" />
            {/* Yellow part */}
            <path d="M 60 30 A 80 80 0 0 1 140 30" fill="none" stroke="#eab308" strokeWidth="20" opacity="0.8" />
            {/* Red part (up to 78%) */}
            <path d="M 140 30 A 80 80 0 0 1 168 70" fill="none" stroke="#ef4444" strokeWidth="20" opacity="0.9" />
          </svg>
          
          <div className="absolute inset-0 flex flex-col items-center justify-end pb-2">
            <span className="text-[12px] font-bold text-red-600 bg-red-50 px-3 py-1 rounded-full border border-red-100 mb-1">เสี่ยงสูง</span>
          </div>
        </div>

        <div className="text-center mt-2">
          <div className="text-[11px] text-slate-500 mb-0.5">คะแนนความเสี่ยง</div>
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-[36px] font-bold text-slate-800 leading-none">78</span>
            <span className="text-[14px] font-medium text-slate-400">/ 100</span>
          </div>
        </div>
      </div>
    </div>
  )
}
