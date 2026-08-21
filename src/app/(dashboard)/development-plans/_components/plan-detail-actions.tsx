"use client"

import Link from "next/link"
import { Edit3 } from "lucide-react"

import { transitionDevelopmentPlanAction } from "@/app/actions/idp.actions"
import { ConfirmActionButton } from "@/components/forms"
import { Button } from "@/components/ui/button"

type PlanDetailActionsProps = {
  planId: string
  status: "draft" | "active" | "completed" | "cancelled"
  canEdit: boolean
}

export function PlanDetailActions({ planId, status, canEdit }: PlanDetailActionsProps) {
  if (!canEdit) return null

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button nativeButton={false} variant="outline" size="sm" className="gap-2" render={<Link href={`/development-plans/${planId}/edit`} />}><Edit3 aria-hidden="true" className="size-4" />แก้ไขแผน</Button>
      {status === "draft" ? <ConfirmActionButton action={() => transitionDevelopmentPlanAction(planId, "active")} label="เริ่มดำเนินแผน" title="ยืนยันการเริ่มดำเนินแผน" description="ทีมดูแลจะเริ่มติดตามเป้าหมายและกิจกรรมของแผนนี้" confirmLabel="เริ่มดำเนินแผน" pendingLabel="กำลังเริ่มแผน" /> : null}
      {status === "active" ? <ConfirmActionButton action={() => transitionDevelopmentPlanAction(planId, "completed")} label="ปิดแผนว่าเสร็จสิ้น" title="ยืนยันการปิดแผน" description="เมื่อปิดแล้ว แผนและรายการย่อยจะเปลี่ยนเป็นอ่านอย่างเดียว" confirmLabel="ยืนยันปิดแผน" pendingLabel="กำลังปิดแผน" /> : null}
      <ConfirmActionButton action={() => transitionDevelopmentPlanAction(planId, "cancelled")} label="ยกเลิกแผน" title="ยืนยันการยกเลิกแผน" description="แผนจะยังคงอยู่ในประวัติ แต่จะไม่ถูกติดตามเป็นแผนที่กำลังดำเนินการ" confirmLabel="ยืนยันยกเลิกแผน" pendingLabel="กำลังยกเลิก" />
    </div>
  )
}
