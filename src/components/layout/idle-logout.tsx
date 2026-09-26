"use client"

import { useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { signOutAction } from "@/app/actions/auth.actions"
import { createClient } from "@/utils/supabase/client"

const DEFAULT_IDLE_TIMEOUT_MS = 30 * 60 * 1000
const ACTIVITY_EVENTS = ["mousedown", "mousemove", "keydown", "touchstart", "scroll", "click"] as const

/**
 * Signs the user out after a period of inactivity (FR-01-08).
 * Mount once inside the authenticated dashboard layout.
 */
export function IdleLogout({ timeoutMs = DEFAULT_IDLE_TIMEOUT_MS }: { timeoutMs?: number }) {
  const router = useRouter()
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    let disposed = false

    const doLogout = async () => {
      if (disposed) return
      toast.warning("ไม่ได้ใช้งานนาน ระบบออกจากระบบอัตโนมัติ")
      try {
        await createClient().auth.signOut()
      } catch {
        // Continue to server-side sign out.
      }
      try {
        await signOutAction()
      } catch {
        router.push("/login")
        router.refresh()
      }
    }

    const resetTimer = () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(doLogout, timeoutMs)
    }

    resetTimer()
    for (const event of ACTIVITY_EVENTS) {
      window.addEventListener(event, resetTimer, { passive: true })
    }

    return () => {
      disposed = true
      if (timerRef.current) clearTimeout(timerRef.current)
      for (const event of ACTIVITY_EVENTS) {
        window.removeEventListener(event, resetTimer)
      }
    }
  }, [router, timeoutMs])

  return null
}
