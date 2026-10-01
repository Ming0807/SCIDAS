"use client"

import { useState } from "react"
import { AlertCircle, AlertTriangle, Check, Copy, HelpCircle, RotateCw, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { ReportJobItem } from "@/lib/server/report-read-models"
import { formatThaiShortDate } from "@/lib/student-care-formatters"

interface ReportDiagnosticsDrawerProps {
  job: ReportJobItem | null
  isOpen: boolean
  onClose: () => void
  onRerun: (jobId: string, title: string) => void
  isRerunning?: boolean
}

export function ReportDiagnosticsDrawer({
  job,
  isOpen,
  onClose,
  onRerun,
  isRerunning = false,
}: ReportDiagnosticsDrawerProps) {
  const [copied, setCopied] = useState(false)

  if (!isOpen || !job) return null

  const errorText = job.errorMessage || "เกิดข้อผิดพลาดไม่ทราบสาเหตุระหว่างการสร้างเอกสาร"

  const handleCopy = () => {
    navigator.clipboard.writeText(`Job ID: ${job.id}\nType: ${job.reportType}\nError: ${errorText}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Determine intelligent troubleshooting advice based on error message
  const getTroubleshootingAdvice = () => {
    const err = errorText.toLowerCase()
    if (err.includes("not found") || err.includes("ไม่พบข้อมูล")) {
      return "ไม่พบข้อมูลที่ตรงกับตัวกรองที่เลือก เช่น ไม่มีนักเรียนในห้องเรียนที่ระบุ หรือไม่มีบันทึกข้อมูลในช่วงวันที่ดังกล่าว แนะนำให้ขยายช่วงเวลาหรือเลือกทุกห้องเรียน"
    }
    if (err.includes("storage") || err.includes("upload") || err.includes("พื้นที่")) {
      return "เกิดข้อขัดข้องในการบันทึกไฟล์ลงคลาวด์สตอเรจ กรุณาตรวจสอบการเชื่อมต่อและลองใหม่อีกครั้งใน 1-2 นาที"
    }
    if (err.includes("timeout") || err.includes("หมดเวลา")) {
      return "การประมวลผลใช้เวลานานเกินไปเนื่องจากปริมาณข้อมูลมาก แนะนำให้เลือกกรองเฉพาะชั้นเรียน หรือเลือกส่งออกเป็นไฟล์ Excel (XLSX) แทน PDF"
    }
    return "ระบบพบข้อขัดข้องชั่วคราวระหว่างการรวบรวมข้อมูล สามารถกดปุ่ม 'ลองสร้างใหม่อีกครั้ง' เพื่อให้ระบบประมวลผลใหม่ในพื้นหลังได้ทันที"
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="flex max-h-[90vh] w-full max-w-xl flex-col rounded-2xl border border-border bg-card p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-border pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-destructive/10 text-destructive">
              <AlertCircle className="size-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-foreground">
                การวินิจฉัยข้อผิดพลาดของรายงาน
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {job.title}
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="size-8 p-0 text-muted-foreground hover:text-foreground"
          >
            <X className="size-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 text-xs">
          {/* Error Message Box */}
          <div className="space-y-1.5">
            <span className="font-semibold text-foreground flex items-center gap-1.5">
              <AlertTriangle className="size-3.5 text-destructive" />
              ข้อความข้อผิดพลาด (Error Message):
            </span>
            <div className="relative rounded-xl border border-destructive/20 bg-destructive/5 p-3 font-mono text-destructive dark:border-destructive/40 dark:bg-destructive/10 break-words">
              {errorText}
              <button
                type="button"
                onClick={handleCopy}
                className="absolute right-2 top-2 p-1 text-destructive/70 hover:text-destructive rounded hover:bg-destructive/10 transition-colors"
                title="คัดลอกข้อความผิดพลาด"
              >
                {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
              </button>
            </div>
          </div>

          {/* Intelligent Resolution Advice */}
          <div className="rounded-xl border border-border bg-muted/40 p-3.5 space-y-1.5">
            <span className="font-semibold text-foreground flex items-center gap-1.5">
              <HelpCircle className="size-3.5 text-primary" />
              แนวทางแก้ไขที่แนะนำ:
            </span>
            <p className="text-muted-foreground leading-relaxed">
              {getTroubleshootingAdvice()}
            </p>
          </div>

          {/* Job Technical Details */}
          <div className="rounded-xl border border-border p-3 space-y-2">
            <span className="font-semibold text-foreground">รายละเอียดทางเทคนิค:</span>
            <div className="grid grid-cols-2 gap-2 text-muted-foreground">
              <div>
                <span>รหัสคำขอ: </span>
                <strong className="font-mono text-foreground">{job.id.slice(0, 13)}...</strong>
              </div>
              <div>
                <span>ประเภทรายงาน: </span>
                <strong className="text-foreground">{job.reportType}</strong>
              </div>
              <div>
                <span>วันที่ส่งคำขอ: </span>
                <strong className="text-foreground">{formatThaiShortDate(job.requestedAt)}</strong>
              </div>
              <div>
                <span>ผู้ร้องขอ: </span>
                <strong className="text-foreground">{job.requestedByName || "ไม่ระบุ"}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2 border-t border-border pt-4">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            className="text-xs"
          >
            ปิดหน้าต่าง
          </Button>
          <Button
            type="button"
            variant="default"
            size="sm"
            disabled={isRerunning}
            onClick={() => {
              onRerun(job.id, job.title)
              onClose()
            }}
            className="gap-1.5 text-xs bg-primary"
          >
            <RotateCw className={`size-3.5 ${isRerunning ? "animate-spin" : ""}`} />
            <span>ลองสร้างใหม่อีกครั้ง (Re-run)</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
