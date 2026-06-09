import React from "react"
import { TrendingUp, Users, AlertTriangle, BookOpen, ChevronUp, ArrowUpRight } from "lucide-react"

export function AcademicSummaryCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6 mb-6">
      
      {/* 1. GPA Card (Purple with gradient and chart) */}
      <div className="bg-gradient-to-br from-[#4f46e5] to-[#312e81] rounded-2xl p-5 shadow-lg shadow-indigo-500/20 text-white relative overflow-hidden flex flex-col justify-between min-h-[140px]">
        {/* Background decorative elements */}
        <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
        <div className="absolute right-4 bottom-0 w-24 h-16 opacity-30">
          <svg viewBox="0 0 100 40" preserveAspectRatio="none" className="w-full h-full">
            <polyline fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" points="0,30 20,25 40,35 60,15 80,20 100,5" />
            <circle cx="20" cy="25" r="2" fill="white" />
            <circle cx="40" cy="35" r="2" fill="white" />
            <circle cx="60" cy="15" r="2" fill="white" />
            <circle cx="80" cy="20" r="2" fill="white" />
            <circle cx="100" cy="5" r="2" fill="white" />
          </svg>
        </div>

        <div className="relative z-10 flex justify-between items-start mb-2">
          <div>
            <div className="text-xs font-medium text-indigo-100/80 mb-1">ภาคเรียนที่ 1/2567 <span className="inline-block ml-2 px-1.5 py-0.5 bg-yellow-400/20 text-yellow-300 text-[9px] rounded font-bold border border-yellow-400/30">กำลังศึกษา</span></div>
            <div className="text-sm font-semibold text-white">เกรดเฉลี่ยรวม (GPA)</div>
          </div>
        </div>
        
        <div className="relative z-10">
          <div className="flex items-end gap-3">
            <span className="text-4xl font-bold tracking-tight">3.48</span>
            <div className="flex items-center gap-1 bg-white/10 px-2 py-1 rounded text-xs font-medium text-emerald-300 mb-1 backdrop-blur-sm">
              <ArrowUpRight className="w-3 h-3" />
              <span>0.26</span>
            </div>
          </div>
          <div className="text-xs text-indigo-200 mt-1">จากภาคเรียนที่แล้ว 3.22</div>
        </div>
      </div>

      {/* 2. Good Students Card */}
      <div className="bg-white rounded-2xl p-5 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100 flex items-center gap-4 relative overflow-hidden group hover:border-emerald-200 transition-colors">
        <div className="absolute inset-y-0 left-0 w-1 bg-emerald-500"></div>
        <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center shrink-0 text-emerald-600 group-hover:scale-110 transition-transform">
          <Users className="w-6 h-6" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-bold text-slate-500 mb-1">นักเรียนผลการเรียนดี</div>
          <div className="flex items-baseline gap-1.5 mb-0.5">
            <span className="text-2xl font-bold text-slate-800 tracking-tight">28</span>
            <span className="text-xs font-medium text-slate-500">คน</span>
          </div>
          <div className="text-[10px] sm:text-[11px] text-slate-400">18.4% ของนักเรียนทั้งหมด</div>
          <div className="flex items-center gap-1 text-[11px] font-medium text-emerald-600 mt-2">
            <ChevronUp className="w-3 h-3" />
            <span>4 คน จากภาคเรียนที่แล้ว</span>
          </div>
        </div>
      </div>

      {/* 3. At-risk Students Card */}
      <div className="bg-white rounded-2xl p-5 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100 flex items-center gap-4 relative overflow-hidden group hover:border-orange-200 transition-colors">
        <div className="absolute inset-y-0 left-0 w-1 bg-orange-500"></div>
        <div className="w-14 h-14 rounded-full bg-orange-50 flex items-center justify-center shrink-0 text-orange-500 group-hover:scale-110 transition-transform">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-bold text-slate-500 mb-1">ต้องติดตามใกล้ชิด</div>
          <div className="flex items-baseline gap-1.5 mb-0.5">
            <span className="text-2xl font-bold text-slate-800 tracking-tight">32</span>
            <span className="text-xs font-medium text-slate-500">คน</span>
          </div>
          <div className="text-[10px] sm:text-[11px] text-slate-400">21.1% ของนักเรียนทั้งหมด</div>
          <div className="flex items-center gap-1 text-[11px] font-medium text-emerald-600 mt-2">
            <ChevronUp className="w-3 h-3" />
            <span>6 คน จากภาคเรียนที่แล้ว</span>
          </div>
        </div>
      </div>

      {/* 4. Top Subject Card */}
      <div className="bg-white rounded-2xl p-5 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100 flex items-center gap-4 relative overflow-hidden group hover:border-purple-200 transition-colors">
        <div className="absolute inset-y-0 left-0 w-1 bg-purple-500"></div>
        <div className="w-14 h-14 rounded-full bg-purple-50 flex items-center justify-center shrink-0 text-purple-600 group-hover:scale-110 transition-transform">
          <BookOpen className="w-6 h-6" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-bold text-slate-500 mb-1">วิชาที่คะแนนเฉลี่ยสูงสุด</div>
          <div className="text-lg font-bold text-slate-800 truncate mb-1">ภาษาไทย</div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-bold text-slate-800 tracking-tight">3.41</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] font-medium text-emerald-600 mt-2">
            <ChevronUp className="w-3 h-3" />
            <span>0.18 จากภาคเรียนที่แล้ว</span>
          </div>
        </div>
      </div>

    </div>
  )
}
