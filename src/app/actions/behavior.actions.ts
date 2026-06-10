"use server"

import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"
import { Database } from "@/types/database.types"

type BehaviorType = Database["public"]["Enums"]["behavior_type"]

export async function getBehaviorRecords() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('behavior_records')
    .select('*, students(first_name, last_name, student_code), profiles!behavior_records_reported_by_fkey(first_name, last_name)')
    .order('date', { ascending: false })

  if (error) {
    console.error("Error fetching behavior records:", error)
    return []
  }
  return data
}

export async function createBehaviorRecord(formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  const student_id = formData.get('student_id') as string
  const behavior_type = formData.get('behavior_type') as BehaviorType
  const category = formData.get('category') as string
  const description = formData.get('description') as string
  const pointsStr = formData.get('points') as string
  const points = pointsStr ? parseInt(pointsStr) : 0
  const dateStr = formData.get('date') as string
  
  const date = dateStr ? new Date(dateStr).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]

  const { error } = await supabase
    .from('behavior_records')
    .insert({
      student_id,
      behavior_type,
      category,
      description,
      points,
      reported_by: user.id,
      date
    })

  if (error) {
    console.error("Error creating behavior record:", error)
    throw new Error(error.message)
  }

  revalidatePath('/behavior')
  revalidatePath('/behavior/record')
}
