import { createClient } from "@/utils/supabase/server"

import { getCurrentUserContext, getCurrentSemesterId } from "./current-user"

export type AcademicScoreItem = {
  id: string
  studentId: string
  studentName: string
  studentCode: string | null
  gradeLevel: string | null
  classroomName: string | null
  subjectName: string
  midtermScore: number | null
  finalScore: number | null
  classworkScore: number | null
  totalScore: number | null
  grade: string | null
  gradePoint: number | null
}

export type AcademicSummary = {
  totalStudents: number
  averageGpa: number | null
  studentsAbove3: number
  studentsBelow2: number
  topSubject: string | null
  topSubjectAvg: number | null
  weakestSubject: string | null
  weakestSubjectAvg: number | null
}

export type AcademicDashboard = {
  summary: AcademicSummary
  students: AcademicScoreItem[]
}

export async function getAcademicDashboard(): Promise<AcademicDashboard> {
  const context = await getCurrentUserContext()

  if (!context.profileId) {
    throw new Error("FORBIDDEN")
  }

  const client = await createClient()
  const semesterId = await getCurrentSemesterId(context.schoolId)

  if (!semesterId) {
    return { summary: emptySummary(), students: [] }
  }

  const { data, error } = await client
    .from("academic_scores")
    .select(
      `
      id,
      student_id,
      midterm_score,
      final_score,
      classwork_score,
      total_score,
      grade,
      grade_point,
      students!academic_scores_student_id_fkey (
        first_name,
        last_name,
        student_code
      ),
      classroom_subjects!academic_scores_classroom_subject_id_fkey (
        subjects (
          name
        ),
        classrooms (
          name
        )
      )
    `,
    )
    .eq("school_id", context.schoolId)
    .eq("semester_id", semesterId)
    .order("total_score", { ascending: false })
    .limit(200)

  if (error) {
    throw new Error(error.message)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rows = (data ?? []) as Record<string, any>[]

  // Get grade_level from v_current_student_directory
  const studentIds = [...new Set(rows.map((r) => r.student_id as string))]
  const gradeMap = new Map<string, string>()
  if (studentIds.length > 0) {
    const { data: dirRows } = await client
      .from("v_current_student_directory")
      .select("student_id, grade_level")
      .in("student_id", studentIds)
      .eq("school_id", context.schoolId)
    for (const d of dirRows ?? []) {
      const dir = d as { student_id: string; grade_level: string | null }
      if (dir.grade_level) gradeMap.set(dir.student_id, dir.grade_level)
    }
  }

  const students: AcademicScoreItem[] = rows.map((row) => {
    const student = row.students as Record<string, unknown> | null | undefined
    const cs = row.classroom_subjects as Record<string, unknown> | null | undefined
    const subjects = cs?.subjects as Record<string, unknown> | null | undefined
    const classrooms = cs?.classrooms as Record<string, unknown> | null | undefined
    const sid = row.student_id as string

    return {
      id: row.id as string,
      studentId: sid,
      studentName: student
        ? `${(student.first_name as string) ?? ""} ${(student.last_name as string) ?? ""}`.trim()
        : "ไม่ทราบชื่อ",
      studentCode: (student?.student_code as string) ?? null,
      gradeLevel: gradeMap.get(sid) ?? null,
      classroomName: (classrooms?.name as string) ?? null,
      subjectName: (subjects?.name as string) ?? "ไม่ระบุวิชา",
      midtermScore: (row.midterm_score as number) ?? null,
      finalScore: (row.final_score as number) ?? null,
      classworkScore: (row.classwork_score as number) ?? null,
      totalScore: (row.total_score as number) ?? null,
      grade: (row.grade as string) ?? null,
      gradePoint: (row.grade_point as number) ?? null,
    }
  })

  // Compute summary
  const uniqueStudentIds = new Set(students.map((s) => s.studentId))
  let totalGpa = 0
  let gpaCount = 0
  let above3 = 0
  let below2 = 0

  // Track per-student average grade point
  const studentGpas = new Map<string, { sum: number; count: number }>()
  for (const s of students) {
    if (s.gradePoint != null) {
      const entry = studentGpas.get(s.studentId) ?? { sum: 0, count: 0 }
      entry.sum += s.gradePoint
      entry.count++
      studentGpas.set(s.studentId, entry)
    }
  }

  for (const [, entry] of studentGpas) {
    const avg = entry.sum / entry.count
    totalGpa += avg
    gpaCount++
    if (avg >= 3.0) above3++
    if (avg < 2.0) below2++
  }

  // Per-subject averages
  const subjectAvgs = new Map<string, { sum: number; count: number }>()
  for (const s of students) {
    if (s.totalScore != null) {
      const entry = subjectAvgs.get(s.subjectName) ?? { sum: 0, count: 0 }
      entry.sum += s.totalScore
      entry.count++
      subjectAvgs.set(s.subjectName, entry)
    }
  }

  let topSubject: string | null = null
  let topSubjectAvg: number | null = null
  let weakestSubject: string | null = null
  let weakestSubjectAvg: number | null = null

  for (const [name, entry] of subjectAvgs) {
    const avg = Math.round((entry.sum / entry.count) * 10) / 10
    if (topSubjectAvg == null || avg > topSubjectAvg) {
      topSubject = name
      topSubjectAvg = avg
    }
    if (weakestSubjectAvg == null || avg < weakestSubjectAvg) {
      weakestSubject = name
      weakestSubjectAvg = avg
    }
  }

  return {
    summary: {
      totalStudents: uniqueStudentIds.size,
      averageGpa: gpaCount > 0 ? Math.round((totalGpa / gpaCount) * 100) / 100 : null,
      studentsAbove3: above3,
      studentsBelow2: below2,
      topSubject,
      topSubjectAvg,
      weakestSubject,
      weakestSubjectAvg,
    },
    students,
  }
}

function emptySummary(): AcademicSummary {
  return {
    totalStudents: 0,
    averageGpa: null,
    studentsAbove3: 0,
    studentsBelow2: 0,
    topSubject: null,
    topSubjectAvg: null,
    weakestSubject: null,
    weakestSubjectAvg: null,
  }
}
