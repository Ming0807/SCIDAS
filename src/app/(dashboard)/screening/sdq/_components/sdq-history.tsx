"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { Trash2, Loader2, History } from "lucide-react"
import { toast } from "sonner"

import { deleteSdqAssessmentAction, type SdqHistoryItem } from "@/app/actions/sdq.actions"
import { EmptyState } from "@/components/feedback/empty-state"
import { getSdqClassificationLabel } from "@/lib/sdq-constants"
import { formatThaiShortDate } from "@/lib/student-care-formatters"
import { Button } from "@/components/ui/button"

export function SdqHistory({
  assessments,
  canDelete,
}: {
  assessments: SdqHistoryItem[]
  canDelete: boolean
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function handleDelete(id: string, dateLabel: string) {
    if (!confirm(`ยืนยันลบผลการประเมิน SDQ วันที่ ${dateLabel}?`)) return
    startTransition(async () => {
      const res = await deleteSdqAssessmentAction(id)
      if (res.ok) {
        toast.success(res.message)
        router.refresh()
      } else {
        toast.error(res.message)
      }
    })
  }

  return (
    <section aria-label="ประวัติการประเมิน SDQ" className="rounded-2xl border border-border bg-card p-5 shadow-xs">
      <div className="mb-1 flex items-center gap-2">
        <History aria-hidden="true" className="size-4 text-primary" />
        <h2 className="text-base font-semibold text-foreground">ประวัติการประเมิน ({assessments.length})</h2>
      </div>
      <p className="mb-4 text-xs text-muted-foreground">
        ผลย้อนหลังเรียงจากล่าสุด ประเมินใหม่ได้จากแบบฟอร์มด้านบน (บันทึกใหม่จะแทนที่สถานะล่าสุด)
      </p>

      {assessments.length === 0 ? (
        <EmptyState
          size="compact"
          title="ยังไม่มีประวัติการประเมิน"
          description="เมื่อบันทึกแบบประเมินครั้งแรก ประวัติจะแสดงที่นี่"
        />
      ) : (
        <ul className="divide-y divide-border">
          {assessments.map((item) => {
            const badge = getSdqClassificationLabel(
              item.riskLevel === "high" ? "problem" : item.riskLevel === "watch" ? "risk" : "normal",
            )
            return (
              <li key={item.id} className="flex items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">
                    {formatThaiShortDate(item.assessmentDate)} · คะแนน {item.riskScore ?? "-"}/40
                  </p>
                  <p className={`mt-0.5 inline-block rounded-full border px-2 py-0.5 text-xs font-semibold ${badge.color}`}>
                    {badge.text}
                  </p>
                </div>
                {canDelete ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(item.id, formatThaiShortDate(item.assessmentDate))}
                    className="gap-1 text-xs text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="size-3.5" />
                    ลบ
                  </Button>
                ) : null}
              </li>
            )
          })}
        </ul>
      )}
      {isPending ? (
        <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground" aria-live="polite">
          <Loader2 className="size-3.5 animate-spin" /> กำลังดำเนินการ...
        </p>
      ) : null}
    </section>
  )
}
