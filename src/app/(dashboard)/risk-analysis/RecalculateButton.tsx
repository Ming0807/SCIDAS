"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { recalculateAllRiskScores } from "@/app/actions/risk.actions"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export function RecalculateButton({ canRecalculate = true }: { canRecalculate?: boolean }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  if (!canRecalculate) {
    return null
  }

  const handleRecalculate = async () => {
    const confirmed = window.confirm(
      "คุณต้องการคำนวณคะแนนความเสี่ยงใหม่สำหรับนักเรียนทุกคนในโรงเรียนใช่หรือไม่? การประมวลผลอาจใช้เวลาสักครู่"
    )
    if (!confirmed) return

    setLoading(true)
    try {
      const res = await recalculateAllRiskScores()
      if (res?.success) {
        toast.success("คำนวณคะแนนความเสี่ยงใหม่เรียบร้อยแล้ว")
        router.refresh()
      } else {
        toast.error(res?.error === "Forbidden" ? "คุณไม่มีสิทธิ์คำนวณความเสี่ยงทั้งโรงเรียน (เฉพาะผู้ดูแลระบบหรือผู้อำนวยการ)" : (res?.error || "คำนวณคะแนนใหม่ไม่สำเร็จ กรุณาลองอีกครั้ง"))
      }
    } catch (e) {
      toast.error((e as Error).message || "เกิดข้อผิดพลาด กรุณาลองอีกครั้ง")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button onClick={handleRecalculate} disabled={loading}>
      {loading ? "กำลังคำนวณ..." : "คำนวณความเสี่ยงใหม่"}
    </Button>
  )
}
