"use server"

import { revalidatePath } from "next/cache"

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

    const client = await createClient()
    const { data, error } = await client
      .from("students")
      .update({
        student_code: values.student_code,
        prefix: values.prefix,
        first_name: values.first_name,
        last_name: values.last_name,
        nickname: values.nickname,
        gender: values.gender as Database["public"]["Enums"]["gender_type"],
        date_of_birth: values.date_of_birth,
        address: values.address,
      })
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
