import React from "react"
import { Flag, Calendar, UserCircle } from "lucide-react"

export function MobileIdpPlanStatus() {
  return (
    <div className="px-4 py-5">
      <div className="bg-gradient-to-br from-[#f8fafc] to-[#f1f5f9] rounded-xl p-4 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-200/60 relative overflow-hidden flex flex-col gap-3">
        
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center shrink-0 shadow-sm border border-indigo-200">
            <Flag className="w-6 h-6 text-indigo-500 fill-indigo-200" />
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <h4 className="text-[13px] font-bold text-slate-800 mb-1 leading-tight">แผนที่ 2 : พัฒนาผลการเรียนและพฤติกรรม</h4>
            <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mb-0.5">
              <Calendar className="w-3 h-3" />
              เริ่ม 1 พ.ค. 2567 | สิ้นสุด 30 มิ.ย. 2567 <span className="text-orange-500 font-medium">(เหลือ 24 วัน)</span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-slate-600 mt-0.5">
              <UserCircle className="w-3 h-3" />
              ผู้รับผิดชอบ ครูจันทร์จิรา สุขสวัสดิ์
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-2 self-end absolute top-4 right-4">
          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[9px] font-bold rounded-md w-max">
            กำลังดำเนินการ
          </span>
          <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-[9px] font-bold rounded-md w-max">
            ใกล้ครบกำหนด
          </span>
        </div>

        <div className="flex flex-col mt-2">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-[10px] font-medium text-slate-500">ความก้าวหน้าแผน</span>
            <span className="text-[12px] font-bold text-slate-800">62%</span>
          </div>
          <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
            <div className="h-full bg-[#4f46e5] rounded-full" style={{ width: '62%' }}></div>
          </div>
        </div>

      </div>
    </div>
  )
}
