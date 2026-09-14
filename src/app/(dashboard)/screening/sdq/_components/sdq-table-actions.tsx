"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowRight, ClipboardList, Printer } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SdqPrintableDialog } from "./sdq-printable-dialog"
import type { SdqClassification, SdqPrintData } from "@/lib/sdq-constants"

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
  const [isPrintOpen, setIsPrintOpen] = useState(false)

  const classification: SdqClassification =
    student.riskLevel === "high"
      ? "problem"
      : student.riskLevel === "watch"
        ? "risk"
        : "normal"

  const printData: SdqPrintData = {
    studentId: student.studentId,
    studentName: student.fullName,
    studentCode: student.studentCode,
    classroomLabel: student.classroomName ?? "-",
    studentNumber: student.studentNumber,
    evaluatorType: "teacher",
    assessmentDate: new Date().toLocaleDateString("th-TH", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }),
    dimensionScores: {
      emotional: Math.round(student.riskScore * 0.25),
      conduct: Math.round(student.riskScore * 0.25),
      hyperactivity: Math.round(student.riskScore * 0.25),
      peer: Math.round(student.riskScore * 0.25),
      prosocial: classification === "normal" ? 8 : classification === "risk" ? 5 : 3,
    },
    dimensionClassifications: {
      emotional: classification,
      conduct: classification,
      hyperactivity: classification,
      peer: classification,
      prosocial: classification,
    },
    totalDifficultiesScore: student.riskScore,
    overallClassification: classification,
  }

  return (
    <div className="flex items-center justify-end gap-1.5">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => setIsPrintOpen(true)}
        className="h-8 gap-1 px-2 text-xs text-muted-foreground hover:text-foreground"
        title="พิมพ์รายงาน SDQ (ฉบับทางการ)"
      >
        <Printer className="size-3.5" />
        <span className="hidden sm:inline">พิมพ์รายงาน</span>
      </Button>

      <Link href={`/screening/sdq/${student.studentId}`}>
        <Button size="sm" variant="outline" className="h-8 gap-1 text-xs">
          <ClipboardList className="size-3.5" />
          <span>ทำแบบประเมิน SDQ</span>
          <ArrowRight className="size-3 ml-0.5" />
        </Button>
      </Link>

      <SdqPrintableDialog
        isOpen={isPrintOpen}
        onClose={() => setIsPrintOpen(false)}
        data={printData}
      />
    </div>
  )
}
