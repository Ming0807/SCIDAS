import React from "react"
import { ChevronRight } from "lucide-react"

export function MobileAttendanceAtRisk() {
  const students = [
    { id: 1, name: "เด็กชายธนวัฒน์ ใจดี", class: "ม.2/1", no: 5, rate: 65.2, avatar: "boy1" },
    { id: 2, name: "เด็กหญิงปวารินทร์ จันทร์ดี", class: "ม.2/1", no: 21, rate: 72.1, avatar: "girl2" },
    { id: 3, name: "เด็กชายณัฐวุฒิ ทองคำ", class: "ม.3/1", no: 3, rate: 75.3, avatar: "boy3" },
  ]

  return (
    <div className="px-4 mb-8">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[13px] font-bold text-slate-800">นักเรียนที่น่าเป็นห่วง</h3>
        <button className="flex items-center gap-0.5 text-[11px] font-bold text-blue-600">
          ดูทั้งหมด
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex flex-col gap-3">
        {students.map((student) => (
          <div key={student.id} className="bg-white rounded-2xl p-3 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100 flex items-center gap-3">
            <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${student.avatar}`} alt="avatar" className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200" />
            
            <div className="flex-1 min-w-0">
              <div className="text-[12px] font-bold text-slate-800 truncate mb-0.5">{student.name}</div>
              <div className="text-[10px] text-slate-500">{student.class} เลขที่ {student.no}</div>
            </div>

            <div className="flex flex-col items-end gap-1">
              <div className="text-[10px] text-slate-600 font-medium">อัตราการมาเรียน <span className="text-red-500 font-bold">{student.rate}%</span></div>
              <div className="text-[9px] text-slate-500">ต่ำกว่าเกณฑ์</div>
            </div>
            
            <button className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2.5 py-1.5 rounded-lg ml-1 whitespace-nowrap">
              ดูรายละเอียด
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
