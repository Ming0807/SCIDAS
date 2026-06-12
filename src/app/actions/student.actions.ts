"use server"

import { revalidatePath } from "next/cache"

import type { ActionResult } from "@/lib/server/action-result"
import { actionFail, actionOk } from "@/lib/server/action-result"
import { getCurrentUserContext } from "@/lib/server/current-user"
import { createClient } from "@/utils/supabase/server"
import { Database } from "@/types/database.types"

export type StudentRow = Database["public"]["Tables"]["students"]["Row"]

export async function getStudents() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("students")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching students:", error)
    return []
  }

  return data
}

export async function getStudentById(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("students")
    .select("*")
    .eq("id", id)
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

    if (!context.profileId) {
      return actionFail("UNAUTHORIZED", "กรุณาเข้าสู่ระบบก่อนเพิ่มนักเรียน")
    }

    const firstName = (formData.get("first_name") as string)?.trim()
    const lastName = (formData.get("last_name") as string)?.trim()
    const studentCode = (formData.get("student_code") as string)?.trim()
    const prefix = (formData.get("prefix") as string)?.trim() || null
    const nickname = (formData.get("nickname") as string)?.trim() || null
    const gender = (formData.get("gender") as string)?.trim()
    const dateOfBirth = (formData.get("date_of_birth") as string)?.trim()
    const address = (formData.get("address") as string)?.trim() || null

    if (!firstName) {
      return actionFail("VALIDATION_ERROR", "กรุณากรอกชื่อ", {
        fieldErrors: { first_name: ["กรุณากรอกชื่อ"] },
      })
    }

    if (!lastName) {
      return actionFail("VALIDATION_ERROR", "กรุณากรอกนามสกุล", {
        fieldErrors: { last_name: ["กรุณากรอกนามสกุล"] },
      })
    }

    if (!studentCode) {
      return actionFail("VALIDATION_ERROR", "กรุณากรอกรหัสนักเรียน", {
        fieldErrors: { student_code: ["กรุณากรอกรหัสนักเรียน"] },
      })
    }

    if (!gender || !["male", "female", "other"].includes(gender)) {
      return actionFail("VALIDATION_ERROR", "กรุณาเลือกเพศ", {
        fieldErrors: { gender: ["กรุณาเลือกเพศ"] },
      })
    }

    if (!dateOfBirth) {
      return actionFail("VALIDATION_ERROR", "กรุณาระบุวันเกิด", {
        fieldErrors: { date_of_birth: ["กรุณาระบุวันเกิด"] },
      })
    }

    const client = await createClient()

    const { data, error } = await client
      .from("students")
      .insert({
        school_id: context.schoolId,
        student_code: studentCode,
        prefix,
        first_name: firstName,
        last_name: lastName,
        nickname,
        gender: gender as "male" | "female" | "other",
        date_of_birth: dateOfBirth,
        address: address || null,
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
      return actionFail("INTERNAL_ERROR", error.message)
    }

    revalidatePath("/students")

    return actionOk("เพิ่มนักเรียนสำเร็จ", {
      data: { id: data.id },
      redirectTo: `/students/${data.id}`,
    })
  } catch (err) {
    return actionFail(
      "INTERNAL_ERROR",
      err instanceof Error ? err.message : "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ",
    )
  }
}
