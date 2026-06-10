import React from "react"
import { Users, ShieldAlert, HeartPulse, CheckCircle2, ArrowDown, ArrowUp, Download } from "lucide-react"

export function DesktopOverviewStats() {
  return (
    <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm mb-6 relative">
      
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-[14px] font-bold text-slate-800">ภาพรวมข้อมูลนักเรียน</h3>
        <button className="flex items-center gap-1.5 text-[11px] font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100 hover:bg-indigo-100 transition-colors">
          <Download className="w-3.5 h-3.5" />
          ส่งออกรายงาน
          <svg className="w-3 h-3 ml-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        
        {/* Total Students */}
        <div className="bg-slate-50/50 rounded-xl p-4 border border-slate-100 relative overflow-hidden flex flex-col justify-between group">
          <div className="flex items-start justify-between mb-4">
            <div className="flex flex-col">
              <h4 className="text-[13px] font-bold text-slate-800 mb-1">จำนวนนักเรียนทั้งหมด</h4>
              <div className="flex items-baseline gap-1.5">
                <span className="text-[24px] font-bold text-slate-800">642</span>
                <span className="text-[12px] font-bold text-slate-500">คน</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5 text-indigo-600" />
            </div>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-auto">
            <span className="flex items-center gap-1">
              ชาย <span className="font-bold text-slate-700">316</span> คน
            </span>
            <div className="w-px h-3 bg-slate-300"></div>
            <span className="flex items-center gap-1">
              หญิง <span className="font-bold text-slate-700">326</span> คน
            </span>
          </div>
        </div>

        {/* Risk Group */}
        <div className="bg-white rounded-xl p-4 border border-green-100 relative overflow-hidden flex flex-col justify-between group shadow-sm">
          <div className="flex items-start justify-between mb-2">
            <div className="flex flex-col">
              <h4 className="text-[13px] font-bold text-slate-800 mb-1">กลุ่มเสี่ยง</h4>
              <div className="flex items-baseline gap-1.5">
                <span className="text-[24px] font-bold text-slate-800">38</span>
                <span className="text-[12px] font-bold text-slate-500">คน</span>
              </div>
              <span className="text-[10px] text-slate-500">5.92% จากทั้งหมด</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center shrink-0 border border-green-100">
              <ShieldAlert className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-green-600 font-bold mb-2">
            <ArrowDown className="w-3 h-3" />
            ลดลง 1.2% <span className="text-slate-400 font-normal">จากภาคเรียนก่อน</span>
          </div>
          <div className="h-6 mt-auto relative">
            <svg viewBox="0 0 100 20" preserveAspectRatio="none" className="w-full h-full">
              <path d="M 0,15 L 20,10 L 40,12 L 60,8 L 80,15 L 100,5" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="100" cy="5" r="2" fill="#22c55e" />
            </svg>
          </div>
        </div>

        {/* Under Care */}
        <div className="bg-white rounded-xl p-4 border border-yellow-100 relative overflow-hidden flex flex-col justify-between group shadow-sm">
          <div className="flex items-start justify-between mb-2">
            <div className="flex flex-col">
              <h4 className="text-[13px] font-bold text-slate-800 mb-1">อยู่ระหว่างการดูแล</h4>
              <div className="flex items-baseline gap-1.5">
                <span className="text-[24px] font-bold text-slate-800">112</span>
                <span className="text-[12px] font-bold text-slate-500">คน</span>
              </div>
              <span className="text-[10px] text-slate-500">17.45% จากทั้งหมด</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-yellow-50 flex items-center justify-center shrink-0 border border-yellow-100">
              <HeartPulse className="w-5 h-5 text-yellow-600" />
            </div>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-yellow-600 font-bold mb-2">
            <ArrowUp className="w-3 h-3" />
            เพิ่มขึ้น 2.7% <span className="text-slate-400 font-normal">จากภาคเรียนก่อน</span>
          </div>
          <div className="h-6 mt-auto relative">
            <svg viewBox="0 0 100 20" preserveAspectRatio="none" className="w-full h-full">
              <path d="M 0,15 L 20,18 L 40,10 L 60,12 L 80,5 L 100,8" fill="none" stroke="#eab308" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="100" cy="8" r="2" fill="#eab308" />
            </svg>
          </div>
        </div>

        {/* Successfully Helped */}
        <div className="bg-white rounded-xl p-4 border border-blue-100 relative overflow-hidden flex flex-col justify-between group shadow-sm">
          <div className="flex items-start justify-between mb-2">
            <div className="flex flex-col">
              <h4 className="text-[13px] font-bold text-slate-800 mb-1">ได้รับการช่วยเหลือสำเร็จ</h4>
              <div className="flex items-baseline gap-1.5">
                <span className="text-[24px] font-bold text-slate-800">184</span>
                <span className="text-[12px] font-bold text-slate-500">คน</span>
              </div>
              <span className="text-[10px] text-slate-500">28.66% จากกลุ่มเสี่ยง</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0 border border-blue-100">
              <CheckCircle2 className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-blue-600 font-bold mb-2">
            <ArrowUp className="w-3 h-3" />
            เพิ่มขึ้น 8.3% <span className="text-slate-400 font-normal">จากภาคเรียนก่อน</span>
          </div>
          <div className="h-6 mt-auto relative">
            <svg viewBox="0 0 100 20" preserveAspectRatio="none" className="w-full h-full">
              <path d="M 0,18 L 20,15 L 40,12 L 60,10 L 80,8 L 100,4" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="100" cy="4" r="2" fill="#3b82f6" />
            </svg>
          </div>
        </div>

      </div>

    </div>
  )
}
