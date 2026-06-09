import React from "react"
import { DesktopSettingsTabs } from "./_components/desktop-settings-tabs"
import { DesktopGeneralSettings } from "./_components/desktop-general-settings"
import { DesktopDisplaySettings } from "./_components/desktop-display-settings"
import { DesktopDefaultDataSettings } from "./_components/desktop-default-data-settings"
import { DesktopUserProfile } from "./_components/desktop-user-profile"
import { DesktopStorageInfo } from "./_components/desktop-storage-info"
import { DesktopSystemInfo } from "./_components/desktop-system-info"
import { MobileSettingsProfile } from "./_components/mobile/mobile-settings-profile"
import { Bell, ChevronDown, Shield, Settings } from "lucide-react"

export default function SettingsPage() {
  return (
    <div className="w-full bg-[#f8fafc] min-h-screen">
      
      {/* ---------------- MOBILE VIEW (Admin) (< 1024px) ---------------- */}
      <div className="block lg:hidden">
        <MobileSettingsProfile />
      </div>

      {/* ---------------- DESKTOP VIEW (Teacher) (>= 1024px) ---------------- */}
      <div className="hidden lg:block max-w-[1200px] mx-auto p-6 xl:p-8 pb-12">
        
        {/* Header Area */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">ตั้งค่า</h1>
            <p className="text-[13px] text-slate-500 mt-1">จัดการการตั้งค่าระบบ และข้อมูลส่วนตัว</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-2 shadow-sm cursor-pointer hover:bg-slate-50 transition-colors">
              <span className="text-[13px] font-medium text-slate-700">ภาคเรียนที่ 1/2567</span>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </div>
            
            <div className="w-px h-8 bg-slate-200"></div>
            
            <button className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-[#f8fafc]"></span>
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white">3</span>
            </button>

            <div className="flex items-center gap-3 ml-2">
              <img src="https://api.dicebear.com/7.x/notionists/svg?seed=teacher" alt="Teacher" className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200" />
              <div className="flex flex-col">
                <span className="text-[13px] font-bold text-slate-800">นางสาวจันทร์จิรา พรมดี</span>
                <span className="text-[11px] text-slate-500">ครูที่ปรึกษา</span>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Tabs */}
        <DesktopSettingsTabs />

        {/* Main Grid Layout */}
        <div className="flex flex-col xl:flex-row gap-6">
          
          {/* Left Column (Main Settings Forms) */}
          <div className="flex-1 min-w-0">
            <DesktopGeneralSettings />
            <DesktopDisplaySettings />
            <DesktopDefaultDataSettings />
            
            {/* Security Bottom Left Banner inside Desktop View */}
            <div className="mt-8 bg-indigo-900 rounded-3xl p-8 text-white relative overflow-hidden flex items-center justify-between">
              <div className="relative z-10 max-w-sm">
                <h3 className="text-xl font-bold mb-2">ระบบปลอดภัย มั่นใจได้</h3>
                <p className="text-indigo-200 text-sm">ข้อมูลได้รับการปกป้องตามมาตรฐานความปลอดภัย</p>
              </div>
              <div className="w-24 h-24 rounded-full border-4 border-indigo-700 flex items-center justify-center relative z-10 shrink-0">
                <Shield className="w-10 h-10 text-indigo-300" />
              </div>
              
              {/* Decorative elements */}
              <div className="absolute top-4 left-4 w-12 h-12 border-2 border-indigo-800/30 rounded-full"></div>
              <div className="absolute bottom-4 left-1/3 w-16 h-16 border-2 border-indigo-800/30 rounded-full"></div>
              <div className="absolute top-1/2 right-1/4 w-8 h-8 border-2 border-indigo-800/30 rounded-full"></div>
              <Settings className="absolute top-8 right-12 w-6 h-6 text-indigo-800/40" />
              <Settings className="absolute bottom-8 right-1/3 w-8 h-8 text-indigo-800/40" />
            </div>

          </div>

          {/* Right Column (Sidebar Widgets) */}
          <div className="xl:w-[320px] shrink-0">
            <DesktopUserProfile />
            <DesktopStorageInfo />
            <DesktopSystemInfo />
          </div>

        </div>

      </div>
    </div>
  )
}
