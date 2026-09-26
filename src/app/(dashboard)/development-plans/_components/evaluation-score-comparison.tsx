import { TrendingDown, TrendingUp, Minus } from "lucide-react"

import type { DevelopmentEvaluation } from "@/app/actions/idp.actions"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

function toNumber(value: string | number | null | undefined): number | null {
  if (value === null || value === undefined || value === "") return null
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

export function EvaluationScoreComparison({ evaluation }: { evaluation: DevelopmentEvaluation }) {
  const pre = toNumber(evaluation.pre_score)
  const post = toNumber(evaluation.post_score)

  if (pre === null && post === null) return null

  const delta = pre !== null && post !== null ? Math.round((post - pre) * 100) / 100 : null
  const verdict =
    delta === null ? null : delta > 0 ? "ดีขึ้น" : delta < 0 ? "แย่ลง" : "เท่าเดิม"

  return (
    <div className="rounded-lg border border-border bg-muted/20 p-3">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
        <div>
          <p className="text-xs text-muted-foreground">ก่อนช่วยเหลือ</p>
          <p className="mt-0.5 text-lg font-bold tabular-nums text-foreground">
            {pre !== null ? pre.toLocaleString("th-TH") : "-"}
          </p>
        </div>
        <div aria-hidden="true" className="text-lg font-bold text-muted-foreground">→</div>
        <div>
          <p className="text-xs text-muted-foreground">หลังช่วยเหลือ</p>
          <p className="mt-0.5 text-lg font-bold tabular-nums text-foreground">
            {post !== null ? post.toLocaleString("th-TH") : "-"}
          </p>
        </div>
        {verdict ? (
          <Badge
            variant="outline"
            className={cn(
              "gap-1",
              verdict === "ดีขึ้น" && "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300",
              verdict === "แย่ลง" && "border-rose-300 bg-rose-50 text-rose-700 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-300",
            )}
          >
            {verdict === "ดีขึ้น" ? <TrendingUp className="size-3.5" /> : verdict === "แย่ลง" ? <TrendingDown className="size-3.5" /> : <Minus className="size-3.5" />}
            {verdict}
            {delta !== null && delta !== 0 ? ` (${delta > 0 ? "+" : ""}${delta.toLocaleString("th-TH")})` : ""}
          </Badge>
        ) : null}
      </div>
      {pre !== null && post !== null ? (
        <div className="mt-2.5 flex h-2.5 gap-1 overflow-hidden rounded-full" aria-hidden="true">
          <div className="rounded-full bg-muted-foreground/40" style={{ width: `${Math.max(0, Math.min(100, pre))}%` }} />
          <div className="flex-1 rounded-full bg-primary/20" />
        </div>
      ) : (
        <p className="mt-1.5 text-xs text-muted-foreground">บันทึกคะแนนอีกฝั่งเพื่อดูผลเปรียบเทียบ</p>
      )}
    </div>
  )
}
