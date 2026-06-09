import React from "react"
import { ArrowDown } from "lucide-react"

export function RiskOverviewCards() {
  return (
    <div className="flex flex-col xl:flex-row gap-4 mb-6 min-w-0">
      
      {/* Overview Donut Chart */}
      <div className="bg-white p-5 rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100 xl:w-[340px] shrink-0 flex items-center justify-between min-w-0">
        <div className="flex flex-col">
          <h3 className="text-[14px] font-bold text-slate-800 mb-1">ภาพรวมความเสี่ยง</h3>
          <span className="text-[12px] text-slate-500 mb-4">นักเรียนทั้งหมด</span>
          <div className="flex items-baseline gap-2 mt-auto">
            <span className="text-[28px] font-bold text-slate-800">642</span>
            <span className="text-[13px] font-bold text-slate-500">คน</span>
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
            <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center border border-indigo-100">
              <svg className="w-4 h-4 text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-4 bg-red-500 rounded-full"></div>
            <span className="text-[10px] text-slate-600 w-16">เสี่ยงสูง</span>
            <span className="text-[10px] font-bold text-slate-800 w-8">38 คน</span>
            <span className="text-[10px] text-slate-400">(5.92%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-4 bg-yellow-500 rounded-full"></div>
            <span className="text-[10px] text-slate-600 w-16">เสี่ยงปานกลาง</span>
            <span className="text-[10px] font-bold text-slate-800 w-8">112 คน</span>
            <span className="text-[10px] text-slate-400">(17.45%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-4 bg-green-500 rounded-full"></div>
            <span className="text-[10px] text-slate-600 w-16">เสี่ยงต่ำ</span>
            <span className="text-[10px] font-bold text-slate-800 w-8">492 คน</span>
            <span className="text-[10px] text-slate-400">(76.63%)</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 flex-1 min-w-0">
        
        {/* High Risk Card */}
        <div className="bg-white rounded-2xl p-4 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-red-100 relative overflow-hidden flex flex-col justify-between group cursor-pointer hover:border-red-300 transition-colors">
          <div className="flex flex-col mb-4">
            <h4 className="text-[13px] font-bold text-red-600 mb-2">เสี่ยงสูง</h4>
            <div className="flex items-baseline gap-1.5">
              <span className="text-[20px] font-bold text-slate-800">38</span>
              <span className="text-[12px] font-bold text-slate-500">คน</span>
            </div>
            <span className="text-[11px] text-slate-500 mt-1">5.92%</span>
          </div>
          <div className="h-8 mt-auto relative">
            <svg viewBox="0 0 100 30" preserveAspectRatio="none" className="w-full h-full">
              <path d="M 0,20 Q 10,15 20,25 T 40,20 T 60,25 T 80,10 T 100,15" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="20" cy="25" r="2" fill="#ef4444" />
              <circle cx="40" cy="20" r="2" fill="#ef4444" />
              <circle cx="60" cy="25" r="2" fill="#ef4444" />
              <circle cx="80" cy="10" r="2" fill="#ef4444" />
              <circle cx="100" cy="15" r="2" fill="#ef4444" />
            </svg>
          </div>
        </div>

        {/* Medium Risk Card */}
        <div className="bg-white rounded-2xl p-4 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-yellow-100 relative overflow-hidden flex flex-col justify-between group cursor-pointer hover:border-yellow-300 transition-colors">
          <div className="flex flex-col mb-4">
            <h4 className="text-[13px] font-bold text-yellow-600 mb-2">เสี่ยงปานกลาง</h4>
            <div className="flex items-baseline gap-1.5">
              <span className="text-[20px] font-bold text-slate-800">112</span>
              <span className="text-[12px] font-bold text-slate-500">คน</span>
            </div>
            <span className="text-[11px] text-slate-500 mt-1">17.45%</span>
          </div>
          <div className="h-8 mt-auto relative">
            <svg viewBox="0 0 100 30" preserveAspectRatio="none" className="w-full h-full">
              <path d="M 0,25 Q 10,30 20,20 T 40,25 T 60,15 T 80,20 T 100,10" fill="none" stroke="#eab308" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="20" cy="20" r="2" fill="#eab308" />
              <circle cx="40" cy="25" r="2" fill="#eab308" />
              <circle cx="60" cy="15" r="2" fill="#eab308" />
              <circle cx="80" cy="20" r="2" fill="#eab308" />
              <circle cx="100" cy="10" r="2" fill="#eab308" />
            </svg>
          </div>
        </div>

        {/* Low Risk Card */}
        <div className="bg-white rounded-2xl p-4 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-green-100 relative overflow-hidden flex flex-col justify-between group cursor-pointer hover:border-green-300 transition-colors">
          <div className="flex flex-col mb-4">
            <h4 className="text-[13px] font-bold text-green-600 mb-2">เสี่ยงต่ำ</h4>
            <div className="flex items-baseline gap-1.5">
              <span className="text-[20px] font-bold text-slate-800">492</span>
              <span className="text-[12px] font-bold text-slate-500">คน</span>
            </div>
            <span className="text-[11px] text-slate-500 mt-1">76.63%</span>
          </div>
          <div className="h-8 mt-auto relative">
            <svg viewBox="0 0 100 30" preserveAspectRatio="none" className="w-full h-full">
              <path d="M 0,15 Q 10,10 20,20 T 40,10 T 60,25 T 80,15 T 100,20" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="20" cy="20" r="2" fill="#22c55e" />
              <circle cx="40" cy="10" r="2" fill="#22c55e" />
              <circle cx="60" cy="25" r="2" fill="#22c55e" />
              <circle cx="80" cy="15" r="2" fill="#22c55e" />
              <circle cx="100" cy="20" r="2" fill="#22c55e" />
            </svg>
          </div>
        </div>

        {/* Overall Trend Card */}
        <div className="bg-white rounded-2xl p-4 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100 relative overflow-hidden flex flex-col justify-between group">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-[13px] font-bold text-slate-800">แนวโน้มภาพรวม</h4>
            <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center shrink-0 border border-green-100">
              <ArrowDown className="w-4 h-4 text-green-600" />
            </div>
          </div>
          <div className="flex flex-col mt-auto">
            <span className="text-[18px] font-bold text-slate-800 mb-1">ลดลง</span>
            <div className="flex items-center gap-1.5">
              <span className="text-[13px] font-bold text-green-600">-8.21%</span>
              <span className="text-[10px] text-slate-400">จากภาคเรียนที่แล้ว</span>
            </div>
          </div>
          <div className="h-8 mt-4 relative opacity-50">
            <svg viewBox="0 0 100 30" preserveAspectRatio="none" className="w-full h-full">
              <path d="M 0,5 Q 10,10 20,5 T 40,15 T 60,10 T 80,25 T 100,20" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>

      </div>
    </div>
  )
}
