import React from "react"
import { BarChart3, PieChart, Smile, HeartPulse, FileText, Menu } from "lucide-react"

export function MobileCategoryReports() {
  return (
    <div className="px-4 mb-6">
      <h3 className="text-[13px] font-bold text-slate-800 mb-4">รายงานแยกตามประเภท</h3>

      <div className="grid grid-cols-2 gap-3">
        
        {/* Attendance */}
        <div className="bg-white rounded-2xl p-4 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100 flex flex-col hover:border-blue-200 transition-colors cursor-pointer group">
          <div className="flex justify-between items-start mb-3">
            <h4 className="text-[12px] font-bold text-blue-600 leading-tight">รายงานการมาเรียน</h4>
            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
              <BarChart3 className="w-4 h-4 text-blue-500" />
            </div>
          </div>
          <p className="text-[10px] text-slate-500 mt-auto leading-snug">ข้อมูลการมาเรียน<br/>และการขาดเรียน</p>
        </div>

        {/* GPA */}
        <div className="bg-white rounded-2xl p-4 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100 flex flex-col hover:border-orange-200 transition-colors cursor-pointer group">
          <div className="flex justify-between items-start mb-3">
            <h4 className="text-[12px] font-bold text-orange-600 leading-tight">รายงานผลการเรียน</h4>
            <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center shrink-0">
              <PieChart className="w-4 h-4 text-orange-500" />
            </div>
          </div>
          <p className="text-[10px] text-slate-500 mt-auto leading-snug">ผลการเรียนรายวิชา<br/>และ GPA</p>
        </div>

        {/* Behavior */}
        <div className="bg-white rounded-2xl p-4 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100 flex flex-col hover:border-green-200 transition-colors cursor-pointer group">
          <div className="flex justify-between items-start mb-3">
            <h4 className="text-[12px] font-bold text-green-600 leading-tight">รายงานพฤติกรรม</h4>
            <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center shrink-0">
              <Smile className="w-4 h-4 text-green-500" />
            </div>
          </div>
          <p className="text-[10px] text-slate-500 mt-auto leading-snug">พฤติกรรมรายด้าน<br/>และคะแนนรวม</p>
        </div>

        {/* Support */}
        <div className="bg-white rounded-2xl p-4 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100 flex flex-col hover:border-purple-200 transition-colors cursor-pointer group">
          <div className="flex justify-between items-start mb-3">
            <h4 className="text-[12px] font-bold text-purple-600 leading-tight">รายงานการดูแลช่วยเหลือ</h4>
            <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center shrink-0">
              <HeartPulse className="w-4 h-4 text-purple-500" />
            </div>
          </div>
          <p className="text-[10px] text-slate-500 mt-auto leading-snug">การให้ความช่วยเหลือ<br/>และการติดตาม</p>
        </div>

        {/* Overview Summary */}
        <div className="bg-white rounded-2xl p-4 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100 flex flex-col hover:border-red-200 transition-colors cursor-pointer group">
          <div className="flex justify-between items-start mb-3">
            <h4 className="text-[12px] font-bold text-red-500 leading-tight">รายงานสรุปภาพรวม</h4>
            <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center shrink-0">
              <FileText className="w-4 h-4 text-red-500" />
            </div>
          </div>
          <p className="text-[10px] text-slate-500 mt-auto leading-snug">สรุปข้อมูลภาพรวม<br/>ทุกด้าน</p>
        </div>

        {/* Others */}
        <div className="bg-white rounded-2xl p-4 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100 flex flex-col hover:border-slate-300 transition-colors cursor-pointer group">
          <div className="flex justify-between items-start mb-3">
            <h4 className="text-[12px] font-bold text-slate-600 leading-tight">รายงานอื่นๆ</h4>
            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
              <Menu className="w-4 h-4 text-slate-500" />
            </div>
          </div>
          <p className="text-[10px] text-slate-500 mt-auto leading-snug">เอกสารและรายงาน<br/>เพิ่มเติม</p>
        </div>

      </div>
    </div>
  )
}
