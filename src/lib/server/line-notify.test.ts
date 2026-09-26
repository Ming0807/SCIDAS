import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"

import {
  broadcastLineText,
  formatRiskAlertMessage,
  isLineConfigured,
  notifyRiskEscalationToLine,
  sendLinePush,
} from "./line-notify"

const originalEnv = { ...process.env }

describe("line-notify (prepared provider)", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.unstubAllGlobals()
    delete process.env.LINE_CHANNEL_ACCESS_TOKEN
    delete process.env.LINE_DEFAULT_TARGET
  })

  afterEach(() => {
    process.env = { ...originalEnv }
    vi.unstubAllGlobals()
  })

  it("reports unconfigured when env vars are missing", () => {
    expect(isLineConfigured()).toBe(false)
  })

  it("never calls network when unconfigured", async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal("fetch", fetchMock)

    const result = await sendLinePush({ to: "U123", text: "hello" })

    expect(result).toEqual({ ok: false, reason: "NOT_CONFIGURED" })
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it("pushes text messages when configured", async () => {
    process.env.LINE_CHANNEL_ACCESS_TOKEN = "test-token"
    process.env.LINE_DEFAULT_TARGET = "C123"
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, text: async () => "" })
    vi.stubGlobal("fetch", fetchMock)

    expect(isLineConfigured()).toBe(true)
    const result = await sendLinePush({ to: "U123", text: "สวัสดี" })

    expect(result).toEqual({ ok: true })
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.line.me/v2/bot/message/push",
      expect.objectContaining({
        method: "POST",
        body: expect.stringContaining("สวัสดี"),
      }),
    )
  })

  it("surfaces LINE API failures without throwing", async () => {
    process.env.LINE_CHANNEL_ACCESS_TOKEN = "test-token"
    process.env.LINE_DEFAULT_TARGET = "C123"
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, status: 401, text: async () => "unauthorized" }),
    )

    const result = await sendLinePush({ to: "U123", text: "hi" })

    expect(result.ok).toBe(false)
    if (!result.ok && result.reason === "REQUEST_FAILED") {
      expect(result.message).toContain("401")
    } else {
      throw new Error("expected REQUEST_FAILED")
    }
  })

  it("formats Thai risk alerts and broadcasts to the default target", async () => {
    process.env.LINE_CHANNEL_ACCESS_TOKEN = "test-token"
    process.env.LINE_DEFAULT_TARGET = "C123"
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, text: async () => "" })
    vi.stubGlobal("fetch", fetchMock)

    const message = formatRiskAlertMessage({
      studentName: "เด็กชายทดสอบ",
      classroomName: "ป.4/1",
      riskLevel: "high",
      riskScore: 75,
      topFactors: ["ขาดเรียนบ่อย", "คะแนนต่ำ"],
    })
    expect(message).toContain("เสี่ยงสูง")
    expect(message).toContain("เด็กชายทดสอบ")
    expect(message).toContain("75")

    const result = await notifyRiskEscalationToLine({
      studentName: "เด็กชายทดสอบ",
      classroomName: "ป.4/1",
      riskLevel: "high",
      riskScore: 75,
      topFactors: ["ขาดเรียนบ่อย"],
    })
    expect(result).toEqual({ ok: true })
    const [, init] = fetchMock.mock.calls[0] as [string, { body: string }]
    expect(JSON.parse(init.body).to).toBe("C123")
  })

  it("broadcast without a target stays a safe no-op", async () => {
    process.env.LINE_CHANNEL_ACCESS_TOKEN = "test-token"
    const fetchMock = vi.fn()
    vi.stubGlobal("fetch", fetchMock)

    const result = await broadcastLineText("hello")

    expect(result).toEqual({ ok: false, reason: "NOT_CONFIGURED" })
    expect(fetchMock).not.toHaveBeenCalled()
  })
})
