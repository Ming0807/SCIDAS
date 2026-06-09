"use server"

import { createClient } from "@/utils/supabase/server"
import { Database } from "@/types/database.types"

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
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('development_plans')
    .select(`
      *,
      student:students(first_name, last_name, student_code),
      creator:profiles!development_plans_created_by_fkey(first_name, last_name)
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error("Error fetching development plans:", error)
    return []
  }

  return data
}

export async function getDevelopmentPlanById(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('development_plans')
    .select(`
      *,
      student:students(first_name, last_name, student_code),
      creator:profiles!development_plans_created_by_fkey(first_name, last_name),
      semester:semesters(term, academic_year_id, academic_years(year))
    `)
    .eq('id', id)
    .single()

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
