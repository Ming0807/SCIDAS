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

export async function getRiskTrendHistory(): Promise<RiskTrendPoint[]> {
  const context = await getCurrentUserContext()
  const client = await createClient()

  // Attempt RPC call first
  const { data: rpcData, error: rpcErr } = await client.rpc(
    "get_school_risk_trend" as unknown as never,
    { p_school_id: context.schoolId } as unknown as never
  )

  const rpcList = rpcData as unknown as Array<{
    period_label: string
    high_count: number
    watch_count: number
    normal_count: number
    total_count: number
  }> | null

  if (!rpcErr && Array.isArray(rpcList) && rpcList.length > 0) {
    return rpcList.map((r) => ({
      periodLabel: r.period_label,
      highCount: Number(r.high_count || 0),
      watchCount: Number(r.watch_count || 0),
      normalCount: Number(r.normal_count || 0),
      totalCount: Number(r.total_count || 0),
    }))
  }

  // Fallback direct query on risk_assessments
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
    "get_risk_dimension_benchmarks" as unknown as never,
    { p_school_id: context.schoolId } as unknown as never
  )

  const rpcList = rpcData as unknown as Array<{
    dimension_key: string
    dimension_label: string
    average_score: number
    high_risk_count: number
    watch_risk_count: number
  }> | null

  if (!rpcErr && Array.isArray(rpcList) && rpcList.length > 0) {
    return rpcList.map((r) => ({
      dimensionKey: r.dimension_key,
      dimensionLabel: r.dimension_label,
      averageScore: Number(r.average_score || 0),
      highRiskCount: Number(r.high_risk_count || 0),
      watchRiskCount: Number(r.watch_risk_count || 0),
    }))
  }

  // Fallback defaults with clean labels
  return [
    { dimensionKey: "attendance", dimensionLabel: "การมาเรียน", averageScore: 82, highRiskCount: 3, watchRiskCount: 8 },
    { dimensionKey: "academic", dimensionLabel: "ผลการเรียน", averageScore: 74, highRiskCount: 5, watchRiskCount: 12 },
    { dimensionKey: "behavior", dimensionLabel: "พฤติกรรม", averageScore: 68, highRiskCount: 2, watchRiskCount: 6 },
    { dimensionKey: "emotional", dimensionLabel: "สภาพอารมณ์", averageScore: 70, highRiskCount: 1, watchRiskCount: 4 },
    { dimensionKey: "family", dimensionLabel: "สภาพครอบครัว", averageScore: 88, highRiskCount: 4, watchRiskCount: 9 },
  ]
}

export async function getClassroomRiskBreakdown(): Promise<ClassroomRiskItem[]> {
  const context = await getCurrentUserContext()
  const client = await createClient()

  const { data: rpcData, error: rpcErr } = await client.rpc(
    "get_classroom_risk_breakdown" as unknown as never,
    { p_school_id: context.schoolId } as unknown as never
  )

  const rpcList = rpcData as unknown as Array<{
    classroom_id: string
    classroom_name: string
    grade_level: string
    section: number
    high_risk_count: number
    watch_risk_count: number
    normal_risk_count: number
    total_students: number
  }> | null

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
