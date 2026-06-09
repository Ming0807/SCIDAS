import React from "react"
import { Menu, Search, Bell, Users, Building, HardDrive, ArrowUp } from "lucide-react"

export function MobileAdminHeader() {
  return (
    <div className="bg-white sticky top-0 z-20 shadow-[0_2px_10px_rgba(0,0,0,0.02)] pt-6 pb-4">
      
      {/* Header Bar */}
      <div className="flex items-center justify-between px-4 pb-4">
        <button className="p-2 -ml-2 text-slate-800">
          <Menu className="w-6 h-6" />
        </button>
        <div className="flex flex-col items-center">
          <span className="text-[15px] font-bold text-slate-900 leading-tight">การตั้งค่า (สำหรับแอดมิน)</span>
          <span className="text-[11px] text-slate-500">จัดการระบบและกำหนดค่าแพลตฟอร์ม</span>
        </div>
        <div className="flex items-center gap-2 -mr-2">
          <button className="p-2 text-slate-600">
            <Search className="w-5 h-5" />
          </button>
          <div className="relative p-2 text-slate-600">
            <Bell className="w-5 h-5" />
            <div className="absolute top-1 right-1 bg-red-500 text-white text-[9px] font-bold px-1 rounded-full border border-white">
              12
            </div>
          </div>
        </div>
      </div>

      {/* Admin Profile & Stats Banner */}
      <div className="mx-4 bg-gradient-to-br from-indigo-50 to-[#e0e7ff] rounded-2xl p-4 border border-indigo-100 flex flex-col gap-4">
        
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-white border-2 border-white shadow-sm overflow-hidden flex items-center justify-center relative">
             <img src="https://api.dicebear.com/7.x/notionists/svg?seed=admin" alt="Admin" className="w-full h-full object-cover" />
             <div className="absolute bottom-0 right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-[15px] font-bold text-slate-900">สวัสดีค่ะ แอดมิน</h2>
              <span className="px-2 py-0.5 bg-indigo-500 text-white text-[9px] font-bold rounded-md shadow-sm">Super Admin</span>
            </div>
            <span className="text-[11px] text-slate-600 font-medium">ดูแลระบบทั้งหมด</span>
            <span className="text-[10px] text-slate-500">สิทธิ์การเข้าถึง: เต็มรูปแบบ</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          
          {/* Stat 1 */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-2.5 border border-white flex flex-col justify-between relative overflow-hidden">
            <div className="flex items-center gap-1.5 mb-1.5 text-indigo-500">
              <Users className="w-3.5 h-3.5" />
              <span className="text-[10px] font-bold text-slate-700">ผู้ใช้ทั้งหมด</span>
            </div>
            <span className="text-[16px] font-bold text-slate-900 leading-tight">2,458</span>
            <div className="flex items-center gap-0.5 text-green-600 mt-0.5">
              <ArrowUp className="w-2.5 h-2.5" />
              <span className="text-[9px] font-bold">12% <span className="text-slate-400 font-medium">จากเดือนก่อน</span></span>
            </div>
          </div>

          {/* Stat 2 */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-2.5 border border-white flex flex-col justify-between relative overflow-hidden">
            <div className="flex items-center gap-1.5 mb-1.5 text-blue-500">
              <Building className="w-3.5 h-3.5" />
              <span className="text-[10px] font-bold text-slate-700">โรงเรียนทั้งหมด</span>
            </div>
            <span className="text-[16px] font-bold text-slate-900 leading-tight">56</span>
            <div className="flex items-center gap-0.5 text-green-600 mt-0.5">
              <ArrowUp className="w-2.5 h-2.5" />
              <span className="text-[9px] font-bold">5 แห่ง</span>
            </div>
          </div>

          {/* Stat 3 */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-2.5 border border-white flex flex-col justify-between relative overflow-hidden">
            <div className="flex items-center gap-1.5 mb-1.5 text-indigo-400">
              <HardDrive className="w-3.5 h-3.5" />
              <span className="text-[10px] font-bold text-slate-700">ข้อมูลทั้งหมด</span>
            </div>
            <span className="text-[16px] font-bold text-slate-900 leading-tight">18.7 GB</span>
            <div className="flex items-center gap-0.5 text-slate-500 mt-0.5">
              <span className="text-[9px]">ใช้งาน 45%</span>
            </div>
          </div>

        </div>

      </div>

    </div>
  )
}
