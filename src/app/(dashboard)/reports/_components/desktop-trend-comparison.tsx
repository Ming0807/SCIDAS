import React from "react"
import { ChevronDown } from "lucide-react"

export function DesktopTrendComparison() {
  return (
    <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[14px] font-bold text-slate-800">แนวโน้มเปรียบเทียบ</h3>
        <button className="flex items-center gap-1 text-[11px] font-bold text-slate-700 border border-slate-200 px-2 py-1 rounded-md hover:bg-slate-50">
          เปรียบเทียบ 2 ภาคเรียน
          <ChevronDown className="w-3 h-3" />
        </button>
      </div>

      <div className="flex items-center justify-center gap-6 mb-6">
        <div className="flex items-center gap-2">
          <div className="w-4 h-0.5 bg-red-500 rounded-full"></div>
          <span className="text-[11px] font-medium text-slate-600">กลุ่มเสี่ยง</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-0.5 bg-yellow-400 rounded-full"></div>
          <span className="text-[11px] font-medium text-slate-600">อยู่ระหว่างการดูแล</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-0.5 bg-green-500 rounded-full"></div>
          <span className="text-[11px] font-medium text-slate-600">ช่วยเหลือสำเร็จ</span>
        </div>
      </div>

      <div className="flex-1 relative min-h-[160px] pb-6 ml-6 mt-2">
        <div className="absolute -left-8 top-0 bottom-6 flex flex-col justify-between py-0 w-8 items-end pr-2">
          <span className="text-[10px] text-slate-400 font-medium">250</span>
          <span className="text-[10px] text-slate-400 font-medium">200</span>
          <span className="text-[10px] text-slate-400 font-medium">150</span>
          <span className="text-[10px] text-slate-400 font-medium">100</span>
          <span className="text-[10px] text-slate-400 font-medium">50</span>
          <span className="text-[10px] text-slate-400 font-medium">0</span>
        </div>

        <svg className="w-full h-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
          {/* Grid lines */}
          <line x1="0" y1="20" x2="100" y2="20" stroke="#f1f5f9" strokeWidth="0.5" />
          <line x1="0" y1="40" x2="100" y2="40" stroke="#f1f5f9" strokeWidth="0.5" />
          <line x1="0" y1="60" x2="100" y2="60" stroke="#f1f5f9" strokeWidth="0.5" />
          <line x1="0" y1="80" x2="100" y2="80" stroke="#f1f5f9" strokeWidth="0.5" />
          <line x1="0" y1="100" x2="100" y2="100" stroke="#e2e8f0" strokeWidth="1" />

          {/* Red Line */}
          <path d="M 20,40 L 50,35 L 80,45" fill="none" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="20" cy="40" r="1.5" fill="#fff" stroke="#ef4444" strokeWidth="1" />
          <circle cx="50" cy="35" r="1.5" fill="#fff" stroke="#ef4444" strokeWidth="1" />
          <circle cx="80" cy="45" r="1.5" fill="#fff" stroke="#ef4444" strokeWidth="1" />

          {/* Yellow Line */}
          <path d="M 20,80 L 50,75 L 80,90" fill="none" stroke="#eab308" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="20" cy="80" r="1.5" fill="#fff" stroke="#eab308" strokeWidth="1" />
          <circle cx="50" cy="75" r="1.5" fill="#fff" stroke="#eab308" strokeWidth="1" />
          <circle cx="80" cy="90" r="1.5" fill="#fff" stroke="#eab308" strokeWidth="1" />

          {/* Green Line */}
          <path d="M 20,60 L 50,55 L 80,30" fill="none" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="20" cy="60" r="1.5" fill="#fff" stroke="#22c55e" strokeWidth="1" />
          <circle cx="50" cy="55" r="1.5" fill="#fff" stroke="#22c55e" strokeWidth="1" />
          <circle cx="80" cy="30" r="1.5" fill="#fff" stroke="#22c55e" strokeWidth="1" />

          {/* X Axis Labels */}
          <text x="20" y="112" fontSize="5" fill="#94a3b8" textAnchor="middle">ภาคเรียน 2/2566</text>
          <text x="80" y="112" fontSize="5" fill="#94a3b8" textAnchor="middle">ภาคเรียน 1/2567</text>
        </svg>
      </div>

    </div>
  )
}
