import React from "react"
import { Users, MessageSquare, ClipboardList } from "lucide-react"

export function RecentActivities() {
  return (
    <div className="col-span-1 lg:col-span-5 rounded-2xl bg-white shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] border border-slate-100 p-6 flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-sm font-bold text-slate-800">การช่วยเหลือล่าสุด</h3>
        <button className="text-[11px] text-blue-600 font-medium hover:underline">ดูทั้งหมด</button>
      </div>
      <div className="flex-1 flex flex-col gap-5">
        
        <div className="flex gap-4">
          <div className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
            <Users className="h-5 w-5 text-emerald-600" />
          </div>
          <div className="flex flex-col flex-1 pb-4 border-b border-slate-50">
            <div className="flex justify-between items-start">
              <span className="text-xs font-bold text-slate-800">เยี่ยมบ้านนักเรียน</span>
              <span className="text-[10px] font-medium text-slate-500">20 พ.ค. 67</span>
            </div>
            <div className="flex justify-between items-end mt-1">
              <span className="text-[11px] text-slate-500">เด็กชายกฤษดา ใจดี (ป.5)</span>
              <span className="text-[10px] text-slate-400">โดย ครูประจำชั้น</span>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
            <MessageSquare className="h-5 w-5 text-blue-600" />
          </div>
          <div className="flex flex-col flex-1 pb-4 border-b border-slate-50">
            <div className="flex justify-between items-start">
              <span className="text-xs font-bold text-slate-800">พูดคุยให้คำปรึกษา</span>
              <span className="text-[10px] font-medium text-slate-500">19 พ.ค. 67</span>
            </div>
            <div className="flex justify-between items-end mt-1">
              <span className="text-[11px] text-slate-500">เด็กหญิงอริสรา คำดี (ป.4)</span>
              <span className="text-[10px] text-slate-400">โดย ครูแนะแนว</span>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="w-10 h-10 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0">
            <ClipboardList className="h-5 w-5 text-amber-600" />
          </div>
          <div className="flex flex-col flex-1 pb-4 border-b border-slate-50">
            <div className="flex justify-between items-start">
              <span className="text-xs font-bold text-slate-800">ปรับแผนพัฒนารายบุคคล</span>
              <span className="text-[10px] font-medium text-slate-500">18 พ.ค. 67</span>
            </div>
            <div className="flex justify-between items-end mt-1">
              <span className="text-[11px] text-slate-500">เด็กชายศุภชัย รักเรียน (ป.6)</span>
              <span className="text-[10px] text-slate-400">โดย ครูประจำชั้น</span>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="w-10 h-10 rounded-full bg-purple-50 border border-purple-100 flex items-center justify-center shrink-0">
            <Users className="h-5 w-5 text-purple-600" />
          </div>
          <div className="flex flex-col flex-1">
            <div className="flex justify-between items-start">
              <span className="text-xs font-bold text-slate-800">ประชุมทีมช่วยเหลือ</span>
              <span className="text-[10px] font-medium text-slate-500">17 พ.ค. 67</span>
            </div>
            <div className="flex justify-between items-end mt-1">
              <span className="text-[11px] text-slate-500">กลุ่มเฝ้าระวัง 6 คน</span>
              <span className="text-[10px] text-slate-400">โดย ครูแนะแนว</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
