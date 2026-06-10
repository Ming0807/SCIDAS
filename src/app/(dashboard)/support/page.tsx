import React from "react"
import { MobileSupportProfile } from "./_components/mobile-support-profile"
import { SupportHeader } from "./_components/support-header"
import { SupportRiskSummary } from "./_components/support-risk-summary"
import { SupportCurrentPlan } from "./_components/support-current-plan"
import { SupportRecords } from "./_components/support-records"
import { SupportTeam } from "./_components/support-team"
import { SupportTrackingChart } from "./_components/support-tracking-chart"
import { SupportNotesActions } from "./_components/support-notes-actions"
import { Bell, ChevronRight } from "lucide-react"
import Link from "next/link"

export default function SupportPage() {
  return (
    <>
      {/* Mobile View */}
      <div className="md:hidden block">
        <MobileSupportProfile />
      </div>

      {/* Desktop View */}
      <div className="hidden md:flex p-4 sm:p-6 lg:p-8 bg-slate-50 min-h-[calc(100vh-64px)] flex-col overflow-x-hidden">
        
        {/* Breadcrumb & Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex flex-col">
            <h1 className="text-xl sm:text-2xl font-semibold text-slate-800 tracking-tight">ดูแลช่วยเหลือ</h1>
            <div className="flex items-center gap-2 mt-1 text-sm text-slate-500 font-medium">
              <Link href="/" className="hover:text-blue-600">หน้าหลัก</Link>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-slate-800">ดูแลช่วยเหลือ</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 shadow-sm flex items-center gap-2 cursor-pointer hover:bg-slate-50">
              ภาคเรียนที่ 1/2567
              <ChevronRight className="w-3.5 h-3.5 rotate-90 text-slate-400" />
            </div>

            <div className="relative cursor-pointer">
              <div className="w-9 h-9 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-600 hover:bg-slate-50 shadow-sm">
                <Bell className="w-4 h-4" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 rounded-full text-white text-xs font-semibold flex items-center justify-center border-2 border-white">
                3
              </div>
            </div>

            <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
              <div className="flex flex-col items-end">
                <span className="text-sm font-semibold text-slate-800 leading-tight">นางสาวจันทร์จิรา พรมดี</span>
                <span className="text-xs text-slate-500">ครูที่ปรึกษา</span>
              </div>
              <img src="https://api.dicebear.com/7.x/notionists/svg?seed=teacher2" alt="Teacher" className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200" />
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col min-h-0 gap-6">
          <SupportHeader />
          
          <div className="grid grid-cols-1 xl:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
            <div className="lg:col-span-1 xl:col-span-1">
              <SupportRiskSummary />
            </div>
            <div className="lg:col-span-1 xl:col-span-1">
              <SupportCurrentPlan />
            </div>
            <div className="lg:col-span-1 xl:col-span-2">
              <SupportRecords />
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
            <div className="lg:col-span-1 xl:col-span-1">
              <SupportTeam />
            </div>
            <div className="lg:col-span-1 xl:col-span-1">
              <SupportTrackingChart />
            </div>
            <div className="lg:col-span-1 xl:col-span-2">
              <SupportNotesActions />
            </div>
          </div>
        </div>

      </div>
    </>
  )
}
