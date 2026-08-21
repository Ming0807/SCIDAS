"use client"

import { useActionState, useEffect } from "react"
import { Check, LoaderCircle } from "lucide-react"
import { useRouter } from "next/navigation"

import { transitionSupportRecord, type SupportActionData, type SupportStatus } from "@/app/actions/support.actions"
import { ActionFeedback } from "@/components/forms"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { ActionResult } from "@/lib/server/action-result"

type SupportStatusFormProps = {
  id: string
  currentStatus: SupportStatus
}

const statusLabels: Record<SupportStatus, string> = {
  pending: "รอดำเนินการ",
  in_progress: "กำลังดำเนินการ",
  completed: "เสร็จสิ้น",
  cancelled: "ยกเลิก",
  referred: "ส่งต่อ",
}

const allowedTransitions: Record<SupportStatus, SupportStatus[]> = {
  pending: ["in_progress", "cancelled", "referred"],
  in_progress: ["pending", "completed", "cancelled", "referred"],
  completed: ["in_progress", "referred"],
  cancelled: ["pending", "referred"],
  referred: ["in_progress", "completed", "cancelled"],
}

function FieldError({ result }: { result: ActionResult<SupportActionData> | null }) {
  if (!result || result.ok || !result.fieldErrors?.status) return null
  return <p className="text-sm text-destructive" role="alert">{result.fieldErrors.status.join(" ")}</p>
}

export function SupportStatusForm({ id, currentStatus }: SupportStatusFormProps) {
  const router = useRouter()
  const [result, formAction, pending] = useActionState<ActionResult<SupportActionData> | null, FormData>(
    transitionSupportRecord,
    null,
  )
  const nextStatuses = allowedTransitions[currentStatus]

  useEffect(() => {
    if (!result?.ok) return
    const refreshTimer = window.setTimeout(() => router.refresh(), 900)
    return () => window.clearTimeout(refreshTimer)
  }, [result, router])

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="id" value={id} />
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
        <div className="min-w-0 flex-1 space-y-2">
          <label htmlFor="support-next-status" className="text-sm font-medium text-foreground">
            เปลี่ยนสถานะเคส
          </label>
          <Select name="status" disabled={pending} required>
            <SelectTrigger id="support-next-status" className="w-full">
              <SelectValue placeholder="เลือกสถานะใหม่..." />
            </SelectTrigger>
            <SelectContent>
              {nextStatuses.map((status) => (
                <SelectItem key={status} value={status}>
                  {statusLabels[status]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldError result={result} />
        </div>
        <Button type="submit" disabled={pending || nextStatuses.length === 0}>
          {pending ? <LoaderCircle aria-hidden="true" className="animate-spin motion-reduce:animate-none" /> : <Check aria-hidden="true" />}
          {pending ? "กำลังอัปเดต..." : "อัปเดตสถานะ"}
        </Button>
      </div>
      <ActionFeedback result={result} />
    </form>
  )
}
