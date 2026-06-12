"use client"

import { useState, useTransition } from "react"
import { Check, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { toggleNotificationReadAction } from "@/app/actions/notifications.actions"

export interface NotificationReadToggleProps {
  notificationId: string
  isRead: boolean
}

export function NotificationReadToggle({ notificationId, isRead }: NotificationReadToggleProps) {
  const [optimisticRead, setOptimisticRead] = useState(isRead)
  const [isPending, startTransition] = useTransition()

  function handleToggle() {
    startTransition(async () => {
      const previous = optimisticRead
      const next = !optimisticRead
      setOptimisticRead(next)

      const result = await toggleNotificationReadAction(notificationId)
      if (result.ok) {
        setOptimisticRead(result.data?.isRead ?? next)
      } else {
        setOptimisticRead(previous)
      }
    })
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={isPending}
      aria-pressed={optimisticRead}
      aria-label={optimisticRead ? "ทำเครื่องหมายว่ายังไม่ได้อ่าน" : "ทำเครื่องหมายว่าอ่านแล้ว"}
      className={cn(
        "flex items-center justify-center rounded-full transition-colors",
        optimisticRead
          ? "h-5 w-5 bg-emerald-100 text-emerald-600 hover:bg-emerald-200"
          : "h-5 w-5 bg-red-100 text-red-600 hover:bg-red-200",
      )}
    >
      {isPending ? (
        <Loader2 className="h-3 w-3 animate-spin" />
      ) : optimisticRead ? (
        <Check className="h-3 w-3" />
      ) : (
        <span className="block h-2 w-2 rounded-full bg-current" />
      )}
    </button>
  )
}
