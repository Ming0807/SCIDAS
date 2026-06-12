import type { Database } from "@/types/database.types"
import { createClient } from "@/utils/supabase/server"

import { getCurrentUserContext } from "./current-user"

type UserRole = Database["public"]["Enums"]["user_role"]

export type UserProfileInfo = {
  profileId: string
  firstName: string
  lastName: string
  fullName: string
  role: UserRole
  roleLabel: string
  email: string | null
  phone: string | null
  schoolName: string | null
  avatarUrl: string | null
  lastSignIn: string | null
}

const roleLabels: Record<UserRole, string> = {
  admin: "ผู้ดูแลระบบ",
  director: "ผู้อำนวยการ",
  homeroom_teacher: "ครูที่ปรึกษา",
  counselor: "ครูแนะแนว",
  subject_teacher: "ครูประจำวิชา",
}

export function getRoleLabel(role: UserRole): string {
  return roleLabels[role] ?? role
}

export async function getUserProfile(): Promise<UserProfileInfo> {
  const context = await getCurrentUserContext()

  if (!context.profileId) {
    throw new Error("FORBIDDEN")
  }

  const client = await createClient()

  const { data: profile, error } = await client
    .from("profiles")
    .select(
      `
      id,
      first_name,
      last_name,
      role,
      email,
      phone,
      schools!profiles_school_id_fkey (
        name
      )
    `,
    )
    .eq("id", context.profileId)
    .single()

  if (error || !profile) {
    throw new Error(error?.message ?? "NOT_FOUND")
  }

  // Get last sign-in from auth
  const {
    data: { user },
  } = await client.auth.getUser()

  const schools = profile.schools as { name: string | null } | null

  return {
    profileId: profile.id,
    firstName: profile.first_name ?? "",
    lastName: profile.last_name ?? "",
    fullName:
      `${profile.first_name ?? ""} ${profile.last_name ?? ""}`.trim(),
    role: profile.role,
    roleLabel: getRoleLabel(profile.role),
    email: profile.email ?? user?.email ?? null,
    phone: profile.phone ?? null,
    schoolName: schools?.name ?? null,
    avatarUrl: user?.user_metadata?.avatar_url ?? null,
    lastSignIn: user?.last_sign_in_at ?? null,
  }
}
