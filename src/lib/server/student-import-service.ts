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

export type ImportAcademicYearOption = {
  id: string
  year: number
  isCurrent: boolean
}

export type ImportContextData = {
  classrooms: ImportClassroomOption[]
  semesters: ImportSemesterOption[]
  currentSemesterId: string | null
  academicYears: ImportAcademicYearOption[]
  activeAcademicYearId: string | null
  canImport: boolean
  role: string
}

export async function getStudentImportContext(): Promise<ImportContextData> {
  const context = await getCurrentUserContext()
  const supabase = await createClient()

  const canImport = ["admin", "director", "homeroom_teacher"].includes(context.role)
  if (!canImport) {
    return {
      classrooms: [],
      semesters: [],
      currentSemesterId: null,
      academicYears: [],
      activeAcademicYearId: null,
      canImport: false,
      role: context.role,
    }
  }

  // 1. Load Academic Years
  const { data: yearsData } = await supabase
    .from("academic_years")
    .select("id, year, is_current")
    .eq("school_id", context.schoolId)
    .order("year", { ascending: false })

  const academicYears: ImportAcademicYearOption[] = (yearsData || []).map((y) => ({
    id: y.id,
    year: y.year,
    isCurrent: y.is_current,
  }))
  const activeYear = academicYears.find((y) => y.isCurrent) || academicYears[0] || null

  // 2. Load Semesters for the school
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

  if (context.role === "homeroom_teacher") {
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
    academicYears,
    activeAcademicYearId: activeYear?.id || null,
    canImport: classrooms.length > 0 || academicYears.length > 0,
    role: context.role,
  }
}

export type ImportDuplicateMode = "skip" | "enroll_existing" | "error"

export type ImportResultSummary = {
  success: boolean
  count: number
  skippedCount: number
  enrolledExistingCount: number
  error?: string
}

export type ExistingStudentInfo = {
  studentCode: string
  nationalId: string | null
  fullName: string
}

export async function findExistingStudentsInSchool(
  studentCodes: string[],
  nationalIds: string[],
): Promise<Map<string, ExistingStudentInfo>> {
  const context = await getCurrentUserContext()
  const supabase = await createClient()

  const cleanCodes = studentCodes.filter(Boolean)
  const cleanNids = nationalIds.filter(Boolean)

  if (cleanCodes.length === 0 && cleanNids.length === 0) {
    return new Map()
  }

  const query = supabase
    .from("students")
    .select("id, student_code, national_id, prefix, first_name, last_name")
    .eq("school_id", context.schoolId)

  const orConditions: string[] = []
  if (cleanCodes.length > 0) {
    orConditions.push(`student_code.in.(${cleanCodes.join(",")})`)
  }
  if (cleanNids.length > 0) {
    orConditions.push(`national_id.in.(${cleanNids.join(",")})`)
  }

  const { data, error } = await query.or(orConditions.join(","))
  if (error) {
    console.error("findExistingStudentsInSchool error:", error)
    return new Map()
  }

  const existingMap = new Map<string, ExistingStudentInfo>()
  for (const s of data || []) {
    const info: ExistingStudentInfo = {
      studentCode: s.student_code,
      nationalId: s.national_id,
      fullName: `${s.prefix || ""} ${s.first_name} ${s.last_name}`.trim(),
    }
    if (s.student_code) existingMap.set(`code:${s.student_code}`, info)
    if (s.national_id) existingMap.set(`nid:${s.national_id}`, info)
  }

  return existingMap
}

