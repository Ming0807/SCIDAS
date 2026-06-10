import React from "react"
import { Award, AlertOctagon, TrendingUp, Download, FileText } from "lucide-react"

export function BottomInsights() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-4 gap-4 lg:gap-6 mb-6">
      
      {/* 1. Best Class */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex items-start gap-4">
        <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
          <Award className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-semibold text-slate-500 mb-1">ห้องเรียนที่มีผลการเรียนดีที่สุด</div>
          <div className="text-xl font-semibold text-slate-800 mb-1">ม.3/1</div>
          <div className="flex flex-col gap-1">
            <div className="text-xs font-medium text-slate-600">เกรดเฉลี่ยรวม <span className="font-semibold text-slate-900 ml-1">3.72</span></div>
            <div className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
              <TrendingUp className="w-3 h-3" />
              <span>0.31 จากภาคเรียนที่แล้ว</span>
            </div>
          </div>
        </div>
        <div className="shrink-0 w-12 h-12 opacity-80">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-200">
            <path d="M8 21h8M12 17v4M7 4h10l3 7-8 6-8-6z" />
          </svg>
        </div>
      </div>

      {/* 2. Subject to improve */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex items-start gap-4">
        <div className="w-10 h-10 rounded-full bg-red-50 text-red-500 flex items-center justify-center shrink-0">
          <AlertOctagon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-semibold text-slate-500 mb-1">วิชาที่ต้องพัฒนา</div>
          <div className="text-sm font-semibold text-slate-800 mb-1 truncate">คณิตศาสตร์</div>
          <div className="flex flex-col gap-1">
            <div className="text-xs font-medium text-slate-600">คะแนนเฉลี่ย <span className="font-semibold text-slate-900 ml-1">2.68</span></div>
            <div className="text-xs text-slate-500 leading-tight">
              นักเรียนต่ำกว่า 2.00 <br/>
              จำนวน <span className="font-semibold text-red-500">38 คน</span> (25.0%)
            </div>
          </div>
        </div>
        {/* Sparkline mock */}
        <div className="shrink-0 w-16 h-8 self-center">
          <svg viewBox="0 0 100 30" className="w-full h-full overflow-visible">
            <path d="M0,5 L20,15 L40,10 L60,25 L80,20 L100,28" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="100" cy="28" r="3" fill="#ef4444" />
          </svg>
        </div>
      </div>

      {/* 3. Academic Plan Progress */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex items-start gap-4">
        <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
          <FileText className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-semibold text-slate-500 mb-1">แผนพัฒนาทางวิชาการ</div>
          <div className="text-sm font-semibold text-slate-800 mb-1">กำลังดำเนินการ <span className="text-emerald-600 ml-1">5</span> แผน</div>
          <div className="text-xs text-slate-500 mb-3">
            นักเรียนที่เข้าร่วม 48 คน (31.6%)
          </div>
          
          <div className="w-full">
            <div className="flex justify-between text-xs mb-1 font-semibold">
              <span className="text-slate-600">ความก้าวหน้า</span>
              <span className="text-emerald-600">68%</span>
            </div>
            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: '68%' }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Latest Report */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between relative overflow-hidden">
        <div className="absolute right-0 top-0 opacity-5 -translate-y-4 translate-x-4">
          <FileText className="w-32 h-32" />
        </div>
        <div className="relative z-10">
          <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
            <FileText className="w-4 h-4" />
          </div>
          <div className="text-xs font-semibold text-slate-500 mb-1">รายงานล่าสุด</div>
          <div className="text-xs font-semibold text-slate-800 mb-1 leading-snug">รายงานผลการเรียน ภาคเรียนที่ 1/2567</div>
          <div className="text-[9px] text-slate-400 mb-4">สร้างเมื่อ 24 พ.ค. 2567 10:30 น.</div>
        </div>
        
        <button className="relative z-10 w-full flex items-center justify-center gap-1.5 bg-[#4f46e5] hover:bg-[#4338ca] text-white text-xs font-semibold py-2 px-3 rounded-lg transition-colors">
          <Download className="w-3.5 h-3.5" />
          ดาวน์โหลดรายงาน
        </button>
      </div>

    </div>
  )
}
