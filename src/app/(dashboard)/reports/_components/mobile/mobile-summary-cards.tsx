import React from "react"
import { Calendar as CalendarIcon, BookOpen, Smile, HeartPulse } from "lucide-react"

export function MobileSummaryCards() {
  return (
    <div className="px-4 mb-6">
      <h3 className="text-[13px] font-bold text-slate-800 mb-4">สรุปภาพรวม</h3>

      <div className="grid grid-cols-2 gap-3">
        
        {/* Attendance */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col justify-between items-center text-center">
          <div className="flex items-center gap-1.5 mb-2">
            <div className="w-6 h-6 rounded-md bg-blue-50 flex items-center justify-center shrink-0">
              <CalendarIcon className="w-3.5 h-3.5 text-blue-500" />
            </div>
            <span className="text-[11px] font-bold text-slate-700">การมาเรียน</span>
          </div>
          <span className="text-[18px] font-bold text-slate-800 mb-1">93.2%</span>
          <span className="text-[10px] text-slate-500 mb-3">มาเรียน 186 ครั้ง</span>
          <span className="text-[10px] font-bold text-green-600 bg-green-50 border border-green-100 px-3 py-0.5 rounded-md">ดีเยี่ยม</span>
        </div>

        {/* GPA */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col justify-between items-center text-center">
          <div className="flex items-center gap-1.5 mb-2">
            <div className="w-6 h-6 rounded-md bg-orange-50 flex items-center justify-center shrink-0">
              <BookOpen className="w-3.5 h-3.5 text-orange-500" />
            </div>
            <span className="text-[11px] font-bold text-slate-700">ผลการเรียน</span>
          </div>
          <span className="text-[18px] font-bold text-slate-800 mb-1">3.48</span>
          <span className="text-[10px] text-slate-500 mb-3">GPA เฉลี่ย</span>
          <span className="text-[10px] font-bold text-green-600 bg-green-50 border border-green-100 px-3 py-0.5 rounded-md">ดี</span>
        </div>

        {/* Behavior */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col justify-between items-center text-center">
          <div className="flex items-center gap-1.5 mb-2">
            <div className="w-6 h-6 rounded-md bg-green-50 flex items-center justify-center shrink-0">
              <Smile className="w-3.5 h-3.5 text-green-500" />
            </div>
            <span className="text-[11px] font-bold text-slate-700">พฤติกรรม</span>
          </div>
          <span className="text-[18px] font-bold text-slate-800 mb-1">85</span>
          <span className="text-[10px] text-slate-500 mb-3">คะแนนรวม</span>
          <span className="text-[10px] font-bold text-green-600 bg-green-50 border border-green-100 px-3 py-0.5 rounded-md">ดีมาก</span>
        </div>

        {/* Support */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col justify-between items-center text-center">
          <div className="flex items-center gap-1.5 mb-2">
            <div className="w-6 h-6 rounded-md bg-purple-50 flex items-center justify-center shrink-0">
              <HeartPulse className="w-3.5 h-3.5 text-purple-500" />
            </div>
            <span className="text-[11px] font-bold text-slate-700">การช่วยเหลือ</span>
          </div>
          <span className="text-[18px] font-bold text-slate-800 mb-1">3</span>
          <span className="text-[10px] text-slate-500 mb-3">แผนการช่วยเหลือ</span>
          <span className="text-[10px] font-bold text-yellow-600 bg-yellow-50 border border-yellow-100 px-3 py-0.5 rounded-md whitespace-nowrap">กำลังดำเนินการ</span>
        </div>

      </div>
    </div>
  )
}
