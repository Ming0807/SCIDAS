import React from "react"
import { ChevronRight, AlertTriangle, BookOpen, UserCircle } from "lucide-react"

export function MobileSupportIssues() {
  return (
    <div className="px-4 mb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-slate-800">ปัญหาที่พบ</h3>
        <button className="flex items-center gap-0.5 text-xs font-semibold text-blue-600">
          ดูทั้งหมด
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex flex-col gap-2.5">
        
        {/* Issue 1 */}
        <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-sm flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-full bg-rose-50 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-4 h-4 text-rose-500 fill-rose-100" />
            </div>
            <div className="flex flex-col min-w-0">
              <div className="text-xs font-semibold text-slate-700 truncate mb-0.5">พฤติกรรมไม่เหมาะสมในห้องเรียน</div>
              <div className="text-xs text-slate-500">พบเมื่อ 25 เม.ย. 2567</div>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded">เสี่ยงสูง</span>
            <ChevronRight className="w-4 h-4 text-slate-300" />
          </div>
        </div>

        {/* Issue 2 */}
        <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-sm flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
              <BookOpen className="w-4 h-4 text-blue-500 fill-blue-100" />
            </div>
            <div className="flex flex-col min-w-0">
              <div className="text-xs font-semibold text-slate-700 truncate mb-0.5">ผลการเรียนต่ำกว่าเกณฑ์</div>
              <div className="text-xs text-slate-500">พบเมื่อ 20 เม.ย. 2567</div>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded">เสี่ยงปานกลาง</span>
            <ChevronRight className="w-4 h-4 text-slate-300" />
          </div>
        </div>

        {/* Issue 3 */}
        <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-sm flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
              <UserCircle className="w-4 h-4 text-emerald-500 fill-emerald-100" />
            </div>
            <div className="flex flex-col min-w-0">
              <div className="text-xs font-semibold text-slate-700 truncate mb-0.5">ขาดความมั่นใจในการแสดงออก</div>
              <div className="text-xs text-slate-500">พบเมื่อ 18 เม.ย. 2567</div>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">เฝ้าระวัง</span>
            <ChevronRight className="w-4 h-4 text-slate-300" />
          </div>
        </div>

      </div>
    </div>
  )
}
