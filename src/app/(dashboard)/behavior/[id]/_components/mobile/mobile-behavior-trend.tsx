import React from "react"
import { Info, ChevronDown } from "lucide-react"

export function MobileBehaviorTrend() {
  return (
    <div className="px-4 mb-4">
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-1.5">
            <h3 className="text-[13px] font-bold text-slate-800">แนวโน้มพฤติกรรมรายสัปดาห์</h3>
            <Info className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <button className="flex items-center gap-1 text-[11px] font-medium text-slate-500 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
            สัปดาห์ล่าสุด 8 สัปดาห์
            <ChevronDown className="w-3 h-3" />
          </button>
        </div>

        {/* SVG Chart */}
        <div className="relative w-full h-[160px] flex items-end ml-2 pb-6">
          <svg className="w-full h-full overflow-visible" viewBox="0 0 100 80" preserveAspectRatio="none">
            
            {/* Y-axis grid lines & labels */}
            <line x1="10" y1="10" x2="100" y2="10" stroke="#f1f5f9" strokeWidth="0.5" />
            <text x="8" y="10" fontSize="3.5" fill="#94a3b8" textAnchor="end" dominantBaseline="middle">100</text>

            <line x1="10" y1="30" x2="100" y2="30" stroke="#f1f5f9" strokeWidth="0.5" strokeDasharray="2 2" />
            <text x="8" y="30" fontSize="3.5" fill="#94a3b8" textAnchor="end" dominantBaseline="middle">75</text>

            <line x1="10" y1="50" x2="100" y2="50" stroke="#f1f5f9" strokeWidth="0.5" strokeDasharray="2 2" />
            <text x="8" y="50" fontSize="3.5" fill="#94a3b8" textAnchor="end" dominantBaseline="middle">50</text>

            <line x1="10" y1="70" x2="100" y2="70" stroke="#f1f5f9" strokeWidth="0.5" strokeDasharray="2 2" />
            <text x="8" y="70" fontSize="3.5" fill="#94a3b8" textAnchor="end" dominantBaseline="middle">25</text>

            <line x1="10" y1="90" x2="100" y2="90" stroke="#f1f5f9" strokeWidth="0.5" />
            <text x="8" y="90" fontSize="3.5" fill="#94a3b8" textAnchor="end" dominantBaseline="middle">0</text>

            {/* Area gradient */}
            <defs>
              <linearGradient id="trendGradientBehavior" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Values: 76, 82, 78, 84, 88, 82, 86, 85 */}
            {/* Map 100 to Y=10, 0 to Y=90 (Range is 80 units) */}
            {/* Y = 90 - (Value * 0.8) */}
            
            <path d="M 12,29.2 L 24,24.4 L 36,27.6 L 48,22.8 L 60,19.6 L 72,24.4 L 84,21.2 L 96,22.0" fill="none" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M 12,29.2 L 24,24.4 L 36,27.6 L 48,22.8 L 60,19.6 L 72,24.4 L 84,21.2 L 96,22.0 L 96,90 L 12,90 Z" fill="url(#trendGradientBehavior)" />

            {/* Points & Labels */}
            {[{ x: 12, y: 29.2, v: 76, l: "10-16 มี.ค." },
              { x: 24, y: 24.4, v: 82, l: "17-23 มี.ค." },
              { x: 36, y: 27.6, v: 78, l: "24-30 มี.ค." },
              { x: 48, y: 22.8, v: 84, l: "31 มี.ค.-6 เม.ย." },
              { x: 60, y: 19.6, v: 88, l: "7-13 เม.ย." },
              { x: 72, y: 24.4, v: 82, l: "14-20 เม.ย." },
              { x: 84, y: 21.2, v: 86, l: "21-27 เม.ย." }].map((p, i) => (
              <React.Fragment key={i}>
                <circle cx={p.x} cy={p.y} r="1.5" fill="#10b981" />
                <text x={p.x} y={p.y - 4} fontSize="3.5" fill="#64748b" textAnchor="middle" fontWeight="bold">{p.v}</text>
                <text x={p.x} y="100" fontSize="2.5" fill="#64748b" textAnchor="middle" fontWeight="bold">{p.l}</text>
              </React.Fragment>
            ))}

            {/* Current Point */}
            <circle cx="96" cy="22.0" r="2" fill="white" stroke="#10b981" strokeWidth="1.5" />
            <text x="96" y="17" fontSize="3.5" fill="#1e293b" textAnchor="middle" fontWeight="bold">85</text>
            <text x="96" y="100" fontSize="2.5" fill="#1e293b" textAnchor="middle" fontWeight="bold">28 เม.ย.-4 พ.ค.</text>

          </svg>
        </div>
      </div>
    </div>
  )
}
