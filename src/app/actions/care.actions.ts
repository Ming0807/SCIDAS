"use server"

import { revalidatePath } from "next/cache"

import {
  type ActionItemStatus,
  updateActionItemStatus,
} from "@/lib/server/student-care-read-models"
import { actionFail, actionOk, type ActionResult } from "@/lib/server/action-result"

const allowedStatuses: ActionItemStatus[] = ["todo", "in_progress", "done", "cancelled"]

export async function setActionItemStatus(
  actionItemId: string,
  status: ActionItemStatus,
): Promise<ActionResult<{ id: string; status: ActionItemStatus }>> {
  if (!actionItemId) {
    return actionFail("VALIDATION_ERROR", "Missing action item id")
  }

  if (!allowedStatuses.includes(status)) {
    return actionFail("VALIDATION_ERROR", "Invalid action item status")
  }

  try {
    const item = await updateActionItemStatus(actionItemId, status)
    revalidatePath("/")
    revalidatePath("/students")
    revalidatePath("/support")
    revalidatePath("/risk-analysis")

    return actionOk("Action item updated", {
      data: { id: item.id, status: item.status },
      revalidated: ["/", "/students", "/support", "/risk-analysis"],
    })
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "UNAUTHORIZED") {
        return actionFail("UNAUTHORIZED", "Please sign in again")
      }

      if (error.message === "FORBIDDEN") {
        return actionFail("FORBIDDEN", "You do not have permission to update this item")
      }

      return actionFail("INTERNAL_ERROR", error.message)
    }

    return actionFail("INTERNAL_ERROR", "Unexpected action item update error")
  }
}
