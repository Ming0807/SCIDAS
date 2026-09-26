import "server-only"

/**
 * LINE Messaging API provider (prepared, credentials bound later).
 *
 * Required env (server only, never NEXT_PUBLIC_):
 * - LINE_CHANNEL_ACCESS_TOKEN — Channel access token (long-lived) from LINE Developers
 * - LINE_DEFAULT_TARGET — default userId/groupId to push operational alerts to
 *
 * Binding steps (for later):
 * 1. Create a provider + Messaging API channel at https://developers.line.biz
 * 2. Issue a long-lived channel access token
 * 3. Invite the bot to the target group (or use a userId) and copy the groupId
 * 4. Set the two env vars on the server / Vercel and redeploy
 *
 * Until both vars are set, every sender returns { ok: false, reason: "NOT_CONFIGURED" }
 * and performs no network calls, so importing this module is always safe.
 */

const LINE_PUSH_ENDPOINT = "https://api.line.me/v2/bot/message/push"

export type LineSendResult =
  | { ok: true }
  | { ok: false; reason: "NOT_CONFIGURED" | "REQUEST_FAILED"; message?: string }

export function isLineConfigured(): boolean {
  return Boolean(process.env.LINE_CHANNEL_ACCESS_TOKEN?.trim() && process.env.LINE_DEFAULT_TARGET?.trim())
}

function lineHeaders(): HeadersInit {
  return {
    Authorization: `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN?.trim()}`,
    "Content-Type": "application/json",
  }
}

export async function sendLinePush(input: {
  to: string
  text: string
}): Promise<LineSendResult> {
  const target = input.to.trim()
  const text = input.text.trim()
  if (!target || !text) {
    return { ok: false, reason: "REQUEST_FAILED", message: "ปลายทางหรือข้อความว่างเปล่า" }
  }
  if (!isLineConfigured()) {
    return { ok: false, reason: "NOT_CONFIGURED" }
  }

  try {
    const response = await fetch(LINE_PUSH_ENDPOINT, {
      method: "POST",
      headers: lineHeaders(),
      body: JSON.stringify({
        to: target,
        messages: [{ type: "text", text: text.slice(0, 4900) }],
      }),
    })

    if (!response.ok) {
      const detail = await response.text().catch(() => "")
      console.error("[line-notify] push failed:", response.status, detail.slice(0, 300))
      return { ok: false, reason: "REQUEST_FAILED", message: `LINE ตอบกลับ ${response.status}` }
    }

    return { ok: true }
  } catch (error) {
    console.error("[line-notify] push error:", error)
    return { ok: false, reason: "REQUEST_FAILED", message: "เชื่อมต่อ LINE ไม่สำเร็จ" }
  }
}

export async function broadcastLineText(text: string): Promise<LineSendResult> {
  const target = process.env.LINE_DEFAULT_TARGET?.trim() ?? ""
  if (!target) {
    return { ok: false, reason: "NOT_CONFIGURED" }
  }
  return sendLinePush({ to: target, text })
}

export function formatRiskAlertMessage(input: {
  studentName: string
  classroomName?: string | null
  riskLevel: "watch" | "high"
  riskScore: number
  topFactors?: string[]
}): string {
  const levelLabel = input.riskLevel === "high" ? "เสี่ยงสูง" : "เฝ้าระวัง"
  const lines = [
    `แจ้งเตือน SCIDAS: นักเรียน${levelLabel}`,
    `ชื่อ: ${input.studentName}${input.classroomName ? ` (${input.classroomName})` : ""}`,
    `คะแนนความเสี่ยง: ${input.riskScore}`,
  ]
  if (input.topFactors && input.topFactors.length > 0) {
    lines.push(`ปัจจัยหลัก: ${input.topFactors.slice(0, 3).join(", ")}`)
  }
  lines.push("กรุณาเปิดระบบเพื่อดำเนินการช่วยเหลือ")
  return lines.join("\n")
}

/**
 * Ready-to-wire hook for the risk follow-up pipeline.
 * Call this after a student escalates to watch/high once LINE is bound.
 * Safe to call before binding (returns NOT_CONFIGURED, sends nothing).
 */
export async function notifyRiskEscalationToLine(input: {
  studentName: string
  classroomName?: string | null
  riskLevel: "watch" | "high"
  riskScore: number
  topFactors?: string[]
}): Promise<LineSendResult> {
  return broadcastLineText(formatRiskAlertMessage(input))
}
