"use client"

import { useTransition } from "react"
import { Loader2, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { deleteNotificationAction } from "@/app/actions/notifications.actions"
import { cn } from "@/lib/utils"

export interface NotificationDeleteButtonProps {
  notificationId: string
  className?: string
}

export function NotificationDeleteButton({
  notificationId,
  className,
}: NotificationDeleteButtonProps) {
  const [isPending, startTransition] = useTransition()

  function handleDelete(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()

    if (!confirm("คุณต้องการลบการแจ้งเตือนนี้หรือไม่?")) {
      return
    }

    startTransition(async () => {
      const res = await deleteNotificationAction(notificationId)
      if (res.ok) {
        toast.success(res.message || "ลบการแจ้งเตือนเรียบร้อยแล้ว")
      } else {
        toast.error(res.message || "เกิดข้อผิดพลาดในการลบการแจ้งเตือน")
      }
    })
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={isPending}
      title="ลบการแจ้งเตือน"
      aria-label="ลบการแจ้งเตือน"
      className={cn(
        "flex size-7 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive",
        className,
      )}
    >
      {isPending ? (
        <Loader2 className="size-3.5 animate-spin" />
      ) : (
        <Trash2 className="size-3.5" />
      )}
    </button>
  )
}
