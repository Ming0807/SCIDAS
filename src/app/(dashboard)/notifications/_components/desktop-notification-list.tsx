import React from "react"
import { ChevronDown, AlertCircle, TrendingDown, Calendar as CalendarIcon, MessageSquare, ClipboardList, Bell, FileText, Settings } from "lucide-react"

export function DesktopNotificationList() {
  return (
    <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col h-full">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
        <h3 className="text-[14px] font-bold text-slate-800">ทั้งหมด 32 รายการ</h3>
        <div className="flex items-center gap-2">
          <span className="text-[12px] text-slate-500">จัดเรียงตาม</span>
          <button className="flex items-center gap-1.5 text-[12px] font-medium text-slate-700 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors">
            ล่าสุด
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-4 flex-1">
        
        {/* Item 1 - Alert */}
        <div className="flex items-start gap-4 p-4 rounded-xl border border-red-100 bg-red-50/30 hover:bg-red-50/50 transition-colors cursor-pointer group">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
            <AlertCircle className="w-5 h-5 text-red-600" />
          </div>
          <div className="flex flex-col flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <h4 className="text-[13px] font-bold text-slate-800 truncate">นักเรียนมีความเสี่ยงสูง</h4>
              <span className="text-[10px] text-slate-500 shrink-0 ml-2">10 นาทีที่แล้ว</span>
            </div>
            <p className="text-[11px] text-slate-600 mb-2 truncate">เด็กชายธนวัฒน์ ใจดี นักเรียนชั้น ม.2/1 มีความเสี่ยงด้านพฤติกรรมในระดับสูง</p>
            <span className="w-max px-2 py-0.5 bg-red-100 text-red-600 text-[9px] font-bold rounded">สำคัญ</span>
          </div>
          <div className="w-2 h-2 rounded-full bg-red-500 shrink-0 mt-2"></div>
        </div>

        {/* Item 2 - Trend Down */}
        <div className="flex items-start gap-4 p-4 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer group">
          <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center shrink-0">
            <TrendingDown className="w-5 h-5 text-orange-500" />
          </div>
          <div className="flex flex-col flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <h4 className="text-[13px] font-bold text-slate-800 truncate">ผลการเรียนต่ำกว่าเกณฑ์</h4>
              <span className="text-[10px] text-slate-500 shrink-0 ml-2">1 ชั่วโมงที่แล้ว</span>
            </div>
            <p className="text-[11px] text-slate-600 truncate">เด็กหญิงกนกวรรณ ศรีสุข มีผลการเรียนวิชาคณิตศาสตร์ ต่ำกว่าเกณฑ์</p>
          </div>
          <div className="w-2 h-2 rounded-full bg-orange-400 shrink-0 mt-2"></div>
        </div>

        {/* Item 3 - Appointment */}
        <div className="flex items-start gap-4 p-4 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer group">
          <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center shrink-0">
            <CalendarIcon className="w-5 h-5 text-green-600" />
          </div>
          <div className="flex flex-col flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <h4 className="text-[13px] font-bold text-slate-800 truncate">นัดหมายการให้คำปรึกษา</h4>
              <span className="text-[10px] text-slate-500 shrink-0 ml-2">วันนี้ 09:00 น.</span>
            </div>
            <p className="text-[11px] text-slate-600 truncate">คุณมีนัดหมายให้คำปรึกษากับ เด็กชายธนวัฒน์ ใจดี</p>
          </div>
          <div className="w-2 h-2 rounded-full bg-green-500 shrink-0 mt-2"></div>
        </div>

        {/* Item 4 - Note */}
        <div className="flex items-start gap-4 p-4 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer group">
          <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
            <MessageSquare className="w-5 h-5 text-blue-500" />
          </div>
          <div className="flex flex-col flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <h4 className="text-[13px] font-bold text-slate-800 truncate">บันทึกการให้ความช่วยเหลือ</h4>
              <span className="text-[10px] text-slate-500 shrink-0 ml-2">เมื่อวาน 16:30 น.</span>
            </div>
            <p className="text-[11px] text-slate-600 truncate">เด็กชายธนวัฒน์ ใจดี ได้รับการบันทึกการให้ความช่วยเหลือใหม่</p>
          </div>
          <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0 mt-2"></div>
        </div>

        {/* Item 5 - Plan */}
        <div className="flex items-start gap-4 p-4 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer group">
          <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center shrink-0">
            <ClipboardList className="w-5 h-5 text-indigo-500" />
          </div>
          <div className="flex flex-col flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <h4 className="text-[13px] font-bold text-slate-800 truncate">แผนพัฒนารายบุคคลใกล้หมดกำหนด</h4>
              <span className="text-[10px] text-slate-500 shrink-0 ml-2">เมื่อวาน 11:15 น.</span>
            </div>
            <p className="text-[11px] text-slate-600 truncate">แผนพัฒนารายบุคคลของ เด็กหญิงปภาวรินทร์ จันทร์ดี จะหมดอายุในอีก 7 วัน</p>
          </div>
          <div className="w-2 h-2 rounded-full bg-indigo-500 shrink-0 mt-2"></div>
        </div>
        
        {/* Item 6 - Bell */}
        <div className="flex items-start gap-4 p-4 rounded-xl border border-slate-100 bg-white hover:bg-slate-50 transition-colors cursor-pointer group opacity-60">
          <div className="w-10 h-10 rounded-full bg-pink-50 flex items-center justify-center shrink-0">
            <Bell className="w-5 h-5 text-pink-500" />
          </div>
          <div className="flex flex-col flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <h4 className="text-[13px] font-bold text-slate-800 truncate">กิจกรรมส่งเสริมพฤติกรรม</h4>
              <span className="text-[10px] text-slate-500 shrink-0 ml-2">15 พ.ค. 67</span>
            </div>
            <p className="text-[11px] text-slate-600 truncate">มีการบันทึกกิจกรรมส่งเสริมพฤติกรรมที่ดีของ เด็กหญิงปภาวรินทร์ จันทร์ดี</p>
          </div>
        </div>

        {/* Item 7 - Report */}
        <div className="flex items-start gap-4 p-4 rounded-xl border border-slate-100 bg-white hover:bg-slate-50 transition-colors cursor-pointer group opacity-60">
          <div className="w-10 h-10 rounded-full bg-yellow-50 flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5 text-yellow-600" />
          </div>
          <div className="flex flex-col flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <h4 className="text-[13px] font-bold text-slate-800 truncate">รายงานสรุปประจำสัปดาห์</h4>
              <span className="text-[10px] text-slate-500 shrink-0 ml-2">13 พ.ค. 67</span>
            </div>
            <p className="text-[11px] text-slate-600 truncate">รายงานสรุปประจำสัปดาห์ ภาคเรียนที่ 1/2567 ประจำวันที่ 13-17 พ.ค. 2567</p>
          </div>
        </div>

        {/* Item 8 - System */}
        <div className="flex items-start gap-4 p-4 rounded-xl border border-slate-100 bg-white hover:bg-slate-50 transition-colors cursor-pointer group opacity-60">
          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
            <Settings className="w-5 h-5 text-slate-600" />
          </div>
          <div className="flex flex-col flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <h4 className="text-[13px] font-bold text-slate-800 truncate">อัปเดตระบบ</h4>
              <span className="text-[10px] text-slate-500 shrink-0 ml-2">12 พ.ค. 67</span>
            </div>
            <p className="text-[11px] text-slate-600 truncate">มีการอัปเดตระบบเป็นเวอร์ชันใหม่ V 2.3.0</p>
          </div>
        </div>

      </div>

      <div className="mt-6 flex justify-center border-t border-slate-100 pt-6">
        <button className="flex items-center gap-1.5 text-[12px] font-bold text-indigo-600 hover:text-indigo-800 transition-colors">
          โหลดเพิ่ม
          <ChevronDown className="w-4 h-4" />
        </button>
      </div>

    </div>
  )
}
