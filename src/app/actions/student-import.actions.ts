"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"

import { getCurrentUserContext } from "@/lib/server/current-user"
import { actionFail, actionOk, type ActionResult } from "@/lib/server/action-result"
import {
  parseAndValidateStudentRows,
  type ParsedStudentRow,
  type ParseImportResult,
} from "@/lib/student-import-parser"
import { executeStudentImportRpc } from "@/lib/server/student-import-service"

export async function parseStudentFileAction(
  _prevState: ActionResult<ParseImportResult>,
  formData: FormData
): Promise<ActionResult<ParseImportResult>> {
  try {
    const context = await getCurrentUserContext()
    if (!["admin", "director", "homeroom_teacher", "counselor", "subject_teacher"].includes(context.role)) {
      return actionFail("FORBIDDEN", "คุณไม่มีสิทธิ์ในการนำเข้าข้อมูลนักเรียน")
    }

    const file = formData.get("file") as File | null
    if (!file || file.size === 0) {
      return actionFail("VALIDATION_ERROR", "กรุณาเลือกไฟล์ CSV หรือ Excel (.xlsx) สำหรับนำเข้า")
    }

    if (file.size > 5 * 1024 * 1024) {
      return actionFail("VALIDATION_ERROR", "ขนาดไฟล์ต้องไม่เกิน 5 MB")
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const result = parseAndValidateStudentRows(buffer, file.name)

    if (result.totalRows === 0) {
      return actionFail("VALIDATION_ERROR", "ไม่พบข้อมูลในไฟล์ หรือไฟล์ว่างเปล่า")
    }

    return actionOk("ตรวจสอบไฟล์สำเร็จ", {
      data: result,
    })
  } catch (error) {
    console.error("parseStudentFileAction error:", error)
    return actionFail("INTERNAL_ERROR", "เกิดข้อผิดพลาดในการอ่านและตรวจสอบโครงสร้างไฟล์")
  }
}

const ImportRequestSchema = z.object({
  classroomId: z.string().uuid("กรุณาเลือกห้องเรียน"),
  semesterId: z.string().uuid("กรุณาเลือกภาคเรียน"),
})

export async function executeStudentImportAction(
  classroomId: string,
  semesterId: string,
  students: ParsedStudentRow[]
): Promise<ActionResult<{ count: number }>> {
  try {
    const context = await getCurrentUserContext()
    if (!["admin", "director", "homeroom_teacher", "counselor", "subject_teacher"].includes(context.role)) {
      return actionFail("FORBIDDEN", "คุณไม่มีสิทธิ์ในการนำเข้าข้อมูลนักเรียน")
    }

    const parsed = ImportRequestSchema.safeParse({ classroomId, semesterId })
    if (!parsed.success) {
      return actionFail("VALIDATION_ERROR", "ห้องเรียนหรือภาคเรียนไม่ถูกต้อง")
    }

    if (!students || students.length === 0) {
      return actionFail("VALIDATION_ERROR", "ไม่มีรายการนักเรียนที่ถูกต้องสำหรับการนำเข้า")
    }

    const rpcRes = await executeStudentImportRpc(classroomId, semesterId, students)

    if (!rpcRes.success) {
      return actionFail("CONFLICT", rpcRes.error || "เกิดข้อผิดพลาดในการบันทึกข้อมูล")
    }

    revalidatePath("/students")
    revalidatePath("/attendance")
    revalidatePath("/academics")
    revalidatePath("/settings/academic")
    revalidatePath("/")

    return actionOk(`นำเข้าข้อมูลนักเรียนสำเร็จ ${rpcRes.count} คน`, {
      data: { count: rpcRes.count },
    })
  } catch (error) {
    console.error("executeStudentImportAction error:", error)
    return actionFail("INTERNAL_ERROR", "เกิดข้อผิดพลาดในการบันทึกข้อมูลนำเข้านักเรียน")
  }
}
