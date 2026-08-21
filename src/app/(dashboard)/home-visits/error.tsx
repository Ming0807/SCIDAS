"use client"

import { RefreshCw } from "lucide-react"

import { PageShell } from "@/components/dashboard"
import { ErrorState } from "@/components/feedback"
import { Button } from "@/components/ui/button"

export default function HomeVisitsError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  void error

  return (
    <PageShell>
      <ErrorState
        title="เกิดข้อผิดพลาดในการโหลดข้อมูลเยี่ยมบ้าน"
        description="กรุณาลองโหลดหน้านี้อีกครั้ง"
        action={
          <Button type="button" onClick={reset}>
            <RefreshCw /> ลองใหม่
          </Button>
        }
      />
    </PageShell>
  )
}
