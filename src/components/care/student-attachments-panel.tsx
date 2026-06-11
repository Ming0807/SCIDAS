import type { SectionVariant } from "@/components/dashboard"
import { Section, StatusBadge } from "@/components/dashboard"
import { EmptyState } from "@/components/feedback"
import { buttonVariants } from "@/components/ui/button"
import { formatThaiDateTime } from "@/lib/student-care-formatters"
import type { StudentAttachmentItem } from "@/lib/server/student-care-read-models"
import { cn } from "@/lib/utils"
import { Download, FileText, Lock, Paperclip } from "lucide-react"

import { StudentAttachmentForm } from "./student-attachment-form"

type StudentAttachmentsPanelProps = {
  studentId: string | null
  attachments: StudentAttachmentItem[]
  title?: string
  description?: string
  variant?: SectionVariant
  showForm?: boolean
  referenceTable?: string | null
  referenceId?: string | null
}

function formatFileSize(size: number | null) {
  if (size === null) {
    return "-"
  }

  if (size < 1024) {
    return `${size.toLocaleString("th-TH")} B`
  }

  if (size < 1024 * 1024) {
    return `${(size / 1024).toLocaleString("th-TH", { maximumFractionDigits: 1 })} KB`
  }

  return `${(size / (1024 * 1024)).toLocaleString("th-TH", {
    maximumFractionDigits: 1,
  })} MB`
}

export function StudentAttachmentsPanel({
  studentId,
  attachments,
  title = "หลักฐานและไฟล์แนบ",
  description = "รวมเอกสาร รูปภาพ และหลักฐานที่ช่วยให้ทีมดูแลเห็นข้อมูลชุดเดียวกัน",
  variant = "plain",
  showForm = true,
  referenceTable,
  referenceId,
}: StudentAttachmentsPanelProps) {
  return (
    <Section
      variant={variant}
      title={title}
      description={description}
      contentClassName="space-y-4"
    >
      {studentId ? (
        <>
          {showForm ? (
            <StudentAttachmentForm
              studentId={studentId}
              referenceTable={referenceTable}
              referenceId={referenceId}
            />
          ) : null}

          {attachments.length > 0 ? (
            <div className="space-y-3">
              {attachments.map((attachment) => (
                <article
                  key={attachment.id}
                  className="rounded-lg border border-border bg-card p-3 text-card-foreground"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex min-w-0 gap-3">
                      <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                        <FileText className="size-4" aria-hidden="true" />
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">
                          {attachment.fileName}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {formatFileSize(attachment.fileSize)} ·{" "}
                          {attachment.mimeType ?? "application/octet-stream"}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {formatThaiDateTime(attachment.createdAt)}
                        </p>
                      </div>
                    </div>

                    <div className="flex shrink-0 flex-wrap items-center gap-2">
                      <StatusBadge
                        status={attachment.isPrivate ? "neutral" : "info"}
                        label={attachment.isPrivate ? "ทีมดูแล" : "แชร์ในทีม"}
                        size="sm"
                      />
                      {attachment.downloadUrl ? (
                        <a
                          href={attachment.downloadUrl}
                          target="_blank"
                          rel="noreferrer"
                          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                        >
                          <Download /> เปิดไฟล์
                        </a>
                      ) : (
                        <span className="inline-flex h-7 items-center gap-1 rounded-lg border border-border px-2.5 text-xs text-muted-foreground">
                          <Lock className="size-3.5" aria-hidden="true" /> ไม่มีลิงก์
                        </span>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Paperclip}
              size="compact"
              title="ยังไม่มีไฟล์แนบของนักเรียนคนนี้"
              description="เพิ่มหลักฐานแรกเพื่อให้ทีมดูแลเปิดดูข้อมูลประกอบได้จากหน้าเดียว"
            />
          )}
        </>
      ) : (
        <EmptyState
          icon={Paperclip}
          title="เลือกนักเรียนเพื่อดูไฟล์แนบ"
          description="ไฟล์หลักฐานจะแสดงตามสิทธิ์การเข้าถึงของผู้ใช้"
        />
      )}
    </Section>
  )
}
