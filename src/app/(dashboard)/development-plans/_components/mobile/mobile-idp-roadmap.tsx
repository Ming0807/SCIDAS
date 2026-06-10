import React from "react"
import { CheckCircle2 } from "lucide-react"

export function MobileIdpRoadmap() {
  return (
    <div className="px-4 mb-6">
      <h3 className="text-[13px] font-bold text-slate-800 mb-4">แผนการดำเนินงาน</h3>
      
      <div className="flex items-start justify-between relative">
        <div className="absolute top-[16px] left-[10%] right-[10%] h-[2px] bg-slate-100 z-0 border-t-2 border-dashed border-slate-200"></div>

        {/* Step 1 */}
        <div className="flex flex-col items-center relative z-10 w-[60px] text-center">
          <div className="w-8 h-8 rounded-full bg-emerald-50 border-[2px] border-emerald-500 flex items-center justify-center mb-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-[10px] font-bold text-slate-700 leading-tight">ประเมิน</div>
          <div className="text-[8px] text-emerald-600 mt-0.5">เสร็จสิ้น</div>
        </div>

        {/* Step 2 (Active) */}
        <div className="flex flex-col items-center relative z-10 w-[60px] text-center">
          <div className="w-10 h-10 -mt-1 rounded-full bg-blue-50 border-[2px] border-blue-500 flex items-center justify-center mb-1 shadow-[0_0_10px_rgba(59,130,246,0.2)]">
            <span className="text-[14px] font-bold text-blue-600">2</span>
          </div>
          <div className="text-[10px] font-bold text-blue-700 leading-tight">ตั้งเป้าหมาย</div>
          <div className="text-[8px] text-blue-600 mt-0.5">กำลังดำเนินการ</div>
        </div>

        {/* Step 3 */}
        <div className="flex flex-col items-center relative z-10 w-[60px] text-center opacity-60">
          <div className="w-8 h-8 rounded-full bg-white border-[2px] border-slate-200 flex items-center justify-center mb-2">
            <span className="text-[12px] font-bold text-slate-400">3</span>
          </div>
          <div className="text-[10px] font-bold text-slate-700 leading-tight">วางกิจกรรม</div>
          <div className="text-[8px] text-slate-400 mt-0.5">รอดำเนินการ</div>
        </div>

        {/* Step 4 */}
        <div className="flex flex-col items-center relative z-10 w-[60px] text-center opacity-60 hidden sm:flex">
          <div className="w-8 h-8 rounded-full bg-white border-[2px] border-slate-200 flex items-center justify-center mb-2">
            <span className="text-[12px] font-bold text-slate-400">4</span>
          </div>
          <div className="text-[10px] font-bold text-slate-700 leading-tight">ติดตามผล</div>
          <div className="text-[8px] text-slate-400 mt-0.5">รอดำเนินการ</div>
        </div>

        {/* Step 5 */}
        <div className="flex flex-col items-center relative z-10 w-[60px] text-center opacity-60">
          <div className="w-8 h-8 rounded-full bg-white border-[2px] border-slate-200 flex items-center justify-center mb-2">
            <span className="text-[12px] font-bold text-slate-400">5</span>
          </div>
          <div className="text-[10px] font-bold text-slate-700 leading-tight">ประเมินซ้ำ</div>
          <div className="text-[8px] text-slate-400 mt-0.5">รอดำเนินการ</div>
        </div>

      </div>
    </div>
  )
}
