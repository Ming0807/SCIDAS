"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Calendar,
  Layers,
  Archive,
  Loader2,
} from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { rolloverSemesterAction } from "@/app/actions/academic-admin.actions"
import type { AcademicYearItem, SemesterItem } from "@/lib/server/academic-admin-read-models"
import { formatThaiShortDate } from "@/lib/student-care-formatters"

interface SemesterRolloverWizardProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  academicYears: AcademicYearItem[]
  semesters: SemesterItem[]
}

export function SemesterRolloverWizard({
  open,
  onOpenChange,
  academicYears,
  semesters,
}: SemesterRolloverWizardProps) {
  const router = useRouter()
  const [isPending, startTransition] = React.useTransition()

  // Find current semester
  const currentSemester = semesters.find((s) => s.isCurrent)

  // Target semester defaults to first non-current or second semester
  const initialTarget =
    semesters.find((s) => !s.isCurrent) || semesters[0]

  const [targetSemesterId, setTargetSemesterId] = React.useState<string>(
    initialTarget?.id || "",
  )
  const [carryoverHomerooms, setCarryoverHomerooms] = React.useState(true)
  const [archiveCompleted, setArchiveCompleted] = React.useState(true)
  const [setAsCurrent, setSetAsCurrent] = React.useState(true)

  const selectedTargetSemester = semesters.find((s) => s.id === targetSemesterId)
  const targetYear = academicYears.find(
    (y) => y.id === selectedTargetSemester?.academicYearId,
  )
  const currentYear = academicYears.find(
    (y) => y.id === currentSemester?.academicYearId,
  )

  const handleRollover = () => {
    if (!targetSemesterId) {
      toast.error("กรุณาเลือกภาคเรียนปลายทาง")
      return
    }

    if (currentSemester && targetSemesterId === currentSemester.id) {
      toast.error("ภาคเรียนปลายทางต้องไม่ใช่ภาคเรียนปัจจุบัน")
      return
    }

    startTransition(async () => {
      const res = await rolloverSemesterAction({
        targetSemesterId,
        sourceSemesterId: currentSemester?.id,
        carryoverHomerooms,
        archiveCompletedCases: archiveCompleted,
        setAsCurrent,
      })

      if (res.ok) {
        toast.success(res.message || "เปลี่ยนผ่านภาคเรียนเรียบร้อยแล้ว")
        onOpenChange(false)
        router.refresh()
      } else {
        toast.error(res.message || "เกิดข้อผิดพลาดในการเปลี่ยนผ่านภาคเรียน")
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base font-semibold">
            <RefreshCw className="size-5 text-primary" />
            <span>ตัวช่วยเปลี่ยนผ่านภาคเรียน (Semester Rollover Wizard)</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            บริหารจัดการการขึ้นภาคเรียนใหม่ โอนย้ายโครงสร้างห้องเรียน และจัดระเบียบข้อมูลการดูแลนักเรียน
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-1 text-sm">
          {/* Step 1: Comparison Banner */}
          <div className="rounded-lg border border-border bg-muted/40 p-3.5 space-y-2.5">
            <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
              <span>ภาคเรียนปัจจุบัน (ปัจจุบัน)</span>
              <ArrowRight className="size-3.5 text-muted-foreground" />
              <span>ภาคเรียนปลายทาง (ใหม่)</span>
            </div>

            <div className="flex items-center justify-between gap-3 text-sm">
              <div className="rounded-md border border-border/80 bg-background p-2.5 flex-1 min-w-0">
                <p className="font-semibold text-foreground truncate">
                  {currentSemester ? `เทอม ${currentSemester.semester}` : "ยังไม่ระบุ"}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  ปีการศึกษา {currentYear?.year ?? "-"}
                </p>
              </div>

              <ArrowRight className="size-4 shrink-0 text-primary" />

              <div className="rounded-md border border-primary/40 bg-primary/5 p-2.5 flex-1 min-w-0">
                <p className="font-semibold text-primary truncate">
                  {selectedTargetSemester ? `เทอม ${selectedTargetSemester.semester}` : "เลือกภาคเรียน"}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  ปีการศึกษา {targetYear?.year ?? "-"}
                </p>
              </div>
            </div>
          </div>

          {/* Select Target Semester */}
          <div className="space-y-1.5">
            <label htmlFor="target-semester-select" className="text-xs font-semibold text-foreground">
              เลือกภาคเรียนปลายทางสำหรับเปลี่ยนผ่าน
            </label>
            <select
              id="target-semester-select"
              value={targetSemesterId}
              onChange={(e) => setTargetSemesterId(e.target.value)}
              className="w-full rounded-md border border-input bg-background p-2 text-xs font-medium text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {semesters.map((s) => {
                const y = academicYears.find((ay) => ay.id === s.academicYearId)
                return (
                  <option key={s.id} value={s.id} disabled={s.isCurrent}>
                    ภาคเรียนที่ {s.semester} / ปีการศึกษา {y?.year ?? "-"} (
                    {formatThaiShortDate(s.startDate)} - {formatThaiShortDate(s.endDate)})
                    {s.isCurrent ? " — (ภาคเรียนปัจจุบันแล้ว)" : ""}
                  </option>
                )
              })}
            </select>
          </div>

          {/* Step 2: Rollover Options */}
          <div className="space-y-2 border-t border-border pt-3">
            <h4 className="text-xs font-semibold text-foreground">ตัวเลือกการโอนย้ายและจัดระเบียบข้อมูล</h4>

            <label className="flex items-start gap-2.5 rounded-lg border border-border p-2.5 cursor-pointer hover:bg-muted/20">
              <input
                type="checkbox"
                checked={setAsCurrent}
                onChange={(e) => setSetAsCurrent(e.target.checked)}
                className="mt-0.5 size-4 rounded border-border text-primary focus:ring-primary"
              />
              <div className="text-xs">
                <span className="font-medium text-foreground flex items-center gap-1.5">
                  <Calendar className="size-3.5 text-primary" />
                  กำหนดภาคเรียนนี้เป็นภาคเรียนปัจจุบันทันที
                </span>
                <p className="text-muted-foreground mt-0.5">
                  ระบบเช็คชื่อ การประเมิน SDQ และการบันทึกผลการเรียนจะอ้างอิงภาคเรียนใหม่ทันที
                </p>
              </div>
            </label>

            <label className="flex items-start gap-2.5 rounded-lg border border-border p-2.5 cursor-pointer hover:bg-muted/20">
              <input
                type="checkbox"
                checked={carryoverHomerooms}
                onChange={(e) => setCarryoverHomerooms(e.target.checked)}
                className="mt-0.5 size-4 rounded border-border text-primary focus:ring-primary"
              />
              <div className="text-xs">
                <span className="font-medium text-foreground flex items-center gap-1.5">
                  <Layers className="size-3.5 text-primary" />
                  คงสภาพโครงสร้างห้องเรียนและครูประจำชั้น
                </span>
                <p className="text-muted-foreground mt-0.5">
                  ห้องเรียนที่มีอยู่เดิมจะเปิดใช้งานต่อในภาคเรียนใหม่พร้อมมอบหมายครูประจำชั้นเดิม
                </p>
              </div>
            </label>

            <label className="flex items-start gap-2.5 rounded-lg border border-border p-2.5 cursor-pointer hover:bg-muted/20">
              <input
                type="checkbox"
                checked={archiveCompleted}
                onChange={(e) => setArchiveCompleted(e.target.checked)}
                className="mt-0.5 size-4 rounded border-border text-primary focus:ring-primary"
              />
              <div className="text-xs">
                <span className="font-medium text-foreground flex items-center gap-1.5">
                  <Archive className="size-3.5 text-primary" />
                  จัดเก็บประวัติเคสช่วยเหลือที่เสร็จสิ้นแล้ว (Archive Completed Cases)
                </span>
                <p className="text-muted-foreground mt-0.5">
                  บันทึกประวัติความช่วยเหลือในภาคเรียนเดิม เพื่อให้หน้าเคสปัจจุบันแสดงเฉพาะเคสที่ยังคงดำเนินงาน
                </p>
              </div>
            </label>
          </div>

          {/* Safety Warning */}
          <div className="rounded-lg border border-amber-300 dark:border-amber-800/40 bg-amber-50/50 dark:bg-amber-950/20 p-2.5 flex items-start gap-2 text-xs text-amber-900 dark:text-amber-200">
            <AlertTriangle className="size-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
            <p>
              การเปลี่ยนภาคเรียนปัจจุบันจะมีผลต่อระบบทั้งหมดของโรงเรียนทันที
              ท่านสามารถสลับกลับมายังภาคเรียนเดิมได้ตลอดเวลาในหน้านี้
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            ยกเลิก
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleRollover}
            disabled={isPending || !targetSemesterId || targetSemesterId === currentSemester?.id}
            className="gap-1.5"
          >
            {isPending ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <CheckCircle2 className="size-3.5" />
            )}
            <span>ยืนยันการเปลี่ยนผ่านภาคเรียน</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
