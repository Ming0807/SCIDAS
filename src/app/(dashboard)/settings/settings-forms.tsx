"use client"

import { useActionState } from "react"
import { Loader2, Save } from "lucide-react"

import { updateOwnProfile } from "@/app/actions/settings.actions"
import { ActionFeedback } from "@/components/forms/action-feedback"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { ActionResult } from "@/lib/server/action-result"
import type { UserProfileInfo } from "@/lib/server/settings-read-models"

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

function Field({ label, name, defaultValue, type = "text", placeholder, required, error }: { label: string; name: string; defaultValue: string; type?: string; placeholder?: string; required?: boolean; error?: string }) {
  return <div className="space-y-2"><label htmlFor={name} className="text-sm font-medium">{label}{required ? " *" : ""}</label><Input id={name} name={name} type={type} defaultValue={defaultValue} placeholder={placeholder} required={required} aria-invalid={!!error} />{error ? <p className="text-xs text-destructive">{error}</p> : null}</div>
}
