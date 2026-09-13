import "server-only"

import { getCurrentUserContext } from "@/lib/server/current-user"
import {
  type ClassroomAssignmentOption,
  STAFF_ROLE_LABELS,
  type StaffClassroomAssignment,
  type StaffManagementData,
  type StaffMemberItem,
  type UserRole,
} from "@/lib/staff-constants"
import { createClient } from "@/utils/supabase/server"

export type {
  ClassroomAssignmentOption,
  StaffClassroomAssignment,
  StaffManagementData,
  StaffMemberItem,
  UserRole,
}
export { STAFF_ROLE_LABELS }

export async function getStaffManagementData(): Promise<StaffManagementData> {
  const context = await getCurrentUserContext()
  if (!context.schoolId) {
    throw new Error("UNAUTHORIZED")
  }

  const supabase = await createClient()

  // 1. Fetch all profiles for the school
  const { data: rawProfiles, error: profilesError } = await supabase
    .from("profiles")
    .select(`
      id,
      first_name,
      last_name,
      email,
      phone,
      position,
      department,
      role,
      is_active,
      last_login_at
    `)
    .eq("school_id", context.schoolId)
    .order("first_name", { ascending: true })

  if (profilesError) {
    throw new Error(`Failed to load staff profiles: ${profilesError.message}`)
  }

  // 2. Fetch all active classrooms for the school
  const { data: rawClassrooms, error: classroomsError } = await supabase
    .from("classrooms")
    .select(`
      id,
      name,
      grade_level,
      section,
      academic_year_id,
      is_active,
      homeroom_teacher_id,
      co_teacher_id,
      homeroom_teacher:profiles!classrooms_homeroom_teacher_id_fkey(first_name, last_name),
      co_teacher:profiles!classrooms_co_teacher_id_fkey(first_name, last_name)
    `)
    .eq("school_id", context.schoolId)
    .eq("is_active", true)
    .order("grade_level", { ascending: true })
    .order("section", { ascending: true })

  if (classroomsError) {
    throw new Error(`Failed to load classrooms: ${classroomsError.message}`)
  }

  type RawClassroomRow = {
    id: string
    name: string
    grade_level: string
    section: number
    academic_year_id: string
    is_active: boolean
    homeroom_teacher_id: string | null
    co_teacher_id: string | null
    homeroom_teacher: { first_name: string; last_name: string } | null
    co_teacher: { first_name: string; last_name: string } | null
  }

  const classroomsData = (rawClassrooms as unknown as RawClassroomRow[]) ?? []

  // Map classrooms for options
  const classrooms: ClassroomAssignmentOption[] = classroomsData.map((c) => ({
    id: c.id,
    name: c.name || `ม.${c.grade_level}/${c.section}`,
    gradeLevel: String(c.grade_level),
    section: c.section,
    academicYearId: c.academic_year_id,
    homeroomTeacherId: c.homeroom_teacher_id,
    homeroomTeacherName: c.homeroom_teacher
      ? `${c.homeroom_teacher.first_name} ${c.homeroom_teacher.last_name}`
      : null,
    coTeacherId: c.co_teacher_id,
    coTeacherName: c.co_teacher
      ? `${c.co_teacher.first_name} ${c.co_teacher.last_name}`
      : null,
    isActive: c.is_active,
  }))

  // Map staff profiles and assign their classrooms
  const staff: StaffMemberItem[] = (rawProfiles ?? []).map((p) => {
    const assignedClassrooms: StaffClassroomAssignment[] = []

    for (const c of classroomsData) {
      if (c.homeroom_teacher_id === p.id) {
        assignedClassrooms.push({
          classroomId: c.id,
          classroomName: c.name || `ม.${c.grade_level}/${c.section}`,
          gradeLevel: String(c.grade_level),
          section: c.section,
          assignmentType: "homeroom",
        })
      } else if (c.co_teacher_id === p.id) {
        assignedClassrooms.push({
          classroomId: c.id,
          classroomName: c.name || `ม.${c.grade_level}/${c.section}`,
          gradeLevel: String(c.grade_level),
          section: c.section,
          assignmentType: "co_teacher",
        })
      }
    }

    return {
      id: p.id,
      firstName: p.first_name,
      lastName: p.last_name,
      fullName: `${p.first_name} ${p.last_name}`.trim(),
      email: p.email,
      phone: p.phone,
      position: p.position,
      department: p.department,
      role: p.role,
      roleLabel: STAFF_ROLE_LABELS[p.role] ?? p.role,
      isActive: p.is_active,
      lastLoginAt: p.last_login_at,
      assignedClassrooms,
    }
  })

  // Calculate metrics
  const totalStaff = staff.length
  const activeStaff = staff.filter((s) => s.isActive).length
  const teachersCount = staff.filter(
    (s) => s.role === "homeroom_teacher" || s.role === "subject_teacher",
  ).length
  const counselorsCount = staff.filter((s) => s.role === "counselor").length
  const leadershipCount = staff.filter(
    (s) => s.role === "admin" || s.role === "director",
  ).length
  const unassignedHomeroomsCount = classrooms.filter(
    (c) => !c.homeroomTeacherId,
  ).length

  const canManage = context.role === "admin" || context.role === "director"

  return {
    staff,
    classrooms,
    currentUserRole: context.role,
    canManage,
    metrics: {
      totalStaff,
      activeStaff,
      teachersCount,
      counselorsCount,
      leadershipCount,
      unassignedHomeroomsCount,
    },
  }
}
