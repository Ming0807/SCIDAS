"use server"

import { revalidatePath } from "next/cache"

import type { ActionResult } from "@/lib/server/action-result"
import { actionFail, actionOk } from "@/lib/server/action-result"
import { getCurrentUserContext, type AppRole } from "@/lib/server/current-user"
import { createClient } from "@/utils/supabase/server"
import {
  createHomeVisit,
  type CreateHomeVisitInput,
  type HousingCondition,
} from "@/lib/server/home-visit-read-models"

type HomeVisitActionData = { id: string }
const homeVisitEditors = new Set<AppRole>([
  "admin",
  "homeroom_teacher",
  "counselor",
])
const housingConditions: HousingCondition[] = ["good", "moderate", "poor", "critical"]

type UpdateHomeVisitFields = {
  studentId: string
  visitDate: string
  visitTime: string | null
  addressVisited: string | null
  housingCondition: HousingCondition | null
  followUpNeeded: boolean
  hasFamilyProblem: boolean
  travelDifficulty: boolean
  overallAssessment: string | null
  familyProblemDetail: string | null
  suggestions: string | null
  followUpDetail: string | null
}

function getFormString(formData: FormData, name: string): string {
  const value = formData.get(name)
  return typeof value === "string" ? value.trim() : ""
}

function parseDate(value: string): string | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null

  const parsed = new Date(`${value}T00:00:00.000Z`)
  return Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value
    ? null
    : value
}

function parseTime(value: string): string | null {
  if (!value) return null
  if (!/^\d{2}:\d{2}$/.test(value)) return null

  const [hours, minutes] = value.split(":").map(Number)
  return hours <= 23 && minutes <= 59 ? value : null
}

function getBoolean(formData: FormData, name: string): boolean {
  const value = formData.get(name)
  return value === "on" || value === "true"
}

function parseUpdateHomeVisitFields(
  formData: FormData,
): { ok: true; fields: UpdateHomeVisitFields } | { ok: false; result: ActionResult<HomeVisitActionData> } {
  const studentId = getFormString(formData, "studentId")
  const visitDateValue = getFormString(formData, "visitDate")
  const visitTimeValue = getFormString(formData, "visitTime")
  const housingConditionValue = getFormString(formData, "housingCondition")
  const addressVisited = getFormString(formData, "addressVisited")
  const overallAssessment = getFormString(formData, "overallAssessment")
  const familyProblemDetail = getFormString(formData, "familyProblemDetail")
  const suggestions = getFormString(formData, "suggestions")
  const followUpDetail = getFormString(formData, "followUpDetail")

  if (!studentId) {
    return {
      ok: false,
      result: actionFail("VALIDATION_ERROR", "กรุณาเลือกนักเรียน", {
        fieldErrors: { studentId: ["กรุณาเลือกนักเรียน"] },
      }),
    }
  }

  const visitDate = parseDate(visitDateValue)
  if (!visitDate) {
    return {
      ok: false,
      result: actionFail("VALIDATION_ERROR", "กรุณาระบุวันที่เยี่ยมบ้านให้ถูกต้อง", {
        fieldErrors: { visitDate: ["กรุณาระบุวันที่เยี่ยมบ้านให้ถูกต้อง"] },
      }),
    }
  }

  const visitTime = parseTime(visitTimeValue)
  if (visitTimeValue && !visitTime) {
    return {
      ok: false,
      result: actionFail("VALIDATION_ERROR", "กรุณาระบุเวลาให้ถูกต้อง", {
        fieldErrors: { visitTime: ["กรุณาระบุเวลาให้ถูกต้อง"] },
      }),
    }
  }

  const housingCondition = housingConditionValue
    ? (housingConditionValue as HousingCondition)
    : null
  if (housingCondition && !housingConditions.includes(housingCondition)) {
    return {
      ok: false,
      result: actionFail("VALIDATION_ERROR", "กรุณาเลือกสภาพบ้านที่ถูกต้อง", {
        fieldErrors: { housingCondition: ["กรุณาเลือกสภาพบ้านที่ถูกต้อง"] },
      }),
    }
  }

  const textFields: Array<[string, string, number]> = [
    ["addressVisited", addressVisited, 2000],
    ["overallAssessment", overallAssessment, 5000],
    ["familyProblemDetail", familyProblemDetail, 5000],
    ["suggestions", suggestions, 5000],
    ["followUpDetail", followUpDetail, 5000],
  ]
  const fieldErrors: Record<string, string[]> = {}
  for (const [field, value, maxLength] of textFields) {
    if (value.length > maxLength) {
      fieldErrors[field] = [`ข้อมูลต้องมีความยาวไม่เกิน ${maxLength} ตัวอักษร`]
    }
  }
  if (Object.keys(fieldErrors).length > 0) {
    return {
      ok: false,
      result: actionFail("VALIDATION_ERROR", "กรุณาตรวจสอบข้อมูลที่กรอก", { fieldErrors }),
    }
  }

  return {
    ok: true,
    fields: {
      studentId,
      visitDate,
      visitTime,
      addressVisited: addressVisited || null,
      housingCondition,
      followUpNeeded: getBoolean(formData, "followUpNeeded"),
      hasFamilyProblem: getBoolean(formData, "hasFamilyProblem"),
      travelDifficulty: getBoolean(formData, "travelDifficulty"),
      overallAssessment: overallAssessment || null,
      familyProblemDetail: familyProblemDetail || null,
      suggestions: suggestions || null,
      followUpDetail: followUpDetail || null,
    },
  }
}

