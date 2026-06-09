import React from "react"
import { Calendar as CalendarIcon, Edit3, ChevronRight, Calculator, Users, BookOpen } from "lucide-react"

export function IdpGoals() {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[15px] font-bold text-slate-800">เป้าหมายการพัฒนา</h3>
        <button className="flex items-center gap-1.5 text-[11px] font-bold text-indigo-600 hover:text-indigo-700">
          แก้ไขเป้าหมาย
          <Edit3 className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        
        {/* Goal 1 */}
        <div className="bg-white rounded-2xl p-4 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100 relative overflow-hidden group">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
              <CalendarIcon className="w-4 h-4 text-blue-500" />
            </div>
            <h4 className="text-[13px] font-bold text-slate-800">การมาเรียน</h4>
          </div>

          <div className="flex items-end justify-between">
            <div className="flex flex-col gap-2">
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-500 font-medium">เป้าหมาย</span>
                <span className="text-[11px] font-bold text-slate-700">มาเรียน ≥ 95%</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-500 font-medium">ปัจจุบัน</span>
                <span className="text-[11px] font-bold text-slate-700">88.5%</span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] text-slate-500 font-medium">ความสำคัญ</span>
                <span className="text-[9px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">สูง</span>
              </div>
            </div>

            {/* Circular Progress */}
            <div className="flex flex-col items-center">
              <div className="relative w-14 h-14 mb-1">
                <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                  <circle cx="18" cy="18" r="15.915" fill="none" stroke="#f1f5f9" strokeWidth="4" />
                  <circle cx="18" cy="18" r="15.915" fill="none" stroke="#3b82f6" strokeWidth="4" strokeDasharray="93 100" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-[12px] font-bold text-slate-800 leading-none">93%</span>
                </div>
              </div>
              <span className="text-[9px] font-bold text-blue-600">ใกล้ถึงเป้าหมาย</span>
            </div>
          </div>
        </div>

        {/* Goal 2 */}
        <div className="bg-white rounded-2xl p-4 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100 relative overflow-hidden group">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
              <Calculator className="w-4 h-4 text-emerald-500" />
            </div>
            <h4 className="text-[13px] font-bold text-slate-800">ผลการเรียนคณิตศาสตร์</h4>
          </div>

          <div className="flex items-end justify-between">
            <div className="flex flex-col gap-2">
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-500 font-medium">เป้าหมาย</span>
                <span className="text-[11px] font-bold text-slate-700">คะแนน ≥ 70 คะแนน</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-500 font-medium">ปัจจุบัน</span>
                <span className="text-[11px] font-bold text-slate-700">58.0 คะแนน</span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] text-slate-500 font-medium">ความสำคัญ</span>
                <span className="text-[9px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">สูง</span>
              </div>
            </div>

            {/* Circular Progress */}
            <div className="flex flex-col items-center">
              <div className="relative w-14 h-14 mb-1">
                <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                  <circle cx="18" cy="18" r="15.915" fill="none" stroke="#f1f5f9" strokeWidth="4" />
                  <circle cx="18" cy="18" r="15.915" fill="none" stroke="#10b981" strokeWidth="4" strokeDasharray="58 100" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-[12px] font-bold text-slate-800 leading-none">58%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Goal 3 */}
        <div className="bg-white rounded-2xl p-4 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100 relative overflow-hidden group">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center shrink-0">
              <Users className="w-4 h-4 text-orange-500" />
            </div>
            <h4 className="text-[13px] font-bold text-slate-800">พฤติกรรมในชั้นเรียน</h4>
          </div>

          <div className="flex items-end justify-between">
            <div className="flex flex-col gap-2">
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-500 font-medium">เป้าหมาย</span>
                <span className="text-[11px] font-bold text-slate-700">ระดับพฤติกรรม ดี</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-500 font-medium">ปัจจุบัน</span>
                <span className="text-[11px] font-bold text-orange-600">ปานกลาง</span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] text-slate-500 font-medium">ความสำคัญ</span>
                <span className="text-[9px] font-bold text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded">ปานกลาง</span>
              </div>
            </div>

            {/* Circular Progress */}
            <div className="flex flex-col items-center">
              <div className="relative w-14 h-14 mb-1">
                <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                  <circle cx="18" cy="18" r="15.915" fill="none" stroke="#f1f5f9" strokeWidth="4" />
                  <circle cx="18" cy="18" r="15.915" fill="none" stroke="#f97316" strokeWidth="4" strokeDasharray="60 100" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-[12px] font-bold text-slate-800 leading-none">60%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Goal 4 */}
        <div className="bg-white rounded-2xl p-4 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100 relative overflow-hidden group">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
              <BookOpen className="w-4 h-4 text-indigo-500" />
            </div>
            <h4 className="text-[13px] font-bold text-slate-800">ทักษะการอ่าน</h4>
          </div>

          <div className="flex items-end justify-between">
            <div className="flex flex-col gap-2">
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-500 font-medium">เป้าหมาย</span>
                <span className="text-[11px] font-bold text-slate-700">ระดับดีขึ้น</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-500 font-medium">ปัจจุบัน</span>
                <span className="text-[11px] font-bold text-blue-600">ปานกลาง</span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] text-slate-500 font-medium">ความสำคัญ</span>
                <span className="text-[9px] font-bold text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded">ปานกลาง</span>
              </div>
            </div>

            {/* Circular Progress */}
            <div className="flex flex-col items-center">
              <div className="relative w-14 h-14 mb-1">
                <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                  <circle cx="18" cy="18" r="15.915" fill="none" stroke="#f1f5f9" strokeWidth="4" />
                  <circle cx="18" cy="18" r="15.915" fill="none" stroke="#6366f1" strokeWidth="4" strokeDasharray="50 100" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-[12px] font-bold text-slate-800 leading-none">50%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
