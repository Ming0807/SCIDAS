"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import {
  Calendar,
  Clock,
  Loader2,
  Plus,
  Trash2,
  TrendingUp,
  User,
} from "lucide-react"
import {
  createSupportFollowupAction,
  deleteSupportFollowupAction,
  type SupportFollowup,
} from "@/app/actions/support.actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ActionFeedback } from "@/components/forms/action-feedback"
import type { ActionResult } from "@/lib/server/action-result"
import { formatThaiShortDate } from "@/lib/student-care-formatters"

interface SupportFollowupsProps {
  supportRecordId: string
  followups: SupportFollowup[]
  canEdit: boolean
}

export function SupportFollowups({
  supportRecordId,
  followups,
  canEdit,
}: SupportFollowupsProps) {
  const router = useRouter()
  const [showAddForm, setShowAddForm] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [result, setResult] = useState<ActionResult<{ id: string }> | null>(null)

  function handleSubmit(formData: FormData) {
    formData.set("support_record_id", supportRecordId)
    startTransition(async () => {
      const res = await createSupportFollowupAction(null, formData)
      setResult(res)
      if (res.ok) {
        setShowAddForm(false)
        router.refresh()
      }
    })
  }

  function handleDelete(followupId: string) {
    if (!window.confirm("คุณต้องการลบบันทึกการติดตามผลนี้ใช่หรือไม่?")) return
    startTransition(async () => {
      const res = await deleteSupportFollowupAction(followupId, supportRecordId)
      setResult(res)
      if (res.ok) {
        router.refresh()
      }
    })
  }

  return (
    <div className="space-y-4 rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-xs">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
            <Clock className="size-4 text-primary" />
            ประวัติการติดตามผล (Follow-up Logs)
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            บันทึกการติดตามความคืบหน้าและการเปลี่ยนแปลงของนักเรียน ({followups.length} ครั้ง)
          </p>
        </div>

        {canEdit && !showAddForm ? (
          <Button
            type="button"
            size="sm"
            onClick={() => setShowAddForm(true)}
            className="gap-1.5 text-xs"
          >
            <Plus className="size-3.5" />
            บันทึกการติดตามผล
          </Button>
        ) : null}
      </div>

      <ActionFeedback result={result} />

      {/* Add Followup Form */}
      {showAddForm ? (
        <form
          action={handleSubmit}
          className="space-y-4 rounded-xl border border-primary/20 bg-muted/20 p-4 transition-all"
        >
          <h3 className="text-sm font-semibold text-foreground">
            เพิ่มบันทึกการติดตามผลเคส
          </h3>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                วันที่ติดตามผล *
              </label>
              <Input
                type="date"
                name="followup_date"
                defaultValue={new Date().toISOString().slice(0, 10)}
                required
                className="h-9"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                ผลการติดตาม
              </label>
              <Input
                name="result"
                placeholder="เช่น ดีขึ้นอย่างเห็นได้ชัด, ทรงตัว"
                className="h-9"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">
              รายละเอียดและข้อสังเกตการติดตามผล *
            </label>
            <textarea
              name="description"
              rows={3}
              required
              placeholder="ระบุข้อสังเกต พฤติกรรมที่สังเกตได้ และความคืบหน้าของนักเรียน..."
              className="w-full rounded-md border border-input bg-background p-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                การดำเนินการขั้นต่อไป (Next Action)
              </label>
              <Input
                name="next_action"
                placeholder="เช่น นัดพบผู้ปกครอง, ติดตามผลการเรียนสัปดาห์หน้า"
                className="h-9"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                กำหนดนัดติดตามครั้งถัดไป
              </label>
              <Input
                type="date"
                name="next_followup_date"
                className="h-9"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="improvement_noted"
              name="improvement_noted"
              value="true"
              className="size-4 rounded border-input text-primary focus:ring-ring"
            />
            <label htmlFor="improvement_noted" className="text-xs font-medium text-foreground cursor-pointer">
              นักเรียนมีพัฒนาการหรือพฤติกรรมที่ดีขึ้นอย่างมีนัยสำคัญ (Improvement Noted)
            </label>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/50">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowAddForm(false)}
              disabled={isPending}
            >
              ยกเลิก
            </Button>
            <Button type="submit" size="sm" disabled={isPending} className="gap-1.5">
              {isPending ? <Loader2 className="size-3.5 animate-spin" /> : null}
              {isPending ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
            </Button>
          </div>
        </form>
      ) : null}

      {/* Followup Timeline */}
      {followups.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
          ยังไม่มีประวัติการติดตามผลสำหรับเคสนี้
          {canEdit ? " (สามารถกดปุ่ม 'บันทึกการติดตามผล' เพื่อเริ่มบันทึก)" : ""}
        </div>
      ) : (
        <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
          {followups.map((item) => {
            const hasImprovement = item.improvement_noted

            return (
              <div key={item.id} className="relative space-y-2">
                {/* Timeline Dot */}
                <span
                  className={`absolute -left-6 top-1.5 size-3 rounded-full border-2 border-card ${
                    hasImprovement ? "bg-emerald-500 ring-2 ring-emerald-100 dark:ring-emerald-950" : "bg-primary ring-2 ring-primary/20"
                  }`}
                />

                <div className="rounded-xl border border-border/80 bg-muted/10 p-4 space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-foreground flex items-center gap-1">
                        <Calendar className="size-3 text-muted-foreground" />
                        {formatThaiShortDate(item.followup_date)}
                      </span>

                      {item.result ? (
                        <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-foreground">
                          {item.result}
                        </span>
                      ) : null}

                      {hasImprovement ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
                          <TrendingUp className="size-3" />
                          มีพัฒนาการดีขึ้น
                        </span>
                      ) : null}
                    </div>

                    {canEdit ? (
                      <button
                        type="button"
                        onClick={() => handleDelete(item.id)}
                        disabled={isPending}
                        className="text-muted-foreground hover:text-destructive p-1 rounded transition-colors"
                        title="ลบบันทึกนี้"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    ) : null}
                  </div>

                  <p className="text-sm text-foreground whitespace-pre-wrap">
                    {item.description}
                  </p>

                  {item.next_action || item.next_followup_date ? (
                    <div className="rounded-lg bg-card border border-border/50 p-2.5 text-xs space-y-1 text-muted-foreground">
                      {item.next_action ? (
                        <div>
                          <strong className="text-foreground">แผนขั้นต่อไป:</strong> {item.next_action}
                        </div>
                      ) : null}
                      {item.next_followup_date ? (
                        <div>
                          <strong className="text-foreground">นัดหมายครั้งถัดไป:</strong>{" "}
                          {formatThaiShortDate(item.next_followup_date)}
                        </div>
                      ) : null}
                    </div>
                  ) : null}

                  {item.follower ? (
                    <div className="text-xs text-muted-foreground flex items-center gap-1 pt-1">
                      <User className="size-3" />
                      ผู้บันทึก: {item.follower.first_name} {item.follower.last_name}
                    </div>
                  ) : null}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
