import React from "react"
import { ChevronRight } from "lucide-react"

export function MobileIdpTeam() {
  return (
    <div className="px-4 mb-20">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[13px] font-bold text-slate-800">ผู้เกี่ยวข้องในแผนนี้</h3>
        <button className="flex items-center gap-0.5 text-[11px] font-bold text-blue-600">
          จัดการทีม
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100/60">
        
        <div className="flex items-center gap-3 p-3">
          <img src="https://api.dicebear.com/7.x/notionists/svg?seed=teacher2" alt="Avatar" className="w-10 h-10 rounded-full bg-slate-100" />
          <div className="flex-1 min-w-0">
            <div className="text-[12px] font-bold text-slate-800 truncate">ครูจันทร์จิรา สุขสวัสดิ์</div>
            <div className="text-[10px] text-slate-500">ครูที่ปรึกษา</div>
          </div>
          <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">ผู้รับผิดชอบหลัก</span>
        </div>

        <div className="flex items-center gap-3 p-3">
          <img src="https://api.dicebear.com/7.x/notionists/svg?seed=teacher1" alt="Avatar" className="w-10 h-10 rounded-full bg-slate-100" />
          <div className="flex-1 min-w-0">
            <div className="text-[12px] font-bold text-slate-800 truncate">ครูศิริพร แก้วสนิท</div>
            <div className="text-[10px] text-slate-500">ครูแนะแนว</div>
          </div>
          <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 w-[65px] text-center">ผู้ร่วม</span>
        </div>

        <div className="flex items-center gap-3 p-3">
          <img src="https://api.dicebear.com/7.x/notionists/svg?seed=parent1" alt="Avatar" className="w-10 h-10 rounded-full bg-slate-100" />
          <div className="flex-1 min-w-0">
            <div className="text-[12px] font-bold text-slate-800 truncate">นายสมชาย ใจดี</div>
            <div className="text-[10px] text-slate-500">ผู้ปกครอง</div>
          </div>
          <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 w-[65px] text-center">ผู้ร่วม</span>
        </div>

      </div>
    </div>
  )
}
