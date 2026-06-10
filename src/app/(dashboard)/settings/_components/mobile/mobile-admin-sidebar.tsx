import React from "react"
import { Home, Users, Building, UserCheck, Key, Settings, BarChart2, Bell, Cloud, Shield, Database, FileText, FileSpreadsheet, Newspaper, Link as LinkIcon, Code, History, Monitor, ChevronRight } from "lucide-react"

export function MobileAdminSidebar() {
  return (
    <div className="w-full flex flex-col gap-6 py-4">
      
      {/* ระบบหลัก */}
      <div className="flex flex-col">
        <span className="text-[11px] font-bold text-slate-400 px-4 mb-2">ระบบหลัก</span>
        <div className="flex flex-col">
          <button className="flex items-center gap-3 px-4 py-2.5 text-slate-600 hover:bg-slate-50 transition-colors text-[13px] font-medium">
            <Home className="w-4 h-4 text-slate-400" /> แดชบอร์ด
          </button>
          <button className="flex items-center gap-3 px-4 py-2.5 text-slate-600 hover:bg-slate-50 transition-colors text-[13px] font-medium">
            <UserCheck className="w-4 h-4 text-slate-400" /> จัดการผู้ใช้
          </button>
          <button className="flex items-center gap-3 px-4 py-2.5 text-slate-600 hover:bg-slate-50 transition-colors text-[13px] font-medium">
            <Building className="w-4 h-4 text-slate-400" /> จัดการโรงเรียน
          </button>
          <button className="flex items-center gap-3 px-4 py-2.5 text-slate-600 hover:bg-slate-50 transition-colors text-[13px] font-medium">
            <Users className="w-4 h-4 text-slate-400" /> จัดการนักเรียน/ครู
          </button>
          <button className="flex items-center gap-3 px-4 py-2.5 text-slate-600 hover:bg-slate-50 transition-colors text-[13px] font-medium">
            <Key className="w-4 h-4 text-slate-400" /> บทบาทและสิทธิ์
          </button>
        </div>
      </div>

      {/* การตั้งค่าระบบ */}
      <div className="flex flex-col">
        <span className="text-[11px] font-bold text-slate-400 px-4 mb-2">การตั้งค่าระบบ</span>
        <div className="flex flex-col relative">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-600 rounded-r-md"></div>
          <button className="flex items-center gap-3 px-4 py-2.5 bg-indigo-50 text-indigo-700 text-[13px] font-bold">
            <Settings className="w-4 h-4 text-indigo-600" /> การตั้งค่าพื้นฐาน
          </button>
          <button className="flex items-center gap-3 px-4 py-2.5 text-slate-600 hover:bg-slate-50 transition-colors text-[13px] font-medium">
            <BarChart2 className="w-4 h-4 text-slate-400" /> ตั้งค่าการประเมิน
          </button>
          <button className="flex items-center gap-3 px-4 py-2.5 text-slate-600 hover:bg-slate-50 transition-colors text-[13px] font-medium">
            <Bell className="w-4 h-4 text-slate-400" /> ตั้งค่าการแจ้งเตือน
          </button>
          <button className="flex items-center gap-3 px-4 py-2.5 text-slate-600 hover:bg-slate-50 transition-colors text-[13px] font-medium">
            <Cloud className="w-4 h-4 text-slate-400" /> ตั้งค่าการสำรองข้อมูล
          </button>
          <button className="flex items-center gap-3 px-4 py-2.5 text-slate-600 hover:bg-slate-50 transition-colors text-[13px] font-medium">
            <Shield className="w-4 h-4 text-slate-400" /> ตั้งค่าความปลอดภัย
          </button>
        </div>
      </div>

      {/* เนื้อหาและข้อมูล */}
      <div className="flex flex-col">
        <span className="text-[11px] font-bold text-slate-400 px-4 mb-2">เนื้อหาและข้อมูล</span>
        <div className="flex flex-col">
          <button className="flex items-center gap-3 px-4 py-2.5 text-slate-600 hover:bg-slate-50 transition-colors text-[13px] font-medium">
            <Database className="w-4 h-4 text-slate-400" /> จัดการข้อมูลอ้างอิง
          </button>
          <button className="flex items-center gap-3 px-4 py-2.5 text-slate-600 hover:bg-slate-50 transition-colors text-[13px] font-medium">
            <FileText className="w-4 h-4 text-slate-400" /> จัดการแบบประเมิน
          </button>
          <button className="flex items-center gap-3 px-4 py-2.5 text-slate-600 hover:bg-slate-50 transition-colors text-[13px] font-medium">
            <Newspaper className="w-4 h-4 text-slate-400" /> จัดการข่าวสาร/ประกาศ
          </button>
          <button className="flex items-center gap-3 px-4 py-2.5 text-slate-600 hover:bg-slate-50 transition-colors text-[13px] font-medium">
            <FileSpreadsheet className="w-4 h-4 text-slate-400" /> จัดการไฟล์เอกสาร
          </button>
        </div>
      </div>

      {/* ระบบและการเชื่อมต่อ */}
      <div className="flex flex-col">
        <span className="text-[11px] font-bold text-slate-400 px-4 mb-2">ระบบและการเชื่อมต่อ</span>
        <div className="flex flex-col">
          <button className="flex items-center gap-3 px-4 py-2.5 text-slate-600 hover:bg-slate-50 transition-colors text-[13px] font-medium">
            <LinkIcon className="w-4 h-4 text-slate-400" /> เชื่อมต่อระบบภายนอก
          </button>
          <button className="flex items-center gap-3 px-4 py-2.5 text-slate-600 hover:bg-slate-50 transition-colors text-[13px] font-medium">
            <Code className="w-4 h-4 text-slate-400" /> ตั้งค่า API
          </button>
          <button className="flex items-center gap-3 px-4 py-2.5 text-slate-600 hover:bg-slate-50 transition-colors text-[13px] font-medium">
            <Database className="w-4 h-4 text-slate-400" /> บันทึกการใช้งานระบบ
          </button>
        </div>
      </div>

      {/* อื่นๆ */}
      <div className="flex flex-col mb-4">
        <span className="text-[11px] font-bold text-slate-400 px-4 mb-2">อื่นๆ</span>
        <div className="flex flex-col">
          <button className="flex items-center gap-3 px-4 py-2.5 text-slate-600 hover:bg-slate-50 transition-colors text-[13px] font-medium">
            <Monitor className="w-4 h-4 text-slate-400" /> ตั้งค่าการแสดงผล
          </button>
          <button className="flex items-center gap-3 px-4 py-2.5 text-slate-600 hover:bg-slate-50 transition-colors text-[13px] font-medium">
            <History className="w-4 h-4 text-slate-400" /> ประวัติการเปลี่ยนแปลง
          </button>
        </div>
      </div>

      {/* Help Center Card */}
      <div className="mx-4 bg-indigo-50 rounded-xl p-4 border border-indigo-100 flex flex-col relative overflow-hidden">
        <div className="relative z-10 w-2/3">
          <h4 className="text-[13px] font-bold text-indigo-900 mb-1">ศูนย์ช่วยเหลือแอดมิน</h4>
          <p className="text-[10px] text-indigo-700/80 mb-3 leading-snug">คู่มือการใช้งานสำหรับแอดมิน<br/>และวิดีโอสอนการใช้งาน</p>
          <button className="flex items-center gap-1 text-[11px] font-bold text-indigo-600 bg-white px-3 py-1.5 rounded-lg border border-indigo-200 hover:bg-indigo-50 transition-colors w-max shadow-sm">
            ดูเพิ่มเติม
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="absolute -bottom-2 -right-2 w-20 h-24 opacity-80">
           <img src="https://api.dicebear.com/7.x/notionists/svg?seed=helpdesk" alt="Help" className="w-full h-full object-cover" />
        </div>
      </div>

    </div>
  )
}
