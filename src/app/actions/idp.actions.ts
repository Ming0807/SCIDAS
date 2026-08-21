"use server"

import { revalidatePath } from "next/cache"

import type { ActionResult } from "@/lib/server/action-result"
import { actionFail, actionOk } from "@/lib/server/action-result"
import {
  getCurrentUserContext,
  type AppRole,
  type CurrentUserContext,
} from "@/lib/server/current-user"
import type { Database } from "@/types/database.types"
import { createClient } from "@/utils/supabase/server"

export type DevelopmentPlan = Database["public"]["Tables"]["development_plans"]["Row"]
export type DevelopmentGoal = Database["public"]["Tables"]["development_goals"]["Row"]
export type DevelopmentActivity = Database["public"]["Tables"]["development_activities"]["Row"]
export type DevelopmentEvaluation = Database["public"]["Tables"]["development_evaluations"]["Row"]

type CrudId = { id: string }
type Client = Awaited<ReturnType<typeof createClient>>
type PlanStatus = Database["public"]["Enums"]["plan_status"]
type GoalStatus = Database["public"]["Enums"]["goal_status"]

const planEditors = new Set<AppRole>(["admin", "homeroom_teacher", "counselor"])
const evaluationEditors = new Set<AppRole>(["admin", "director", "homeroom_teacher", "counselor"])
const planTransitions: Record<PlanStatus, PlanStatus[]> = {
  draft: ["active", "cancelled"],
  active: ["completed", "cancelled"],
  completed: [],
  cancelled: [],
}
const goalStatuses = new Set<GoalStatus>([
  "not_started",
  "in_progress",
  "achieved",
  "not_achieved",
  "cancelled",
])
const datePattern = /^\d{4}-\d{2}-\d{2}$/

function text(formData: FormData, name: string): string {
  const value = formData.get(name)
  return typeof value === "string" ? value.trim() : ""
}

function optionalText(formData: FormData, name: string): string | null {
  return text(formData, name) || null
}

function validDate(value: string): boolean {
  if (!datePattern.test(value)) return false
  const parsed = new Date(`${value}T00:00:00.000Z`)
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value
}

function integer(formData: FormData, name: string, fallback = 0): number {
  const value = text(formData, name)
  if (!value) return fallback
  return Number(value)
}

function failFromError(error: unknown, message: string): ActionResult<CrudId> {
  if (error instanceof Error && error.message === "UNAUTHORIZED") {
    return actionFail("UNAUTHORIZED", "กรุณาเข้าสู่ระบบก่อนดำเนินการ")
  }
  if (error instanceof Error && error.message === "FORBIDDEN") {
    return actionFail("FORBIDDEN", "คุณไม่มีสิทธิ์ดำเนินการนี้")
  }
  console.error(message, error)
  return actionFail("INTERNAL_ERROR", message)
}

function revalidatePlan(planId?: string) {
  revalidatePath("/development-plans")
  if (planId) revalidatePath(`/development-plans/${planId}`)
}

async function getPlan(client: Client, planId: string, schoolId: string) {
  const { data, error } = await client
    .from("development_plans")
    .select("id, student_id, semester_id, status")
    .eq("id", planId)
    .eq("school_id", schoolId)
    .maybeSingle()
  if (error) throw error
  return data
}

async function getGoal(client: Client, goalId: string, schoolId: string) {
  const { data, error } = await client
    .from("development_goals")
    .select("id, plan_id")
    .eq("id", goalId)
    .eq("school_id", schoolId)
    .maybeSingle()
  if (error) throw error
  return data
}

function isPlanLocked(status: DevelopmentPlan["status"]): boolean {
  return status === "completed" || status === "cancelled"
}

async function requirePlanEditor(): Promise<CurrentUserContext & { profileId: string }> {
  const context = await getCurrentUserContext()
  if (!context.profileId) throw new Error("UNAUTHORIZED")
  if (!planEditors.has(context.role)) throw new Error("FORBIDDEN")
  return { ...context, profileId: context.profileId }
}

export async function getDevelopmentPlans() {
  const context = await getCurrentUserContext()
  const client = await createClient()
  const { data, error } = await client
    .from("development_plans")
    .select(`
      *,
      student:students(first_name, last_name, student_code),
      creator:profiles!development_plans_created_by_fkey(first_name, last_name)
    `)
    .eq("school_id", context.schoolId)
    .order("created_at", { ascending: false })
  if (error) throw new Error(error.message)
  return data ?? []
}

