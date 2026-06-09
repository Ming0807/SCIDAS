import React from "react"
import { Flag, Calendar, Settings, ChevronRight, PlusCircle, UserCircle, Phone, Mail } from "lucide-react"

export function IdpSidebar() {
  return (
    <div className="flex flex-col gap-6 h-full">
      
      {/* Plan Status */}
      <div className="bg-white rounded-2xl p-5 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100">
        <div className="flex items-center gap-2 mb-4 text-indigo-600">
          <Flag className="w-4 h-4" />
          <h3 className="text-[14px] font-bold">สถานะของแผน</h3>
        </div>

        <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-100">
          <span className="text-[12px] font-bold text-slate-700">สถานะปัจจุบัน</span>
          <span className="px-2 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-bold rounded-md">กำลังดำเนินการ</span>
        </div>

        <div className="mb-5">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[12px] font-bold text-slate-700">ความคืบหน้าโดยรวม</span>
            <span className="text-[14px] font-bold text-slate-900">62%</span>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-500 rounded-full" style={{ width: '62%' }}></div>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-500 font-medium">เริ่มแผน</span>
            <span className="text-[12px] font-bold text-slate-800">1 พ.ค. 2567</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-500 font-medium">กำหนดประเมินรอบถัดไป</span>
            <span className="text-[12px] font-bold text-slate-800">15 ก.ย. 2567 <span className="text-[10px] text-slate-400 font-normal ml-1">(อีก 42 วัน)</span></span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-500 font-medium">ผู้รับผิดชอบหลัก</span>
            <span className="text-[11px] font-bold text-slate-700">นางสาวจันทร์จิรา พรมดี</span>
          </div>
        </div>
      </div>

      {/* Upcoming Activities */}
      <div className="bg-white rounded-2xl p-5 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100">
        <div className="flex items-center justify-between mb-4 text-indigo-600">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <h3 className="text-[14px] font-bold">กิจกรรมที่ต้องดำเนินการ</h3>
          </div>
          <button className="text-[10px] font-bold text-slate-400 hover:text-slate-600">ดูทั้งหมด</button>
        </div>

        <div className="flex flex-col gap-4 mb-4">
          
          <div className="flex items-start gap-3">
            <div className="flex flex-col items-center shrink-0 w-12 pt-0.5">
              <span className="text-[12px] font-bold text-slate-800 leading-none">20 พ.ค.</span>
              <span className="text-[9px] text-blue-600 font-bold mt-1 bg-blue-50 px-1.5 py-0.5 rounded">(พรุ่งนี้)</span>
            </div>
            <div className="w-[1px] h-10 bg-slate-100 shrink-0 mx-1 relative">
              <div className="absolute top-1 -left-1 w-2.5 h-2.5 rounded-full bg-emerald-500 border-[2px] border-white ring-1 ring-emerald-100"></div>
            </div>
            <div className="flex flex-col min-w-0 flex-1 pl-1">
              <div className="text-[12px] font-bold text-slate-800 truncate">นัดหมายผู้ปกครอง</div>
              <div className="text-[10px] text-slate-500">นัดหมาย 15:00 น.</div>
            </div>
            <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 shrink-0">ใกล้ถึง</span>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex flex-col items-center shrink-0 w-12 pt-0.5">
              <span className="text-[11px] font-bold text-slate-600 leading-none">21 พ.ค.</span>
            </div>
            <div className="w-[1px] h-10 bg-slate-100 shrink-0 mx-1 relative">
              <div className="absolute top-1 -left-1 w-2.5 h-2.5 rounded-full bg-slate-200 border-[2px] border-white"></div>
            </div>
            <div className="flex flex-col min-w-0 flex-1 pl-1">
              <div className="text-[12px] font-bold text-slate-800 truncate">ติวเสริมคณิตศาสตร์</div>
              <div className="text-[10px] text-slate-500">13:30 - 15:00 น.</div>
            </div>
            <span className="text-[9px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-100 shrink-0">รอดำเนินการ</span>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex flex-col items-center shrink-0 w-12 pt-0.5">
              <span className="text-[11px] font-bold text-slate-600 leading-none">23 พ.ค.</span>
            </div>
            <div className="w-[1px] h-10 bg-slate-100 shrink-0 mx-1 relative">
              <div className="absolute top-1 -left-1 w-2.5 h-2.5 rounded-full bg-slate-200 border-[2px] border-white"></div>
            </div>
            <div className="flex flex-col min-w-0 flex-1 pl-1">
              <div className="text-[12px] font-bold text-slate-800 truncate">ฝึกอ่านหนังสือ</div>
              <div className="text-[10px] text-slate-500">07:30 - 08:00 น.</div>
            </div>
            <span className="text-[9px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-100 shrink-0">รอดำเนินการ</span>
          </div>

        </div>

        <button className="w-full flex items-center justify-center gap-1.5 py-2 text-[11px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100/50 rounded-xl hover:bg-indigo-100 transition-colors">
          <PlusCircle className="w-3.5 h-3.5" />
          เพิ่มกิจกรรม
        </button>
      </div>

      {/* Team */}
      <div className="bg-white rounded-2xl p-5 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100">
        <div className="flex items-center justify-between mb-4 text-indigo-600">
          <div className="flex items-center gap-2">
            <UserCircle className="w-4 h-4" />
            <h3 className="text-[14px] font-bold">ทีมผู้ดูแล</h3>
          </div>
          <button className="text-[10px] font-bold text-slate-400 hover:text-slate-600">จัดการทีม</button>
        </div>

        <div className="flex flex-col gap-3">
          
          <div className="flex items-center justify-between gap-2 p-2 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-slate-100">
            <img src="https://api.dicebear.com/7.x/notionists/svg?seed=teacher2" alt="Avatar" className="w-9 h-9 rounded-full bg-slate-100 shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="text-[11px] font-bold text-slate-800 truncate">นางสาวจันทร์จิรา พรมดี</div>
              <div className="text-[9px] text-slate-500">ครูที่ปรึกษา</div>
            </div>
            <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded shrink-0">ผู้รับผิดชอบหลัก</span>
          </div>

          <div className="flex items-center justify-between gap-2 p-2 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-slate-100">
            <img src="https://api.dicebear.com/7.x/notionists/svg?seed=teacher1" alt="Avatar" className="w-9 h-9 rounded-full bg-slate-100 shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="text-[11px] font-bold text-slate-800 truncate">นางสาวศิริพร แก้วสนิท</div>
              <div className="text-[9px] text-slate-500">ครูแนะแนว</div>
            </div>
            <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded shrink-0 w-12 text-center">ผู้ร่วม</span>
          </div>

          <div className="flex items-center justify-between gap-2 p-2 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-slate-100">
            <img src="https://api.dicebear.com/7.x/notionists/svg?seed=parent1" alt="Avatar" className="w-9 h-9 rounded-full bg-slate-100 shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="text-[11px] font-bold text-slate-800 truncate">นายสมชาย ใจดี</div>
              <div className="text-[9px] text-slate-500">ครูคณิตศาสตร์</div>
            </div>
            <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded shrink-0 w-12 text-center">ผู้ร่วม</span>
          </div>

          <div className="flex items-center justify-between gap-2 p-2 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-slate-100">
            <img src="https://api.dicebear.com/7.x/notionists/svg?seed=doctor1" alt="Avatar" className="w-9 h-9 rounded-full bg-slate-100 shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="text-[11px] font-bold text-slate-800 truncate">นางสาวกมลฤดี สุขใจ</div>
              <div className="text-[9px] text-slate-500">นักจิตวิทยาโรงเรียน</div>
            </div>
            <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded shrink-0 w-12 text-center">ผู้ร่วม</span>
          </div>

        </div>
      </div>

    </div>
  )
}
