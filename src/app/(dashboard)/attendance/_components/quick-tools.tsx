import React from "react"
import { Phone, Bell, Printer, FileText } from "lucide-react"

export function QuickTools() {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] border border-slate-100">
      <h3 className="font-bold text-slate-800 text-sm mb-4">เครื่องมือและทางลัด</h3>
      
      <div className="grid grid-cols-4 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        
        <button className="flex flex-col items-center justify-center gap-2 p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all group text-center">
          <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">
            <Phone className="w-5 h-5" />
          </div>
          <span className="text-[10px] sm:text-xs font-medium text-slate-600 group-hover:text-slate-900 leading-tight">ติดต่อผู้ปกครอง</span>
        </button>

        <button className="flex flex-col items-center justify-center gap-2 p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all group text-center">
          <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform">
            <Bell className="w-5 h-5" />
          </div>
          <span className="text-[10px] sm:text-xs font-medium text-slate-600 group-hover:text-slate-900 leading-tight">แจ้งเตือนผู้ปกครอง</span>
        </button>

        <button className="flex flex-col items-center justify-center gap-2 p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all group text-center">
          <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
            <Printer className="w-5 h-5" />
          </div>
          <span className="text-[10px] sm:text-xs font-medium text-slate-600 group-hover:text-slate-900 leading-tight">พิมพ์ใบเช็คชื่อ</span>
        </button>

        <button className="flex flex-col items-center justify-center gap-2 p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all group text-center">
          <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-500 group-hover:scale-110 transition-transform">
            <FileText className="w-5 h-5" />
          </div>
          <span className="text-[10px] sm:text-xs font-medium text-slate-600 group-hover:text-slate-900 leading-tight">รายงานมาเรียน</span>
        </button>

      </div>
    </div>
  )
}
