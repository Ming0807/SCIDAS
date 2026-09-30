"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"

import type { ActionResult } from "@/lib/server/action-result"
import { actionFail, actionOk } from "@/lib/server/action-result"
import { getCurrentSemesterId, getCurrentUserContext } from "@/lib/server/current-user"
import { logAudit } from "@/lib/server/audit-logger"
import { validFamilyStatuses } from "@/lib/student-constants"
import { createClient } from "@/utils/supabase/server"
import { createAdminClient } from "@/lib/server/admin-client"
import type { Database } from "@/types/database.types"

export type StudentRow = Database["public"]["Tables"]["students"]["Row"]
type StudentFormData = {
  student_code: string
  prefix: string | null
  first_name: string
  last_name: string
  nickname: string | null
  gender: string
  date_of_birth: string
  address: string | null
  national_id: string | null
  travel_method: string | null
  distance_to_school_km: number | null
  subdistrict: string | null
  district: string | null
  province: string | null
  postal_code: string | null
  blood_type: string | null
  medical_conditions: string | null
  special_needs: string | null
  family_status: string | null
  nationality: string | null
  ethnicity: string | null
  religion: string | null
}

export type StudentArchiveStatus = "transferred" | "dropped_out"
const studentEditors = new Set(["admin", "homeroom_teacher", "counselor", "director"])
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const guardianRelationSchema = z.enum([
  "father",
  "mother",
  "grandfather",
  "grandmother",
  "uncle",
  "aunt",
  "sibling",
  "other_relative",
  "guardian",
])

const studentFormFields = [
  "student_code",
  "prefix",
  "first_name",
  "last_name",
  "nickname",
  "gender",
  "date_of_birth",
  "address",
  "national_id",
  "travel_method",
  "distance_to_school_km",
  "subdistrict",
  "district",
  "province",
  "postal_code",
  "blood_type",
  "medical_conditions",
  "special_needs",
  "family_status",
  "nationality",
  "ethnicity",
  "religion",
] as const

const validBloodTypes = new Set([
  "A", "B", "AB", "O",
  "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-",
])

function readStudentFormData(formData: FormData): StudentFormData {
  const getText = (name: (typeof studentFormFields)[number]) =>
    (formData.get(name) as string | null)?.trim() ?? ""
  const values = Object.fromEntries(
    studentFormFields.map((field) => [field, getText(field)]),
  ) as Record<(typeof studentFormFields)[number], string>

  const rawDistance = values.distance_to_school_km
  const distance =
    rawDistance === "" ? null : Number(rawDistance.replace(",", "."))

  return {
    student_code: values.student_code,
    prefix: values.prefix || null,
    first_name: values.first_name,
    last_name: values.last_name,
    nickname: values.nickname || null,
    gender: values.gender,
    date_of_birth: values.date_of_birth,
    address: values.address || null,
    national_id: values.national_id || null,
    travel_method: values.travel_method || null,
    distance_to_school_km: distance,
    subdistrict: values.subdistrict || null,
    district: values.district || null,
    province: values.province || null,
    postal_code: values.postal_code || null,
    blood_type: values.blood_type || null,
    medical_conditions: values.medical_conditions || null,
    special_needs: values.special_needs || null,
    family_status: values.family_status || null,
    nationality: values.nationality || null,
    ethnicity: values.ethnicity || null,
    religion: values.religion || null,
  }
}

