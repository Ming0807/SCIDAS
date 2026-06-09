import React from "react"
import { Search, ChevronDown, Plus, Download, FileSpreadsheet } from "lucide-react"

export function AttendanceFilters() {
  return (
    <div className="flex flex-col 2xl:flex-row justify-between items-start 2xl:items-center gap-4 mb-6 flex-wrap">
      
      {/* Left side: Search & Filters */}
      <div className="flex flex-col xl:flex-row items-start xl:items-center gap-3 w-full 2xl:w-auto flex-wrap">
        {/* Search Box */}
        <div className="relative w-full sm:w-72">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="ค้นหาชื่อนักเรียน, เลขประจำตัว, ห้องเรียน"
            className="block w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm"
          />
        </div>

        {/* Grid for filters on mobile */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-40">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-[10px] font-medium text-slate-500">ระดับชั้น</span>
            </div>
            <select className="appearance-none w-full bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-xl pl-16 pr-8 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm">
              <option>ทั้งหมด</option>
              <option>ป.1</option>
              <option>ป.2</option>
              <option>ป.3</option>
              <option>ป.4</option>
              <option>ป.5</option>
              <option>ป.6</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
              <ChevronDown className="h-4 w-4" />
            </div>
          </div>

          <div className="relative w-full sm:w-40">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-[10px] font-medium text-slate-500">ห้องเรียน</span>
            </div>
            <select className="appearance-none w-full bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-xl pl-16 pr-8 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm">
              <option>ทั้งหมด</option>
              <option>ห้อง 1</option>
              <option>ห้อง 2</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
              <ChevronDown className="h-4 w-4" />
            </div>
          </div>

          <div className="relative w-full sm:w-44">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-[10px] font-medium text-slate-500">เดือน</span>
            </div>
            <select className="appearance-none w-full bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-xl pl-12 pr-8 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm">
              <option>พฤษภาคม 2567</option>
              <option>เมษายน 2567</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
              <ChevronDown className="h-4 w-4" />
            </div>
          </div>
        </div>
      </div>

      {/* Right side: Action Buttons */}
      <div className="flex items-center gap-2 w-full 2xl:w-auto flex-wrap pb-1 2xl:pb-0">
        <button className="flex items-center justify-center gap-2 bg-[#1e40af] hover:bg-blue-800 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors shadow-sm whitespace-nowrap">
          <Plus className="h-4 w-4" />
          บันทึกการมาเรียน
        </button>
        
        <button className="flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-emerald-600 border border-emerald-200 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors shadow-sm whitespace-nowrap">
          <FileSpreadsheet className="h-4 w-4 text-emerald-500" />
          นำเข้า Excel
        </button>
        
        <button className="flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors shadow-sm whitespace-nowrap">
          <Download className="h-4 w-4 text-slate-400" />
          ส่งออกรายงาน
        </button>
      </div>

    </div>
  )
}
