import React from "react"
import { MoreHorizontal } from "lucide-react"

export function BehaviorRecent() {
  const records = [
    { date: "20 พ.ค. 2567", type: "ช่วยเหลือเพื่อน", detail: "ช่วยเพื่อนทำงานกลุ่ม", teacher: "นางสาวจันทร์จิรา", points: "+2", color: "text-emerald-500" },
    { date: "18 พ.ค. 2567", type: "ส่งงานตรงเวลา", detail: "ส่งงานวิชาคณิตศาสตร์", teacher: "นางสาวจันทร์จิรา", points: "+1", color: "text-emerald-500" },
    { date: "15 พ.ค. 2567", type: "พูดคุยในห้องเรียน", detail: "คุยกับเพื่อนขณะครูสอน", teacher: "นางสาวจันทร์จิรา", points: "-1", color: "text-rose-500" },
    { date: "10 พ.ค. 2567", type: "ช่วยเหลือเพื่อน", detail: "ช่วยเพื่อนที่ไม่เข้าใจบทเรียน", teacher: "นางสาวจันทร์จิรา", points: "+2", color: "text-emerald-500" },
    { date: "8 พ.ค. 2567", type: "มาสาย", detail: "มาสาย 10 นาที", teacher: "นางสาวจันทร์จิรา", points: "-1", color: "text-rose-500" },
  ]

  return (
    <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col h-full overflow-hidden">
      <h3 className="text-[13px] font-bold text-slate-800 mb-4">บันทึกพฤติกรรมล่าสุด</h3>

      <div className="flex-1 overflow-x-auto no-scrollbar pb-2">
        <table className="w-full text-left border-collapse min-w-[500px]">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="pb-3 text-[11px] font-bold text-slate-500 w-[15%]">วันที่</th>
              <th className="pb-3 text-[11px] font-bold text-slate-500 w-[20%]">ประเภท</th>
              <th className="pb-3 text-[11px] font-bold text-slate-500 w-[35%]">รายละเอียด</th>
              <th className="pb-3 text-[11px] font-bold text-slate-500 w-[20%]">ผู้บันทึก</th>
              <th className="pb-3 text-[11px] font-bold text-slate-500 text-right w-[10%]">คะแนน</th>
            </tr>
          </thead>
          <tbody>
            {records.map((record, index) => (
              <tr key={index} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors last:border-none">
                <td className="py-3.5 text-[11px] text-slate-600">{record.date}</td>
                <td className="py-3.5 text-[11px] font-medium text-slate-800">{record.type}</td>
                <td className="py-3.5 text-[11px] text-slate-500">{record.detail}</td>
                <td className="py-3.5 text-[11px] text-slate-600">{record.teacher}</td>
                <td className={`py-3.5 text-[11px] font-bold text-right ${record.color}`}>{record.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button className="w-full mt-4 py-2 text-[11px] font-bold text-blue-600 border border-blue-100 rounded-xl hover:bg-blue-50 transition-colors">
        ดูเพิ่มเติม
      </button>
    </div>
  )
}