function getStudentFieldErrors(values: StudentFormData) {
  const fieldErrors: Record<string, string[]> = {}

  if (!values.first_name) fieldErrors.first_name = ["กรุณากรอกชื่อ"]
  if (!values.last_name) fieldErrors.last_name = ["กรุณากรอกนามสกุล"]
  if (!values.student_code) fieldErrors.student_code = ["กรุณากรอกรหัสนักเรียน"]
  if (!values.gender || !["male", "female", "other"].includes(values.gender)) {
    fieldErrors.gender = ["กรุณาเลือกเพศ"]
  }
  if (!values.date_of_birth) fieldErrors.date_of_birth = ["กรุณาระบุวันเกิด"]
  if (values.national_id && !/^\d{13}$/.test(values.national_id)) {
    fieldErrors.national_id = ["เลขบัตรประชาชนต้องเป็นตัวเลข 13 หลัก"]
  }
  if (values.postal_code && !/^\d{5}$/.test(values.postal_code)) {
    fieldErrors.postal_code = ["รหัสไปรษณีย์ต้องเป็นตัวเลข 5 หลัก"]
  }
  if (
    values.distance_to_school_km !== null &&
    (!Number.isFinite(values.distance_to_school_km) ||
      values.distance_to_school_km < 0)
  ) {
    fieldErrors.distance_to_school_km = ["ระยะทางต้องเป็นตัวเลขตั้งแต่ 0 ขึ้นไป"]
  }
  if (values.blood_type && !validBloodTypes.has(values.blood_type.toUpperCase())) {
    fieldErrors.blood_type = ["หมู่โลหิตไม่ถูกต้อง (A, B, AB, O พร้อม + หรือ -)"]
  }
  if (values.family_status && !validFamilyStatuses.has(values.family_status)) {
    fieldErrors.family_status = ["สถานะครอบครัวไม่ถูกต้อง กรุณาเลือกใหม่"]
  }

  return fieldErrors
}

function getActionFailure<T>(error: unknown): ActionResult<T> {
  if (error instanceof Error && error.message === "UNAUTHORIZED") {
    return actionFail("UNAUTHORIZED", "กรุณาเข้าสู่ระบบก่อนดำเนินการ")
  }

  if (error instanceof Error && error.message === "FORBIDDEN") {
    return actionFail("FORBIDDEN", "คุณไม่มีสิทธิ์ดำเนินการกับข้อมูลนักเรียน")
  }

  if (error instanceof Error) {
    console.error("Student mutation failed:", error)
  }

  return actionFail("INTERNAL_ERROR", "ไม่สามารถบันทึกข้อมูลนักเรียนได้")
}

export async function getStudents() {
  const context = await getCurrentUserContext()
  const supabase = await createClient()

  if (!context.schoolId) {
    return []
  }

  const { data, error } = await supabase
    .from("students")
    .select("id, student_code, prefix, first_name, last_name, nickname, gender, date_of_birth, status, photo_url")
    .eq("school_id", context.schoolId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching students:", error)
    return []
  }

  return data
}

export async function getStudentById(id: string) {
  const context = await getCurrentUserContext()
  const supabase = await createClient()

  if (!context.schoolId) {
    return null
  }

  const { data, error } = await supabase
    .from("students")
    .select("*")
    .eq("id", id)
    .eq("school_id", context.schoolId)
    .single()

  if (error) {
    console.error("Error fetching student by id:", error)
    return null
  }

  return data
}

type SupabaseClient = Awaited<ReturnType<typeof createClient>>

/**
 * Enrolls a just-created student into the selected classroom for the current
 * semester. Returns a warning message when enrollment was skipped, or null
 * when there is nothing to report (no classroom chosen or success).
 */
async function tryEnrollNewStudent(
  client: SupabaseClient,
  schoolId: string,
  studentId: string,
  classroomId: string | null,
): Promise<string | null> {
  if (!classroomId) return null

  const { data: classroom } = await client
    .from("classrooms")
    .select("id")
    .eq("id", classroomId)
    .eq("school_id", schoolId)
    .eq("is_active", true)
    .maybeSingle()

  if (!classroom) {
    return "เพิ่มนักเรียนสำเร็จ แต่ไม่พบห้องเรียนที่เลือก จึงยังไม่ได้จัดห้อง"
  }

  const semesterId = await getCurrentSemesterId(schoolId).catch(() => null)
  if (!semesterId) {
    return "เพิ่มนักเรียนสำเร็จ แต่ยังไม่มีภาคเรียนปัจจุบัน จึงยังไม่ได้จัดห้อง"
  }

  const { error } = await client.from("classroom_students").insert({
    school_id: schoolId,
    classroom_id: classroomId,
    student_id: studentId,
    semester_id: semesterId,
    is_active: true,
  })

  if (error) {
    if (error.code === "42501") {
      return "เพิ่มนักเรียนสำเร็จ แต่สิทธิ์ของคุณจัดห้องไม่ได้ กรุณาแจ้งครูประจำชั้น"
    }
    console.error("Error enrolling new student:", error)
    return "เพิ่มนักเรียนสำเร็จ แต่จัดห้องไม่สำเร็จ กรุณาจัดห้องภายหลัง"
  }

  return null
}

