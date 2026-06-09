import React from "react"
import { Search, ChevronDown, Plus, Upload, Download, Users } from "lucide-react"

export function StudentFilters() {
  return (
    <div className="bg-white rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] border border-slate-100 p-4 mb-4 sm:mb-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        
        {/* Left side: Search & Filters */}
        <div className="flex flex-col sm:flex-row flex-wrap items-center gap-3 w-full lg:w-auto">
          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="ค้นหาชื่อนักเรียน, เลขประจำตัว..."
              className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow bg-slate-50"
            />
          </div>

          <div className="h-6 w-px bg-slate-200 hidden sm:block mx-1"></div>

          {/* Grid for filters on mobile */}
          <div className="grid grid-cols-3 gap-2 w-full sm:w-auto">
            {/* ชั้นเรียน Filter */}
            <div className="relative w-full">
              <select className="appearance-none w-full bg-white border border-slate-200 text-slate-700 text-xs sm:text-sm rounded-lg pl-2 sm:pl-3 pr-8 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>ชั้นเรียนทั้งหมด</option>
                <option>ป.1</option>
                <option>ป.2</option>
                <option>ป.3</option>
                <option>ป.4</option>
                <option>ป.5</option>
                <option>ป.6</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4" />
              </div>
            </div>

            {/* ห้องเรียน Filter */}
            <div className="relative w-full">
              <select className="appearance-none w-full bg-white border border-slate-200 text-slate-700 text-xs sm:text-sm rounded-lg pl-2 sm:pl-3 pr-8 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>ห้องเรียนทั้งหมด</option>
                <option>ห้อง 1</option>
                <option>ห้อง 2</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4" />
              </div>
            </div>

            {/* สถานะ Filter */}
            <div className="relative w-full">
              <select className="appearance-none w-full bg-white border border-slate-200 text-slate-700 text-xs sm:text-sm rounded-lg pl-2 sm:pl-3 pr-8 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>สถานะทั้งหมด</option>
                <option>ปกติ</option>
                <option>ติดตาม</option>
                <option>เสี่ยงสูง</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4" />
              </div>
            </div>
          </div>
        </div>

        {/* Right side: Action Buttons */}
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 w-full lg:w-auto">
          <button className="flex justify-center items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors">
            <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="truncate">เพิ่มนักเรียน</span>
          </button>
          
          <button className="flex justify-center items-center gap-2 bg-white hover:bg-slate-50 text-blue-600 border border-blue-100 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors">
            <Upload className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            นำเข้า
          </button>
          
          <button className="flex justify-center items-center gap-2 bg-white hover:bg-slate-50 text-emerald-600 border border-emerald-100 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors">
            <Download className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            ส่งออก
          </button>

          <button className="flex justify-center items-center gap-2 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-100 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors">
            <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="truncate">จัดการกลุ่ม</span>
          </button>
        </div>

      </div>
    </div>
  )
}