export async function getDevelopmentPlanById(id: string) {
  const context = await getCurrentUserContext()
  const client = await createClient()
  const { data, error } = await client
    .from("development_plans")
    .select(`
      *,
      student:students(first_name, last_name, student_code),
      creator:profiles!development_plans_created_by_fkey(first_name, last_name),
      semester:semesters(semester, start_date, end_date)
    `)
    .eq("id", id)
    .eq("school_id", context.schoolId)
    .maybeSingle()
  if (error) throw new Error(error.message)
  return data
}

export async function getDevelopmentGoals(planId: string) {
  const context = await getCurrentUserContext()
  const client = await createClient()
  const plan = await getPlan(client, planId, context.schoolId)
  if (!plan) return []
  const { data, error } = await client
    .from("development_goals")
    .select("*")
    .eq("school_id", context.schoolId)
    .eq("plan_id", planId)
    .order("goal_number")
  if (error) throw new Error(error.message)
  return data ?? []
}

export async function getDevelopmentActivities(goalId: string) {
  const context = await getCurrentUserContext()
  const client = await createClient()
  const goal = await getGoal(client, goalId, context.schoolId)
  if (!goal) return []
  const { data, error } = await client
    .from("development_activities")
    .select("*")
    .eq("school_id", context.schoolId)
    .eq("goal_id", goalId)
    .order("display_order")
  if (error) throw new Error(error.message)
  return data ?? []
}

export async function getDevelopmentEvaluations(planId: string) {
  const context = await getCurrentUserContext()
  const client = await createClient()
  const plan = await getPlan(client, planId, context.schoolId)
  if (!plan) return []
  const { data, error } = await client
    .from("development_evaluations")
    .select("*, evaluator:profiles!development_evaluations_evaluated_by_fkey(first_name, last_name)")
    .eq("school_id", context.schoolId)
    .eq("plan_id", planId)
    .order("evaluation_date", { ascending: false })
  if (error) throw new Error(error.message)
  return data ?? []
}

export async function createDevelopmentPlanAction(
  _previous: ActionResult<CrudId> | null,
  formData: FormData,
): Promise<ActionResult<CrudId>> {
  try {
    const context = await requirePlanEditor()
    const title = text(formData, "title")
    const studentId = text(formData, "student_id")
    const semesterId = text(formData, "semester_id")
    const startDate = text(formData, "start_date")
    const endDate = text(formData, "end_date")

    if (!title || !studentId || !semesterId || !validDate(startDate) || !validDate(endDate)) {
      return actionFail("VALIDATION_ERROR", "กรุณากรอกข้อมูลแผนให้ครบถ้วน")
    }
    if (endDate < startDate) {
      return actionFail("VALIDATION_ERROR", "วันสิ้นสุดต้องไม่ก่อนวันเริ่มต้น", {
        fieldErrors: { end_date: ["วันสิ้นสุดต้องไม่ก่อนวันเริ่มต้น"] },
      })
    }

    const client = await createClient()
    const [{ data: student }, { data: semester }] = await Promise.all([
      client.from("students").select("id").eq("id", studentId).eq("school_id", context.schoolId).maybeSingle(),
      client.from("semesters").select("id").eq("id", semesterId).eq("school_id", context.schoolId).maybeSingle(),
    ])
    if (!student || !semester) {
      return actionFail("FORBIDDEN", "นักเรียนหรือภาคการศึกษาไม่อยู่ในโรงเรียนของคุณ")
    }

    const { data, error } = await client
      .from("development_plans")
      .insert({
        school_id: context.schoolId,
        student_id: studentId,
        semester_id: semesterId,
        title,
        description: optionalText(formData, "description"),
        focus_areas: text(formData, "focus_areas").split(",").map((item) => item.trim()).filter(Boolean),
        start_date: startDate,
        end_date: endDate,
        status: "draft",
        created_by: context.profileId,
      })
      .select("id")
      .single()
    if (error) {
      console.error("Create development plan failed", error)
      return actionFail("INTERNAL_ERROR", "ไม่สามารถสร้างแผนพัฒนาได้")
    }

    revalidatePlan(data.id)
    return actionOk("สร้างแผนพัฒนาสำเร็จ", {
      data: { id: data.id },
      redirectTo: `/development-plans/${data.id}`,
    })
  } catch (error) {
    return failFromError(error, "ไม่สามารถสร้างแผนพัฒนาได้")
  }
}