export async function createStudentAction(
  _prev: ActionResult<{ id: string }> | null,
  formData: FormData,
): Promise<ActionResult<{ id: string }>> {
  try {
    const context = await getCurrentUserContext()

    if (!context.profileId || !context.schoolId || !studentEditors.has(context.role)) {
      return actionFail("FORBIDDEN", "คุณไม่มีสิทธิ์เพิ่มนักเรียน")
    }

    const values = readStudentFormData(formData)
    const fieldErrors = getStudentFieldErrors(values)
    const rawClassroomId = (formData.get("classroom_id") as string | null)?.trim() || null
    if (rawClassroomId && !uuidPattern.test(rawClassroomId)) {
      fieldErrors.classroom_id = ["ห้องเรียนที่เลือกไม่ถูกต้อง"]
    }
    if (Object.keys(fieldErrors).length > 0) {
      return actionFail("VALIDATION_ERROR", "กรุณาตรวจสอบข้อมูลนักเรียน", { fieldErrors })
    }

    const client = await createClient()

    const { data, error } = await client
      .from("students")
      .insert({
        school_id: context.schoolId,
        student_code: values.student_code,
        prefix: values.prefix,
        first_name: values.first_name,
        last_name: values.last_name,
        nickname: values.nickname,
        gender: values.gender as Database["public"]["Enums"]["gender_type"],
        date_of_birth: values.date_of_birth,
        address: values.address,
        national_id: values.national_id,
        travel_method: values.travel_method,
        distance_to_school_km: values.distance_to_school_km,
        subdistrict: values.subdistrict,
        district: values.district,
        province: values.province,
        postal_code: values.postal_code,
        blood_type: values.blood_type?.toUpperCase() ?? null,
        medical_conditions: values.medical_conditions,
        special_needs: values.special_needs,
        family_status: values.family_status,
        nationality: values.nationality || "ไทย",
        ethnicity: values.ethnicity || "ไทย",
        religion: values.religion || "พุทธ",
        status: "active",
      })
      .select("id")
      .single()

    if (error) {
      if (error.code === "23505") {
        return actionFail("CONFLICT", "รหัสนักเรียนซ้ำในโรงเรียนนี้", {
          fieldErrors: { student_code: ["รหัสนักเรียนซ้ำ"] },
        })
      }
      console.error("Error creating student:", error)
      return actionFail("INTERNAL_ERROR", "ไม่สามารถเพิ่มนักเรียนได้")
    }

    revalidatePath("/students")

    logAudit({
      action: "INSERT",
      tableName: "students",
      recordId: data.id,
      schoolId: context.schoolId,
      userId: context.userId,
      newData: { student_code: values.student_code },
    }).catch(() => {})

    const enrollmentWarning = await tryEnrollNewStudent(
      client,
      context.schoolId,
      data.id,
      rawClassroomId,
    )

    return actionOk(
      enrollmentWarning ?? "เพิ่มนักเรียนสำเร็จ",
      {
        data: { id: data.id },
        redirectTo: `/students/${data.id}`,
      },
    )
  } catch (err) {
    return getActionFailure(err)
  }
}

