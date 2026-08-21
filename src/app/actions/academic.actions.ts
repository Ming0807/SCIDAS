"use server"

import { revalidatePath } from "next/cache"

import type { Database } from "@/types/database.types"
import type { ActionResult } from "@/lib/server/action-result"
import { actionFail, actionOk } from "@/lib/server/action-result"
import { getCurrentUserContext } from "@/lib/server/current-user"
import { createClient } from "@/utils/supabase/server"

type AcademicYearSummary = { year: number }
type SemesterWithYear = {
  id: string
  semester: string
  is_current: boolean
  academic_years: AcademicYearSummary | AcademicYearSummary[] | null
}
type StudentSummary = { id: string; first_name: string; last_name: string; prefix: string | null }
type ClassroomStudentJoin = { students: StudentSummary | StudentSummary[] | null }
type SubjectSummary = { id: string; name: string; subject_code: string }
type ClassroomSubjectJoin = { id: string; subjects: SubjectSummary | SubjectSummary[] | null }

export type AcademicScoreInput = {
  student_id: string
  classroom_subject_id: string
  classwork_score: number
  midterm_score: number
  final_score: number
  remark?: string | null
}

type AcademicScoreInsert = Database["public"]["Tables"]["academic_scores"]["Insert"]

const editableRoles = new Set(["admin", "homeroom_teacher", "subject_teacher"])
const firstOrSelf = <T,>(value: T | T[] | null) =>
  Array.isArray(value) ? value[0] : value

function gradeFromScore(score: number): { grade: string; gradePoint: number } {
  if (score >= 80) return { grade: "4", gradePoint: 4 }
  if (score >= 75) return { grade: "3.5", gradePoint: 3.5 }
  if (score >= 70) return { grade: "3", gradePoint: 3 }
  if (score >= 65) return { grade: "2.5", gradePoint: 2.5 }
  if (score >= 60) return { grade: "2", gradePoint: 2 }
  if (score >= 55) return { grade: "1.5", gradePoint: 1.5 }
  if (score >= 50) return { grade: "1", gradePoint: 1 }
  return { grade: "0", gradePoint: 0 }
}

