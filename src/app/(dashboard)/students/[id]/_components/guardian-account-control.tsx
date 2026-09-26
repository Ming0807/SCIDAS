"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { KeyRound, Loader2, UserX } from "lucide-react"
import { toast } from "sonner"

import { inviteParentAction, removeParentAccessAction } from "@/app/actions/parent.actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function GuardianAccountControl({
  guardianId,
  guardianName,
  hasAccount,
}: {
  guardianId: string
  guardianName: string
  hasAccount: boolean
}) {
  const router = useRouter()
  const [showForm, setShowForm] = useState(false)
  const [email, setEmail] = useState("")
  const [tempPassword, setTempPassword] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function handleInvite() {
    setTempPassword(null)
    startTransition(async () => {
      // Name is split best-effort; the invite form only needs contact email —
      // display name comes from the guardian record.
      const parts = guardianName.trim().split(/\s+/)
      const res = await inviteParentAction({
        guardianId,
        email,
        firstName: parts[0] || guardianName,
        lastName: parts.slice(1).join(" ") || "-",
      })
      if (res.ok && res.data) {
        toast.success(res.message)
        setTempPassword(res.data.tempPassword)
        setEmail("")
        setShowForm(false)
        router.refresh()
      } else {
        toast.error(res.message)
      }
    })
  }

  function handleRemove() {
    if (!confirm(`ปิดบัญชีผู้ปกครองของ ${guardianName}? เจ้าตัวจะเข้าสู่ระบบไม่ได้อีก`)) return
    startTransition(async () => {
      const res = await removeParentAccessAction({ guardianId })
      if (res.ok) {
        toast.success(res.message)
        router.refresh()
      } else {
        toast.error(res.message)
      }
    })
  }

  if (hasAccount) {
    return (
      <div className="mt-2 space-y-2">
        {tempPassword ? (
          <div className="rounded-md bg-amber-50 p-2 text-xs text-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
            <p className="font-semibold">รหัสผ่านชั่วคราว (แสดงครั้งเดียว):</p>
            <p className="font-mono text-sm font-bold tracking-wider">{tempPassword}</p>
          </div>
        ) : null}
        <div className="flex items-center justify-between gap-2 rounded-lg bg-emerald-50 px-2.5 py-1.5 text-xs dark:bg-emerald-950/40">
        <span className="font-medium text-emerald-700 dark:text-emerald-300">
          มีบัญชีผู้ปกครองแล้ว
        </span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={pending}
          onClick={handleRemove}
          className="h-7 gap-1 px-2 text-xs text-muted-foreground hover:text-destructive"
        >
          <UserX className="size-3.5" />
          ปิดบัญชี
        </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="mt-2 rounded-lg border border-dashed border-border p-2.5">
      {!showForm ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={pending}
          onClick={() => setShowForm(true)}
          className="h-7 gap-1 px-2 text-xs"
        >
          <KeyRound className="size-3.5" />
          เปิดบัญชีผู้ปกครอง
        </Button>
      ) : (
        <div className="space-y-2">
          <div className="space-y-1">
            <Label htmlFor={`parent-email-${guardianId}`} className="text-xs">
              อีเมลสำหรับเข้าสู่ระบบ
            </Label>
            <Input
              id={`parent-email-${guardianId}`}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="parent@example.com"
              disabled={pending}
              className="h-8 text-xs"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button type="button" size="sm" disabled={pending || !email.trim()} onClick={handleInvite} className="h-7 gap-1 px-2 text-xs">
              {pending ? <Loader2 className="size-3.5 animate-spin" /> : <KeyRound className="size-3.5" />}
              {pending ? "กำลังสร้าง..." : "สร้างบัญชี"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={pending}
              onClick={() => {
                setShowForm(false)
                setEmail("")
              }}
              className="h-7 px-2 text-xs"
            >
              ยกเลิก
            </Button>
          </div>
        </div>
      )}
      {tempPassword ? (
        <div className="mt-2 rounded-md bg-amber-50 p-2 text-xs text-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
          <p className="font-semibold">รหัสผ่านชั่วคราว (แสดงครั้งเดียว):</p>
          <p className="font-mono text-sm font-bold tracking-wider">{tempPassword}</p>
        </div>
      ) : null}
    </div>
  )
}
