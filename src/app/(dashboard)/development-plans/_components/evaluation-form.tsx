"use client"

import { useActionState, useEffect } from "react"
import { LoaderCircle, Save } from "lucide-react"
import { useRouter } from "next/navigation"

import { createDevelopmentEvaluationAction, updateDevelopmentEvaluationAction, type DevelopmentEvaluation } from "@/app/actions/idp.actions"
import { ActionFeedback } from "@/components/forms"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import type { ActionResult } from "@/lib/server/action-result"

type EvaluationFormProps = { planId: string; evaluation?: DevelopmentEvaluation }

export function EvaluationForm({ planId, evaluation }: EvaluationFormProps) {
  const router = useRouter()
  const isEdit = Boolean(evaluation)
  const action = isEdit ? updateDevelopmentEvaluationAction : createDevelopmentEvaluationAction
  const [state, formAction, pending] = useActionState<ActionResult<{ id: string }> | null, FormData>(action, null)
  useEffect(() => { if (state?.ok) router.refresh() }, [router, state])

  return (
    <form action={formAction} className="grid gap-3 rounded-lg border border-border bg-muted/20 p-4 sm:grid-cols-2">
      <input type="hidden" name={isEdit ? "id" : "plan_id"} value={isEdit ? evaluation?.id : planId} />
      <div className="space-y-2"><label htmlFor={`${isEdit ? "evaluation-edit" : "evaluation-new"}-date`} className="text-sm font-medium">วันที่ประเมิน <span className="text-destructive">*</span></label><Input id={`${isEdit ? "evaluation-edit" : "evaluation-new"}-date`} name="evaluation_date" type="date" required defaultValue={evaluation?.evaluation_date ?? new Date().toISOString().slice(0, 10)} /></div>
      <div className="space-y-2"><label htmlFor={`${isEdit ? "evaluation-edit" : "evaluation-new"}-round`} className="text-sm font-medium">รอบที่</label><Input id={`${isEdit ? "evaluation-edit" : "evaluation-new"}-round`} name="evaluation_round" type="number" min="1" step="1" required defaultValue={evaluation?.evaluation_round ?? 1} /></div>
      <div className="space-y-2 sm:col-span-2"><label htmlFor={`${isEdit ? "evaluation-edit" : "evaluation-new"}-result`} className="text-sm font-medium">ผลการประเมินโดยรวม <span className="text-destructive">*</span></label><Textarea id={`${isEdit ? "evaluation-edit" : "evaluation-new"}-result`} name="overall_result" required rows={3} defaultValue={evaluation?.overall_result ?? ""} /></div>
      <div className="space-y-2"><label htmlFor={`${isEdit ? "evaluation-edit" : "evaluation-new"}-strengths`} className="text-sm font-medium">จุดแข็ง</label><Textarea id={`${isEdit ? "evaluation-edit" : "evaluation-new"}-strengths`} name="strengths" rows={3} defaultValue={evaluation?.strengths ?? ""} /></div>
      <div className="space-y-2"><label htmlFor={`${isEdit ? "evaluation-edit" : "evaluation-new"}-improve`} className="text-sm font-medium">สิ่งที่ควรพัฒนา</label><Textarea id={`${isEdit ? "evaluation-edit" : "evaluation-new"}-improve`} name="areas_for_improvement" rows={3} defaultValue={evaluation?.areas_for_improvement ?? ""} /></div>
      <div className="space-y-2 sm:col-span-2"><label htmlFor={`${isEdit ? "evaluation-edit" : "evaluation-new"}-recommendations`} className="text-sm font-medium">ข้อเสนอแนะ</label><Textarea id={`${isEdit ? "evaluation-edit" : "evaluation-new"}-recommendations`} name="recommendations" rows={3} defaultValue={evaluation?.recommendations ?? ""} /></div>
      <div className="flex items-center gap-2 sm:col-span-2"><input id={`${isEdit ? "evaluation-edit" : "evaluation-new"}-continue`} type="checkbox" name="continue_plan" value="true" defaultChecked={evaluation?.continue_plan ?? true} className="size-4 rounded border-input accent-primary" /><label htmlFor={`${isEdit ? "evaluation-edit" : "evaluation-new"}-continue`} className="text-sm">ดำเนินแผนต่อ</label></div>
      <div className="sm:col-span-2"><ActionFeedback result={state} /></div>
      <div className="flex justify-end sm:col-span-2"><Button type="submit" size="sm" disabled={pending} className="gap-2">{pending ? <LoaderCircle aria-hidden="true" className="size-4 animate-spin motion-reduce:animate-none" /> : <Save aria-hidden="true" className="size-4" />}{pending ? "กำลังบันทึก..." : isEdit ? "บันทึกการประเมิน" : "เพิ่มการประเมิน"}</Button></div>
    </form>
  )
}
