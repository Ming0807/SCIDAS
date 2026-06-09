import React from "react"
import { BookOpen, Smile, HeartPulse, CalendarIcon, Megaphone, ClipboardList, FileText, ChevronRight, ChevronDown } from "lucide-react"

export function MobileNotificationList() {
  return (
    <div className="px-4 py-4 mb-20">
      
      {/* Today */}
      <div className="mb-6">
        <h3 className="text-[14px] font-bold text-slate-800 mb-3">วันนี้</h3>
        <div className="flex flex-col gap-3">
          
          {/* Item 1 */}
          <div className="bg-white rounded-2xl p-4 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100 flex gap-3 relative cursor-pointer">
            <div className="absolute top-4 left-3 w-1.5 h-1.5 rounded-full bg-red-500"></div>
            <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center shrink-0 border border-indigo-100 ml-2">
              <BookOpen className="w-5 h-5 text-indigo-500" />
            </div>
            <div className="flex flex-col flex-1 min-w-0">
              <div className="flex items-start justify-between mb-0.5">
                <h4 className="text-[13px] font-bold text-slate-800 leading-tight pr-2 truncate">ผลการเรียนรายวิชาใหม่</h4>
                <span className="text-[10px] text-slate-500 shrink-0">10:30 น.</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed truncate">ประกาศผลการเรียน วิชาคณิตศาสตร์พื้นฐาน<br/>ภาคเรียนที่ 1/2567</p>
              <div className="flex items-center justify-between mt-2">
                <div className="w-max px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[9px] font-bold rounded-md">การเรียน</div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>
            </div>
          </div>

          {/* Item 2 */}
          <div className="bg-white rounded-2xl p-4 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100 flex gap-3 relative cursor-pointer">
            <div className="absolute top-4 left-3 w-1.5 h-1.5 rounded-full bg-red-500"></div>
            <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center shrink-0 border border-green-100 ml-2">
              <Smile className="w-6 h-6 text-green-500" />
            </div>
            <div className="flex flex-col flex-1 min-w-0">
              <div className="flex items-start justify-between mb-0.5">
                <h4 className="text-[13px] font-bold text-slate-800 leading-tight pr-2 truncate">พฤติกรรมได้รับการบันทึก</h4>
                <span className="text-[10px] text-slate-500 shrink-0">09:15 น.</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed truncate">มีการบันทึกพฤติกรรม ชมเชย<br/>โดย ครูสุรินทร์ จิรา</p>
              <div className="flex items-center justify-between mt-2">
                <div className="w-max px-2 py-0.5 bg-green-50 text-green-600 text-[9px] font-bold rounded-md">พฤติกรรม</div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>
            </div>
          </div>

          {/* Item 3 */}
          <div className="bg-white rounded-2xl p-4 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100 flex gap-3 relative cursor-pointer">
            <div className="absolute top-4 left-3 w-1.5 h-1.5 rounded-full bg-red-500"></div>
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center shrink-0 border border-red-100 ml-2">
              <HeartPulse className="w-5 h-5 text-red-500" />
            </div>
            <div className="flex flex-col flex-1 min-w-0">
              <div className="flex items-start justify-between mb-0.5">
                <h4 className="text-[13px] font-bold text-slate-800 leading-tight pr-2 truncate">แผนการช่วยเหลือ</h4>
                <span className="text-[10px] text-slate-500 shrink-0">08:45 น.</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed truncate">มีความคืบหน้าของแผนการช่วยเหลือรายบุคคล<br/>แผนที่ 2 : ด้านพฤติกรรม</p>
              <div className="flex items-center justify-between mt-2">
                <div className="w-max px-2 py-0.5 bg-red-50 text-red-600 text-[9px] font-bold rounded-md">การช่วยเหลือ</div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>
            </div>
          </div>

          {/* Item 4 */}
          <div className="bg-white rounded-2xl p-4 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100 flex gap-3 relative cursor-pointer">
            <div className="absolute top-4 left-3 w-1.5 h-1.5 rounded-full bg-red-500"></div>
            <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center shrink-0 border border-orange-100 ml-2">
              <CalendarIcon className="w-5 h-5 text-orange-500" />
            </div>
            <div className="flex flex-col flex-1 min-w-0">
              <div className="flex items-start justify-between mb-0.5">
                <h4 className="text-[13px] font-bold text-slate-800 leading-tight pr-2 truncate">กิจกรรมนัดหมาย</h4>
                <span className="text-[10px] text-slate-500 shrink-0">08:30 น.</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed truncate">นัดหมายผู้ปกครอง วันที่ 15 พ.ค. 2567 เวลา 14:00 น.<br/>เรื่อง พฤติกรรมการเรียน</p>
              <div className="flex items-center justify-between mt-2">
                <div className="w-max px-2 py-0.5 bg-orange-50 text-orange-600 text-[9px] font-bold rounded-md">นัดหมาย</div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Yesterday */}
      <div className="mb-6">
        <h3 className="text-[14px] font-bold text-slate-800 mb-3">เมื่อวาน</h3>
        <div className="flex flex-col gap-3">
          
          {/* Item 5 */}
          <div className="bg-white rounded-2xl p-4 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100 flex gap-3 cursor-pointer opacity-80">
            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center shrink-0 border border-blue-100 ml-2">
              <Megaphone className="w-5 h-5 text-blue-500" />
            </div>
            <div className="flex flex-col flex-1 min-w-0">
              <div className="flex items-start justify-between mb-0.5">
                <h4 className="text-[13px] font-bold text-slate-800 leading-tight pr-2 truncate">ประกาศจากโรงเรียน</h4>
                <span className="text-[10px] text-slate-500 shrink-0">1 พ.ค. 2567</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed truncate">แจ้งปิดเรียนกรณีพิเศษ วันที่ 16 พ.ค. 2567<br/>เนื่องจากกิจกรรมพัฒนาครู</p>
              <div className="flex items-center justify-between mt-2">
                <div className="w-max px-2 py-0.5 bg-blue-50 text-blue-600 text-[9px] font-bold rounded-md">ประกาศ</div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>
            </div>
          </div>

          {/* Item 6 */}
          <div className="bg-white rounded-2xl p-4 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100 flex gap-3 cursor-pointer opacity-80">
            <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center shrink-0 border border-purple-100 ml-2">
              <ClipboardList className="w-5 h-5 text-purple-500" />
            </div>
            <div className="flex flex-col flex-1 min-w-0">
              <div className="flex items-start justify-between mb-0.5">
                <h4 className="text-[13px] font-bold text-slate-800 leading-tight pr-2 truncate">แบบประเมินรอการตอบ</h4>
                <span className="text-[10px] text-slate-500 shrink-0">1 พ.ค. 2567</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed truncate">แบบประเมินพฤติกรรมการเรียนรู้<br/>ภาคเรียนที่ 1/2567</p>
              <div className="flex items-center justify-between mt-2">
                <div className="w-max px-2 py-0.5 bg-purple-50 text-purple-600 text-[9px] font-bold rounded-md">แบบประเมิน</div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Before */}
      <div className="mb-6">
        <h3 className="text-[14px] font-bold text-slate-800 mb-3">ก่อนหน้านี้</h3>
        <div className="flex flex-col gap-3">
          
          {/* Item 7 */}
          <div className="bg-white rounded-2xl p-4 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100 flex gap-3 cursor-pointer opacity-80">
            <div className="w-12 h-12 rounded-full bg-yellow-50 flex items-center justify-center shrink-0 border border-yellow-100 ml-2">
              <FileText className="w-5 h-5 text-yellow-600" />
            </div>
            <div className="flex flex-col flex-1 min-w-0">
              <div className="flex items-start justify-between mb-0.5">
                <h4 className="text-[13px] font-bold text-slate-800 leading-tight pr-2 truncate">รายงานสรุปประจำเดือน</h4>
                <span className="text-[10px] text-slate-500 shrink-0">30 เม.ย. 2567</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed truncate">รายงานสรุปประจำเดือน เมษายน 2567<br/>พร้อมให้ดาวน์โหลดแล้ว</p>
              <div className="flex items-center justify-between mt-2">
                <div className="w-max px-2 py-0.5 bg-yellow-50 text-yellow-700 text-[9px] font-bold rounded-md">รายงาน</div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>
            </div>
          </div>

        </div>
      </div>

      <div className="flex justify-center mt-4">
        <button className="flex items-center gap-1 text-[12px] font-bold text-indigo-600 hover:text-indigo-800 transition-colors">
          โหลดเพิ่ม
          <ChevronDown className="w-4 h-4" />
        </button>
      </div>

    </div>
  )
}