function actionFailureFromError(error: unknown): ActionResult<HomeVisitActionData> {
  if (error instanceof Error && error.message === "UNAUTHORIZED") {
    return actionFail("UNAUTHORIZED", "กรุณาเข้าสู่ระบบก่อนแก้ไขข้อมูลเยี่ยมบ้าน")
  }

  if (error instanceof Error && error.message === "FORBIDDEN") {
    return actionFail("FORBIDDEN", "คุณไม่มีสิทธิ์แก้ไขข้อมูลเยี่ยมบ้านนี้")
  }

  if (error instanceof Error) {
    console.error("Home visit update failed:", error)
  }

  return actionFail("INTERNAL_ERROR", "ไม่สามารถแก้ไขข้อมูลเยี่ยมบ้านได้")
}

export async function createHomeVisitAction(
  _prev: ActionResult<{ id: string }> | null,
  formData: FormData,
): Promise<ActionResult<{ id: string }>> {
  try {
    const context = await getCurrentUserContext()
    if (!context.profileId) return actionFail("UNAUTHORIZED", "กรุณาเข้าสู่ระบบก่อนบันทึกข้อมูลเยี่ยมบ้าน")
    if (!homeVisitEditors.has(context.role)) return actionFail("FORBIDDEN", "คุณไม่มีสิทธิ์บันทึกข้อมูลเยี่ยมบ้าน")

    const parsed = parseUpdateHomeVisitFields(formData)
    if (!parsed.ok) return parsed.result

    const input: CreateHomeVisitInput = {
      studentId: parsed.fields.studentId,
      visitDate: parsed.fields.visitDate,
      visitTime: parsed.fields.visitTime ?? undefined,
      addressVisited: parsed.fields.addressVisited ?? undefined,
      housingCondition: parsed.fields.housingCondition ?? undefined,
      followUpNeeded: parsed.fields.followUpNeeded,
      hasFamilyProblem: parsed.fields.hasFamilyProblem,
      travelDifficulty: parsed.fields.travelDifficulty,
      overallAssessment: parsed.fields.overallAssessment ?? undefined,
      familyProblemDetail: parsed.fields.familyProblemDetail ?? undefined,
      suggestions: parsed.fields.suggestions ?? undefined,
      followUpDetail: parsed.fields.followUpDetail ?? undefined,
    }

    const result = await createHomeVisit(input)

    revalidatePath("/home-visits")

    return actionOk("บันทึกการเยี่ยมบ้านสำเร็จ", {
      data: { id: result.id },
      redirectTo: "/home-visits",
    })
  } catch (error) {
    if (error instanceof Error && error.message === "NO_ACTIVE_SEMESTER") {
      return actionFail("VALIDATION_ERROR", "โรงเรียนยังไม่ได้กำหนดภาคเรียนปัจจุบัน")
    }
    return actionFailureFromError(error)
  }
}

