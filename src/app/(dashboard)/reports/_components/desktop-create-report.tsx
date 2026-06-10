import React from "react"
import { FileText, ClipboardList, PenTool, UploadCloud } from "lucide-react"

export function DesktopCreateReport() {
  return (
    <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm mb-6">
      <h3 className="text-[14px] font-bold text-slate-800 mb-4">สร้างรายงานใหม่</h3>

      <div className="grid grid-cols-4 gap-3">
        <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-100 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-indigo-50 hover:border-indigo-100 group transition-colors">
          <div className="w-10 h-10 rounded-full bg-white border border-slate-100 flex items-center justify-center mb-2 group-hover:border-indigo-200">
            <FileText className="w-4 h-4 text-slate-600 group-hover:text-indigo-600" />
          </div>
          <span className="text-[11px] font-bold text-slate-700 group-hover:text-indigo-700">รายงานทั่วไป</span>
        </div>

        <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-100 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-indigo-50 hover:border-indigo-100 group transition-colors">
          <div className="w-10 h-10 rounded-full bg-white border border-slate-100 flex items-center justify-center mb-2 group-hover:border-indigo-200">
            <ClipboardList className="w-4 h-4 text-slate-600 group-hover:text-indigo-600" />
          </div>
          <span className="text-[11px] font-bold text-slate-700 group-hover:text-indigo-700">รายงานเฉพาะกิจ</span>
        </div>

        <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-100 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-indigo-50 hover:border-indigo-100 group transition-colors">
          <div className="w-10 h-10 rounded-full bg-white border border-slate-100 flex items-center justify-center mb-2 group-hover:border-indigo-200">
            <PenTool className="w-4 h-4 text-slate-600 group-hover:text-indigo-600" />
          </div>
          <span className="text-[11px] font-bold text-slate-700 group-hover:text-indigo-700">ออกแบบรายงาน</span>
        </div>

        <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-100 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-green-50 hover:border-green-100 group transition-colors">
          <div className="w-10 h-10 rounded-full bg-white border border-slate-100 flex items-center justify-center mb-2 group-hover:border-green-200">
            <UploadCloud className="w-4 h-4 text-slate-600 group-hover:text-green-600" />
          </div>
          <span className="text-[11px] font-bold text-slate-700 group-hover:text-green-700">นำเข้าข้อมูล</span>
        </div>
      </div>
    </div>
  )
}
