"use server"

import { revalidatePath } from "next/cache"

import type { ActionResult } from "@/lib/server/action-result"
import { actionFail, actionOk } from "@/lib/server/action-result"
import { getCurrentUserContext, type AppRole } from "@/lib/server/current-user"
import { logAudit } from "@/lib/server/audit-logger"
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
  housingType: string | null
  housingOwnership: string | null
  familyMembersCount: number | null
  familyIncome: number | null
  familySituation: string | null
  studentBehaviorAtHome: string | null
  environmentSafety: string | null
  hasStudySpace: boolean
  hasInternet: boolean
  coVisitors: string[]
  followUpNeeded: boolean
  hasFamilyProblem: boolean
  travelDifficulty: boolean
  travelDifficultyDetail: string | null
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

function parseNonNegativeInt(raw: string): number | null | false {
  if (raw === "") return null
  if (!/^\d+$/.test(raw)) return false
  return Number(raw)
}

function parseNonNegativeNumber(raw: string): number | null | false {
  if (raw === "") return null
  const normalized = raw.replace(/,/g, "")
  if (normalized === "") return null
  const value = Number(normalized)
  if (!Number.isFinite(value) || value < 0) return false
  return Math.round(value * 100) / 100
}

function parseCoVisitors(raw: string): string[] {
  return raw
    .split(/[\n,]/)
    .map((part) => part.trim())
    .filter((part) => part.length > 0)
    .slice(0, 20)
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
  const housingType = getFormString(formData, "housingType")
  const housingOwnership = getFormString(formData, "housingOwnership")
  const familySituation = getFormString(formData, "familySituation")
  const studentBehaviorAtHome = getFormString(formData, "studentBehaviorAtHome")
  const environmentSafety = getFormString(formData, "environmentSafety")
  const travelDifficultyDetail = getFormString(formData, "travelDifficultyDetail")
  const coVisitorsRaw = getFormString(formData, "coVisitors")

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
    ["housingType", housingType, 100],
    ["housingOwnership", housingOwnership, 100],
    ["familySituation", familySituation, 5000],
    ["studentBehaviorAtHome", studentBehaviorAtHome, 5000],
    ["environmentSafety", environmentSafety, 2000],
    ["travelDifficultyDetail", travelDifficultyDetail, 2000],
    ["coVisitors", coVisitorsRaw, 2000],
  ]
  const fieldErrors: Record<string, string[]> = {}
  for (const [field, value, maxLength] of textFields) {
    if (value.length > maxLength) {
      fieldErrors[field] = [`ข้อมูลต้องมีความยาวไม่เกิน ${maxLength} ตัวอักษร`]
    }
  }

  const familyMembersCount = parseNonNegativeInt(getFormString(formData, "familyMembersCount"))
  if (familyMembersCount === false) {
    fieldErrors.familyMembersCount = ["จำนวนสมาชิกต้องเป็นจำนวนเต็มตั้งแต่ 0 ขึ้นไป"]
  }
  const familyIncome = parseNonNegativeNumber(getFormString(formData, "familyIncome"))
  if (familyIncome === false) {
    fieldErrors.familyIncome = ["รายได้ต้องเป็นตัวเลขตั้งแต่ 0 ขึ้นไป"]
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
      housingType: housingType || null,
      housingOwnership: housingOwnership || null,
      familyMembersCount: familyMembersCount === false ? null : familyMembersCount,
      familyIncome: familyIncome === false ? null : familyIncome,
      familySituation: familySituation || null,
      studentBehaviorAtHome: studentBehaviorAtHome || null,
      environmentSafety: environmentSafety || null,
      hasStudySpace: getBoolean(formData, "hasStudySpace"),
      hasInternet: getBoolean(formData, "hasInternet"),
      coVisitors: parseCoVisitors(coVisitorsRaw),
      followUpNeeded: getBoolean(formData, "followUpNeeded"),
      hasFamilyProblem: getBoolean(formData, "hasFamilyProblem"),
      travelDifficulty: getBoolean(formData, "travelDifficulty"),
      travelDifficultyDetail: travelDifficultyDetail || null,
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
      housingType: parsed.fields.housingType ?? undefined,
      housingOwnership: parsed.fields.housingOwnership ?? undefined,
      familyMembersCount: parsed.fields.familyMembersCount,
      familyIncome: parsed.fields.familyIncome,
      familySituation: parsed.fields.familySituation ?? undefined,
      studentBehaviorAtHome: parsed.fields.studentBehaviorAtHome ?? undefined,
      environmentSafety: parsed.fields.environmentSafety ?? undefined,
      hasStudySpace: parsed.fields.hasStudySpace,
      hasInternet: parsed.fields.hasInternet,
      coVisitors: parsed.fields.coVisitors,
      followUpNeeded: parsed.fields.followUpNeeded,
      hasFamilyProblem: parsed.fields.hasFamilyProblem,
      travelDifficulty: parsed.fields.travelDifficulty,
      travelDifficultyDetail: parsed.fields.travelDifficultyDetail ?? undefined,
      overallAssessment: parsed.fields.overallAssessment ?? undefined,
      familyProblemDetail: parsed.fields.familyProblemDetail ?? undefined,
      suggestions: parsed.fields.suggestions ?? undefined,
      followUpDetail: parsed.fields.followUpDetail ?? undefined,
    }

    const result = await createHomeVisit(input)

    revalidatePath("/home-visits")

    logAudit({
      action: "INSERT",
      tableName: "home_visits",
      recordId: result.id,
      schoolId: context.schoolId,
      userId: context.userId,
      newData: { student_id: parsed.fields.studentId, visit_date: parsed.fields.visitDate },
    }).catch(() => {})

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
        housing_type: parsed.fields.housingType,
        housing_ownership: parsed.fields.housingOwnership,
        family_members_count: parsed.fields.familyMembersCount,
        family_income: parsed.fields.familyIncome,
        family_situation: parsed.fields.familySituation,
        student_behavior_at_home: parsed.fields.studentBehaviorAtHome,
        environment_safety: parsed.fields.environmentSafety,
        has_study_space: parsed.fields.hasStudySpace,
        has_internet: parsed.fields.hasInternet,
        co_visitors: parsed.fields.coVisitors,
        follow_up_needed: parsed.fields.followUpNeeded,
        has_family_problem: parsed.fields.hasFamilyProblem,
        travel_difficulty: parsed.fields.travelDifficulty,
        travel_difficulty_detail: parsed.fields.travelDifficultyDetail,
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

    logAudit({
      action: "UPDATE",
      tableName: "home_visits",
      recordId: record.id,
      schoolId: context.schoolId,
      userId: context.userId,
      newData: { visit_date: parsed.fields.visitDate },
    }).catch(() => {})

    return actionOk("แก้ไขบันทึกเยี่ยมบ้านสำเร็จ", {
      data: { id: record.id },
      redirectTo: `/home-visits/${record.id}?updated=1`,
      revalidated,
    })
  } catch (error) {
    return actionFailureFromError(error)
  }
}
