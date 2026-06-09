import React from "react"
import { MobileIdpHeader } from "./mobile-idp-header"
import { MobileIdpPlanStatus } from "./mobile-idp-plan-status"
import { MobileIdpGoals } from "./mobile-idp-goals"
import { MobileIdpRoadmap } from "./mobile-idp-roadmap"
import { MobileIdpActivities } from "./mobile-idp-activities"
import { MobileIdpRecord } from "./mobile-idp-record"
import { MobileIdpTeam } from "./mobile-idp-team"
import { Edit3, PlusCircle } from "lucide-react"

export function MobileIdpProfile() {
  return (
    <div className="bg-[#f8fafc] min-h-screen relative pb-6">
      <MobileIdpHeader />
      
      <div className="max-w-md mx-auto">
        <MobileIdpPlanStatus />
        <MobileIdpGoals />
        <MobileIdpRoadmap />
        <MobileIdpActivities />
        <MobileIdpRecord />
        <MobileIdpTeam />
      </div>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t border-slate-200/50 flex gap-3 z-30 lg:hidden">
        <button className="flex-1 flex items-center justify-center gap-2 bg-indigo-50 text-indigo-600 py-3 rounded-xl font-bold text-[13px] border border-indigo-100 active:scale-[0.98] transition-transform">
          <PlusCircle className="w-4 h-4" />
          เพิ่มกิจกรรม
        </button>
        <button className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 text-white py-3 rounded-xl font-bold text-[13px] shadow-lg shadow-indigo-200 active:scale-[0.98] transition-transform">
          <Edit3 className="w-4 h-4" />
          บันทึกติดตาม
        </button>
      </div>
    </div>
  )
}
