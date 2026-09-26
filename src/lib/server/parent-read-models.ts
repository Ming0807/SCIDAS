import "server-only"

import { createClient } from "@/utils/supabase/server"
import { getCurrentUserContext } from "./current-user"
import { getStudentCareProfile, type StudentCareProfile } from "./student-care-read-models"

export type ParentChild = {
  studentId: string
  studentCode: string
  fullName: string
  photoUrl: string | null
  classroomName: string | null
  relation: string
}

export type ParentAttendanceRow = {
  date: string
  status: string
}

export type ParentScoreRow = {
  subjectName: string
  totalScore: number | null
  grade: string | null
}

export type ParentBehaviorRow = {
  id: string
  date: string
  behaviorType: string
  description: string
}

export type ParentSupportRow = {
  id: string
  title: string
  status: string
  startedAt: string | null
}

export type ParentPlanRow = {
  id: string
  title: string
  status: string
}

export type ParentChildDetail = {
  profile: StudentCareProfile
  attendance: ParentAttendanceRow[]
  scores: ParentScoreRow[]
  behaviors: ParentBehaviorRow[]
  supportCases: ParentSupportRow[]
  plans: ParentPlanRow[]
}

async function getLinkedStudentIds(
  client: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  schoolId: string,
): Promise<string[]> {
  const { data: guardians } = await client
    .from("guardians")
    .select("id")
    .eq("school_id", schoolId)
    .eq("user_id", userId)

  if (!guardians || guardians.length === 0) return []

  const { data: links } = await client
    .from("student_guardians")
    .select("student_id")
    .eq("school_id", schoolId)
    .in(
      "guardian_id",
      guardians.map((g) => g.id),
    )

  return [...new Set((links ?? []).map((l) => l.student_id))]
}

export async function getParentChildren(): Promise<ParentChild[]> {
  try {
    const context = await getCurrentUserContext()
    if (!context.profileId) return []
    const client = await createClient()

    const studentIds = await getLinkedStudentIds(client, context.userId, context.schoolId)
    if (studentIds.length === 0) return []

    const { data: links } = await client
      .from("student_guardians")
      .select("student_id, relation, students!inner(id, student_code, prefix, first_name, last_name, photo_url), guardians!inner(school_id)")
      .eq("school_id", context.schoolId)
      .in("student_id", studentIds)

    type LinkRow = {
      student_id: string
      relation: string
      students: { id: string; student_code: string; prefix: string | null; first_name: string; last_name: string; photo_url: string | null } | null
    }

    const seen = new Map<string, ParentChild>()
    for (const row of ((links ?? []) as LinkRow[])) {
      if (seen.has(row.student_id) || !row.students) continue
      const s = row.students
      seen.set(row.student_id, {
        studentId: s.id,
        studentCode: s.student_code,
        fullName: `${s.prefix ?? ""}${s.first_name} ${s.last_name}`.trim(),
        photoUrl: s.photo_url,
        classroomName: null,
        relation: row.relation,
      })
    }

    // Enrich classroom names via care profiles (RLS-enforced).
    const children = [...seen.values()]
    await Promise.all(
      children.map(async (child) => {
        try {
          const profile = await getStudentCareProfile(child.studentId)
          if (profile) {
            child.classroomName = profile.classroomName
            if (profile.photoUrl) child.photoUrl = profile.photoUrl
          }
        } catch {
          // Keep the basic row when enrichment fails.
        }
      }),
    )

    return children
  } catch {
    return []
  }
}

export async function getParentChildDetail(studentId: string): Promise<ParentChildDetail | null> {
  try {
    const context = await getCurrentUserContext()
    if (!context.profileId) return null
    const client = await createClient()

    const studentIds = await getLinkedStudentIds(client, context.userId, context.schoolId)
    if (!studentIds.includes(studentId)) return null

    const profile = await getStudentCareProfile(studentId)
    if (!profile) return null

    const [
      attendanceRes,
      scoresRes,
      behaviorRes,
      supportRes,
      plansRes,
    ] = await Promise.all([
      client
        .from("attendance_records")
        .select("date, status")
        .eq("school_id", context.schoolId)
        .eq("student_id", studentId)
        .order("date", { ascending: false })
        .limit(30),
      client
        .from("academic_scores")
        .select("total_score, grade, classroom_subjects!inner(subjects(name))")
        .eq("school_id", context.schoolId)
        .eq("student_id", studentId)
        .order("total_score", { ascending: true })
        .limit(8),
      client
        .from("behavior_records")
        .select("id, date, behavior_type, description")
        .eq("school_id", context.schoolId)
        .eq("student_id", studentId)
        .order("date", { ascending: false })
        .limit(5),
      client
        .from("support_records")
        .select("id, title, status, started_at")
        .eq("school_id", context.schoolId)
        .eq("student_id", studentId)
        .order("started_at", { ascending: false })
        .limit(10),
      client
        .from("development_plans")
        .select("id, title, status")
        .eq("school_id", context.schoolId)
        .eq("student_id", studentId)
        .order("created_at", { ascending: false })
        .limit(10),
    ])

    type ScoreRow = {
      total_score: number | string | null
      grade: string | null
      classroom_subjects: { subjects: { name: string } | null } | null
    }

    return {
      profile,
      attendance: (attendanceRes.data ?? []).map((r) => ({
        date: r.date,
        status: r.status,
      })),
      scores: ((scoresRes.data ?? []) as ScoreRow[]).map((r) => ({
        subjectName: r.classroom_subjects?.subjects?.name ?? "ไม่ระบุวิชา",
        totalScore: r.total_score != null ? Number(r.total_score) : null,
        grade: r.grade,
      })),
      behaviors: (behaviorRes.data ?? []).map((r) => ({
        id: r.id,
        date: r.date,
        behaviorType: r.behavior_type,
        description: r.description,
      })),
      supportCases: (supportRes.data ?? []).map((r) => ({
        id: r.id,
        title: r.title,
        status: r.status,
        startedAt: r.started_at,
      })),
      plans: (plansRes.data ?? []).map((r) => ({
        id: r.id,
        title: r.title,
        status: r.status,
      })),
    }
  } catch {
    return null
  }
}
