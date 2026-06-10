import React from "react"
import { CalendarIcon, ChevronDown, Monitor, Mail, MessageCircle } from "lucide-react"

export function DesktopNotificationFilters() {
  return (
    <div className="flex flex-col gap-6">
      
      {/* Filters Form */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
        <h3 className="text-[13px] font-bold text-slate-800 mb-4">ตัวกรองการแจ้งเตือน</h3>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-slate-700">ช่วงเวลา</label>
            <div className="flex items-center justify-between border border-slate-200 rounded-xl px-3 py-2 bg-slate-50">
              <span className="text-[12px] text-slate-600">01/05/2567 - 31/05/2567</span>
              <CalendarIcon className="w-4 h-4 text-slate-400" />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-slate-700">ประเภทการแจ้งเตือน</label>
            <div className="flex items-center justify-between border border-slate-200 rounded-xl px-3 py-2 bg-white">
              <span className="text-[12px] text-slate-600">ทั้งหมด</span>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </div>
          </div>

          <div className="flex flex-col gap-2 mt-2">
            <label className="text-[11px] font-bold text-slate-700 mb-1">สถานะ</label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500" defaultChecked />
              <span className="text-[12px] text-slate-700">ยังไม่ได้อ่าน</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500" />
              <span className="text-[12px] text-slate-700">อ่านแล้ว</span>
            </label>
          </div>

          <div className="flex flex-col gap-2 mt-2 border-t border-slate-100 pt-4">
            <label className="text-[11px] font-bold text-slate-700 mb-1">ระดับความสำคัญ</label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500" defaultChecked />
              <span className="text-[12px] text-slate-700">ทั้งหมด</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500" />
              <span className="text-[12px] text-slate-700">สำคัญ</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500" />
              <span className="text-[12px] text-slate-700">ปกติ</span>
            </label>
          </div>

          <div className="flex flex-col gap-2 mt-4">
            <button className="w-full py-2 bg-indigo-600 text-white text-[12px] font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-sm">
              ใช้ตัวกรอง
            </button>
            <button className="w-full py-2 bg-white text-slate-500 text-[12px] font-bold rounded-xl hover:text-slate-700 transition-colors">
              ล้างตัวกรอง
            </button>
          </div>
        </div>
      </div>

      {/* Today's Summary */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
        <h3 className="text-[13px] font-bold text-slate-800 mb-4">สรุปการแจ้งเตือนวันนี้</h3>
        <div className="flex items-center gap-6">
          <div className="relative w-20 h-20 shrink-0">
            <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
              {/* Red 25% (2/8) */}
              <circle cx="50" cy="50" r="40" fill="none" stroke="#ef4444" strokeWidth="15" strokeDasharray="25 75" strokeDashoffset="0" />
              {/* Blue 62.5% (5/8) */}
              <circle cx="50" cy="50" r="40" fill="none" stroke="#3b82f6" strokeWidth="15" strokeDasharray="62.5 37.5" strokeDashoffset="-25" />
              {/* Yellow 12.5% (1/8) */}
              <circle cx="50" cy="50" r="40" fill="none" stroke="#eab308" strokeWidth="15" strokeDasharray="12.5 87.5" strokeDashoffset="-87.5" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-[18px] font-bold text-slate-800 leading-none">8</span>
              <span className="text-[9px] text-slate-500 mt-1">รายการ</span>
            </div>
          </div>

          <div className="flex flex-col gap-2 flex-1">
            <div className="flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                <span className="text-slate-600">สำคัญ</span>
              </div>
              <span className="font-bold text-slate-800">2</span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                <span className="text-slate-600">ปกติ</span>
              </div>
              <span className="font-bold text-slate-800">5</span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                <span className="text-slate-600">ระบบ</span>
              </div>
              <span className="font-bold text-slate-800">1</span>
            </div>
          </div>
        </div>
      </div>

      {/* Channels */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
        <h3 className="text-[13px] font-bold text-slate-800 mb-4">ช่องทางการแจ้งเตือน</h3>
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50">
            <div className="flex items-center gap-3">
              <Monitor className="w-4 h-4 text-slate-400" />
              <span className="text-[12px] font-medium text-slate-700">ในระบบ</span>
            </div>
            <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded">เปิด</span>
          </div>
          <div className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50">
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-slate-400" />
              <span className="text-[12px] font-medium text-slate-700">อีเมล</span>
            </div>
            <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded">เปิด</span>
          </div>
          <div className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50">
            <div className="flex items-center gap-3">
              <MessageCircle className="w-4 h-4 text-slate-400" />
              <span className="text-[12px] font-medium text-slate-700">LINE Notify</span>
            </div>
            <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded">เปิด</span>
          </div>
        </div>
      </div>

    </div>
  )
}
