import React from "react"
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
        <h3 className="text-sm font-semibold text-slate-800">ดาวน์โหลดรายงาน</h3>
        <button className="flex items-center gap-0.5 text-xs font-semibold text-indigo-600">
          ดูทั้งหมด
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {downloadable.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center bg-white rounded-xl border border-slate-200 shadow-sm">
          <FileText className="w-8 h-8 text-slate-300 mb-2" />
          <p className="text-sm font-medium text-slate-500 mb-1">ยังไม่มีรายงานที่พร้อมดาวน์โหลด</p>
          <p className="text-xs text-slate-400">เมื่อรายงานเสร็จสมบูรณ์ รายการจะปรากฏที่นี่</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {downloadable.map((job) => (
            <div
              key={job.id}
              className="bg-white rounded-xl p-3 border border-slate-200 shadow-sm flex items-center justify-between group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-red-50 flex flex-col items-center justify-center shrink-0 border border-red-100">
                  <span className="text-[8px] font-semibold text-red-600 uppercase">
                    PDF
                  </span>
                </div>
                <div className="flex flex-col min-w-0 pr-4">
                  <h4 className="text-xs font-semibold text-slate-800 truncate">
                    {job.title}
                  </h4>
                  <span className="text-xs text-slate-500">
                    {job.reportType}
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                <span className="text-xs text-slate-400">
                  {formatThaiShortDate(job.completedAt ?? job.requestedAt)}
                </span>
                {job.downloadUrl ? (
                  <a
                    href={job.downloadUrl}
                    download
                    className="text-indigo-600 hover:text-indigo-800 p-1"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                ) : (
                  <span className="text-xs text-slate-300">-</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
