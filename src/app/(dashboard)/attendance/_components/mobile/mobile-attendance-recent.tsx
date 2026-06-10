import React from "react"
import { ChevronRight, CheckCircle2, Clock, XCircle } from "lucide-react"

export function MobileAttendanceRecent() {
  const recentDays = [
    { day: "วันนี้", date: "3 พ.ค. 67", status: "มาเรียน", icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-50", border: "border-emerald-100", time: null },
    { day: "พฤ.", date: "2 พ.ค. 67", status: "มาเรียน", icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-50", border: "border-emerald-100", time: null },
    { day: "พ.", date: "1 พ.ค. 67", status: "สาย", icon: Clock, color: "text-amber-500", bg: "bg-amber-50", border: "border-amber-100", time: "08:25 น." },
    { day: "อ.", date: "30 เม.ย. 67", status: "ขาด", icon: XCircle, color: "text-red-500", bg: "bg-red-50", border: "border-red-100", time: null },
    { day: "จ.", date: "29 เม.ย. 67", status: "มาเรียน", icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-50", border: "border-emerald-100", time: null },
  ]

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between px-4 mb-3">
        <h3 className="text-[13px] font-bold text-slate-800">การมาเรียนล่าสุด</h3>
        <button className="flex items-center gap-0.5 text-[11px] font-bold text-blue-600">
          ดูทั้งหมด
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex gap-3 px-4 overflow-x-auto no-scrollbar pb-2">
        {recentDays.map((item, index) => (
          <div key={index} className={`shrink-0 w-24 rounded-xl p-3 border ${item.bg} ${item.border} flex flex-col items-center text-center shadow-sm`}>
            <div className={`text-[12px] font-bold ${index === 0 ? item.color : "text-slate-800"} mb-0.5`}>{item.day}</div>
            <div className="text-[10px] text-slate-600 mb-2">{item.date}</div>
            <div className={`w-8 h-8 rounded-full bg-white flex items-center justify-center mb-2 shadow-sm ${item.color}`}>
              <item.icon className="w-5 h-5" />
            </div>
            <div className={`text-[11px] font-bold ${item.color} leading-tight`}>{item.status}</div>
            {item.time && (
              <div className="text-[9px] font-medium text-slate-500 mt-0.5 leading-tight">{item.time}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
