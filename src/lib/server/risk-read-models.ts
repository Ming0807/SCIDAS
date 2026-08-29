import "server-only"

import { createClient } from "@/utils/supabase/server"
import { getCurrentSemesterId, getCurrentUserContext } from "./current-user"

export type RiskLevel = "normal" | "watch" | "high"

export type RiskLevelCounts = {
  high: number
  watch: number
  normal: number
  total: number
}

export type RiskFactorCount = {
  factorKey: string
  factorLabel: string
  count: number
}

export type RiskFactorDistribution = {
  factors: RiskFactorCount[]
  totalStudents: number
}

export type StudentRiskFactor = {
  factorKey: string
  factorLabel: string
  score: number
  evidence: string | null
}

export type StudentRiskFactorData = {
  hasAssessment: boolean
  factors: StudentRiskFactor[]
}

export type RiskTrendPoint = {
  periodLabel: string
  highCount: number
  watchCount: number
  normalCount: number
  totalCount: number
}

export type RiskDimensionBenchmark = {
  dimensionKey: string
  dimensionLabel: string
  averageScore: number
  highRiskCount: number
  watchRiskCount: number
}

export type ClassroomRiskItem = {
  classroomId: string
  classroomName: string
  gradeLevel: string
  section: number
  highRiskCount: number
  watchRiskCount: number
  normalRiskCount: number
  totalStudents: number
}

export async function getRiskLevelCounts(): Promise<RiskLevelCounts> {
  const context = await getCurrentUserContext()
  const client = await createClient()
  const semesterId = await getCurrentSemesterId(context.schoolId)

  if (!semesterId) {
    return { high: 0, watch: 0, normal: 0, total: 0 }
  }

  const { data, error } = await client
    .from("risk_assessments")
    .select("risk_level")
    .eq("school_id", context.schoolId)
    .eq("semester_id", semesterId)

  if (error || !data) {
    return { high: 0, watch: 0, normal: 0, total: 0 }
  }

  let high = 0
  let watch = 0
  let normal = 0

  for (const row of data) {
    const rl = (row as { risk_level: string }).risk_level
    if (rl === "high") high++
    else if (rl === "watch") watch++
    else normal++
  }

  return { high, watch, normal, total: data.length }
}

export async function getRiskFactorDistribution(): Promise<RiskFactorDistribution> {
  const context = await getCurrentUserContext()
  const client = await createClient()
  const semesterId = await getCurrentSemesterId(context.schoolId)

  if (!semesterId) {
    return { factors: [], totalStudents: 0 }
  }

  const { data: assessments } = await client
    .from("risk_assessments")
    .select("id")
    .eq("school_id", context.schoolId)
    .eq("semester_id", semesterId)

  const assessmentIds = (assessments ?? []).map((a: { id: string }) => a.id)

  if (assessmentIds.length === 0) {
    return { factors: [], totalStudents: 0 }
  }

  const { data, error } = await client
    .from("risk_factors")
    .select("factor_key, factor_label, risk_assessment_id")
    .in("risk_assessment_id", assessmentIds)
    .eq("school_id", context.schoolId)

  if (error || !data) {
    return { factors: [], totalStudents: 0 }
  }

  const factorCounts: Record<string, { label: string; count: number }> = {}
  const studentSet = new Set<string>()

  for (const row of data) {
    const r = row as { factor_key: string; factor_label: string; risk_assessment_id: string }
    if (!factorCounts[r.factor_key]) {
      factorCounts[r.factor_key] = { label: r.factor_label, count: 0 }
    }
    factorCounts[r.factor_key].count++
    studentSet.add(r.risk_assessment_id)
  }

  const factors = Object.entries(factorCounts)
    .map(([key, val]) => ({
      factorKey: key,
      factorLabel: val.label,
      count: val.count,
    }))
    .sort((a, b) => b.count - a.count)

  return {
    factors,
    totalStudents: studentSet.size,
  }
}

export async function getStudentRiskFactorsByStudentIds(
  studentIds: string[],
): Promise<Record<string, StudentRiskFactorData>> {
  const context = await getCurrentUserContext()
  const client = await createClient()
  const result: Record<string, StudentRiskFactorData> = {}

  for (const studentId of studentIds) {
    result[studentId] = { hasAssessment: false, factors: [] }
  }

  if (studentIds.length === 0) {
    return result
  }

  const semesterId = await getCurrentSemesterId(context.schoolId)
  if (!semesterId) {
    return result
  }

  const { data: assessments, error: assessmentError } = await client
    .from("risk_assessments")
    .select("id, student_id")
    .eq("school_id", context.schoolId)
    .eq("semester_id", semesterId)
    .in("student_id", studentIds)

  if (assessmentError || !assessments || assessments.length === 0) {
    return result
  }

  const assessmentToStudent = new Map<string, string>()
  for (const assessment of assessments) {
    assessmentToStudent.set(assessment.id, assessment.student_id)
    result[assessment.student_id] = { hasAssessment: true, factors: [] }
  }

  const { data: factors, error: factorError } = await client
    .from("risk_factors")
    .select("risk_assessment_id, factor_key, factor_label, score, evidence")
    .eq("school_id", context.schoolId)
    .eq("is_active", true)
    .in("risk_assessment_id", Array.from(assessmentToStudent.keys()))
    .order("score", { ascending: false })

  if (factorError || !factors) {
    return result
  }

  for (const factor of factors) {
    const studentId = assessmentToStudent.get(factor.risk_assessment_id)
    if (!studentId) continue

    result[studentId].factors.push({
      factorKey: factor.factor_key,
      factorLabel: factor.factor_label,
      score: factor.score,
      evidence: factor.evidence,
    })
  }

  return result
}

