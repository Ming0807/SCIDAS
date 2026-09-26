"use client"

import { useState, useTransition } from "react"
import { Flag, FlagOff, Loader2 } from "lucide-react"

import { clearTeacherFlagAction, setTeacherFlagAction } from "@/app/actions/flag.actions"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

export function TeacherFlagControl({
  studentId,
  studentName,
  initialFlagged,
  initialReason,
  canFlag,
}: {
  studentId: string
  studentName: string
  initialFlagged: boolean
  initialReason: string | null
  canFlag: boolean
}) {
  const [flagged, setFlagged] = useState(initialFlagged)
  const [reason, setReason] = useState(initialReason ?? "")
  const [draft, setDraft] = useState(initialReason ?? "")
  const [editing, setEditing] = useState(false)
  const [pending, startTransition] = useTransition()
  const [message, setMessage] = useState<string | null>(null)
  const [isError, setIsError] = useState(false)

  if (!canFlag && !flagged) return null

  function handleFlag() {
    setMessage(null)
    setIsError(false)
    startTransition(async () => {
      const res = await setTeacherFlagAction({ student_id: studentId, reason: draft })
      setIsError(!res.ok)
      setMessage(res.message)
      if (res.ok) {
        setFlagged(true)
        setReason(draft.trim())
        setEditing(false)
      }
    })
  }

  function handleClear() {
    if (!confirm(`ยกเลิกการติดตาม ${studentName}?`)) return
    setMessage(null)
    setIsError(false)
    startTransition(async () => {
      const res = await clearTeacherFlagAction({ student_id: studentId })
      setIsError(!res.ok)
      setMessage(res.message)
      if (res.ok) {
        setFlagged(false)
        setReason("")
        setDraft("")
        setEditing(false)
      }
    })
  }

  if (!flagged && !editing) {
    return (
      <Button
        onClick={() => setEditing(true)}
        variant="outline"
        className="gap-1.5 border-amber-300 text-amber-700 hover:bg-amber-50 dark:border-amber-800 dark:text-amber-300 dark:hover:bg-amber-950/40"
      >
        <Flag className="size-4" />
        ติดตามพิเศษ
      </Button>
    )
  }

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-amber-300/60 bg-amber-50/60 p-3 dark:border-amber-800/60 dark:bg-amber-950/20">
      <div className="flex items-center justify-between gap-2">
        <p className="flex items-center gap-1.5 text-xs font-semibold text-amber-800 dark:text-amber-200">
          <Flag className="size-3.5" />
          {flagged ? "กำลังติดตามพิเศษ" : "ติดตามพิเศษ"}
        </p>
        {flagged && canFlag ? (
          <button
            type="button"
            onClick={handleClear}
            disabled={pending}
            className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-destructive disabled:opacity-50"
          >
            <FlagOff className="size-3.5" />
            ยกเลิกติดตาม
          </button>
        ) : null}
      </div>

      {flagged && !editing ? (
        <p className="text-xs text-foreground">{reason || "ครูระบุว่าควรติดตาม"}</p>
      ) : null}

      {canFlag && (!flagged || editing) ? (
        <div className="space-y-2">
          <Textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="เหตุผลที่ควรติดตาม เช่น แยกตัวจากเพื่อน ขาดเรียนถี่"
            rows={2}
            maxLength={500}
            aria-label={`เหตุผลที่ติดตาม ${studentName}`}
            className="bg-background text-xs"
          />
          <div className="flex items-center gap-2">
            <Button onClick={handleFlag} disabled={pending || !draft.trim()} size="sm" className="gap-1.5">
              {pending ? <Loader2 className="size-3.5 animate-spin" /> : <Flag className="size-3.5" />}
              {pending ? "กำลังบันทึก..." : flagged ? "อัปเดตเหตุผล" : "เริ่มติดตาม"}
            </Button>
            {flagged || draft ? (
              <Button
                onClick={() => {
                  setDraft(reason)
                  setEditing(false)
                  setMessage(null)
                }}
                disabled={pending}
                variant="ghost"
                size="sm"
              >
                ยกเลิก
              </Button>
            ) : null}
          </div>
        </div>
      ) : null}

      {flagged && canFlag && !editing ? (
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="self-start text-xs font-medium text-primary hover:underline"
        >
          แก้ไขเหตุผล
        </button>
      ) : null}

      {message ? (
        <p className={`text-xs ${isError ? "text-destructive" : "text-emerald-600"}`}>{message}</p>
      ) : null}
    </div>
  )
}
