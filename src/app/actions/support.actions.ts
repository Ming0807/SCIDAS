"use server"

import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"
import { Database } from "@/types/database.types"

type SeverityLevel = Database["public"]["Enums"]["severity_level"]
type SupportType = Database["public"]["Enums"]["support_type"]

export async function getSupportRecords() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('support_records')
    .select('*, students(first_name, last_name, student_code), profiles!support_records_provided_by_fkey(first_name, last_name)')
    .order('created_at', { ascending: false })

  if (error) {
    console.error("Error fetching support records:", error)
    return []
  }
  return data
}

export async function getProfiles() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('id, first_name, last_name, role, position')
    .eq('is_active', true)
    
  if (error) {
    console.error("Error fetching profiles:", error)
    return []
  }
  return data
}

export async function createSupportRecord(formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  const student_id = formData.get('student_id') as string
  const support_type = formData.get('support_type') as SupportType
  const priority = formData.get('priority') as SeverityLevel
  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const assigned_to = formData.get('assigned_to') as string
  const provided_by = assigned_to || user.id
  
  const { data: semData } = await supabase.from('semesters').select('id').eq('is_current', true).single()
  
  // If no semester found, fall back to first one or error
  let semester_id = semData?.id
  if (!semester_id) {
     const { data: fallbackSem } = await supabase.from('semesters').select('id').limit(1).single()
     semester_id = fallbackSem?.id
  }
  
  if (!semester_id) throw new Error("No semester found")

  const { error } = await supabase
    .from('support_records')
    .insert({
      student_id,
      semester_id,
      support_type,
      priority,
      title,
      description,
      provided_by,
      status: 'pending'
    })

  if (error) {
    console.error("Error creating support record:", error)
    throw new Error(error.message)
  }

  revalidatePath('/support')
  revalidatePath('/support/new')
}
