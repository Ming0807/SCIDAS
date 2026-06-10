import React from "react"
import { ChevronRight, PlusCircle, Calendar as CalendarIcon, Users, BookOpen, Calculator, Clock } from "lucide-react"

export function MobileIdpActivities() {
  return (
    <div className="px-4 mb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[13px] font-bold text-slate-800">กิจกรรมที่จะทำ</h3>
        <button className="flex items-center gap-0.5 text-[11px] font-bold text-blue-600">
          ดูทั้งหมด
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex flex-col gap-2.5">
        
        {/* Activity 1 */}
        <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-sm flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center shrink-0">
              <Calculator className="w-5 h-5 text-purple-600" />
            </div>
            <div className="flex flex-col min-w-0">
              <div className="text-[12px] font-bold text-slate-800 truncate mb-0.5">ติวเสริมคณิตศาสตร์</div>
              <div className="flex items-center gap-2 text-[10px] text-slate-500">
                <span className="flex items-center gap-1"><CalendarIcon className="w-3 h-3" /> พฤ. 16 พ.ค. 2567</span>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> 15:30 น.</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1.5 shrink-0">
            <span className="text-[9px] font-medium text-slate-500 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">การเรียน</span>
            <div className="flex items-center gap-1 text-[10px] font-bold text-blue-600">
              นัดหมายแล้ว
              <ChevronRight className="w-3 h-3 text-slate-300" />
            </div>
          </div>
        </div>

        {/* Activity 2 */}
        <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-sm flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5 text-orange-500" />
            </div>
            <div className="flex flex-col min-w-0">
              <div className="text-[12px] font-bold text-slate-800 truncate mb-0.5">นัดหมายผู้ปกครอง</div>
              <div className="flex items-center gap-2 text-[10px] text-slate-500">
                <span className="flex items-center gap-1"><CalendarIcon className="w-3 h-3" /> ศ. 17 พ.ค. 2567</span>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> 16:00 น.</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1.5 shrink-0">
            <span className="text-[9px] font-medium text-slate-500 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">ผู้ปกครอง</span>
            <div className="flex items-center gap-1 text-[10px] font-bold text-amber-600">
              รอดำเนินการ
              <ChevronRight className="w-3 h-3 text-slate-300" />
            </div>
          </div>
        </div>

        {/* Activity 3 */}
        <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-sm flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
              <BookOpen className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="flex flex-col min-w-0">
              <div className="text-[12px] font-bold text-slate-800 truncate mb-0.5">ฝึกอ่านวันละ 15 นาที</div>
              <div className="flex items-center gap-2 text-[10px] text-slate-500">
                <span className="flex items-center gap-1"><CalendarIcon className="w-3 h-3" /> ทุกวัน</span>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> 19:00 น.</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1.5 shrink-0">
            <span className="text-[9px] font-medium text-slate-500 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">ทักษะพื้นฐาน</span>
            <div className="flex items-center gap-1 text-[10px] font-bold text-blue-600">
              กำลังดำเนินการ
              <ChevronRight className="w-3 h-3 text-slate-300" />
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
