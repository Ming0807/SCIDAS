import React from "react"
import { RiskOverviewCards } from "./_components/risk-overview-cards"
import { RiskMatrix } from "./_components/risk-matrix"
import { TopRiskStudents } from "./_components/top-risk-students"
import { RiskFactorsChart } from "./_components/risk-factors-chart"
import { RiskHistoryChart } from "./_components/risk-history-chart"
import { RiskRecommendations } from "./_components/risk-recommendations"
import { MobileRiskProfile } from "./_components/mobile/mobile-risk-profile"
import { ChevronRight, Filter, Bell } from "lucide-react"

export default function RiskAnalysisPage() {
  return (
    <div className="w-full bg-slate-50 min-h-[calc(100vh-64px)] overflow-x-hidden">
      
      {/* ---------------- MOBILE VIEW (< 768px) ---------------- */}
      <div className="block md:hidden">
        <MobileRiskProfile />
      </div>

      {/* ---------------- DESKTOP VIEW (>= 768px) ---------------- */}
      <div className="hidden md:block max-w-[1400px] mx-auto p-4 sm:p-6 lg:p-8">
        
        {/* Header Area */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">วิเคราะห์ความเสี่ยง</h1>
            <div className="flex items-center gap-2 text-[13px] text-slate-500 mt-1">
              <span className="cursor-pointer hover:text-blue-600 transition-colors">หน้าหลัก</span>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="font-bold text-slate-800">วิเคราะห์ความเสี่ยง</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-4 py-2 shadow-sm">
              <span className="text-[13px] font-medium text-slate-700">ภาคเรียนที่ 1/2567</span>
              <svg className="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
            </div>
            <button className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-4 py-2 text-[13px] font-bold text-blue-600 hover:bg-blue-50 transition-colors shadow-sm">
              <Filter className="w-4 h-4" />
              ตัวกรอง
            </button>
            <div className="w-px h-8 bg-slate-200"></div>
            <button className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
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

        {/* 1. Overview Cards */}
        <RiskOverviewCards />

        {/* 2. Matrix and Top Students */}
        <div className="flex flex-col xl:flex-row gap-6 mb-6 min-w-0">
          <div className="xl:w-[65%] shrink-0 flex min-w-0">
            <RiskMatrix />
          </div>
          <div className="flex-1 flex min-w-0">
            <TopRiskStudents />
          </div>
        </div>

        {/* 3. Bottom Row: Factors, Trend, Recommendations */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <RiskFactorsChart />
          <RiskHistoryChart />
          <RiskRecommendations />
        </div>

      </div>
    </div>
  )
}