export async function updateDevelopmentPlanAction(
  _previous: ActionResult<CrudId> | null,
  formData: FormData,
): Promise<ActionResult<CrudId>> {
  try {
    const context = await requirePlanEditor()
    const id = text(formData, "id")
    const title = text(formData, "title")
    const startDate = text(formData, "start_date")
    const endDate = text(formData, "end_date")
    const progress = integer(formData, "overall_progress")

    if (!id || !title || !validDate(startDate) || !validDate(endDate)) {
      return actionFail("VALIDATION_ERROR", "ข้อมูลแผนพัฒนาไม่ถูกต้อง")
    }
    if (endDate < startDate || !Number.isInteger(progress) || progress < 0 || progress > 100) {
      return actionFail("VALIDATION_ERROR", "กรุณาตรวจสอบวันที่และความก้าวหน้า")
    }

    const client = await createClient()
    const plan = await getPlan(client, id, context.schoolId)
    if (!plan) return actionFail("NOT_FOUND", "ไม่พบแผนพัฒนา")
    if (isPlanLocked(plan.status)) return actionFail("CONFLICT", "แผนที่เสร็จสิ้นหรือยกเลิกแล้วไม่สามารถแก้ไขได้")

    const { data, error } = await client
      .from("development_plans")
      .update({
        title,
        description: optionalText(formData, "description"),
        focus_areas: text(formData, "focus_areas").split(",").map((item) => item.trim()).filter(Boolean),
        start_date: startDate,
        end_date: endDate,
        status: plan.status,
        overall_progress: progress,
      })
      .eq("id", id)
      .eq("school_id", context.schoolId)
      .select("id")
      .maybeSingle()
    if (error || !data) return actionFail("INTERNAL_ERROR", "ไม่สามารถแก้ไขแผนพัฒนาได้")

    revalidatePlan(id)
    return actionOk("แก้ไขแผนพัฒนาสำเร็จ", { data: { id }, redirectTo: `/development-plans/${id}` })
  } catch (error) {
    return failFromError(error, "ไม่สามารถแก้ไขแผนพัฒนาได้")
  }
}

export async function cancelDevelopmentPlanAction(id: string): Promise<ActionResult<CrudId>> {
  return transitionDevelopmentPlanAction(id, "cancelled")
}

export async function transitionDevelopmentPlanAction(
  id: string,
  nextStatus: PlanStatus,
): Promise<ActionResult<CrudId>> {
  try {
    const context = await requirePlanEditor()
    const client = await createClient()
    const plan = await getPlan(client, id, context.schoolId)
    if (!plan) return actionFail("NOT_FOUND", "ไม่พบแผนพัฒนา")
    if (!planTransitions[plan.status].includes(nextStatus)) {
      return actionFail("CONFLICT", "ไม่สามารถเปลี่ยนสถานะแผนตามลำดับนี้ได้")
    }

    const { error } = await client
      .from("development_plans")
      .update({ status: nextStatus })
      .eq("id", id)
      .eq("school_id", context.schoolId)
    if (error) return actionFail("INTERNAL_ERROR", "ไม่สามารถยกเลิกแผนพัฒนาได้")
    revalidatePlan(id)
    const messages: Record<PlanStatus, string> = {
      draft: "เปลี่ยนแผนเป็นฉบับร่างแล้ว",
      active: "เริ่มดำเนินแผนพัฒนาแล้ว",
      completed: "ปิดแผนพัฒนาเป็นเสร็จสิ้นแล้ว",
      cancelled: "ยกเลิกแผนพัฒนาแล้ว",
    }
    return actionOk(messages[nextStatus], { data: { id } })
  } catch (error) {
    return failFromError(error, "ไม่สามารถเปลี่ยนสถานะแผนพัฒนาได้")
  }
}

