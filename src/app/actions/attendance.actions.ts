"use server"

import { revalidatePath } from "next/cache"

import type { Database } from "@/types/database.types"
import type { ActionResult } from "@/lib/server/action-result"
import { actionFail, actionOk } from "@/lib/server/action-result"
import { getCurrentUserContext } from "@/lib/server/current-user"
import { createClient } from "@/utils/supabase/server"

type AttendanceStatus = Database["public"]["Enums"]["attendance_status"]

type StudentSummary = {
  id: string
  first_name: string
  last_name: string
  prefix: string | null
}

type ClassroomStudentJoin = {
  students: StudentSummary | StudentSummary[] | null
}

export type AttendanceInput = {
  student_id: string
  status: AttendanceStatus
  check_in_time?: string | null
  remark?: string | null
}

const editableRoles = new Set(["admin", "homeroom_teacher"])
const validStatuses = new Set<AttendanceStatus>(["present", "absent", "late", "leave", "sick"])
const isoDatePattern = /^\d{4}-\d{2}-\d{2}$/

const firstOrSelf = <T,>(value: T | T[] | null) =>
  Array.isArray(value) ? value[0] : value

export async function getClassroomStudents() {
  const context = await getCurrentUserContext()
  if (!context.profileId) return { classroom: null, students: [] }
  const supabase = await createClient()

  let classroomQuery = supabase
    .from("classrooms")
    .select("id, name")
    .eq("school_id", context.schoolId)
    .eq("is_active", true)

  if (context.role !== "admin" && context.role !== "director") {
    classroomQuery = classroomQuery.eq("homeroom_teacher_id", context.profileId)
  }

  const { data: classroom, error: classroomError } = await classroomQuery
    .order("grade_level")
    .order("room_number")
    .limit(1)
    .maybeSingle()

  if (classroomError) throw new Error(classroomError.message)
  if (!classroom) return { classroom: null, students: [] }

  const { data: classroomStudents, error } = await supabase
    .from("classroom_students")
    .select(`
      student_id,
      students!inner (
        id,
        first_name,
        last_name,
        prefix,
        school_id
      )
    `)
    .eq("school_id", context.schoolId)
    .eq("students.school_id", context.schoolId)
    .eq("classroom_id", classroom.id)
    .eq("is_active", true)

  if (error) throw new Error(error.message)

  const students = (classroomStudents ?? [])
    .map((item) => firstOrSelf((item as ClassroomStudentJoin).students))
    .filter((student): student is StudentSummary => Boolean(student))
    .map((student) => ({
      id: student.id,
      name: `${student.prefix ?? ""}${student.first_name} ${student.last_name}`,
    }))
    .sort((a, b) => a.name.localeCompare(b.name, "th"))

  return { classroom, students }
}

export async function getAttendanceForDate(classroomId: string, date: string) {
  const context = await getCurrentUserContext()
  if (!isoDatePattern.test(date)) throw new Error("VALIDATION_ERROR")

  const supabase = await createClient()
  const { data, error } = await supabase
    .from("attendance_records")
    .select("student_id, status, check_in_time, remark")
    .eq("school_id", context.schoolId)
    .eq("classroom_id", classroomId)
    .eq("date", date)

  if (error) throw new Error(error.message)
  return data
}

export async function upsertAttendance(
  classroomId: string,
  date: string,
  records: AttendanceInput[],
): Promise<ActionResult<{ count: number }>> {
  try {
    const context = await getCurrentUserContext()

    if (!context.profileId) {
      return actionFail("UNAUTHORIZED", "กรุณาเข้าสู่ระบบก่อนบันทึกการมาเรียน")
    }
    if (!editableRoles.has(context.role)) {
      return actionFail("FORBIDDEN", "คุณไม่มีสิทธิ์บันทึกการมาเรียน")
    }
    if (!classroomId || !isoDatePattern.test(date)) {
      return actionFail("VALIDATION_ERROR", "ห้องเรียนหรือวันที่ไม่ถูกต้อง")
    }
    if (!records.length) {
      return actionFail("VALIDATION_ERROR", "ไม่มีข้อมูลการมาเรียนให้บันทึก")
    }
    if (records.some((record) => !record.student_id || !validStatuses.has(record.status))) {
      return actionFail("VALIDATION_ERROR", "ข้อมูลสถานะการมาเรียนไม่ถูกต้อง")
    }

    const uniqueStudentIds = [...new Set(records.map((record) => record.student_id))]
    if (uniqueStudentIds.length !== records.length) {
      return actionFail("VALIDATION_ERROR", "พบนักเรียนซ้ำในรายการ")
    }

    const supabase = await createClient()
    const { data: classroom } = await supabase
      .from("classrooms")
      .select("id, homeroom_teacher_id")
      .eq("id", classroomId)
      .eq("school_id", context.schoolId)
      .eq("is_active", true)
      .maybeSingle()

    if (!classroom) {
      return actionFail("NOT_FOUND", "ไม่พบห้องเรียนในโรงเรียนของคุณ")
    }
    if (
      context.role === "homeroom_teacher" &&
      classroom.homeroom_teacher_id !== context.profileId
    ) {
      return actionFail("FORBIDDEN", "คุณไม่มีสิทธิ์บันทึกห้องเรียนนี้")
    }

    const { data: enrollments, error: enrollmentError } = await supabase
      .from("classroom_students")
      .select("student_id")
      .eq("school_id", context.schoolId)
      .eq("classroom_id", classroomId)
      .eq("is_active", true)
      .in("student_id", uniqueStudentIds)

    if (enrollmentError) {
      console.error("Attendance enrollment validation failed", enrollmentError)
      return actionFail("INTERNAL_ERROR", "ไม่สามารถตรวจสอบรายชื่อนักเรียนได้")
    }
    if ((enrollments ?? []).length !== uniqueStudentIds.length) {
      return actionFail("FORBIDDEN", "มีนักเรียนที่ไม่ได้อยู่ในห้องเรียนนี้")
    }

    const payload = records.map((record) => ({
      school_id: context.schoolId,
      student_id: record.student_id,
      classroom_id: classroomId,
      date,
      status: record.status,
      check_in_time: record.check_in_time || null,
      remark: record.remark?.trim() || null,
      recorded_by: context.profileId!,
    }))

    const { error } = await supabase
      .from("attendance_records")
      .upsert(payload, { onConflict: "student_id,classroom_id,date" })

    if (error) {
      console.error("Attendance save failed", error)
      return actionFail("INTERNAL_ERROR", "ไม่สามารถบันทึกการมาเรียนได้ กรุณาลองใหม่")
    }

    revalidatePath("/attendance")
    return actionOk("บันทึกการมาเรียนเรียบร้อยแล้ว", {
      data: { count: payload.length },
      revalidated: ["/attendance"],
    })
  } catch (error) {
    console.error("Attendance action failed", error)
    return actionFail("INTERNAL_ERROR", "ไม่สามารถบันทึกการมาเรียนได้ กรุณาลองใหม่")
  }
}
