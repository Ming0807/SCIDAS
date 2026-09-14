"use client"

import { useState } from "react"
import Link from "next/link"
import { FilePenLine, Printer } from "lucide-react"

import { Button } from "@/components/ui/button"
import { SupportPrintableDialog } from "./support-printable-dialog"
import type { SupportPrintData } from "@/lib/support-constants"

interface SupportDetailActionsProps {
  caseId: string
  canEdit: boolean
  printData: SupportPrintData
}

export function SupportDetailActions({
  caseId,
  canEdit,
  printData,
}: SupportDetailActionsProps) {
  const [isPrintOpen, setIsPrintOpen] = useState(false)

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        type="button"
        variant="outline"
        onClick={() => setIsPrintOpen(true)}
        className="gap-2 text-xs sm:text-sm"
      >
        <Printer aria-hidden="true" className="size-4 text-muted-foreground" />
        <span>พิมพ์แบบบันทึกการช่วยเหลือ (สพฐ.)</span>
      </Button>

      {canEdit ? (
        <Button
          nativeButton={false}
          variant="outline"
          render={<Link href={`/support/${caseId}/edit`} />}
          className="gap-2 text-xs sm:text-sm"
        >
          <FilePenLine aria-hidden="true" className="size-4" />
          <span>แก้ไขเคส</span>
        </Button>
      ) : null}

      <SupportPrintableDialog
        isOpen={isPrintOpen}
        onClose={() => setIsPrintOpen(false)}
        data={printData}
      />
    </div>
  )
}
