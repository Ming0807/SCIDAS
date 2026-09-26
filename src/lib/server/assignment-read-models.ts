import "server-only"

import { getCurrentUserContext } from "@/lib/server/current-user"
import { createClient } from "@/utils/supabase/server"
import type { SubmissionStatus } from "@/lib/assignment-constants"

export type { SubmissionStatus }
export { SUBMISSION_STATUSES, getSubmissionStatusLabel } from "@/lib/assignment-constants"

export type AssignmentItem = {
  id: string
  studentId: string
  studentName: string
  classroomName: string | null
  subjectName: string
  subjectCode: string
  title: string
  dueDate: string
  submittedDate: string | null
  status: SubmissionStatus
  score: number | null
  maxScore: number | null
}

export type AssignmentSummary = {
  total: number
  submitted: number
  late: number
  notSubmitted: number
  submissionRate: number
}

export type AssignmentSubjectOption = {
  id: string
  subjectName: string
  subjectCode: string
  classroomName: string
}

export type AssignmentDashboard = {
  summary: AssignmentSummary
  recent: AssignmentItem[]
  subjects: AssignmentSubjectOption[]
}

export async function getAssignmentDashboard(options?: {
  status?: SubmissionStatus
  classroomId?: string
}): Promise<AssignmentDashboard> {
  const context = await getCurrentUserContext()
  const supabase = await createClient()

  let query = supabase
    .from("assignment_submissions")
    .select(
      "id, student_id, assignment_title, due_date, submitted_date, status, score, max_score, classroom_subject_id, students!inner(id, first_name, last_name, prefix), classroom_subjects!inner(id, classrooms(name), subjects(name, subject_code))",
    )
    .eq("school_id", context.schoolId)
    .eq("students.school_id", context.schoolId)
    .order("due_date", { ascending: false })
    .limit(50)

  if (options?.status) {
    query = query.eq("status", options.status)
  }

  const { data, error } = await query
  if (error) throw new Error(error.message)

  type Row = {
    id: string
    student_id: string
    assignment_title: string
    due_date: string
    submitted_date: string | null
    status: SubmissionStatus
    score: number | string | null
    max_score: number | string | null
    students:
      | { first_name: string; last_name: string; prefix: string | null }
      | Array<{ first_name: string; last_name: string; prefix: string | null }>
      | null
    classroom_subjects: {
      id: string
      classrooms: { name: string } | Array<{ name: string }> | null
      subjects: { name: string; subject_code: string } | Array<{ name: string; subject_code: string }> | null
    } | null
  }

  const first = <T,>(v: T | T[] | null): T | null => (Array.isArray(v) ? (v[0] ?? null) : v)

  const recent: AssignmentItem[] = ((data ?? []) as Row[])
    .map((row) => {
      const student = first(row.students)
      const cs = row.classroom_subjects
      const classroom = first(cs?.classrooms ?? null)
      const subject = first(cs?.subjects ?? null)
      return {
        id: row.id,
        studentId: row.student_id,
        studentName: student ? `${student.prefix ?? ""}${student.first_name} ${student.last_name}` : "ไม่ระบุนักเรียน",
        classroomName: classroom?.name ?? null,
        subjectName: subject?.name ?? "-",
        subjectCode: subject?.subject_code ?? "-",
        title: row.assignment_title,
        dueDate: row.due_date,
        submittedDate: row.submitted_date,
        status: row.status,
        score: row.score != null ? Number(row.score) : null,
        maxScore: row.max_score != null ? Number(row.max_score) : null,
      }
    })
    .filter((item) =>
      options?.classroomId ? item.classroomName !== null : true,
    )

  const submitted = recent.filter((r) => r.status === "submitted" || r.status === "resubmitted").length
  const late = recent.filter((r) => r.status === "late_submitted").length
  const notSubmitted = recent.filter((r) => r.status === "not_submitted").length
  const total = recent.length

  // Subject options for the create form (teacher-scoped)
  let subjects: AssignmentSubjectOption[] = []
  {
    let subjectQuery = supabase
      .from("classroom_subjects")
      .select("id, classrooms(name), subjects(name, subject_code)")
      .eq("school_id", context.schoolId)
      .limit(100)

    if (context.role === "subject_teacher" && context.profileId) {
      subjectQuery = subjectQuery.eq("teacher_id", context.profileId)
    }

    const { data: subjectRows } = await subjectQuery
    type SubjectRow = {
      id: string
      classrooms: { name: string } | Array<{ name: string }> | null
      subjects: { name: string; subject_code: string } | Array<{ name: string; subject_code: string }> | null
    }
    subjects = ((subjectRows ?? []) as SubjectRow[]).map((row) => {
      const classroom = first(row.classrooms)
      const subject = first(row.subjects)
      return {
        id: row.id,
        subjectName: subject?.name ?? "-",
        subjectCode: subject?.subject_code ?? "-",
        classroomName: classroom?.name ?? "-",
      }
    })
  }

  return {
    summary: {
      total,
      submitted,
      late,
      notSubmitted,
      submissionRate: total > 0 ? Math.round(((submitted + late) / total) * 100) : 0,
    },
    recent,
    subjects,
  }
}
