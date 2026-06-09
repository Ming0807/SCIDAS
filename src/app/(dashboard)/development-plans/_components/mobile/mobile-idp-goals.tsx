import React from "react"
import { ChevronRight, Calendar as CalendarIcon, Calculator, Users, BookOpen } from "lucide-react"

export function MobileIdpGoals() {
  return (
    <div className="px-4 mb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[13px] font-bold text-slate-800">เป้าหมายการพัฒนา</h3>
        <button className="flex items-center gap-0.5 text-[11px] font-bold text-blue-600">
          ดูทั้งหมด
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex overflow-x-auto gap-3 pb-4 no-scrollbar -mx-4 px-4">
        
        {/* Goal 1 */}
        <div className="bg-white rounded-2xl p-3.5 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100 shrink-0 w-[140px] flex flex-col items-center text-center">
          <div className="flex items-center gap-1.5 w-full bg-emerald-50 text-emerald-600 px-2 py-1 rounded-md mb-3 justify-center">
            <CalendarIcon className="w-3 h-3" />
            <span className="text-[10px] font-bold">การมาเรียน</span>
          </div>
          
          <div className="relative w-[70px] h-[70px] mb-2 mt-1">
            <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
              <circle cx="18" cy="18" r="15.915" fill="none" stroke="#f1f5f9" strokeWidth="4" />
              <circle cx="18" cy="18" r="15.915" fill="none" stroke="#10b981" strokeWidth="4" strokeDasharray="93 100" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-[16px] font-bold text-slate-800 leading-none">93%</span>
            </div>
          </div>
          
          <div className="text-[10px] text-emerald-600 font-medium">เป้าหมาย 95%</div>
        </div>

        {/* Goal 2 */}
        <div className="bg-white rounded-2xl p-3.5 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100 shrink-0 w-[140px] flex flex-col items-center text-center">
          <div className="flex items-center gap-1.5 w-full bg-blue-50 text-blue-600 px-2 py-1 rounded-md mb-3 justify-center">
            <Calculator className="w-3 h-3" />
            <span className="text-[10px] font-bold">คณิตศาสตร์</span>
          </div>
          
          <div className="relative w-[70px] h-[70px] mb-2 mt-1">
            <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
              <circle cx="18" cy="18" r="15.915" fill="none" stroke="#f1f5f9" strokeWidth="4" />
              <circle cx="18" cy="18" r="15.915" fill="none" stroke="#3b82f6" strokeWidth="4" strokeDasharray="58 100" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-[16px] font-bold text-slate-800 leading-none">58%</span>
            </div>
          </div>
          
          <div className="text-[10px] text-blue-600 font-medium">เป้าหมาย 85%</div>
        </div>

        {/* Goal 3 */}
        <div className="bg-white rounded-2xl p-3.5 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100 shrink-0 w-[140px] flex flex-col items-center text-center">
          <div className="flex items-center gap-1.5 w-full bg-orange-50 text-orange-600 px-2 py-1 rounded-md mb-3 justify-center">
            <Users className="w-3 h-3" />
            <span className="text-[10px] font-bold truncate">พฤติกรรมในชั้นเรียน</span>
          </div>
          
          <div className="relative w-[70px] h-[70px] mb-2 mt-1">
            <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
              <circle cx="18" cy="18" r="15.915" fill="none" stroke="#f1f5f9" strokeWidth="4" />
              <circle cx="18" cy="18" r="15.915" fill="none" stroke="#f97316" strokeWidth="4" strokeDasharray="60 100" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-[16px] font-bold text-slate-800 leading-none">60%</span>
            </div>
          </div>
          
          <div className="text-[10px] text-orange-600 font-medium">เป้าหมาย 80%</div>
        </div>

        {/* Goal 4 */}
        <div className="bg-white rounded-2xl p-3.5 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100 shrink-0 w-[140px] flex flex-col items-center text-center">
          <div className="flex items-center gap-1.5 w-full bg-indigo-50 text-indigo-600 px-2 py-1 rounded-md mb-3 justify-center">
            <BookOpen className="w-3 h-3" />
            <span className="text-[10px] font-bold">ทักษะการอ่าน</span>
          </div>
          
          <div className="relative w-[70px] h-[70px] mb-2 mt-1">
            <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
              <circle cx="18" cy="18" r="15.915" fill="none" stroke="#f1f5f9" strokeWidth="4" />
              <circle cx="18" cy="18" r="15.915" fill="none" stroke="#6366f1" strokeWidth="4" strokeDasharray="72 100" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-[16px] font-bold text-slate-800 leading-none">72%</span>
            </div>
          </div>
          
          <div className="text-[10px] text-indigo-600 font-medium">เป้าหมาย 90%</div>
        </div>

      </div>
    </div>
  )
}
