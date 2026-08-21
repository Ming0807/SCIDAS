"use client"

import { useActionState, useEffect } from "react"
import { LoaderCircle, Save } from "lucide-react"
import { useRouter } from "next/navigation"

import { createDevelopmentActivityAction, updateDevelopmentActivityAction, type DevelopmentActivity } from "@/app/actions/idp.actions"
import { ActionFeedback } from "@/components/forms"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import type { ActionResult } from "@/lib/server/action-result"

type ActivityFormProps = { goalId: string; activity?: DevelopmentActivity }

export function ActivityForm({ goalId, activity }: ActivityFormProps) {
  const router = useRouter()
  const isEdit = Boolean(activity)
  const action = isEdit ? updateDevelopmentActivityAction : createDevelopmentActivityAction
  const [state, formAction, pending] = useActionState<ActionResult<{ id: string }> | null, FormData>(action, null)
  useEffect(() => { if (state?.ok) router.refresh() }, [router, state])

  return (
    <form action={formAction} className="grid gap-3 rounded-lg border border-border bg-background p-3 sm:grid-cols-2">
      <input type="hidden" name={isEdit ? "id" : "goal_id"} value={isEdit ? activity?.id : goalId} />
      <div className="space-y-2 sm:col-span-2"><label htmlFor={`${isEdit ? "activity-edit" : "activity-new"}-title`} className="text-sm font-medium">ชื่อกิจกรรม <span className="text-destructive">*</span></label><Input id={`${isEdit ? "activity-edit" : "activity-new"}-title`} name="title" required defaultValue={activity?.title ?? ""} placeholder="เช่น ฝึกอ่านกับครูสัปดาห์ละ 2 ครั้ง" /></div>
      <div className="space-y-2"><label htmlFor={`${isEdit ? "activity-edit" : "activity-new"}-start`} className="text-sm font-medium">เริ่มกิจกรรม</label><Input id={`${isEdit ? "activity-edit" : "activity-new"}-start`} name="start_date" type="date" defaultValue={activity?.start_date ?? ""} /></div>
      <div className="space-y-2"><label htmlFor={`${isEdit ? "activity-edit" : "activity-new"}-end`} className="text-sm font-medium">สิ้นสุดกิจกรรม</label><Input id={`${isEdit ? "activity-edit" : "activity-new"}-end`} name="end_date" type="date" defaultValue={activity?.end_date ?? ""} /></div>
      <div className="space-y-2 sm:col-span-2"><label htmlFor={`${isEdit ? "activity-edit" : "activity-new"}-person`} className="text-sm font-medium">ผู้รับผิดชอบ</label><Input id={`${isEdit ? "activity-edit" : "activity-new"}-person`} name="responsible_person" defaultValue={activity?.responsible_person ?? ""} /></div>
      <div className="space-y-2 sm:col-span-2"><label htmlFor={`${isEdit ? "activity-edit" : "activity-new"}-description`} className="text-sm font-medium">รายละเอียด</label><Textarea id={`${isEdit ? "activity-edit" : "activity-new"}-description`} name="description" rows={2} defaultValue={activity?.description ?? ""} /></div>
      {isEdit ? <><div className="flex items-center gap-2 sm:col-span-2"><input id="activity-edit-completed" type="checkbox" name="is_completed" value="true" defaultChecked={activity?.is_completed ?? false} className="size-4 rounded border-input accent-primary" /><label htmlFor="activity-edit-completed" className="text-sm">ทำกิจกรรมเสร็จแล้ว</label></div><div className="space-y-2 sm:col-span-2"><label htmlFor="activity-edit-result" className="text-sm font-medium">ผลการดำเนินงาน</label><Textarea id="activity-edit-result" name="result" rows={2} defaultValue={activity?.result ?? ""} /></div></> : null}
      <div className="sm:col-span-2"><ActionFeedback result={state} /></div>
      <div className="flex justify-end sm:col-span-2"><Button type="submit" size="sm" disabled={pending} className="gap-2">{pending ? <LoaderCircle aria-hidden="true" className="size-4 animate-spin motion-reduce:animate-none" /> : <Save aria-hidden="true" className="size-4" />}{pending ? "กำลังบันทึก..." : isEdit ? "บันทึกกิจกรรม" : "เพิ่มกิจกรรม"}</Button></div>
    </form>
  )
}
