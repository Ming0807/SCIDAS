import type { Database } from "@/types/database.types"

export type SkillLevel = Database["public"]["Enums"]["skill_level"]

export const SKILL_LEVELS: SkillLevel[] = ["excellent", "good", "fair", "poor", "critical"]

const SKILL_LEVEL_LABELS: Record<SkillLevel, string> = {
  excellent: "ดีมาก",
  good: "ดี",
  fair: "พอใช้",
  poor: "ปรับปรุง",
  critical: "ไม่ผ่าน",
}

export function getSkillLevelLabel(level: SkillLevel): string {
  return SKILL_LEVEL_LABELS[level] ?? level
}

export function isSkillLevel(value: unknown): value is SkillLevel {
  return typeof value === "string" && (SKILL_LEVELS as string[]).includes(value)
}
