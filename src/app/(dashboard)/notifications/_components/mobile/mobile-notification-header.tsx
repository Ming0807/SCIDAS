import React from "react"
import { Settings, ChevronRight, Bell, ChevronDown } from "lucide-react"

export function MobileNotificationHeader() {
  return (
    <div className="bg-white sticky top-0 z-20 shadow-[0_2px_10px_rgba(0,0,0,0.02)] pt-6 pb-0 px-1">
      <div className="flex items-center justify-between px-3 pb-3">
        <div className="w-8"></div> {/* Spacer for center alignment */}
        <span className="text-base font-bold text-slate-900">การแจ้งเตือน</span>
        <button className="p-2 -mr-2 text-indigo-600">
          <Settings className="w-5 h-5" />
        </button>
      </div>

      {/* Profile Section */}
      <div className="px-4 py-3 flex items-center justify-between bg-white border border-slate-100 rounded-2xl mx-4 shadow-sm mb-4">
        <div className="flex items-center gap-3">
          <img src="https://api.dicebear.com/7.x/notionists/svg?seed=boy1" alt="Avatar" className="w-12 h-12 rounded-full bg-slate-100 border border-slate-200" />
          <div className="flex flex-col">
            <h2 className="text-[14px] font-bold text-slate-900 leading-tight mb-0.5">เด็กชายธนวัฒน์ ใจดี</h2>
            <div className="text-[12px] text-slate-500 mb-1.5">ม.2/1 เลขที่ 5</div>
            <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[9px] font-bold rounded-md w-max border border-indigo-100">กำลังศึกษา</span>
          </div>
        </div>

        <div className="flex flex-col items-center">
          <div className="relative mb-1">
            <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center border border-indigo-100">
              <Bell className="w-5 h-5 text-indigo-600" />
            </div>
            <div className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white">
              12
            </div>
          </div>
          <div className="flex flex-col text-right">
            <span className="text-[9px] text-slate-400">การแจ้งเตือนทั้งหมด</span>
            <div className="flex items-center gap-1">
              <span className="text-[14px] font-bold text-slate-800">12 รายการ</span>
              <ChevronRight className="w-3 h-3 text-slate-400" />
            </div>
            <span className="text-[9px] font-bold text-red-500">ยังไม่ได้อ่าน 6 รายการ</span>
          </div>
        </div>
      </div>

      {/* Swipeable Tabs */}
      <div className="flex justify-between border-b border-slate-100 px-3 overflow-x-auto no-scrollbar pb-0">
        <button className="pb-3 px-2 flex-shrink-0">
          <span className="bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-full text-[12px] font-bold">ทั้งหมด</span>
        </button>
        <button className="pb-3 px-2 flex-shrink-0 flex items-center gap-1.5 text-[12px] font-medium text-slate-500">
          ยังไม่ได้อ่าน
          <span className="bg-red-500 text-white text-[9px] font-bold px-1.5 rounded-full">6</span>
        </button>
        <button className="pb-3 px-2 flex-shrink-0 text-[12px] font-medium text-slate-500">การเรียน</button>
        <button className="pb-3 px-2 flex-shrink-0 text-[12px] font-medium text-slate-500">พฤติกรรม</button>
        <button className="pb-3 px-2 flex-shrink-0 text-[12px] font-medium text-slate-500">การช่วยเหลือ</button>
        <button className="pb-3 px-2 flex-shrink-0 text-[12px] font-medium text-slate-500 flex items-center gap-1">อื่นๆ <ChevronDown className="w-3 h-3" /></button>
      </div>

    </div>
  )
}
