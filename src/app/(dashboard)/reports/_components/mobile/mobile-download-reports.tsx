import React from "react"
import { ChevronRight, Download } from "lucide-react"

export function MobileDownloadReports() {
  return (
    <div className="px-4 mb-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[13px] font-bold text-slate-800">ดาวน์โหลดรายงาน</h3>
        <button className="flex items-center gap-0.5 text-[11px] font-bold text-indigo-600">
          ดูทั้งหมด
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex flex-col gap-3">
        
        {/* PDF 1 */}
        <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-sm flex items-center justify-between group">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-red-50 flex flex-col items-center justify-center shrink-0 border border-red-100">
              <span className="text-[8px] font-bold text-red-600 uppercase">PDF</span>
            </div>
            <div className="flex flex-col min-w-0 pr-4">
              <h4 className="text-[12px] font-bold text-slate-800 truncate">รายงานสรุปภาพรวมนักเรียน ภาคเรียนที่ 1/2567</h4>
              <span className="text-[10px] text-slate-500">PDF • 1.2 MB</span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1 shrink-0">
            <span className="text-[10px] text-slate-400">1 พ.ค. 2567</span>
            <button className="text-indigo-600 hover:text-indigo-800 p-1">
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* PDF 2 */}
        <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-sm flex items-center justify-between group">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-red-50 flex flex-col items-center justify-center shrink-0 border border-red-100">
              <span className="text-[8px] font-bold text-red-600 uppercase">PDF</span>
            </div>
            <div className="flex flex-col min-w-0 pr-4">
              <h4 className="text-[12px] font-bold text-slate-800 truncate">รายงานผลการเรียน ภาคเรียนที่ 1/2567</h4>
              <span className="text-[10px] text-slate-500">PDF • 850 KB</span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1 shrink-0">
            <span className="text-[10px] text-slate-400">1 พ.ค. 2567</span>
            <button className="text-indigo-600 hover:text-indigo-800 p-1">
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* PDF 3 */}
        <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-sm flex items-center justify-between group">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-red-50 flex flex-col items-center justify-center shrink-0 border border-red-100">
              <span className="text-[8px] font-bold text-red-600 uppercase">PDF</span>
            </div>
            <div className="flex flex-col min-w-0 pr-4">
              <h4 className="text-[12px] font-bold text-slate-800 truncate">รายงานการมาเรียน ภาคเรียนที่ 1/2567</h4>
              <span className="text-[10px] text-slate-500">PDF • 620 KB</span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1 shrink-0">
            <span className="text-[10px] text-slate-400">1 พ.ค. 2567</span>
            <button className="text-indigo-600 hover:text-indigo-800 p-1">
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
