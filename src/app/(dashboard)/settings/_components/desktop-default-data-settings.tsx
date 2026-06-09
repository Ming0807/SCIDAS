import React from "react"
import { Database, ChevronDown, RotateCcw } from "lucide-react"

export function DesktopDefaultDataSettings() {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100 mb-6">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center shrink-0">
          <Database className="w-4 h-4 text-indigo-600" />
        </div>
        <h3 className="text-[14px] font-bold text-slate-800">ตั้งค่าข้อมูลเริ่มต้น</h3>
      </div>

      <div className="grid grid-cols-2 gap-8">
        
        {/* Left Col */}
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-bold text-slate-700">เกณฑ์การประเมินความเสี่ยงเริ่มต้น</label>
            <div className="relative">
              <select className="w-full appearance-none border border-slate-200 rounded-xl px-4 py-2.5 text-[13px] text-slate-700 bg-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 pr-10">
                <option>เกณฑ์มาตรฐานโรงเรียน</option>
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-bold text-slate-700">ระยะเวลาในการติดตามผล (วัน)</label>
            <div className="relative">
              <select className="w-full appearance-none border border-slate-200 rounded-xl px-4 py-2.5 text-[13px] text-slate-700 bg-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 pr-10">
                <option>30</option>
                <option>60</option>
                <option>90</option>
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Right Col */}
        <div className="flex flex-col justify-center gap-6">
          
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-medium text-slate-700">เปิดใช้งานการสำรองข้อมูลอัตโนมัติ</span>
            <div className="w-10 h-6 bg-indigo-600 rounded-full relative cursor-pointer shadow-inner">
              <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[12px] font-medium text-slate-700">แสดงผล Dashboard เมื่อเข้าสู่ระบบ</span>
            <div className="w-10 h-6 bg-indigo-600 rounded-full relative cursor-pointer shadow-inner">
              <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[12px] font-medium text-slate-700">เปิดใช้งานการลงชื่อเข้าใช้ 2 ขั้น (2FA)</span>
            <div className="w-10 h-6 bg-slate-200 rounded-full relative cursor-pointer shadow-inner">
              <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm border border-slate-200"></div>
            </div>
          </div>

        </div>

      </div>

      <div className="flex items-center justify-end gap-3 mt-8 pt-6 border-t border-slate-100">
        <button className="px-5 py-2.5 bg-indigo-600 text-white text-[13px] font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-sm flex items-center gap-2">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
          บันทึกการตั้งค่า
        </button>
        <button className="px-5 py-2.5 bg-white border border-slate-200 text-slate-600 text-[13px] font-bold rounded-xl hover:bg-slate-50 transition-colors flex items-center gap-2">
          <RotateCcw className="w-4 h-4" />
          รีเซ็ตค่าเริ่มต้น
        </button>
      </div>

    </div>
  )
}
