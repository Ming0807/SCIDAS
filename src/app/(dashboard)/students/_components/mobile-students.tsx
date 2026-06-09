import React from "react"
import { Menu, Search, Plus, Filter, ArrowUpDown, ChevronRight, MoreVertical, Users, Smile, AlertTriangle, Heart } from "lucide-react"

export function MobileStudents() {
  return (
    <div className="flex flex-col bg-slate-50 min-h-screen font-sans pb-6">
      
      {/* Top Header */}
      <div className="flex items-center justify-between px-5 pt-6 pb-4 bg-white sticky top-0 z-10 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
        <button className="p-1">
          <Menu className="w-6 h-6 text-slate-800" />
        </button>
        <span className="text-lg font-bold text-slate-900">นักเรียน</span>
        <div className="flex items-center gap-3">
          <button className="p-1">
            <Search className="w-5 h-5 text-slate-600" />
          </button>
          <button className="w-7 h-7 bg-indigo-500 rounded-full flex items-center justify-center text-white shadow-md shadow-indigo-200">
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Swipeable Tabs */}
      <div className="bg-white border-b border-slate-100 flex overflow-x-auto no-scrollbar pt-1">
        <button className="px-5 py-3 text-[13px] font-bold text-indigo-600 border-b-2 border-indigo-600 whitespace-nowrap">
          ภาพรวม
        </button>
        <button className="px-5 py-3 text-[13px] font-medium text-slate-500 whitespace-nowrap">
          ทั้งหมด
        </button>
        <button className="px-5 py-3 text-[13px] font-medium text-slate-500 whitespace-nowrap">
          กลุ่มเสี่ยง
        </button>
        <button className="px-5 py-3 text-[13px] font-medium text-slate-500 whitespace-nowrap">
          ต้องดูแล
        </button>
        <button className="px-5 py-3 text-[13px] font-medium text-slate-500 whitespace-nowrap">
          ติดตามพิเศษ
        </button>
      </div>

      {/* Summary Cards */}
      <div className="flex gap-3 overflow-x-auto no-scrollbar px-4 pt-5 pb-3 snap-x">
        
        {/* Main Card */}
        <div className="bg-gradient-to-br from-[#818cf8] to-[#6366f1] text-white rounded-2xl p-4 min-w-[140px] snap-center shadow-lg shadow-indigo-200">
          <Users className="w-6 h-6 mb-2 opacity-90" />
          <div className="text-[11px] font-medium text-indigo-100 mb-0.5">นักเรียนทั้งหมด</div>
          <div className="text-2xl font-bold">642 <span className="text-[11px] font-medium">คน</span></div>
        </div>

        <div className="bg-white border border-emerald-100 rounded-2xl p-4 min-w-[90px] snap-center flex flex-col items-center justify-center">
          <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center mb-1.5">
            <Smile className="w-4 h-4 text-emerald-600" />
          </div>
          <span className="text-[11px] font-bold text-slate-800">ปกติ</span>
          <span className="text-lg font-bold text-slate-900 my-0.5">398</span>
          <span className="text-[9px] text-slate-500">62.0%</span>
        </div>

        <div className="bg-white border border-amber-100 rounded-2xl p-4 min-w-[90px] snap-center flex flex-col items-center justify-center">
          <div className="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center mb-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <span className="text-[11px] font-bold text-slate-800">เฝ้าระวัง</span>
          <span className="text-lg font-bold text-slate-900 my-0.5">156</span>
          <span className="text-[9px] text-slate-500">24.3%</span>
        </div>

        <div className="bg-white border border-red-100 rounded-2xl p-4 min-w-[90px] snap-center flex flex-col items-center justify-center">
          <div className="w-7 h-7 rounded-full bg-red-100 flex items-center justify-center mb-1.5">
            <AlertTriangle className="w-4 h-4 text-red-500" />
          </div>
          <span className="text-[11px] font-bold text-slate-800">กลุ่มเสี่ยง</span>
          <span className="text-lg font-bold text-slate-900 my-0.5">88</span>
          <span className="text-[9px] text-slate-500">13.7%</span>
        </div>

        <div className="bg-white border border-blue-100 rounded-2xl p-4 min-w-[90px] snap-center flex flex-col items-center justify-center">
          <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center mb-1.5">
            <Heart className="w-4 h-4 text-blue-500 fill-blue-500" />
          </div>
          <span className="text-[11px] font-bold text-slate-800">ติดตามพิเศษ</span>
          <span className="text-lg font-bold text-slate-900 my-0.5">32</span>
          <span className="text-[9px] text-slate-500">5.0%</span>
        </div>

      </div>

      {/* Toolbar */}
      <div className="px-4 mt-2 flex gap-2">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="ค้นหาชื่อนักเรียน, เลขประจำตัว..." 
            className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pl-9 pr-3 text-[13px] focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <button className="bg-white border border-slate-200 rounded-xl px-3 py-2.5 flex items-center gap-1.5 text-[13px] font-medium text-slate-600">
          <Filter className="w-3.5 h-3.5 text-indigo-500" />
          ตัวกรอง
        </button>
        <button className="bg-white border border-slate-200 rounded-xl px-3 py-2.5 flex items-center gap-1.5 text-[13px] font-medium text-slate-600">
          <ArrowUpDown className="w-3.5 h-3.5 text-indigo-500" />
          ล่าสุด <ChevronRight className="w-3.5 h-3.5 rotate-90 text-slate-400" />
        </button>
      </div>

      {/* List Header */}
      <div className="px-5 mt-5 mb-3 flex items-center justify-between">
        <span className="text-sm font-medium text-slate-700">ทั้งหมด 642 คน</span>
        <div className="flex bg-slate-200/50 p-0.5 rounded-lg">
          <button className="p-1.5 bg-white rounded-md shadow-sm text-indigo-600">
            <Menu className="w-4 h-4" />
          </button>
          <button className="p-1.5 rounded-md text-slate-400">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
          </button>
        </div>
      </div>

      {/* Student List */}
      <div className="px-4 space-y-3 mb-6">
        
        {/* Card 1 */}
        <div className="bg-white rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100 p-4 relative flex items-start gap-3">
          <div className="text-[11px] font-bold text-indigo-400 bg-indigo-50 w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-1">1</div>
          <img src="https://api.dicebear.com/7.x/notionists/svg?seed=boy1" className="w-12 h-12 rounded-full bg-slate-100 shrink-0" alt="Avatar"/>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <h4 className="font-bold text-slate-800 text-sm truncate pr-2">เด็กชายธนวัฒน์ ใจดี</h4>
              <button className="p-1 -mt-1 -mr-1 text-slate-400"><MoreVertical className="w-4 h-4" /></button>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[11px] text-slate-500">เลขประจำตัว</span>
              <span className="text-[11px] font-medium text-slate-700">12345</span>
            </div>
            <div className="flex items-center justify-between mt-1">
              <div className="text-[11px] text-slate-500">ม.2/1 <span className="mx-1 text-slate-300">|</span> ห้อง 5</div>
              <span className="px-2 py-0.5 bg-red-50 text-red-600 text-[9px] font-bold rounded">กลุ่มเสี่ยง</span>
            </div>
            <div className="mt-3 flex justify-end">
              <button className="flex items-center gap-1 text-[11px] font-bold text-indigo-600 border border-indigo-100 bg-indigo-50/50 px-3 py-1.5 rounded-lg">
                ดูข้อมูล <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100 p-4 relative flex items-start gap-3">
          <div className="text-[11px] font-bold text-indigo-400 bg-indigo-50 w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-1">2</div>
          <img src="https://api.dicebear.com/7.x/notionists/svg?seed=girl1" className="w-12 h-12 rounded-full bg-slate-100 shrink-0" alt="Avatar"/>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <h4 className="font-bold text-slate-800 text-sm truncate pr-2">เด็กหญิงปวารินทร์ จันทร์ดี</h4>
              <button className="p-1 -mt-1 -mr-1 text-slate-400"><MoreVertical className="w-4 h-4" /></button>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[11px] text-slate-500">เลขประจำตัว</span>
              <span className="text-[11px] font-medium text-slate-700">12346</span>
            </div>
            <div className="flex items-center justify-between mt-1">
              <div className="text-[11px] text-slate-500">ม.2/1 <span className="mx-1 text-slate-300">|</span> ห้อง 5</div>
              <span className="px-2 py-0.5 bg-amber-50 text-amber-600 text-[9px] font-bold rounded">เฝ้าระวัง</span>
            </div>
            <div className="mt-3 flex justify-end">
              <button className="flex items-center gap-1 text-[11px] font-bold text-indigo-600 border border-indigo-100 bg-indigo-50/50 px-3 py-1.5 rounded-lg">
                ดูข้อมูล <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100 p-4 relative flex items-start gap-3">
          <div className="text-[11px] font-bold text-indigo-400 bg-indigo-50 w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-1">3</div>
          <img src="https://api.dicebear.com/7.x/notionists/svg?seed=boy2" className="w-12 h-12 rounded-full bg-slate-100 shrink-0" alt="Avatar"/>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <h4 className="font-bold text-slate-800 text-sm truncate pr-2">เด็กชายณัฐวุฒิ ทองคำ</h4>
              <button className="p-1 -mt-1 -mr-1 text-slate-400"><MoreVertical className="w-4 h-4" /></button>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[11px] text-slate-500">เลขประจำตัว</span>
              <span className="text-[11px] font-medium text-slate-700">12347</span>
            </div>
            <div className="flex items-center justify-between mt-1">
              <div className="text-[11px] text-slate-500">ม.2/1 <span className="mx-1 text-slate-300">|</span> ห้อง 5</div>
              <span className="px-2 py-0.5 bg-amber-50 text-amber-600 text-[9px] font-bold rounded">เฝ้าระวัง</span>
            </div>
            <div className="mt-3 flex justify-end">
              <button className="flex items-center gap-1 text-[11px] font-bold text-indigo-600 border border-indigo-100 bg-indigo-50/50 px-3 py-1.5 rounded-lg">
                ดูข้อมูล <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-white rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100 p-4 relative flex items-start gap-3">
          <div className="text-[11px] font-bold text-indigo-400 bg-indigo-50 w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-1">4</div>
          <img src="https://api.dicebear.com/7.x/notionists/svg?seed=girl2" className="w-12 h-12 rounded-full bg-slate-100 shrink-0" alt="Avatar"/>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <h4 className="font-bold text-slate-800 text-sm truncate pr-2">เด็กหญิงกมลชนก พึ่งพา</h4>
              <button className="p-1 -mt-1 -mr-1 text-slate-400"><MoreVertical className="w-4 h-4" /></button>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[11px] text-slate-500">เลขประจำตัว</span>
              <span className="text-[11px] font-medium text-slate-700">12348</span>
            </div>
            <div className="flex items-center justify-between mt-1">
              <div className="text-[11px] text-slate-500">ม.2/1 <span className="mx-1 text-slate-300">|</span> ห้อง 5</div>
              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[9px] font-bold rounded">ปกติ</span>
            </div>
            <div className="mt-3 flex justify-end">
              <button className="flex items-center gap-1 text-[11px] font-bold text-indigo-600 border border-indigo-100 bg-indigo-50/50 px-3 py-1.5 rounded-lg">
                ดูข้อมูล <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {/* Card 5 */}
        <div className="bg-white rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100 p-4 relative flex items-start gap-3">
          <div className="text-[11px] font-bold text-indigo-400 bg-indigo-50 w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-1">5</div>
          <img src="https://api.dicebear.com/7.x/notionists/svg?seed=boy3" className="w-12 h-12 rounded-full bg-slate-100 shrink-0" alt="Avatar"/>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <h4 className="font-bold text-slate-800 text-sm truncate pr-2">เด็กชายพชรพล เก่งกล้า</h4>
              <button className="p-1 -mt-1 -mr-1 text-slate-400"><MoreVertical className="w-4 h-4" /></button>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[11px] text-slate-500">เลขประจำตัว</span>
              <span className="text-[11px] font-medium text-slate-700">12349</span>
            </div>
            <div className="flex items-center justify-between mt-1">
              <div className="text-[11px] text-slate-500">ม.2/1 <span className="mx-1 text-slate-300">|</span> ห้อง 5</div>
              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[9px] font-bold rounded">ปกติ</span>
            </div>
            <div className="mt-3 flex justify-end">
              <button className="flex items-center gap-1 text-[11px] font-bold text-indigo-600 border border-indigo-100 bg-indigo-50/50 px-3 py-1.5 rounded-lg">
                ดูข้อมูล <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {/* Card 6 */}
        <div className="bg-white rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100 p-4 relative flex items-start gap-3">
          <div className="text-[11px] font-bold text-indigo-400 bg-indigo-50 w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-1">6</div>
          <img src="https://api.dicebear.com/7.x/notionists/svg?seed=girl3" className="w-12 h-12 rounded-full bg-slate-100 shrink-0" alt="Avatar"/>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <h4 className="font-bold text-slate-800 text-sm truncate pr-2">เด็กหญิงวรัญญา มีสุข</h4>
              <button className="p-1 -mt-1 -mr-1 text-slate-400"><MoreVertical className="w-4 h-4" /></button>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[11px] text-slate-500">เลขประจำตัว</span>
              <span className="text-[11px] font-medium text-slate-700">12350</span>
            </div>
            <div className="flex items-center justify-between mt-1">
              <div className="text-[11px] text-slate-500">ม.2/1 <span className="mx-1 text-slate-300">|</span> ห้อง 5</div>
              <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[9px] font-bold rounded">ติดตามพิเศษ</span>
            </div>
            <div className="mt-3 flex justify-end">
              <button className="flex items-center gap-1 text-[11px] font-bold text-indigo-600 border border-indigo-100 bg-indigo-50/50 px-3 py-1.5 rounded-lg">
                ดูข้อมูล <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Pagination */}
      <div className="px-4 pb-24 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          <button className="w-8 h-8 flex items-center justify-center bg-white border border-slate-200 rounded-lg text-slate-400">
            <ChevronRight className="w-4 h-4 rotate-180" />
          </button>
          <button className="w-8 h-8 flex items-center justify-center bg-indigo-600 text-white font-bold rounded-lg text-xs shadow-md shadow-indigo-200">
            1
          </button>
          <button className="w-8 h-8 flex items-center justify-center bg-white border border-slate-200 rounded-lg text-slate-600 font-medium text-xs">
            2
          </button>
          <button className="w-8 h-8 flex items-center justify-center bg-white border border-slate-200 rounded-lg text-slate-600 font-medium text-xs">
            3
          </button>
          <span className="w-6 text-center text-slate-400 text-xs">...</span>
          <button className="w-8 h-8 flex items-center justify-center bg-white border border-slate-200 rounded-lg text-slate-600 font-medium text-xs">
            11
          </button>
          <button className="w-8 h-8 flex items-center justify-center bg-white border border-slate-200 rounded-lg text-slate-600">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        
        <button className="bg-white border border-slate-200 rounded-lg px-2 py-1.5 flex items-center gap-1 text-[11px] font-medium text-slate-600">
          แสดง 10 / หน้า <ChevronRight className="w-3 h-3 rotate-90" />
        </button>
      </div>

    </div>
  )
}