export async function createDevelopmentGoalAction(
  _previous: ActionResult<CrudId> | null,
  formData: FormData,
): Promise<ActionResult<CrudId>> {
  try {
    const context = await requirePlanEditor()
    const planId = text(formData, "plan_id")
    const title = text(formData, "title")
    const goalNumber = integer(formData, "goal_number", 1)
    const targetDate = optionalText(formData, "target_date")
    if (!planId || !title || !Number.isInteger(goalNumber) || goalNumber < 1 || (targetDate && !validDate(targetDate))) {
      return actionFail("VALIDATION_ERROR", "ข้อมูลเป้าหมายไม่ถูกต้อง")
    }
    const client = await createClient()
    const plan = await getPlan(client, planId, context.schoolId)
    if (!plan) return actionFail("NOT_FOUND", "ไม่พบแผนพัฒนา")
    if (isPlanLocked(plan.status)) return actionFail("CONFLICT", "ไม่สามารถเพิ่มเป้าหมายในแผนที่ปิดแล้ว")

    const { data, error } = await client
      .from("development_goals")
      .insert({
        school_id: context.schoolId,
        plan_id: planId,
        goal_number: goalNumber,
        title,
        description: optionalText(formData, "description"),
        category: optionalText(formData, "category"),
        target_value: optionalText(formData, "target_value"),
        current_value: optionalText(formData, "current_value"),
        target_date: targetDate,
        status: "not_started",
        progress: 0,
      })
      .select("id")
      .single()
    if (error) return actionFail("INTERNAL_ERROR", "ไม่สามารถเพิ่มเป้าหมายได้")
    revalidatePlan(planId)
    return actionOk("เพิ่มเป้าหมายสำเร็จ", { data: { id: data.id } })
  } catch (error) {
    return failFromError(error, "ไม่สามารถเพิ่มเป้าหมายได้")
  }
}

export async function updateDevelopmentGoalAction(
  _previous: ActionResult<CrudId> | null,
  formData: FormData,
): Promise<ActionResult<CrudId>> {
  try {
    const context = await requirePlanEditor()
    const id = text(formData, "id")
    const title = text(formData, "title")
    const status = text(formData, "status") as GoalStatus
    const progress = integer(formData, "progress")
    const targetDate = optionalText(formData, "target_date")
    if (!id || !title || !goalStatuses.has(status) || !Number.isInteger(progress) || progress < 0 || progress > 100 || (targetDate && !validDate(targetDate))) {
      return actionFail("VALIDATION_ERROR", "ข้อมูลเป้าหมายไม่ถูกต้อง")
    }
    const client = await createClient()
    const goal = await getGoal(client, id, context.schoolId)
    if (!goal) return actionFail("NOT_FOUND", "ไม่พบเป้าหมาย")
    const plan = await getPlan(client, goal.plan_id, context.schoolId)
    if (!plan) return actionFail("NOT_FOUND", "ไม่พบแผนพัฒนา")
    if (isPlanLocked(plan.status)) return actionFail("CONFLICT", "ไม่สามารถแก้ไขเป้าหมายในแผนที่ปิดแล้ว")
    const { error } = await client
      .from("development_goals")
      .update({
        title,
        description: optionalText(formData, "description"),
        category: optionalText(formData, "category"),
        target_value: optionalText(formData, "target_value"),
        current_value: optionalText(formData, "current_value"),
        target_date: targetDate,
        status,
        progress,
        achieved_at: status === "achieved" ? new Date().toISOString().slice(0, 10) : null,
      })
      .eq("id", id)
      .eq("school_id", context.schoolId)
    if (error) return actionFail("INTERNAL_ERROR", "ไม่สามารถแก้ไขเป้าหมายได้")
    revalidatePlan(goal.plan_id)
    return actionOk("แก้ไขเป้าหมายสำเร็จ", { data: { id } })
  } catch (error) {
    return failFromError(error, "ไม่สามารถแก้ไขเป้าหมายได้")
  }
}

export async function deleteDevelopmentGoalAction(id: string): Promise<ActionResult<CrudId>> {
  try {
    const context = await requirePlanEditor()
    const client = await createClient()
    const goal = await getGoal(client, id, context.schoolId)
    if (!goal) return actionFail("NOT_FOUND", "ไม่พบเป้าหมาย")
    const plan = await getPlan(client, goal.plan_id, context.schoolId)
    if (!plan) return actionFail("NOT_FOUND", "ไม่พบแผนพัฒนา")
    if (isPlanLocked(plan.status)) return actionFail("CONFLICT", "ไม่สามารถลบเป้าหมายในแผนที่ปิดแล้ว")
    const { count: activityCount, error: countError } = await client
      .from("development_activities")
      .select("id", { count: "exact", head: true })
      .eq("goal_id", id)
      .eq("school_id", context.schoolId)
    if (countError) return actionFail("INTERNAL_ERROR", "ไม่สามารถตรวจสอบกิจกรรมของเป้าหมายได้")
    if ((activityCount ?? 0) > 0) return actionFail("CONFLICT", "ลบเป้าหมายไม่ได้ เนื่องจากยังมีกิจกรรมอยู่")
    const { error } = await client.from("development_goals").delete().eq("id", id).eq("school_id", context.schoolId)
    if (error) return actionFail("INTERNAL_ERROR", "ไม่สามารถลบเป้าหมายได้")
    revalidatePlan(goal.plan_id)
    return actionOk("ลบเป้าหมายสำเร็จ", { data: { id } })
  } catch (error) {
    return failFromError(error, "ไม่สามารถลบเป้าหมายได้")
  }
}

