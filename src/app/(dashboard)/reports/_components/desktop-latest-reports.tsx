import React from "react"
import Link from "next/link"
import { Eye, Download, FileText, Loader2 } from "lucide-react"
import type { ReportJobItem } from "@/lib/server/report-read-models"
import { formatThaiShortDate } from "@/lib/student-care-formatters"

const statusLabels: Record<string, { label: string; class: string }> = {
  queued: { label: "รอดำเนินการ", class: "bg-slate-100 text-slate-700 border-slate-200" },
  running: { label: "กำลังดำเนินการ", class: "bg-blue-50 text-blue-700 border-blue-200" },
  completed: { label: "เสร็จสมบูรณ์", class: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  failed: { label: "ล้มเหลว", class: "bg-red-50 text-red-700 border-red-200" },
  cancelled: { label: "ยกเลิก", class: "bg-slate-100 text-slate-500 border-slate-200" },
}

export function DesktopLatestReports({ jobs }: { jobs: ReportJobItem[] }) {
  return (
    <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-800">รายงานล่าสุด</h3>
        {jobs.length > 0 && (
          <span className="text-xs text-slate-500">{jobs.length} รายการ</span>
        )}
      </div>

      {jobs.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-12 text-center">
          <FileText className="w-10 h-10 text-slate-300 mb-3" />
          <p className="text-sm font-medium text-slate-500 mb-1">ยังไม่มีรายงาน</p>
          <p className="text-xs text-slate-400">เมื่อมีการสร้างรายงาน รายการจะปรากฏที่นี่</p>
        </div>
      ) : (
        <div className="flex-1 overflow-x-auto no-scrollbar">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="pb-3 text-xs font-medium text-slate-500">ชื่อรายงาน</th>
                <th className="pb-3 text-xs font-medium text-slate-500">ประเภท</th>
                <th className="pb-3 text-xs font-medium text-slate-500">วันที่สร้าง</th>
                <th className="pb-3 text-xs font-medium text-slate-500">สร้างโดย</th>
                <th className="pb-3 text-xs font-medium text-slate-500">สถานะ</th>
                <th className="pb-3 text-xs font-medium text-slate-500 text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-xs">
              {jobs.map((job) => {
                const statusStyle = statusLabels[job.status] ?? statusLabels.queued

                return (
                  <tr
                    key={job.id}
                    className="hover:bg-slate-50/50 transition-colors group cursor-pointer"
                  >
                    <td className="py-3 pr-4 font-semibold text-slate-700 whitespace-nowrap">
                      {job.title}
                    </td>
                    <td className="py-3 pr-4 text-slate-600">{job.reportType}</td>
                    <td className="py-3 pr-4 text-slate-600 whitespace-nowrap">
                      {formatThaiShortDate(job.requestedAt)}
                    </td>
                    <td className="py-3 pr-4 text-slate-600 whitespace-nowrap">
                      {job.requestedByName ?? "-"}
                    </td>
                    <td className="py-3 pr-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium border ${statusStyle.class}`}
                      >
                        {job.status === "running" && (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        )}
                        {statusStyle.label}
                      </span>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center justify-center gap-3">
                        {job.status === "completed" && job.downloadUrl ? (
                          <>
                            <a
                              href={job.downloadUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-indigo-600 hover:text-indigo-800"
                              title="ดูรายงาน"
                            >
                              <Eye className="w-4 h-4" />
                            </a>
                            <a
                              href={job.downloadUrl}
                              download
                              className="text-indigo-600 hover:text-indigo-800"
                              title="ดาวน์โหลด"
                            >
                              <Download className="w-4 h-4" />
                            </a>
                          </>
                        ) : job.status === "completed" ? (
                          <span className="text-muted-foreground text-xs">
                            เสร็จแล้ว (ยังไม่มีไฟล์)
                          </span>
                        ) : (
                          <span className="text-slate-300 text-xs">
                            {job.status === "failed"
                              ? "ข้อผิดพลาด"
                              : job.status === "queued"
                                ? "รอ..."
                                : "กำลังดำเนินการ"}
                          </span>
                        )}

                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-auto pt-4 flex justify-center">
        <Link href="/reports" className="px-6 py-2 border border-primary/20 text-primary font-semibold text-xs rounded-lg hover:bg-primary/5 transition-colors">
          ดูรายงานทั้งหมด
        </Link>
      </div>
    </div>
  )
}
