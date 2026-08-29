import "server-only"

import { createClient } from "@/utils/supabase/server"
import { getCurrentUserContext } from "@/lib/server/current-user"
import type { Database } from "@/types/database.types"
import type { ParsedStudentRow } from "@/lib/student-import-parser"

export type ImportClassroomOption = {
  id: string
  name: string
  gradeLevel: string
  section: number
  academicYear: number
  isHomeroom: boolean
}

export type ImportSemesterOption = {
  id: string
  label: string
  semester: Database["public"]["Enums"]["semester_type"]
  academicYear: number
  isCurrent: boolean
}

export type ImportContextData = {
  classrooms: ImportClassroomOption[]
  semesters: ImportSemesterOption[]
  currentSemesterId: string | null
  canImport: boolean
  role: string
}

export async function getStudentImportContext(): Promise<ImportContextData> {
  const context = await getCurrentUserContext()
  const supabase = await createClient()

  const canImport = ["admin", "director", "homeroom_teacher", "counselor", "subject_teacher"].includes(context.role)
  if (!canImport) {
    return {
      classrooms: [],
      semesters: [],
      currentSemesterId: null,
      canImport: false,
      role: context.role,
    }
  }

  // 1. Load Semesters for the school
  const { data: semestersData, error: semError } = await supabase
    .from("semesters")
    .select("id, semester, start_date, end_date, is_current, academic_years(year)")
    .eq("school_id", context.schoolId)
    .order("start_date", { ascending: false })

  if (semError) {
    console.error("Failed to load semesters for import:", semError)
    throw new Error("ไม่สามารถโหลดข้อมูลภาคเรียนได้")
  }

  const semesters: ImportSemesterOption[] = (semestersData || []).map((s) => {
    const y = s.academic_years as unknown as { year: number } | null
    const semNum = s.semester === "semester_1" ? "1" : "2"
    return {
      id: s.id,
      label: `ภาคเรียนที่ ${semNum}/${y?.year || ""}`,
      semester: s.semester,
      academicYear: y?.year || 0,
      isCurrent: s.is_current,
    }
  })

  const currentSemester = semesters.find((s) => s.isCurrent) || semesters[0] || null

  // 2. Load Classrooms based on role
  let classroomQuery = supabase
    .from("classrooms")
    .select("id, name, grade_level, section, homeroom_teacher_id, co_teacher_id, is_active, academic_years(year)")
    .eq("school_id", context.schoolId)
    .eq("is_active", true)

  if (context.role === "homeroom_teacher" || context.role === "subject_teacher") {
    classroomQuery = classroomQuery.or(
      `homeroom_teacher_id.eq.${context.profileId},co_teacher_id.eq.${context.profileId}`
    )
  }

  const { data: classroomsData, error: crError } = await classroomQuery
    .order("grade_level", { ascending: true })
    .order("section", { ascending: true })

  if (crError) {
    console.error("Failed to load classrooms for import:", crError)
    throw new Error("ไม่สามารถโหลดข้อมูลห้องเรียนได้")
  }

  const classrooms: ImportClassroomOption[] = (classroomsData || []).map((c) => {
    const y = c.academic_years as unknown as { year: number } | null
    const isHr =
      c.homeroom_teacher_id === context.profileId || c.co_teacher_id === context.profileId

    return {
      id: c.id,
      name: c.name,
      gradeLevel: c.grade_level,
      section: c.section,
      academicYear: y?.year || 0,
      isHomeroom: isHr,
    }
  })

  return {
    classrooms,
    semesters,
    currentSemesterId: currentSemester?.id || null,
    canImport: classrooms.length > 0,
    role: context.role,
  }
}

export async function executeStudentImportRpc(
  classroomId: string,
  semesterId: string,
  students: ParsedStudentRow[]
): Promise<{ success: boolean; count: number; error?: string }> {
  const context = await getCurrentUserContext()
  const supabase = await createClient()

  if (!["admin", "director", "homeroom_teacher", "counselor", "subject_teacher"].includes(context.role)) {
    return { success: false, count: 0, error: "คุณไม่มีสิทธิ์ในการนำเข้าข้อมูลนักเรียน" }
  }

  // Transform DTO keys to database snake_case parameters for RPC (students table has no phone)
  const payload = students.map((s) => ({
    student_code: s.studentCode,
    national_id: s.nationalId || null,
    prefix: s.prefix || null,
    first_name: s.firstName,
    last_name: s.lastName,
    nickname: s.nickname || null,
    gender: s.gender,
    date_of_birth: s.dateOfBirth,
    blood_type: s.bloodType || null,
    address: s.address || null,
    student_number: s.studentNumber || null,
    guardian_prefix: s.guardianPrefix || null,
    guardian_first_name: s.guardianFirstName || null,
    guardian_last_name: s.guardianLastName || null,
    guardian_phone: s.guardianPhone || null,
    guardian_relation: s.guardianRelation || null,
  }))

  const { data, error } = await supabase.rpc("import_students_atomic", {
    p_classroom_id: classroomId,
    p_semester_id: semesterId,
    p_students: payload,
  })

  if (error) {
    console.error("executeStudentImportRpc error:", error)
    return {
      success: false,
      count: 0,
      error: error.message || "เกิดข้อผิดพลาดในการนำเข้าข้อมูลนักเรียน",
    }
  }

  const result = data as { success?: boolean; imported_count?: number } | null
  return {
    success: true,
    count: result?.imported_count || students.length,
  }
}
