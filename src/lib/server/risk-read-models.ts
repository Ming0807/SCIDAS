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

  // Get risk_factors joined to risk_assessments for current semester
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

  // Count by factor_key, track unique students
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
