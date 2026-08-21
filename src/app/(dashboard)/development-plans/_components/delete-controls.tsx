"use client"

import { deleteDevelopmentActivityAction, deleteDevelopmentEvaluationAction, deleteDevelopmentGoalAction } from "@/app/actions/idp.actions"
import { ConfirmActionButton } from "@/components/forms"

type DeleteControlProps = { kind: "goal" | "activity" | "evaluation"; id: string }

export function DeleteControl({ kind, id }: DeleteControlProps) {
  const config = {
    goal: { label: "ลบเป้าหมาย", title: "ยืนยันการลบเป้าหมาย", description: "กิจกรรมที่อยู่ใต้เป้าหมายนี้อาจไม่สามารถใช้งานต่อได้ ควรลบเฉพาะรายการที่บันทึกผิด", action: deleteDevelopmentGoalAction },
    activity: { label: "ลบกิจกรรม", title: "ยืนยันการลบกิจกรรม", description: "กิจกรรมนี้จะถูกลบออกจากแผนพัฒนา", action: deleteDevelopmentActivityAction },
    evaluation: { label: "ลบการประเมิน", title: "ยืนยันการลบการประเมิน", description: "บันทึกการประเมินนี้จะถูกลบออกจากประวัติแผน", action: deleteDevelopmentEvaluationAction },
  }[kind]

  return <ConfirmActionButton action={() => config.action(id)} label={config.label} title={config.title} description={config.description} confirmLabel={config.label} pendingLabel="กำลังลบ" size="sm" />
}
