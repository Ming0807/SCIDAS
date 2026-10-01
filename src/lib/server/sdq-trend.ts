import type { SdqHistoryItem } from "@/app/actions/sdq.actions"

export interface SdqTrendResult {
  hasTrend: boolean
  direction: "improved" | "worsened" | "stable" | "insufficient_data"
  isJump: boolean
  scoreDelta: number | null
  currentRiskLevel: string | null
  previousRiskLevel: string | null
  message: string
  suggestedAction: "idp" | "referral" | "monitor" | null
}

const RISK_SEVERITY_ORDER: Record<string, number> = {
  normal: 1,
  watch: 2,
  high: 3,
}

/**
 * Evaluates SDQ trend between assessments over time (E4).
 * Identifies negative jumps (classification jump -> suggest case or referral).
 */
export function calculateSdqTrend(assessments: SdqHistoryItem[]): SdqTrendResult {
  if (!assessments || assessments.length < 2) {
    return {
      hasTrend: false,
      direction: "insufficient_data",
      isJump: false,
      scoreDelta: null,
      currentRiskLevel: assessments?.[0]?.riskLevel ?? null,
      previousRiskLevel: null,
      message: "ต้องการผลการประเมินอย่างน้อย 2 ครั้งเพื่อวิเคราะห์แนวโน้ม",
      suggestedAction: null,
    }
  }

  // assessments are sorted latest first
  const latest = assessments[0]
  const previous = assessments[1]

  const currentLevel = latest.riskLevel || "normal"
  const prevLevel = previous.riskLevel || "normal"

  const currentSeverity = RISK_SEVERITY_ORDER[currentLevel] ?? 1
  const prevSeverity = RISK_SEVERITY_ORDER[prevLevel] ?? 1

  const currentScore = latest.riskScore ?? 0
  const prevScore = previous.riskScore ?? 0
  const scoreDelta = currentScore - prevScore

  const isWorsenedSeverity = currentSeverity > prevSeverity
  const isImprovedSeverity = currentSeverity < prevSeverity

  // A jump is defined as moving up in risk category, or score increase >= 4 points
  const isJump = isWorsenedSeverity || (currentSeverity >= 2 && scoreDelta >= 4)

  if (isJump) {
    const suggestedAction = currentLevel === "high" ? "referral" : "idp"
    return {
      hasTrend: true,
      direction: "worsened",
      isJump: true,
      scoreDelta,
      currentRiskLevel: currentLevel,
      previousRiskLevel: prevLevel,
      message: `ระดับความเสี่ยงแย่ลงจาก '${prevLevel === "normal" ? "ปกติ" : "เสี่ยง"}' เป็น '${currentLevel === "high" ? "มีปัญหา" : "เสี่ยง"}' (คะแนนเปลี่ยนแปลง ${scoreDelta > 0 ? `+${scoreDelta}` : scoreDelta})`,
      suggestedAction,
    }
  }

  if (isImprovedSeverity || scoreDelta <= -3) {
    return {
      hasTrend: true,
      direction: "improved",
      isJump: false,
      scoreDelta,
      currentRiskLevel: currentLevel,
      previousRiskLevel: prevLevel,
      message: `ผลการประเมินมีพัฒนาการที่ดีขึ้น (คะแนนเปลี่ยนแปลง ${scoreDelta})`,
      suggestedAction: "monitor",
    }
  }

  return {
    hasTrend: true,
    direction: "stable",
    isJump: false,
    scoreDelta,
    currentRiskLevel: currentLevel,
    previousRiskLevel: prevLevel,
    message: "แนวโน้มทรงตัวเมื่อเทียบกับการประเมินครั้งก่อนหน้า",
    suggestedAction: "monitor",
  }
}
