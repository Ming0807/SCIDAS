"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, LogOut } from "lucide-react"

import { signOutAction } from "@/app/actions/auth.actions"
import { Button } from "@/components/ui/button"
import { createClient } from "@/utils/supabase/client"

export function ParentLogoutButton() {
  const router = useRouter()
  const [pending, setPending] = useState(false)

  async function handleLogout() {
    setPending(true)
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
    } finally {
      setPending(false)
    }
  }

  return (
    <Button type="button" variant="outline" size="sm" disabled={pending} onClick={handleLogout} className="gap-1.5">
      {pending ? <Loader2 className="size-3.5 animate-spin" /> : <LogOut className="size-3.5" />}
      ออกจากระบบ
    </Button>
  )
}
