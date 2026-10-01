"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  Trash2,
  Loader2,
  History,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  FileText,
  Share2,
  HeartHandshake,
} from "lucide-react"
import { toast } from "sonner"

import { deleteSdqAssessmentAction, type SdqHistoryItem } from "@/app/actions/sdq.actions"
import { EmptyState } from "@/components/feedback/empty-state"
import { getSdqClassificationLabel } from "@/lib/sdq-constants"
import { formatThaiShortDate } from "@/lib/student-care-formatters"
import { Button, buttonVariants } from "@/components/ui/button"
import { calculateSdqTrend } from "@/lib/server/sdq-trend"
import { cn } from "@/lib/utils"

export function SdqHistory({
  assessments,
  canDelete,
  studentId,
}: {
  assessments: SdqHistoryItem[]
  canDelete: boolean
  studentId?: string
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

  const trend = calculateSdqTrend(assessments)

  return (
    <section aria-label="ประวัติการประเมิน SDQ" className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-border pb-3">
        <div>
          <div className="flex items-center gap-2">
            <History aria-hidden="true" className="size-4 text-primary" />
            <h2 className="text-base font-semibold text-foreground">ประวัติการประเมิน ({assessments.length})</h2>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            ผลย้อนหลังเรียงจากล่าสุด ประเมินใหม่ได้จากแบบฟอร์มด้านบน (บันทึกใหม่จะแทนที่สถานะล่าสุด)
          </p>
        </div>

        {trend.hasTrend && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">แนวโน้ม:</span>
            <span
              className={cn(
                "inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border",
                trend.direction === "worsened"
                  ? "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900"
                  : trend.direction === "improved"
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900"
                    : "bg-muted text-muted-foreground border-border"
              )}
            >
              {trend.direction === "worsened" ? (
                <>
                  <TrendingUp className="size-3 text-rose-600" />
                  ความยากลำบากเพิ่มขึ้น {trend.scoreDelta ? `(+${trend.scoreDelta})` : ""}
                </>
              ) : trend.direction === "improved" ? (
                <>
                  <TrendingDown className="size-3 text-emerald-600" />
                  พัฒนาการดีขึ้น {trend.scoreDelta ? `(${trend.scoreDelta})` : ""}
                </>
              ) : (
                <>
                  <Minus className="size-3" />
                  ทรงตัว
                </>
              )}
            </span>
          </div>
        )}
      </div>

      {/* Auto-flag Jump Recommendation (E4) */}
      {trend.isJump && studentId ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50/80 p-4 dark:border-rose-900 dark:bg-rose-950/40 space-y-3">
          <div className="flex items-start gap-3">
            <AlertTriangle className="size-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h3 className="text-xs font-semibold text-rose-900 dark:text-rose-200">
                ระบบตรวจพบแนวโน้มความเสี่ยงเพิ่มขึ้นอย่างมีนัยสำคัญ (SDQ Jump)
              </h3>
              <p className="text-xs text-rose-800/90 dark:text-rose-300">
                {trend.message} แนะนำให้เริ่มการช่วยเหลือเร่งด่วนตามระบบ สพฐ. 5 ขั้นตอน
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-rose-200/60 dark:border-rose-900/60">
            {trend.suggestedAction === "referral" ? (
              <Link
                href={`/referrals/new?studentId=${studentId}`}
                className={cn(buttonVariants({ size: "sm" }), "text-xs h-8 bg-rose-600 hover:bg-rose-700 text-white")}
              >
                <Share2 className="size-3.5 mr-1" />
                ส่งต่อนักเรียน (Referral)
              </Link>
            ) : null}

            <Link
              href={`/development-plans/new?studentId=${studentId}`}
              className={cn(buttonVariants({ variant: "outline", size: "sm" }), "text-xs h-8 bg-card")}
            >
              <FileText className="size-3.5 mr-1" />
              สร้างแผนพัฒนาตนเอง (IDP)
            </Link>

            <Link
              href={`/support/new?studentId=${studentId}`}
              className={cn(buttonVariants({ variant: "outline", size: "sm" }), "text-xs h-8 bg-card")}
            >
              <HeartHandshake className="size-3.5 mr-1" />
              บันทึกการช่วยเหลือ (Support)
            </Link>
          </div>
        </div>
      ) : null}

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
