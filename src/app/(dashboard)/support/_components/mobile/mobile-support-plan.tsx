import React from "react"
import { Heart, ChevronRight } from "lucide-react"

export function MobileSupportPlan() {
  return (
    <div className="px-4 mb-6">
      <h3 className="text-[13px] font-bold text-slate-800 mb-3">แผนการช่วยเหลือปัจจุบัน</h3>
      
      <div className="bg-gradient-to-br from-[#f8fafc] to-[#f1f5f9] rounded-2xl p-4 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-200/60 relative overflow-hidden flex items-center justify-between gap-4">
        
        {/* Left Info */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center shrink-0 shadow-sm border border-indigo-200">
            <Heart className="w-6 h-6 text-indigo-500 fill-indigo-200" />
          </div>
          <div className="flex flex-col min-w-0">
            <h4 className="text-[13px] font-bold text-slate-800 mb-0.5 truncate">แผนที่ 2 : ด้านพฤติกรรม</h4>
            <div className="text-[10px] text-slate-500 mb-0.5">เริ่มวันที่ 1 พ.ค. 2567</div>
            <div className="text-[10px] text-slate-600">ผู้รับผิดชอบ ครูสุรินทร์ จิรา</div>
          </div>
        </div>

        {/* Right Status */}
        <div className="flex flex-col items-end shrink-0 w-[100px]">
          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[9px] font-bold rounded-md mb-2 w-max">
            กำลังดำเนินการ
          </span>
          <div className="flex justify-between items-center w-full mb-1">
            <span className="text-[9px] font-medium text-slate-500">ความคืบหน้า</span>
            <span className="text-[10px] font-bold text-slate-800">60%</span>
          </div>
          <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
            <div className="h-full bg-[#4f46e5] rounded-full" style={{ width: '60%' }}></div>
          </div>
        </div>

        <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 ml-1" />

      </div>
    </div>
  )
}