export async function updateHomeVisitAction(
  _prev: ActionResult<HomeVisitActionData> | null,
  formData: FormData,
): Promise<ActionResult<HomeVisitActionData>> {
  try {
    const context = await getCurrentUserContext()

    if (!context.profileId) {
      return actionFail("UNAUTHORIZED", "กรุณาเข้าสู่ระบบก่อนแก้ไขข้อมูลเยี่ยมบ้าน")
    }
    if (!homeVisitEditors.has(context.role)) {
      return actionFail("FORBIDDEN", "คุณไม่มีสิทธิ์แก้ไขข้อมูลเยี่ยมบ้าน")
    }

    const recordId = getFormString(formData, "record_id")
    if (!recordId) {
      return actionFail("VALIDATION_ERROR", "ไม่พบรหัสบันทึกเยี่ยมบ้าน")
    }

    const parsed = parseUpdateHomeVisitFields(formData)
    if (!parsed.ok) return parsed.result

    const client = await createClient()
    const { data: record, error: recordError } = await client
      .from("home_visits")
      .select("id, student_id, visitor_id, semester_id")
      .eq("id", recordId)
      .eq("school_id", context.schoolId)
      .maybeSingle()

    if (recordError) {
      return actionFail("INTERNAL_ERROR", "ไม่สามารถตรวจสอบบันทึกเยี่ยมบ้านได้")
    }
    if (!record) {
      return actionFail("NOT_FOUND", "ไม่พบบันทึกเยี่ยมบ้านนี้")
    }
    if (context.role !== "admin" && record.visitor_id !== context.profileId) {
      return actionFail("FORBIDDEN", "แก้ไขได้เฉพาะรายการที่คุณเป็นผู้บันทึก")
    }

    const [{ data: student, error: studentError }, { data: semester, error: semesterError }] =
      await Promise.all([
        client
          .from("students")
          .select("id")
          .eq("id", parsed.fields.studentId)
          .eq("school_id", context.schoolId)
          .maybeSingle(),
        client
          .from("semesters")
          .select("id")
          .eq("id", record.semester_id)
          .eq("school_id", context.schoolId)
          .maybeSingle(),
      ])

    if (studentError || semesterError) {
      return actionFail("INTERNAL_ERROR", "ไม่สามารถตรวจสอบเจ้าของข้อมูลเยี่ยมบ้านได้")
    }
    if (!student || !semester) {
      return actionFail("FORBIDDEN", "ข้อมูลนักเรียนหรือภาคเรียนไม่อยู่ในโรงเรียนนี้")
    }

    let updateQuery = client
      .from("home_visits")
      .update({
        student_id: parsed.fields.studentId,
        visit_date: parsed.fields.visitDate,
        visit_time: parsed.fields.visitTime,
        address_visited: parsed.fields.addressVisited,
        housing_condition: parsed.fields.housingCondition,
        follow_up_needed: parsed.fields.followUpNeeded,
        has_family_problem: parsed.fields.hasFamilyProblem,
        travel_difficulty: parsed.fields.travelDifficulty,
        overall_assessment: parsed.fields.overallAssessment,
        family_problem_detail: parsed.fields.familyProblemDetail,
        suggestions: parsed.fields.suggestions,
        follow_up_detail: parsed.fields.followUpDetail,
      })
      .eq("id", record.id)
      .eq("school_id", context.schoolId)
      .eq("semester_id", record.semester_id)

    if (context.role !== "admin") {
      updateQuery = updateQuery.eq("visitor_id", context.profileId)
    }

    const { error: updateError } = await updateQuery
    if (updateError) {
      return updateError.code === "42501"
        ? actionFail("FORBIDDEN", "คุณไม่มีสิทธิ์แก้ไขบันทึกเยี่ยมบ้านนี้")
        : actionFail("INTERNAL_ERROR", "ไม่สามารถแก้ไขข้อมูลเยี่ยมบ้านได้")
    }

    const revalidated = [
      "/home-visits",
      `/home-visits/${record.id}`,
      `/home-visits/${record.id}/edit`,
      `/students/${record.student_id}`,
      `/students/${parsed.fields.studentId}`,
    ]
    for (const path of revalidated) revalidatePath(path)

    return actionOk("แก้ไขบันทึกเยี่ยมบ้านสำเร็จ", {
      data: { id: record.id },
      redirectTo: `/home-visits/${record.id}?updated=1`,
      revalidated,
    })
  } catch (error) {
    return actionFailureFromError(error)
  }
}
