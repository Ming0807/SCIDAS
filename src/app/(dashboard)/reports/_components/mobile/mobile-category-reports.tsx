import React from "react"
import Link from "next/link"
import { BarChart3, PieChart, Smile, HeartPulse, FileText, Menu } from "lucide-react"

export function MobileCategoryReports() {
  return (
    <div className="px-4 mb-6">
      <h3 className="text-sm font-bold text-foreground mb-4">รายงานแยกตามประเภท</h3>

      <div className="grid grid-cols-2 gap-3">
        
        {/* Attendance */}
        <Link href="/reports" className="bg-card rounded-2xl p-4 border border-border shadow-xs flex flex-col hover:border-blue-300 dark:hover:border-blue-700 transition-colors cursor-pointer group block">
          <div className="flex justify-between items-start mb-3">
            <h4 className="text-xs font-bold text-blue-600 dark:text-blue-400 leading-tight">รายงานการมาเรียน</h4>
            <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center shrink-0">
              <BarChart3 className="w-4 h-4 text-blue-500" />
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-auto leading-snug">ข้อมูลการมาเรียน<br/>และการขาดเรียน</p>
        </Link>

        {/* GPA */}
        <Link href="/reports" className="bg-card rounded-2xl p-4 border border-border shadow-xs flex flex-col hover:border-orange-300 dark:hover:border-orange-700 transition-colors cursor-pointer group block">
          <div className="flex justify-between items-start mb-3">
            <h4 className="text-xs font-bold text-orange-600 dark:text-orange-400 leading-tight">รายงานผลการเรียน</h4>
            <div className="w-8 h-8 rounded-full bg-orange-50 dark:bg-orange-950/40 flex items-center justify-center shrink-0">
              <PieChart className="w-4 h-4 text-orange-500" />
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-auto leading-snug">ผลการเรียนรายวิชา<br/>และ GPA</p>
        </Link>

        {/* Behavior */}
        <Link href="/reports" className="bg-card rounded-2xl p-4 border border-border shadow-xs flex flex-col hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors cursor-pointer group block">
          <div className="flex justify-between items-start mb-3">
            <h4 className="text-xs font-bold text-emerald-600 dark:text-emerald-400 leading-tight">รายงานพฤติกรรม</h4>
            <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center shrink-0">
              <Smile className="w-4 h-4 text-emerald-500" />
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-auto leading-snug">พฤติกรรมรายด้าน<br/>และคะแนนรวม</p>
        </Link>

        {/* Support */}
        <Link href="/reports" className="bg-card rounded-2xl p-4 border border-border shadow-xs flex flex-col hover:border-purple-300 dark:hover:border-purple-700 transition-colors cursor-pointer group block">
          <div className="flex justify-between items-start mb-3">
            <h4 className="text-xs font-bold text-purple-600 dark:text-purple-400 leading-tight">รายงานการดูแลช่วยเหลือ</h4>
            <div className="w-8 h-8 rounded-full bg-purple-50 dark:bg-purple-950/40 flex items-center justify-center shrink-0">
              <HeartPulse className="w-4 h-4 text-purple-500" />
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-auto leading-snug">การให้ความช่วยเหลือ<br/>และการติดตาม</p>
        </Link>

        {/* Overview Summary */}
        <Link href="/reports" className="bg-card rounded-2xl p-4 border border-border shadow-xs flex flex-col hover:border-rose-300 dark:hover:border-rose-700 transition-colors cursor-pointer group block">
          <div className="flex justify-between items-start mb-3">
            <h4 className="text-xs font-bold text-rose-500 dark:text-rose-400 leading-tight">รายงานสรุปภาพรวม</h4>
            <div className="w-8 h-8 rounded-full bg-rose-50 dark:bg-rose-950/40 flex items-center justify-center shrink-0">
              <FileText className="w-4 h-4 text-rose-500" />
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-auto leading-snug">สรุปข้อมูลภาพรวม<br/>ทุกด้าน</p>
        </Link>

        {/* Others */}
        <Link href="/reports" className="bg-card rounded-2xl p-4 border border-border shadow-xs flex flex-col hover:border-border transition-colors cursor-pointer group block">
          <div className="flex justify-between items-start mb-3">
            <h4 className="text-xs font-bold text-foreground leading-tight">รายงานอื่นๆ</h4>
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
              <Menu className="w-4 h-4 text-muted-foreground" />
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-auto leading-snug">เอกสารและรายงาน<br/>เพิ่มเติม</p>
        </Link>

      </div>
    </div>
  )
}
