import { AlertCircle, CheckCircle2 } from "lucide-react"

import type { ActionResult } from "@/lib/server/action-result"
import { cn } from "@/lib/utils"

type ActionFeedbackProps = {
  result: ActionResult<unknown> | null
  className?: string
}

export function ActionFeedback({ result, className }: ActionFeedbackProps) {
  if (!result) return null

  const Icon = result.ok ? CheckCircle2 : AlertCircle

  return (
    <div
      role={result.ok ? "status" : "alert"}
      aria-live="polite"
      className={cn(
        "flex items-start gap-2 rounded-md border px-3 py-2 text-sm",
        result.ok
          ? "border-emerald-200 bg-emerald-50 text-emerald-800"
          : "border-red-200 bg-red-50 text-red-800",
        className,
      )}
    >
      <Icon aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
      <span>{result.message}</span>
    </div>
  )
}
