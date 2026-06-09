import React from "react"
import { FileText, ShieldAlert, HeartPulse, LineChart, Users } from "lucide-react"

export function DesktopPopularReports() {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100 h-full flex flex-col">
      <h3 className="text-[14px] font-bold text-slate-800 mb-4">รายงานยอดนิยม</h3>

      <div className="flex flex-col gap-3 flex-1">
        
        <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-indigo-100 hover:bg-indigo-50/30 transition-colors group">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0 text-indigo-600">
              <FileText className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <h4 className="text-[12px] font-bold text-slate-800">รายงานสรุปภาพรวม</h4>
              <p className="text-[10px] text-slate-500">สรุปข้อมูลนักเรียนทั้งหมด</p>
            </div>
          </div>
          <button className="text-[11px] font-bold text-indigo-600 bg-white border border-indigo-100 px-3 py-1.5 rounded-lg hover:bg-indigo-50 transition-colors">
            ดูรายงาน
          </button>
        </div>

        <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-orange-100 hover:bg-orange-50/30 transition-colors group">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center shrink-0 text-orange-600">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <h4 className="text-[12px] font-bold text-slate-800">รายงานกลุ่มเสี่ยง</h4>
              <p className="text-[10px] text-slate-500">วิเคราะห์นักเรียนกลุ่มเสี่ยง</p>
            </div>
          </div>
          <button className="text-[11px] font-bold text-indigo-600 bg-white border border-indigo-100 px-3 py-1.5 rounded-lg hover:bg-indigo-50 transition-colors">
            ดูรายงาน
          </button>
        </div>

        <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-green-100 hover:bg-green-50/30 transition-colors group">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center shrink-0 text-green-600">
              <HeartPulse className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <h4 className="text-[12px] font-bold text-slate-800">รายงานการดูแลช่วยเหลือ</h4>
              <p className="text-[10px] text-slate-500">ติดตามการช่วยเหลือรายกรณี</p>
            </div>
          </div>
          <button className="text-[11px] font-bold text-indigo-600 bg-white border border-indigo-100 px-3 py-1.5 rounded-lg hover:bg-indigo-50 transition-colors">
            ดูรายงาน
          </button>
        </div>

        <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-blue-100 hover:bg-blue-50/30 transition-colors group">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0 text-blue-600">
              <LineChart className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <h4 className="text-[12px] font-bold text-slate-800">รายงานผลการพัฒนา</h4>
              <p className="text-[10px] text-slate-500">ผลลัพธ์การพัฒนานักเรียน</p>
            </div>
          </div>
          <button className="text-[11px] font-bold text-indigo-600 bg-white border border-indigo-100 px-3 py-1.5 rounded-lg hover:bg-indigo-50 transition-colors">
            ดูรายงาน
          </button>
        </div>

        <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-purple-100 hover:bg-purple-50/30 transition-colors group">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center shrink-0 text-purple-600">
              <Users className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <h4 className="text-[12px] font-bold text-slate-800">รายงานสำหรับผู้บริหาร</h4>
              <p className="text-[10px] text-slate-500">ข้อมูลสรุปสำหรับการตัดสินใจ</p>
            </div>
          </div>
          <button className="text-[11px] font-bold text-indigo-600 bg-white border border-indigo-100 px-3 py-1.5 rounded-lg hover:bg-indigo-50 transition-colors">
            ดูรายงาน
          </button>
        </div>

      </div>

    </div>
  )
}
