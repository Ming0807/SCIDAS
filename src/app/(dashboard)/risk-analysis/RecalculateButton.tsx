"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { recalculateAllRiskScores } from "@/app/actions/risk.actions"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export function RecalculateButton() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleRecalculate = async () => {
    setLoading(true)
    try {
      const res = await recalculateAllRiskScores()
      if (res?.success) {
        toast.success("Recalculated all risk scores successfully.")
        router.refresh()
      } else {
        toast.error("Failed to recalculate.")
      }
    } catch (e) {
      toast.error((e as Error).message || "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button onClick={handleRecalculate} disabled={loading}>
      {loading ? "Recalculating..." : "Recalculate All"}
    </Button>
  )
}
