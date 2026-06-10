import React from "react"
import { AcademicSummaryCards } from "./_components/academic-summary-cards"
import { AcademicCharts } from "./_components/academic-charts"
import { AtRiskStudentsList, TopStudentsList } from "./_components/student-lists"
import { ClassroomComparison } from "./_components/classroom-comparison"
import { StudentAcademicTable } from "./_components/student-academic-table"
import { BottomInsights } from "./_components/bottom-insights"
import { MobileAcademicProfile } from "./_components/mobile-academic-profile"
import { Search, Filter, Calendar } from "lucide-react"

export default function AcademicsPage() {
  return (
    <>
      {/* Mobile PWA View */}
      <div className="md:hidden block">
        <MobileAcademicProfile />
      </div>

      {/* Desktop Responsive View */}
      <div className="hidden md:flex p-4 sm:p-6 lg:p-8 bg-slate-50 min-h-[calc(100vh-64px)] flex-col overflow-x-hidden">
        
        {/* Page Header */}
        <div className="mb-6 shrink-0 flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-slate-800 tracking-tight">ผลการเรียน</h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">ภาพรวมผลสัมฤทธิ์ทางการเรียน ปีการศึกษา 2567</p>
          </div>

          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative hidden md:block">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="ค้นหานักเรียน, ห้องเรียน, รายวิชา..." 
                className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm w-64 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
              />
            </div>
            
            {/* Term Dropdown */}
            <button className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 shadow-sm">
              <Calendar className="w-4 h-4 text-slate-500" />
              ภาคเรียนที่ 1/2567
            </button>

            {/* Filter */}
            <button className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 shadow-sm">
              <Filter className="w-4 h-4 text-slate-500" />
              ตัวกรอง
            </button>
          </div>
        </div>

        <div className="flex-1 flex flex-col min-h-0">
          
          <AcademicSummaryCards />

          {/* Row 2: Charts and At-Risk List */}
          <div className="grid grid-cols-1 xl:grid-cols-3 2xl:grid-cols-4 gap-6 mb-6">
            <div className="xl:col-span-2 2xl:col-span-3">
              <AcademicCharts />
            </div>
            <div className="col-span-1">
              <AtRiskStudentsList />
            </div>
          </div>

          {/* Row 3: Heatmap, Table, and Top Students List */}
          <div className="grid grid-cols-1 xl:grid-cols-3 2xl:grid-cols-4 gap-6 mb-6">
            <div className="xl:col-span-2 2xl:col-span-3 flex flex-col gap-6">
              <ClassroomComparison />
              <StudentAcademicTable />
            </div>
            <div className="col-span-1">
              <TopStudentsList />
            </div>
          </div>

          {/* Bottom Insights */}
          <BottomInsights />

        </div>

      </div>
    </>
  )
}
