"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import type { ActionResult } from "@/lib/server/action-result"
import { actionFail } from "@/lib/server/action-result"
import { createClient } from "@/utils/supabase/server"

/**
 * Signs the user out from Supabase on the server, clears session cookies,
 * and redirects the browser to the login page.
 */
export async function signOutAction(): Promise<ActionResult<{ success: boolean }>> {
  try {
    const supabase = await createClient()
    const { error } = await supabase.auth.signOut()

    if (error) {
      console.error("[auth.actions] signOut error:", error.message)
      return actionFail("INTERNAL_ERROR", "เกิดข้อผิดพลาดในการออกจากระบบ กรุณาลองใหม่อีกครั้ง")
    }

    revalidatePath("/", "layout")
  } catch (error) {
    console.error("[auth.actions] Unexpected signOut error:", error)
    return actionFail("INTERNAL_ERROR", "ไม่สามารถออกจากระบบได้")
  }

  redirect("/login")
}