export async function updateStudentAction(
  _prev: ActionResult<{ id: string }> | null,
  formData: FormData,
): Promise<ActionResult<{ id: string }>> {
  try {
    const context = await getCurrentUserContext()
    const studentId = (formData.get("student_id") as string | null)?.trim()

    if (!context.profileId || !context.schoolId || !studentEditors.has(context.role)) {
      return actionFail("FORBIDDEN", "คุณไม่มีสิทธิ์แก้ไขข้อมูลนักเรียน")
    }

    if (!studentId) {
      return actionFail("VALIDATION_ERROR", "ไม่พบรหัสนักเรียนที่ต้องการแก้ไข")
    }

    const values = readStudentFormData(formData)
    const fieldErrors = getStudentFieldErrors(values)
    if (Object.keys(fieldErrors).length > 0) {
      return actionFail("VALIDATION_ERROR", "กรุณาตรวจสอบข้อมูลนักเรียน", { fieldErrors })
    }

    const validStatuses = ["active", "graduated", "transferred", "dropped_out", "suspended"]
    const rawStatus = (formData.get("status") as string | null)?.trim()
    const statusToUpdate = rawStatus && validStatuses.includes(rawStatus) ? rawStatus : undefined

    const updatePayload: Database["public"]["Tables"]["students"]["Update"] = {
      student_code: values.student_code,
      prefix: values.prefix,
      first_name: values.first_name,
      last_name: values.last_name,
      nickname: values.nickname,
      gender: values.gender as Database["public"]["Enums"]["gender_type"],
      date_of_birth: values.date_of_birth,
      address: values.address,
      national_id: values.national_id,
      travel_method: values.travel_method,
      distance_to_school_km: values.distance_to_school_km,
      subdistrict: values.subdistrict,
      district: values.district,
      province: values.province,
      postal_code: values.postal_code,
      blood_type: values.blood_type?.toUpperCase() ?? null,
      medical_conditions: values.medical_conditions,
      special_needs: values.special_needs,
      family_status: values.family_status,
      nationality: values.nationality,
      ethnicity: values.ethnicity,
      religion: values.religion,
    }

    if (statusToUpdate) {
      updatePayload.status = statusToUpdate as Database["public"]["Enums"]["student_status"]
    }

    const client = await createClient()
    const { data, error } = await client
      .from("students")
      .update(updatePayload)
      .eq("id", studentId)
      .eq("school_id", context.schoolId)
      .select("id")
      .maybeSingle()

    if (error) {
      if (error.code === "23505") {
        return actionFail("CONFLICT", "รหัสนักเรียนซ้ำในโรงเรียนนี้", {
          fieldErrors: { student_code: ["รหัสนักเรียนซ้ำ"] },
        })
      }
      console.error("Error updating student:", error)
      return actionFail("INTERNAL_ERROR", "ไม่สามารถแก้ไขข้อมูลนักเรียนได้")
    }

    if (!data) {
      return actionFail("NOT_FOUND", "ไม่พบนักเรียนในโรงเรียนนี้")
    }

    revalidatePath("/students")
    revalidatePath(`/students/${data.id}`)
    revalidatePath(`/students/${data.id}/edit`)

    logAudit({
      action: "UPDATE",
      tableName: "students",
      recordId: data.id,
      schoolId: context.schoolId,
      userId: context.userId,
      newData: { student_code: values.student_code },
    }).catch(() => {})

    return actionOk("แก้ไขข้อมูลนักเรียนสำเร็จ", {
      data: { id: data.id },
      redirectTo: `/students/${data.id}`,
    })
  } catch (err) {
    return getActionFailure(err)
  }
}

