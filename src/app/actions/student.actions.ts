"use server"

import { createClient } from "@/utils/supabase/server"
import { Database } from "@/types/database.types"

export type StudentRow = Database['public']['Tables']['students']['Row']

export async function getStudents() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('students')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error("Error fetching students:", error)
    return []
  }

  return data
}

export async function getStudentById(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('students')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error("Error fetching student by id:", error)
    return null
  }

  return data
}
