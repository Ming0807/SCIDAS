import React from "react"
import { BadgeCheck, Edit2, Clock, ShieldAlert, Printer, ChevronRight, FileText, Plus } from "lucide-react"

export function StudentProfilePanel() {
  return (
    <div className="bg-white rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] border border-slate-100 flex flex-col h-full overflow-hidden mt-6 xl:mt-0">
      <div className="p-4 sm:p-6 flex-1 overflow-y-auto">
        
        {/* Profile Header */}
        <div className="flex flex-col items-center text-center pb-6 border-b border-slate-100">
          <div className="relative mb-4">
            <img src="https://api.dicebear.com/7.x/notionists/svg?seed=boy1" className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-blue-50 border-4 border-blue-50/50" alt="Avatar"/>
            <span className="absolute bottom-1 right-1 w-3.5 h-3.5 sm:w-4 sm:h-4 bg-emerald-500 border-2 border-white rounded-full"></span>
          </div>
          
          <div className="flex items-center gap-1.5 justify-center mb-1">
            <h2 className="text-lg sm:text-xl font-bold text-slate-800">เด็กชายกฤษฎา ใจดี</h2>
            <BadgeCheck className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
          </div>
          
          <p className="text-xs sm:text-sm text-slate-500 mb-4">เลขประจำตัว 12345 | ชั้น ป.5/1 | เลขที่ 8</p>
          
          <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] sm:text-xs font-medium bg-emerald-50 text-emerald-600">ปกติ</span>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] sm:text-xs font-medium bg-blue-50 text-blue-600">นักเรียนทุน</span>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] sm:text-xs font-medium bg-purple-50 text-purple-600">มีพี่น้อง 2 คน</span>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] sm:text-xs font-medium bg-amber-50 text-amber-600">รักการเรียน</span>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 w-full">
            <button className="w-full sm:flex-1 flex justify-center items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors">
              <Edit2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> แก้ไขข้อมูล
            </button>
            <button className="w-full sm:flex-1 flex justify-center items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors">
              <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> ดูประวัติ
            </button>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 w-full mt-2">
            <button className="w-full sm:flex-1 flex justify-center items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors">
              <ShieldAlert className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> สร้างเคสดูแล
            </button>
            <button className="w-full sm:flex-1 flex justify-center items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors">
              <Printer className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> พิมพ์ข้อมูล <ChevronRight className="w-3 h-3 rotate-90 ml-1 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-6 border-b border-slate-100">
          <div>
            <h3 className="text-xs font-bold text-slate-800 mb-3">ข้อมูลการติดต่อ</h3>
            <ul className="space-y-2 text-xs">
              <li className="flex"><span className="w-16 sm:w-20 text-slate-500">วันเกิด</span><span className="text-slate-700 font-medium flex-1">15 มกราคม 2556 (12 ปี)</span></li>
              <li className="flex"><span className="w-16 sm:w-20 text-slate-500">เพศ</span><span className="text-slate-700 font-medium flex-1">ชาย</span></li>
              <li className="flex"><span className="w-16 sm:w-20 text-slate-500">สัญชาติ</span><span className="text-slate-700 font-medium flex-1">ไทย</span></li>
              <li className="flex"><span className="w-16 sm:w-20 text-slate-500">เชื้อชาติ</span><span className="text-slate-700 font-medium flex-1">ไทย</span></li>
              <li className="flex"><span className="w-16 sm:w-20 text-slate-500">ศาสนา</span><span className="text-slate-700 font-medium flex-1">พุทธ</span></li>
              <li className="flex items-start"><span className="w-16 sm:w-20 text-slate-500 shrink-0">ที่อยู่</span><span className="text-slate-700 font-medium flex-1 leading-snug">123 หมู่ 4 ต.แม่จัน อ.แม่จัน<br/>จ.เชียงราย 57110</span></li>
            </ul>
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-800 mb-3 mt-4 sm:mt-0">ข้อมูลผู้ปกครอง</h3>
            <ul className="space-y-2 text-xs">
              <li className="flex"><span className="w-16 sm:w-20 text-slate-500">ผู้ปกครอง</span><span className="text-slate-700 font-medium flex-1">นางสาวอรพิน ใจดี (มารดา)</span></li>
              <li className="flex"><span className="w-16 sm:w-20 text-slate-500">อาชีพ</span><span className="text-slate-700 font-medium flex-1">รับจ้างทั่วไป</span></li>
              <li className="flex"><span className="w-16 sm:w-20 text-slate-500">เบอร์โทร</span><span className="text-blue-600 font-medium flex-1">089-123-4567 →</span></li>
              <li className="flex"><span className="w-16 sm:w-20 text-slate-500">ไลน์ไอดี</span><span className="text-slate-700 font-medium flex-1">orapin_jaidee</span></li>
              <li className="flex items-start"><span className="w-16 sm:w-20 text-slate-500 shrink-0">ที่อยู่</span><span className="text-slate-700 font-medium flex-1 leading-snug">123 หมู่ 4 ต.แม่จัน อ.แม่จัน<br/>จ.เชียงราย 57110</span></li>
            </ul>
          </div>
        </div>

        {/* Dashboard Widgets */}
        <div className="py-6 border-b border-slate-100">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* การมาเรียน */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
              <h4 className="text-[11px] sm:text-xs font-bold text-slate-800 mb-3 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-sm bg-blue-500"></span> การมาเรียน <span className="text-slate-400 font-normal">(30 วันล่าสุด)</span>
              </h4>
              <div className="flex justify-between text-[11px] sm:text-xs mb-2">
                <div className="flex flex-col items-center"><span className="text-slate-500">มาเรียน</span><span className="font-bold text-emerald-600">28 วัน</span></div>
                <div className="flex flex-col items-center"><span className="text-slate-500">ขาดเรียน</span><span className="font-bold text-red-600">1 วัน</span></div>
                <div className="flex flex-col items-center"><span className="text-slate-500">ลาป่วย</span><span className="font-bold text-amber-500">1 วัน</span></div>
                <div className="flex flex-col items-center"><span className="text-slate-500">ลากิจ</span><span className="font-bold text-blue-500">0 วัน</span></div>
              </div>
              <div className="text-[9px] sm:text-[10px] text-slate-500 mb-1">คิดเป็น 93.33%</div>
              <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden flex">
                <div className="h-full bg-emerald-500" style={{ width: "93.3%" }}></div>
                <div className="h-full bg-red-500" style={{ width: "3.3%" }}></div>
                <div className="h-full bg-amber-500" style={{ width: "3.3%" }}></div>
              </div>
            </div>

            {/* ผลการเรียน */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
              <h4 className="text-[11px] sm:text-xs font-bold text-slate-800 mb-3 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-sm bg-purple-500"></span> ผลการเรียนล่าสุด <span className="text-slate-400 font-normal">(ภาคเรียน 1/67)</span>
              </h4>
              <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 text-[11px] sm:text-xs">
                <div className="flex justify-between"><span className="text-slate-600">ภาษาไทย</span><span className="font-bold text-slate-800">3.5</span></div>
                <div className="flex justify-between"><span className="text-slate-600">คณิตศาสตร์</span><span className="font-bold text-slate-800">3.0</span></div>
                <div className="flex justify-between"><span className="text-slate-600">วิทย์ฯ</span><span className="font-bold text-slate-800">3.5</span></div>
                <div className="flex justify-between"><span className="text-slate-600">อังกฤษ</span><span className="font-bold text-slate-800">3.0</span></div>
                <div className="flex justify-between"><span className="text-slate-600">สังคมฯ</span><span className="font-bold text-slate-800">3.5</span></div>
                <div className="flex justify-between"><span className="text-slate-600">สุขศึกษา</span><span className="font-bold text-slate-800">4.0</span></div>
              </div>
              <a href="#" className="block mt-2 text-[10px] text-blue-600 font-medium hover:underline">ดูผลการเรียนทั้งหมด →</a>
            </div>

          </div>

          {/* Tags */}
          <div className="mt-4">
            <h4 className="text-xs font-bold text-slate-800 mb-2 flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-slate-300"></span> ป้ายกำกับ (Tags)
            </h4>
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] sm:text-[11px] font-medium bg-blue-50 text-blue-600">ขยันเรียน</span>
              <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] sm:text-[11px] font-medium bg-emerald-50 text-emerald-600">ช่วยงานครู</span>
              <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] sm:text-[11px] font-medium bg-emerald-50 text-emerald-600">เข้าร่วมกิจกรรม</span>
              <button className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] sm:text-[11px] font-medium bg-white border border-dashed border-slate-300 text-slate-500 hover:text-slate-700 hover:border-slate-400">
                <Plus className="w-3 h-3 mr-1" /> เพิ่มป้ายกำกับ
              </button>
            </div>
          </div>
        </div>

        {/* Documents & Activities */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6">
          
          <div>
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-xs font-bold text-slate-800">เอกสาร/ไฟล์แนบ</h4>
              <a href="#" className="text-[10px] text-blue-600 hover:underline">ดูทั้งหมด</a>
            </div>
            <div className="space-y-3">
              <div className="flex gap-2">
                <div className="p-1.5 rounded bg-red-50 shrink-0 h-fit">
                  <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-500" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] sm:text-[11px] font-medium text-slate-800 leading-tight">สำเนาบัตรประชาชนนักเรียน.pdf</span>
                  <span className="text-[9px] sm:text-[10px] text-slate-400 mt-0.5">อัปโหลด 12 พ.ค. 2567</span>
                </div>
              </div>
              <div className="flex gap-2">
                <div className="p-1.5 rounded bg-orange-50 shrink-0 h-fit">
                  <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange-500" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] sm:text-[11px] font-medium text-slate-800 leading-tight">ทะเบียนบ้านนักเรียน.pdf</span>
                  <span className="text-[9px] sm:text-[10px] text-slate-400 mt-0.5">อัปโหลด 12 พ.ค. 2567</span>
                </div>
              </div>
              <div className="flex gap-2">
                <div className="p-1.5 rounded bg-blue-50 shrink-0 h-fit">
                  <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-500" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] sm:text-[11px] font-medium text-slate-800 leading-tight">ใบรับรองแพทย์.pdf</span>
                  <span className="text-[9px] sm:text-[10px] text-slate-400 mt-0.5">อัปโหลด 3 มิ.ย. 2567</span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-3 mt-4 sm:mt-0">
              <h4 className="text-xs font-bold text-slate-800">กิจกรรมล่าสุด</h4>
              <a href="#" className="text-[10px] text-blue-600 hover:underline">ดูทั้งหมด</a>
            </div>
            <div className="space-y-4">
              
              <div className="flex gap-2">
                <img src="https://api.dicebear.com/7.x/notionists/svg?seed=teacher1" className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-slate-100 shrink-0" alt="Teacher"/>
                <div className="flex flex-col">
                  <div className="text-[10px] sm:text-[11px] leading-tight"><span className="font-medium text-slate-800">ครูจิราภรณ์</span> <span className="text-slate-600">แก้ไขข้อมูลนักเรียน</span></div>
                  <span className="text-[8px] sm:text-[9px] text-slate-400 mt-0.5">12 พ.ค. 2567 • 10:30 น.</span>
                </div>
              </div>
              
              <div className="flex gap-2">
                <img src="https://api.dicebear.com/7.x/notionists/svg?seed=teacher1" className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-slate-100 shrink-0" alt="Teacher"/>
                <div className="flex flex-col">
                  <div className="text-[10px] sm:text-[11px] leading-tight"><span className="font-medium text-slate-800">ครูจิราภรณ์</span> <span className="text-slate-600">บันทึกผลการเรียน 1/2567</span></div>
                  <span className="text-[8px] sm:text-[9px] text-slate-400 mt-0.5">10 พ.ค. 2567 • 16:45 น.</span>
                </div>
              </div>

              <div className="flex gap-2">
                <img src="https://api.dicebear.com/7.x/notionists/svg?seed=teacher1" className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-slate-100 shrink-0" alt="Teacher"/>
                <div className="flex flex-col">
                  <div className="text-[10px] sm:text-[11px] leading-tight"><span className="font-medium text-slate-800">ครูจิราภรณ์</span> <span className="text-slate-600">บันทึกการมาเรียน</span></div>
                  <span className="text-[8px] sm:text-[9px] text-slate-400 mt-0.5">8 พ.ค. 2567 • 08:15 น.</span>
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>
    </div>
  )
}
