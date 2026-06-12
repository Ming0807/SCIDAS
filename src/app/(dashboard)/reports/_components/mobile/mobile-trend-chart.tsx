import React from "react"
import { ChevronDown } from "lucide-react"

export function MobileTrendChart() {
  return (
    <div className="px-4 mb-6">
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
        
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-800">แนวโน้ม 6 เดือนล่าสุด</h3>
          <button className="flex items-center gap-1 text-xs font-bold text-slate-600 border border-slate-200 px-2 py-1 rounded-md">
            6 เดือนล่าสุด
            <ChevronDown className="w-3 h-3" />
          </button>
        </div>

        <div className="flex items-center gap-4 mb-6 flex-wrap">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
            <span className="text-xs text-slate-500">การมาเรียน</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-orange-400"></div>
            <span className="text-xs text-slate-500">ผลการเรียน</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
            <span className="text-xs text-slate-500">พฤติกรรม</span>
          </div>
        </div>

        <div className="relative h-[150px] pb-6 ml-6">
          <div className="absolute -left-6 top-0 bottom-6 flex flex-col justify-between py-0 w-5 items-end pr-1">
            <span className="text-xs text-slate-400">100</span>
            <span className="text-xs text-slate-400">75</span>
            <span className="text-xs text-slate-400">50</span>
            <span className="text-xs text-slate-400">25</span>
            <span className="text-xs text-slate-400">0</span>
          </div>

          <svg className="w-full h-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
            {/* Grid lines */}
            <line x1="0" y1="25" x2="100" y2="25" stroke="#f1f5f9" strokeWidth="0.5" />
            <line x1="0" y1="50" x2="100" y2="50" stroke="#f1f5f9" strokeWidth="0.5" />
            <line x1="0" y1="75" x2="100" y2="75" stroke="#f1f5f9" strokeWidth="0.5" />
            <line x1="0" y1="100" x2="100" y2="100" stroke="#e2e8f0" strokeWidth="1" />

            {/* Blue Line (Attendance) */}
            <path d="M 5,15 L 23,17 L 41,18 L 59,25 L 77,28 L 95,29" fill="none" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="5" cy="15" r="1.5" fill="#3b82f6" />
            <circle cx="23" cy="17" r="1.5" fill="#3b82f6" />
            <circle cx="41" cy="18" r="1.5" fill="#3b82f6" />
            <circle cx="59" cy="25" r="1.5" fill="#3b82f6" />
            <circle cx="77" cy="28" r="1.5" fill="#3b82f6" />
            <circle cx="95" cy="29" r="1.5" fill="#3b82f6" />

            {/* Orange Line (GPA mapped to 0-100 scale) */}
            <path d="M 5,50 L 23,58 L 41,50 L 59,51 L 77,53 L 95,58" fill="none" stroke="#f97316" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="5" cy="50" r="1.5" fill="#f97316" />
            <circle cx="23" cy="58" r="1.5" fill="#f97316" />
            <circle cx="41" cy="50" r="1.5" fill="#f97316" />
            <circle cx="59" cy="51" r="1.5" fill="#f97316" />
            <circle cx="77" cy="53" r="1.5" fill="#f97316" />
            <circle cx="95" cy="58" r="1.5" fill="#f97316" />

            {/* Green Line (Behavior) */}
            <path d="M 5,25 L 23,35 L 41,10 L 59,10 L 77,7 L 95,12" fill="none" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="5" cy="25" r="1.5" fill="#22c55e" />
            <circle cx="23" cy="35" r="1.5" fill="#22c55e" />
            <circle cx="41" cy="10" r="1.5" fill="#22c55e" />
            <circle cx="59" cy="10" r="1.5" fill="#22c55e" />
            <circle cx="77" cy="7" r="1.5" fill="#22c55e" />
            <circle cx="95" cy="12" r="1.5" fill="#22c55e" />

            {/* X Axis Labels */}
            <text x="5" y="112" fontSize="5.5" fill="#94a3b8" textAnchor="middle" fontWeight="bold">พ.ย. 66</text>
            <text x="23" y="112" fontSize="5.5" fill="#94a3b8" textAnchor="middle" fontWeight="bold">ธ.ค. 66</text>
            <text x="41" y="112" fontSize="5.5" fill="#94a3b8" textAnchor="middle" fontWeight="bold">ม.ค. 67</text>
            <text x="59" y="112" fontSize="5.5" fill="#94a3b8" textAnchor="middle" fontWeight="bold">ก.พ. 67</text>
            <text x="77" y="112" fontSize="5.5" fill="#94a3b8" textAnchor="middle" fontWeight="bold">มี.ค. 67</text>
            <text x="95" y="112" fontSize="5.5" fill="#94a3b8" textAnchor="middle" fontWeight="bold">เม.ย. 67</text>
          </svg>
        </div>

      </div>
    </div>
  )
}
