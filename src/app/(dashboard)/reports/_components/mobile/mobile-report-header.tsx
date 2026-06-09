import React from "react"
import { ChevronLeft, Filter, Calendar as CalendarIcon, Clock } from "lucide-react"

export function MobileReportHeader() {
  return (
    <div className="bg-white sticky top-0 z-20 shadow-[0_2px_10px_rgba(0,0,0,0.02)] pt-6 pb-0 px-1">
      <div className="flex items-center justify-between px-3 pb-3">
        <button className="p-2 -ml-2 text-slate-800">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <span className="text-base font-bold text-slate-900">รายงาน</span>
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
        <button className="pb-3 px-2 text-[13px] font-medium text-slate-500 whitespace-nowrap hover:text-slate-800">การมาเรียน</button>
        <button className="pb-3 px-2 text-[13px] font-medium text-slate-500 whitespace-nowrap hover:text-slate-800">ผลการเรียน</button>
        <button className="pb-3 px-2 text-[13px] font-medium text-slate-500 whitespace-nowrap hover:text-slate-800">พฤติกรรม</button>
        <button className="pb-3 px-2 text-[13px] font-medium text-slate-500 whitespace-nowrap hover:text-slate-800">ดูแลช่วยเหลือ</button>
        <button className="pb-3 px-2 text-[13px] font-medium text-slate-500 whitespace-nowrap hover:text-slate-800 flex items-center gap-1">อื่นๆ <ChevronLeft className="w-3 h-3 transform -rotate-90" /></button>
      </div>
      
      {/* Hero Banner */}
      <div className="px-4 mt-2 mb-6">
        <div className="bg-indigo-600 rounded-2xl p-5 relative overflow-hidden flex items-center justify-between">
          <div className="relative z-10">
            <h3 className="text-[16px] font-bold mb-1 text-white">ภาพรวมรายงานนักเรียน</h3>
            <span className="text-[12px] text-indigo-100">ภาคเรียนที่ 1/2567</span>
          </div>
          <div className="relative z-10 w-24 h-16 flex items-center justify-end">
             {/* Simple decorative chart icon */}
             <div className="w-16 h-16 relative">
               <div className="absolute inset-0 bg-white/20 rounded-xl backdrop-blur-sm"></div>
               <div className="absolute inset-2 flex items-end gap-1 pb-1 px-1">
                 <div className="w-full bg-white rounded-t-sm" style={{height: '40%'}}></div>
                 <div className="w-full bg-white/60 rounded-t-sm" style={{height: '70%'}}></div>
                 <div className="w-full bg-white rounded-t-sm" style={{height: '100%'}}></div>
               </div>
             </div>
          </div>
          
          {/* Decorative circles */}
          <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-white/10 blur-2xl"></div>
          <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-24 h-24 rounded-full bg-indigo-600/20 blur-xl"></div>
        </div>
      </div>

    </div>
  )
}