export async function getClassroomAcademicData(semesterId?: string) {
  const context = await getCurrentUserContext()
  if (!context.profileId) return { classroom: null, students: [], subjects: [], scores: [], semesters: [] }
  const supabase = await createClient()

  const { data: semesterRows, error: semesterError } = await supabase
    .from("semesters")
    .select("id, semester, is_current, academic_years!inner(school_id, year)")
    .eq("school_id", context.schoolId)
    .eq("academic_years.school_id", context.schoolId)
    .order("start_date", { ascending: false })

  if (semesterError) throw new Error(semesterError.message)

  const semesters = ((semesterRows ?? []) as SemesterWithYear[]).map((row) => {
    const academicYear = firstOrSelf(row.academic_years)
    return {
      id: row.id,
      name: `ภาคเรียนที่ ${row.semester === "semester_1" ? "1" : "2"}/${academicYear?.year ?? "-"}`,
      is_current: row.is_current,
    }
  })

  const selectedSemesterId =
    semesterId && semesters.some((semester) => semester.id === semesterId)
      ? semesterId
      : semesters.find((semester) => semester.is_current)?.id ?? semesters[0]?.id

  if (!selectedSemesterId) {
    return { classroom: null, students: [], subjects: [], scores: [], semesters, currentSemesterId: "" }
  }

  let classroomQuery = supabase
    .from("classrooms")
    .select("id, name")
    .eq("school_id", context.schoolId)
    .eq("is_active", true)

  if (context.role === "homeroom_teacher") {
    classroomQuery = classroomQuery.eq("homeroom_teacher_id", context.profileId)
  } else if (context.role === "subject_teacher") {
    const { data: assignment, error: assignmentError } = await supabase
      .from("classroom_subjects")
      .select("classroom_id")
      .eq("school_id", context.schoolId)
      .eq("semester_id", selectedSemesterId)
      .eq("teacher_id", context.profileId)
      .limit(1)
      .maybeSingle()
    if (assignmentError) throw new Error(assignmentError.message)
    if (!assignment) {
      return { classroom: null, students: [], subjects: [], scores: [], semesters, currentSemesterId: selectedSemesterId }
    }
    classroomQuery = classroomQuery.eq("id", assignment.classroom_id)
  } else if (context.role !== "admin" && context.role !== "director") {
    return { classroom: null, students: [], subjects: [], scores: [], semesters, currentSemesterId: selectedSemesterId }
  }

  const { data: classroom, error: classroomError } = await classroomQuery
    .order("grade_level")
    .order("room_number")
    .limit(1)
    .maybeSingle()

  if (classroomError) throw new Error(classroomError.message)
  if (!classroom) return { classroom: null, students: [], subjects: [], scores: [], semesters, currentSemesterId: selectedSemesterId }

  let subjectQuery = supabase
    .from("classroom_subjects")
    .select("id, subjects!inner(id, name, subject_code, school_id)")
    .eq("school_id", context.schoolId)
    .eq("subjects.school_id", context.schoolId)
    .eq("classroom_id", classroom.id)
    .eq("semester_id", selectedSemesterId)

  if (context.role === "subject_teacher") {
    subjectQuery = subjectQuery.eq("teacher_id", context.profileId)
  }

  const [{ data: enrollmentRows, error: enrollmentError }, { data: subjectRows, error: subjectError }] =
    await Promise.all([
      supabase
        .from("classroom_students")
        .select("student_id, students!inner(id, first_name, last_name, prefix, school_id)")
        .eq("school_id", context.schoolId)
        .eq("students.school_id", context.schoolId)
        .eq("classroom_id", classroom.id)
        .eq("semester_id", selectedSemesterId)
        .eq("is_active", true),
      subjectQuery,
    ])

  if (enrollmentError) throw new Error(enrollmentError.message)
  if (subjectError) throw new Error(subjectError.message)

  const students = (enrollmentRows ?? [])
    .map((item) => firstOrSelf((item as ClassroomStudentJoin).students))
    .filter((student): student is StudentSummary => Boolean(student))
    .map((student) => ({
      id: student.id,
      name: `${student.prefix ?? ""}${student.first_name} ${student.last_name}`,
    }))
    .sort((a, b) => a.name.localeCompare(b.name, "th"))

  const subjects = ((subjectRows ?? []) as ClassroomSubjectJoin[])
    .map((item) => {
      const subject = firstOrSelf(item.subjects)
      return subject
        ? { id: item.id, subject_id: subject.id, name: subject.name, code: subject.subject_code }
        : null
    })
    .filter((subject): subject is { id: string; subject_id: string; name: string; code: string } => Boolean(subject))

  let scores: Database["public"]["Tables"]["academic_scores"]["Row"][] = []
  if (students.length && subjects.length) {
    const { data, error } = await supabase
      .from("academic_scores")
      .select("*")
      .eq("school_id", context.schoolId)
      .eq("semester_id", selectedSemesterId)
      .in("student_id", students.map((student) => student.id))
      .in("classroom_subject_id", subjects.map((subject) => subject.id))
    if (error) throw new Error(error.message)
    scores = data ?? []
  }

  return { classroom, students, subjects, scores, semesters, currentSemesterId: selectedSemesterId }
}