export async function createDevelopmentActivityAction(
  _previous: ActionResult<CrudId> | null,
  formData: FormData,
): Promise<ActionResult<CrudId>> {
  try {
    const context = await requirePlanEditor()
    const goalId = text(formData, "goal_id")
    const title = text(formData, "title")
    const startDate = optionalText(formData, "start_date")
    const endDate = optionalText(formData, "end_date")
    if (!goalId || !title || (startDate && !validDate(startDate)) || (endDate && !validDate(endDate)) || (startDate && endDate && endDate < startDate)) {
      return actionFail("VALIDATION_ERROR", "ข้อมูลกิจกรรมไม่ถูกต้อง")
    }
    const client = await createClient()
    const goal = await getGoal(client, goalId, context.schoolId)
    if (!goal) return actionFail("NOT_FOUND", "ไม่พบเป้าหมาย")
    const plan = await getPlan(client, goal.plan_id, context.schoolId)
    if (!plan) return actionFail("NOT_FOUND", "ไม่พบแผนพัฒนา")
    if (isPlanLocked(plan.status)) return actionFail("CONFLICT", "ไม่สามารถเพิ่มกิจกรรมในแผนที่ปิดแล้ว")
    const { data, error } = await client
      .from("development_activities")
      .insert({
        school_id: context.schoolId,
        goal_id: goalId,
        title,
        description: optionalText(formData, "description"),
        responsible_person: optionalText(formData, "responsible_person"),
        start_date: startDate,
        end_date: endDate,
        display_order: integer(formData, "display_order"),
      })
      .select("id")
      .single()
    if (error) return actionFail("INTERNAL_ERROR", "ไม่สามารถเพิ่มกิจกรรมได้")
    revalidatePlan(goal.plan_id)
    return actionOk("เพิ่มกิจกรรมสำเร็จ", { data: { id: data.id } })
  } catch (error) {
    return failFromError(error, "ไม่สามารถเพิ่มกิจกรรมได้")
  }
}

export async function updateDevelopmentActivityAction(
  _previous: ActionResult<CrudId> | null,
  formData: FormData,
): Promise<ActionResult<CrudId>> {
  try {
    const context = await requirePlanEditor()
    const id = text(formData, "id")
    const title = text(formData, "title")
    const startDate = optionalText(formData, "start_date")
    const endDate = optionalText(formData, "end_date")
    if (!id || !title || (startDate && !validDate(startDate)) || (endDate && !validDate(endDate)) || (startDate && endDate && endDate < startDate)) {
      return actionFail("VALIDATION_ERROR", "ข้อมูลกิจกรรมไม่ถูกต้อง")
    }
    const client = await createClient()
    const { data: activity } = await client
      .from("development_activities")
      .select("id, goal_id")
      .eq("id", id)
      .eq("school_id", context.schoolId)
      .maybeSingle()
    if (!activity) return actionFail("NOT_FOUND", "ไม่พบกิจกรรม")
    const goal = await getGoal(client, activity.goal_id, context.schoolId)
    if (!goal) return actionFail("NOT_FOUND", "ไม่พบเป้าหมาย")
    const plan = await getPlan(client, goal.plan_id, context.schoolId)
    if (!plan) return actionFail("NOT_FOUND", "ไม่พบแผนพัฒนา")
    if (isPlanLocked(plan.status)) return actionFail("CONFLICT", "ไม่สามารถแก้ไขกิจกรรมในแผนที่ปิดแล้ว")
    const completed = text(formData, "is_completed") === "true"
    const { error } = await client
      .from("development_activities")
      .update({
        title,
        description: optionalText(formData, "description"),
        responsible_person: optionalText(formData, "responsible_person"),
        start_date: startDate,
        end_date: endDate,
        result: optionalText(formData, "result"),
        display_order: integer(formData, "display_order"),
        is_completed: completed,
        completed_at: completed ? new Date().toISOString().slice(0, 10) : null,
      })
      .eq("id", id)
      .eq("school_id", context.schoolId)
    if (error) return actionFail("INTERNAL_ERROR", "ไม่สามารถแก้ไขกิจกรรมได้")
    revalidatePlan(goal.plan_id)
    return actionOk("แก้ไขกิจกรรมสำเร็จ", { data: { id } })
  } catch (error) {
    return failFromError(error, "ไม่สามารถแก้ไขกิจกรรมได้")
  }
}

