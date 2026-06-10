'use server'

import { createClient } from '@/utils/supabase/server'

export async function getDashboardStats() {
  const supabase = await createClient()

  // 1. Get current user's profile and school
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Check if student
  // @ts-expect-error user_id was added dynamically in phase 6
  const { data: student } = await supabase.from('students').select('school_id').eq('user_id', user.id).single()
  if (student) {
    return {
      studentTotal: 0,
      attendanceToday: 0,
      riskGroup: 0,
      openCases: 0,
      attendanceTrend: [],
      recentCases: []
    }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('school_id, role')
    .eq('id', user.id)
    .single()

  if (!profile || !profile.school_id) throw new Error('User has no school assigned')

  // Staff Stats
  const schoolId = profile.school_id

  // A. Total Students
  const { count: studentTotal } = await supabase
    .from('students')
    .select('*', { count: 'exact', head: true })
    .eq('school_id', schoolId)
    .eq('status', 'active')

  // B. Attendance Today
  // Use today's date in YYYY-MM-DD
  const today = new Date().toISOString().split('T')[0]
  const { data: attendanceTodayData } = await supabase
    .from('attendance_records')
    .select('status')
    .eq('school_id', schoolId)
    .eq('date', today)

  let attendanceTodayPercentage = 0
  if (attendanceTodayData && attendanceTodayData.length > 0) {
    const presentCount = attendanceTodayData.filter(r => r.status === 'present' || r.status === 'late' || r.status === 'leave').length
    attendanceTodayPercentage = Math.round((presentCount / attendanceTodayData.length) * 1000) / 10
  }

  // C. Risk Group (watch, high)
  const { count: riskGroupTotal } = await supabase
    .from('risk_assessments')
    .select('*', { count: 'exact', head: true })
    .eq('school_id', schoolId)
    .in('risk_level', ['watch', 'high'])

  // D. Cases Helping (pending, in_progress)
  const { count: openCasesTotal } = await supabase
    .from('support_records')
    .select('*', { count: 'exact', head: true })
    .eq('school_id', schoolId)
    .in('status', ['pending', 'in_progress'])

  // E. Trend Data (Last 7 days attendance)
  // For simplicity, we just fetch aggregated stats from the last 7 days.
  const past7Days = [...Array(7)].map((_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    return d.toISOString().split('T')[0]
  })

  const { data: trendData } = await supabase
    .from('attendance_records')
    .select('date, status')
    .eq('school_id', schoolId)
    .in('date', past7Days)

  const attendanceTrend = past7Days.map(date => {
    const records = trendData?.filter(r => r.date === date) || []
    const present = records.filter(r => r.status === 'present' || r.status === 'late').length
    const absent = records.filter(r => r.status === 'absent').length
    const leave = records.filter(r => r.status === 'leave' || r.status === 'sick').length
    const rate = records.length > 0 ? Math.round((present / records.length) * 100) : 0
    // Format date as DD/MM
    const [, month, day] = date.split('-')
    return {
      date: `${day}/${month}`,
      present,
      absent,
      leave,
      rate
    }
  })

  // F. Recent Actionable Items (e.g. pending support records or high risk)
  const { data: recentCasesData } = await supabase
    .from('support_records')
    .select(`
      id,
      title,
      description,
      priority,
      status,
      created_at,
      students (
        id,
        first_name,
        last_name,
        prefix
      )
    `)
    .eq('school_id', schoolId)
    .in('status', ['pending', 'in_progress'])
    .order('created_at', { ascending: false })
    .limit(5)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recentCases = (recentCasesData || []).map((c: any) => ({
    id: c.id,
    title: c.title,
    studentName: `${c.students?.prefix || ''}${c.students?.first_name || ''} ${c.students?.last_name || ''}`,
    description: c.description,
    priority: c.priority || 'medium',
  }))

  return {
    studentTotal: studentTotal || 0,
    attendanceToday: attendanceTodayPercentage,
    riskGroup: riskGroupTotal || 0,
    openCases: openCasesTotal || 0,
    attendanceTrend,
    recentCases
  }
}