export async function archiveStudentAction(
  studentId: string,
  status: StudentArchiveStatus,
): Promise<ActionResult<{ id: string; status: StudentArchiveStatus }>> {
  try {
    const context = await getCurrentUserContext()

    if (!context.profileId || !context.schoolId || !studentEditors.has(context.role)) {
      return actionFail("FORBIDDEN", "คุณไม่มีสิทธิ์เปลี่ยนสถานะนักเรียน")
    }

    if (!studentId || !["transferred", "dropped_out"].includes(status)) {
      return actionFail("VALIDATION_ERROR", "กรุณาเลือกสถานะการออกจากโรงเรียน")
    }

    const client = await createClient()
    const { data, error } = await client
      .from("students")
      .update({ status })
      .eq("id", studentId)
      .eq("school_id", context.schoolId)
      .select("id, status")
      .maybeSingle()

    if (error) {
      console.error("Error archiving student:", error)
      return actionFail("INTERNAL_ERROR", "ไม่สามารถเปลี่ยนสถานะนักเรียนได้")
    }

    if (!data) {
      return actionFail("NOT_FOUND", "ไม่พบนักเรียนในโรงเรียนนี้")
    }

    revalidatePath("/students")
    revalidatePath(`/students/${data.id}`)
    revalidatePath(`/students/${data.id}/edit`)

    logAudit({
      action: "UPDATE",
      tableName: "students",
      recordId: data.id,
      schoolId: context.schoolId,
      userId: context.userId,
      newData: { status },
    }).catch(() => {})

    return actionOk(
      status === "transferred" ? "บันทึกสถานะย้ายออกสำเร็จ" : "บันทึกสถานะออกกลางคันสำเร็จ",
      { data: { id: data.id, status } },
    )
  } catch (err) {
    return getActionFailure(err)
  }
}

export type StudentStatus = Database["public"]["Enums"]["student_status"]

export async function updateStudentStatusAction(
  studentId: string,
  status: StudentStatus,
): Promise<ActionResult<{ id: string; status: StudentStatus }>> {
  try {
    const context = await getCurrentUserContext()

    if (!context.profileId || !context.schoolId || !studentEditors.has(context.role)) {
      return actionFail("FORBIDDEN", "คุณไม่มีสิทธิ์เปลี่ยนสถานะนักเรียน")
    }

    const validStatuses: StudentStatus[] = [
      "active",
      "graduated",
      "transferred",
      "dropped_out",
      "suspended",
    ]

    if (!studentId || !validStatuses.includes(status)) {
      return actionFail("VALIDATION_ERROR", "สถานะนักเรียนไม่ถูกต้อง")
    }

    const client = await createClient()
    const { data, error } = await client
      .from("students")
      .update({ status })
      .eq("id", studentId)
      .eq("school_id", context.schoolId)
      .select("id, status")
      .maybeSingle()

    if (error) {
      console.error("Error updating student status:", error)
      return actionFail("INTERNAL_ERROR", "ไม่สามารถเปลี่ยนสถานะนักเรียนได้")
    }

    if (!data) {
      return actionFail("NOT_FOUND", "ไม่พบนักเรียนในโรงเรียนนี้")
    }

    revalidatePath("/students")
    revalidatePath(`/students/${data.id}`)
    revalidatePath(`/students/${data.id}/edit`)

    const statusLabels: Record<StudentStatus, string> = {
      active: "กำลังศึกษา",
      graduated: "สำเร็จการศึกษา",
      transferred: "ย้ายสถานศึกษา",
      dropped_out: "ออกกลางคัน",
      suspended: "พักการเรียน",
    }

    return actionOk(`เปลี่ยนสถานะเป็น '${statusLabels[status]}' สำเร็จ`, {
      data: { id: data.id, status: data.status as StudentStatus },
    })
  } catch (err) {
    return getActionFailure(err)
  }
}