export async function deleteDevelopmentActivityAction(id: string): Promise<ActionResult<CrudId>> {
  try {
    const context = await requirePlanEditor()
    const client = await createClient()
    const { data: activity } = await client
      .from("development_activities")
      .select("id, goal_id, is_completed")
      .eq("id", id)
      .eq("school_id", context.schoolId)
      .maybeSingle()
    if (!activity) return actionFail("NOT_FOUND", "ไม่พบกิจกรรม")
    const goal = await getGoal(client, activity.goal_id, context.schoolId)
    if (!goal) return actionFail("NOT_FOUND", "ไม่พบเป้าหมาย")
    const plan = await getPlan(client, goal.plan_id, context.schoolId)
    if (!plan) return actionFail("NOT_FOUND", "ไม่พบแผนพัฒนา")
    if (isPlanLocked(plan.status)) return actionFail("CONFLICT", "ไม่สามารถลบกิจกรรมในแผนที่ปิดแล้ว")
    if (activity.is_completed) return actionFail("CONFLICT", "กิจกรรมที่เสร็จแล้วเก็บไว้เป็นประวัติและไม่สามารถลบได้")
    const { error } = await client.from("development_activities").delete().eq("id", id).eq("school_id", context.schoolId)
    if (error) return actionFail("INTERNAL_ERROR", "ไม่สามารถลบกิจกรรมได้")
    revalidatePlan(goal.plan_id)
    return actionOk("ลบกิจกรรมสำเร็จ", { data: { id } })
  } catch (error) {
    return failFromError(error, "ไม่สามารถลบกิจกรรมได้")
  }
}

export async function createDevelopmentEvaluationAction(
  _previous: ActionResult<CrudId> | null,
  formData: FormData,
): Promise<ActionResult<CrudId>> {
  try {
    const context = await getCurrentUserContext()
    if (!context.profileId) return actionFail("UNAUTHORIZED", "กรุณาเข้าสู่ระบบ")
    if (!evaluationEditors.has(context.role)) return actionFail("FORBIDDEN", "คุณไม่มีสิทธิ์เพิ่มการประเมิน")
    const planId = text(formData, "plan_id")
    const evaluationDate = text(formData, "evaluation_date")
    const evaluationRound = integer(formData, "evaluation_round", 1)
    const overallResult = text(formData, "overall_result")
    if (!planId || !validDate(evaluationDate) || !Number.isInteger(evaluationRound) || evaluationRound < 1 || !overallResult) {
      return actionFail("VALIDATION_ERROR", "ข้อมูลการประเมินไม่ถูกต้อง")
    }
    const client = await createClient()
    const plan = await getPlan(client, planId, context.schoolId)
    if (!plan) return actionFail("NOT_FOUND", "ไม่พบแผนพัฒนา")
    if (isPlanLocked(plan.status)) return actionFail("CONFLICT", "ไม่สามารถเพิ่มการประเมินในแผนที่ปิดแล้ว")
    const { data, error } = await client
      .from("development_evaluations")
      .insert({
        school_id: context.schoolId,
        plan_id: planId,
        evaluation_date: evaluationDate,
        evaluation_round: evaluationRound,
        overall_result: overallResult,
        strengths: optionalText(formData, "strengths"),
        areas_for_improvement: optionalText(formData, "areas_for_improvement"),
        recommendations: optionalText(formData, "recommendations"),
        continue_plan: text(formData, "continue_plan") === "true",
        evaluated_by: context.profileId,
        parent_feedback: optionalText(formData, "parent_feedback"),
        student_feedback: optionalText(formData, "student_feedback"),
      })
      .select("id")
      .single()
    if (error) return actionFail("INTERNAL_ERROR", "ไม่สามารถเพิ่มการประเมินได้")
    revalidatePlan(planId)
    return actionOk("เพิ่มการประเมินสำเร็จ", { data: { id: data.id } })
  } catch (error) {
    return failFromError(error, "ไม่สามารถเพิ่มการประเมินได้")
  }
}

