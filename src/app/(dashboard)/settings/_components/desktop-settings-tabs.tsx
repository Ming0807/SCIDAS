import React from "react"
import { Settings, User, Bell, Shield, Lock, Database } from "lucide-react"

export function DesktopSettingsTabs() {
  return (
    <div className="flex justify-between border-b border-slate-200 mb-6 pb-0 overflow-x-auto no-scrollbar">
      <button className="flex items-center gap-2 pb-3 px-4 text-[13px] font-bold text-indigo-600 border-b-[3px] border-indigo-600 whitespace-nowrap">
        <Settings className="w-4 h-4" />
        ตั้งค่าทั่วไป
      </button>
      <button className="flex items-center gap-2 pb-3 px-4 text-[13px] font-medium text-slate-500 whitespace-nowrap hover:text-slate-800 transition-colors">
        <User className="w-4 h-4" />
        ข้อมูลส่วนตัว
      </button>
      <button className="flex items-center gap-2 pb-3 px-4 text-[13px] font-medium text-slate-500 whitespace-nowrap hover:text-slate-800 transition-colors">
        <Bell className="w-4 h-4" />
        การแจ้งเตือน
      </button>
      <button className="flex items-center gap-2 pb-3 px-4 text-[13px] font-medium text-slate-500 whitespace-nowrap hover:text-slate-800 transition-colors">
        <Shield className="w-4 h-4" />
        สิทธิ์การใช้งาน
      </button>
      <button className="flex items-center gap-2 pb-3 px-4 text-[13px] font-medium text-slate-500 whitespace-nowrap hover:text-slate-800 transition-colors">
        <Lock className="w-4 h-4" />
        ความปลอดภัย
      </button>
      <button className="flex items-center gap-2 pb-3 px-4 text-[13px] font-medium text-slate-500 whitespace-nowrap hover:text-slate-800 transition-colors">
        <Database className="w-4 h-4" />
        สำรองข้อมูล
      </button>
    </div>
  )
}
