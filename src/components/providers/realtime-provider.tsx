"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import { toast } from "sonner"

import { createClient } from "@/utils/supabase/client"
import type { Database } from "@/types/database.types"

type RealtimeContextValue = {
  unreadNotificationsCount: number
  decrementUnread: () => void
  resetUnread: () => void
  lastAttendanceChange: { studentId: string; status: string; timestamp: number } | null
  lastReportJobChange: { jobId: string; status: string; timestamp: number } | null
  isOnline: boolean
}

const RealtimeContext = createContext<RealtimeContextValue>({
  unreadNotificationsCount: 0,
  decrementUnread: () => {},
  resetUnread: () => {},
  lastAttendanceChange: null,
  lastReportJobChange: null,
  isOnline: true,
})

export function useRealtime() {
  return useContext(RealtimeContext)
}

export function RealtimeProvider({
  children,
  initialUnreadCount = 0,
  schoolId,
  userId,
}: {
  children: React.ReactNode
  initialUnreadCount?: number
  schoolId?: string | null
  userId?: string | null
}) {
  const [unreadCount, setUnreadCount] = useState<number>(initialUnreadCount)
  const [lastAttendanceChange, setLastAttendanceChange] = useState<{
    studentId: string
    status: string
    timestamp: number
  } | null>(null)
  const [lastReportJobChange, setLastReportJobChange] = useState<{
    jobId: string
    status: string
    timestamp: number
  } | null>(null)
  const [isOnline, setIsOnline] = useState<boolean>(true)

  // Online / Offline window listeners
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  // Supabase Realtime Channel Subscription
  useEffect(() => {
    if (!schoolId && !userId) return

    const supabase = createClient()
    const channelName = `school-realtime-${schoolId || userId}`

    const channel = supabase
      .channel(channelName)
      // 1. Listen to new notifications
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          ...(userId ? { filter: `recipient_id=eq.${userId}` } : {}),
        },
        (payload) => {
          const row = payload.new as Database["public"]["Tables"]["notifications"]["Row"]
          setUnreadCount((prev) => prev + 1)

          // High severity alert notification toast
          if (row.type === "risk_alert") {
            toast.error(row.title || "แจ้งเตือนความเสี่ยงสำคัญ", {
              description: row.message || undefined,
            })
          } else {
            toast.info(row.title || "การแจ้งเตือนใหม่", {
              description: row.message || undefined,
            })
          }
        }
      )
      // 2. Listen to attendance records changes
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "attendance_records",
          ...(schoolId ? { filter: `school_id=eq.${schoolId}` } : {}),
        },
        (payload) => {
          const row = payload.new as Database["public"]["Tables"]["attendance_records"]["Row"] | null
          if (row) {
            setLastAttendanceChange({
              studentId: row.student_id,
              status: row.status,
              timestamp: Date.now(),
            })
          }
        }
      )
      // 3. Listen to report job completion
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "report_jobs",
          ...(schoolId ? { filter: `school_id=eq.${schoolId}` } : {}),
        },
        (payload) => {
          const row = payload.new as Database["public"]["Tables"]["report_jobs"]["Row"]
          setLastReportJobChange({
            jobId: row.id,
            status: row.status,
            timestamp: Date.now(),
          })

          if (row.status === "completed") {
            toast.success(`รายงาน '${row.title}' สร้างเสร็จแล้ว`, {
              description: "สามารถดูและดาวน์โหลดเอกสารได้ในหน้ารายงาน",
            })
          } else if (row.status === "failed") {
            toast.error(`การสร้างรายงาน '${row.title}' ล้มเหลว`, {
              description: row.error_message || "กรุณาลองใหม่อีกครั้ง",
            })
          }
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          // Connected cleanly
        } else if (status === "CHANNEL_ERROR") {
          // Graceful fallback
        }
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [schoolId, userId])

  const decrementUnread = () => setUnreadCount((prev) => Math.max(0, prev - 1))
  const resetUnread = () => setUnreadCount(0)

  return (
    <RealtimeContext.Provider
      value={{
        unreadNotificationsCount: unreadCount,
        decrementUnread,
        resetUnread,
        lastAttendanceChange,
        lastReportJobChange,
        isOnline,
      }}
    >
      {children}
    </RealtimeContext.Provider>
  )
}
