"use client"

import React, { useTransition } from "react"
import Link from "next/link"
import { Eye, Download, FileText, Loader2, RotateCw, Trash2 } from "lucide-react"
import { toast } from "sonner"

import type { ReportJobItem } from "@/lib/server/report-read-models"
import { formatThaiShortDate } from "@/lib/student-care-formatters"
import { deleteReportJobAction, retryReportJobAction } from "@/app/actions/reports.actions"

const statusLabels: Record<string, { label: string; class: string }> = {
  queued: { label: "รอดำเนินการ", class: "bg-slate-100 text-slate-700 border-slate-200" },
  running: { label: "กำลังดำเนินการ", class: "bg-blue-50 text-blue-700 border-blue-200" },
  completed: { label: "เสร็จสมบูรณ์", class: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  failed: { label: "ล้มเหลว", class: "bg-red-50 text-red-700 border-red-200" },
  cancelled: { label: "ยกเลิก", class: "bg-slate-100 text-slate-500 border-slate-200" },
}

export function DesktopLatestReports({ jobs }: { jobs: ReportJobItem[] }) {
  const [isPending, startTransition] = useTransition()

  const handleRetry = (jobId: string, title: string) => {
    startTransition(async () => {
      const res = await retryReportJobAction(jobId)
      if (res.ok) {
        toast.success(`กำลังประมวลผลรายงาน '${title}' อีกครั้ง`)
      } else {
        toast.error(res.message)
      }
    })
  }

  const handleDelete = (jobId: string, title: string) => {
    if (!confirm(`ยืนยันการลบรายงาน '${title}'?`)) return
    startTransition(async () => {
      const res = await deleteReportJobAction(jobId)
      if (res.ok) {
        toast.success(res.message)
      } else {
        toast.error(res.message)
      }
    })
  }

  return (
    <div className="bg-card rounded-xl p-5 border border-border shadow-sm h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-foreground">รายงานล่าสุด</h3>
        {jobs.length > 0 && (
          <span className="text-xs text-muted-foreground">{jobs.length} รายการ</span>
        )}
      </div>

      {jobs.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-12 text-center">
          <FileText className="w-10 h-10 text-muted-foreground/40 mb-3" />
          <p className="text-sm font-medium text-foreground mb-1">ยังไม่มีรายงาน</p>
          <p className="text-xs text-muted-foreground">เมื่อมีการสร้างรายงาน รายการจะปรากฏที่นี่</p>
        </div>
      ) : (
        <div className="flex-1 overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border">
                <th className="pb-3 text-xs font-medium text-muted-foreground">ชื่อรายงาน</th>
                <th className="pb-3 text-xs font-medium text-muted-foreground">ประเภท</th>
                <th className="pb-3 text-xs font-medium text-muted-foreground">วันที่สร้าง</th>
                <th className="pb-3 text-xs font-medium text-muted-foreground">สร้างโดย</th>
                <th className="pb-3 text-xs font-medium text-muted-foreground">สถานะ</th>
                <th className="pb-3 text-xs font-medium text-muted-foreground text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-xs">
              {jobs.map((job) => {
                const statusStyle = statusLabels[job.status] ?? statusLabels.queued

                return (
                  <tr
                    key={job.id}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <td className="py-3 pr-4 font-semibold text-foreground whitespace-nowrap">
                      {job.title}
                    </td>
                    <td className="py-3 pr-4 text-muted-foreground">{job.reportType}</td>
                    <td className="py-3 pr-4 text-muted-foreground whitespace-nowrap">
                      {formatThaiShortDate(job.requestedAt)}
                    </td>
                    <td className="py-3 pr-4 text-muted-foreground whitespace-nowrap">
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
                    <td className="py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {job.status === "completed" && job.downloadUrl ? (
                          <>
                            <a
                              href={job.downloadUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:text-primary/80 p-1"
                              title="ดูรายงาน"
                            >
                              <Eye className="w-4 h-4" />
                            </a>
                            <a
                              href={job.downloadUrl}
                              download
                              className="text-primary hover:text-primary/80 p-1"
                              title="ดาวน์โหลด PDF"
                            >
                              <Download className="w-4 h-4" />
                            </a>
                          </>
                        ) : job.status === "failed" ? (
                          <button
                            type="button"
                            disabled={isPending}
                            onClick={() => handleRetry(job.id, job.title)}
                            className="inline-flex items-center gap-1 text-xs text-amber-600 hover:text-amber-700"
                            title="ลองสร้างใหม่"
                          >
                            <RotateCw className="size-3.5" />
                            ลองใหม่
                          </button>
                        ) : (
                          <span className="text-muted-foreground text-xs">
                            {job.status === "running" ? "กำลังสร้าง..." : "รอคิว..."}
                          </span>
                        )}

                        <button
                          type="button"
                          disabled={isPending}
                          onClick={() => handleDelete(job.id, job.title)}
                          className="text-muted-foreground hover:text-destructive p-1"
                          title="ลบรายงาน"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-auto pt-4 flex justify-center border-t border-border">
        <Link
          href="/reports"
          className="px-6 py-2 border border-primary/20 text-primary font-semibold text-xs rounded-lg hover:bg-primary/5 transition-colors"
        >
          ดูรายงานทั้งหมด
        </Link>
      </div>
    </div>
  )
}