export async function updateDevelopmentEvaluationAction(
  _previous: ActionResult<CrudId> | null,
  formData: FormData,
): Promise<ActionResult<CrudId>> {
  try {
    const context = await getCurrentUserContext()
    if (!context.profileId) return actionFail("UNAUTHORIZED", "กรุณาเข้าสู่ระบบ")
    if (!evaluationEditors.has(context.role)) return actionFail("FORBIDDEN", "คุณไม่มีสิทธิ์แก้ไขการประเมิน")

    const id = text(formData, "id")
    const evaluationDate = text(formData, "evaluation_date")
    const evaluationRound = integer(formData, "evaluation_round", 1)
    const overallResult = text(formData, "overall_result")
    if (!id || !validDate(evaluationDate) || !Number.isInteger(evaluationRound) || evaluationRound < 1 || !overallResult) {
      return actionFail("VALIDATION_ERROR", "ข้อมูลการประเมินไม่ถูกต้อง")
    }

    const client = await createClient()
    const { data: evaluation } = await client
      .from("development_evaluations")
      .select("id, plan_id")
      .eq("id", id)
      .eq("school_id", context.schoolId)
      .maybeSingle()
    if (!evaluation) return actionFail("NOT_FOUND", "ไม่พบการประเมิน")
    const plan = await getPlan(client, evaluation.plan_id, context.schoolId)
    if (!plan) return actionFail("NOT_FOUND", "ไม่พบแผนพัฒนา")
    if (isPlanLocked(plan.status)) return actionFail("CONFLICT", "ไม่สามารถแก้ไขการประเมินในแผนที่ปิดแล้ว")

    const { error } = await client
      .from("development_evaluations")
      .update({
        evaluation_date: evaluationDate,
        evaluation_round: evaluationRound,
        overall_result: overallResult,
        strengths: optionalText(formData, "strengths"),
        areas_for_improvement: optionalText(formData, "areas_for_improvement"),
        recommendations: optionalText(formData, "recommendations"),
        continue_plan: text(formData, "continue_plan") === "true",
        parent_feedback: optionalText(formData, "parent_feedback"),
        student_feedback: optionalText(formData, "student_feedback"),
      })
      .eq("id", id)
      .eq("school_id", context.schoolId)
    if (error) return actionFail("INTERNAL_ERROR", "ไม่สามารถแก้ไขการประเมินได้")

    revalidatePlan(evaluation.plan_id)
    return actionOk("แก้ไขการประเมินสำเร็จ", { data: { id } })
  } catch (error) {
    return failFromError(error, "ไม่สามารถแก้ไขการประเมินได้")
  }
}

export async function deleteDevelopmentEvaluationAction(id: string): Promise<ActionResult<CrudId>> {
  try {
    const context = await getCurrentUserContext()
    if (!context.profileId) return actionFail("UNAUTHORIZED", "กรุณาเข้าสู่ระบบ")
    if (!evaluationEditors.has(context.role)) return actionFail("FORBIDDEN", "คุณไม่มีสิทธิ์ลบการประเมิน")
    const client = await createClient()
    const { data: evaluation } = await client
      .from("development_evaluations")
      .select("id, plan_id")
      .eq("id", id)
      .eq("school_id", context.schoolId)
      .maybeSingle()
    if (!evaluation) return actionFail("NOT_FOUND", "ไม่พบการประเมิน")
    const plan = await getPlan(client, evaluation.plan_id, context.schoolId)
    if (!plan) return actionFail("NOT_FOUND", "ไม่พบแผนพัฒนา")
    if (isPlanLocked(plan.status)) return actionFail("CONFLICT", "ไม่สามารถลบการประเมินในแผนที่ปิดแล้ว")
    const { error } = await client.from("development_evaluations").delete().eq("id", id).eq("school_id", context.schoolId)
    if (error) return actionFail("INTERNAL_ERROR", "ไม่สามารถลบการประเมินได้")
    revalidatePlan(evaluation.plan_id)
    return actionOk("ลบการประเมินสำเร็จ", { data: { id } })
  } catch (error) {
    return failFromError(error, "ไม่สามารถลบการประเมินได้")
  }
}
