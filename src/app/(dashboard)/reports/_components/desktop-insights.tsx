import React from "react"
import { Lightbulb, TrendingUp, TrendingDown } from "lucide-react"

export function DesktopInsights() {
  return (
    <div className="bg-gradient-to-br from-indigo-50 to-slate-50 rounded-2xl p-5 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-indigo-100 h-full flex flex-col">
      <h3 className="text-[14px] font-bold text-slate-800 mb-4 flex items-center gap-2">
        ข้อมูลเชิงลึก (Insight)
      </h3>

      <div className="flex flex-col gap-3 flex-1">
        
        <div className="bg-white rounded-xl p-3 border border-slate-100 flex items-start gap-3 shadow-sm">
          <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center shrink-0 mt-0.5">
            <Lightbulb className="w-4 h-4 text-red-500" />
          </div>
          <div className="flex flex-col flex-1">
            <h4 className="text-[12px] font-bold text-slate-800">กลุ่มเสี่ยงด้านพฤติกรรม</h4>
            <div className="text-[10px] text-slate-500 mb-1">เพิ่มขึ้น 1.8% จากภาคเรียนก่อน</div>
            <p className="text-[10px] text-slate-600 bg-slate-50 px-2 py-1 rounded">ควรให้ความสำคัญในการติดตามพฤติกรรมเป็นพิเศษ</p>
          </div>
          <TrendingUp className="w-4 h-4 text-red-500 shrink-0" />
        </div>

        <div className="bg-white rounded-xl p-3 border border-slate-100 flex items-start gap-3 shadow-sm">
          <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center shrink-0 mt-0.5">
            <Lightbulb className="w-4 h-4 text-green-500" />
          </div>
          <div className="flex flex-col flex-1">
            <h4 className="text-[12px] font-bold text-slate-800">ผลการเรียนเฉลี่ย</h4>
            <div className="text-[10px] text-slate-500 mb-1">นักเรียนมีผลการเรียนเฉลี่ยดีขึ้น 0.35 คะแนน จากภาคเรียนก่อน</div>
          </div>
          <TrendingUp className="w-4 h-4 text-green-500 shrink-0" />
        </div>

        <div className="bg-white rounded-xl p-3 border border-slate-100 flex items-start gap-3 shadow-sm">
          <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center shrink-0 mt-0.5">
            <Lightbulb className="w-4 h-4 text-blue-500" />
          </div>
          <div className="flex flex-col flex-1">
            <h4 className="text-[12px] font-bold text-slate-800">การช่วยเหลือสำเร็จ</h4>
            <div className="text-[10px] text-slate-500 mb-1">อัตราการช่วยเหลือสำเร็จเพิ่มขึ้น 8.3% จากภาคเรียนก่อน</div>
          </div>
          <TrendingUp className="w-4 h-4 text-blue-500 shrink-0" />
        </div>

      </div>

      <button className="w-full mt-4 py-2 bg-white border border-indigo-100 text-indigo-600 font-bold text-[11px] rounded-xl hover:bg-indigo-50 transition-colors shadow-sm">
        ดูข้อมูลเชิงลึกทั้งหมด
      </button>

    </div>
  )
}
