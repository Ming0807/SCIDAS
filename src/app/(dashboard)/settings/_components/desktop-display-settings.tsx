import React from "react"
import { Monitor, Check } from "lucide-react"

export function DesktopDisplaySettings() {
  return (
    <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm mb-6">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center shrink-0">
          <Monitor className="w-4 h-4 text-indigo-600" />
        </div>
        <h3 className="text-[14px] font-bold text-slate-800">การตั้งค่าการแสดงผล</h3>
      </div>

      <div className="grid grid-cols-[120px_1fr] gap-6 items-center mb-6">
        <label className="text-[12px] font-bold text-slate-700">ธีมสี</label>
        <div className="flex items-center gap-4">
          <button className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white ring-2 ring-offset-2 ring-indigo-600 transition-all">
            <Check className="w-4 h-4" />
          </button>
          <button className="w-8 h-8 rounded-full bg-blue-500 hover:scale-110 transition-transform"></button>
          <button className="w-8 h-8 rounded-full bg-green-500 hover:scale-110 transition-transform"></button>
          <button className="w-8 h-8 rounded-full bg-orange-500 hover:scale-110 transition-transform"></button>
          <button className="w-8 h-8 rounded-full bg-pink-500 hover:scale-110 transition-transform"></button>
          <button className="w-8 h-8 rounded-full bg-cyan-500 hover:scale-110 transition-transform"></button>
          <button className="w-8 h-8 rounded-full bg-slate-300 hover:scale-110 transition-transform"></button>
        </div>
      </div>

      <div className="grid grid-cols-[120px_1fr] gap-6 items-center">
        <label className="text-[12px] font-bold text-slate-700">ขนาดตัวอักษร</label>
        <div className="flex items-center gap-3">
          <button className="px-6 py-2 border border-slate-200 rounded-xl text-[12px] text-slate-600 font-medium hover:bg-slate-50 transition-colors flex items-center gap-2">
            <span>ก</span> เล็ก
          </button>
          <button className="px-6 py-2 bg-indigo-50 border border-indigo-200 rounded-xl text-[13px] text-indigo-700 font-bold flex items-center gap-2">
            <span>ก</span> กลาง
          </button>
          <button className="px-6 py-2 border border-slate-200 rounded-xl text-[14px] text-slate-600 font-medium hover:bg-slate-50 transition-colors flex items-center gap-2">
            <span>ก</span> ใหญ่
          </button>
        </div>
      </div>

    </div>
  )
}
