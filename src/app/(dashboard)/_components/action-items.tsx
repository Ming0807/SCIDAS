import React from "react"
import { AlertTriangle, BookOpen, Activity, Users, ChevronRight } from "lucide-react"

export function ActionItems() {
  return (
    <div className="col-span-1 lg:col-span-3 rounded-xl bg-white border border-slate-200 shadow-sm p-6 flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-sm font-bold text-slate-800">รายการที่ต้องติดตาม</h3>
        <button className="text-[11px] text-blue-600 font-medium hover:underline">ดูทั้งหมด</button>
      </div>
      <div className="flex-1 flex flex-col gap-3">
        
        <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <span className="text-xs font-medium text-slate-700">ขาดเรียนต่อเนื่อง</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-800">5 คน</span>
            <ChevronRight className="h-3 w-3 text-slate-400" />
          </div>
        </div>

        <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
          <div className="flex items-center gap-3">
            <BookOpen className="h-4 w-4 text-blue-500" />
            <span className="text-xs font-medium text-slate-700">ผลการเรียนต่ำ</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-800">8 คน</span>
            <ChevronRight className="h-3 w-3 text-slate-400" />
          </div>
        </div>

        <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
          <div className="flex items-center gap-3">
            <Activity className="h-4 w-4 text-emerald-500" />
            <span className="text-xs font-medium text-slate-700">พฤติกรรมเสี่ยง</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-800">6 คน</span>
            <ChevronRight className="h-3 w-3 text-slate-400" />
          </div>
        </div>

        <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
          <div className="flex items-center gap-3">
            <Users className="h-4 w-4 text-amber-500" />
            <span className="text-xs font-medium text-slate-700">รอการเยี่ยมบ้าน</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-800">4 คน</span>
            <ChevronRight className="h-3 w-3 text-slate-400" />
          </div>
        </div>

      </div>
    </div>
  )
}
