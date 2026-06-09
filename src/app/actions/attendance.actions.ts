'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getClassroomStudents() {
  const supabase = await createClient()

  // 1. Get current user's profile to find their school_id
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data: profile } = await supabase
    .from('profiles')
    .select('school_id, id')
    .eq('id', user.id)
    .single()

  if (!profile || !profile.school_id) throw new Error('User has no school assigned')

  // 2. Find the classroom where the user is a homeroom teacher (for their school)
  const { data: classroom } = await supabase
    .from('classrooms')
    .select('id, name')
    .eq('school_id', profile.school_id)
    .eq('homeroom_teacher_id', profile.id)
    .single()

  if (!classroom) return { classroom: null, students: [] }

  // 3. Get students in this classroom
  // We use the classroom_students table to join students
  const { data: classroomStudents, error } = await supabase
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
    .eq('is_active', true)
    
  if (error) {
    console.error('Error fetching students:', error)
    throw new Error('Failed to fetch students')
  }

  // Format the output
  const students = classroomStudents
    .map((cs: any) => ({
      id: cs.students.id,
      name: `${cs.students.prefix || ''}${cs.students.first_name} ${cs.students.last_name}`
    }))
    .sort((a, b) => a.name.localeCompare(b.name, 'th'))

  return { classroom, students }
}

export async function getAttendanceForDate(classroomId: string, date: string) {
  const supabase = await createClient()

  const { data: attendance, error } = await supabase
    .from('attendance_records')
    .select('student_id, status, remark')
    .eq('classroom_id', classroomId)
    .eq('date', date)

  if (error) {
    console.error('Error fetching attendance:', error)
    throw new Error('Failed to fetch attendance records')
  }

  return attendance
}

export async function upsertAttendance(
  classroomId: string, 
  date: string, 
  records: { student_id: string, status: 'present' | 'absent' | 'late' | 'leave', remark?: string }[]
) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Prepare upsert payload
  const payload = records.map(record => ({
    student_id: record.student_id,
    classroom_id: classroomId,
    date: date,
    status: record.status,
    remark: record.remark || null,
    recorded_by: user.id
  }))

  const { error } = await supabase
    .from('attendance_records')
    .upsert(payload, { 
      onConflict: 'student_id, classroom_id, date'
    })

  if (error) {
    console.error('Error upserting attendance:', error)
    throw new Error('Failed to save attendance records')
  }

  revalidatePath('/attendance')
  return { success: true }
}
