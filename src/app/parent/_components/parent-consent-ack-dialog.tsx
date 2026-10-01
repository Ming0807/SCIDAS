"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { CheckCircle2, ShieldCheck, Loader2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { acknowledgeParentConsentAction } from "@/app/actions/parent.actions"

interface ParentConsentAckDialogProps {
  studentId: string
  targetType: "support" | "plan"
  targetId: string
  targetTitle: string
}

export function ParentConsentAckDialog({
  studentId,
  targetType,
  targetId,
  targetTitle,
}: ParentConsentAckDialogProps) {
  const [open, setOpen] = React.useState(false)
  const [agreed, setAgreed] = React.useState(false)
  const [notes, setNotes] = React.useState("")
  const [isPending, startTransition] = React.useTransition()
  const router = useRouter()

  const handleConfirm = () => {
    if (!agreed) {
      toast.error("กรุณาทำเครื่องหมายยินยอมรับทราบก่อนบันทึก")
      return
    }

    startTransition(async () => {
      const res = await acknowledgeParentConsentAction({
        studentId,
        targetType,
        targetId,
        notes: notes.trim() || undefined,
      })

      if (res.ok) {
        toast.success(res.message || "บันทึกการรับทราบและยินยอมเรียบร้อยแล้ว")
        setOpen(false)
        router.refresh()
      } else {
        toast.error(res.message || "เกิดข้อผิดพลาดในการบันทึกการรับทราบ")
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            variant="outline"
            size="sm"
            className="h-7 px-2.5 text-xs font-medium border-amber-300 dark:border-amber-700/60 bg-amber-50/50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 hover:bg-amber-100/60"
          >
            <ShieldCheck className="size-3.5 mr-1 text-amber-600 dark:text-amber-400" />
            <span>ยืนยันรับทราบ</span>
          </Button>
        }
      />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base font-semibold">
            <CheckCircle2 className="size-5 text-primary" />
            <span>รับทราบและยินยอมแผนการดูแล</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {targetType === "support" ? "การให้ความช่วยเหลือ" : "แผนพัฒนาเฉพาะบุคคล (IDP)"}:{" "}
            <span className="font-medium text-foreground">{targetTitle}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2 text-sm">
          <div className="rounded-lg border border-border bg-muted/40 p-3 space-y-2 text-xs text-muted-foreground leading-relaxed">
            <p>
              การยืนยันรับทราบนี้เป็นการแสดงว่าท่านผู้ปกครองได้รับทราบแผนงานการดูแลและส่งเสริมนักเรียน
              พร้อมทั้งอนุญาตให้ครูและบุคลากรทางการศึกษาดำเนินงานตามขั้นตอนการดูแลอย่างเหมาะสม
            </p>
          </div>

          <label className="flex items-start gap-2.5 rounded-lg border border-border p-3 cursor-pointer hover:bg-muted/20">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-0.5 size-4 rounded border-border text-primary focus:ring-primary"
            />
            <span className="text-xs font-medium text-foreground leading-normal">
              ข้าพเจ้าในฐานะผู้ปกครอง ได้รับทราบรายละเอียดแผนการดูแลและยินยอมให้โรงเรียนดำเนินงานตามแผน
            </span>
          </label>

          <div className="space-y-1.5">
            <label htmlFor="ack-notes" className="text-xs font-medium text-foreground">
              ข้อเสนอแนะหรือบันทึกเพิ่มเติมจากผู้ปกครอง (ถ้ามี)
            </label>
            <textarea
              id="ack-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="ระบุข้อความหรือข้อห่วงใยที่ต้องการแจ้งครู..."
              rows={3}
              maxLength={500}
              className="w-full rounded-md border border-input bg-background p-2 text-xs text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setOpen(false)}
            disabled={isPending}
          >
            ยกเลิก
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleConfirm}
            disabled={!agreed || isPending}
            className="gap-1.5"
          >
            {isPending ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <CheckCircle2 className="size-3.5" />
            )}
            <span>ยืนยันการรับทราบ</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
