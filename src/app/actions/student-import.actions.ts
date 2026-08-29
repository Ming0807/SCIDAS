"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"

import { getCurrentUserContext, type AppRole } from "@/lib/server/current-user"
import { actionFail, actionOk, type ActionResult } from "@/lib/server/action-result"
import {
  generateStudentImportTemplateCsv,
  generateStudentImportTemplateXlsx,
  parseAndValidateStudentRows,
  type ParsedStudentRow,
  type ParseImportResult,
} from "@/lib/student-import-parser"
import { executeStudentImportRpc } from "@/lib/server/student-import-service"

const importAllowedRoles = new Set<AppRole>(["admin", "director", "homeroom_teacher"])

export async function parseStudentFileAction(
  _prevState: ActionResult<ParseImportResult> | null,
  formData: FormData,
): Promise<ActionResult<ParseImportResult>> {
  try {
    const context = await getCurrentUserContext()
    if (!importAllowedRoles.has(context.role)) {
      return actionFail("FORBIDDEN", "คุณไม่มีสิทธิ์ในการนำเข้าข้อมูลนักเรียน (เฉพาะผู้ดูแลระบบ ผู้บริหาร หรือครูประจำชั้น)")
    }

    const file = formData.get("file") as File | null
    if (!file || file.size === 0) {
      return actionFail("VALIDATION_ERROR", "กรุณาเลือกไฟล์ CSV หรือ Excel (.xlsx) สำหรับนำเข้า")
    }

    if (file.size > 5 * 1024 * 1024) {
      return actionFail("VALIDATION_ERROR", "ขนาดไฟล์ต้องไม่เกิน 5 MB")
    }

    const ext = file.name.split(".").pop()?.toLowerCase() ?? ""
    if (!["csv", "xlsx", "xls"].includes(ext)) {
      return actionFail("VALIDATION_ERROR", "รูปแบบไฟล์ไม่ถูกต้อง รองรับเฉพาะไฟล์นามสกุล .csv และ .xlsx")
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Validate magic bytes
    if (ext === "xlsx" || ext === "xls") {
      // XLSX (ZIP format) starts with PK\x03\x04: 0x50, 0x4B, 0x03, 0x04
      const isZipMagic =
        buffer.length >= 4 &&
        buffer[0] === 0x50 &&
        buffer[1] === 0x4b &&
        buffer[2] === 0x03 &&
        buffer[3] === 0x04

      if (!isZipMagic) {
        return actionFail("VALIDATION_ERROR", "ไฟล์ Excel เสียหายหรือไม่ถูกต้อง (magic bytes mismatch)")
      }
    } else if (ext === "csv") {
      // Reject binary executable or zip headers disguised as csv
      if (
        buffer.length >= 2 &&
        ((buffer[0] === 0x4d && buffer[1] === 0x5a) || // MZ DOS/PE
          (buffer[0] === 0x7f && buffer[1] === 0x45) || // ELF
          (buffer[0] === 0x50 && buffer[1] === 0x4b)) // ZIP
      ) {
        return actionFail("VALIDATION_ERROR", "ไฟล์ CSV มีรูปแบบข้อมูลผิดปกติ")
      }
    }

    const result = await parseAndValidateStudentRows(buffer, file.name)

    if (result.totalRows === 0) {
      return actionFail("VALIDATION_ERROR", "ไม่พบข้อมูลในไฟล์ หรือไฟล์ว่างเปล่า")
    }

    if (result.totalRows > 500) {
      return actionFail("VALIDATION_ERROR", "ไฟล์มีจำนวนข้อมูลเกิน 500 แถว กรุณาแบ่งนำเข้าทีละชุด")
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
  students: ParsedStudentRow[],
): Promise<ActionResult<{ count: number }>> {
  try {
    const context = await getCurrentUserContext()
    if (!importAllowedRoles.has(context.role)) {
      return actionFail("FORBIDDEN", "คุณไม่มีสิทธิ์ในการนำเข้าข้อมูลนักเรียน")
    }

    const parsed = ImportRequestSchema.safeParse({ classroomId, semesterId })
    if (!parsed.success) {
      return actionFail("VALIDATION_ERROR", "ห้องเรียนหรือภาคเรียนไม่ถูกต้อง")
    }

    if (!students || students.length === 0) {
      return actionFail("VALIDATION_ERROR", "ไม่มีรายการนักเรียนที่ถูกต้องสำหรับการนำเข้า")
    }

    if (students.length > 500) {
      return actionFail("VALIDATION_ERROR", "จำนวนนักเรียนเกินขีดจำกัดสูงสุด 500 คนต่อครั้ง")
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

export async function getStudentImportTemplateAction(format: "csv" | "xlsx"): Promise<
  ActionResult<{ contentBase64: string; fileName: string; contentType: string }>
> {
  try {
    if (format === "xlsx") {
      const buf = await generateStudentImportTemplateXlsx()
      return actionOk("สร้างแม่แบบสำเร็จ", {
        data: {
          contentBase64: buf.toString("base64"),
          fileName: "student_import_template.xlsx",
          contentType:
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        },
      })
    }

    const csvText = generateStudentImportTemplateCsv()
    return actionOk("สร้างแม่แบบสำเร็จ", {
      data: {
        contentBase64: Buffer.from(csvText, "utf8").toString("base64"),
        fileName: "student_import_template.csv",
        contentType: "text/csv; charset=utf-8",
      },
    })
  } catch (error) {
    console.error("getStudentImportTemplateAction error:", error)
    return actionFail("INTERNAL_ERROR", "เกิดข้อผิดพลาดในการสร้างไฟล์แม่แบบ")
  }
}
