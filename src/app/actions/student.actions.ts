"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"

import type { ActionResult } from "@/lib/server/action-result"
import { actionFail, actionOk } from "@/lib/server/action-result"
import { getCurrentUserContext } from "@/lib/server/current-user"
import { createClient } from "@/utils/supabase/server"
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
}

export type StudentArchiveStatus = "transferred" | "dropped_out"
const studentEditors = new Set(["admin", "homeroom_teacher", "counselor"])
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
] as const

function readStudentFormData(formData: FormData): StudentFormData {
  const getText = (name: (typeof studentFormFields)[number]) =>
    (formData.get(name) as string | null)?.trim() ?? ""
  const values = Object.fromEntries(
    studentFormFields.map((field) => [field, getText(field)]),
  ) as Record<(typeof studentFormFields)[number], string>

  return {
    student_code: values.student_code,
    prefix: values.prefix || null,
    first_name: values.first_name,
    last_name: values.last_name,
    nickname: values.nickname || null,
    gender: values.gender,
    date_of_birth: values.date_of_birth,
    address: values.address || null,
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

    return actionOk("เพิ่มนักเรียนสำเร็จ", {
      data: { id: data.id },
      redirectTo: `/students/${data.id}`,
    })
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
      p_guardian_id: guardianId,
      p_relation: relationship.data,
      p_is_primary: isPrimary,
      p_can_pickup: canPickup,
      p_prefix: prefix,
      p_first_name: firstName,
      p_last_name: lastName,
      p_phone: phone,
      p_email: null,
      p_occupation: null,
      p_monthly_income: null,
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
