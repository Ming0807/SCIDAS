"use server"

import { revalidatePath } from "next/cache"

import {
  type ActionItemStatus,
  createStudentNote,
  type StudentNoteVisibility,
  updateActionItemStatus,
} from "@/lib/server/student-care-read-models"
import { actionFail, actionOk, type ActionResult } from "@/lib/server/action-result"

const allowedStatuses: ActionItemStatus[] = ["todo", "in_progress", "done", "cancelled"]
const allowedNoteVisibilities: StudentNoteVisibility[] = ["team", "private", "leadership"]

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
    if (item.studentId) {
      revalidatePath(`/students/${item.studentId}`)
    }

    return actionOk("Action item updated", {
      data: { id: item.id, status: item.status },
      revalidated: [
        "/",
        "/students",
        "/support",
        "/risk-analysis",
        ...(item.studentId ? [`/students/${item.studentId}`] : []),
      ],
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

export async function setActionItemStatusFormAction(formData: FormData): Promise<void> {
  const actionItemId = String(formData.get("actionItemId") ?? "")
  const status = String(formData.get("status") ?? "") as ActionItemStatus

  await setActionItemStatus(actionItemId, status)
}

export async function addStudentNote(
  formData: FormData,
): Promise<ActionResult<{ id: string; studentId: string }>> {
  const studentId = String(formData.get("studentId") ?? "")
  const body = String(formData.get("body") ?? "").trim()
  const category = String(formData.get("category") ?? "general")
  const visibilityValue = String(formData.get("visibility") ?? "team")
  const visibility = allowedNoteVisibilities.includes(
    visibilityValue as StudentNoteVisibility,
  )
    ? (visibilityValue as StudentNoteVisibility)
    : "team"

  if (!studentId) {
    return actionFail("VALIDATION_ERROR", "Missing student id")
  }

  if (!body) {
    return actionFail("VALIDATION_ERROR", "Note body is required", {
      fieldErrors: { body: ["กรุณากรอกบันทึก"] },
    })
  }

  try {
    const note = await createStudentNote({
      studentId,
      body,
      category,
      visibility,
      pinned: formData.get("pinned") === "on",
    })

    revalidatePath("/support")
    revalidatePath("/students")
    revalidatePath(`/students/${studentId}`)

    return actionOk("Note added", {
      data: { id: note.id, studentId: note.studentId },
      revalidated: ["/support", "/students", `/students/${studentId}`],
    })
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "UNAUTHORIZED") {
        return actionFail("UNAUTHORIZED", "Please sign in again")
      }

      if (error.message === "FORBIDDEN") {
        return actionFail("FORBIDDEN", "You do not have permission to add this note")
      }

      if (error.message === "VALIDATION_ERROR") {
        return actionFail("VALIDATION_ERROR", "Note body is required", {
          fieldErrors: { body: ["กรุณากรอกบันทึก"] },
        })
      }

      return actionFail("INTERNAL_ERROR", error.message)
    }

    return actionFail("INTERNAL_ERROR", "Unexpected note creation error")
  }
}

export async function addStudentNoteFormAction(formData: FormData): Promise<void> {
  await addStudentNote(formData)
}
