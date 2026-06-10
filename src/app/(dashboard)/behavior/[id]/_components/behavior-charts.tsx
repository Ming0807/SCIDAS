import React from "react"
import { ChevronDown, HelpCircle, CheckCircle2, TrendingUp } from "lucide-react"

export function BehaviorCharts() {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 lg:gap-6 mb-6">
      
      {/* Chart 1: Monthly Trend */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col xl:col-span-1 h-full">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[13px] font-bold text-slate-800">สรุปพฤติกรรมรายเดือน</h3>
          <button className="flex items-center gap-1 text-[11px] font-medium text-slate-500 bg-slate-50 px-2 py-1.5 rounded-md border border-slate-100 hover:bg-slate-100">
            6 เดือนล่าสุด
            <ChevronDown className="w-3 h-3" />
          </button>
        </div>

        <div className="flex items-center gap-4 mb-4 text-[10px] font-medium text-slate-600">
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-[2px] bg-emerald-500 rounded-full"></div>
            เชิงบวก
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-[2px] bg-rose-500 rounded-full"></div>
            เชิงลบ
          </div>
        </div>

        <div className="flex-1 min-h-[180px] w-full relative pb-4">
          <svg className="w-full h-full overflow-visible" viewBox="0 0 100 110" preserveAspectRatio="none">
            {/* Y Axis */}
            <line x1="10" y1="10" x2="100" y2="10" stroke="#f1f5f9" strokeWidth="0.5" />
            <text x="8" y="10" fontSize="3.5" fill="#94a3b8" textAnchor="end" dominantBaseline="middle">10</text>
            
            <line x1="10" y1="26" x2="100" y2="26" stroke="#f1f5f9" strokeWidth="0.5" strokeDasharray="2 2" />
            <text x="8" y="26" fontSize="3.5" fill="#94a3b8" textAnchor="end" dominantBaseline="middle">8</text>
            
            <line x1="10" y1="42" x2="100" y2="42" stroke="#f1f5f9" strokeWidth="0.5" strokeDasharray="2 2" />
            <text x="8" y="42" fontSize="3.5" fill="#94a3b8" textAnchor="end" dominantBaseline="middle">6</text>
            
            <line x1="10" y1="58" x2="100" y2="58" stroke="#f1f5f9" strokeWidth="0.5" strokeDasharray="2 2" />
            <text x="8" y="58" fontSize="3.5" fill="#94a3b8" textAnchor="end" dominantBaseline="middle">4</text>
            
            <line x1="10" y1="74" x2="100" y2="74" stroke="#f1f5f9" strokeWidth="0.5" strokeDasharray="2 2" />
            <text x="8" y="74" fontSize="3.5" fill="#94a3b8" textAnchor="end" dominantBaseline="middle">2</text>
            
            <line x1="10" y1="90" x2="100" y2="90" stroke="#f1f5f9" strokeWidth="0.5" />
            <text x="8" y="90" fontSize="3.5" fill="#94a3b8" textAnchor="end" dominantBaseline="middle">0</text>

            {/* Path Green (Positive) */}
            <path d="M 15,42 L 30,50 L 45,34 L 60,26 L 75,42 L 90,18" fill="none" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M 15,42 L 30,50 L 45,34 L 60,26 L 75,42 L 90,18 L 90,90 L 15,90 Z" fill="#10b981" opacity="0.05" />
            
            {/* Path Red (Negative) */}
            <path d="M 15,82 L 30,90 L 45,74 L 60,82 L 75,90 L 90,74" fill="none" stroke="#f43f5e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M 15,82 L 30,90 L 45,74 L 60,82 L 75,90 L 90,74 L 90,90 L 15,90 Z" fill="#f43f5e" opacity="0.05" />

            {/* Points Green */}
            <circle cx="15" cy="42" r="1.5" fill="#10b981" />
            <circle cx="30" cy="50" r="1.5" fill="#10b981" />
            <circle cx="45" cy="34" r="1.5" fill="#10b981" />
            <circle cx="60" cy="26" r="1.5" fill="#10b981" />
            <circle cx="75" cy="42" r="1.5" fill="#10b981" />
            <circle cx="90" cy="18" r="1.5" fill="#10b981" />

            {/* Points Red */}
            <circle cx="15" cy="82" r="1.5" fill="#f43f5e" />
            <circle cx="30" cy="90" r="1.5" fill="#f43f5e" />
            <circle cx="45" cy="74" r="1.5" fill="#f43f5e" />
            <circle cx="60" cy="82" r="1.5" fill="#f43f5e" />
            <circle cx="75" cy="90" r="1.5" fill="#f43f5e" />
            <circle cx="90" cy="74" r="1.5" fill="#f43f5e" />

            {/* X Axis Labels */}
            <text x="15" y="100" fontSize="3.5" fill="#94a3b8" textAnchor="middle">พ.ค.</text>
            <text x="30" y="100" fontSize="3.5" fill="#94a3b8" textAnchor="middle">มิ.ย.</text>
            <text x="45" y="100" fontSize="3.5" fill="#94a3b8" textAnchor="middle">ก.ค.</text>
            <text x="60" y="100" fontSize="3.5" fill="#94a3b8" textAnchor="middle">ส.ค.</text>
            <text x="75" y="100" fontSize="3.5" fill="#94a3b8" textAnchor="middle">ก.ย.</text>
            <text x="90" y="100" fontSize="3.5" fill="#94a3b8" textAnchor="middle">ต.ค.</text>
          </svg>
        </div>
      </div>

      {/* Chart 2: Behavior Types (Donut) */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col xl:col-span-1 h-full">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-[13px] font-bold text-slate-800">ประเภทพฤติกรรม</h3>
        </div>

        <div className="flex-1 flex items-center justify-between pl-4 pr-2">
          {/* Donut */}
          <div className="relative w-32 h-32 shrink-0">
            <svg viewBox="-2 -2 40 40" className="w-full h-full transform -rotate-90 overflow-visible">
              {/* วินัย 38.89% (14) */}
              <circle cx="18" cy="18" r="15.915" fill="none" stroke="#3b82f6" strokeWidth="6" strokeDasharray="38.89 61.11" strokeDashoffset="0" />
              {/* ความรับผิดชอบ 27.78% (10) */}
              <circle cx="18" cy="18" r="15.915" fill="none" stroke="#22c55e" strokeWidth="6" strokeDasharray="27.78 72.22" strokeDashoffset="-38.89" />
              {/* จิตสาธารณะ 16.67% (6) */}
              <circle cx="18" cy="18" r="15.915" fill="none" stroke="#eab308" strokeWidth="6" strokeDasharray="16.67 83.33" strokeDashoffset="-66.67" />
              {/* มารยาท 11.11% (4) */}
              <circle cx="18" cy="18" r="15.915" fill="none" stroke="#a855f7" strokeWidth="6" strokeDasharray="11.11 88.89" strokeDashoffset="-83.34" />
              {/* อื่นๆ 5.55% (2) */}
              <circle cx="18" cy="18" r="15.915" fill="none" stroke="#cbd5e1" strokeWidth="6" strokeDasharray="5.55 94.45" strokeDashoffset="-94.45" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-slate-800 leading-none mb-1">18</span>
              <span className="text-[10px] text-slate-500 font-medium">ครั้ง</span>
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-col gap-3 flex-1 ml-6">
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                <span className="text-[11px] font-bold text-slate-700">วินัย</span>
              </div>
              <div className="text-[9px] text-slate-500 ml-3">7 ครั้ง (38.89%)</div>
            </div>
            
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                <span className="text-[11px] font-bold text-slate-700">ความรับผิดชอบ</span>
              </div>
              <div className="text-[9px] text-slate-500 ml-3">5 ครั้ง (27.78%)</div>
            </div>

            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-yellow-500"></div>
                <span className="text-[11px] font-bold text-slate-700">จิตสาธารณะ</span>
              </div>
              <div className="text-[9px] text-slate-500 ml-3">3 ครั้ง (16.67%)</div>
            </div>

            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
                <span className="text-[11px] font-bold text-slate-700">มารยาท</span>
              </div>
              <div className="text-[9px] text-slate-500 ml-3">2 ครั้ง (11.11%)</div>
            </div>

            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
                <span className="text-[11px] font-bold text-slate-700">อื่นๆ</span>
              </div>
              <div className="text-[9px] text-slate-500 ml-3">1 ครั้ง (5.55%)</div>
            </div>
          </div>

        </div>
      </div>

      {/* Chart 3: Frequent Behaviors */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col xl:col-span-1 h-full">
        <h3 className="text-[13px] font-bold text-slate-800 mb-4">พฤติกรรมที่พบบ่อย</h3>

        <div className="flex justify-between border-b border-slate-100 mb-4">
          <button className="pb-2 text-[11px] font-bold text-emerald-600 border-b-2 border-emerald-500 flex-1 text-center">เชิงบวก</button>
          <button className="pb-2 text-[11px] font-medium text-slate-400 flex-1 text-center">เชิงลบ</button>
        </div>

        <div className="flex-1 flex flex-col gap-4">
          <div className="flex items-center justify-between gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between mb-1">
                <span className="text-[11px] font-bold text-slate-700">ช่วยเหลือเพื่อน</span>
                <span className="text-[11px] font-bold text-slate-800">5 ครั้ง</span>
              </div>
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: '100%' }}></div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between mb-1">
                <span className="text-[11px] font-bold text-slate-700">ส่งงานตรงเวลา</span>
                <span className="text-[11px] font-bold text-slate-800">4 ครั้ง</span>
              </div>
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: '80%' }}></div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between mb-1">
                <span className="text-[11px] font-bold text-slate-700">ตั้งใจเรียน</span>
                <span className="text-[11px] font-bold text-slate-800">3 ครั้ง</span>
              </div>
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: '60%' }}></div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between mb-1">
                <span className="text-[11px] font-bold text-slate-700">เข้าร่วมกิจกรรม</span>
                <span className="text-[11px] font-bold text-slate-800">2 ครั้ง</span>
              </div>
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: '40%' }}></div>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  )
}
