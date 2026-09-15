"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useActionState } from "react"
import { Loader2, LogOut, Save } from "lucide-react"

import { signOutAction } from "@/app/actions/auth.actions"
import { updateOwnProfile } from "@/app/actions/settings.actions"
import { ActionFeedback } from "@/components/forms/action-feedback"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { ActionResult } from "@/lib/server/action-result"
import type { UserProfileInfo } from "@/lib/server/settings-read-models"
import { createClient } from "@/utils/supabase/client"

type SettingsState = ActionResult<{ saved: true }> | null

export function ProfileSettingsForm({ profile }: { profile: UserProfileInfo }) {
  const [state, formAction, pending] = useActionState<SettingsState, FormData>(updateOwnProfile, null)
  const errors = state?.ok === false ? state.fieldErrors : undefined
  return <form action={formAction} className="space-y-5">
    <div className="grid gap-4 sm:grid-cols-2">
      <Field label="ชื่อ" name="first_name" defaultValue={profile.firstName} required error={errors?.first_name?.[0]} />
      <Field label="นามสกุล" name="last_name" defaultValue={profile.lastName} required error={errors?.last_name?.[0]} />
      <Field label="เบอร์โทรศัพท์" name="phone" defaultValue={profile.phone ?? ""} error={errors?.phone?.[0]} />
      <Field label="ตำแหน่ง" name="position" defaultValue={profile.position ?? ""} error={errors?.position?.[0]} />
    </div>
    <Field label="URL รูปโปรไฟล์" name="avatar_url" type="url" defaultValue={profile.avatarUrl ?? ""} placeholder="https://..." error={errors?.avatar_url?.[0]} />
    <ActionFeedback result={state} />
    <div className="flex justify-end"><Button type="submit" disabled={pending} className="w-full gap-2 sm:w-auto">{pending ? <Loader2 className="animate-spin" /> : <Save />}{pending ? "กำลังบันทึก..." : "บันทึกข้อมูลส่วนตัว"}</Button></div>
  </form>
}

export function LogoutButton() {
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleSignOut = async () => {
    try {
      setIsLoggingOut(true)
      try {
        const supabase = createClient()
        await supabase.auth.signOut()
      } catch {
        // Continue to server action
      }
      await signOutAction()
    } catch {
      router.push("/login")
      router.refresh()
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleSignOut}
      disabled={isLoggingOut}
      className="w-full gap-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200 dark:border-rose-900/50 dark:hover:bg-rose-950/30"
    >
      {isLoggingOut ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <LogOut className="size-4" />
      )}
      {isLoggingOut ? "กำลังออกจากระบบ..." : "ออกจากระบบ"}
    </Button>
  )
}

function Field({ label, name, defaultValue, type = "text", placeholder, required, error }: { label: string; name: string; defaultValue: string; type?: string; placeholder?: string; required?: boolean; error?: string }) {
  return <div className="space-y-2"><label htmlFor={name} className="text-sm font-medium">{label}{required ? " *" : ""}</label><Input id={name} name={name} type={type} defaultValue={defaultValue} placeholder={placeholder} required={required} aria-invalid={!!error} />{error ? <p className="text-xs text-destructive">{error}</p> : null}</div>
}
