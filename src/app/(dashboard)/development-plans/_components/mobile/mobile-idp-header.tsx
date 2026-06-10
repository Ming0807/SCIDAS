import React from "react"
import { ChevronLeft, Filter, ChevronRight } from "lucide-react"

export function MobileIdpHeader() {
  return (
    <div className="bg-white sticky top-0 z-20 shadow-[0_2px_10px_rgba(0,0,0,0.02)] pt-6 pb-0 px-1">
      <div className="flex items-center justify-between px-3 pb-3">
        <button className="p-2 -ml-2 text-slate-800">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <span className="text-base font-bold text-slate-900">แผนพัฒนารายบุคคล</span>
        <button className="flex items-center gap-1.5 text-blue-600 text-[13px] font-bold px-2 py-1">
          <Filter className="w-4 h-4" />
          ตัวกรอง
        </button>
      </div>

      {/* Profile Summary */}
      <div className="px-4 py-2 flex items-center gap-4 mb-2">
        <img src="https://api.dicebear.com/7.x/notionists/svg?seed=boy1" alt="Avatar" className="w-14 h-14 rounded-full bg-slate-100 border border-slate-200" />
        <div className="flex-1 min-w-0">
          <h2 className="text-[15px] font-bold text-slate-900 leading-tight mb-0.5">เด็กชายธนวัฒน์ ใจดี</h2>
          <div className="text-[12px] text-slate-500 mb-1.5">ม.2/1 เลขที่ 5</div>
          <span className="px-2 py-0.5 bg-[#e0e7ff] text-[#4f46e5] text-[10px] font-bold rounded">กำลังติดตาม</span>
        </div>
        
        {/* Progress Circle Mini */}
        <div className="flex flex-col items-end shrink-0 pl-3 border-l border-slate-100">
          <div className="text-[10px] text-slate-500 font-medium mb-1">ความก้าวหน้าโดยรวม</div>
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-1 text-[11px] font-bold text-slate-700 mb-0.5">
              <span className="text-[13px]">62</span> <span className="text-[9px] text-slate-400 font-medium">/ 100 คะแนน</span>
            </div>
            <div className="text-[9px] font-bold text-emerald-600 flex items-center gap-0.5">
              <span className="text-[10px]">↑</span> เพิ่มขึ้น 8%
            </div>
          </div>
        </div>
        <div className="relative w-12 h-12 ml-2">
          <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
            <circle cx="18" cy="18" r="15.915" fill="none" stroke="#f1f5f9" strokeWidth="4" />
            <circle cx="18" cy="18" r="15.915" fill="none" stroke="#4f46e5" strokeWidth="4" strokeDasharray="62 100" />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[10px] font-bold text-slate-800 leading-none">62%</span>
          </div>
        </div>
      </div>

      {/* Swipeable Tabs */}
      <div className="flex justify-between border-b border-slate-100 px-3 overflow-x-auto no-scrollbar pb-0 mt-2">
        <button className="pb-3 px-2 text-[13px] font-bold text-[#4f46e5] border-b-[3px] border-[#4f46e5] whitespace-nowrap">ภาพรวม</button>
        <button className="pb-3 px-2 text-[13px] font-medium text-slate-500 whitespace-nowrap hover:text-slate-800">เป้าหมาย</button>
        <button className="pb-3 px-2 text-[13px] font-medium text-slate-500 whitespace-nowrap hover:text-slate-800">กิจกรรม</button>
        <button className="pb-3 px-2 text-[13px] font-medium text-slate-500 whitespace-nowrap hover:text-slate-800">ติดตามผล</button>
      </div>
    </div>
  )
}
