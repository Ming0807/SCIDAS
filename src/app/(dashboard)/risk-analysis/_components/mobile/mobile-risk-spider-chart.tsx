import React from "react"
import { Calendar as CalendarIcon, BookOpen, Smile, Home, Activity } from "lucide-react"

export function MobileRiskSpiderChart() {
  return (
    <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col h-full">
      <h3 className="text-[13px] font-bold text-slate-800 mb-6">ปัจจัยความเสี่ยง 5 ด้าน</h3>

      <div className="flex-1 flex items-center justify-center relative mb-6">
        
        {/* Placeholder for Spider Chart */}
        <div className="relative w-[200px] h-[200px]">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {/* Grid Lines */}
            <polygon points="50,10 90,38 75,85 25,85 10,38" fill="none" stroke="#f1f5f9" strokeWidth="1" />
            <polygon points="50,30 70,45 62,70 38,70 30,45" fill="none" stroke="#f1f5f9" strokeWidth="1" />
            <polygon points="50,50 50,50 50,50 50,50 50,50" fill="#f8fafc" />
            
            <line x1="50" y1="50" x2="50" y2="10" stroke="#f1f5f9" strokeWidth="1" />
            <line x1="50" y1="50" x2="90" y2="38" stroke="#f1f5f9" strokeWidth="1" />
            <line x1="50" y1="50" x2="75" y2="85" stroke="#f1f5f9" strokeWidth="1" />
            <line x1="50" y1="50" x2="25" y2="85" stroke="#f1f5f9" strokeWidth="1" />
            <line x1="50" y1="50" x2="10" y2="38" stroke="#f1f5f9" strokeWidth="1" />

            {/* Average Data (Dashed line) */}
            <polygon points="50,35 65,42 55,60 45,60 35,42" fill="none" stroke="#94a3b8" strokeWidth="1" strokeDasharray="2 2" />

            {/* Student Data (Red line) */}
            <polygon points="50,16 78,40 68,76 35,70 14,35" fill="rgba(239, 68, 68, 0.1)" stroke="#ef4444" strokeWidth="1.5" />
            
            <circle cx="50" cy="16" r="2" fill="#ef4444" />
            <circle cx="78" cy="40" r="2" fill="#ef4444" />
            <circle cx="68" cy="76" r="2" fill="#ef4444" />
            <circle cx="35" cy="70" r="2" fill="#ef4444" />
            <circle cx="14" cy="35" r="2" fill="#ef4444" />
          </svg>
          
          {/* Labels */}
          <div className="absolute -top-4 left-[50%] -translate-x-[50%] flex flex-col items-center">
            <div className="w-6 h-6 rounded bg-red-50 flex items-center justify-center mb-0.5">
              <CalendarIcon className="w-3.5 h-3.5 text-red-500" />
            </div>
            <span className="text-[9px] font-bold text-slate-700">การมาเรียน</span>
            <span className="text-[10px] font-bold text-slate-900">85<span className="text-[8px] text-slate-400">/ 100</span></span>
          </div>

          <div className="absolute top-[30%] -right-8 flex flex-col items-center">
            <div className="w-6 h-6 rounded bg-orange-50 flex items-center justify-center mb-0.5">
              <BookOpen className="w-3.5 h-3.5 text-orange-500" />
            </div>
            <span className="text-[9px] font-bold text-slate-700">ผลการเรียน</span>
            <span className="text-[10px] font-bold text-slate-900">70<span className="text-[8px] text-slate-400">/ 100</span></span>
          </div>

          <div className="absolute bottom-2 -right-2 flex flex-col items-center">
            <div className="w-6 h-6 rounded bg-green-50 flex items-center justify-center mb-0.5">
              <Smile className="w-3.5 h-3.5 text-green-500" />
            </div>
            <span className="text-[9px] font-bold text-slate-700">พฤติกรรม</span>
            <span className="text-[10px] font-bold text-slate-900">60<span className="text-[8px] text-slate-400">/ 100</span></span>
          </div>

          <div className="absolute bottom-2 -left-6 flex flex-col items-center">
            <div className="w-6 h-6 rounded bg-purple-50 flex items-center justify-center mb-0.5">
              <Activity className="w-3.5 h-3.5 text-purple-500" />
            </div>
            <span className="text-[9px] font-bold text-slate-700">สภาพอารมณ์</span>
            <span className="text-[10px] font-bold text-slate-900">65<span className="text-[8px] text-slate-400">/ 100</span></span>
          </div>

          <div className="absolute top-[35%] -left-10 flex flex-col items-center">
            <div className="w-6 h-6 rounded bg-blue-50 flex items-center justify-center mb-0.5">
              <Home className="w-3.5 h-3.5 text-blue-500" />
            </div>
            <span className="text-[9px] font-bold text-slate-700">สภาพครอบครัว</span>
            <span className="text-[10px] font-bold text-slate-900">90<span className="text-[8px] text-slate-400">/ 100</span></span>
          </div>

        </div>
      </div>

      <div className="flex items-center justify-center gap-6 mt-auto">
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-0.5 bg-red-500"></div>
          <span className="text-[10px] font-bold text-slate-700">นักเรียนคนนี้</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-0.5 bg-slate-400 border border-dashed border-slate-400"></div>
          <span className="text-[10px] text-slate-500 font-medium">ค่าเฉลี่ยระดับชั้น</span>
        </div>
      </div>
    </div>
  )
}
