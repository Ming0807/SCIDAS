import React from "react"
import { Menu, Bell, Search, BookOpen, Smile, AlertCircle, Heart, Clock, ChevronRight, Users } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Sidebar } from "@/components/layout/sidebar"

export function MobileDashboard({ role }: { role?: string | null }) {
  return (
    <div className="flex flex-col bg-slate-50 min-h-screen font-sans pb-6">
      
      {/* Top Header */}
      <div className="flex items-center justify-between px-5 pt-6 pb-4 bg-white sticky top-0 z-10 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
        <Sheet>
          <SheetTrigger render={<button className="p-1" />}>
              <Menu className="w-6 h-6 text-slate-800" />
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-[280px]">
            <SheetTitle className="sr-only">เมนูหลัก</SheetTitle>
            <SheetDescription className="sr-only">เมนูนำทางหลักของระบบ</SheetDescription>
            <Sidebar role={role} />
          </SheetContent>
        </Sheet>
        <div className="flex flex-col items-center">
          <span className="text-[17px] font-bold text-slate-900">สวัสดีตอนเช้า👋</span>
          <span className="text-xs text-slate-500 mt-0.5">ครูนันท์ จันทร์จิรา</span>
        </div>
        <button className="p-1 relative">
          <Bell className="w-6 h-6 text-slate-800" />
          <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-red-500 border-2 border-white rounded-full flex items-center justify-center text-[8px] font-bold text-white">3</span>
        </button>
      </div>

      {/* Hero Card */}
      <div className="px-4 mt-2">
        <div className="rounded-xl overflow-hidden bg-gradient-to-br from-[#818cf8] to-[#6366f1] text-white shadow-[0_8px_20px_rgba(99,102,241,0.25)] relative">
          
          {/* Decorative clouds / shapes (Mockup) */}
          <div className="absolute top-4 right-4 opacity-30">
            <svg width="60" height="40" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.5 19C19.9853 19 22 16.9853 22 14.5C22 12.1166 20.147 10.1652 17.8047 10.0125C17.4093 7.18579 14.9786 5 12 5C9.28828 5 6.99343 6.91499 6.22384 9.46781C3.84411 9.68962 2 11.6669 2 14.125C2 16.8174 4.18264 19 6.875 19H17.5Z"/>
            </svg>
          </div>
          
          <div className="p-5 flex items-center gap-4">
            <div className="relative">
              <img src="https://api.dicebear.com/7.x/notionists/svg?seed=teacher1" className="w-16 h-16 rounded-full bg-indigo-200 border-2 border-white/20" alt="Teacher"/>
              <span className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-400 border-2 border-indigo-500 rounded-full"></span>
            </div>
            <div>
              <h2 className="text-xl font-bold mb-1">ดูแลนักเรียนด้วยใจ</h2>
              <p className="text-[11px] text-indigo-100 leading-snug opacity-90 max-w-[180px]">ทุกข้อมูล สำคัญต่อการพัฒนา<br/>นักเรียนของเรา</p>
            </div>
          </div>
          
          <div className="bg-indigo-900/20 backdrop-blur-sm grid grid-cols-3 divide-x divide-white/10 py-3 mt-1">
            <div className="flex flex-col items-center justify-center">
              <span className="text-[10px] text-indigo-100 mb-0.5 font-medium flex items-center gap-1"><Users className="w-3 h-3"/> นักเรียนทั้งหมด</span>
              <span className="font-bold text-sm">642 คน</span>
            </div>
            <div className="flex flex-col items-center justify-center">
              <span className="text-[10px] text-indigo-100 mb-0.5 font-medium flex items-center gap-1"><svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg> ครูในระบบ</span>
              <span className="font-bold text-sm">28 คน</span>
            </div>
            <div className="flex flex-col items-center justify-center">
              <span className="text-[10px] text-indigo-100 mb-0.5 font-medium flex items-center gap-1"><svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/></svg> ภาคเรียนที่</span>
              <span className="font-bold text-sm">1/2567</span>
            </div>
          </div>
        </div>
      </div>

      {/* ภาพรวมสถานการณ์ */}
      <div className="mt-6 px-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-bold text-slate-800 text-[15px]">ภาพรวมสถานการณ์</h3>
          <span className="text-xs text-blue-600 flex items-center">ดูทั้งหมด <ChevronRight className="w-3 h-3 ml-0.5"/></span>
        </div>
        
        <div className="grid grid-cols-4 gap-2.5 overflow-x-auto no-scrollbar pb-2 -mx-4 px-4 snap-x">
          
          <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-3 flex flex-col items-center min-w-[90px] snap-center">
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-2">
              <BookOpen className="w-4 h-4" />
            </div>
            <span className="text-[10px] text-slate-600 font-medium text-center">ผลการเรียน</span>
            <span className="font-bold text-[15px] text-slate-800 mt-0.5">86.2%</span>
            <span className="text-[9px] text-emerald-600 font-medium">ผ่านเกณฑ์</span>
          </div>

          <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-3 flex flex-col items-center min-w-[90px] snap-center">
            <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-500 flex items-center justify-center mb-2">
              <Smile className="w-4 h-4" />
            </div>
            <span className="text-[10px] text-slate-600 font-medium text-center">พฤติกรรม</span>
            <span className="font-bold text-[15px] text-slate-800 mt-0.5">78.4%</span>
            <span className="text-[9px] text-emerald-600 font-medium">ปกติ</span>
          </div>

          <div className="bg-red-50/50 border border-red-100 rounded-xl p-3 flex flex-col items-center min-w-[90px] snap-center">
            <div className="w-8 h-8 rounded-full bg-red-100 text-red-500 flex items-center justify-center mb-2">
              <AlertCircle className="w-4 h-4" />
            </div>
            <span className="text-[10px] text-slate-600 font-medium text-center">กลุ่มเสี่ยง</span>
            <span className="font-bold text-[15px] text-slate-800 mt-0.5">38 <span className="text-[10px] font-normal">คน</span></span>
            <span className="text-[9px] text-slate-500 font-medium">5.92%</span>
          </div>

          <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-3 flex flex-col items-center min-w-[90px] snap-center">
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-500 flex items-center justify-center mb-2">
              <Heart className="w-4 h-4 fill-blue-500" />
            </div>
            <span className="text-[10px] text-slate-600 font-medium text-center">ได้รับความช่วยเหลือ</span>
            <span className="font-bold text-[15px] text-slate-800 mt-0.5">112 <span className="text-[10px] font-normal">คน</span></span>
            <span className="text-[9px] text-slate-500 font-medium">17.45%</span>
          </div>

        </div>
      </div>

      {/* การแจ้งเตือน */}
      <div className="mt-5 px-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-bold text-slate-800 text-[15px]">การแจ้งเตือน</h3>
          <span className="text-xs text-blue-600 flex items-center">ดูทั้งหมด <ChevronRight className="w-3 h-3 ml-0.5"/></span>
        </div>
        
        <div className="bg-white rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] p-1 border border-slate-100">
          
          <div className="flex gap-3 p-3 items-start relative">
            <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center shrink-0">
              <AlertCircle className="w-4 h-4 text-red-500" />
            </div>
            <div className="flex-1 pr-16">
              <h4 className="text-xs font-bold text-slate-800">นักเรียนกลุ่มเสี่ยงใหม่</h4>
              <p className="text-[10px] text-slate-500 mt-0.5 leading-snug">พบผู้เรียนกลุ่มเสี่ยง 5 คน จากการวิเคราะห์ล่าสุด</p>
            </div>
            <div className="absolute right-3 top-3 flex items-center gap-1">
              <span className="text-[10px] text-slate-400">10 นาทีที่แล้ว</span>
              <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
            </div>
          </div>

          <div className="h-px bg-slate-50 mx-4"></div>

          <div className="flex gap-3 p-3 items-start relative">
            <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 3v18h18"/><path d="M18 9l-5 5-3-3-4 4"/></svg>
            </div>
            <div className="flex-1 pr-16">
              <h4 className="text-xs font-bold text-slate-800">ผลการเรียนต่ำกว่าเกณฑ์</h4>
              <p className="text-[10px] text-slate-500 mt-0.5 leading-snug">มีนักเรียน 24 คน ที่มีผลการเรียนต่ำกว่าเกณฑ์</p>
            </div>
            <div className="absolute right-3 top-3 flex items-center gap-1">
              <span className="text-[10px] text-slate-400">1 ชั่วโมงที่แล้ว</span>
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            </div>
          </div>

          <div className="h-px bg-slate-50 mx-4"></div>

          <div className="flex gap-3 p-3 items-start relative">
            <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><path d="M8 10h.01"/><path d="M12 10h.01"/><path d="M16 10h.01"/></svg>
            </div>
            <div className="flex-1 pr-16">
              <h4 className="text-xs font-bold text-slate-800">บันทึกการให้ความช่วยเหลือ</h4>
              <p className="text-[10px] text-slate-500 mt-0.5 leading-snug">คุณมีบันทึกการช่วยเหลือที่รอทำการ 3 รายการ</p>
            </div>
            <div className="absolute right-3 top-3 flex items-center gap-1">
              <span className="text-[10px] text-slate-400">2 ชั่วโมงที่แล้ว</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            </div>
          </div>

          <div className="h-px bg-slate-50 mx-4"></div>

          <div className="flex gap-3 p-3 items-start relative">
            <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 text-purple-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
            </div>
            <div className="flex-1 pr-16">
              <h4 className="text-xs font-bold text-slate-800">แผนพัฒนารายบุคคลใกล้หมดอายุ</h4>
              <p className="text-[10px] text-slate-500 mt-0.5 leading-snug">มีแผนพัฒนารายบุคคล 7 แผน จะหมดอายุในอีก 7 วัน</p>
            </div>
            <div className="absolute right-3 top-3 flex items-center gap-1">
              <span className="text-[10px] text-slate-400">1 วันที่แล้ว</span>
              <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
            </div>
          </div>

        </div>
      </div>

      {/* นักเรียนที่ต้องติดตาม */}
      <div className="mt-5 px-4 mb-20">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-bold text-slate-800 text-[15px]">นักเรียนที่ต้องติดตาม</h3>
          <span className="text-xs text-blue-600 flex items-center">ดูทั้งหมด <ChevronRight className="w-3 h-3 ml-0.5"/></span>
        </div>
        
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-50">
          
          <div className="flex items-center gap-3 p-3.5 relative hover:bg-slate-50 transition-colors">
            <img src="https://api.dicebear.com/7.x/notionists/svg?seed=boy1" className="w-11 h-11 rounded-full bg-slate-100" alt="Avatar"/>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-0.5">
                <h4 className="text-sm font-bold text-slate-800">เด็กชายธนวัฒน์ ใจดี</h4>
                <span className="px-1.5 py-0.5 bg-red-50 text-red-600 text-[9px] font-bold rounded">กลุ่มเสี่ยง</span>
              </div>
              <div className="text-[11px] text-slate-500 flex items-center gap-2">
                <span>ม.2/1 เลขที่ 5</span>
                <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                <span>ผลการเรียน</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300" />
          </div>

          <div className="flex items-center gap-3 p-3.5 relative hover:bg-slate-50 transition-colors">
            <img src="https://api.dicebear.com/7.x/notionists/svg?seed=girl1" className="w-11 h-11 rounded-full bg-slate-100" alt="Avatar"/>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-0.5">
                <h4 className="text-sm font-bold text-slate-800">เด็กหญิงปวารินทร์ จันทร์ดี</h4>
                <span className="px-1.5 py-0.5 bg-amber-50 text-amber-600 text-[9px] font-bold rounded">เฝ้าระวัง</span>
              </div>
              <div className="text-[11px] text-slate-500 flex items-center gap-2">
                <span>ม.2/4 เลขที่ 21</span>
                <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                <span>ผลการเรียน</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300" />
          </div>

          <div className="flex items-center gap-3 p-3.5 relative hover:bg-slate-50 transition-colors">
            <img src="https://api.dicebear.com/7.x/notionists/svg?seed=boy2" className="w-11 h-11 rounded-full bg-slate-100" alt="Avatar"/>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-0.5">
                <h4 className="text-sm font-bold text-slate-800">เด็กชายณัฐวุฒิ ทองคำ</h4>
                <span className="px-1.5 py-0.5 bg-amber-50 text-amber-600 text-[9px] font-bold rounded">เฝ้าระวัง</span>
              </div>
              <div className="text-[11px] text-slate-500 flex items-center gap-2">
                <span>ม.3/1 เลขที่ 3</span>
                <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                <span>พฤติกรรม</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300" />
          </div>

        </div>
      </div>

    </div>
  )
}
