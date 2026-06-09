import React from "react"
import { Users, Heart, CheckCircle2, Clock, ChevronRight } from "lucide-react"

export function MobileSupportSummary() {
  return (
    <div className="px-4 py-5">
      <h3 className="text-[13px] font-bold text-slate-800 mb-3">สรุปการดูแลช่วยเหลือ</h3>
      
      <div className="grid grid-cols-2 gap-3">
        
        {/* Card 1 */}
        <div className="bg-white rounded-2xl p-3 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100 flex flex-col items-center text-center">
          <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center mb-2">
            <Users className="w-5 h-5 text-indigo-500" />
          </div>
          <div className="text-[18px] font-bold text-slate-800 leading-none mb-1">3</div>
          <div className="text-[11px] text-slate-600 mb-2">ปัญหาที่พบ</div>
          <button className="text-[9px] font-bold text-indigo-600 flex items-center mt-auto">
            ดูรายละเอียด
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        {/* Card 2 */}
        <div className="bg-white rounded-2xl p-3 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100 flex flex-col items-center text-center">
          <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center mb-2">
            <Heart className="w-5 h-5 text-rose-500" />
          </div>
          <div className="text-[18px] font-bold text-slate-800 leading-none mb-1">2</div>
          <div className="text-[11px] text-slate-600 mb-2">กำลังช่วยเหลือ</div>
          <button className="text-[9px] font-bold text-rose-600 flex items-center mt-auto">
            ดูรายละเอียด
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        {/* Card 3 */}
        <div className="bg-white rounded-2xl p-3 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100 flex flex-col items-center text-center">
          <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center mb-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="text-[18px] font-bold text-slate-800 leading-none mb-1">1</div>
          <div className="text-[11px] text-slate-600 mb-2">ช่วยเหลือแล้ว</div>
          <button className="text-[9px] font-bold text-emerald-600 flex items-center mt-auto">
            ดูรายละเอียด
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        {/* Card 4 */}
        <div className="bg-white rounded-2xl p-3 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100 flex flex-col items-center text-center">
          <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center mb-2">
            <Clock className="w-5 h-5 text-amber-500" />
          </div>
          <div className="text-[18px] font-bold text-slate-800 leading-none mb-1">1</div>
          <div className="text-[11px] text-slate-600 mb-2">รอดิตตามผล</div>
          <button className="text-[9px] font-bold text-amber-600 flex items-center mt-auto">
            ดูรายละเอียด
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>

      </div>
    </div>
  )
}
