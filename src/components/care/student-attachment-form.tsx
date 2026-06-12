"use client"

import { useActionState } from "react"
import { Loader2, Upload } from "lucide-react"

import { addStudentAttachmentActionState } from "@/app/actions/care.actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { ActionResult } from "@/lib/server/action-result"
import { cn } from "@/lib/utils"

type StudentAttachmentFormProps = {
  studentId: string
  referenceTable?: string | null
  referenceId?: string | null
  className?: string
}

export function StudentAttachmentForm({
  studentId,
  referenceTable,
  referenceId,
  className,
}: StudentAttachmentFormProps) {
  const [state, formAction, pending] = useActionState<
    ActionResult<{ id: string; studentId: string }> | null,
    FormData
  >(addStudentAttachmentActionState, null)
  const fileErrors = state?.ok === false ? state.fieldErrors?.file : undefined

  return (
    <form
      action={formAction}
      className={cn("space-y-3", className)}
    >
      <input type="hidden" name="studentId" value={studentId} />
      {referenceTable ? (
        <input type="hidden" name="referenceTable" value={referenceTable} />
      ) : null}
      {referenceId ? <input type="hidden" name="referenceId" value={referenceId} /> : null}

      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
        <label className="grid min-w-0 gap-1.5 text-sm font-medium text-foreground">
          <span>ไฟล์หลักฐาน</span>
          <Input
            type="file"
            name="file"
            required
            accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.csv,.txt"
            aria-invalid={fileErrors ? true : undefined}
            aria-describedby={fileErrors ? "student-attachment-file-error" : undefined}
            className="h-10 bg-background file:mr-3 file:h-7 file:rounded-md file:bg-muted file:px-2.5 file:text-xs"
          />
          {fileErrors ? (
            <span id="student-attachment-file-error" className="text-xs text-destructive">
              {fileErrors[0]}
            </span>
          ) : null}
        </label>
        <Button type="submit" disabled={pending} className="w-full sm:w-auto">
          {pending ? <Loader2 className="animate-spin" /> : <Upload />}
          {pending ? "กำลังอัปโหลด" : "อัปโหลด"}
        </Button>
      </div>

      <div className="flex flex-col gap-2 text-xs leading-5 text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <label className="flex items-center gap-2 text-foreground">
          <input
            type="checkbox"
            name="isPrivate"
            value="on"
            defaultChecked
            className="size-4 rounded border-input text-primary focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          />
          จำกัดการมองเห็นเฉพาะทีมดูแล
        </label>
        <span>รองรับรูปภาพ PDF และเอกสาร ขนาดไม่เกิน 10 MB</span>
      </div>

      {state ? (
        <div
          aria-live="polite"
          className={cn(
            "rounded-lg border px-3 py-2 text-sm leading-6",
            state.ok
              ? "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-100"
              : "border-destructive/30 bg-destructive/10 text-destructive",
          )}
        >
          {state.ok ? "อัปโหลดไฟล์แล้ว" : state.message}
        </div>
      ) : null}
    </form>
  )
}
