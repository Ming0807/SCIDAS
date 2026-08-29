import "server-only"

import { createClient } from "@/utils/supabase/server"
import { getCurrentUserContext } from "@/lib/server/current-user"
import type { Database } from "@/types/database.types"

export type AcademicYearItem = {
  id: string
  schoolId: string
  year: number
  startDate: string
  endDate: string
  isCurrent: boolean
  semestersCount: number
  classroomsCount: number
}

export type SemesterItem = {
  id: string
  schoolId: string
  academicYearId: string
  academicYear: number
  semester: Database["public"]["Enums"]["semester_type"]
  startDate: string
  endDate: string
  isCurrent: boolean
}

export type ClassroomItem = {
  id: string
  schoolId: string
  academicYearId: string
  academicYear: number
  gradeLevel: Database["public"]["Enums"]["grade_level"]
  section: number
  name: string
  roomNumber: string | null
  maxStudents: number | null
  isActive: boolean
  homeroomTeacherId: string | null
  homeroomTeacherName: string | null
  coTeacherId: string | null
  coTeacherName: string | null
  studentCount: number
}

export type SubjectItem = {
  id: string
  schoolId: string
  subjectCode: string
  name: string
  nameEn: string | null
  learningArea: string | null
  gradeLevel: Database["public"]["Enums"]["grade_level"] | null
  credit: number | null
  hoursPerWeek: number | null
  description: string | null
  isActive: boolean
}

export type ClassroomSubjectItem = {
  id: string
  schoolId: string
  classroomId: string
  classroomName: string
  gradeLevel: Database["public"]["Enums"]["grade_level"]
  section: number
  subjectId: string
  subjectCode: string
  subjectName: string
  teacherId: string | null
  teacherName: string | null
  semesterId: string
  semester: Database["public"]["Enums"]["semester_type"]
  academicYear: number
  periodsPerWeek?: number | null
  midtermMaxScore: number | null
  finalMaxScore: number | null
  classworkMaxScore: number | null
}

export type TeacherOption = {
  id: string
  fullName: string
  role: string
  email: string | null
  department: string | null
}

export type AcademicAdminData = {
  academicYears: AcademicYearItem[]
  semesters: SemesterItem[]
  classrooms: ClassroomItem[]
  subjects: SubjectItem[]
  classroomSubjects: ClassroomSubjectItem[]
  teachers: TeacherOption[]
  currentAcademicYear: AcademicYearItem | null
  currentSemester: SemesterItem | null
}

