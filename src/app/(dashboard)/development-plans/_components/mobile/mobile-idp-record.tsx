import React from "react"
import { ChevronRight } from "lucide-react"

export function MobileIdpRecord() {
  return (
    <div className="px-4 mb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[13px] font-bold text-slate-800">บันทึกติดตามล่าสุด</h3>
        <button className="flex items-center gap-0.5 text-[11px] font-bold text-blue-600">
          ดูประวัติทั้งหมด
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="bg-white rounded-2xl p-4 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100 flex flex-col gap-4">
        
        <div className="flex items-start gap-3">
          <img src="https://api.dicebear.com/7.x/notionists/svg?seed=teacher2" alt="Teacher" className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200" />
          <div className="flex flex-col">
            <span className="text-[12px] font-bold text-slate-800">ครูจันทร์จิรา สุขสวัสดิ์</span>
            <span className="text-[10px] text-slate-500">13 พ.ค. 2567 14:30 น.</span>
          </div>
        </div>

        <p className="text-[11px] text-slate-600 leading-relaxed font-medium bg-slate-50 p-3 rounded-xl border border-slate-100/50">
          นักเรียนมีความตั้งใจในการเรียนมากขึ้น ควรเสริมทักษะคณิตศาสตร์ต่อเนื่อง และเน้นวินัยการเข้าเรียนให้ครบเป้าหมาย
        </p>

        <div>
          <div className="text-[10px] font-medium text-slate-500 mb-2 text-center border-t border-slate-100 pt-3">แนวโน้มความก้าวหน้า 4 สัปดาห์ล่าสุด</div>
          <div className="w-full relative h-16 pt-2">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 100 40" preserveAspectRatio="none">
              {/* Path */}
              {/* 42, 48, 55, 62 */}
              <path d="M 10,35 L 36,30 L 63,22 L 90,10" fill="none" stroke="#6366f1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              
              {/* Points & Labels */}
              <circle cx="10" cy="35" r="2" fill="#6366f1" />
              <text x="10" y="27" fontSize="5" fill="#4f46e5" fontWeight="bold" textAnchor="middle">42%</text>
              <text x="10" y="45" fontSize="4" fill="#94a3b8" textAnchor="middle">16 เม.ย.</text>

              <circle cx="36" cy="30" r="2" fill="#6366f1" />
              <text x="36" y="22" fontSize="5" fill="#4f46e5" fontWeight="bold" textAnchor="middle">48%</text>
              <text x="36" y="45" fontSize="4" fill="#94a3b8" textAnchor="middle">23 เม.ย.</text>

              <circle cx="63" cy="22" r="2" fill="#6366f1" />
              <text x="63" y="14" fontSize="5" fill="#4f46e5" fontWeight="bold" textAnchor="middle">55%</text>
              <text x="63" y="45" fontSize="4" fill="#94a3b8" textAnchor="middle">30 เม.ย.</text>

              <circle cx="90" cy="10" r="2" fill="#6366f1" />
              <text x="90" y="2" fontSize="5" fill="#4f46e5" fontWeight="bold" textAnchor="middle">62%</text>
              <text x="90" y="45" fontSize="4" fill="#94a3b8" textAnchor="middle">7 พ.ค.</text>
            </svg>
          </div>
        </div>

      </div>
    </div>
  )
}
