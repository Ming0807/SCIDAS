"use client"

import { useActionState, useEffect } from "react"
import { LoaderCircle, Save } from "lucide-react"
import { useRouter } from "next/navigation"

import { createDevelopmentGoalAction, updateDevelopmentGoalAction, type DevelopmentGoal } from "@/app/actions/idp.actions"
import { ActionFeedback } from "@/components/forms"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import type { ActionResult } from "@/lib/server/action-result"

type GoalFormProps = { planId: string; goal?: DevelopmentGoal }

export function GoalForm({ planId, goal }: GoalFormProps) {
  const router = useRouter()
  const isEdit = Boolean(goal)
  const action = isEdit ? updateDevelopmentGoalAction : createDevelopmentGoalAction
  const [state, formAction, pending] = useActionState<ActionResult<{ id: string }> | null, FormData>(action, null)
  const fieldErrors = state?.ok === false ? state.fieldErrors : undefined

  useEffect(() => { if (state?.ok) router.refresh() }, [router, state])

  return (
    <form action={formAction} className="grid gap-3 rounded-lg border border-border bg-muted/20 p-4 sm:grid-cols-2">
      <input type="hidden" name={isEdit ? "id" : "plan_id"} value={isEdit ? goal?.id : planId} />
      {!isEdit ? <input type="hidden" name="goal_number" value="1" /> : null}
      <div className="space-y-2 sm:col-span-2">
        <label htmlFor={`${isEdit ? "goal-edit" : "goal-new"}-title`} className="text-sm font-medium">ชื่อเป้าหมาย <span className="text-destructive">*</span></label>
        <Input id={`${isEdit ? "goal-edit" : "goal-new"}-title`} name="title" required defaultValue={goal?.title ?? ""} placeholder="เช่น อ่านคำพื้นฐานได้คล่องขึ้น" aria-invalid={fieldErrors?.title ? true : undefined} />
      </div>
      <div className="space-y-2">
        <label htmlFor={`${isEdit ? "goal-edit" : "goal-new"}-category`} className="text-sm font-medium">หมวดหมู่</label>
        <Input id={`${isEdit ? "goal-edit" : "goal-new"}-category`} name="category" defaultValue={goal?.category ?? ""} placeholder="เช่น ด้านการเรียน" />
      </div>
      <div className="space-y-2">
        <label htmlFor={`${isEdit ? "goal-edit" : "goal-new"}-date`} className="text-sm font-medium">กำหนดเสร็จ</label>
        <Input id={`${isEdit ? "goal-edit" : "goal-new"}-date`} name="target_date" type="date" defaultValue={goal?.target_date ?? ""} />
      </div>
      <div className="space-y-2">
        <label htmlFor={`${isEdit ? "goal-edit" : "goal-new"}-current`} className="text-sm font-medium">สถานะปัจจุบัน</label>
        <Input id={`${isEdit ? "goal-edit" : "goal-new"}-current`} name="current_value" defaultValue={goal?.current_value ?? ""} />
      </div>
      <div className="space-y-2">
        <label htmlFor={`${isEdit ? "goal-edit" : "goal-new"}-target`} className="text-sm font-medium">ผลลัพธ์ที่คาดหวัง</label>
        <Input id={`${isEdit ? "goal-edit" : "goal-new"}-target`} name="target_value" defaultValue={goal?.target_value ?? ""} />
      </div>
      {isEdit ? (
        <>
          <div className="space-y-2">
            <label htmlFor="goal-edit-status" className="text-sm font-medium">สถานะ</label>
            <select id="goal-edit-status" name="status" defaultValue={goal?.status} className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
              <option value="not_started">ยังไม่เริ่ม</option><option value="in_progress">กำลังดำเนินการ</option><option value="achieved">บรรลุเป้าหมาย</option><option value="not_achieved">ยังไม่บรรลุ</option><option value="cancelled">ยกเลิก</option>
            </select>
          </div>
          <div className="space-y-2">
            <label htmlFor="goal-edit-progress" className="text-sm font-medium">ความก้าวหน้า (%)</label>
            <Input id="goal-edit-progress" name="progress" type="number" min="0" max="100" defaultValue={goal?.progress ?? 0} />
          </div>
        </>
      ) : null}
      <div className="space-y-2 sm:col-span-2">
        <label htmlFor={`${isEdit ? "goal-edit" : "goal-new"}-description`} className="text-sm font-medium">รายละเอียด</label>
        <Textarea id={`${isEdit ? "goal-edit" : "goal-new"}-description`} name="description" rows={3} defaultValue={goal?.description ?? ""} />
      </div>
      <div className="sm:col-span-2"><ActionFeedback result={state} /></div>
      <div className="flex justify-end sm:col-span-2"><Button type="submit" size="sm" disabled={pending} className="gap-2">{pending ? <LoaderCircle aria-hidden="true" className="size-4 animate-spin motion-reduce:animate-none" /> : <Save aria-hidden="true" className="size-4" />}{pending ? "กำลังบันทึก..." : isEdit ? "บันทึกเป้าหมาย" : "เพิ่มเป้าหมาย"}</Button></div>
    </form>
  )
}
