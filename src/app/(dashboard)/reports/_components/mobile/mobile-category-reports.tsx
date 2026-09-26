import React from "react"
import Link from "next/link"
import { BarChart3, PieChart, Smile, HeartPulse, FileText, Menu } from "lucide-react"
import { cn } from "@/lib/utils"

const categories = [
  {
    value: "attendance_report",
    label: "รายงานการมาเรียน",
    description: "ข้อมูลการมาเรียนและการขาดเรียน",
    icon: BarChart3,
    accent: "text-blue-600 dark:text-blue-400",
    iconWrap: "bg-blue-50 dark:bg-blue-950/40",
    iconColor: "text-blue-500",
    hoverBorder: "hover:border-blue-300 dark:hover:border-blue-700",
    activeRing: "border-blue-400 ring-2 ring-blue-200 dark:ring-blue-900",
  },
  {
    value: "academic_report",
    label: "รายงานผลการเรียน",
    description: "ผลการเรียนรายวิชาและ GPA",
    icon: PieChart,
    accent: "text-orange-600 dark:text-orange-400",
    iconWrap: "bg-orange-50 dark:bg-orange-950/40",
    iconColor: "text-orange-500",
    hoverBorder: "hover:border-orange-300 dark:hover:border-orange-700",
    activeRing: "border-orange-400 ring-2 ring-orange-200 dark:ring-orange-900",
  },
  {
    value: "behavior_summary",
    label: "รายงานพฤติกรรม",
    description: "พฤติกรรมรายด้านและคะแนนรวม",
    icon: Smile,
    accent: "text-emerald-600 dark:text-emerald-400",
    iconWrap: "bg-emerald-50 dark:bg-emerald-950/40",
    iconColor: "text-emerald-500",
    hoverBorder: "hover:border-emerald-300 dark:hover:border-emerald-700",
    activeRing: "border-emerald-400 ring-2 ring-emerald-200 dark:ring-emerald-900",
  },
  {
    value: "support_summary",
    label: "รายงานการดูแลช่วยเหลือ",
    description: "การให้ความช่วยเหลือและการติดตาม",
    icon: HeartPulse,
    accent: "text-purple-600 dark:text-purple-400",
    iconWrap: "bg-purple-50 dark:bg-purple-950/40",
    iconColor: "text-purple-500",
    hoverBorder: "hover:border-purple-300 dark:hover:border-purple-700",
    activeRing: "border-purple-400 ring-2 ring-purple-200 dark:ring-purple-900",
  },
  {
    value: "comprehensive",
    label: "รายงานสรุปภาพรวม",
    description: "สรุปข้อมูลภาพรวมทุกด้าน",
    icon: FileText,
    accent: "text-rose-500 dark:text-rose-400",
    iconWrap: "bg-rose-50 dark:bg-rose-950/40",
    iconColor: "text-rose-500",
    hoverBorder: "hover:border-rose-300 dark:hover:border-rose-700",
    activeRing: "border-rose-400 ring-2 ring-rose-200 dark:ring-rose-900",
  },
]

export function MobileCategoryReports({ activeType }: { activeType?: string | null }) {
  return (
    <div className="px-4 mb-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-bold text-foreground">รายงานแยกตามประเภท</h3>
        {activeType ? (
          <Link
            href="/reports"
            className="text-xs font-semibold text-primary hover:underline"
          >
            ล้างตัวกรอง
          </Link>
        ) : null}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {categories.map((cat) => {
          const Icon = cat.icon
          const isActive = activeType === cat.value
          return (
            <Link
              key={cat.value}
              href={isActive ? "/reports" : `/reports?type=${cat.value}`}
              aria-current={isActive ? "true" : undefined}
              className={cn(
                "bg-card rounded-2xl p-4 border border-border shadow-xs flex flex-col transition-colors cursor-pointer group",
                cat.hoverBorder,
                isActive && cat.activeRing,
              )}
            >
              <div className="flex justify-between items-start mb-3">
                <h4 className={cn("text-xs font-bold leading-tight", cat.accent)}>
                  {cat.label}
                  {isActive ? " • กำลังกรอง" : ""}
                </h4>
                <div className={cn("w-8 h-8 rounded-full flex items-center justify-center shrink-0", cat.iconWrap)}>
                  <Icon className={cn("w-4 h-4", cat.iconColor)} />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-auto leading-snug whitespace-pre-line">
                {cat.description}
              </p>
            </Link>
          )
        })}

        {/* Others — clear filter / all reports */}
        <Link
          href="/reports"
          className="bg-card rounded-2xl p-4 border border-border shadow-xs flex flex-col hover:border-border transition-colors cursor-pointer group"
        >
          <div className="flex justify-between items-start mb-3">
            <h4 className="text-xs font-bold text-foreground leading-tight">รายงานอื่นๆ</h4>
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
              <Menu className="w-4 h-4 text-muted-foreground" />
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-auto leading-snug">เอกสารและรายงาน<br />เพิ่มเติม</p>
        </Link>
      </div>
    </div>
  )
}
