import React from "react"
import { Smile, Frown, AlertOctagon, Star, Medal } from "lucide-react"

export function MobileBehaviorStats() {
  return (
    <div className="grid grid-cols-2 gap-3 px-4 mb-4">
      
      {/* สรุปพฤติกรรม (Summary Table) */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-sm flex flex-col justify-between">
        <h3 className="text-[12px] font-bold text-slate-800 mb-3">สรุปพฤติกรรม</h3>
        
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-1.5 w-24">
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
              <span className="text-slate-600 truncate">พฤติกรรมดี</span>
            </div>
            <span className="font-bold text-slate-800">42 ครั้ง</span>
            <span className="text-emerald-500 w-8 text-right font-medium">60.0%</span>
          </div>

          <div className="flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-1.5 w-24">
              <div className="w-2 h-2 rounded-full bg-amber-500"></div>
              <span className="text-slate-600 truncate">พฤติกรรมปกติ</span>
            </div>
            <span className="font-bold text-slate-800">28 ครั้ง</span>
            <span className="text-emerald-500 w-8 text-right font-medium">40.0%</span>
          </div>

          <div className="flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-1.5 w-24">
              <div className="w-2 h-2 rounded-full bg-red-500"></div>
              <span className="text-slate-600 truncate">พฤติกรรมไม่พึงประสงค์</span>
            </div>
            <span className="font-bold text-slate-800">6 ครั้ง</span>
            <span className="text-red-500 w-8 text-right font-medium">8.6%</span>
          </div>

          <div className="flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-1.5 w-24">
              <Star className="w-3.5 h-3.5 text-blue-500 fill-blue-500" />
              <span className="text-slate-600 truncate">ชมเชย</span>
            </div>
            <span className="font-bold text-slate-800">18 ครั้ง</span>
            <span className="w-8"></span>
          </div>
        </div>
      </div>

      {/* ระดับพฤติกรรม */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-sm flex flex-col justify-center items-center relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 bg-gradient-to-b from-yellow-50 to-white opacity-50"></div>
        
        <div className="relative z-10 w-20 h-20 mb-3">
          {/* Custom SVG Medal Ribbon */}
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
            {/* Ribbons */}
            <path d="M35 70 L25 95 L40 85 Z" fill="#ef4444" />
            <path d="M65 70 L75 95 L60 85 Z" fill="#ef4444" />
            
            {/* Outer Gold Coin */}
            <circle cx="50" cy="45" r="35" fill="#fbbf24" />
            {/* Inner Gold Coin */}
            <circle cx="50" cy="45" r="28" fill="#f59e0b" />
            {/* Star */}
            <path d="M50 25 L55 38 L70 38 L58 47 L62 60 L50 52 L38 60 L42 47 L30 38 L45 38 Z" fill="#fef08a" />
          </svg>
        </div>

        <div className="relative z-10 text-center">
          <div className="text-[10px] font-bold text-slate-500 mb-0.5">ระดับพฤติกรรม</div>
          <div className="text-[22px] font-bold text-slate-800 leading-none mb-1">ดีมาก</div>
          <div className="text-[9px] text-slate-400 flex items-center justify-center gap-0.5">
            เกณฑ์ขั้นต่ำ 75 คะแนน
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
        </div>
      </div>

    </div>
  )
}
