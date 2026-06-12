import React from "react"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"

export function MobileRiskHeader() {
  return (
    <div className="bg-card sticky top-0 z-20 pt-6 pb-4 px-4 border-b border-border">
      <div className="flex items-center gap-3">
        <Link
          href="/"
          className="p-2 -ml-2 text-muted-foreground hover:text-foreground rounded-full"
        >
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-lg font-bold text-foreground">
            วิเคราะห์ความเสี่ยง
          </h1>
          <p className="text-xs text-muted-foreground">
            ติดตามและวิเคราะห์ความเสี่ยงนักเรียน
          </p>
        </div>
      </div>
    </div>
  )
}
