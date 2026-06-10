import React from "react"
import { MessageSquare, Calendar as CalendarIcon, Phone, Users, ChevronDown, Plus } from "lucide-react"

export function SupportRecords() {
  return (
    <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col h-full">
      
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-sm font-semibold text-slate-800">บันทึกการให้ความช่วยเหลือ</h3>
        <button className="flex items-center gap-1.5 text-xs font-semibold text-white bg-[#4f46e5] hover:bg-[#4338ca] px-3 py-1.5 rounded-lg transition-colors shadow-sm">
          <Plus className="w-3.5 h-3.5" />
          เพิ่มบันทึกการช่วยเหลือ
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto no-scrollbar mb-5 border-b border-slate-100 pb-2">
        <button className="text-xs font-semibold text-indigo-600 border-b-2 border-indigo-600 pb-1 px-1 whitespace-nowrap">ทั้งหมด</button>
        <button className="text-xs font-medium text-slate-500 hover:text-slate-800 pb-1 px-3 whitespace-nowrap">ให้คำปรึกษา</button>
        <button className="text-xs font-medium text-slate-500 hover:text-slate-800 pb-1 px-3 whitespace-nowrap">ติดตามผลการเรียน</button>
        <button className="text-xs font-medium text-slate-500 hover:text-slate-800 pb-1 px-3 whitespace-nowrap">ประสานผู้ปกครอง</button>
        <button className="text-xs font-medium text-slate-500 hover:text-slate-800 pb-1 px-3 whitespace-nowrap">กิจกรรม</button>
        <button className="text-xs font-medium text-slate-500 hover:text-slate-800 pb-1 px-3 whitespace-nowrap">อื่นๆ</button>
      </div>

      <div className="flex-1 flex flex-col gap-0 relative">
        {/* Vertical Timeline Line */}
        <div className="absolute left-[31px] top-4 bottom-8 w-[2px] bg-slate-100 z-0"></div>

        {/* Record 1 */}
        <div className="flex gap-4 relative z-10 mb-4 group">
          <div className="w-[85px] shrink-0 flex flex-col items-end pt-1">
            <span className="text-xs font-semibold text-slate-700">20 พ.ค. 2567</span>
            <span className="text-xs text-slate-400">14:30 น.</span>
          </div>
          <div className="w-9 h-9 rounded-full bg-indigo-50 border-4 border-white flex items-center justify-center shrink-0 shadow-sm z-10 group-hover:scale-110 transition-transform">
            <MessageSquare className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="flex-1 bg-slate-50 p-3 rounded-xl border border-slate-100/50 flex flex-col sm:flex-row lg:flex-col xl:flex-row sm:items-center lg:items-start xl:items-center justify-between gap-3">
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold text-slate-800 mb-0.5">ให้คำปรึกษารายบุคคล</span>
              <span className="text-xs text-slate-500 truncate">พูดคุยเรื่องปัญหาการเรียนและความเครียด</span>
              <span className="text-xs text-slate-400 mt-1.5">โดย นางสาวจันทร์จิรา พรมดี</span>
            </div>
            <button className="text-xs font-semibold text-indigo-600 bg-white border border-indigo-100 px-3 py-1.5 rounded-lg shrink-0 w-max hover:bg-indigo-50 transition-colors">
              ดูรายละเอียด
            </button>
          </div>
        </div>

        {/* Record 2 */}
        <div className="flex gap-4 relative z-10 mb-4 group">
          <div className="w-[85px] shrink-0 flex flex-col items-end pt-1">
            <span className="text-xs font-semibold text-slate-700">18 พ.ค. 2567</span>
            <span className="text-xs text-slate-400">10:00 น.</span>
          </div>
          <div className="w-9 h-9 rounded-full bg-emerald-50 border-4 border-white flex items-center justify-center shrink-0 shadow-sm z-10 group-hover:scale-110 transition-transform">
            <CalendarIcon className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="flex-1 bg-slate-50 p-3 rounded-xl border border-slate-100/50 flex flex-col sm:flex-row lg:flex-col xl:flex-row sm:items-center lg:items-start xl:items-center justify-between gap-3">
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold text-slate-800 mb-0.5">ติดตามผลการเรียน</span>
              <span className="text-xs text-slate-500 truncate">ติดตามงานที่มอบหมายและคะแนนสอบย่อย</span>
              <span className="text-xs text-slate-400 mt-1.5">โดย นางสาวจันทร์จิรา พรมดี</span>
            </div>
            <button className="text-xs font-semibold text-indigo-600 bg-white border border-indigo-100 px-3 py-1.5 rounded-lg shrink-0 w-max hover:bg-indigo-50 transition-colors">
              ดูรายละเอียด
            </button>
          </div>
        </div>

        {/* Record 3 */}
        <div className="flex gap-4 relative z-10 mb-4 group">
          <div className="w-[85px] shrink-0 flex flex-col items-end pt-1">
            <span className="text-xs font-semibold text-slate-700">16 พ.ค. 2567</span>
            <span className="text-xs text-slate-400">16:00 น.</span>
          </div>
          <div className="w-9 h-9 rounded-full bg-orange-50 border-4 border-white flex items-center justify-center shrink-0 shadow-sm z-10 group-hover:scale-110 transition-transform">
            <Phone className="w-4 h-4 text-orange-500" />
          </div>
          <div className="flex-1 bg-slate-50 p-3 rounded-xl border border-slate-100/50 flex flex-col sm:flex-row lg:flex-col xl:flex-row sm:items-center lg:items-start xl:items-center justify-between gap-3">
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold text-slate-800 mb-0.5">ประสานผู้ปกครอง</span>
              <span className="text-xs text-slate-500 truncate">โทรศัพท์พูดคุยกับผู้ปกครอง</span>
              <span className="text-xs text-slate-400 mt-1.5">โดย นางสาวจันทร์จิรา พรมดี</span>
            </div>
            <button className="text-xs font-semibold text-indigo-600 bg-white border border-indigo-100 px-3 py-1.5 rounded-lg shrink-0 w-max hover:bg-indigo-50 transition-colors">
              ดูรายละเอียด
            </button>
          </div>
        </div>

        {/* Record 4 */}
        <div className="flex gap-4 relative z-10 group">
          <div className="w-[85px] shrink-0 flex flex-col items-end pt-1">
            <span className="text-xs font-semibold text-slate-700">15 พ.ค. 2567</span>
            <span className="text-xs text-slate-400">13:30 น.</span>
          </div>
          <div className="w-9 h-9 rounded-full bg-blue-50 border-4 border-white flex items-center justify-center shrink-0 shadow-sm z-10 group-hover:scale-110 transition-transform">
            <Users className="w-4 h-4 text-blue-500" />
          </div>
          <div className="flex-1 bg-slate-50 p-3 rounded-xl border border-slate-100/50 flex flex-col sm:flex-row lg:flex-col xl:flex-row sm:items-center lg:items-start xl:items-center justify-between gap-3">
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold text-slate-800 mb-0.5">เข้าร่วมกิจกรรมเสริมทักษะ</span>
              <span className="text-xs text-slate-500 truncate">กิจกรรมเสริมสร้างทักษะการจัดการอารมณ์</span>
              <span className="text-xs text-slate-400 mt-1.5">โดย ครูแนะแนว</span>
            </div>
            <button className="text-xs font-semibold text-indigo-600 bg-white border border-indigo-100 px-3 py-1.5 rounded-lg shrink-0 w-max hover:bg-indigo-50 transition-colors">
              ดูรายละเอียด
            </button>
          </div>
        </div>

      </div>

      <button className="w-full flex items-center justify-center gap-1 text-xs font-semibold text-blue-600 mt-5 pt-3 border-t border-slate-100 hover:text-blue-700 transition-colors">
        ดูบันทึกเพิ่มเติม
        <ChevronDown className="w-3.5 h-3.5" />
      </button>

    </div>
  )
}
