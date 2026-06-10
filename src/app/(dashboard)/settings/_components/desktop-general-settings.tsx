import React from "react"
import { Settings, ChevronDown } from "lucide-react"

export function DesktopGeneralSettings() {
  return (
    <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm mb-6">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center shrink-0">
          <Settings className="w-4 h-4 text-indigo-600" />
        </div>
        <h3 className="text-[14px] font-bold text-slate-800">ตั้งค่าระบบทั่วไป</h3>
      </div>

      <div className="grid grid-cols-2 gap-x-8 gap-y-6">
        
        <div className="flex flex-col gap-1.5">
          <label className="text-[12px] font-bold text-slate-700">ปีการศึกษา</label>
          <div className="relative">
            <select className="w-full appearance-none border border-slate-200 rounded-xl px-4 py-2.5 text-[13px] text-slate-700 bg-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 pr-10">
              <option>2567</option>
              <option>2566</option>
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[12px] font-bold text-slate-700">ภาษา</label>
          <div className="relative">
            <select className="w-full appearance-none border border-slate-200 rounded-xl px-4 py-2.5 text-[13px] text-slate-700 bg-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 pr-10">
              <option>🇹🇭 ไทย</option>
              <option>🇺🇸 English</option>
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[12px] font-bold text-slate-700">ภาคเรียน</label>
          <div className="relative">
            <select className="w-full appearance-none border border-slate-200 rounded-xl px-4 py-2.5 text-[13px] text-slate-700 bg-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 pr-10">
              <option>1</option>
              <option>2</option>
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[12px] font-bold text-slate-700">รูปแบบวันที่</label>
          <div className="relative">
            <select className="w-full appearance-none border border-slate-200 rounded-xl px-4 py-2.5 text-[13px] text-slate-700 bg-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 pr-10">
              <option>31/05/2567</option>
              <option>31 พ.ค. 2567</option>
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[12px] font-bold text-slate-700">รูปแบบการแสดงผล</label>
          <div className="relative">
            <select className="w-full appearance-none border border-slate-200 rounded-xl px-4 py-2.5 text-[13px] text-slate-700 bg-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 pr-10">
              <option>☀️ แสง</option>
              <option>🌙 มืด</option>
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[12px] font-bold text-slate-700">รูปแบบเวลา</label>
          <div className="relative">
            <select className="w-full appearance-none border border-slate-200 rounded-xl px-4 py-2.5 text-[13px] text-slate-700 bg-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 pr-10">
              <option>24 ชั่วโมง (14:30)</option>
              <option>12 ชั่วโมง (02:30 PM)</option>
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        <div className="flex flex-col gap-1.5 col-span-2">
          <label className="text-[12px] font-bold text-slate-700">เขตเวลา</label>
          <div className="relative">
            <select className="w-full appearance-none border border-slate-200 rounded-xl px-4 py-2.5 text-[13px] text-slate-700 bg-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 pr-10">
              <option>(GMT+07:00) กรุงเทพมหานคร</option>
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

      </div>

      <div className="flex items-center justify-end gap-3 mt-8">
        <button className="px-5 py-2.5 bg-indigo-600 text-white text-[13px] font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-sm flex items-center gap-2">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
          บันทึกการตั้งค่า
        </button>
        <button className="px-5 py-2.5 bg-white border border-slate-200 text-slate-600 text-[13px] font-bold rounded-xl hover:bg-slate-50 transition-colors flex items-center gap-2">
          ยกเลิก
        </button>
      </div>

    </div>
  )
}
