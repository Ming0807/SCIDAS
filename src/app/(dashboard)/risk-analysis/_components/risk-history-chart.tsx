import React from "react"
import { ChevronDown } from "lucide-react"

export function RiskHistoryChart() {
  return (
    <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[14px] font-bold text-slate-800">แนวโน้มความเสี่ยงย้อนหลัง</h3>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-500">ช่วงเวลา</span>
          <button className="flex items-center gap-1 text-[11px] font-bold text-slate-700 border border-slate-200 px-2 py-1 rounded-md hover:bg-slate-50">
            6 เดือน
            <ChevronDown className="w-3 h-3" />
          </button>
        </div>
      </div>

      <div className="flex items-center justify-center gap-6 mb-6">
        <div className="flex items-center gap-2">
          <div className="w-4 h-0.5 bg-red-500 rounded-full"></div>
          <span className="text-[11px] font-medium text-slate-600">เสี่ยงสูง</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-0.5 bg-yellow-400 rounded-full"></div>
          <span className="text-[11px] font-medium text-slate-600">เสี่ยงปานกลาง</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-0.5 bg-green-500 rounded-full"></div>
          <span className="text-[11px] font-medium text-slate-600">เสี่ยงต่ำ</span>
        </div>
      </div>

      <div className="flex-1 relative min-h-[180px] pb-6 ml-6 mt-2">
        <div className="absolute -left-8 top-0 bottom-6 flex flex-col justify-between py-0 w-8 items-end pr-2">
          <span className="text-[9px] text-slate-500">จำนวน (คน)</span>
          <span className="text-[10px] text-slate-400 font-medium">600</span>
          <span className="text-[10px] text-slate-400 font-medium">450</span>
          <span className="text-[10px] text-slate-400 font-medium">300</span>
          <span className="text-[10px] text-slate-400 font-medium">150</span>
          <span className="text-[10px] text-slate-400 font-medium">0</span>
        </div>

        <svg className="w-full h-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
          {/* Grid lines */}
          <line x1="0" y1="20" x2="100" y2="20" stroke="#f1f5f9" strokeWidth="0.5" />
          <line x1="0" y1="40" x2="100" y2="40" stroke="#f1f5f9" strokeWidth="0.5" />
          <line x1="0" y1="60" x2="100" y2="60" stroke="#f1f5f9" strokeWidth="0.5" />
          <line x1="0" y1="80" x2="100" y2="80" stroke="#f1f5f9" strokeWidth="0.5" />
          <line x1="0" y1="100" x2="100" y2="100" stroke="#e2e8f0" strokeWidth="1" />

          {/* Green Line (Low Risk) */}
          <path d="M 5,30 L 23,25 L 41,26 L 59,25 L 77,28 L 95,35" fill="none" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="5" cy="30" r="1.5" fill="#fff" stroke="#22c55e" strokeWidth="1" />
          <circle cx="23" cy="25" r="1.5" fill="#fff" stroke="#22c55e" strokeWidth="1" />
          <circle cx="41" cy="26" r="1.5" fill="#fff" stroke="#22c55e" strokeWidth="1" />
          <circle cx="59" cy="25" r="1.5" fill="#fff" stroke="#22c55e" strokeWidth="1" />
          <circle cx="77" cy="28" r="1.5" fill="#fff" stroke="#22c55e" strokeWidth="1" />
          <circle cx="95" cy="35" r="1.5" fill="#fff" stroke="#22c55e" strokeWidth="1" />

          {/* Yellow Line (Medium Risk) */}
          <path d="M 5,85 L 23,80 L 41,80 L 59,82 L 77,82 L 95,85" fill="none" stroke="#eab308" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="5" cy="85" r="1.5" fill="#fff" stroke="#eab308" strokeWidth="1" />
          <circle cx="23" cy="80" r="1.5" fill="#fff" stroke="#eab308" strokeWidth="1" />
          <circle cx="41" cy="80" r="1.5" fill="#fff" stroke="#eab308" strokeWidth="1" />
          <circle cx="59" cy="82" r="1.5" fill="#fff" stroke="#eab308" strokeWidth="1" />
          <circle cx="77" cy="82" r="1.5" fill="#fff" stroke="#eab308" strokeWidth="1" />
          <circle cx="95" cy="85" r="1.5" fill="#fff" stroke="#eab308" strokeWidth="1" />

          {/* Red Line (High Risk) */}
          <path d="M 5,95 L 23,94 L 41,94 L 59,96 L 77,95 L 95,96" fill="none" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="5" cy="95" r="1.5" fill="#fff" stroke="#ef4444" strokeWidth="1" />
          <circle cx="23" cy="94" r="1.5" fill="#fff" stroke="#ef4444" strokeWidth="1" />
          <circle cx="41" cy="94" r="1.5" fill="#fff" stroke="#ef4444" strokeWidth="1" />
          <circle cx="59" cy="96" r="1.5" fill="#fff" stroke="#ef4444" strokeWidth="1" />
          <circle cx="77" cy="95" r="1.5" fill="#fff" stroke="#ef4444" strokeWidth="1" />
          <circle cx="95" cy="96" r="1.5" fill="#fff" stroke="#ef4444" strokeWidth="1" />

          {/* X Axis Labels */}
          <text x="5" y="112" fontSize="5" fill="#94a3b8" textAnchor="middle">พ.ค. 67</text>
          <text x="23" y="112" fontSize="5" fill="#94a3b8" textAnchor="middle">มิ.ย. 67</text>
          <text x="41" y="112" fontSize="5" fill="#94a3b8" textAnchor="middle">ก.ค. 67</text>
          <text x="59" y="112" fontSize="5" fill="#94a3b8" textAnchor="middle">ส.ค. 67</text>
          <text x="77" y="112" fontSize="5" fill="#94a3b8" textAnchor="middle">ก.ย. 67</text>
          <text x="95" y="112" fontSize="5" fill="#94a3b8" textAnchor="middle">ต.ค. 67</text>
        </svg>
      </div>

    </div>
  )
}
