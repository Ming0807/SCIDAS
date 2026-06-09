import React from "react"
import { Search, Filter, MoreHorizontal, Eye, BarChart2 } from "lucide-react"

export function StudentAcademicTable() {
  const students = [
    { id: 1, no: 1, name: "เด็กชายธนวัฒน์ ใจดี", class: "ม.2/1", gpa: 1.62, prevGpa: 1.75, weakSubject: "คณิตศาสตร์", status: "ต้องติดตามใกล้ชิด" },
    { id: 2, no: 2, name: "เด็กหญิงปนิดา วงศ์คำ", class: "ม.3/2", gpa: 1.75, prevGpa: 1.88, weakSubject: "คณิตศาสตร์, วิทยาศาสตร์", status: "ต้องติดตามใกล้ชิด" },
    { id: 3, no: 3, name: "เด็กชายกฤตภาส วงศ์ต๊ะ", class: "ม.2/3", gpa: 1.78, prevGpa: 1.92, weakSubject: "ภาษาอังกฤษ", status: "ต้องติดตามใกล้ชิด" },
    { id: 4, no: 4, name: "เด็กหญิงศศิธร แซ่ลี้", class: "ม.1/1", gpa: 1.82, prevGpa: 1.95, weakSubject: "คณิตศาสตร์", status: "ต้องติดตามใกล้ชิด" },
    { id: 5, no: 5, name: "เด็กชายพีรพัฒน์ คำมา", class: "ม.2/2", gpa: 1.88, prevGpa: 1.96, weakSubject: "ภาษาอังกฤษ", status: "ต้องติดตามใกล้ชิด" },
  ]

  return (
    <div className="bg-white rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100 flex flex-col h-full overflow-hidden">
      
      {/* Table Header */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h3 className="text-sm font-bold text-slate-800">รายชื่อนักเรียนและผลการเรียนรายบุคคล</h3>
        
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="ค้นหานักเรียน..." 
              className="pl-8 pr-3 py-1.5 text-[11px] bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 w-48"
            />
          </div>
          <button className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-md border border-slate-200">
            <Filter className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Table Content */}
      <div className="flex-1 overflow-x-auto no-scrollbar">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-slate-50/50">
              <th className="px-4 py-3 text-[10px] font-bold text-slate-500 border-b border-slate-100 w-10">#</th>
              <th className="px-4 py-3 text-[10px] font-bold text-slate-500 border-b border-slate-100">ชื่อ-นามสกุล</th>
              <th className="px-4 py-3 text-[10px] font-bold text-slate-500 border-b border-slate-100">ห้องเรียน</th>
              <th className="px-4 py-3 text-[10px] font-bold text-slate-500 border-b border-slate-100">GPA</th>
              <th className="px-4 py-3 text-[10px] font-bold text-slate-500 border-b border-slate-100">เทอมก่อน</th>
              <th className="px-4 py-3 text-[10px] font-bold text-slate-500 border-b border-slate-100">รายวิชาที่ต่ำกว่า 2.00</th>
              <th className="px-4 py-3 text-[10px] font-bold text-slate-500 border-b border-slate-100">สถานะ</th>
              <th className="px-4 py-3 text-[10px] font-bold text-slate-500 border-b border-slate-100 text-center">การจัดการ</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                <td className="px-4 py-3 text-[11px] text-slate-500">{student.no}</td>
                <td className="px-4 py-3 text-[11px] font-bold text-slate-800">{student.name}</td>
                <td className="px-4 py-3 text-[11px] text-slate-600">{student.class}</td>
                <td className="px-4 py-3 text-[11px] font-bold text-red-500">{student.gpa.toFixed(2)}</td>
                <td className="px-4 py-3 text-[11px] text-slate-500">{student.prevGpa.toFixed(2)}</td>
                <td className="px-4 py-3 text-[11px] text-slate-600 truncate max-w-[150px]">{student.weakSubject}</td>
                <td className="px-4 py-3">
                  <span className="px-2 py-0.5 bg-red-50 text-red-600 border border-red-100 rounded text-[9px] font-bold">
                    {student.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-1">
                    <button className="p-1 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors" title="ดูรายละเอียด">
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button className="p-1 text-slate-500 hover:text-indigo-700 hover:bg-indigo-50 rounded transition-colors" title="ดูพัฒนาการ">
                      <BarChart2 className="w-3.5 h-3.5" />
                    </button>
                    <button className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded transition-colors">
                      <MoreHorizontal className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="p-3 border-t border-slate-100 flex items-center justify-end gap-1">
        <button className="w-6 h-6 rounded flex items-center justify-center text-[10px] text-slate-400 hover:bg-slate-100">&lt;</button>
        <button className="w-6 h-6 rounded flex items-center justify-center text-[10px] bg-blue-600 text-white font-medium">1</button>
        <button className="w-6 h-6 rounded flex items-center justify-center text-[10px] text-slate-600 hover:bg-slate-100 font-medium">2</button>
        <button className="w-6 h-6 rounded flex items-center justify-center text-[10px] text-slate-600 hover:bg-slate-100 font-medium">3</button>
        <span className="text-[10px] text-slate-400 mx-1">...</span>
        <button className="w-6 h-6 rounded flex items-center justify-center text-[10px] text-slate-600 hover:bg-slate-100 font-medium">16</button>
        <button className="w-6 h-6 rounded flex items-center justify-center text-[10px] text-slate-600 hover:bg-slate-100">&gt;</button>
      </div>

    </div>
  )
}
