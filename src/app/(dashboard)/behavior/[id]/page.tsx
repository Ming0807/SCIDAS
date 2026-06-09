import React from "react"
import { MobileBehaviorProfile } from "./_components/mobile-behavior-profile"
import { StudentProfileHeader } from "./_components/student-profile-header"
import { BehaviorCharts } from "./_components/behavior-charts"
import { BehaviorRecent } from "./_components/behavior-recent"
import { BehaviorComments } from "./_components/behavior-comments"
import { Bell, ChevronRight, Plus } from "lucide-react"
import Link from "next/link"

export default function BehaviorPage() {
  return (
    <>
      {/* Mobile View */}
      <div className="md:hidden block">
        <MobileBehaviorProfile />
      </div>

      {/* Desktop View */}
      <div className="hidden md:flex p-4 sm:p-6 lg:p-8 bg-[#f8fafc] min-h-[calc(100vh-64px)] flex-col overflow-x-hidden">
        
        {/* Breadcrumb & Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex flex-col">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">พฤติกรรม</h1>
            <div className="flex items-center gap-2 mt-1 text-[13px] text-slate-500 font-medium">
              <Link href="/" className="hover:text-blue-600">หน้าหลัก</Link>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-slate-800">พฤติกรรม</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Action Button */}
            <button className="hidden sm:flex items-center justify-center gap-1.5 bg-[#4f46e5] hover:bg-[#4338ca] text-white text-[13px] font-bold py-2 px-4 rounded-lg transition-colors shadow-sm">
              <Plus className="w-4 h-4" />
              บันทึกพฤติกรรม
            </button>

            <div className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-[13px] font-medium text-slate-700 shadow-sm flex items-center gap-2 cursor-pointer hover:bg-slate-50">
              ภาคเรียนที่ 1/2567
              <ChevronRight className="w-3.5 h-3.5 rotate-90 text-slate-400" />
            </div>

            <div className="relative cursor-pointer">
              <div className="w-9 h-9 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-600 hover:bg-slate-50 shadow-sm">
                <Bell className="w-4 h-4" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 rounded-full text-white text-[10px] font-bold flex items-center justify-center border-2 border-white">
                3
              </div>
            </div>

            <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
              <div className="flex flex-col items-end">
                <span className="text-[13px] font-bold text-slate-800 leading-tight">นางสาวจันทร์จิรา พรมดี</span>
                <span className="text-[11px] text-slate-500">ครูที่ปรึกษา</span>
              </div>
              <img src="https://api.dicebear.com/7.x/notionists/svg?seed=teacher2" alt="Teacher" className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200" />
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col min-h-0">
          <StudentProfileHeader />
          <BehaviorCharts />
          
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 lg:gap-6">
            <div className="xl:col-span-2">
              <BehaviorRecent />
            </div>
            <div className="xl:col-span-1">
              <BehaviorComments />
            </div>
          </div>
        </div>

      </div>
    </>
  )
}
