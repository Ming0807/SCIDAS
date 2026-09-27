import { beforeEach, describe, expect, it, vi } from "vitest"

vi.mock("@/lib/server/current-user", () => ({
  getCurrentUserContext: vi.fn(),
}))

vi.mock("@/utils/supabase/server", () => ({
  createClient: vi.fn(),
}))

import { getCurrentUserContext } from "@/lib/server/current-user"
import { createClient } from "@/utils/supabase/server"

import {
  getMutedNotificationTypes,
  setMutedNotificationTypes,
  getNotifications,
  getNotificationCounts,
} from "./notification-read-models"

function mockContext() {
  vi.mocked(getCurrentUserContext).mockResolvedValue({
    userId: "u1",
    schoolId: "sch-1",
    role: "homeroom_teacher",
    profileId: "p1",
    studentId: null,
  } as never)
}

/** Minimal thenable postgrest-style chain: every clause returns the builder. */
type ChainBuilder = {
  select: (...args: unknown[]) => ChainBuilder
  eq: (...args: unknown[]) => ChainBuilder
  not: (...args: unknown[]) => ChainBuilder
  order: (...args: unknown[]) => ChainBuilder
  range: (...args: unknown[]) => ChainBuilder
  maybeSingle: (...args: unknown[]) => ChainBuilder
}

function chainable(result: unknown): ChainBuilder {
  const builder = {} as ChainBuilder
  const record = builder as unknown as Record<string, unknown>
  const spies: Record<string, ReturnType<typeof vi.fn>> = {}
  for (const method of ["select", "eq", "not", "order", "range", "maybeSingle"]) {
    const spy = vi.fn(() => builder)
    spies[method] = spy
    record[method] = spy
  }
  record.spies = spies
  record.then = (
    onFulfilled: (value: unknown) => unknown,
    onRejected?: (reason: unknown) => unknown,
  ) => Promise.resolve(result).then(onFulfilled, onRejected)
  return builder
}

function spyOn(builder: ChainBuilder, method: string): ReturnType<typeof vi.fn> {
  return (builder as unknown as { spies: Record<string, ReturnType<typeof vi.fn>> }).spies[method]
}

describe("notification preferences", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("returns no muted types when no preference row exists", async () => {
    mockContext()
    const prefs: Record<string, unknown> = {}
    prefs.eq = vi.fn(() => prefs)
    prefs.maybeSingle = vi.fn().mockResolvedValue({ data: null, error: null })
    const mockSelect = vi.fn().mockReturnValue(prefs)
    vi.mocked(createClient).mockResolvedValueOnce({
      from: vi.fn().mockReturnValue({ select: mockSelect }),
    } as never)

    await expect(getMutedNotificationTypes()).resolves.toEqual([])
  })

  it("sanitizes stored muted types to known values", async () => {
    mockContext()
    const prefs: Record<string, unknown> = {}
    prefs.eq = vi.fn(() => prefs)
    prefs.maybeSingle = vi.fn().mockResolvedValue({
      data: { value: { muted: ["risk_alert", "bogus_type", 42] } },
      error: null,
    })
    const mockSelect = vi.fn().mockReturnValue(prefs)
    vi.mocked(createClient).mockResolvedValueOnce({
      from: vi.fn().mockReturnValue({ select: mockSelect }),
    } as never)

    await expect(getMutedNotificationTypes()).resolves.toEqual(["risk_alert"])
  })

  it("upserts sanitized muted types scoped to school and user", async () => {
    mockContext()
    const mockUpsert = vi.fn().mockResolvedValue({ error: null })
    const mockFrom = vi.fn().mockReturnValue({ upsert: mockUpsert })
    vi.mocked(createClient).mockResolvedValueOnce({ from: mockFrom } as never)

    const saved = await setMutedNotificationTypes(["general", "nope"])

    expect(saved).toEqual(["general"])
    expect(mockFrom).toHaveBeenCalledWith("user_dashboard_preferences")
    expect(mockUpsert).toHaveBeenCalledWith(
      {
        school_id: "sch-1",
        user_id: "p1",
        scope: "notifications",
        key: "muted_types",
        value: { muted: ["general"] },
      },
      { onConflict: "school_id,user_id,scope,key" },
    )
  })

  it("excludes muted types from the notification list query", async () => {
    mockContext()
    mockContext()

    const prefsBuilder = chainable({ data: { value: { muted: ["general"] } }, error: null })
    const countBuilder = chainable({ count: 1, error: null })
    const dataBuilder = chainable({
      data: [
        {
          id: "n1",
          type: "risk_alert",
          title: "t",
          message: "m",
          link: null,
          reference_type: null,
          reference_id: null,
          is_read: false,
          read_at: null,
          created_at: "2026-01-01T00:00:00Z",
          sender: null,
        },
      ],
      error: null,
    })

    const calls: string[] = []
    const mockFrom = vi.fn((table: string) => {
      calls.push(table)
      if (table === "user_dashboard_preferences") return { select: () => prefsBuilder.select() }
      if (calls.filter((t) => t === "notifications").length === 1) {
        return { select: () => countBuilder.select() }
      }
      return { select: () => dataBuilder.select() }
    })
    vi.mocked(createClient).mockResolvedValue({ from: mockFrom } as never)

    const page = await getNotifications({})

    expect(page.items).toHaveLength(1)
    expect(page.items[0].type).toBe("risk_alert")
    expect(spyOn(countBuilder, "not")).toHaveBeenCalledWith("type", "in", expect.stringContaining("general"))
    expect(spyOn(dataBuilder, "not")).toHaveBeenCalledWith("type", "in", expect.stringContaining("general"))
  })

  it("excludes muted types from counts and unread badge", async () => {
    mockContext()
    mockContext()

    const prefsBuilder = chainable({ data: { value: { muted: ["system"] } }, error: null })
    const listBuilder = chainable({
      data: [
        { id: "n1", type: "risk_alert", is_read: false },
        { id: "n2", type: "system", is_read: false },
        { id: "n3", type: "system", is_read: true },
      ],
      error: null,
    })

    const mockFrom = vi.fn((table: string) => {
      if (table === "user_dashboard_preferences") return { select: () => prefsBuilder.select() }
      return { select: () => listBuilder.select() }
    })
    vi.mocked(createClient).mockResolvedValue({ from: mockFrom } as never)

    const counts = await getNotificationCounts()

    expect(counts.total).toBe(1)
    expect(counts.unread).toBe(1)
    expect(counts.byType.risk_alert).toBe(1)
    expect(counts.byType.system).toBe(0)
  })
})