export async function getRiskTrendHistory(): Promise<RiskTrendPoint[]> {
  const context = await getCurrentUserContext()
  const client = await createClient()

  // Attempt RPC call
  const { data: rpcData, error: rpcErr } = await client.rpc(
    "get_school_risk_trend",
    { p_school_id: context.schoolId }
  )

  const rpcList = rpcData

  if (!rpcErr && Array.isArray(rpcList) && rpcList.length > 0) {
    return rpcList.map((r) => ({
      periodLabel: r.period_label,
      highCount: Number(r.high_count || 0),
      watchCount: Number(r.watch_count || 0),
      normalCount: Number(r.normal_count || 0),
      totalCount: Number(r.total_count || 0),
    }))
  }

  // Fallback direct query on risk_assessments if RPC not available
  const { data: directData } = await client
    .from("risk_assessments")
    .select("risk_level, assessed_at")
    .eq("school_id", context.schoolId)
    .order("assessed_at", { ascending: true })

  if (!directData || directData.length === 0) {
    return []
  }

  const map = new Map<string, { high: number; watch: number; normal: number; total: number }>()
  for (const item of directData) {
    const d = new Date(item.assessed_at || new Date().toISOString())
    const label = `${d.toLocaleString("th-TH", { month: "short" })} ${String(d.getFullYear() + 543).slice(-2)}`
    const curr = map.get(label) || { high: 0, watch: 0, normal: 0, total: 0 }
    if (item.risk_level === "high") curr.high++
    else if (item.risk_level === "watch") curr.watch++
    else curr.normal++
    curr.total++
    map.set(label, curr)
  }

  return Array.from(map.entries()).map(([periodLabel, v]) => ({
    periodLabel,
    highCount: v.high,
    watchCount: v.watch,
    normalCount: v.normal,
    totalCount: v.total,
  }))
}

export async function getRiskDimensionBenchmarks(): Promise<RiskDimensionBenchmark[]> {
  const context = await getCurrentUserContext()
  const client = await createClient()

  const { data: rpcData, error: rpcErr } = await client.rpc(
    "get_risk_dimension_benchmarks",
    { p_school_id: context.schoolId }
  )

  const rpcList = rpcData

  if (!rpcErr && Array.isArray(rpcList) && rpcList.length > 0) {
    return rpcList.map((r) => ({
      dimensionKey: r.dimension_key,
      dimensionLabel: r.dimension_label,
      averageScore: Number(r.average_score || 0),
      highRiskCount: Number(r.high_risk_count || 0),
      watchRiskCount: Number(r.watch_risk_count || 0),
    }))
  }

  // Genuine direct aggregation on risk_factors + risk_assessments (no hardcoded numbers)
  const { data: factorRows } = await client
    .from("risk_factors")
    .select(`
      factor_key,
      factor_label,
      score,
      risk_assessments!inner(risk_level)
    `)
    .eq("school_id", context.schoolId)

  if (!factorRows || factorRows.length === 0) {
    return []
  }

  const dimensionMap = new Map<
    string,
    { label: string; scores: number[]; highCount: number; watchCount: number }
  >()

  for (const row of factorRows) {
    const r = row as unknown as {
      factor_key: string
      factor_label: string
      score: number | null
      risk_assessments: { risk_level: string }
    }

    const key = r.factor_key || "general"
    const curr = dimensionMap.get(key) || {
      label: r.factor_label || key,
      scores: [],
      highCount: 0,
      watchCount: 0,
    }

    if (typeof r.score === "number") {
      curr.scores.push(r.score)
    }

    if (r.risk_assessments?.risk_level === "high") {
      curr.highCount++
    } else if (r.risk_assessments?.risk_level === "watch") {
      curr.watchCount++
    }

    dimensionMap.set(key, curr)
  }

  return Array.from(dimensionMap.entries()).map(([key, val]) => {
    const avg =
      val.scores.length > 0
        ? Math.round(val.scores.reduce((a, b) => a + b, 0) / val.scores.length)
        : 0

    return {
      dimensionKey: key,
      dimensionLabel: val.label,
      averageScore: avg,
      highRiskCount: val.highCount,
      watchRiskCount: val.watchCount,
    }
  })
}

export async function getClassroomRiskBreakdown(): Promise<ClassroomRiskItem[]> {
  const context = await getCurrentUserContext()
  const client = await createClient()

  const { data: rpcData, error: rpcErr } = await client.rpc(
    "get_classroom_risk_breakdown",
    { p_school_id: context.schoolId }
  )

  const rpcList = rpcData

  if (!rpcErr && Array.isArray(rpcList)) {
    return rpcList.map((r) => ({
      classroomId: r.classroom_id,
      classroomName: r.classroom_name,
      gradeLevel: r.grade_level,
      section: r.section,
      highRiskCount: Number(r.high_risk_count || 0),
      watchRiskCount: Number(r.watch_risk_count || 0),
      normalRiskCount: Number(r.normal_risk_count || 0),
      totalStudents: Number(r.total_students || 0),
    }))
  }

  return []
}
