import React from "react"

export function ClassSummary() {
  return (
    <div className="bg-white rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] border border-slate-100 p-4 sm:p-6">
      <h3 className="text-xs sm:text-sm font-bold text-slate-800 mb-4">จำนวนนักเรียนตามชั้นเรียน</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-3 sm:gap-4">
        
        <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 sm:p-4 flex flex-col items-center justify-center">
          <span className="text-xs sm:text-sm font-semibold text-slate-700">ป.1</span>
          <span className="text-[10px] sm:text-xs text-slate-500 mt-1">18 คน</span>
        </div>
        
        <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 sm:p-4 flex flex-col items-center justify-center">
          <span className="text-xs sm:text-sm font-semibold text-slate-700">ป.2</span>
          <span className="text-[10px] sm:text-xs text-slate-500 mt-1">17 คน</span>
        </div>
        
        <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 sm:p-4 flex flex-col items-center justify-center">
          <span className="text-xs sm:text-sm font-semibold text-slate-700">ป.3</span>
          <span className="text-[10px] sm:text-xs text-slate-500 mt-1">20 คน</span>
        </div>
        
        <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 sm:p-4 flex flex-col items-center justify-center">
          <span className="text-xs sm:text-sm font-semibold text-slate-700">ป.4</span>
          <span className="text-[10px] sm:text-xs text-slate-500 mt-1">21 คน</span>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 sm:p-4 flex flex-col items-center justify-center relative">
          <div className="absolute inset-0 rounded-xl ring-2 ring-blue-500 opacity-20 pointer-events-none"></div>
          <span className="text-xs sm:text-sm font-bold text-blue-700">ป.5</span>
          <span className="text-[10px] sm:text-xs font-medium text-blue-600 mt-1">26 คน</span>
        </div>
        
        <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 sm:p-4 flex flex-col items-center justify-center">
          <span className="text-xs sm:text-sm font-semibold text-slate-700">ป.6</span>
          <span className="text-[10px] sm:text-xs text-slate-500 mt-1">26 คน</span>
        </div>
        
        <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 sm:p-4 flex flex-col items-center justify-center col-span-2 md:col-span-2 xl:col-span-1">
          <span className="text-xs sm:text-sm font-semibold text-slate-800">รวมทั้งหมด</span>
          <span className="text-[10px] sm:text-xs font-medium text-slate-600 mt-1">128 คน</span>
        </div>

      </div>
    </div>
  )
}
