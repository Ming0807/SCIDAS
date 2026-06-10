import React from "react"
import { ChevronLeft, Filter, Calendar as CalendarIcon, Clock } from "lucide-react"

export function MobileRiskHeader() {
  return (
    <div className="bg-white sticky top-0 z-20 shadow-[0_2px_10px_rgba(0,0,0,0.02)] pt-6 pb-0 px-1">
      <div className="flex items-center justify-between px-3 pb-3">
        <button className="p-2 -ml-2 text-slate-800">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <span className="text-base font-bold text-slate-900">วิเคราะห์ความเสี่ยง</span>
        <button className="flex items-center gap-1.5 text-indigo-600 text-[13px] font-bold px-2 py-1">
          <Filter className="w-4 h-4" />
          ตัวกรอง
        </button>
      </div>

      {/* Profile Section */}
      <div className="px-4 py-3 flex items-start justify-between">
        <div className="flex items-center gap-4">
          <img src="https://api.dicebear.com/7.x/notionists/svg?seed=boy1" alt="Avatar" className="w-16 h-16 rounded-full bg-slate-100 border border-slate-200" />
          <div className="flex flex-col">
            <h2 className="text-[16px] font-bold text-slate-900 leading-tight mb-0.5">เด็กชายธนวัฒน์ ใจดี</h2>
            <div className="text-[13px] text-slate-500 mb-2">ม.2/1 เลขที่ 5</div>
            <span className="px-2.5 py-0.5 bg-indigo-50 text-indigo-600 text-[10px] font-bold rounded-md w-max border border-indigo-100">กำลังศึกษา</span>
          </div>
        </div>

        <div className="flex flex-col gap-2 shrink-0 items-end">
          <button className="flex items-center gap-1.5 px-2 py-1 bg-white border border-slate-200 rounded-md shadow-sm text-[10px] font-bold text-slate-700">
            <CalendarIcon className="w-3 h-3 text-slate-400" />
            ภาคเรียนที่ 1/2567
            <svg className="w-3 h-3 text-slate-400 ml-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
          </button>
          <div className="flex items-center gap-1 text-[9px] text-slate-400">
            <Clock className="w-3 h-3" />
            ข้อมูลล่าสุด 1 พ.ค. 2567
          </div>
        </div>
      </div>

      {/* Swipeable Tabs */}
      <div className="flex justify-between border-b border-slate-100 px-3 overflow-x-auto no-scrollbar pb-0 mt-2">
        <button className="pb-3 px-2 text-[13px] font-bold text-[#4f46e5] border-b-[3px] border-[#4f46e5] whitespace-nowrap">ภาพรวม</button>
        <button className="pb-3 px-2 text-[13px] font-medium text-slate-500 whitespace-nowrap hover:text-slate-800">ปัจจัยความเสี่ยง</button>
        <button className="pb-3 px-2 text-[13px] font-medium text-slate-500 whitespace-nowrap hover:text-slate-800">แนวโน้ม</button>
        <button className="pb-3 px-2 text-[13px] font-medium text-slate-500 whitespace-nowrap hover:text-slate-800">คำแนะนำ</button>
        <button className="pb-3 px-2 text-[13px] font-medium text-slate-500 whitespace-nowrap hover:text-slate-800">ประวัติการช่วยเหลือ</button>
      </div>
    </div>
  )
}
