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
  riskLevel?: string
  riskScore?: number
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
  consentStatus?: "acknowledged" | "pending_ack" | "none"
  acknowledgedAt?: string | null
}

export type ParentPlanRow = {
  id: string
  title: string
  status: string
  consentStatus?: "acknowledged" | "pending_ack" | "none"
  acknowledgedAt?: string | null
}

export type ParentTeacherContact = {
  homeroomTeacher: {
    name: string
    phone: string | null
    email: string | null
    position: string | null
  } | null
  coTeacher: {
    name: string
    phone: string | null
    email: string | null
    position: string | null
  } | null
  schoolContact: {
    name: string
    phone: string | null
    email: string | null
    address: string | null
  } | null
}

export type ParentChildDetail = {
  profile: StudentCareProfile
  attendance: ParentAttendanceRow[]
  scores: ParentScoreRow[]
  behaviors: ParentBehaviorRow[]
  supportCases: ParentSupportRow[]
  plans: ParentPlanRow[]
  teacherContact: ParentTeacherContact | null
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

    // Enrich classroom names and risk levels via care profiles (RLS-enforced).
    const children = [...seen.values()]
    await Promise.all(
      children.map(async (child) => {
        try {
          const profile = await getStudentCareProfile(child.studentId)
          if (profile) {
            child.classroomName = profile.classroomName
            if (profile.photoUrl) child.photoUrl = profile.photoUrl
            child.riskLevel = profile.riskLevel
            child.riskScore = profile.riskScore
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
      consentRes,
      enrollmentRes,
      schoolRes,
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
      client
        .from("action_items")
        .select("source_table, source_id, completed_at, status")
        .eq("school_id", context.schoolId)
        .eq("student_id", studentId)
        .eq("category", "parent_consent"),
      client
        .from("classroom_students")
        .select(`
          classroom_id,
          classrooms (
            id,
            name,
            homeroom_teacher:profiles!classrooms_homeroom_teacher_id_fkey(prefix, first_name, last_name, phone, email, position),
            co_teacher:profiles!classrooms_co_teacher_id_fkey(prefix, first_name, last_name, phone, email, position)
          )
        `)
        .eq("school_id", context.schoolId)
        .eq("student_id", studentId)
        .eq("is_active", true)
        .maybeSingle(),
      client
        .from("schools")
        .select("name, phone, email, address")
        .eq("id", context.schoolId)
        .maybeSingle(),
    ])

    type ScoreRow = {
      total_score: number | string | null
      grade: string | null
      classroom_subjects: { subjects: { name: string } | null } | null
    }

    const consentMap = new Map<string, string>()
    for (const item of (consentRes.data ?? [])) {
      if (item.source_id && item.status === "completed") {
        consentMap.set(item.source_id, item.completed_at ?? new Date().toISOString())
      }
    }

    type ProfileMini = {
      prefix: string | null
      first_name: string
      last_name: string
      phone: string | null
      email: string | null
      position: string | null
    }

    type JoinedClassroom = {
      id: string
      name: string
      homeroom_teacher: ProfileMini | null
      co_teacher: ProfileMini | null
    } | null

    const classroom = (enrollmentRes.data?.classrooms as unknown as JoinedClassroom) || null
    const school = schoolRes.data

    let teacherContact: ParentTeacherContact | null = null
    if (classroom?.homeroom_teacher || classroom?.co_teacher || school) {
      teacherContact = {
        homeroomTeacher: classroom?.homeroom_teacher
          ? {
              name: `${classroom.homeroom_teacher.prefix ?? ""}${classroom.homeroom_teacher.first_name} ${classroom.homeroom_teacher.last_name}`.trim(),
              phone: classroom.homeroom_teacher.phone,
              email: classroom.homeroom_teacher.email,
              position: classroom.homeroom_teacher.position ?? "ครูประจำชั้น",
            }
          : null,
        coTeacher: classroom?.co_teacher
          ? {
              name: `${classroom.co_teacher.prefix ?? ""}${classroom.co_teacher.first_name} ${classroom.co_teacher.last_name}`.trim(),
              phone: classroom.co_teacher.phone,
              email: classroom.co_teacher.email,
              position: classroom.co_teacher.position ?? "ครูผู้ช่วย/ครูประจำชั้นร่วม",
            }
          : null,
        schoolContact: school
          ? {
              name: school.name,
              phone: school.phone,
              email: school.email,
              address: school.address,
            }
          : null,
      }
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
      supportCases: (supportRes.data ?? []).map((r) => {
        const isAcked = consentMap.has(r.id)
        return {
          id: r.id,
          title: r.title,
          status: r.status,
          startedAt: r.started_at,
          consentStatus: isAcked
            ? ("acknowledged" as const)
            : r.status === "pending" || r.status === "in_progress"
              ? ("pending_ack" as const)
              : ("none" as const),
          acknowledgedAt: isAcked ? consentMap.get(r.id) ?? null : null,
        }
      }),
      plans: (plansRes.data ?? []).map((r) => {
        const isAcked = consentMap.has(r.id)
        return {
          id: r.id,
          title: r.title,
          status: r.status,
          consentStatus: isAcked
            ? ("acknowledged" as const)
            : r.status === "draft" || r.status === "active"
              ? ("pending_ack" as const)
              : ("none" as const),
          acknowledgedAt: isAcked ? consentMap.get(r.id) ?? null : null,
        }
      }),
      teacherContact,
    }
  } catch {
    return null
  }
}
