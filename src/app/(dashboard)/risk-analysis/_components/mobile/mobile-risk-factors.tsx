import React from "react"
import { Calendar as CalendarIcon, Smile, Home, Activity, FolderOpen } from "lucide-react"

export function MobileRiskFactors() {
  return (
    <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm h-full">
      <h3 className="text-sm font-bold text-slate-800 mb-5">ปัจจัยเสี่ยงที่ต้องเฝ้าระวัง</h3>

      <div className="flex flex-col gap-4">
        
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0">
            <CalendarIcon className="w-4 h-4 text-red-500" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-bold text-slate-800">การมาเรียน</h4>
            <p className="text-xs text-slate-500 truncate">ขาดเรียนบ่อย</p>
          </div>
          <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-100">เสี่ยงสูง</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
            <Home className="w-4 h-4 text-blue-500" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-bold text-slate-800">สภาพครอบครัว</h4>
            <p className="text-xs text-slate-500 truncate">ข้อมูลครอบครัวไม่สมบูรณ์</p>
          </div>
          <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-100">เสี่ยงสูง</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center shrink-0">
            <FolderOpen className="w-4 h-4 text-orange-500" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-bold text-slate-800">ผลการเรียน</h4>
            <p className="text-xs text-slate-500 truncate">ผลการเรียนต่ำกว่าเกณฑ์</p>
          </div>
          <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded border border-orange-100">เสี่ยงปานกลาง</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center shrink-0">
            <Activity className="w-4 h-4 text-purple-500" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-bold text-slate-800">สภาพอารมณ์</h4>
            <p className="text-xs text-slate-500 truncate">มีความเครียดบ่อยครั้ง</p>
          </div>
          <span className="text-xs font-bold text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded border border-yellow-100">เฝ้าระวัง</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center shrink-0">
            <Smile className="w-4 h-4 text-green-500" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-bold text-slate-800">พฤติกรรม</h4>
            <p className="text-xs text-slate-500 truncate">ไม่มีพฤติกรรมที่ผิดปกติ</p>
          </div>
          <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded border border-green-100 w-[55px] text-center">ปกติ</span>
        </div>

      </div>
    </div>
  )
}
