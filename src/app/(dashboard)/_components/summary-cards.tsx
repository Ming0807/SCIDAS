import React from "react"
import { Users, AlertTriangle, ClipboardCheck } from "lucide-react"

export function SummaryCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Card 1: นักเรียนทั้งหมด */}
      <div className="rounded-2xl bg-white shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] border border-slate-100 p-6 flex items-center gap-5">
        <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
          <Users className="h-7 w-7 text-blue-500" />
        </div>
        <div className="flex flex-col">
          <span className="text-[13px] font-semibold text-slate-600 mb-1">นักเรียนทั้งหมด</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-bold text-slate-800">128</span>
            <span className="text-sm font-medium text-slate-800">คน</span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1">ชาย 65 คน • หญิง 63 คน</span>
        </div>
      </div>

      {/* Card 2: กลุ่มเฝ้าระวัง */}
      <div className="rounded-2xl bg-white shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] border border-slate-100 p-6 flex items-center gap-5">
        <div className="w-14 h-14 rounded-full bg-amber-50 flex items-center justify-center shrink-0">
          <Users className="h-7 w-7 text-amber-500" />
        </div>
        <div className="flex flex-col">
          <span className="text-[13px] font-semibold text-slate-600 mb-1">กลุ่มเฝ้าระวัง</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-bold text-slate-800">18</span>
            <span className="text-sm font-medium text-slate-800">คน</span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1">14.1% ของนักเรียนทั้งหมด</span>
        </div>
      </div>

      {/* Card 3: เสี่ยงสูง */}
      <div className="rounded-2xl bg-white shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] border border-slate-100 p-6 flex items-center gap-5">
        <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center shrink-0">
          <AlertTriangle className="h-7 w-7 text-red-500" />
        </div>
        <div className="flex flex-col">
          <span className="text-[13px] font-semibold text-slate-600 mb-1">เสี่ยงสูง</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-bold text-slate-800">7</span>
            <span className="text-sm font-medium text-slate-800">คน</span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1">5.5% ของนักเรียนทั้งหมด</span>
        </div>
      </div>

      {/* Card 4: แผนพัฒนา */}
      <div className="rounded-2xl bg-white shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] border border-slate-100 p-6 flex items-center gap-5">
        <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
          <ClipboardCheck className="h-7 w-7 text-emerald-500" />
        </div>
        <div className="flex flex-col">
          <span className="text-[13px] font-semibold text-slate-600 mb-1">แผนพัฒนาที่กำลังติดตาม</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-bold text-slate-800">23</span>
            <span className="text-sm font-medium text-slate-800">คน</span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1">17.9% ของนักเรียนทั้งหมด</span>
        </div>
      </div>
    </div>
  )
}
