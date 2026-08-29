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
const guardianRelations = [
  "father",
  "mother",
  "grandfather",
  "grandmother",
  "uncle",
  "aunt",
  "sibling",
  "other_relative",
  "guardian",
] as const
const nullableText = (max: number) => z.string().trim().max(max).nullable().optional()
const studentImportRowSchema = z.object({
  rowNumber: z.number().int().positive(),
  studentCode: z.string().trim().min(1).max(20),
  nationalId: z.string().regex(/^\d{13}$/).nullable().optional(),
  prefix: nullableText(50),
  firstName: z.string().trim().min(1).max(100),
  lastName: z.string().trim().min(1).max(100),
  nickname: nullableText(50),
  gender: z.enum(["male", "female", "other"]),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  bloodType: nullableText(5),
  address: nullableText(2000),
  studentNumber: z.number().int().positive().max(9999).nullable().optional(),
  guardianPrefix: nullableText(50),
  guardianFirstName: nullableText(100),
  guardianLastName: nullableText(100),
  guardianPhone: nullableText(20),
  guardianRelation: z.enum(guardianRelations).nullable().optional(),
})
const studentImportBatchSchema = z
  .array(studentImportRowSchema)
  .min(1)
  .max(500)
  .superRefine((rows, ctx) => {
    const studentCodes = new Set<string>()
    const nationalIds = new Set<string>()
    rows.forEach((row, index) => {
      if (studentCodes.has(row.studentCode)) {
        ctx.addIssue({
          code: "custom",
          message: `รหัสนักเรียน ${row.studentCode} ซ้ำในชุดนำเข้า`,
          path: [index, "studentCode"],
        })
      }
      studentCodes.add(row.studentCode)

      if (row.nationalId) {
        if (nationalIds.has(row.nationalId)) {
          ctx.addIssue({
            code: "custom",
            message: `เลขประจำตัวประชาชน ${row.nationalId} ซ้ำในชุดนำเข้า`,
            path: [index, "nationalId"],
          })
        }
        nationalIds.add(row.nationalId)
      }
    })
  })

const acceptedMimeTypes: Record<"csv" | "xlsx", Set<string>> = {
  csv: new Set(["text/csv", "application/csv", "text/plain", "application/vnd.ms-excel"]),
  xlsx: new Set([
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/octet-stream",
  ]),
}

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
    if (ext !== "csv" && ext !== "xlsx") {
      return actionFail("VALIDATION_ERROR", "รูปแบบไฟล์ไม่ถูกต้อง รองรับเฉพาะไฟล์นามสกุล .csv และ .xlsx")
    }

    if (file.type && !acceptedMimeTypes[ext].has(file.type.toLowerCase())) {
      return actionFail("VALIDATION_ERROR", "ชนิดไฟล์ไม่ตรงกับรูปแบบ CSV หรือ XLSX ที่รองรับ")
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Validate magic bytes
    if (ext === "xlsx") {
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

    const parsedStudents = studentImportBatchSchema.safeParse(students)
    if (!parsedStudents.success) {
      return actionFail("VALIDATION_ERROR", "ข้อมูลนักเรียนไม่ผ่านการตรวจสอบฝั่งเซิร์ฟเวอร์")
    }

    const rpcRes = await executeStudentImportRpc(
      classroomId,
      semesterId,
      parsedStudents.data as ParsedStudentRow[],
    )

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
