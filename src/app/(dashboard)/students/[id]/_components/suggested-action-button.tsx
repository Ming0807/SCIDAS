"use client"

import { useState, useTransition } from "react"
import { Check, LoaderCircle, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createActionItemFromSuggestionAction } from "@/app/actions/risk.actions"
import type { SuggestedActionRuleId } from "@/lib/server/risk-action-rules"

export function SuggestedActionButton({
  studentId,
  ruleId,
}: {
  studentId: string
  ruleId: SuggestedActionRuleId
}) {
  const [isPending, startTransition] = useTransition()
  const [done, setDone] = useState(false)

  const handleCreate = () => {
    startTransition(async () => {
      const res = await createActionItemFromSuggestionAction(studentId, ruleId)
      if (res.ok) {
        setDone(true)
      }
    })
  }

  if (done) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
        <Check className="size-3" />
        เพิ่มในงานดูแลแล้ว
      </span>
    )
  }

  return (
    <Button
      size="sm"
      variant="outline"
      disabled={isPending}
      onClick={handleCreate}
      className="h-7 text-xs gap-1"
    >
      {isPending ? <LoaderCircle className="size-3 animate-spin" /> : <Plus className="size-3" />}
      เพิ่มในคิวงานดูแล
    </Button>
  )
}