export async function upsertStudentGuardianAction(
  _prev: ActionResult<{ id: string }> | null,
  formData: FormData,
): Promise<ActionResult<{ id: string }>> {
  try {
    const context = await getCurrentUserContext()

    if (!context.profileId || !context.schoolId || !studentEditors.has(context.role)) {
      return actionFail("FORBIDDEN", "คุณไม่มีสิทธิ์จัดการข้อมูลผู้ปกครอง")
    }

    const studentId = (formData.get("student_id") as string | null)?.trim()
    const guardianId = (formData.get("guardian_id") as string | null)?.trim() || null
    const prefix = (formData.get("prefix") as string | null)?.trim() || null
    const firstName = (formData.get("first_name") as string | null)?.trim() ?? ""
    const lastName = (formData.get("last_name") as string | null)?.trim() ?? ""
    const phone = (formData.get("phone") as string | null)?.trim() || null
    const relationship = guardianRelationSchema.safeParse(
      (formData.get("relationship") as string | null)?.trim() || "guardian",
    )
    const isPrimary = formData.get("is_primary") === "true" || formData.get("is_primary") === "on"
    const canPickup = formData.get("can_pickup") === "true" || formData.get("can_pickup") === "on"

    if (!studentId) {
      return actionFail("VALIDATION_ERROR", "ไม่พบรหัสนักเรียน")
    }

    if (!firstName) {
      return actionFail("VALIDATION_ERROR", "กรุณากรอกชื่อผู้ปกครอง", {
        fieldErrors: { first_name: ["กรุณากรอกชื่อผู้ปกครอง"] },
      })
    }

    if (!lastName) {
      return actionFail("VALIDATION_ERROR", "กรุณากรอกนามสกุลผู้ปกครอง", {
        fieldErrors: { last_name: ["กรุณากรอกนามสกุลผู้ปกครอง"] },
      })
    }

    if (!relationship.success) {
      return actionFail("VALIDATION_ERROR", "ความสัมพันธ์กับนักเรียนไม่ถูกต้อง", {
        fieldErrors: { relationship: ["กรุณาเลือกความสัมพันธ์ที่ถูกต้อง"] },
      })
    }

    const client = await createClient()
    const { data, error } = await client.rpc("manage_student_guardian", {
      p_student_id: studentId,
      p_guardian_id: guardianId ?? undefined,
      p_relation: relationship.data,
      p_is_primary: isPrimary,
      p_can_pickup: canPickup,
      p_prefix: prefix ?? undefined,
      p_first_name: firstName,
      p_last_name: lastName,
      p_phone: phone ?? undefined,
    })

    if (error) {
      console.error("Error saving student guardian transaction:", error)
      return actionFail("INTERNAL_ERROR", "ไม่สามารถบันทึกข้อมูลผู้ปกครองได้")
    }

    const result = data as { guardian_id?: string } | null
    const targetGuardianId = result?.guardian_id
    if (!targetGuardianId) {
      return actionFail("INTERNAL_ERROR", "ระบบไม่ได้ส่งรหัสผู้ปกครองกลับมา")
    }

    revalidatePath("/students")
    revalidatePath(`/students/${studentId}`)
    revalidatePath(`/students/${studentId}/edit`)

    return actionOk("บันทึกข้อมูลผู้ปกครองสำเร็จ", {
      data: { id: targetGuardianId },
    })
  } catch (err) {
    return getActionFailure(err)
  }
}

export async function deleteStudentGuardianAction(
  studentId: string,
  guardianId: string,
): Promise<ActionResult<{ success: boolean }>> {
  try {
    const context = await getCurrentUserContext()

    if (!context.profileId || !context.schoolId || !studentEditors.has(context.role)) {
      return actionFail("FORBIDDEN", "คุณไม่มีสิทธิ์ลบข้อมูลผู้ปกครอง")
    }

    const client = await createClient()
    const idSchema = z.string().uuid()
    if (!idSchema.safeParse(studentId).success || !idSchema.safeParse(guardianId).success) {
      return actionFail("VALIDATION_ERROR", "รหัสนักเรียนหรือผู้ปกครองไม่ถูกต้อง")
    }

    const { data, error } = await client.rpc("remove_student_guardian", {
      p_student_id: studentId,
      p_guardian_id: guardianId,
    })

    if (error) {
      console.error("Error removing student guardian link:", error)
      return actionFail("INTERNAL_ERROR", "ไม่สามารถลบความสัมพันธ์ผู้ปกครองได้")
    }

    const result = data as { deleted?: boolean } | null
    if (!result?.deleted) {
      return actionFail("NOT_FOUND", "ไม่พบความสัมพันธ์ผู้ปกครองที่ต้องการลบ")
    }

    revalidatePath("/students")
    revalidatePath(`/students/${studentId}`)
    revalidatePath(`/students/${studentId}/edit`)

    return actionOk("ลบข้อมูลผู้ปกครองเรียบร้อยแล้ว", {
      data: { success: true },
    })
  } catch (err) {
    return getActionFailure(err)
  }
}

