"use server"

import { revalidatePath } from "next/cache"

import type { ActionResult } from "@/lib/server/action-result"
import { actionFail, actionOk } from "@/lib/server/action-result"
import {
  createHomeVisit,
  type CreateHomeVisitInput,
} from "@/lib/server/home-visit-read-models"

export async function createHomeVisitAction(
  _prev: ActionResult<{ id: string }> | null,
  formData: FormData,
): Promise<ActionResult<{ id: string }>> {
  try {
    const studentId = formData.get("studentId") as string
    const visitDate = formData.get("visitDate") as string
    const visitTime = formData.get("visitTime") as string
    const addressVisited = formData.get("addressVisited") as string
    const housingCondition = formData.get("housingCondition") as string
    const followUpNeeded = formData.get("followUpNeeded") === "on"
    const hasFamilyProblem = formData.get("hasFamilyProblem") === "on"
    const travelDifficulty = formData.get("travelDifficulty") === "on"
    const overallAssessment = formData.get("overallAssessment") as string
    const familyProblemDetail = formData.get("familyProblemDetail") as string
    const suggestions = formData.get("suggestions") as string

    if (!studentId) {
      return actionFail("VALIDATION_ERROR", "กรุณาเลือกนักเรียน", {
        fieldErrors: { studentId: ["กรุณาเลือกนักเรียน"] },
      })
    }

    if (!visitDate) {
      return actionFail("VALIDATION_ERROR", "กรุณาระบุวันที่เยี่ยมบ้าน", {
        fieldErrors: { visitDate: ["กรุณาระบุวันที่เยี่ยมบ้าน"] },
      })
    }

    const input: CreateHomeVisitInput = {
      studentId,
      visitDate,
      visitTime: visitTime || undefined,
      addressVisited: addressVisited || undefined,
      housingCondition: (housingCondition as CreateHomeVisitInput["housingCondition"]) || undefined,
      followUpNeeded,
      hasFamilyProblem,
      travelDifficulty,
      overallAssessment: overallAssessment || undefined,
      familyProblemDetail: familyProblemDetail || undefined,
      suggestions: suggestions || undefined,
    }

    const result = await createHomeVisit(input)

    revalidatePath("/home-visits")

    return actionOk("บันทึกการเยี่ยมบ้านสำเร็จ", {
      data: { id: result.id },
      redirectTo: "/home-visits",
    })
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ"
    return actionFail("INTERNAL_ERROR", message)
  }
}
