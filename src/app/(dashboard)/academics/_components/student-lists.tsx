import React from "react"
import { ChevronRight } from "lucide-react"

export function AtRiskStudentsList() {
  const students = [
    { id: 1, name: "เด็กชายธนวัฒน์ ใจดี", class: "ม.2/1", gpa: 1.62, trend: "down", avatar: "boy1" },
    { id: 2, name: "เด็กหญิงปนิดา วงศ์คำ", class: "ม.3/2", gpa: 1.75, trend: "down", avatar: "girl1" },
    { id: 3, name: "เด็กชายกฤตภาส วงศ์ต๊ะ", class: "ม.2/3", gpa: 1.78, trend: "down", avatar: "boy2" },
    { id: 4, name: "เด็กหญิงศศิธร แซ่ลี้", class: "ม.1/1", gpa: 1.82, trend: "down", avatar: "girl2" },
    { id: 5, name: "เด็กชายพีรพัฒน์ คำมา", class: "ม.2/2", gpa: 1.88, trend: "down", avatar: "boy3" },
  ]

  return (
    <div className="bg-white rounded-2xl p-5 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100 flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-slate-800">นักเรียนที่ต้องติดตามใกล้ชิด (Top 5)</h3>
        <button className="text-[11px] font-medium text-blue-600 hover:text-blue-700">
          ดูทั้งหมด
        </button>
      </div>

      <div className="flex-1 flex flex-col gap-3">
        {students.map((student, index) => (
          <div key={student.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 transition-colors">
            <div className="w-6 text-[11px] font-bold text-slate-400 text-center">{index + 1}</div>
            <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${student.avatar}`} alt="avatar" className="w-8 h-8 rounded-full bg-slate-100" />
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-slate-800 line-clamp-1 break-all">{student.name}</div>
              <div className="text-[10px] text-slate-500">{student.class}</div>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-right">
                <div className="text-[10px] text-slate-400">GPA</div>
                <div className="text-xs font-bold text-red-500">{student.gpa.toFixed(2)}</div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function TopStudentsList() {
  const students = [
    { id: 1, name: "เด็กหญิงกมลลักษณ์ อินทร์คำ", class: "ม.3/1", gpa: 3.96, avatar: "girl3" },
    { id: 2, name: "เด็กชายพชรพล แซ่ตั้ง", class: "ม.3/1", gpa: 3.92, avatar: "boy4" },
    { id: 3, name: "เด็กหญิงณัฐธิดา ชัยวงค์", class: "ม.3/2", gpa: 3.89, avatar: "girl4" },
    { id: 4, name: "เด็กชายกรวิชญ์ จันทรี", class: "ม.2/1", gpa: 3.85, avatar: "boy5" },
    { id: 5, name: "เด็กหญิงปวีณา คำฟู", class: "ม.3/3", gpa: 3.82, avatar: "girl5" },
  ]

  return (
    <div className="bg-white rounded-2xl p-5 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100 flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-slate-800">นักเรียนผลการเรียนดีเด่น (Top 5)</h3>
        <button className="text-[11px] font-medium text-blue-600 hover:text-blue-700">
          ดูทั้งหมด
        </button>
      </div>

      <div className="flex-1 flex flex-col gap-3">
        {students.map((student, index) => (
          <div key={student.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 transition-colors">
            <div className="w-6 flex justify-center">
              {index === 0 ? (
                <div className="w-5 h-5 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center text-[10px] font-bold">1</div>
              ) : index === 1 ? (
                <div className="w-5 h-5 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-[10px] font-bold">2</div>
              ) : index === 2 ? (
                <div className="w-5 h-5 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-[10px] font-bold">3</div>
              ) : (
                <div className="w-5 text-[11px] font-bold text-slate-400 text-center">{index + 1}</div>
              )}
            </div>
            <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${student.avatar}`} alt="avatar" className="w-8 h-8 rounded-full bg-slate-100" />
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-slate-800 truncate">{student.name}</div>
              <div className="text-[10px] text-slate-500">{student.class}</div>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-right">
                <div className="text-[10px] text-slate-400">GPA</div>
                <div className="text-xs font-bold text-emerald-600">{student.gpa.toFixed(2)}</div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
