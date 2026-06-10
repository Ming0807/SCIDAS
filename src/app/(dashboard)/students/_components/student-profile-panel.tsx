import React from "react"
import { BadgeCheck, Edit2, Clock, ShieldAlert, Printer, ChevronRight, FileText, Plus, MoreVertical, Download } from "lucide-react"

export function StudentProfilePanel() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-full overflow-hidden mt-6 xl:mt-0">

      {/* Action Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 bg-slate-50/50">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">โปรไฟล์นักเรียน</span>
        <div className="flex items-center gap-2">
          <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-white rounded-md transition-colors border border-transparent hover:border-slate-200">
            <Edit2 className="w-4 h-4" />
          </button>
          <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-white rounded-md transition-colors border border-transparent hover:border-slate-200">
            <Printer className="w-4 h-4" />
          </button>
          <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-white rounded-md transition-colors border border-transparent hover:border-slate-200">
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="p-5 flex-1 overflow-y-auto">

        {/* Profile Identity */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 pb-6 border-b border-slate-100">
          <div className="relative shrink-0">
            <img src="https://api.dicebear.com/7.x/notionists/svg?seed=boy1" className="w-20 h-20 rounded-full bg-slate-100 object-cover border border-slate-200" alt="เด็กชายกฤษฎา ใจดี"/>
            <span className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full ring-1 ring-slate-100"></span>
          </div>

          <div className="flex flex-col items-center sm:items-start text-center sm:text-left flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-lg font-bold text-slate-900 truncate">เด็กชายกฤษฎา ใจดี</h2>
              <BadgeCheck className="w-4 h-4 text-blue-500 shrink-0" />
            </div>
            <p className="text-sm text-slate-600 mb-3">รหัส 12345 • ป.5/1 • เลขที่ 8</p>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">ปกติ</span>
              <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">นักเรียนทุน</span>
              <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">รักการเรียน</span>
            </div>
          </div>
        </div>

        {/* Primary Actions */}
        <div className="grid grid-cols-2 gap-2 sm:gap-3 py-5 border-b border-slate-100">
          <button className="flex justify-center items-center gap-1.5 sm:gap-2 bg-slate-900 hover:bg-slate-800 text-white px-2 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap">
            <ShieldAlert className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" /> สร้างเคสดูแล
          </button>
          <button className="flex justify-center items-center gap-1.5 sm:gap-2 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 px-2 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-colors shadow-sm whitespace-nowrap">
            <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 shrink-0" /> ดูประวัติ
          </button>
        </div>

        {/* Info List */}
        <div className="py-6 border-b border-slate-100">
          <h3 className="text-sm font-semibold text-slate-800 mb-4">ข้อมูลเบื้องต้น</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-start gap-4">
              <span className="text-slate-500 shrink-0">วันเกิด</span>
              <span className="text-slate-900 font-medium text-right">15 มกราคม 2556 (12 ปี)</span>
            </div>
            <div className="flex justify-between items-start gap-4">
              <span className="text-slate-500 shrink-0">ผู้ปกครอง</span>
              <div className="text-right">
                <span className="text-slate-900 font-medium block">นางสาวอรพิน ใจดี (มารดา)</span>
                <span className="text-slate-500 text-xs">089-123-4567</span>
              </div>
            </div>
            <div className="flex justify-between items-start gap-4">
              <span className="text-slate-500 shrink-0">ที่อยู่</span>
              <span className="text-slate-900 font-medium text-right leading-relaxed">
                123 หมู่ 4 ต.แม่จัน อ.แม่จัน<br/>จ.เชียงราย 57110
              </span>
            </div>
          </div>
        </div>

        {/* Dashboard Widgets */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2 gap-4 py-6 border-b border-slate-100">

          {/* การมาเรียน */}
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-xs font-semibold text-slate-800">การมาเรียน</h4>
              <span className="text-[10px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">93%</span>
            </div>
            <div className="flex justify-between text-xs mb-3">
              <div className="flex flex-col"><span className="text-slate-500 mb-1">มา</span><span className="font-semibold text-slate-900">28</span></div>
              <div className="flex flex-col"><span className="text-slate-500 mb-1">ขาด</span><span className="font-semibold text-slate-900">1</span></div>
              <div className="flex flex-col"><span className="text-slate-500 mb-1">ลา</span><span className="font-semibold text-slate-900">1</span></div>
            </div>
            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden flex">
              <div className="h-full bg-emerald-500" style={{ width: "93.3%" }}></div>
              <div className="h-full bg-red-400" style={{ width: "3.3%" }}></div>
              <div className="h-full bg-amber-400" style={{ width: "3.3%" }}></div>
            </div>
          </div>

          {/* ผลการเรียน */}
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-semibold text-slate-800">เกรดเฉลี่ย (1/67)</h4>
            </div>
            <div className="flex items-end gap-2 mb-2">
              <span className="text-2xl font-bold text-slate-900 leading-none">3.45</span>
              <span className="text-xs text-emerald-600 font-medium mb-1">+0.15</span>
            </div>
            <div className="text-xs text-slate-500">
              <span className="inline-block mr-3">ไทย <span className="font-medium text-slate-700">3.5</span></span>
              <span className="inline-block mr-3">คณิต <span className="font-medium text-slate-700">3.0</span></span>
              <span className="inline-block">วิทย์ <span className="font-medium text-slate-700">3.5</span></span>
            </div>
          </div>

        </div>

        {/* Documents */}
        <div className="pt-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-semibold text-slate-800">เอกสารแนบ</h3>
            <button className="text-xs font-medium text-blue-600 hover:text-blue-700">ดูทั้งหมด</button>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors group cursor-pointer">
              <div className="flex items-center gap-3">
                <FileText className="w-4 h-4 text-slate-400" />
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900 transition-colors">สำเนาบัตรประชาชน.pdf</span>
                  <span className="text-xs text-slate-500">12 พ.ค. 2567</span>
                </div>
              </div>
              <Download className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors group cursor-pointer">
              <div className="flex items-center gap-3">
                <FileText className="w-4 h-4 text-slate-400" />
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900 transition-colors">ทะเบียนบ้าน.pdf</span>
                  <span className="text-xs text-slate-500">12 พ.ค. 2567</span>
                </div>
              </div>
              <Download className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
