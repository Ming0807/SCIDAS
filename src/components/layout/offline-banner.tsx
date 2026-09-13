"use client"

import React from "react"
import { WifiOff } from "lucide-react"

import { useRealtime } from "@/components/providers/realtime-provider"
import { cn } from "@/lib/utils"

export interface OfflineBannerProps {
  className?: string
}

export function OfflineBanner({ className }: OfflineBannerProps) {
  const { isOnline } = useRealtime()

  if (isOnline) return null

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "flex items-center justify-center gap-2 bg-amber-500 px-4 py-2 text-xs font-semibold text-white shadow-sm transition-all sm:text-sm",
        className,
      )}
    >
      <WifiOff className="size-4 shrink-0 animate-pulse" aria-hidden="true" />
      <span>ขาดการเชื่อมต่ออินเทอร์เน็ต — ระบบกำลังรอการเชื่อมต่อใหม่เพื่อซิงค์ข้อมูล</span>
    </div>
  )
}
