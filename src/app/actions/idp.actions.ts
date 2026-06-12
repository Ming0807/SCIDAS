"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/utils/supabase/server"
import { Database } from "@/types/database.types"

import type { ActionResult } from "@/lib/server/action-result"
import { actionFail, actionOk } from "@/lib/server/action-result"
import { getCurrentUserContext } from "@/lib/server/current-user"

export type DevelopmentPlan = Database['public']['Tables']['development_plans']['Row']
export type DevelopmentPlanInsert = Database['public']['Tables']['development_plans']['Insert']
export type DevelopmentPlanUpdate = Database['public']['Tables']['development_plans']['Update']

export type DevelopmentGoal = Database['public']['Tables']['development_goals']['Row']
export type DevelopmentGoalInsert = Database['public']['Tables']['development_goals']['Insert']
export type DevelopmentGoalUpdate = Database['public']['Tables']['development_goals']['Update']

export type DevelopmentActivity = Database['public']['Tables']['development_activities']['Row']
export type DevelopmentActivityInsert = Database['public']['Tables']['development_activities']['Insert']
export type DevelopmentActivityUpdate = Database['public']['Tables']['development_activities']['Update']

// --- Plans ---

export async function getDevelopmentPlans() {
  const context = await getCurrentUserContext()
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('development_plans')
    .select(`
      *,
      student:students(first_name, last_name, student_code),
      creator:profiles!development_plans_created_by_fkey(first_name, last_name)
    `)
    .eq('school_id', context.schoolId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error("Error fetching development plans:", error)
    return []
  }

  return data
}

export async function getDevelopmentPlanById(id: string) {
  const context = await getCurrentUserContext()
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('development_plans')
    .select(`
      *,
      student:students(first_name, last_name, student_code),
      creator:profiles!development_plans_created_by_fkey(first_name, last_name),
      semester:semesters(semester, start_date, end_date)
    `)
    .eq('id', id)
    .eq('school_id', context.schoolId)
    .maybeSingle()

  if (error) {
    console.error("Error fetching development plan by id:", error)
    return null
  }

  return data
}

export async function createDevelopmentPlan(plan: DevelopmentPlanInsert) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('development_plans')
    .insert(plan)
    .select()
    .single()

  if (error) {
    console.error("Error creating development plan:", error)
    return { error: error.message }
  }

  return { data }
}

export async function updateDevelopmentPlan(id: string, updates: DevelopmentPlanUpdate) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('development_plans')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error("Error updating development plan:", error)
    return { error: error.message }
  }

  return { data }
}

export async function deleteDevelopmentPlan(id: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('development_plans')
    .delete()
    .eq('id', id)

  if (error) {
    console.error("Error deleting development plan:", error)
    return { error: error.message }
  }

  return { success: true }
}

// --- Goals ---

export async function getDevelopmentGoals(planId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('development_goals')
    .select('*')
    .eq('plan_id', planId)
    .order('goal_number', { ascending: true })

  if (error) {
    console.error("Error fetching development goals:", error)
    return []
  }

  return data
}

export async function createDevelopmentGoal(goal: DevelopmentGoalInsert) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('development_goals')
    .insert(goal)
    .select()
    .single()

  if (error) {
    console.error("Error creating development goal:", error)
    return { error: error.message }
  }

  return { data }
}

export async function updateDevelopmentGoal(id: string, updates: DevelopmentGoalUpdate) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('development_goals')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error("Error updating development goal:", error)
    return { error: error.message }
  }

  return { data }
}

export async function deleteDevelopmentGoal(id: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('development_goals')
    .delete()
    .eq('id', id)

  if (error) {
    console.error("Error deleting development goal:", error)
    return { error: error.message }
  }

  return { success: true }
}

// --- Activities ---

export async function getDevelopmentActivities(goalId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('development_activities')
    .select('*')
    .eq('goal_id', goalId)
    .order('display_order', { ascending: true })

  if (error) {
    console.error("Error fetching development activities:", error)
    return []
  }

  return data
}

export async function createDevelopmentActivity(activity: DevelopmentActivityInsert) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('development_activities')
    .insert(activity)
    .select()
    .single()

  if (error) {
    console.error("Error creating development activity:", error)
    return { error: error.message }
  }

  return { data }
}

