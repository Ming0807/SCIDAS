import React from "react"
import { ArrowDown } from "lucide-react"

export function RiskOverviewCards() {
  return (
    <div className="flex flex-col xl:flex-row gap-6 mb-8 min-w-0">
      
      {/* Overview Donut Chart */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 xl:w-[340px] shrink-0 flex items-center justify-between min-w-0">
        <div className="flex flex-col">
          <h3 className="text-base font-semibold text-slate-900 mb-1">ภาพรวมความเสี่ยง</h3>
          <span className="text-sm text-slate-500 mb-4">นักเรียนทั้งหมด</span>
          <div className="flex items-baseline gap-2 mt-auto">
            <span className="text-3xl font-bold text-slate-900">642</span>
            <span className="text-sm font-medium text-slate-500">คน</span>
          </div>
        </div>
        
        <div className="relative w-24 h-24 shrink-0 mx-4">
          <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
            {/* Green (Low Risk 76.63%) */}
            <circle cx="18" cy="18" r="15.915" fill="none" stroke="#22c55e" strokeWidth="6" strokeDasharray="76.63 23.37" strokeDashoffset="25" />
            {/* Yellow (Medium Risk 17.45%) */}
            <circle cx="18" cy="18" r="15.915" fill="none" stroke="#eab308" strokeWidth="6" strokeDasharray="17.45 82.55" strokeDashoffset="-51.63" />
            {/* Red (High Risk 5.92%) */}
            <circle cx="18" cy="18" r="15.915" fill="none" stroke="#ef4444" strokeWidth="6" strokeDasharray="5.92 94.08" strokeDashoffset="-69.08" />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center border border-slate-200">
              <svg className="w-4 h-4 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-4 bg-red-500 rounded-sm"></div>
            <span className="text-xs text-slate-600 w-16">เสี่ยงสูง</span>
            <span className="text-xs font-semibold text-slate-900 w-8">38</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-4 bg-yellow-500 rounded-sm"></div>
            <span className="text-xs text-slate-600 w-16">เสี่ยงปานกลาง</span>
            <span className="text-xs font-semibold text-slate-900 w-8">112</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-4 bg-green-500 rounded-sm"></div>
            <span className="text-xs text-slate-600 w-16">เสี่ยงต่ำ</span>
            <span className="text-xs font-semibold text-slate-900 w-8">492</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-6 flex-1 min-w-0">
        
        {/* High Risk Stats */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200 flex flex-col justify-between">
          <div className="flex flex-col mb-4">
            <h4 className="text-sm font-semibold text-red-600 mb-2">เสี่ยงสูง</h4>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-slate-900">38</span>
              <span className="text-sm font-medium text-slate-500">คน</span>
            </div>
          </div>
          <div className="text-xs font-medium text-slate-500 mt-auto">คิดเป็น 5.92%</div>
        </div>

        {/* Medium Risk Stats */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200 flex flex-col justify-between">
          <div className="flex flex-col mb-4">
            <h4 className="text-sm font-semibold text-yellow-600 mb-2">เสี่ยงปานกลาง</h4>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-slate-900">112</span>
              <span className="text-sm font-medium text-slate-500">คน</span>
            </div>
          </div>
          <div className="text-xs font-medium text-slate-500 mt-auto">คิดเป็น 17.45%</div>
        </div>

        {/* Low Risk Stats */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200 flex flex-col justify-between">
          <div className="flex flex-col mb-4">
            <h4 className="text-sm font-semibold text-green-600 mb-2">เสี่ยงต่ำ</h4>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-slate-900">492</span>
              <span className="text-sm font-medium text-slate-500">คน</span>
            </div>
          </div>
          <div className="text-xs font-medium text-slate-500 mt-auto">คิดเป็น 76.63%</div>
        </div>

        {/* Overall Trend Card */}
        <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-semibold text-slate-900">แนวโน้มภาพรวม</h4>
            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center shrink-0">
              <ArrowDown className="w-4 h-4 text-green-700" />
            </div>
          </div>
          <div className="flex flex-col mt-auto">
            <span className="text-lg font-bold text-slate-900 mb-1">ลดลง</span>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold text-green-700">-8.21%</span>
              <span className="text-xs text-slate-500">จากเทอมที่แล้ว</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
