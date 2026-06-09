import React from "react"
import { DesktopNotificationSidebar } from "./_components/desktop-notification-sidebar"
import { DesktopNotificationList } from "./_components/desktop-notification-list"
import { DesktopNotificationFilters } from "./_components/desktop-notification-filters"
import { MobileNotificationProfile } from "./_components/mobile/mobile-notification-profile"
import { ChevronRight, Bell } from "lucide-react"

export default function NotificationsPage() {
  return (
    <div className="w-full bg-[#f8fafc] min-h-screen">
      
      {/* ---------------- MOBILE VIEW (< 1024px) ---------------- */}
      <div className="block lg:hidden">
        <MobileNotificationProfile />
      </div>

      {/* ---------------- DESKTOP VIEW (>= 1024px) ---------------- */}
      <div className="hidden lg:block max-w-[1400px] mx-auto p-6 xl:p-8 pb-12">
        
        {/* Header Area */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">การแจ้งเตือน</h1>
            <div className="flex items-center gap-2 text-[13px] text-slate-500 mt-1">
              <span className="cursor-pointer hover:text-indigo-600 transition-colors">หน้าหลัก</span>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="font-bold text-slate-800">การแจ้งเตือน</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-2 shadow-sm cursor-pointer hover:bg-slate-50 transition-colors">
              <span className="text-[13px] font-medium text-slate-700">ภาคเรียนที่ 1/2567</span>
              <svg className="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
            </div>
            
            <button className="bg-indigo-50 border border-indigo-100 text-indigo-600 px-4 py-2 rounded-xl text-[13px] font-bold hover:bg-indigo-100 transition-colors">
              ทำเครื่องหมายว่าอ่านแล้วทั้งหมด
            </button>
            
            <div className="w-px h-8 bg-slate-200"></div>
            
            <button className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-[#f8fafc]"></span>
            </button>
            <div className="flex items-center gap-3 ml-2">
              <img src="https://api.dicebear.com/7.x/notionists/svg?seed=teacher" alt="Teacher" className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200" />
              <div className="flex flex-col">
                <span className="text-[13px] font-bold text-slate-800">นางสาวจันทร์จิรา พรดี</span>
                <span className="text-[11px] text-slate-500">ครูที่ปรึกษา</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Grid Layout */}
        <div className="flex flex-col xl:flex-row gap-6">
          
          {/* Left Column (Sidebar) */}
          <div className="xl:w-[280px] shrink-0 min-w-0">
            <DesktopNotificationSidebar />
          </div>

          {/* Middle Column (List) */}
          <div className="flex-1 min-w-0">
            <DesktopNotificationList />
          </div>

          {/* Right Column (Filters) */}
          <div className="xl:w-[320px] shrink-0 min-w-0">
            <DesktopNotificationFilters />
          </div>

        </div>

      </div>
    </div>
  )
}
