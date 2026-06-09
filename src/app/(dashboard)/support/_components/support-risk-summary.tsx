import React from "react"
import { Eye, BookOpen, UserX, Users, HeartPulse, AlertTriangle } from "lucide-react"

export function SupportRiskSummary() {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100 flex flex-col h-full relative overflow-hidden">
      
      <h3 className="text-[14px] font-bold text-slate-800 mb-6">สรุประดับความเสี่ยง</h3>

      <div className="flex-1 flex flex-col md:flex-row lg:flex-col items-center justify-center gap-8 mb-6">
        
        {/* Donut Chart */}
        <div className="relative w-40 h-40 shrink-0">
          <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
            {/* Background */}
            <circle cx="18" cy="18" r="15.915" fill="none" stroke="#f1f5f9" strokeWidth="3" />
            {/* Segment 1 (Yellow - Low risk part) */}
            <circle cx="18" cy="18" r="15.915" fill="none" stroke="#facc15" strokeWidth="4" strokeDasharray="30 70" strokeDashoffset="0" />
            {/* Segment 2 (Orange - Medium risk part) */}
            <circle cx="18" cy="18" r="15.915" fill="none" stroke="#f97316" strokeWidth="4" strokeDasharray="25 75" strokeDashoffset="-30" />
            {/* Segment 3 (Red - High risk part) */}
            <circle cx="18" cy="18" r="15.915" fill="none" stroke="#ef4444" strokeWidth="4" strokeDasharray="20 80" strokeDashoffset="-55" />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center pt-2">
            <span className="text-[11px] font-bold text-slate-500 mb-1">ระดับความเสี่ยง</span>
            <span className="text-xl font-black text-rose-600 leading-none">เสี่ยงสูง</span>
            <AlertTriangle className="w-5 h-5 text-rose-500 mt-2 fill-rose-100" />
          </div>
        </div>

        {/* Factors List */}
        <div className="flex-1 w-full flex flex-col justify-center">
          <div className="text-[11px] font-bold text-slate-500 mb-3 border-b border-slate-100 pb-2">ปัจจัยเสี่ยงที่สำคัญ</div>
          
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-rose-50 flex items-center justify-center text-rose-500">
                  <BookOpen className="w-3.5 h-3.5" />
                </div>
                <span className="text-[12px] font-bold text-slate-700">ผลการเรียน</span>
              </div>
              <span className="text-[10px] font-medium text-rose-500 bg-rose-50 px-2 py-0.5 rounded">ต่ำกว่าเกณฑ์</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-amber-50 flex items-center justify-center text-amber-500">
                  <UserX className="w-3.5 h-3.5" />
                </div>
                <span className="text-[12px] font-bold text-slate-700">พฤติกรรม</span>
              </div>
              <span className="text-[10px] font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded">มีพฤติกรรมก้าวร้าว</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-amber-50 flex items-center justify-center text-amber-500">
                  <Users className="w-3.5 h-3.5" />
                </div>
                <span className="text-[12px] font-bold text-slate-700">ครอบครัว</span>
              </div>
              <span className="text-[10px] font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded">ขาดการดูแลใกล้ชิด</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-orange-50 flex items-center justify-center text-orange-500">
                  <HeartPulse className="w-3.5 h-3.5" />
                </div>
                <span className="text-[12px] font-bold text-slate-700">สุขภาพกาย/ใจ</span>
              </div>
              <span className="text-[10px] font-medium text-orange-600 bg-orange-50 px-2 py-0.5 rounded">เครียด / นอนไม่หลับ</span>
            </div>
          </div>
        </div>

      </div>

      <button className="w-full flex items-center justify-center gap-1.5 text-[12px] font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 py-2.5 rounded-xl transition-colors border border-indigo-100/50 mt-auto">
        ดูการวิเคราะห์ความเสี่ยง
        <Eye className="w-4 h-4" />
      </button>

    </div>
  )
}
