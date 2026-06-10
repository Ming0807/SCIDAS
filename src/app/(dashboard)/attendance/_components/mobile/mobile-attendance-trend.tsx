import React from "react"
import { Info, ChevronDown } from "lucide-react"

export function MobileAttendanceTrend() {
  return (
    <div className="px-4 mb-4">
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-1.5">
            <h3 className="text-[13px] font-bold text-slate-800">แนวโน้มการมาเรียน</h3>
            <Info className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <button className="flex items-center gap-1 text-[11px] font-medium text-slate-500 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
            รายสัปดาห์
            <ChevronDown className="w-3 h-3" />
          </button>
        </div>

        {/* SVG Chart */}
        <div className="relative w-full h-[160px] flex items-end ml-2 pb-6">
          <svg className="w-full h-full overflow-visible" viewBox="0 0 100 80" preserveAspectRatio="none">
            
            {/* Y-axis grid lines & labels */}
            <line x1="10" y1="10" x2="100" y2="10" stroke="#f1f5f9" strokeWidth="0.5" />
            <text x="8" y="10" fontSize="3.5" fill="#94a3b8" textAnchor="end" dominantBaseline="middle">100%</text>

            <line x1="10" y1="30" x2="100" y2="30" stroke="#f1f5f9" strokeWidth="0.5" strokeDasharray="2 2" />
            <text x="8" y="30" fontSize="3.5" fill="#94a3b8" textAnchor="end" dominantBaseline="middle">75%</text>

            <line x1="10" y1="50" x2="100" y2="50" stroke="#f1f5f9" strokeWidth="0.5" strokeDasharray="2 2" />
            <text x="8" y="50" fontSize="3.5" fill="#94a3b8" textAnchor="end" dominantBaseline="middle">50%</text>

            <line x1="10" y1="70" x2="100" y2="70" stroke="#f1f5f9" strokeWidth="0.5" strokeDasharray="2 2" />
            <text x="8" y="70" fontSize="3.5" fill="#94a3b8" textAnchor="end" dominantBaseline="middle">25%</text>

            <line x1="10" y1="90" x2="100" y2="90" stroke="#f1f5f9" strokeWidth="0.5" />
            <text x="8" y="90" fontSize="3.5" fill="#94a3b8" textAnchor="end" dominantBaseline="middle">0%</text>

            {/* Area gradient */}
            <defs>
              <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Path: 92.1%, 94.3%, 90.8%, 95.6%, 93.2% */}
            {/* Map 100% to Y=10, 0% to Y=90 (Range is 80 units) */}
            {/* Y = 90 - (Value * 0.8) */}
            {/* 92.1% -> Y: 16.32 */}
            {/* 94.3% -> Y: 14.56 */}
            {/* 90.8% -> Y: 17.36 */}
            {/* 95.6% -> Y: 13.52 */}
            {/* 93.2% -> Y: 15.44 */}
            
            {/* X coordinates: 15, 35, 55, 75, 95 */}

            <path d="M 15,16.32 L 35,14.56 L 55,17.36 L 75,13.52 L 95,15.44" fill="none" stroke="#8b5cf6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M 15,16.32 L 35,14.56 L 55,17.36 L 75,13.52 L 95,15.44 L 95,90 L 15,90 Z" fill="url(#trendGradient)" />

            {/* Points & Labels */}
            {/* 1 */}
            <circle cx="15" cy="16.32" r="1.5" fill="white" stroke="#8b5cf6" strokeWidth="1" />
            <text x="15" y="11" fontSize="3.5" fill="#64748b" textAnchor="middle" fontWeight="bold">92.1%</text>
            <text x="15" y="100" fontSize="3.5" fill="#64748b" textAnchor="middle" fontWeight="bold">1-5 เม.ย.</text>

            {/* 2 */}
            <circle cx="35" cy="14.56" r="1.5" fill="white" stroke="#8b5cf6" strokeWidth="1" />
            <text x="35" y="9" fontSize="3.5" fill="#64748b" textAnchor="middle" fontWeight="bold">94.3%</text>
            <text x="35" y="100" fontSize="3.5" fill="#64748b" textAnchor="middle" fontWeight="bold">8-12 เม.ย.</text>

            {/* 3 */}
            <circle cx="55" cy="17.36" r="1.5" fill="white" stroke="#8b5cf6" strokeWidth="1" />
            <text x="55" y="12" fontSize="3.5" fill="#64748b" textAnchor="middle" fontWeight="bold">90.8%</text>
            <text x="55" y="100" fontSize="3.5" fill="#64748b" textAnchor="middle" fontWeight="bold">15-19 เม.ย.</text>

            {/* 4 */}
            <circle cx="75" cy="13.52" r="1.5" fill="white" stroke="#8b5cf6" strokeWidth="1" />
            <text x="75" y="8" fontSize="3.5" fill="#64748b" textAnchor="middle" fontWeight="bold">95.6%</text>
            <text x="75" y="100" fontSize="3.5" fill="#64748b" textAnchor="middle" fontWeight="bold">22-26 เม.ย.</text>

            {/* 5 (Current) */}
            <circle cx="95" cy="15.44" r="2" fill="#8b5cf6" />
            <circle cx="95" cy="15.44" r="4" fill="#8b5cf6" opacity="0.2" />
            <rect x="88" y="7" width="14" height="6" rx="2" fill="#8b5cf6" />
            <text x="95" y="11" fontSize="3.5" fill="white" textAnchor="middle" fontWeight="bold">93.2%</text>
            <text x="95" y="100" fontSize="3.5" fill="#1e293b" textAnchor="middle" fontWeight="bold">29 เม.ย. - 3 พ.ค.</text>

          </svg>
        </div>
      </div>
    </div>
  )
}
