"use client"

import Link from "next/link"
import { ArrowRight, ClipboardList } from "lucide-react"
import { Button } from "@/components/ui/button"

interface SdqTableActionsProps {
  student: {
    studentId: string
    studentCode: string
    fullName: string
    classroomName: string | null
    studentNumber: number | null
    riskLevel: string
    riskScore: number
  }
}

export function SdqTableActions({ student }: SdqTableActionsProps) {
  return (
    <div className="flex items-center justify-end gap-1.5">
      <span className="hidden text-xs text-muted-foreground xl:inline">
        พิมพ์รายงานได้หลังบันทึกผลประเมิน
      </span>

      <Link href={`/screening/sdq/${student.studentId}`}>
        <Button size="sm" variant="outline" className="h-8 gap-1 text-xs">
          <ClipboardList className="size-3.5" />
          <span>ทำแบบประเมิน SDQ</span>
          <ArrowRight className="size-3 ml-0.5" />
        </Button>
      </Link>
    </div>
  )
}
