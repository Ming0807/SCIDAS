import React from "react"
import { ChevronLeft, Filter } from "lucide-react"

export function MobileAttendanceHeader() {
  return (
    <div className="bg-white sticky top-0 z-20 shadow-[0_2px_10px_rgba(0,0,0,0.02)] pt-6 pb-0 px-1">
      {/* Top Header */}
      <div className="flex items-center justify-between px-3 pb-3">
        <button className="p-2 -ml-2 text-slate-800">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <span className="text-base font-bold text-slate-900">การมาเรียน</span>
        <button className="flex items-center gap-1.5 text-blue-600 text-[13px] font-bold px-2 py-1">
          <Filter className="w-4 h-4" />
          ตัวกรอง
        </button>
      </div>

      {/* Swipeable Tabs */}
      <div className="flex justify-between border-b border-slate-100 px-3 overflow-x-auto no-scrollbar pb-0">
        <button className="pb-3 px-2 text-[13px] font-bold text-[#4f46e5] border-b-[3px] border-[#4f46e5] whitespace-nowrap">ภาพรวม</button>
        <button className="pb-3 px-2 text-[13px] font-medium text-slate-500 whitespace-nowrap hover:text-slate-800">รายวัน</button>
        <button className="pb-3 px-2 text-[13px] font-medium text-slate-500 whitespace-nowrap hover:text-slate-800">รายสัปดาห์</button>
        <button className="pb-3 px-2 text-[13px] font-medium text-slate-500 whitespace-nowrap hover:text-slate-800">รายเดือน</button>
        <button className="pb-3 px-2 text-[13px] font-medium text-slate-500 whitespace-nowrap hover:text-slate-800">รายภาคเรียน</button>
      </div>
    </div>
  )
}
