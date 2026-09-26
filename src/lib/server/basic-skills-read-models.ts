import "server-only"

import { getCurrentUserContext } from "@/lib/server/current-user"
import { createClient } from "@/utils/supabase/server"
import {
  isSkillLevel,
  type SkillLevel,
} from "@/lib/basic-skills-constants"

export type { SkillLevel }
export { SKILL_LEVELS, getSkillLevelLabel } from "@/lib/basic-skills-constants"

export type BasicSkillRow = {
  id: string
  studentId: string
  semesterId: string
  readingLevel: SkillLevel
  readingScore: number | null
  writingLevel: SkillLevel
  writingScore: number | null
  mathLevel: SkillLevel
  mathScore: number | null
  assessedAt: string
  remark: string | null
}

export type BasicSkillStudent = {
  id: string
  name: string
}

export type BasicSkillsData = {
  students: BasicSkillStudent[]
  skills: BasicSkillRow[]
  semesterId: string
  semesters: Array<{ id: string; name: string; is_current: boolean }>
}

export async function getBasicSkillsData(
  semesterId?: string,
  classroomId?: string,
): Promise<BasicSkillsData> {
  const context = await getCurrentUserContext()
  if (!context.profileId) {
    return { students: [], skills: [], semesterId: "", semesters: [] }
  }
  const supabase = await createClient()

  const { data: semesterRows, error: semesterError } = await supabase
    .from("semesters")
    .select("id, semester, is_current, academic_years!inner(school_id, year)")
    .eq("school_id", context.schoolId)
    .eq("academic_years.school_id", context.schoolId)
    .order("start_date", { ascending: false })

  if (semesterError) throw new Error(semesterError.message)

  type SemesterRow = {
    id: string
    semester: string
    is_current: boolean
    academic_years: { year: number } | { year: number }[] | null
  }
  const semesters = ((semesterRows ?? []) as SemesterRow[]).map((row) => {
    const year = Array.isArray(row.academic_years) ? row.academic_years[0]?.year : row.academic_years?.year
    return {
      id: row.id,
      name: `ภาคเรียนที่ ${row.semester === "semester_1" ? "1" : "2"}/${year ?? "-"}`,
      is_current: row.is_current,
    }
  })

  const selectedSemesterId =
    semesterId && semesters.some((s) => s.id === semesterId)
      ? semesterId
      : (semesters.find((s) => s.is_current)?.id ?? semesters[0]?.id ?? "")

  if (!selectedSemesterId) {
    return { students: [], skills: [], semesterId: "", semesters }
  }

  // Resolve classroom scope: explicit classroomId wins, else homeroom / first active
  let targetClassroomId = classroomId ?? ""
  if (!targetClassroomId && context.role === "homeroom_teacher") {
    const { data: owned } = await supabase
      .from("classrooms")
      .select("id")
      .eq("school_id", context.schoolId)
      .eq("homeroom_teacher_id", context.profileId)
      .eq("is_active", true)
      .order("grade_level", { ascending: true })
      .order("section", { ascending: true })
      .limit(1)
      .maybeSingle()
    targetClassroomId = owned?.id ?? ""
  }
  if (!targetClassroomId) {
    const { data: firstRoom } = await supabase
      .from("classrooms")
      .select("id")
      .eq("school_id", context.schoolId)
      .eq("is_active", true)
      .order("grade_level", { ascending: true })
      .order("section", { ascending: true })
      .limit(1)
      .maybeSingle()
    targetClassroomId = firstRoom?.id ?? ""
  }

  let studentIds: string[] = []
  let students: BasicSkillStudent[] = []

  if (targetClassroomId) {
    const { data: enrollmentRows, error: enrollmentError } = await supabase
      .from("classroom_students")
      .select("student_id, students!inner(id, first_name, last_name, prefix, school_id)")
      .eq("school_id", context.schoolId)
      .eq("students.school_id", context.schoolId)
      .eq("classroom_id", targetClassroomId)
      .eq("semester_id", selectedSemesterId)
      .eq("is_active", true)

    if (enrollmentError) throw new Error(enrollmentError.message)

    type EnrollRow = {
      student_id: string
      students: { id: string; first_name: string; last_name: string; prefix: string | null } | Array<{ id: string; first_name: string; last_name: string; prefix: string | null }> | null
    }
    students = ((enrollmentRows ?? []) as EnrollRow[])
      .map((row) => {
        const s = Array.isArray(row.students) ? row.students[0] : row.students
        if (!s) return null
        return {
          id: s.id,
          name: `${s.prefix ?? ""}${s.first_name} ${s.last_name}`,
        }
      })
      .filter((s): s is BasicSkillStudent => Boolean(s))
      .sort((a, b) => a.name.localeCompare(b.name, "th"))
    studentIds = students.map((s) => s.id)
  } else {
    const { data: allStudents, error: studentsError } = await supabase
      .from("students")
      .select("id, first_name, last_name, prefix")
      .eq("school_id", context.schoolId)
      .eq("status", "active")
      .order("first_name", { ascending: true })
      .limit(200)

    if (studentsError) throw new Error(studentsError.message)
    students = (allStudents ?? []).map((s) => ({
      id: s.id,
      name: `${s.prefix ?? ""}${s.first_name} ${s.last_name}`,
    }))
    studentIds = students.map((s) => s.id)
  }

  let skills: BasicSkillRow[] = []
  if (studentIds.length > 0) {
    const { data, error } = await supabase
      .from("basic_skills")
      .select("id, student_id, semester_id, reading_level, reading_score, writing_level, writing_score, math_level, math_score, assessed_at, remark")
      .eq("school_id", context.schoolId)
      .eq("semester_id", selectedSemesterId)
      .in("student_id", studentIds)

    if (error) throw new Error(error.message)
    skills = (data ?? [])
      .filter(
        (row) =>
          isSkillLevel(row.reading_level) &&
          isSkillLevel(row.writing_level) &&
          isSkillLevel(row.math_level),
      )
      .map((row) => ({
        id: row.id,
        studentId: row.student_id,
        semesterId: row.semester_id,
        readingLevel: row.reading_level as SkillLevel,
        readingScore: row.reading_score != null ? Number(row.reading_score) : null,
        writingLevel: row.writing_level as SkillLevel,
        writingScore: row.writing_score != null ? Number(row.writing_score) : null,
        mathLevel: row.math_level as SkillLevel,
        mathScore: row.math_score != null ? Number(row.math_score) : null,
        assessedAt: row.assessed_at,
        remark: row.remark,
      }))
  }

  return { students, skills, semesterId: selectedSemesterId, semesters }
}
