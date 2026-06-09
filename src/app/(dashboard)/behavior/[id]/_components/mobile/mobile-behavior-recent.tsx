import React from "react"
import { ChevronRight, Smile, Frown, Star } from "lucide-react"

export function MobileBehaviorRecent() {
  const records = [
    { type: "พฤติกรรมดี", detail: "ช่วยเหลือเพื่อนในห้องเรียน", date: "4 พ.ค. 2567 10:30 น.", teacher: "ครูจันทร์จิรา", icon: Smile, color: "text-emerald-500", bg: "bg-emerald-50", fill: "fill-emerald-100" },
    { type: "ชมเชย", detail: "เข้าร่วมกิจกรรมจิตอาสาของโรงเรียน", date: "2 พ.ค. 2567 15:45 น.", teacher: "ครูสมชาย", icon: Star, color: "text-blue-500", bg: "bg-blue-50", fill: "fill-blue-500 text-blue-500" },
    { type: "พฤติกรรมปกติ", detail: "ส่งงานครบตามกำหนด", date: "1 พ.ค. 2567 09:15 น.", teacher: "ครูจันทร์จิรา", icon: Frown, color: "text-amber-500", bg: "bg-amber-50", fill: "fill-amber-100" },
    { type: "พฤติกรรมไม่พึงประสงค์", detail: "คุยเสียงดังในห้องเรียน", date: "30 เม.ย. 2567 11:20 น.", teacher: "ครูสมชาย", icon: Frown, color: "text-rose-500", bg: "bg-rose-50", fill: "fill-rose-100" },
  ]

  return (
    <div className="px-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[13px] font-bold text-slate-800">รายการพฤติกรรมล่าสุด</h3>
        <button className="flex items-center gap-0.5 text-[11px] font-bold text-blue-600">
          ดูทั้งหมด
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex flex-col gap-3">
        {records.map((record, index) => (
          <div key={index} className="bg-white rounded-2xl p-4 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full ${record.bg} flex items-center justify-center shrink-0`}>
              <record.icon className={`w-5 h-5 ${record.color} ${record.fill}`} />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="text-[12px] font-bold text-slate-800 mb-0.5">{record.type}</div>
              <div className="text-[10px] text-slate-500 truncate">{record.detail}</div>
            </div>

            <div className="flex flex-col items-end gap-1 shrink-0">
              <div className="text-[10px] text-slate-600 font-medium">{record.date}</div>
              <div className="text-[9px] text-slate-400">{record.teacher}</div>
            </div>
            
            <ChevronRight className="w-4 h-4 text-slate-300 ml-1 shrink-0" />
          </div>
        ))}
      </div>
    </div>
  )
}