export async function updateDevelopmentActivity(id: string, updates: DevelopmentActivityUpdate) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('development_activities')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error("Error updating development activity:", error)
    return { error: error.message }
  }

  return { data }
}

export async function deleteDevelopmentActivity(id: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('development_activities')
    .delete()
    .eq('id', id)

  if (error) {
    console.error("Error deleting development activity:", error)
    return { error: error.message }
  }

  return { success: true }
}

// ─── ActionResult wrappers for client-side form handling ───

export async function createDevelopmentPlanAction(
  _prev: ActionResult<{ id: string }> | null,
  formData: FormData,
): Promise<ActionResult<{ id: string }>> {
  try {
    const context = await getCurrentUserContext()
    if (!context.profileId) return actionFail("UNAUTHORIZED", "กรุณาเข้าสู่ระบบ")

    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const studentId = formData.get("student_id") as string
    const semesterId = formData.get("semester_id") as string
    const startDate = formData.get("start_date") as string
    const endDate = formData.get("end_date") as string

    if (!title || !studentId || !semesterId || !startDate) {
      return actionFail("VALIDATION_ERROR", "กรุณากรอกข้อมูลให้ครบถ้วน")
    }

    const planInsert: Record<string, unknown> = {
      title: title.trim(),
      description: description?.trim() || "",
      student_id: studentId,
      semester_id: semesterId,
      start_date: startDate,
      created_by: context.profileId,
      school_id: context.schoolId,
      status: "draft" as const,
    }
    if (endDate) planInsert.end_date = endDate

    const result = await createDevelopmentPlan(planInsert as DevelopmentPlanInsert)

    if ("error" in result) {
      return actionFail("INTERNAL_ERROR", result.error!)
    }

    revalidatePath("/development-plans")
    return actionOk("สร้างแผนพัฒนาสำเร็จ", { data: { id: result.data!.id } })
  } catch (err) {
    return actionFail("INTERNAL_ERROR", err instanceof Error ? err.message : "เกิดข้อผิดพลาด")
  }
}

export async function updateDevelopmentPlanAction(
  _prev: ActionResult<{ id: string }> | null,
  formData: FormData,
): Promise<ActionResult<{ id: string }>> {
  try {
    const id = formData.get("id") as string
    if (!id) return actionFail("VALIDATION_ERROR", "ไม่พบแผนพัฒนา")

    const updates: Record<string, unknown> = {}
    const title = formData.get("title") as string
    const status = formData.get("status") as string
    if (title) updates.title = title.trim()
    if (status) updates.status = status

    const result = await updateDevelopmentPlan(id, updates as Parameters<typeof updateDevelopmentPlan>[1])
    if ("error" in result) return actionFail("INTERNAL_ERROR", result.error!)

    revalidatePath("/development-plans")
    revalidatePath(`/development-plans/${id}`)
    return actionOk("อัปเดตแผนพัฒนาสำเร็จ", { data: { id } })
  } catch (err) {
    return actionFail("INTERNAL_ERROR", err instanceof Error ? err.message : "เกิดข้อผิดพลาด")
  }
}

export async function createDevelopmentGoalAction(
  _prev: ActionResult<{ id: string }> | null,
  formData: FormData,
): Promise<ActionResult<{ id: string }>> {
  try {
    const planId = formData.get("plan_id") as string
    const title = formData.get("title") as string
    if (!planId || !title) return actionFail("VALIDATION_ERROR", "กรุณากรอกข้อมูลให้ครบถ้วน")

    const result = await createDevelopmentGoal({
      plan_id: planId,
      title: title.trim(),
      description: (formData.get("description") as string)?.trim() || null,
      goal_number: parseInt((formData.get("goal_number") as string) || "1", 10),
      category: (formData.get("category") as string) || null,
      target_date: (formData.get("target_date") as string) || null,
      status: "not_started",
    })

    if ("error" in result) return actionFail("INTERNAL_ERROR", result.error!)
    revalidatePath(`/development-plans/${planId}`)
    return actionOk("เพิ่มเป้าหมายสำเร็จ", { data: { id: result.data!.id } })
  } catch (err) {
    return actionFail("INTERNAL_ERROR", err instanceof Error ? err.message : "เกิดข้อผิดพลาด")
  }
}
