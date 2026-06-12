"use client"

import { useTransition, useState } from "react"
import { useRouter } from "next/navigation"
import { CheckCircle2, Loader2, Play, XCircle } from "lucide-react"

import { processReportJobAction } from "@/app/actions/reports.actions"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function ProcessReportButton() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [feedback, setFeedback] = useState<{
    ok: boolean
    message: string
  } | null>(null)

  const handleProcess = () => {
    setFeedback(null)
    startTransition(async () => {
      const result = await processReportJobAction()
      setFeedback({
        ok: result.ok,
        message: result.message,
      })
      router.refresh()
    })
  }

  return (
    <div className="space-y-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handleProcess}
        disabled={isPending}
        className="gap-1.5"
      >
        {isPending ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Play className="h-3.5 w-3.5" />
        )}
        {isPending ? "กำลังประมวลผล..." : "ประมวลผลรายงาน"}
      </Button>

      {feedback ? (
        <div
          aria-live="polite"
          className={cn(
            "rounded-lg border px-3 py-2 text-xs",
            feedback.ok
              ? "border-emerald-200 bg-emerald-50 text-emerald-900"
              : "border-destructive/30 bg-destructive/10 text-destructive",
          )}
        >
          <span className="inline-flex items-center gap-1.5">
            {feedback.ok ? (
              <CheckCircle2 className="h-3 w-3" />
            ) : (
              <XCircle className="h-3 w-3" />
            )}
            {feedback.message}
          </span>
        </div>
      ) : null}
    </div>
  )
}
