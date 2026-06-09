import React from "react"
import { MobileSupportHeader } from "./mobile/mobile-support-header"
import { MobileSupportSummary } from "./mobile/mobile-support-summary"
import { MobileSupportPlan } from "./mobile/mobile-support-plan"
import { MobileSupportIssues } from "./mobile/mobile-support-issues"
import { MobileSupportRecords } from "./mobile/mobile-support-records"
import { MobileSupportTeam } from "./mobile/mobile-support-team"
import { Calendar, Plus, ClipboardList } from "lucide-react"

export function MobileSupportProfile() {
  return (
    <div className="flex flex-col bg-slate-50 min-h-[calc(100vh-64px)] font-sans pb-32 max-w-md mx-auto relative">
      <MobileSupportHeader />
      <MobileSupportSummary />
      <MobileSupportPlan />
      <MobileSupportIssues />
      <MobileSupportRecords />
      <MobileSupportTeam />

      {/* Floating Action Buttons */}
      <div className="fixed bottom-[70px] left-0 right-0 px-4 py-3 bg-white/80 backdrop-blur-md border-t border-slate-100 flex items-center justify-between gap-2 z-30 max-w-md mx-auto">
        <button className="flex-1 flex flex-col items-center justify-center py-2 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-colors">
          <Calendar className="w-5 h-5 mb-1" />
          <span className="text-[9px] font-bold">นัดหมายให้คำปรึกษา</span>
        </button>
        <button className="flex-[1.5] flex flex-col items-center justify-center py-2 bg-[#8b5cf6] text-white rounded-xl shadow-[0_4px_15px_rgba(139,92,246,0.3)] hover:bg-[#7c3aed] transition-colors">
          <Plus className="w-6 h-6 mb-0.5" />
          <span className="text-[10px] font-bold">เพิ่มแผนการช่วยเหลือ</span>
        </button>
        <button className="flex-1 flex flex-col items-center justify-center py-2 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100 transition-colors">
          <ClipboardList className="w-5 h-5 mb-1" />
          <span className="text-[9px] font-bold">บันทึกการติดตาม</span>
        </button>
      </div>
    </div>
  )
}
