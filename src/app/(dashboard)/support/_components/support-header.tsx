import React from "react"
import { UserCircle, Phone, ArrowRight, History, Activity, BarChart, FileText, Settings, UserCheck } from "lucide-react"

export function SupportHeader() {
  return (
    <div className="flex flex-col xl:flex-row gap-4 mb-6">
      
      {/* Profile Card */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm xl:w-[360px] shrink-0 flex flex-col justify-between">
        <div className="flex items-start gap-4 mb-6">
          <img src="https://api.dicebear.com/7.x/notionists/svg?seed=boy1" alt="Avatar" className="w-16 h-16 rounded-full bg-slate-100" />
          <div className="flex flex-col pt-1">
            <h2 className="text-[16px] font-semibold text-slate-800">เด็กชายธนวัฒน์ ใจดี</h2>
            <div className="text-sm text-slate-500 mb-1.5">ชั้น ม.2/1 เลขที่ 5</div>
            <div className="text-xs text-slate-400 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-md w-max">รหัสประจำตัว 12345</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center shrink-0">
              <UserCircle className="w-4 h-4 text-indigo-500" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs text-slate-400 font-medium">ครูที่ปรึกษา</span>
              <span className="text-xs font-semibold text-slate-700 truncate">นางสาวจันทร์จิรา พรมดี</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center shrink-0">
              <Phone className="w-4 h-4 text-indigo-500" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs text-slate-400 font-medium">เบอร์โทรผู้ปกครอง</span>
              <span className="text-xs font-semibold text-slate-700">081-234-5678</span>
            </div>
          </div>
        </div>
      </div>

      {/* Process Flow Card */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex-1 flex flex-col relative overflow-hidden">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-sm font-semibold text-slate-800">กระบวนการดูแลช่วยเหลือ</h3>
          <button className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors border border-indigo-100/50">
            <History className="w-3.5 h-3.5" />
            ประวัติการดูแลทั้งหมด
          </button>
        </div>

        <div className="overflow-x-auto no-scrollbar pb-4 -mx-2 px-2 md:-mx-8 md:px-8 mt-2">
          <div className="flex items-start justify-between relative min-w-[500px]">
            {/* Connector Line */}
            <div className="absolute top-[22px] left-[10%] right-[10%] h-[2px] bg-slate-100 z-0"></div>

          {/* Step 1 */}
          <div className="flex flex-col items-center relative z-10 w-24 text-center group cursor-pointer">
            <div className="w-11 h-11 rounded-full bg-white border-[3px] border-indigo-100 flex items-center justify-center mb-3 group-hover:border-indigo-300 transition-colors shadow-sm">
              <Activity className="w-5 h-5 text-indigo-400" />
            </div>
            <div className="text-xs font-semibold text-slate-700 mb-0.5">1. คัดกรอง</div>
            <div className="text-xs text-slate-400">ค้นหาผู้คัดกรองนักเรียน</div>
          </div>

          <ArrowRight className="w-4 h-4 text-slate-300 mt-3" />

          {/* Step 2 */}
          <div className="flex flex-col items-center relative z-10 w-24 text-center group cursor-pointer">
            <div className="w-11 h-11 rounded-full bg-white border-[3px] border-cyan-100 flex items-center justify-center mb-3 group-hover:border-cyan-300 transition-colors shadow-sm">
              <BarChart className="w-5 h-5 text-cyan-500" />
            </div>
            <div className="text-xs font-semibold text-slate-700 mb-0.5">2. วิเคราะห์</div>
            <div className="text-xs text-slate-400">วิเคราะห์สาเหตุ</div>
          </div>

          <ArrowRight className="w-4 h-4 text-slate-300 mt-3" />

          {/* Step 3 */}
          <div className="flex flex-col items-center relative z-10 w-24 text-center group cursor-pointer">
            <div className="w-11 h-11 rounded-full bg-emerald-50 border-[3px] border-emerald-500 flex items-center justify-center mb-3 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
              <FileText className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="text-xs font-semibold text-emerald-600 mb-0.5">3. วางแผน</div>
            <div className="text-xs text-emerald-500/70">วางแผนช่วยเหลือ</div>
          </div>

          <ArrowRight className="w-4 h-4 text-slate-300 mt-3" />

          {/* Step 4 */}
          <div className="flex flex-col items-center relative z-10 w-24 text-center group cursor-pointer opacity-50">
            <div className="w-11 h-11 rounded-full bg-white border-[3px] border-orange-100 flex items-center justify-center mb-3 group-hover:border-orange-300 transition-colors shadow-sm">
              <Settings className="w-5 h-5 text-orange-400" />
            </div>
            <div className="text-xs font-semibold text-slate-700 mb-0.5">4. ดำเนินการ</div>
            <div className="text-xs text-slate-400">ให้การช่วยเหลือ</div>
          </div>

          <ArrowRight className="w-4 h-4 text-slate-300 mt-3" />

          {/* Step 5 */}
          <div className="flex flex-col items-center relative z-10 w-24 text-center group cursor-pointer opacity-50">
            <div className="w-11 h-11 rounded-full bg-white border-[3px] border-purple-100 flex items-center justify-center mb-3 group-hover:border-purple-300 transition-colors shadow-sm">
              <UserCheck className="w-5 h-5 text-purple-400" />
            </div>
            <div className="text-xs font-semibold text-slate-700 mb-0.5">5. ติดตามผล</div>
            <div className="text-xs text-slate-400">ติดตามผลต่อเนื่อง</div>
          </div>

          </div>
        </div>
      </div>
    </div>
  )
}
