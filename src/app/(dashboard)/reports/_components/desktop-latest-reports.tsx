"use client"

import React, { useEffect, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Download, FileText, Loader2, RotateCw, Trash2 } from "lucide-react"
import { toast } from "sonner"

import type { ReportJobItem } from "@/lib/server/report-read-models"
import { formatThaiShortDate } from "@/lib/student-care-formatters"
import { deleteReportJobAction, retryReportJobAction } from "@/app/actions/reports.actions"
import { useRealtime } from "@/components/providers/realtime-provider"

const statusLabels: Record<string, { label: string; class: string }> = {
  queued: { label: "รอดำเนินการ", class: "bg-slate-100 text-slate-700 border-slate-200" },
  running: { label: "กำลังดำเนินการ", class: "bg-blue-50 text-blue-700 border-blue-200" },
  completed: { label: "เสร็จสมบูรณ์", class: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  failed: { label: "ล้มเหลว", class: "bg-red-50 text-red-700 border-red-200" },
  cancelled: { label: "ยกเลิก", class: "bg-slate-100 text-slate-500 border-slate-200" },
}

export function DesktopLatestReports({ jobs }: { jobs: ReportJobItem[] }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const { lastReportJobChange } = useRealtime()

  const lastHandledRef = React.useRef<number>(0)

  useEffect(() => {
    if (!lastReportJobChange) return

    const now = Date.now()
    if (now - lastHandledRef.current < 500) return
    lastHandledRef.current = now

    router.refresh()
  }, [lastReportJobChange, router])

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
        <div className="overflow-x-auto -mx-5 -mb-5 flex-1">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/40 border-y border-border text-xs font-semibold text-muted-foreground">
              <tr>
                <th className="px-5 py-3">ชื่อรายงาน</th>
                <th className="px-5 py-3">ประเภท</th>
                <th className="px-5 py-3">วันที่ร้องขอ</th>
                <th className="px-5 py-3">สถานะ</th>
                <th className="px-5 py-3 text-right">การกระทำ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {jobs.map((job) => {
                const badge = statusLabels[job.status] ?? {
                  label: job.status,
                  class: "bg-slate-100 text-slate-700 border-slate-200",
                }

                return (
                  <tr key={job.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-foreground">{job.title}</div>
                      {job.requestedByName && (
                        <div className="text-xs text-muted-foreground mt-0.5">
                          โดย {job.requestedByName}
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-xs text-muted-foreground whitespace-nowrap">
                      {job.reportType}
                    </td>
                    <td className="px-5 py-3.5 text-xs text-muted-foreground whitespace-nowrap">
                      {formatThaiShortDate(job.requestedAt)}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <div className="flex flex-col gap-1 items-start">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${badge.class}`}
                        >
                          {job.status === "running" && (
                            <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
                          )}
                          {badge.label}
                        </span>
                        {job.status === "failed" && job.errorMessage && (
                          <span
                            className="text-[11px] text-red-600 max-w-[200px] truncate"
                            title={job.errorMessage}
                          >
                            {job.errorMessage}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Download button if file ready */}
                        {job.hasOutput && job.downloadUrl ? (
                          <a
                            href={job.downloadUrl}
                            download
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-border text-xs font-medium text-foreground hover:bg-muted transition-colors"
                            title="ดาวน์โหลดเอกสาร"
                          >
                            <Download className="w-3.5 h-3.5 text-primary" />
                            ดาวน์โหลด
                          </a>
                        ) : job.status === "completed" ? (
                          <span className="text-xs text-muted-foreground italic px-2">กำลังเตรียมไฟล์...</span>
                        ) : null}

                        {/* Retry button for failed jobs */}
                        {job.status === "failed" && (
                          <button
                            type="button"
                            onClick={() => handleRetry(job.id, job.title)}
                            disabled={isPending}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-border text-xs font-medium text-foreground hover:bg-muted transition-colors disabled:opacity-50"
                            title="ลองสร้างใหม่อีกครั้ง"
                          >
                            <RotateCw className="w-3.5 h-3.5 text-primary" />
                            ลองใหม่
                          </button>
                        )}

                        {/* Delete button */}
                        <button
                          type="button"
                          onClick={() => handleDelete(job.id, job.title)}
                          disabled={isPending}
                          className="inline-flex items-center p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50"
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
    </div>
  )
}
