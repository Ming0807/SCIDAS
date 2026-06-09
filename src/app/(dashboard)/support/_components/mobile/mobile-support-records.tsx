import React from "react"
import { Calendar as CalendarIcon, ChevronRight } from "lucide-react"

export function MobileSupportRecords() {
  return (
    <div className="px-4 mb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[13px] font-bold text-slate-800">บันทึกการให้คำปรึกษาล่าสุด</h3>
        <button className="flex items-center gap-0.5 text-[11px] font-bold text-blue-600">
          ดูทั้งหมด
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex flex-col gap-2.5">
        
        {/* Record 1 */}
        <div className="bg-white rounded-2xl p-3.5 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100 flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100 mt-0.5">
              <CalendarIcon className="w-4 h-4 text-slate-500" />
            </div>
            <div className="flex flex-col min-w-0">
              <div className="text-[11px] font-bold text-slate-700 mb-0.5">ครั้งที่ 2 / 2567</div>
              <div className="text-[10px] text-slate-500 mb-1.5 flex flex-wrap gap-x-2">
                <span>15 พ.ค. 2567 14:30 น.</span>
                <span>ครูสุรินทร์ จิรา</span>
              </div>
              <div className="text-[11px] text-emerald-600 leading-relaxed font-medium">
                นักเรียนยอมรับและให้ความร่วมมือ เริ่มปรับปรุงพฤติกรรมดีขึ้น
              </div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-300 mt-2 shrink-0" />
        </div>

        {/* Record 2 */}
        <div className="bg-white rounded-2xl p-3.5 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100 flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100 mt-0.5">
              <CalendarIcon className="w-4 h-4 text-slate-500" />
            </div>
            <div className="flex flex-col min-w-0">
              <div className="text-[11px] font-bold text-slate-700 mb-0.5">ครั้งที่ 1 / 2567</div>
              <div className="text-[10px] text-slate-500 mb-1.5 flex flex-wrap gap-x-2">
                <span>1 พ.ค. 2567 10:00 น.</span>
                <span>ครูสุรินทร์ จิรา</span>
              </div>
              <div className="text-[11px] text-emerald-600 leading-relaxed font-medium">
                พูดคุยทำความเข้าใจปัญหาเบื้องต้น แนะนำแนวทางการปรับพฤติกรรม
              </div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-300 mt-2 shrink-0" />
        </div>

      </div>
    </div>
  )
}
