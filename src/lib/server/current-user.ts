import { cache } from "react"

import type { Database } from "@/types/database.types"
import { createClient } from "@/utils/supabase/server"

type StaffRole = Database["public"]["Enums"]["user_role"]
export type AppRole = StaffRole | "student"

export type CurrentUserContext = {
  userId: string
  schoolId: string
  role: AppRole
  profileId: string | null
  studentId: string | null
}

export const getCurrentUserContext = cache(async (): Promise<CurrentUserContext> => {
  const supabase = await createClient()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    throw new Error("UNAUTHORIZED")
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, school_id, role")
    .eq("id", user.id)
    .maybeSingle()

  if (profileError) {
    throw new Error(profileError.message)
  }

  if (profile) {
    return {
      userId: user.id,
      schoolId: profile.school_id,
      role: profile.role,
      profileId: profile.id,
      studentId: null,
    }
  }

  const { data: student, error: studentError } = await supabase
    .from("students")
    .select("id, school_id")
    .eq("user_id", user.id)
    .maybeSingle()

  if (studentError) {
    throw new Error(studentError.message)
  }

  if (student) {
    return {
      userId: user.id,
      schoolId: student.school_id,
      role: "student",
      profileId: null,
      studentId: student.id,
    }
  }

  throw new Error("FORBIDDEN")
})

export const getCurrentSemesterId = cache(async (schoolId: string): Promise<string | null> => {
  const supabase = await createClient()

  const { data: currentSemester, error: currentError } = await supabase
    .from("semesters")
    .select("id")
    .eq("school_id", schoolId)
    .eq("is_current", true)
    .maybeSingle()

  if (currentError) {
    throw new Error(currentError.message)
  }

  if (currentSemester) {
    return currentSemester.id
  }

  const { data: fallbackSemester, error: fallbackError } = await supabase
    .from("semesters")
    .select("id")
    .eq("school_id", schoolId)
    .order("start_date", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (fallbackError) {
    throw new Error(fallbackError.message)
  }

  return fallbackSemester?.id ?? null
})
