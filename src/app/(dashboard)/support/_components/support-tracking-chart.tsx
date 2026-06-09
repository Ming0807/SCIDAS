import React from "react"
import { ChevronDown, ThumbsUp } from "lucide-react"

export function SupportTrackingChart() {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100 flex flex-col h-full">
      
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-[14px] font-bold text-slate-800">ติดตามผลการช่วยเหลือ</h3>
        <button className="flex items-center gap-1 text-[11px] font-medium text-slate-500 bg-slate-50 px-2 py-1.5 rounded-md border border-slate-100 hover:bg-slate-100">
          แสดงผล 6 เดือนล่าสุด
          <ChevronDown className="w-3 h-3" />
        </button>
      </div>

      <div className="flex-1 w-full relative min-h-[160px] pb-6 ml-2">
        <svg className="w-full h-full overflow-visible" viewBox="0 0 100 80" preserveAspectRatio="none">
          {/* Y Axis */}
          <line x1="10" y1="10" x2="100" y2="10" stroke="#f1f5f9" strokeWidth="0.5" />
          <text x="8" y="10" fontSize="3.5" fill="#94a3b8" textAnchor="end" dominantBaseline="middle">5</text>
          
          <line x1="10" y1="26" x2="100" y2="26" stroke="#f1f5f9" strokeWidth="0.5" strokeDasharray="2 2" />
          <text x="8" y="26" fontSize="3.5" fill="#94a3b8" textAnchor="end" dominantBaseline="middle">4</text>
          
          <line x1="10" y1="42" x2="100" y2="42" stroke="#f1f5f9" strokeWidth="0.5" strokeDasharray="2 2" />
          <text x="8" y="42" fontSize="3.5" fill="#94a3b8" textAnchor="end" dominantBaseline="middle">3</text>
          
          <line x1="10" y1="58" x2="100" y2="58" stroke="#f1f5f9" strokeWidth="0.5" strokeDasharray="2 2" />
          <text x="8" y="58" fontSize="3.5" fill="#94a3b8" textAnchor="end" dominantBaseline="middle">2</text>
          
          <line x1="10" y1="74" x2="100" y2="74" stroke="#f1f5f9" strokeWidth="0.5" strokeDasharray="2 2" />
          <text x="8" y="74" fontSize="3.5" fill="#94a3b8" textAnchor="end" dominantBaseline="middle">1</text>
          
          <line x1="10" y1="90" x2="100" y2="90" stroke="#f1f5f9" strokeWidth="0.5" />

          {/* Path 1: ผลการเรียน (Blue) */}
          <path d="M 15,26 L 30,30 L 45,40 L 60,26 L 75,40 L 90,20" fill="none" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="15" cy="26" r="1.5" fill="#3b82f6" />
          <circle cx="30" cy="30" r="1.5" fill="#3b82f6" />
          <circle cx="45" cy="40" r="1.5" fill="#3b82f6" />
          <circle cx="60" cy="26" r="1.5" fill="#3b82f6" />
          <circle cx="75" cy="40" r="1.5" fill="#3b82f6" />
          <circle cx="90" cy="20" r="1.5" fill="#3b82f6" />

          {/* Path 2: พฤติกรรม (Green) */}
          <path d="M 15,58 L 30,50 L 45,62 L 60,54 L 75,68 L 90,50" fill="none" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="15" cy="58" r="1.5" fill="#10b981" />
          <circle cx="30" cy="50" r="1.5" fill="#10b981" />
          <circle cx="45" cy="62" r="1.5" fill="#10b981" />
          <circle cx="60" cy="54" r="1.5" fill="#10b981" />
          <circle cx="75" cy="68" r="1.5" fill="#10b981" />
          <circle cx="90" cy="50" r="1.5" fill="#10b981" />

          {/* Path 3: ความเครียด (Orange) */}
          <path d="M 15,74 L 30,70 L 45,80 L 60,76 L 75,72 L 90,66" fill="none" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="15" cy="74" r="1.5" fill="#f59e0b" />
          <circle cx="30" cy="70" r="1.5" fill="#f59e0b" />
          <circle cx="45" cy="80" r="1.5" fill="#f59e0b" />
          <circle cx="60" cy="76" r="1.5" fill="#f59e0b" />
          <circle cx="75" cy="72" r="1.5" fill="#f59e0b" />
          <circle cx="90" cy="66" r="1.5" fill="#f59e0b" />

          {/* X Axis Labels */}
          <text x="15" y="100" fontSize="3.5" fill="#94a3b8" textAnchor="middle">มี.ค.</text>
          <text x="30" y="100" fontSize="3.5" fill="#94a3b8" textAnchor="middle">เม.ย.</text>
          <text x="45" y="100" fontSize="3.5" fill="#94a3b8" textAnchor="middle">พ.ค.</text>
          <text x="60" y="100" fontSize="3.5" fill="#94a3b8" textAnchor="middle">มิ.ย.</text>
          <text x="75" y="100" fontSize="3.5" fill="#94a3b8" textAnchor="middle">ก.ค.</text>
          <text x="90" y="100" fontSize="3.5" fill="#94a3b8" textAnchor="middle">ปัจจุบัน</text>
        </svg>
      </div>

      <div className="flex items-center justify-center flex-wrap gap-6 mt-2 mb-6">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
          <span className="text-[10px] text-slate-500 font-medium">ผลการเรียน</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
          <span className="text-[10px] text-slate-500 font-medium">พฤติกรรม</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-amber-500"></div>
          <span className="text-[10px] text-slate-500 font-medium">ความเครียด</span>
        </div>
      </div>

      <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-4 flex gap-3">
        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
          <ThumbsUp className="w-4 h-4 text-emerald-600" />
        </div>
        <div>
          <div className="text-[12px] font-bold text-emerald-800 mb-0.5">แนวโน้มดีขึ้น</div>
          <div className="text-[11px] text-emerald-600/80 mb-2 leading-relaxed">
            ผลการช่วยเหลือมีแนวโน้มที่ดีขึ้น ควรดำเนินการต่อเนื่องดูรายละเอียดการติดตาม
          </div>
          <button className="text-[10px] font-bold text-emerald-700 hover:text-emerald-800 underline">
            ดูรายละเอียดการติดตาม
          </button>
        </div>
      </div>

    </div>
  )
}
