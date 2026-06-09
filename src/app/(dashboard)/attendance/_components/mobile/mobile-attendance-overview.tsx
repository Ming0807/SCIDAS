import React from "react"
import { Calendar, CheckCircle2, Clock, XCircle, MinusCircle } from "lucide-react"

export function MobileAttendanceOverview() {
  return (
    <div className="px-4 py-5">
      <div className="bg-gradient-to-br from-[#8b5cf6] to-[#4f46e5] rounded-3xl p-5 shadow-[0_8px_20px_rgba(79,70,229,0.2)] text-white relative overflow-hidden">
        {/* BG Blurs */}
        <div className="absolute -left-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
        <div className="absolute right-0 bottom-0 w-32 h-32 bg-white/5 rounded-full blur-xl"></div>
        
        {/* Card Header */}
        <div className="relative z-10 flex items-start justify-between mb-6">
          <div className="text-[13px] font-bold opacity-90">ภาพรวมการมาเรียน ภาคเรียนที่ 1/2567</div>
          <div className="flex items-center gap-1.5 text-[10px] font-medium bg-white/20 px-2 py-1 rounded-md backdrop-blur-sm">
            <Calendar className="w-3 h-3" />
            <span>1 พ.ค. 2567 - ปัจจุบัน</span>
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10 flex items-center justify-between gap-2">
          
          {/* Donut Chart */}
          <div className="relative w-[100px] h-[100px] shrink-0 flex items-center justify-center">
            {/* Background Circle */}
            <svg viewBox="0 0 36 36" className="absolute inset-0 w-full h-full transform -rotate-90">
              <circle cx="18" cy="18" r="15.915" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="3" />
              {/* Progress Circle (93.2%) */}
              <circle cx="18" cy="18" r="15.915" fill="none" stroke="#2dd4bf" strokeWidth="4" strokeDasharray="93.2 6.8" strokeDashoffset="0" strokeLinecap="round" />
            </svg>
            <div className="flex flex-col items-center justify-center z-10 text-center">
              <span className="text-[22px] font-bold leading-tight">93.2%</span>
              <span className="text-[8px] font-medium opacity-80 leading-tight w-14">อัตราการมาเรียน</span>
            </div>
            
            {/* Soft glow behind donut */}
            <div className="absolute inset-0 bg-[#2dd4bf] opacity-20 blur-xl rounded-full"></div>
          </div>

          {/* Stats Columns */}
          <div className="flex-1 flex items-center justify-between pl-3 border-l border-white/10">
            
            <div className="flex flex-col items-center flex-1">
              <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center mb-2 shadow-sm">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              </div>
              <span className="text-[10px] font-medium opacity-90 mb-1">มาเรียน</span>
              <span className="text-xl font-bold leading-none mb-0.5">186</span>
              <span className="text-[9px] opacity-70">ครั้ง</span>
            </div>

            <div className="w-[1px] h-10 bg-white/10"></div>

            <div className="flex flex-col items-center flex-1">
              <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center mb-2 shadow-sm">
                <Clock className="w-3.5 h-3.5 text-amber-500" />
              </div>
              <span className="text-[10px] font-medium opacity-90 mb-1">สาย</span>
              <span className="text-xl font-bold leading-none mb-0.5">12</span>
              <span className="text-[9px] opacity-70">ครั้ง</span>
            </div>

            <div className="w-[1px] h-10 bg-white/10"></div>

            <div className="flex flex-col items-center flex-1">
              <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center mb-2 shadow-sm">
                <XCircle className="w-3.5 h-3.5 text-red-500" />
              </div>
              <span className="text-[10px] font-medium opacity-90 mb-1">ขาด</span>
              <span className="text-xl font-bold leading-none mb-0.5">8</span>
              <span className="text-[9px] opacity-70">ครั้ง</span>
            </div>

            <div className="w-[1px] h-10 bg-white/10"></div>

            <div className="flex flex-col items-center flex-1">
              <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center mb-2 shadow-sm">
                <MinusCircle className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <span className="text-[10px] font-medium opacity-90 mb-1">ลากิจ/อื่นๆ</span>
              <span className="text-xl font-bold leading-none mb-0.5">6</span>
              <span className="text-[9px] opacity-70">ครั้ง</span>
            </div>

          </div>

        </div>
      </div>
    </div>
  )
}
