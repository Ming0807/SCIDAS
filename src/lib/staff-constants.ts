import type { Database } from "@/types/database.types"

export type UserRole = Database["public"]["Enums"]["user_role"]

export type StaffRole = Exclude<UserRole, "parent">

export const STAFF_ROLES: StaffRole[] = [
  "admin",
  "director",
  "counselor",
  "homeroom_teacher",
  "subject_teacher",
]

export const STAFF_ROLE_LABELS: Record<UserRole, string> = {
  admin: "ผู้ดูแลระบบ",
  director: "ผู้อำนวยการ",
  counselor: "ครูแนะแนว",
  homeroom_teacher: "ครูที่ปรึกษา / ครูประจำชั้น",
  subject_teacher: "ครูประจำวิชา",
  parent: "ผู้ปกครอง",
}

export type StaffClassroomAssignment = {
  classroomId: string
  classroomName: string
  gradeLevel: string
  section: number
  assignmentType: "homeroom" | "co_teacher"
}

export type StaffMemberItem = {
  id: string
  firstName: string
  lastName: string
  fullName: string
  email: string | null
  phone: string | null
  position: string | null
  department: string | null
  role: UserRole
  roleLabel: string
  isActive: boolean
  lastLoginAt: string | null
  assignedClassrooms: StaffClassroomAssignment[]
}

export type ClassroomAssignmentOption = {
  id: string
  name: string
  gradeLevel: string
  section: number
  academicYearId: string
  homeroomTeacherId: string | null
  homeroomTeacherName: string | null
  coTeacherId: string | null
  coTeacherName: string | null
  isActive: boolean
}

export type StaffManagementData = {
  staff: StaffMemberItem[]
  classrooms: ClassroomAssignmentOption[]
  currentUserRole: string
  currentProfileId?: string | null
  canManage: boolean
  metrics: {
    totalStaff: number
    activeStaff: number
    teachersCount: number
    counselorsCount: number
    leadershipCount: number
    unassignedHomeroomsCount: number
  }
}
