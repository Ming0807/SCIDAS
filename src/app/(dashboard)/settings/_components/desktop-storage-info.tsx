import React from "react"
import { Cloud } from "lucide-react"

export function DesktopStorageInfo() {
  return (
    <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Cloud className="w-5 h-5 text-indigo-500" />
        <h3 className="text-[14px] font-bold text-slate-800">พื้นที่จัดเก็บข้อมูล</h3>
      </div>

      <div className="flex items-center gap-1.5 text-[12px] text-slate-600 mb-3">
        <span>ใช้ไป</span>
        <span className="font-bold text-slate-800 text-[13px]">2.45 GB</span>
        <span>จาก 10 GB</span>
      </div>

      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden mb-2">
        <div className="h-full bg-indigo-600 rounded-full" style={{ width: '24.5%' }}></div>
      </div>
      <div className="text-right text-[10px] text-slate-400 mb-6">24.5%</div>

      <button className="w-full py-2 bg-white border border-slate-200 text-indigo-600 text-[12px] font-bold rounded-xl hover:bg-indigo-50 transition-colors shadow-sm">
        จัดการพื้นที่จัดเก็บ
      </button>
    </div>
  )
}
