import React from "react"
import { Users } from "lucide-react"

export function ClassSummary() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-slate-500" />
          <h3 className="text-sm font-semibold text-slate-800">จำนวนนักเรียนตามชั้นเรียน</h3>
        </div>
        <span className="text-xs font-medium text-slate-500 bg-white px-2.5 py-1 rounded-md border border-slate-200">
          ทั้งหมด 128 คน
        </span>
      </div>

      <div className="p-4 sm:p-5">
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">

          <div className="group cursor-pointer rounded-lg border border-slate-200 p-3 flex flex-col hover:border-slate-300 hover:bg-slate-50 transition-colors">
            <span className="text-xs font-medium text-slate-500 mb-1">ป.1</span>
            <span className="text-sm font-semibold text-slate-900">18 <span className="text-xs font-normal text-slate-500">คน</span></span>
          </div>

          <div className="group cursor-pointer rounded-lg border border-slate-200 p-3 flex flex-col hover:border-slate-300 hover:bg-slate-50 transition-colors">
            <span className="text-xs font-medium text-slate-500 mb-1">ป.2</span>
            <span className="text-sm font-semibold text-slate-900">17 <span className="text-xs font-normal text-slate-500">คน</span></span>
          </div>

          <div className="group cursor-pointer rounded-lg border border-slate-200 p-3 flex flex-col hover:border-slate-300 hover:bg-slate-50 transition-colors">
            <span className="text-xs font-medium text-slate-500 mb-1">ป.3</span>
            <span className="text-sm font-semibold text-slate-900">20 <span className="text-xs font-normal text-slate-500">คน</span></span>
          </div>

          <div className="group cursor-pointer rounded-lg border border-slate-200 p-3 flex flex-col hover:border-slate-300 hover:bg-slate-50 transition-colors">
            <span className="text-xs font-medium text-slate-500 mb-1">ป.4</span>
            <span className="text-sm font-semibold text-slate-900">21 <span className="text-xs font-normal text-slate-500">คน</span></span>
          </div>

          {/* Active State */}
          <div className="cursor-pointer rounded-lg border border-blue-600 bg-blue-50 p-3 flex flex-col ring-1 ring-blue-600">
            <span className="text-xs font-semibold text-blue-700 mb-1">ป.5</span>
            <span className="text-sm font-bold text-blue-900">26 <span className="text-xs font-medium text-blue-700">คน</span></span>
          </div>

          <div className="group cursor-pointer rounded-lg border border-slate-200 p-3 flex flex-col hover:border-slate-300 hover:bg-slate-50 transition-colors">
            <span className="text-xs font-medium text-slate-500 mb-1">ป.6</span>
            <span className="text-sm font-semibold text-slate-900">26 <span className="text-xs font-normal text-slate-500">คน</span></span>
          </div>

        </div>
      </div>
    </div>
  )
}
