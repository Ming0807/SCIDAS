"use client"

import { useActionState, useState } from "react"
import { BellOff, CheckCircle2, Loader2, XCircle } from "lucide-react"

import { updateNotificationPreferencesAction } from "@/app/actions/notifications.actions"
import type { NotificationType } from "@/lib/notification-constants"
import type { ActionResult } from "@/lib/server/action-result"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// Client-safe copy of the server type labels in notification-read-models.
const preferenceTypeLabels: Record<NotificationType, string> = {
  risk_alert: "ความเสี่ยง",
  attendance_alert: "การมาเรียน",
  assignment_alert: "การบ้าน",
  behavior_alert: "พฤติกรรม",
  home_visit_reminder: "เยี่ยมบ้าน",
  plan_review: "แผนพัฒนา",
  system: "ระบบ",
  general: "ทั่วไป",
}

const preferenceTypes: NotificationType[] = [
  "risk_alert",
  "attendance_alert",
  "assignment_alert",
  "behavior_alert",
  "home_visit_reminder",
  "plan_review",
  "system",
  "general",
]

export function NotificationPreferences({
  initialMuted = [],
}: {
  initialMuted?: NotificationType[]
}) {
  const [state, formAction, pending] = useActionState<
    ActionResult<{ muted: string[] }> | null,
    FormData
  >(updateNotificationPreferencesAction, null)
  const [muted, setMuted] = useState<Set<string>>(new Set(initialMuted))

  const savedMuted = state?.ok ? state.data?.muted : undefined

  function toggle(type: string) {
    setMuted((prev) => {
      const next = new Set(prev)
      if (next.has(type)) {
        next.delete(type)
      } else {
        next.add(type)
      }
      return next
    })
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData()
    for (const type of muted) fd.append("types", type)
    formAction(fd)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-border bg-card p-4 shadow-sm"
    >
      <div className="flex items-center gap-2">
        <BellOff aria-hidden="true" className="size-4 text-muted-foreground" />
        <h3 className="text-sm font-semibold text-foreground">ตั้งค่าการแจ้งเตือน</h3>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        ปิดประเภทที่ไม่ต้องการ ประเภทที่ปิดจะไม่แสดงในรายการและไม่มีตัวเลขนับเตือน
      </p>

      <div className="mt-3 grid grid-cols-1 gap-1.5 sm:grid-cols-2">
        {preferenceTypes.map((type) => {
          const checked = muted.has(type)
          return (
            <label
              key={type}
              className={cn(
                "flex cursor-pointer items-center gap-2 rounded-lg border px-2.5 py-2 text-xs font-medium transition-colors",
                checked
                  ? "border-border bg-muted/50 text-muted-foreground"
                  : "border-border bg-background text-foreground hover:border-primary/40",
              )}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => toggle(type)}
                className="size-4 rounded border-input accent-primary"
                aria-label={`ปิดการแจ้งเตือน${preferenceTypeLabels[type]}`}
              />
              <span className={checked ? "line-through" : undefined}>
                {preferenceTypeLabels[type]}
              </span>
            </label>
          )
        })}
      </div>

      <div className="mt-3 flex items-center justify-between gap-2">
        <Button type="submit" size="sm" disabled={pending} className="min-w-[120px]">
          {pending ? (
            <>
              <Loader2 aria-hidden="true" className="animate-spin" />
              กำลังบันทึก...
            </>
          ) : (
            "บันทึกการตั้งค่า"
          )}
        </Button>

        {state ? (
          <span
            aria-live="polite"
            className={cn(
              "inline-flex items-center gap-1 text-xs font-medium",
              state.ok ? "text-emerald-600" : "text-destructive",
            )}
          >
            {state.ok ? (
              <CheckCircle2 aria-hidden="true" className="size-4" />
            ) : (
              <XCircle aria-hidden="true" className="size-4" />
            )}
            {state.ok
              ? `บันทึกแล้ว${savedMuted && savedMuted.length > 0 ? ` (ปิด ${savedMuted.length} ประเภท)` : ""}`
              : state.message}
          </span>
        ) : null}
      </div>
    </form>
  )
}
