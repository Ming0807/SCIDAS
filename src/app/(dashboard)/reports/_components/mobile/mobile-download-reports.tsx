import React from "react"
import Link from "next/link"
import { ChevronRight, Download, FileText } from "lucide-react"
import type { ReportJobItem } from "@/lib/server/report-read-models"
import { formatThaiShortDate } from "@/lib/student-care-formatters"

export function MobileDownloadReports({ jobs }: { jobs: ReportJobItem[] }) {
  const downloadable = jobs.filter(
    (j) => j.status === "completed" && j.downloadUrl,
  )

  return (
    <div className="px-4 mb-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-foreground">ดาวน์โหลดรายงาน</h3>
        <Link href="/reports" className="flex items-center gap-0.5 text-xs font-semibold text-primary">
          ดูทั้งหมด
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {downloadable.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center bg-card rounded-2xl border border-border shadow-xs">
          <FileText className="w-8 h-8 text-muted-foreground/40 mb-2" />
          <p className="text-sm font-medium text-foreground mb-1">ยังไม่มีรายงานที่พร้อมดาวน์โหลด</p>
          <p className="text-xs text-muted-foreground">เมื่อรายงานเสร็จสมบูรณ์ รายการจะปรากฏที่นี่</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {downloadable.map((job) => (
            <div
              key={job.id}
              className="bg-card rounded-2xl p-3 border border-border shadow-xs flex items-center justify-between group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-rose-50 dark:bg-rose-950/40 flex flex-col items-center justify-center shrink-0 border border-rose-200 dark:border-rose-850">
                  <span className="text-micro font-bold text-rose-600 dark:text-rose-400 uppercase">
                    PDF
                  </span>
                </div>
                <div className="flex flex-col min-w-0 pr-4">
                  <h4 className="text-xs font-semibold text-foreground truncate">
                    {job.title}
                  </h4>
                  <span className="text-xs text-muted-foreground">
                    {job.reportType}
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                <span className="text-xs font-mono tabular-nums text-muted-foreground">
                  {formatThaiShortDate(job.completedAt ?? job.requestedAt)}
                </span>
                {job.downloadUrl ? (
                  <a
                    href={job.downloadUrl}
                    download
                    className="text-primary hover:text-primary/80 p-1"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                ) : (
                  <span className="text-xs text-muted-foreground">-</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