export async function executeStudentImportRpc(
  classroomId: string,
  semesterId: string,
  students: ParsedStudentRow[],
  duplicateMode: ImportDuplicateMode = "skip",
): Promise<ImportResultSummary> {
  const context = await getCurrentUserContext()
  const supabase = await createClient()

  if (!["admin", "director", "homeroom_teacher"].includes(context.role)) {
    return {
      success: false,
      count: 0,
      skippedCount: 0,
      enrolledExistingCount: 0,
      error: "คุณไม่มีสิทธิ์ในการนำเข้าข้อมูลนักเรียน",
    }
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
    date_of_birth: s.dateOfBirth || null,
    blood_type: s.bloodType || null,
    address: s.address || null,
    subdistrict: s.subdistrict || null,
    district: s.district || null,
    province: s.province || null,
    postal_code: s.postalCode || null,
    distance_to_school_km: s.distanceToSchoolKm ?? null,
    travel_method: s.travelMethod || null,
    nationality: s.nationality || null,
    ethnicity: s.ethnicity || null,
    religion: s.religion || null,
    family_status: s.familyStatus || null,
    student_number: s.studentNumber || null,
    guardian_prefix: s.guardianPrefix || null,
    guardian_first_name: s.guardianFirstName || null,
    guardian_last_name: s.guardianLastName || null,
    guardian_phone: s.guardianPhone || null,
    guardian_relation: s.guardianRelation || null,
    guardian_national_id: s.guardianNationalId || null,
    guardian_occupation: s.guardianOccupation || null,
    guardian_monthly_income: s.guardianMonthlyIncome ?? null,
  }))

  const { data, error } = await supabase.rpc("import_students_atomic", {
    p_classroom_id: classroomId,
    p_semester_id: semesterId,
    p_students: payload,
    p_duplicate_mode: duplicateMode,
  })

  if (error) {
    console.error("executeStudentImportRpc error:", error)
    return {
      success: false,
      count: 0,
      skippedCount: 0,
      enrolledExistingCount: 0,
      error: error.message || "เกิดข้อผิดพลาดในการนำเข้าข้อมูลนักเรียน",
    }
  }

  const result = data as {
    success?: boolean
    imported_count?: number
    skipped_count?: number
    enrolled_existing_count?: number
  } | null

  // Backfill & sync full profile & address for all students in the import batch
  for (const s of students) {
    const updateStudentPayload: Database["public"]["Tables"]["students"]["Update"] = {}
    if (s.address && s.address.trim()) updateStudentPayload.address = s.address.trim()
    if (s.subdistrict && s.subdistrict.trim()) updateStudentPayload.subdistrict = s.subdistrict.trim()
    if (s.district && s.district.trim()) updateStudentPayload.district = s.district.trim()
    if (s.province && s.province.trim()) updateStudentPayload.province = s.province.trim()
    if (s.postalCode && s.postalCode.trim()) updateStudentPayload.postal_code = s.postalCode.trim()
    if (typeof s.distanceToSchoolKm === "number") updateStudentPayload.distance_to_school_km = s.distanceToSchoolKm
    if (s.travelMethod && s.travelMethod.trim()) updateStudentPayload.travel_method = s.travelMethod.trim()
    if (s.familyStatus) updateStudentPayload.family_status = s.familyStatus
    if (s.religion && s.religion.trim()) updateStudentPayload.religion = s.religion.trim()
    if (s.nationality && s.nationality.trim()) updateStudentPayload.nationality = s.nationality.trim()
    if (s.ethnicity && s.ethnicity.trim()) updateStudentPayload.ethnicity = s.ethnicity.trim()
    if (s.bloodType && s.bloodType.trim()) updateStudentPayload.blood_type = s.bloodType.trim()
    if (s.specialNeeds && s.specialNeeds.trim()) updateStudentPayload.special_needs = s.specialNeeds.trim()
    if (s.medicalConditions && s.medicalConditions.trim()) updateStudentPayload.medical_conditions = s.medicalConditions.trim()

    // Find the student ID in this school
    let targetStudentId: string | null = null
    if (s.studentCode) {
      const { data: st } = await supabase
        .from("students")
        .select("id")
        .eq("school_id", context.schoolId)
        .eq("student_code", s.studentCode)
        .maybeSingle()
      if (st) targetStudentId = st.id
    }
    if (!targetStudentId && s.nationalId) {
      const { data: st } = await supabase
        .from("students")
        .select("id")
        .eq("school_id", context.schoolId)
        .eq("national_id", s.nationalId)
        .maybeSingle()
      if (st) targetStudentId = st.id
    }

    if (targetStudentId && Object.keys(updateStudentPayload).length > 0) {
      await supabase
        .from("students")
        .update(updateStudentPayload)
        .eq("id", targetStudentId)
    }

    // Guardian sync if present
    const hasGuardianData = Boolean(
      s.guardianFirstName ||
      s.guardianNationalId ||
      s.guardianOccupation ||
      typeof s.guardianMonthlyIncome === "number" ||
      s.guardianPhone
    )

    if (targetStudentId && hasGuardianData) {
      // Check if student has a linked guardian in student_guardians
      const { data: sg } = await supabase
        .from("student_guardians")
        .select("id, guardian_id, is_primary")
        .eq("student_id", targetStudentId)
        .order("is_primary", { ascending: false })
        .limit(1)
        .maybeSingle()

      const gUpdate: Database["public"]["Tables"]["guardians"]["Update"] = {}
      if (s.guardianOccupation) gUpdate.occupation = s.guardianOccupation.trim()
      if (typeof s.guardianMonthlyIncome === "number") gUpdate.monthly_income = s.guardianMonthlyIncome
      if (s.guardianPhone) gUpdate.phone = s.guardianPhone.trim()
      if (s.guardianNationalId) gUpdate.national_id = s.guardianNationalId.trim()
      if (s.guardianPrefix) gUpdate.prefix = s.guardianPrefix.trim()
      if (s.guardianFirstName) gUpdate.first_name = s.guardianFirstName.trim()
      if (s.guardianLastName) gUpdate.last_name = s.guardianLastName.trim()

      if (sg?.guardian_id) {
        // Guardian already linked to student -> update directly by ID
        if (Object.keys(gUpdate).length > 0) {
          await supabase
            .from("guardians")
            .update(gUpdate)
            .eq("id", sg.guardian_id)
        }
      } else if (s.guardianFirstName) {
        // No guardian linked yet -> insert guardian and create student_guardians link
        const gInsert: Database["public"]["Tables"]["guardians"]["Insert"] = {
          school_id: context.schoolId,
          first_name: s.guardianFirstName.trim(),
          last_name: s.guardianLastName?.trim() || "-",
          prefix: s.guardianPrefix?.trim() || null,
          phone: s.guardianPhone?.trim() || null,
          national_id: s.guardianNationalId?.trim() || null,
          occupation: s.guardianOccupation?.trim() || null,
          monthly_income: typeof s.guardianMonthlyIncome === "number" ? s.guardianMonthlyIncome : null,
        }
        const { data: newG } = await supabase
          .from("guardians")
          .insert(gInsert)
          .select("id")
          .maybeSingle()

        if (newG?.id) {
          const relation = s.guardianRelation || "guardian"
          await supabase.from("student_guardians").insert({
            school_id: context.schoolId,
            student_id: targetStudentId,
            guardian_id: newG.id,
            relation: relation as Database["public"]["Enums"]["guardian_relation"],
            is_primary: true,
            can_pickup: true,
          })
        }
      }
    }
  }

  return {
    success: true,
    count: result?.imported_count ?? 0,
    skippedCount: result?.skipped_count ?? 0,
    enrolledExistingCount: result?.enrolled_existing_count ?? 0,
  }
}
