import { describe, it, expect, vi, beforeEach } from "vitest"

import {
  markAllAsReadAction,
  toggleNotificationReadAction,
  deleteNotificationAction,
  updateNotificationPreferencesAction,
} from "./notifications.actions"

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}))

vi.mock("@/lib/server/notification-read-models", () => ({
  markAllNotificationsRead: vi.fn(),
  toggleNotificationRead: vi.fn(),
  deleteNotification: vi.fn(),
  setMutedNotificationTypes: vi.fn(),
}))

import {
  markAllNotificationsRead,
  toggleNotificationRead,
  deleteNotification,
  setMutedNotificationTypes,
} from "@/lib/server/notification-read-models"
import { revalidatePath } from "next/cache"

describe("notifications.actions", () => {
  const validUUID = "12345678-1234-1234-1234-123456789abc"

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("markAllAsReadAction", () => {
    it("successfully marks all as read and revalidates /notifications", async () => {
      vi.mocked(markAllNotificationsRead).mockResolvedValueOnce({ count: 5 })

      const result = await markAllAsReadAction()
      expect(result.ok).toBe(true)
      if (result.ok && result.data) {
        expect(result.data.count).toBe(5)
      }
      expect(revalidatePath).toHaveBeenCalledWith("/notifications")
    })

    it("handles UNAUTHORIZED", async () => {
      vi.mocked(markAllNotificationsRead).mockRejectedValueOnce(new Error("UNAUTHORIZED"))

      const result = await markAllAsReadAction()
      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.code).toBe("UNAUTHORIZED")
      }
    })
  })

  describe("toggleNotificationReadAction", () => {
    it("fails when notificationId is not a valid UUID", async () => {
      const result = await toggleNotificationReadAction("not-a-uuid")
      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.code).toBe("VALIDATION_ERROR")
      }
    })

    it("succeeds when toggling read status", async () => {
      vi.mocked(toggleNotificationRead).mockResolvedValueOnce({ isRead: true })

      const result = await toggleNotificationReadAction(validUUID)
      expect(result.ok).toBe(true)
      if (result.ok && result.data) {
        expect(result.data.isRead).toBe(true)
      }
      expect(revalidatePath).toHaveBeenCalledWith("/notifications")
    })

    it("handles NOT_FOUND error", async () => {
      vi.mocked(toggleNotificationRead).mockRejectedValueOnce(new Error("NOT_FOUND"))

      const result = await toggleNotificationReadAction(validUUID)
      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.code).toBe("NOT_FOUND")
      }
    })
  })

  describe("deleteNotificationAction", () => {
    it("fails when notificationId is invalid", async () => {
      const result = await deleteNotificationAction("bad-id")
      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.code).toBe("VALIDATION_ERROR")
      }
    })

    it("succeeds and revalidates /notifications", async () => {
      vi.mocked(deleteNotification).mockResolvedValueOnce({ success: true })

      const result = await deleteNotificationAction(validUUID)
      expect(result.ok).toBe(true)
      if (result.ok && result.data) {
        expect(result.data.id).toBe(validUUID)
      }
      expect(revalidatePath).toHaveBeenCalledWith("/notifications")
    })
  })

  describe("updateNotificationPreferencesAction", () => {
    it("saves muted types and revalidates /notifications", async () => {
      vi.mocked(setMutedNotificationTypes).mockResolvedValueOnce(["general", "system"])

      const formData = new FormData()
      formData.append("types", "general")
      formData.append("types", "system")

      const result = await updateNotificationPreferencesAction(null, formData)
      expect(result.ok).toBe(true)
      if (result.ok && result.data) {
        expect(result.data.muted).toEqual(["general", "system"])
      }
      expect(setMutedNotificationTypes).toHaveBeenCalledWith(["general", "system"])
      expect(revalidatePath).toHaveBeenCalledWith("/notifications")
    })

    it("returns FORBIDDEN when the user is not authenticated", async () => {
      vi.mocked(setMutedNotificationTypes).mockRejectedValueOnce(new Error("FORBIDDEN"))

      const result = await updateNotificationPreferencesAction(null, new FormData())
      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.code).toBe("FORBIDDEN")
      }
    })
  })
})