export type QuickStudentSearchResult = {
  id: string
  studentCode: string
  fullName: string
  classroomName: string | null
  riskLevel: string
  photoUrl: string | null
}

export async function searchStudentsQuickAction(
  query: string,
): Promise<ActionResult<QuickStudentSearchResult[]>> {
  try {
    const context = await getCurrentUserContext()
    if (!context.schoolId) {
      return actionOk("ค้นหาสำเร็จ", { data: [] })
    }

    const trimmed = query.trim()
    if (!trimmed) {
      return actionOk("ค้นหาสำเร็จ", { data: [] })
    }

    const client = await createClient()
    const clean = trimmed.replace(/[%_,]/g, "")

    let dbQuery = client
      .from("v_student_worklist")
      .select("student_id, student_code, full_name, classroom_name, risk_level, photo_url")
      .eq("school_id", context.schoolId)
      .or(`full_name.ilike.%${clean}%,student_code.ilike.%${clean}%,classroom_name.ilike.%${clean}%`)
      .order("priority_score", { ascending: false })
      .limit(8)

    if (context.role === "student" && context.studentId) {
      dbQuery = dbQuery.eq("student_id", context.studentId)
    }

    const { data, error } = await dbQuery

    if (error) {
      console.error("Quick search students error:", error)
      return actionFail("INTERNAL_ERROR", "ไม่สามารถค้นหารายชื่อนักเรียนได้")
    }

    const results: QuickStudentSearchResult[] = (data ?? [])
      .map((row) => ({
        id: row.student_id ?? "",
        studentCode: row.student_code ?? "-",
        fullName: row.full_name ?? "-",
        classroomName: row.classroom_name ?? null,
        riskLevel: row.risk_level ?? "normal",
        photoUrl: row.photo_url ?? null,
      }))
      .filter((r) => Boolean(r.id))

    return actionOk("ค้นหาสำเร็จ", { data: results })
  } catch (err) {
    return getActionFailure(err)
  }
}

export async function deleteStudentAction(
  studentId: string,
): Promise<ActionResult<{ id: string; success: boolean }>> {
  try {
    const context = await getCurrentUserContext()

    if (!context.profileId || !context.schoolId || !studentEditors.has(context.role)) {
      return actionFail("FORBIDDEN", "คุณไม่มีสิทธิ์ลบข้อมูลนักเรียน")
    }

    if (!studentId || !uuidPattern.test(studentId)) {
      return actionFail("VALIDATION_ERROR", "รหัสนักเรียนไม่ถูกต้อง")
    }

    const adminClient = createAdminClient()

    const { data: student, error: fetchErr } = await adminClient
      .from("students")
      .select("id, student_code, first_name, last_name")
      .eq("id", studentId)
      .eq("school_id", context.schoolId)
      .maybeSingle()

    if (fetchErr) {
      console.error("Error finding student to delete:", fetchErr)
      return actionFail("INTERNAL_ERROR", "เกิดข้อผิดพลาดในการตรวจสอบข้อมูลนักเรียน")
    }

    if (!student) {
      return actionFail("NOT_FOUND", "ไม่พบข้อมูลนักเรียนที่ต้องการลบ")
    }

    const { error: deleteErr } = await adminClient
      .from("students")
      .delete()
      .eq("id", studentId)
      .eq("school_id", context.schoolId)

    if (deleteErr) {
      console.error("Error deleting student:", deleteErr)
      return actionFail("INTERNAL_ERROR", "ไม่สามารถลบข้อมูลนักเรียนได้")
    }

    revalidatePath("/students")
    revalidatePath("/students/import")
    revalidatePath("/dashboard")
    revalidatePath(`/students/${studentId}`)

    logAudit({
      action: "DELETE",
      tableName: "students",
      recordId: student.id,
      schoolId: context.schoolId,
      userId: context.userId,
      oldData: {
        student_code: student.student_code,
        first_name: student.first_name,
        last_name: student.last_name,
      },
    }).catch(() => {})

    return actionOk(`ลบข้อมูลนักเรียน ${student.first_name} ${student.last_name} เรียบร้อยแล้ว`, {
      data: { id: student.id, success: true },
    })
  } catch (err) {
    return getActionFailure(err)
  }
}

