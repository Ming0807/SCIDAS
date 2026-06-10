import { createClient } from "@/utils/supabase/server"

import { getCurrentUserContext } from "./current-user"

type HousingCondition = "good" | "moderate" | "poor" | "critical"

type HomeVisitImageRow = {
  id: string
  image_url: string
  caption: string | null
  display_order: number | null
}

type HomeVisitQueryRow = {
  id: string
  student_id: string
  visit_date: string
  visit_time: string | null
  address_visited: string | null
  housing_condition: HousingCondition | null
  follow_up_needed: boolean | null
  has_family_problem: boolean | null
  travel_difficulty: boolean | null
  overall_assessment: string | null
  family_problem_detail: string | null
  follow_up_detail: string | null
  created_at: string
  students: {
    id: string
    first_name: string
    last_name: string
    student_code: string
    photo_url: string | null
    prefix: string | null
  } | null
  profiles: {
    id: string
    first_name: string
    last_name: string
  } | null
  home_visit_images: HomeVisitImageRow[] | null
}

export type HomeVisitStatus = "completed" | "follow_up" | "urgent"

export type HomeVisitRecord = {
  id: string
  studentId: string
  studentName: string
  studentCode: string
  studentPhotoUrl: string | null
  visitorName: string
  visitDate: string
  visitTime: string | null
  address: string | null
  housingCondition: HousingCondition | null
  followUpNeeded: boolean
  hasFamilyProblem: boolean
  travelDifficulty: boolean
  overallAssessment: string | null
  familyProblemDetail: string | null
  followUpDetail: string | null
  imageUrl: string | null
  status: HomeVisitStatus
  createdAt: string
}

export type HomeVisitSummary = {
  total: number
  followUpNeeded: number
  urgent: number
  familyProblems: number
  travelDifficulty: number
  latestVisitDate: string | null
}

export type HomeVisitDashboard = {
  records: HomeVisitRecord[]
  summary: HomeVisitSummary
}

function getVisitStatus(row: HomeVisitQueryRow): HomeVisitStatus {
  if (
    row.housing_condition === "critical" ||
    row.has_family_problem ||
    row.travel_difficulty
  ) {
    return "urgent"
  }

  if (row.follow_up_needed) {
    return "follow_up"
  }

  return "completed"
}

function mapHomeVisitRow(row: HomeVisitQueryRow): HomeVisitRecord {
  const studentName = row.students
    ? `${row.students.prefix ? `${row.students.prefix}` : ""}${row.students.first_name} ${row.students.last_name}`.trim()
    : "ไม่ระบุนักเรียน"
  const visitorName = row.profiles
    ? `${row.profiles.first_name} ${row.profiles.last_name}`.trim()
    : "ไม่ระบุผู้เยี่ยม"
  const image = row.home_visit_images
    ?.slice()
    .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0))[0]

  return {
    id: row.id,
    studentId: row.student_id,
    studentName,
    studentCode: row.students?.student_code ?? "-",
    studentPhotoUrl: row.students?.photo_url ?? null,
    visitorName,
    visitDate: row.visit_date,
    visitTime: row.visit_time,
    address: row.address_visited,
    housingCondition: row.housing_condition,
    followUpNeeded: Boolean(row.follow_up_needed),
    hasFamilyProblem: Boolean(row.has_family_problem),
    travelDifficulty: Boolean(row.travel_difficulty),
    overallAssessment: row.overall_assessment,
    familyProblemDetail: row.family_problem_detail,
    followUpDetail: row.follow_up_detail,
    imageUrl: image?.image_url ?? null,
    status: getVisitStatus(row),
    createdAt: row.created_at,
  }
}

function summarizeHomeVisits(records: HomeVisitRecord[]): HomeVisitSummary {
  return {
    total: records.length,
    followUpNeeded: records.filter((record) => record.followUpNeeded).length,
    urgent: records.filter((record) => record.status === "urgent").length,
    familyProblems: records.filter((record) => record.hasFamilyProblem).length,
    travelDifficulty: records.filter((record) => record.travelDifficulty).length,
    latestVisitDate: records[0]?.visitDate ?? null,
  }
}

export async function getHomeVisitDashboard(limit = 120): Promise<HomeVisitDashboard> {
  const context = await getCurrentUserContext()
  const supabase = await createClient()

  let query = supabase
    .from("home_visits")
    .select(
      `
      id,
      student_id,
      visit_date,
      visit_time,
      address_visited,
      housing_condition,
      follow_up_needed,
      has_family_problem,
      travel_difficulty,
      overall_assessment,
      family_problem_detail,
      follow_up_detail,
      created_at,
      students!home_visits_student_id_fkey(id, first_name, last_name, student_code, photo_url, prefix),
      profiles!home_visits_visitor_id_fkey(id, first_name, last_name),
      home_visit_images(id, image_url, caption, display_order)
    `,
    )
    .eq("school_id", context.schoolId)
    .order("visit_date", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit)

  if (context.role === "student" && context.studentId) {
    query = query.eq("student_id", context.studentId)
  }

  const { data, error } = await query

  if (error) {
    throw new Error(error.message)
  }

  const records = ((data ?? []) as unknown as HomeVisitQueryRow[]).map(mapHomeVisitRow)

  return {
    records,
    summary: summarizeHomeVisits(records),
  }
}
