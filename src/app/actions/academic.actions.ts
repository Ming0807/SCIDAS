'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getClassroomAcademicData(semesterId?: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data: profile } = await supabase
    .from('profiles')
    .select('school_id, id')
    .eq('id', user.id)
    .single()

  if (!profile || !profile.school_id) throw new Error('User has no school assigned')

  // Find the classroom where the user is a homeroom teacher
  const { data: classroom } = await supabase
    .from('classrooms')
    .select('id, name')
    .eq('school_id', profile.school_id)
    .eq('homeroom_teacher_id', profile.id)
    .single()

  if (!classroom) return { classroom: null, students: [], subjects: [], scores: [], semesters: [] }

  // Get semesters for the school
  const { data: semestersRes } = await supabase
    .from('semesters')
    .select(`
      id, 
      semester, 
      is_current,
      academic_years!inner(school_id, year)
    `)
    .eq('academic_years.school_id', profile.school_id)

  const semesters = (semestersRes || []).map((s: any) => ({
    id: s.id,
    name: `ภาคเรียนที่ ${s.semester === 'semester_1' ? '1' : '2'}/${s.academic_years.year}`,
    is_current: s.is_current
  }))

  let currentSemesterId = semesterId
  if (!currentSemesterId && semesters.length > 0) {
    const current = semesters.find(s => s.is_current)
    currentSemesterId = current ? current.id : semesters[0].id
  }

  if (!currentSemesterId) return { classroom, students: [], subjects: [], scores: [], semesters }

  // Get students in this classroom for the selected semester
  const { data: classroomStudents } = await supabase
    .from('classroom_students')
    .select(`
      student_id,
      students (
        id,
        first_name,
        last_name,
        prefix
      )
    `)
    .eq('classroom_id', classroom.id)
    .eq('semester_id', currentSemesterId)
    .eq('is_active', true)

  const students = (classroomStudents || [])
    .map((cs: any) => ({
      id: cs.students.id,
      name: `${cs.students.prefix || ''}${cs.students.first_name} ${cs.students.last_name}`
    }))
    .sort((a, b) => a.name.localeCompare(b.name, 'th'))

  // Get subjects taught in this classroom for this semester
  const { data: classroomSubjects } = await supabase
    .from('classroom_subjects')
    .select(`
      id,
      subjects (
        id,
        name,
        subject_code
      )
    `)
    .eq('classroom_id', classroom.id)
    .eq('semester_id', currentSemesterId)

  const subjects = (classroomSubjects || []).map((cs: any) => ({
    id: cs.id, // classroom_subject_id
    subject_id: cs.subjects.id,
    name: cs.subjects.name,
    code: cs.subjects.subject_code
  }))

  // Get scores
  const { data: academicScores } = await supabase
    .from('academic_scores')
    .select('*')
    .eq('semester_id', currentSemesterId)
    .in('student_id', students.map(s => s.id))
    // We can also filter by classroom_subject_id
    .in('classroom_subject_id', subjects.map(s => s.id))

  const scores = academicScores || []

  return { classroom, students, subjects, scores, semesters, currentSemesterId }
}

export async function upsertAcademicScores(
  semesterId: string,
  records: {
    student_id: string;
    classroom_subject_id: string;
    total_score: number;
    grade?: string;
  }[]
) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Map to the database payload
  // If the user inputs total score directly (as in the mock), we might just store it in classwork_score or we can split it.
  // Actually, wait: total_score is GENERATED ALWAYS AS (midterm_score + final_score + classwork_score) STORED.
  // So we CANNOT insert total_score. We must insert classwork_score (or midterm/final).
  // Let's assume the input score is classwork_score for simplicity if we only have a single score input.
  const payload = records.map(record => {
    // calculate grade if not provided
    let grade = record.grade;
    let grade_point = null;
    const score = record.total_score;
    if (!grade) {
      if (score >= 80) { grade = '4'; grade_point = 4.0; }
      else if (score >= 75) { grade = '3.5'; grade_point = 3.5; }
      else if (score >= 70) { grade = '3'; grade_point = 3.0; }
      else if (score >= 65) { grade = '2.5'; grade_point = 2.5; }
      else if (score >= 60) { grade = '2'; grade_point = 2.0; }
      else if (score >= 55) { grade = '1.5'; grade_point = 1.5; }
      else if (score >= 50) { grade = '1'; grade_point = 1.0; }
      else { grade = '0'; grade_point = 0.0; }
    }

    return {
      student_id: record.student_id,
      classroom_subject_id: record.classroom_subject_id,
      semester_id: semesterId,
      classwork_score: record.total_score, // We store it all in classwork_score since total_score is generated
      midterm_score: 0,
      final_score: 0,
      grade: grade,
      grade_point: grade_point
    }
  })

  const { error } = await supabase
    .from('academic_scores')
    .upsert(payload, { 
      onConflict: 'student_id, classroom_subject_id, semester_id'
    })

  if (error) {
    console.error('Error upserting academic scores:', error)
    throw new Error('Failed to save academic scores')
  }

  revalidatePath('/academics')
  return { success: true }
}
