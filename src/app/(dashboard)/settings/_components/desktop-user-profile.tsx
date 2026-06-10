import React from "react"
import { Mail, Phone, Clock, Edit2 } from "lucide-react"

export function DesktopUserProfile() {
  return (
    <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm mb-6 relative">
      <h3 className="text-[14px] font-bold text-slate-800 mb-6">ข้อมูลบัญชีผู้ใช้</h3>
      
      <button className="absolute top-6 right-6 p-1.5 bg-indigo-50 text-indigo-600 rounded-full hover:bg-indigo-100 transition-colors">
        <Edit2 className="w-3.5 h-3.5" />
      </button>

      <div className="flex flex-col items-center mb-6">
        <div className="w-20 h-20 rounded-full bg-slate-100 border-4 border-white shadow-sm overflow-hidden mb-4">
          <img src="https://api.dicebear.com/7.x/notionists/svg?seed=teacher" alt="Profile" className="w-full h-full object-cover" />
        </div>
        <h4 className="text-[16px] font-bold text-slate-800">นางสาวจันทร์จิรา พรมดี</h4>
        <span className="text-[13px] text-slate-500 mb-1">ครูที่ปรึกษา</span>
        <span className="text-[12px] text-slate-400">โรงเรียนตัวอย่างวิทยา</span>
      </div>

      <div className="flex flex-col gap-4 text-[12px]">
        <div className="flex items-center gap-3">
          <Mail className="w-4 h-4 text-slate-400 shrink-0" />
          <span className="text-slate-500 w-24">อีเมล</span>
          <span className="text-slate-800 font-medium truncate">janjira.p@school.ac.th</span>
        </div>
        <div className="flex items-center gap-3">
          <Phone className="w-4 h-4 text-slate-400 shrink-0" />
          <span className="text-slate-500 w-24">เบอร์โทรศัพท์</span>
          <span className="text-slate-800 font-medium">081-234-5678</span>
        </div>
        <div className="flex items-center gap-3">
          <Clock className="w-4 h-4 text-slate-400 shrink-0" />
          <span className="text-slate-500 w-24">เข้าสู่ระบบล่าสุด</span>
          <span className="text-slate-800 font-medium">20 พ.ค. 2567 09:15 น.</span>
        </div>
      </div>
    </div>
  )
}
