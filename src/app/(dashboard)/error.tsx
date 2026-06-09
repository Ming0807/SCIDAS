"use client"

import { useEffect } from "react"
import { AlertCircle, RefreshCcw } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <div className="flex h-[80vh] w-full flex-col items-center justify-center gap-6 p-8 text-center animate-in fade-in zoom-in-95 duration-500">
      <div className="rounded-full bg-red-100 p-6 text-red-600">
        <AlertCircle className="h-12 w-12" />
      </div>
      <div className="space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">เกิดข้อผิดพลาดบางอย่าง</h2>
        <p className="text-slate-500 max-w-md mx-auto">
          เราขออภัยในความไม่สะดวก เกิดข้อผิดพลาดในการโหลดข้อมูลหน้านี้ กรุณาลองใหม่อีกครั้ง
        </p>
      </div>
      <div className="flex items-center gap-4 mt-4">
        <Button onClick={() => reset()} className="gap-2" size="lg">
          <RefreshCcw className="h-4 w-4" /> ลองใหม่อีกครั้ง
        </Button>
      </div>
      <div className="mt-8 text-sm text-slate-400 bg-slate-50 p-4 rounded-md border border-slate-100 max-w-xl break-all">
        <p className="font-mono text-left">Error: {error.message || "Unknown error occurred"}</p>
      </div>
    </div>
  )
}
