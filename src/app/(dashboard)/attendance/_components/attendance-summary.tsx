import React from "react"
import { UserCheck, XCircle, ClipboardList, Clock } from "lucide-react"

export function AttendanceSummary() {
  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
      
      {/* มาเรียน */}
      <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-sm flex items-center gap-4 relative overflow-hidden group">
        <div className="absolute inset-y-0 left-0 w-1 bg-emerald-500 rounded-l-2xl"></div>
        <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0">
          <UserCheck className="w-6 h-6" />
        </div>
        <div>
          <div className="text-sm font-medium text-slate-500 mb-1">มาเรียน</div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-slate-800">118</span>
            <span className="text-sm font-medium text-slate-600">คน</span>
          </div>
          <div className="text-[11px] sm:text-xs text-slate-400 mt-0.5">92.2% ของนักเรียนทั้งหมด</div>
        </div>
      </div>

      {/* ขาดเรียน */}
      <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-sm flex items-center gap-4 relative overflow-hidden group">
        <div className="absolute inset-y-0 left-0 w-1 bg-red-500 rounded-l-2xl"></div>
        <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center shrink-0">
          <XCircle className="w-6 h-6" />
        </div>
        <div>
          <div className="text-sm font-medium text-slate-500 mb-1">ขาดเรียน</div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-slate-800">8</span>
            <span className="text-sm font-medium text-slate-600">คน</span>
          </div>
          <div className="text-[11px] sm:text-xs text-slate-400 mt-0.5">6.3% ของนักเรียนทั้งหมด</div>
        </div>
      </div>

      {/* ลา */}
      <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-sm flex items-center gap-4 relative overflow-hidden group">
        <div className="absolute inset-y-0 left-0 w-1 bg-amber-500 rounded-l-2xl"></div>
        <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
          <ClipboardList className="w-6 h-6" />
        </div>
        <div>
          <div className="text-sm font-medium text-slate-500 mb-1">ลา</div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-slate-800">2</span>
            <span className="text-sm font-medium text-slate-600">คน</span>
          </div>
          <div className="text-[11px] sm:text-xs text-slate-400 mt-0.5">1.5% ของนักเรียนทั้งหมด</div>
        </div>
      </div>

      {/* มาสาย */}
      <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-sm flex items-center gap-4 relative overflow-hidden group">
        <div className="absolute inset-y-0 left-0 w-1 bg-blue-500 rounded-l-2xl"></div>
        <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
          <Clock className="w-6 h-6" />
        </div>
        <div>
          <div className="text-sm font-medium text-slate-500 mb-1">มาสาย</div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-slate-800">6</span>
            <span className="text-sm font-medium text-slate-600">คน</span>
          </div>
          <div className="text-[11px] sm:text-xs text-slate-400 mt-0.5">4.7% ของนักเรียนทั้งหมด</div>
        </div>
      </div>

    </div>
  )
}
