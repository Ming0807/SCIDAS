import React from "react"
import { Info, RefreshCw } from "lucide-react"

export function DesktopSystemInfo() {
  return (
    <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Info className="w-5 h-5 text-indigo-500" />
        <h3 className="text-[14px] font-bold text-slate-800">เกี่ยวกับระบบ</h3>
      </div>

      <div className="flex flex-col gap-3 text-[12px] mb-6">
        <div className="flex items-center justify-between">
          <span className="text-slate-500">เวอร์ชัน</span>
          <span className="font-bold text-slate-800">V 2.3.0</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-slate-500">
            <RefreshCw className="w-3.5 h-3.5" />
            อัปเดตล่าสุด
          </div>
          <span className="font-bold text-slate-800">15 พ.ค. 2567</span>
        </div>
      </div>

      <button className="w-full py-2 bg-white text-indigo-600 text-[12px] font-bold rounded-xl hover:bg-slate-50 transition-colors flex items-center justify-center gap-2">
        ตรวจสอบการอัปเดต
        <RefreshCw className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}
