import type { AppRole } from "@/lib/server/current-user"

const planEditors = new Set<AppRole>([
  "admin",
  "homeroom_teacher",
  "counselor",
])

const evaluationEditors = new Set<AppRole>([
  ...planEditors,
  "director",
])

export function canEditDevelopmentPlans(role: AppRole) {
  return planEditors.has(role)
}

export function canEditDevelopmentEvaluations(role: AppRole) {
  return evaluationEditors.has(role)
}