export async function upsertAcademicScores(
  semesterId: string,
  records: AcademicScoreInput[],
): Promise<ActionResult<{ count: number }>> {
  try {
    const context = await getCurrentUserContext()
    if (!context.profileId) return actionFail("UNAUTHORIZED", "กรุณาเข้าสู่ระบบก่อนบันทึกคะแนน")
    if (!editableRoles.has(context.role)) return actionFail("FORBIDDEN", "คุณไม่มีสิทธิ์บันทึกคะแนน")
    if (!semesterId || !records.length) return actionFail("VALIDATION_ERROR", "ไม่มีข้อมูลคะแนนให้บันทึก")

    const invalidScore = records.some((record) => {
      const values = [record.classwork_score, record.midterm_score, record.final_score]
      const total = values.reduce((sum, value) => sum + value, 0)
      return (
        !record.student_id ||
        !record.classroom_subject_id ||
        values.some((value) => !Number.isFinite(value) || value < 0 || value > 100) ||
        total > 100
      )
    })
    if (invalidScore) {
      return actionFail("VALIDATION_ERROR", "คะแนนต้องเป็นตัวเลขตั้งแต่ 0 ถึง 100 และคะแนนรวมต้องไม่เกิน 100")
    }

    const studentIds = [...new Set(records.map((record) => record.student_id))]
    const classroomSubjectIds = [...new Set(records.map((record) => record.classroom_subject_id))]
    const supabase = await createClient()

    const [{ data: semester }, { data: students }, { data: classroomSubjects }] = await Promise.all([
      supabase.from("semesters").select("id").eq("id", semesterId).eq("school_id", context.schoolId).maybeSingle(),
      supabase.from("students").select("id").eq("school_id", context.schoolId).in("id", studentIds),
      supabase
        .from("classroom_subjects")
        .select("id, classroom_id, semester_id, teacher_id")
        .eq("school_id", context.schoolId)
        .eq("semester_id", semesterId)
        .in("id", classroomSubjectIds),
    ])

    if (!semester) return actionFail("NOT_FOUND", "ไม่พบภาคการศึกษาในโรงเรียนของคุณ")
    if ((students ?? []).length !== studentIds.length) return actionFail("FORBIDDEN", "มีนักเรียนที่ไม่อยู่ในโรงเรียนของคุณ")
    if ((classroomSubjects ?? []).length !== classroomSubjectIds.length) {
      return actionFail("FORBIDDEN", "มีรายวิชาที่ไม่อยู่ในภาคการศึกษานี้")
    }
    if (
      context.role === "subject_teacher" &&
      (classroomSubjects ?? []).some((item) => item.teacher_id !== context.profileId)
    ) {
      return actionFail("FORBIDDEN", "คุณบันทึกคะแนนได้เฉพาะรายวิชาที่รับผิดชอบ")
    }

    const classroomIds = [...new Set((classroomSubjects ?? []).map((item) => item.classroom_id))]
    if (context.role === "homeroom_teacher") {
      const { data: ownedClassrooms, error: ownedClassroomError } = await supabase
        .from("classrooms")
        .select("id")
        .eq("school_id", context.schoolId)
        .eq("homeroom_teacher_id", context.profileId)
        .in("id", classroomIds)
      if (ownedClassroomError) return actionFail("INTERNAL_ERROR", "ไม่สามารถตรวจสอบสิทธิ์ห้องเรียนได้")
      if ((ownedClassrooms ?? []).length !== classroomIds.length) {
        return actionFail("FORBIDDEN", "คุณบันทึกคะแนนได้เฉพาะห้องที่รับผิดชอบ")
      }
    }
    const { data: enrollments, error: enrollmentError } = await supabase
      .from("classroom_students")
      .select("student_id, classroom_id")
      .eq("school_id", context.schoolId)
      .eq("semester_id", semesterId)
      .eq("is_active", true)
      .in("student_id", studentIds)
      .in("classroom_id", classroomIds)

    if (enrollmentError) {
      console.error("Academic enrollment validation failed", enrollmentError)
      return actionFail("INTERNAL_ERROR", "ไม่สามารถตรวจสอบรายชื่อนักเรียนได้")
    }

    const enrollmentKeys = new Set((enrollments ?? []).map((item) => `${item.student_id}:${item.classroom_id}`))
    const subjectClassroom = new Map((classroomSubjects ?? []).map((item) => [item.id, item.classroom_id]))
    if (records.some((record) => !enrollmentKeys.has(`${record.student_id}:${subjectClassroom.get(record.classroom_subject_id)}`))) {
      return actionFail("FORBIDDEN", "นักเรียนและรายวิชาไม่ได้อยู่ในห้องเรียนเดียวกัน")
    }

    const payload: AcademicScoreInsert[] = records.map((record) => {
      const total = record.classwork_score + record.midterm_score + record.final_score
      const grade = gradeFromScore(total)
      return {
        school_id: context.schoolId,
        student_id: record.student_id,
        classroom_subject_id: record.classroom_subject_id,
        semester_id: semesterId,
        classwork_score: record.classwork_score,
        midterm_score: record.midterm_score,
        final_score: record.final_score,
        grade: grade.grade,
        grade_point: grade.gradePoint,
        remark: record.remark?.trim() || null,
      }
    })

    const { error } = await supabase
      .from("academic_scores")
      .upsert(payload, { onConflict: "student_id,classroom_subject_id,semester_id" })

    if (error) {
      console.error("Academic score save failed", error)
      return actionFail("INTERNAL_ERROR", "ไม่สามารถบันทึกคะแนนได้ กรุณาลองใหม่")
    }

    revalidatePath("/academics")
    return actionOk("บันทึกผลการเรียนเรียบร้อยแล้ว", {
      data: { count: payload.length },
      revalidated: ["/academics"],
    })
  } catch (error) {
    console.error("Academic score action failed", error)
    return actionFail("INTERNAL_ERROR", "ไม่สามารถบันทึกคะแนนได้ กรุณาลองใหม่")
  }
}
