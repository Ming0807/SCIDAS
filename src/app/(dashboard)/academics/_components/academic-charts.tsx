import React from "react"
import { ChevronDown } from "lucide-react"

export function AcademicCharts() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-2 2xl:grid-cols-3 gap-6 mb-6">
      
      {/* 1. Line Chart: GPA Trend */}
      <div className="bg-white rounded-2xl p-5 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100 flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-sm font-bold text-slate-800">แนวโน้มเกรดเฉลี่ยรวม (GPA)</h3>
          <button className="flex items-center gap-1 text-[11px] font-medium text-slate-500 bg-slate-50 px-2 py-1 rounded border border-slate-100 hover:bg-slate-100">
            5 ภาคเรียนล่าสุด
            <ChevronDown className="w-3 h-3" />
          </button>
        </div>
        <div className="flex-1 relative min-h-[180px] w-full flex items-end">
          {/* Custom SVG Line Chart */}
          <svg className="w-full h-[150px] overflow-visible" viewBox="0 0 100 60" preserveAspectRatio="none">
            {/* Grid lines */}
            <line x1="0" y1="10" x2="100" y2="10" stroke="#f1f5f9" strokeWidth="0.5" />
            <line x1="0" y1="25" x2="100" y2="25" stroke="#f1f5f9" strokeWidth="0.5" />
            <line x1="0" y1="40" x2="100" y2="40" stroke="#f1f5f9" strokeWidth="0.5" />
            <line x1="0" y1="55" x2="100" y2="55" stroke="#f1f5f9" strokeWidth="0.5" />
            
            {/* Y-axis labels */}
            <text x="-2" y="10" fontSize="3" fill="#94a3b8" textAnchor="end" dominantBaseline="middle">4.00</text>
            <text x="-2" y="25" fontSize="3" fill="#94a3b8" textAnchor="end" dominantBaseline="middle">3.50</text>
            <text x="-2" y="40" fontSize="3" fill="#94a3b8" textAnchor="end" dominantBaseline="middle">2.00</text>
            <text x="-2" y="55" fontSize="3" fill="#94a3b8" textAnchor="end" dominantBaseline="middle">1.00</text>

            {/* Area gradient */}
            <defs>
              <linearGradient id="gpaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366f1" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Line connecting points */}
            <path d="M 5,50 L 25,35 L 45,32 L 65,18 L 85,12" fill="none" stroke="#6366f1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            
            {/* Area under line */}
            <path d="M 5,50 L 25,35 L 45,32 L 65,18 L 85,12 L 85,60 L 5,60 Z" fill="url(#gpaGradient)" />

            {/* Points and Value Tooltips */}
            {/* P1 */}
            <circle cx="5" cy="50" r="1.5" fill="white" stroke="#6366f1" strokeWidth="0.5" />
            <text x="5" y="47" fontSize="3.5" fill="#334155" textAnchor="middle" fontWeight="bold">2.45</text>
            
            {/* P2 */}
            <circle cx="25" cy="35" r="1.5" fill="white" stroke="#6366f1" strokeWidth="0.5" />
            <text x="25" y="32" fontSize="3.5" fill="#334155" textAnchor="middle" fontWeight="bold">2.66</text>
            
            {/* P3 */}
            <circle cx="45" cy="32" r="1.5" fill="white" stroke="#6366f1" strokeWidth="0.5" />
            <text x="45" y="29" fontSize="3.5" fill="#334155" textAnchor="middle" fontWeight="bold">2.72</text>
            
            {/* P4 */}
            <circle cx="65" cy="18" r="1.5" fill="white" stroke="#6366f1" strokeWidth="0.5" />
            <text x="65" y="15" fontSize="3.5" fill="#334155" textAnchor="middle" fontWeight="bold">3.22</text>
            
            {/* P5 (Current) */}
            <circle cx="85" cy="12" r="2" fill="#6366f1" />
            <circle cx="85" cy="12" r="4" fill="#6366f1" opacity="0.2" />
            <text x="85" y="8" fontSize="4" fill="#6366f1" textAnchor="middle" fontWeight="bold">3.48</text>

            {/* X-axis labels */}
            <text x="5" y="65" fontSize="3.5" fill="#94a3b8" textAnchor="middle">1/2566</text>
            <text x="25" y="65" fontSize="3.5" fill="#94a3b8" textAnchor="middle">2/2566</text>
            <text x="45" y="65" fontSize="3.5" fill="#94a3b8" textAnchor="middle">1/2567</text>
            <text x="65" y="65" fontSize="3.5" fill="#94a3b8" textAnchor="middle">2/2567</text>
            <text x="85" y="65" fontSize="3.5" fill="#6366f1" textAnchor="middle" fontWeight="bold">1/2567</text>
          </svg>
        </div>
      </div>

      {/* 2. Donut Chart: Grade Distribution */}
      <div className="bg-white rounded-2xl p-5 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100 flex flex-col items-center justify-center">
        <h3 className="text-sm font-bold text-slate-800 self-start mb-4">การกระจายระดับผลการเรียน</h3>
        <div className="flex flex-col sm:flex-row xl:flex-col 2xl:flex-row w-full items-center justify-center gap-6">
          {/* Donut SVG */}
          <div className="relative w-32 h-32 shrink-0">
            <svg viewBox="0 0 42 42" className="w-full h-full transform -rotate-90 overflow-visible">
              <circle cx="21" cy="21" r="15.915" fill="none" stroke="#f1f5f9" strokeWidth="4" />
              {/* Segments: total 152. Red (4) 2.6%, Orange (16) 10.5%, Yellow (42) 27.6%, Blue (62) 40.8%, Green (28) 18.4% */}
              {/* Green (Excellent) */}
              <circle cx="21" cy="21" r="15.915" fill="none" stroke="#10b981" strokeWidth="4" strokeDasharray="18.4 81.6" strokeDashoffset="0" />
              {/* Blue (Good) */}
              <circle cx="21" cy="21" r="15.915" fill="none" stroke="#3b82f6" strokeWidth="4" strokeDasharray="40.8 59.2" strokeDashoffset="-18.4" />
              {/* Yellow (Fair) */}
              <circle cx="21" cy="21" r="15.915" fill="none" stroke="#f59e0b" strokeWidth="4" strokeDasharray="27.6 72.4" strokeDashoffset="-59.2" />
              {/* Orange (Improve) */}
              <circle cx="21" cy="21" r="15.915" fill="none" stroke="#f97316" strokeWidth="4" strokeDasharray="10.5 89.5" strokeDashoffset="-86.8" />
              {/* Red (Fail) */}
              <circle cx="21" cy="21" r="15.915" fill="none" stroke="#ef4444" strokeWidth="4" strokeDasharray="2.6 97.4" strokeDashoffset="-97.3" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-[10px] text-slate-500 font-medium">นักเรียนทั้งหมด</span>
              <span className="text-xl font-bold text-slate-800">152 <span className="text-xs text-slate-500 font-normal">คน</span></span>
            </div>
          </div>
          
          {/* Legend */}
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[#10b981]"></div><span className="text-slate-600">4.00 - 3.51</span></div>
              <div className="text-right"><span className="font-bold text-slate-800">28</span> <span className="text-slate-400 text-[10px]">(18.4%)</span></div>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[#3b82f6]"></div><span className="text-slate-600">3.50 - 2.51</span></div>
              <div className="text-right"><span className="font-bold text-slate-800">62</span> <span className="text-slate-400 text-[10px]">(40.8%)</span></div>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[#f59e0b]"></div><span className="text-slate-600">2.50 - 1.51</span></div>
              <div className="text-right"><span className="font-bold text-slate-800">42</span> <span className="text-slate-400 text-[10px]">(27.6%)</span></div>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[#f97316]"></div><span className="text-slate-600">1.50 - 1.01</span></div>
              <div className="text-right"><span className="font-bold text-slate-800">16</span> <span className="text-slate-400 text-[10px]">(10.5%)</span></div>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[#ef4444]"></div><span className="text-slate-600">1.00 - 0.00</span></div>
              <div className="text-right"><span className="font-bold text-slate-800">4</span> <span className="text-slate-400 text-[10px]">(2.7%)</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Bar Chart: Top Subjects */}
      <div className="bg-white rounded-2xl p-5 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100 flex flex-col lg:col-span-1 xl:col-span-2 2xl:col-span-1">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-800">คะแนนเฉลี่ยรายวิชา (Top 6)</h3>
          <button className="flex items-center gap-1 text-[11px] font-medium text-slate-500 hover:text-slate-800">
            ทั้งหมด
            <ChevronDown className="w-3 h-3" />
          </button>
        </div>
        
        <div className="flex-1 flex flex-col justify-between gap-3">
          {/* Subject 1 */}
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="font-medium text-slate-700">ภาษาไทย</span>
              <span className="font-bold text-slate-900">3.41</span>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-blue-600 rounded-full" style={{ width: '85%' }}></div>
            </div>
          </div>
          {/* Subject 2 */}
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="font-medium text-slate-700">คณิตศาสตร์</span>
              <span className="font-bold text-slate-900">3.28</span>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: '82%' }}></div>
            </div>
          </div>
          {/* Subject 3 */}
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="font-medium text-slate-700">ภาษาอังกฤษ</span>
              <span className="font-bold text-slate-900">3.07</span>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-orange-500 rounded-full" style={{ width: '76%' }}></div>
            </div>
          </div>
          {/* Subject 4 */}
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="font-medium text-slate-700">วิทยาศาสตร์</span>
              <span className="font-bold text-slate-900">2.96</span>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-purple-500 rounded-full" style={{ width: '74%' }}></div>
            </div>
          </div>
          {/* Subject 5 */}
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="font-medium text-slate-700">สังคมศึกษา</span>
              <span className="font-bold text-slate-900">2.82</span>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-cyan-500 rounded-full" style={{ width: '70%' }}></div>
            </div>
          </div>
          {/* Subject 6 */}
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="font-medium text-slate-700">สุขศึกษาและพลศึกษา</span>
              <span className="font-bold text-slate-900">2.68</span>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-rose-500 rounded-full" style={{ width: '67%' }}></div>
            </div>
          </div>
        </div>

        {/* X-axis scale */}
        <div className="flex justify-between text-[10px] text-slate-400 mt-2 px-1">
          <span>0.00</span>
          <span>1.00</span>
          <span>2.00</span>
          <span>3.00</span>
          <span>4.00</span>
        </div>
      </div>

    </div>
  )
}
