import React from "react"
import { CheckCircle2, Clock, XCircle, MinusCircle, Trophy } from "lucide-react"

export function MobileAttendanceStats() {
  return (
    <div className="grid grid-cols-2 gap-3 px-4 mb-4">
      
      {/* สรุปการมาเรียน (Summary Table) */}
      <div className="bg-white rounded-3xl p-4 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100 flex flex-col justify-between">
        <h3 className="text-[12px] font-bold text-slate-800 mb-3">สรุปการมาเรียน</h3>
        
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-1.5 w-16">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-slate-600">มาเรียน</span>
            </div>
            <span className="font-bold text-slate-800">186 ครั้ง</span>
            <span className="text-slate-400 w-8 text-right">93.2%</span>
          </div>

          <div className="flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-1.5 w-16">
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-slate-600">สาย</span>
            </div>
            <span className="font-bold text-slate-800">12 ครั้ง</span>
            <span className="text-slate-400 w-8 text-right">6.0%</span>
          </div>

          <div className="flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-1.5 w-16">
              <XCircle className="w-3.5 h-3.5 text-red-500" />
              <span className="text-slate-600">ขาด</span>
            </div>
            <span className="font-bold text-slate-800">8 ครั้ง</span>
            <span className="text-slate-400 w-8 text-right">4.0%</span>
          </div>

          <div className="flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-1.5 w-16">
              <MinusCircle className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-600 truncate">ลากิจ/อื่นๆ</span>
            </div>
            <span className="font-bold text-slate-800">6 ครั้ง</span>
            <span className="text-slate-400 w-8 text-right">3.0%</span>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-1.5 w-16">
            <div className="w-3.5 h-3.5 flex items-center justify-center"><div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div></div>
            <span className="font-bold text-slate-800">รวม</span>
          </div>
          <span className="font-bold text-slate-800">212 ครั้ง</span>
          <span className="font-bold text-slate-800 w-8 text-right">100%</span>
        </div>
      </div>

      {/* เปรียบเทียบกับเกณฑ์ (Gauge Chart) */}
      <div className="bg-white rounded-3xl p-4 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100 flex flex-col justify-between">
        <h3 className="text-[12px] font-bold text-slate-800 mb-2">เปรียบเทียบกับเกณฑ์</h3>
        
        <div className="flex-1 flex flex-col items-center justify-center">
          {/* Gauge Chart SVG */}
          <div className="relative w-32 h-16 mt-2 overflow-hidden">
            <svg viewBox="0 0 100 50" className="w-full h-full overflow-visible">
              {/* Background Arc */}
              <path d="M 10,50 A 40,40 0 0,1 90,50" fill="none" stroke="#f1f5f9" strokeWidth="8" strokeLinecap="round" />
              {/* Threshold Arc (80%) */}
              <path d="M 10,50 A 40,40 0 0,1 74,26" fill="none" stroke="#2dd4bf" strokeWidth="8" strokeLinecap="round" />
              {/* Current Value Arc (93.2%) */}
              <path d="M 10,50 A 40,40 0 0,1 86,37" fill="none" stroke="#10b981" strokeWidth="8" strokeLinecap="round" />
              
              {/* Thumb marker at 93.2% */}
              <circle cx="86" cy="37" r="4" fill="white" stroke="#10b981" strokeWidth="2" />
              <circle cx="86" cy="37" r="1.5" fill="#8b5cf6" />
            </svg>
            <div className="absolute inset-x-0 bottom-0 flex flex-col items-center">
              <span className="text-xl font-bold text-slate-800 leading-none">93.2%</span>
            </div>
          </div>

          <div className="flex items-center gap-1 mt-3">
            <Trophy className="w-3.5 h-3.5 text-emerald-500" />
            <span className="text-[11px] font-bold text-emerald-600">สูงกว่าเกณฑ์</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-1">เกณฑ์ขั้นต่ำ 80%</div>
        </div>
      </div>

    </div>
  )
}