export async function getAcademicAdminData(): Promise<AcademicAdminData> {
  const context = await getCurrentUserContext()
  const supabase = await createClient()

  // 1. Academic Years
  const { data: yearsData, error: yearsError } = await supabase
    .from("academic_years")
    .select("id, school_id, year, start_date, end_date, is_current")
    .eq("school_id", context.schoolId)
    .order("year", { ascending: false })

  if (yearsError) {
    throw new Error(`Failed to load academic years: ${yearsError.message}`)
  }

  // 2. Semesters with Year info
  const { data: semestersData, error: semestersError } = await supabase
    .from("semesters")
    .select("id, school_id, academic_year_id, semester, start_date, end_date, is_current, academic_years(year)")
    .eq("school_id", context.schoolId)
    .order("start_date", { ascending: false })

  if (semestersError) {
    throw new Error(`Failed to load semesters: ${semestersError.message}`)
  }

  // 3. Classrooms with homeroom teacher & co-teacher
  const { data: classroomsData, error: classroomsError } = await supabase
    .from("classrooms")
    .select(`
      id, school_id, academic_year_id, grade_level, section, name, room_number, max_students, is_active,
      homeroom_teacher_id, co_teacher_id,
      academic_years(year),
      homeroom_teacher:profiles!classrooms_homeroom_teacher_id_fkey(first_name, last_name, prefix),
      co_teacher:profiles!classrooms_co_teacher_id_fkey(first_name, last_name, prefix)
    `)
    .eq("school_id", context.schoolId)
    .order("grade_level", { ascending: true })
    .order("section", { ascending: true })

  if (classroomsError) {
    throw new Error(`Failed to load classrooms: ${classroomsError.message}`)
  }

  // 4. Student counts per classroom
  const { data: studentCountsData } = await supabase
    .from("classroom_students")
    .select("classroom_id")
    .eq("school_id", context.schoolId)
    .eq("is_active", true)

  const studentCountMap = new Map<string, number>()
  if (studentCountsData) {
    for (const row of studentCountsData) {
      studentCountMap.set(row.classroom_id, (studentCountMap.get(row.classroom_id) || 0) + 1)
    }
  }

  // 5. Subjects
  const { data: subjectsData, error: subjectsError } = await supabase
    .from("subjects")
    .select("id, school_id, subject_code, name, name_en, learning_area, grade_level, credit, hours_per_week, description, is_active")
    .eq("school_id", context.schoolId)
    .order("subject_code", { ascending: true })

  if (subjectsError) {
    throw new Error(`Failed to load subjects: ${subjectsError.message}`)
  }

  // 6. Classroom Subjects assignments
  const { data: assignmentsData, error: assignmentsError } = await supabase
    .from("classroom_subjects")
    .select(`
      id, school_id, classroom_id, subject_id, teacher_id, semester_id, midterm_max_score, final_max_score, classwork_max_score,
      classrooms(name, grade_level, section),
      subjects(subject_code, name),
      semesters(semester, academic_years(year)),
      teacher:profiles!classroom_subjects_teacher_id_fkey(first_name, last_name, prefix)
    `)
    .eq("school_id", context.schoolId)

  if (assignmentsError) {
    throw new Error(`Failed to load classroom subjects: ${assignmentsError.message}`)
  }

  // 7. Teachers for assignment
  const { data: teachersData, error: teachersError } = await supabase
    .from("profiles")
    .select("id, first_name, last_name, prefix, role, email, department")
    .eq("school_id", context.schoolId)
    .eq("is_active", true)
    .in("role", ["admin", "director", "homeroom_teacher", "subject_teacher", "counselor"])
    .order("first_name", { ascending: true })

  if (teachersError) {
    throw new Error(`Failed to load teachers: ${teachersError.message}`)
  }

  const formatName = (p: { first_name: string; last_name: string; prefix: string | null } | null) => {
    if (!p) return null
    return `${p.prefix ? p.prefix : ""}${p.first_name} ${p.last_name}`.trim()
  }

  const safeYears = yearsData ?? []
  const safeSemesters = semestersData ?? []
  const safeClassrooms = classroomsData ?? []
  const safeSubjects = subjectsData ?? []
  const safeAssignments = assignmentsData ?? []
  const safeTeachers = teachersData ?? []

  const academicYears: AcademicYearItem[] = safeYears.map((y) => {
    const semCount = safeSemesters.filter((s) => s.academic_year_id === y.id).length
    const classCount = safeClassrooms.filter((c) => c.academic_year_id === y.id).length
    return {
      id: y.id,
      schoolId: y.school_id,
      year: y.year,
      startDate: y.start_date,
      endDate: y.end_date,
      isCurrent: y.is_current,
      semestersCount: semCount,
      classroomsCount: classCount,
    }
  })

  const semesters: SemesterItem[] = safeSemesters.map((s) => {
    const yInfo = s.academic_years as unknown as { year: number } | null
    return {
      id: s.id,
      schoolId: s.school_id,
      academicYearId: s.academic_year_id,
      academicYear: yInfo?.year ?? 0,
      semester: s.semester,
      startDate: s.start_date,
      endDate: s.end_date,
      isCurrent: s.is_current,
    }
  })

  const classrooms: ClassroomItem[] = safeClassrooms.map((c) => {
    const yInfo = c.academic_years as unknown as { year: number } | null
    const hr = c.homeroom_teacher as unknown as { first_name: string; last_name: string; prefix: string | null } | null
    const co = c.co_teacher as unknown as { first_name: string; last_name: string; prefix: string | null } | null
    return {
      id: c.id,
      schoolId: c.school_id,
      academicYearId: c.academic_year_id,
      academicYear: yInfo?.year ?? 0,
      gradeLevel: c.grade_level,
      section: c.section,
      name: c.name,
      roomNumber: c.room_number,
      maxStudents: c.max_students,
      isActive: c.is_active,
      homeroomTeacherId: c.homeroom_teacher_id,
      homeroomTeacherName: formatName(hr),
      coTeacherId: c.co_teacher_id,
      coTeacherName: formatName(co),
      studentCount: studentCountMap.get(c.id) || 0,
    }
  })

  const subjects: SubjectItem[] = safeSubjects.map((sub) => ({
    id: sub.id,
    schoolId: sub.school_id,
    subjectCode: sub.subject_code,
    name: sub.name,
    nameEn: sub.name_en,
    learningArea: sub.learning_area,
    gradeLevel: sub.grade_level,
    credit: sub.credit,
    hoursPerWeek: sub.hours_per_week,
    description: sub.description,
    isActive: sub.is_active,
  }))

  const classroomSubjects: ClassroomSubjectItem[] = safeAssignments.map((a) => {
    const cl = a.classrooms as unknown as { name: string; grade_level: Database["public"]["Enums"]["grade_level"]; section: number } | null
    const su = a.subjects as unknown as { subject_code: string; name: string } | null
    const se = a.semesters as unknown as { semester: Database["public"]["Enums"]["semester_type"]; academic_years: { year: number } | null } | null
    const t = a.teacher as unknown as { first_name: string; last_name: string; prefix: string | null } | null

    return {
      id: a.id,
      schoolId: a.school_id,
      classroomId: a.classroom_id,
      classroomName: cl?.name ?? "-",
      gradeLevel: cl?.grade_level ?? "p1",
      section: cl?.section ?? 1,
      subjectId: a.subject_id,
      subjectCode: su?.subject_code ?? "-",
      subjectName: su?.name ?? "-",
      teacherId: a.teacher_id,
      teacherName: formatName(t),
      semesterId: a.semester_id,
      semester: se?.semester ?? "semester_1",
      academicYear: se?.academic_years?.year ?? 0,
      midtermMaxScore: a.midterm_max_score,
      finalMaxScore: a.final_max_score,
      classworkMaxScore: a.classwork_max_score,
    }
  })

  const teachers: TeacherOption[] = safeTeachers.map((t) => ({
    id: t.id,
    fullName: formatName(t) || "ไม่ระบุชื่อ",
    role: t.role,
    email: t.email,
    department: t.department,
  }))

  const currentAcademicYear = academicYears.find((y) => y.isCurrent) || null
  const currentSemester = semesters.find((s) => s.isCurrent) || null

  return {
    academicYears,
    semesters,
    classrooms,
    subjects,
    classroomSubjects,
    teachers,
    currentAcademicYear,
    currentSemester,
  }
}
