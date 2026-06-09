import React from "react"
import { ChevronLeft, Filter, ChevronRight } from "lucide-react"

export function MobileSupportHeader() {
  return (
    <div className="bg-white sticky top-0 z-20 shadow-[0_2px_10px_rgba(0,0,0,0.02)] pt-6 pb-0 px-1">
      <div className="flex items-center justify-between px-3 pb-3">
        <button className="p-2 -ml-2 text-slate-800">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <span className="text-base font-bold text-slate-900">ดูแลช่วยเหลือ</span>
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
          <span className="px-2 py-0.5 bg-[#e0e7ff] text-[#4f46e5] text-[10px] font-bold rounded">กำลังศึกษา</span>
        </div>
        
        {/* Risk Level Mini */}
        <div className="flex flex-col items-end shrink-0 pl-3 border-l border-slate-100">
          <div className="text-[10px] text-slate-500 font-medium mb-1">ระดับความเสี่ยง</div>
          <div className="text-[13px] font-bold text-rose-600 mb-0.5">เสี่ยงสูง</div>
          <div className="flex items-center gap-1 text-[11px] font-bold text-slate-700">
            78 <span className="text-[9px] text-slate-400 font-medium">/ 100</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          </div>
        </div>
      </div>

      {/* Swipeable Tabs */}
      <div className="flex justify-between border-b border-slate-100 px-3 overflow-x-auto no-scrollbar pb-0 mt-2">
        <button className="pb-3 px-2 text-[13px] font-bold text-[#4f46e5] border-b-[3px] border-[#4f46e5] whitespace-nowrap">ภาพรวม</button>
        <button className="pb-3 px-2 text-[13px] font-medium text-slate-500 whitespace-nowrap hover:text-slate-800">ปัญหาและสาเหตุ</button>
        <button className="pb-3 px-2 text-[13px] font-medium text-slate-500 whitespace-nowrap hover:text-slate-800">การช่วยเหลือ</button>
        <button className="pb-3 px-2 text-[13px] font-medium text-slate-500 whitespace-nowrap hover:text-slate-800">บันทึกการให้คำปรึกษา</button>
        <button className="pb-3 px-2 text-[13px] font-medium text-slate-500 whitespace-nowrap hover:text-slate-800">ติดตามผล</button>
      </div>
    </div>
  )
}
