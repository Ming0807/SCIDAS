import React from "react"
import { ChevronDown, Edit3 } from "lucide-react"

export function IdpTrendReflection() {
  return (
    <div className="flex flex-col gap-4 h-full">
      
      {/* Trend Chart */}
      <div className="bg-white rounded-2xl p-5 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100 flex-1 flex flex-col relative">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[13px] font-bold text-slate-800">แนวโน้มความก้าวหน้า <span className="text-slate-400 font-normal">(คะแนนเฉลี่ยรวม)</span></h3>
          <button className="flex items-center gap-1 text-[10px] font-medium text-slate-500 border border-slate-200 px-2 py-1 rounded-md hover:bg-slate-50">
            5 เดือน
            <ChevronDown className="w-3 h-3" />
          </button>
        </div>

        <div className="flex-1 relative min-h-[140px] pb-4">
          <svg className="w-full h-full overflow-visible" viewBox="0 0 100 80" preserveAspectRatio="none">
            {/* Y Axis */}
            <line x1="10" y1="10" x2="100" y2="10" stroke="#f1f5f9" strokeWidth="0.5" />
            <text x="8" y="10" fontSize="4" fill="#94a3b8" textAnchor="end" dominantBaseline="middle">100</text>
            
            <line x1="10" y1="30" x2="100" y2="30" stroke="#f1f5f9" strokeWidth="0.5" strokeDasharray="2 2" />
            <text x="8" y="30" fontSize="4" fill="#94a3b8" textAnchor="end" dominantBaseline="middle">75</text>
            
            <line x1="10" y1="50" x2="100" y2="50" stroke="#f1f5f9" strokeWidth="0.5" strokeDasharray="2 2" />
            <text x="8" y="50" fontSize="4" fill="#94a3b8" textAnchor="end" dominantBaseline="middle">50</text>
            
            <line x1="10" y1="70" x2="100" y2="70" stroke="#f1f5f9" strokeWidth="0.5" strokeDasharray="2 2" />
            <text x="8" y="70" fontSize="4" fill="#94a3b8" textAnchor="end" dominantBaseline="middle">25</text>
            
            <line x1="10" y1="90" x2="100" y2="90" stroke="#f1f5f9" strokeWidth="0.5" />
            <text x="8" y="90" fontSize="4" fill="#94a3b8" textAnchor="end" dominantBaseline="middle">0</text>

            {/* Path (Purple) */}
            {/* 42, 45, 50, 55, 62 */}
            {/* Map 0-100 to y=90-10 -> 1 unit = 0.8 */}
            <path d="M 20,56.4 L 40,54 L 60,50 L 80,46 L 100,40.4" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            
            {/* Points & Labels */}
            <circle cx="20" cy="56.4" r="2" fill="#6366f1" className="drop-shadow-sm" />
            <text x="20" y="51" fontSize="4" fill="#4f46e5" fontWeight="bold" textAnchor="middle">42</text>

            <circle cx="40" cy="54" r="2" fill="#6366f1" className="drop-shadow-sm" />
            <text x="40" y="49" fontSize="4" fill="#4f46e5" fontWeight="bold" textAnchor="middle">45</text>

            <circle cx="60" cy="50" r="2" fill="#6366f1" className="drop-shadow-sm" />
            <text x="60" y="45" fontSize="4" fill="#4f46e5" fontWeight="bold" textAnchor="middle">50</text>

            <circle cx="80" cy="46" r="2" fill="#6366f1" className="drop-shadow-sm" />
            <text x="80" y="41" fontSize="4" fill="#4f46e5" fontWeight="bold" textAnchor="middle">55</text>

            <circle cx="100" cy="40.4" r="2" fill="#6366f1" className="drop-shadow-sm" />
            <text x="100" y="35" fontSize="4" fill="#4f46e5" fontWeight="bold" textAnchor="middle">62</text>

            {/* X Axis Labels */}
            <text x="20" y="100" fontSize="4" fill="#94a3b8" textAnchor="middle">ม.ค.</text>
            <text x="40" y="100" fontSize="4" fill="#94a3b8" textAnchor="middle">ก.พ.</text>
            <text x="60" y="100" fontSize="4" fill="#94a3b8" textAnchor="middle">มี.ค.</text>
            <text x="80" y="100" fontSize="4" fill="#94a3b8" textAnchor="middle">เม.ย.</text>
            <text x="100" y="100" fontSize="4" fill="#94a3b8" textAnchor="middle">พ.ค.</text>
          </svg>
        </div>
      </div>

      {/* Reflection */}
      <div className="bg-indigo-50/50 rounded-2xl p-5 border border-indigo-100 flex-1 flex flex-col relative overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[14px] font-bold text-indigo-900 flex items-center gap-2">
            <Edit3 className="w-4 h-4 text-indigo-500" />
            บันทึกสะท้อนผล (Reflection)
          </h3>
        </div>
        <p className="text-[12px] text-indigo-800/80 leading-relaxed font-medium">
          นักเรียนเริ่มมีการมาเรียนสม่ำเสมอมากขึ้น ผลการเรียนคณิตศาสตร์ดีขึ้นจากการเข้าร่วมติวเสริม 
          แต่ยังต้องเน้นการฝึกโจทย์ปัญหาเพิ่มเติม พฤติกรรมในชั้นเรียนดีขึ้น ควรให้กำลังใจและติดตาม
          อย่างต่อเนื่อง ส่วนทักษะการอ่านยังต้องฝึกฝนเป็นประจำ
        </p>

        <div className="mt-auto pt-4 flex items-center justify-between">
          <span className="text-[10px] text-slate-500">บันทึกล่าสุด: 17 พ.ค. 2567 โดย นางสาวจันทร์จิรา พรมดี</span>
          <button className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700">ดูทั้งหมด</button>
        </div>
      </div>

    </div>
  )
}