export async function deleteStudentsBatchAction(
  studentIds: string[],
): Promise<ActionResult<{ deletedCount: number; success: boolean }>> {
  try {
    const context = await getCurrentUserContext()

    if (!context.profileId || !context.schoolId || !studentEditors.has(context.role)) {
      return actionFail("FORBIDDEN", "คุณไม่มีสิทธิ์ลบข้อมูลนักเรียน")
    }

    if (!Array.isArray(studentIds) || studentIds.length === 0) {
      return actionFail("VALIDATION_ERROR", "กรุณาเลือกนักเรียนที่ต้องการลบอย่างน้อย 1 คน")
    }

    const validIds = studentIds.filter((id) => uuidPattern.test(id))
    if (validIds.length === 0) {
      return actionFail("VALIDATION_ERROR", "รหัสนักเรียนไม่ถูกต้อง")
    }

    const adminClient = createAdminClient()

    let totalDeleted = 0
    const chunkSize = 200
    for (let i = 0; i < validIds.length; i += chunkSize) {
      const chunk = validIds.slice(i, i + chunkSize)
      const { data, error } = await adminClient
        .from("students")
        .delete()
        .eq("school_id", context.schoolId)
        .in("id", chunk)
        .select("id")

      if (error) {
        console.error("Error batch deleting students:", error)
        return actionFail("INTERNAL_ERROR", "ไม่สามารถลบข้อมูลนักเรียนบางส่วนได้")
      }
      totalDeleted += data?.length ?? 0
    }

    revalidatePath("/students")
    revalidatePath("/students/import")
    revalidatePath("/dashboard")

    logAudit({
      action: "DELETE",
      tableName: "students",
      recordId: context.schoolId,
      schoolId: context.schoolId,
      userId: context.userId,
      oldData: { deletedCount: totalDeleted, studentIds: validIds },
    }).catch(() => {})

    return actionOk(`ลบข้อมูลนักเรียนเรียบร้อยแล้ว (${totalDeleted} คน)`, {
      data: { deletedCount: totalDeleted, success: true },
    })
  } catch (err) {
    return getActionFailure(err)
  }
}

export async function clearAllStudentsInSchoolAction(): Promise<
  ActionResult<{ deletedCount: number; success: boolean }>
> {
  try {
    const context = await getCurrentUserContext()

    if (!context.profileId || !context.schoolId || !studentEditors.has(context.role)) {
      return actionFail("FORBIDDEN", "คุณไม่มีสิทธิ์ล้างข้อมูลนักเรียน")
    }

    const adminClient = createAdminClient()

    const { data, error } = await adminClient
      .from("students")
      .delete()
      .eq("school_id", context.schoolId)
      .select("id")

    if (error) {
      console.error("Error clearing all students:", error)
      return actionFail("INTERNAL_ERROR", "ไม่สามารถล้างข้อมูลนักเรียนได้")
    }

    const totalDeleted = data?.length ?? 0

    revalidatePath("/students")
    revalidatePath("/students/import")
    revalidatePath("/dashboard")

    logAudit({
      action: "DELETE",
      tableName: "students",
      recordId: context.schoolId,
      schoolId: context.schoolId,
      userId: context.userId,
      oldData: { action: "CLEAR_ALL_STUDENTS", deletedCount: totalDeleted },
    }).catch(() => {})

    return actionOk(`ล้างข้อมูลนักเรียนทั้งหมดในโรงเรียนเรียบร้อยแล้ว (${totalDeleted} คน)`, {
      data: { deletedCount: totalDeleted, success: true },
    })
  } catch (err) {
    return getActionFailure(err)
  }
}


