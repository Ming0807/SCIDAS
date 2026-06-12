import React from "react"
import {
  FileText,
  ShieldAlert,
  HeartPulse,
  LineChart,
  Users,
} from "lucide-react"
import Link from "next/link"

import type { PopularReportType } from "@/lib/server/report-read-models"
import { reportJobTypes } from "@/lib/server/report-read-models"

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  student_summary: FileText,
  risk_report: ShieldAlert,
  support_report: HeartPulse,
  academic_report: LineChart,
  admin_summary: Users,
}

export function DesktopPopularReports({
  popularTypes,
}: {
  popularTypes: PopularReportType[]
}) {
  const items =
    popularTypes.length > 0
      ? popularTypes
      : reportJobTypes.slice(0, 5).map((t) => ({
          reportType: t,
          label: t,
          count: 0,
        }))

  return (
    <div className="bg-card rounded-xl border border-border shadow-sm p-5 flex flex-col h-full">
      <h3 className="text-sm font-semibold text-foreground mb-4">
        รายงานยอดนิยม
      </h3>

      <div className="flex-1 flex flex-col gap-3">
        {items.map((item) => {
          const Icon = iconMap[item.reportType] ?? FileText
          return (
            <Link
              key={item.reportType}
              href={`/reports`}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/30 transition-colors group"
            >
              <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center shrink-0 group-hover:bg-primary/10 transition-colors">
                <Icon className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-foreground truncate">
                  {item.label}
                </div>
              </div>
              {item.count > 0 ? (
                <span className="text-xs text-muted-foreground shrink-0">
                  {item.count} ครั้ง
                </span>
              ) : null}
            </Link>
          )
        })}
      </div>

      {popularTypes.length === 0 ? (
        <p className="text-xs text-muted-foreground text-center mt-4">
          ยังไม่มีรายงานที่ถูกสร้าง
        </p>
      ) : null}
    </div>
  )
}
