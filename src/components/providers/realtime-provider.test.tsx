import React from "react"
import { render, screen, act } from "@testing-library/react"
import { describe, expect, it, vi, beforeEach } from "vitest"

import { RealtimeProvider, useRealtime } from "./realtime-provider"

const mockChannel = {
  on: vi.fn().mockReturnThis(),
  subscribe: vi.fn().mockImplementation((cb) => {
    cb("SUBSCRIBED")
    return mockChannel
  }),
}

const mockRemoveChannel = vi.fn()

vi.mock("@/utils/supabase/client", () => ({
  createClient: vi.fn(() => ({
    channel: vi.fn(() => mockChannel),
    removeChannel: mockRemoveChannel,
  })),
}))

function TestConsumer() {
  const {
    unreadNotificationsCount,
    decrementUnread,
    resetUnread,
    isOnline,
    lastAttendanceChange,
    lastSupportChange,
    lastPlanChange,
  } = useRealtime()

  return (
    <div>
      <span data-testid="unread">{unreadNotificationsCount}</span>
      <span data-testid="online">{isOnline ? "online" : "offline"}</span>
      <span data-testid="attendance">{lastAttendanceChange ? "has-change" : "no-change"}</span>
      <span data-testid="support">{lastSupportChange ? "has-support" : "no-support"}</span>
      <span data-testid="plan">{lastPlanChange ? "has-plan" : "no-plan"}</span>
      <button onClick={decrementUnread} data-testid="decrement">
        decrement
      </button>
      <button onClick={resetUnread} data-testid="reset">
        reset
      </button>
    </div>
  )
}

describe("RealtimeProvider", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("provides initial unread count and handles decrement/reset", () => {
    render(
      <RealtimeProvider initialUnreadCount={5} schoolId="school-1">
        <TestConsumer />
      </RealtimeProvider>,
    )

    expect(screen.getByTestId("unread")).toHaveTextContent("5")
    expect(screen.getByTestId("online")).toHaveTextContent("online")
    expect(screen.getByTestId("support")).toHaveTextContent("no-support")
    expect(screen.getByTestId("plan")).toHaveTextContent("no-plan")

    act(() => {
      screen.getByTestId("decrement").click()
    })
    expect(screen.getByTestId("unread")).toHaveTextContent("4")

    act(() => {
      screen.getByTestId("reset").click()
    })
    expect(screen.getByTestId("unread")).toHaveTextContent("0")
  })

  it("tracks online and offline window events", () => {
    render(
      <RealtimeProvider initialUnreadCount={0}>
        <TestConsumer />
      </RealtimeProvider>,
    )

    expect(screen.getByTestId("online")).toHaveTextContent("online")

    act(() => {
      window.dispatchEvent(new Event("offline"))
    })
    expect(screen.getByTestId("online")).toHaveTextContent("offline")

    act(() => {
      window.dispatchEvent(new Event("online"))
    })
    expect(screen.getByTestId("online")).toHaveTextContent("online")
  })
})
