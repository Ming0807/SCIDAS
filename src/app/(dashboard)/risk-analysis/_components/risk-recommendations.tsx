import React from "react"
import { ChevronRight, ShieldAlert, HeartPulse, BookOpen, Clock } from "lucide-react"

export function RiskRecommendations() {
  return (
    <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm h-full flex flex-col">
      <h3 className="text-[14px] font-bold text-slate-800 mb-4">ข้อเสนอแนะ</h3>

      <div className="flex flex-col gap-3 flex-1">
        
        <div className="flex items-center gap-3 p-3 rounded-xl border border-red-100 bg-red-50/50 hover:bg-red-50 transition-colors cursor-pointer group">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-5 h-5 text-red-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-[12px] font-bold text-slate-800">กลุ่มเสี่ยงสูง</h4>
            <p className="text-[10px] text-slate-500 truncate">ควรดำเนินการช่วยเหลือเร่งด่วนและติดตามอย่างใกล้ชิด</p>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-red-500" />
        </div>

        <div className="flex items-center gap-3 p-3 rounded-xl border border-yellow-100 bg-yellow-50/50 hover:bg-yellow-50 transition-colors cursor-pointer group">
          <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center shrink-0">
            <HeartPulse className="w-5 h-5 text-yellow-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-[12px] font-bold text-slate-800">กลุ่มเสี่ยงปานกลาง</h4>
            <p className="text-[10px] text-slate-500 truncate">ควรวางแผนป้องกันและส่งเสริมอย่างต่อเนื่อง</p>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-yellow-600" />
        </div>

        <div className="flex items-center gap-3 p-3 rounded-xl border border-green-100 bg-green-50/50 hover:bg-green-50 transition-colors cursor-pointer group">
          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center shrink-0">
            <BookOpen className="w-5 h-5 text-green-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-[12px] font-bold text-slate-800">ปัจจัยเสี่ยงด้านการเรียน</h4>
            <p className="text-[10px] text-slate-500 truncate">ควรจัดกิจกรรมเสริมการเรียนรู้และติวเข้ม</p>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-green-600" />
        </div>

        <div className="flex items-center gap-3 p-3 rounded-xl border border-blue-100 bg-blue-50/50 hover:bg-blue-50 transition-colors cursor-pointer group">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-[12px] font-bold text-slate-800">ติดตามผล</h4>
            <p className="text-[10px] text-slate-500 truncate">ติดตามและประเมินซ้ำทุก 1 เดือน</p>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
        </div>

      </div>

      <button className="w-full mt-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[13px] rounded-xl transition-colors shadow-md shadow-indigo-200 flex items-center justify-center gap-2">
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
        สร้างแผนช่วยเหลือกลุ่มเสี่ยง
      </button>

    </div>
  )
}
