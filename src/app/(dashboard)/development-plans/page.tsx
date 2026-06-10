import React from "react"
import { IdpHeader } from "./_components/idp-header"
import { IdpGoals } from "./_components/idp-goals"
import { IdpTimeline } from "./_components/idp-timeline"
import { IdpTrendReflection } from "./_components/idp-trend-reflection"
import { IdpLatestRecords } from "./_components/idp-latest-records"
import { IdpSidebar } from "./_components/idp-sidebar"
import { MobileIdpProfile } from "./_components/mobile/mobile-idp-profile"
import { ChevronRight } from "lucide-react"

export default function DevelopmentPlansPage() {
  return (
    <div className="w-full bg-background min-h-screen">
      
      {/* ---------------- MOBILE VIEW (< 768px) ---------------- */}
      <div className="block md:hidden">
        <MobileIdpProfile />
      </div>

      {/* ---------------- DESKTOP VIEW (>= 768px) ---------------- */}
      <div className="hidden md:block max-w-[1400px] mx-auto p-4 md:p-6 xl:p-8">
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-[13px] text-slate-500 mb-6">
          <span className="cursor-pointer hover:text-indigo-600 transition-colors">หน้าหลัก</span>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="font-bold text-slate-800">แผนพัฒนารายบุคคล</span>
        </div>

        {/* Header Section */}
        <IdpHeader />

        <div className="flex flex-col lg:flex-row gap-6">
          
          {/* Main Content Area */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Goals */}
            <IdpGoals />

            {/* Timeline and Trends Row */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
              <IdpTimeline />
              <IdpTrendReflection />
            </div>

            {/* Latest Records Table */}
            <IdpLatestRecords />
          </div>

          {/* Right Sidebar Area */}
          <div className="w-full lg:w-[320px] xl:w-[350px] shrink-0">
            <IdpSidebar />
          </div>

        </div>
        
      </div>
    </div>
  )
}
