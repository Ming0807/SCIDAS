"use client"

import { useTransition } from "react"
import { Loader2, Play } from "lucide-react"

import { processReportJobAction } from "@/app/actions/reports.actions"
import { Button } from "@/components/ui/button"

export function ProcessReportButton() {
  const [isPending, startTransition] = useTransition()

  const handleProcess = () => {
    startTransition(async () => {
      await processReportJobAction()
    })
  }

  return (
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
  )
}
