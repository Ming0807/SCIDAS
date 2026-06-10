import React from "react"
import { UserCircle, Phone, ArrowRight, ClipboardList, Target, CalendarHeart, TrendingUp, Award, Edit3 } from "lucide-react"

export function IdpHeader() {
  return (
    <div className="flex flex-col xl:flex-row gap-4 mb-6">
      
      {/* Profile Card */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm xl:w-[380px] shrink-0 flex flex-col justify-between">
        <div className="flex items-start gap-4 mb-6">
          <img src="https://api.dicebear.com/7.x/notionists/svg?seed=boy1" alt="Avatar" className="w-16 h-16 rounded-full bg-slate-100 border border-slate-200" />
          <div className="flex flex-col pt-1">
            <div className="flex items-center gap-2">
              <h2 className="text-[16px] font-bold text-slate-800">เด็กชายธนวัฒน์ ใจดี</h2>
              <Edit3 className="w-3.5 h-3.5 text-blue-500 cursor-pointer hover:text-blue-600" />
            </div>
            <div className="text-[13px] text-slate-500 mb-1.5">ชั้น ม.2/1 เลขที่ 5</div>
            <div className="text-[11px] text-slate-400 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-md w-max">รหัสประจำตัว 12345</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-4 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center shrink-0">
              <UserCircle className="w-4 h-4 text-indigo-500" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] text-slate-400 font-medium">ครูที่ปรึกษา</span>
              <span className="text-[11px] font-bold text-slate-700 truncate">นางสาวจันทร์จิรา พรมดี</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center shrink-0">
              <Phone className="w-4 h-4 text-indigo-500" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] text-slate-400 font-medium">เบอร์โทรผู้ปกครอง</span>
              <span className="text-[11px] font-bold text-slate-700">081-234-5678</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between bg-rose-50/50 p-2.5 rounded-xl border border-rose-100">
          <span className="text-[11px] font-bold text-slate-600 pl-1">ระดับความเสี่ยง</span>
          <span className="text-[12px] font-bold text-rose-600 bg-white px-3 py-1 rounded-lg border border-rose-100 shadow-sm flex items-center gap-1.5">
            เสี่ยงสูง
            <div className="w-3.5 h-3.5 rounded-full bg-rose-500 text-white flex items-center justify-center text-[8px]">!</div>
          </span>
        </div>
      </div>

      {/* Roadmap Card */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex-1 flex flex-col relative overflow-hidden">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-[14px] font-bold text-slate-800">เส้นทางการพัฒนา (Development Roadmap)</h3>
        </div>

        <div className="overflow-x-auto no-scrollbar pb-4 -mx-2 px-2 md:-mx-6 md:px-6 mt-2">
          <div className="flex items-start justify-between relative min-w-[500px]">
            {/* Connector Line */}
            <div className="absolute top-[22px] left-[10%] right-[10%] h-[2px] bg-slate-100 z-0"></div>

          {/* Step 1 */}
          <div className="flex flex-col items-center relative z-10 w-[85px] text-center group cursor-pointer opacity-60">
            <div className="w-11 h-11 rounded-full bg-white border-[3px] border-emerald-100 flex items-center justify-center mb-3">
              <ClipboardList className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="text-[12px] font-bold text-slate-700 mb-0.5">1. ประเมิน</div>
            <div className="text-[9px] text-slate-400 leading-tight">ประเมินข้อมูลและ<br/>วิเคราะห์ปัญหา</div>
          </div>

          <ArrowRight className="w-4 h-4 text-slate-300 mt-3" />

          {/* Step 2 */}
          <div className="flex flex-col items-center relative z-10 w-[85px] text-center group cursor-pointer opacity-60">
            <div className="w-11 h-11 rounded-full bg-white border-[3px] border-emerald-100 flex items-center justify-center mb-3">
              <Target className="w-5 h-5 text-emerald-500" />
            </div>
            <div className="text-[12px] font-bold text-slate-700 mb-0.5">2. ตั้งเป้าหมาย</div>
            <div className="text-[9px] text-slate-400 leading-tight">กำหนดเป้าหมาย<br/>การพัฒนารายบุคคล</div>
          </div>

          <ArrowRight className="w-4 h-4 text-slate-300 mt-3" />

          {/* Step 3 */}
          <div className="flex flex-col items-center relative z-10 w-[85px] text-center group cursor-pointer">
            <div className="w-11 h-11 rounded-full bg-blue-50 border-[3px] border-blue-500 flex items-center justify-center mb-3 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
              <CalendarHeart className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-[12px] font-bold text-blue-600 mb-0.5">3. วางกิจกรรม</div>
            <div className="text-[9px] text-blue-500/80 leading-tight">วางแผนกิจกรรม<br/>และแนวทางช่วยเหลือ</div>
            {/* Active Dot */}
            <div className="absolute -bottom-5 w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
          </div>

          <ArrowRight className="w-4 h-4 text-slate-300 mt-3" />

          {/* Step 4 */}
          <div className="flex flex-col items-center relative z-10 w-[85px] text-center group cursor-pointer opacity-50">
            <div className="w-11 h-11 rounded-full bg-white border-[3px] border-slate-200 flex items-center justify-center mb-3">
              <TrendingUp className="w-5 h-5 text-slate-400" />
            </div>
            <div className="text-[12px] font-bold text-slate-700 mb-0.5">4. ติดตามผล</div>
            <div className="text-[9px] text-slate-400 leading-tight">ติดตามและบันทึก<br/>ความก้าวหน้า</div>
          </div>

          <ArrowRight className="w-4 h-4 text-slate-300 mt-3" />

          {/* Step 5 */}
          <div className="flex flex-col items-center relative z-10 w-[85px] text-center group cursor-pointer opacity-50">
            <div className="w-11 h-11 rounded-full bg-white border-[3px] border-slate-200 flex items-center justify-center mb-3">
              <Award className="w-5 h-5 text-slate-400" />
            </div>
            <div className="text-[12px] font-bold text-slate-700 mb-0.5">5. ประเมินซ้ำ</div>
            <div className="text-[9px] text-slate-400 leading-tight">ประเมินผลลัพธ์<br/>และปรับแผน</div>
          </div>

          </div>
        </div>
      </div>
    </div>
  )
}
