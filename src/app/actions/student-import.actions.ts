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
import {
  executeStudentImportRpc,
  findExistingStudentsInSchool,
  type ImportDuplicateMode,
} from "@/lib/server/student-import-service"

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
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
  bloodType: nullableText(5),
  address: nullableText(2000),
  studentNumber: z.number().int().positive().max(9999).nullable().optional(),
  guardianPrefix: nullableText(50),
  guardianFirstName: nullableText(100),
  guardianLastName: nullableText(100),
  guardianPhone: nullableText(20),
  guardianRelation: z.enum(guardianRelations).nullable().optional(),
  isExistingInDb: z.boolean().optional(),
  existingStudentName: z.string().optional(),
})
const studentImportBatchSchema = z
  .array(studentImportRowSchema)
  .min(1)
  .max(500)

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

    const targetSheet = (formData.get("sheet") as string | null) || undefined
    const skipInFileDuplicates = formData.get("skipInFileDuplicates") === "true"

    const result = await parseAndValidateStudentRows(buffer, file.name, {
      sheet: targetSheet,
      skipInFileDuplicates,
    })

    if (result.totalRows === 0) {
      return actionFail("VALIDATION_ERROR", "ไม่พบข้อมูลในไฟล์ หรือไฟล์ว่างเปล่า")
    }

    if (result.totalRows > 500) {
      return actionFail("VALIDATION_ERROR", "ไฟล์มีจำนวนข้อมูลเกิน 500 แถว กรุณาแบ่งนำเข้าทีละชุด")
    }

    // Check duplicate students against database
    const studentCodes = result.validRows.map((r) => r.studentCode)
    const nationalIds = result.validRows.map((r) => r.nationalId || "").filter(Boolean)

    let existingCount = 0
    let enhancedValidRows = result.validRows

    try {
      const existingMap = await findExistingStudentsInSchool(studentCodes, nationalIds)
      enhancedValidRows = result.validRows.map((r) => {
        const byCode = existingMap.get(`code:${r.studentCode}`)
        const byNid = r.nationalId ? existingMap.get(`nid:${r.nationalId}`) : undefined
        const match = byCode || byNid
        if (match) {
          existingCount++
          return {
            ...r,
            isExistingInDb: true,
            existingStudentName: match.fullName,
          }
        }
        return {
          ...r,
          isExistingInDb: false,
        }
      })
    } catch (dbErr) {
      console.warn("Could not pre-check existing students in database:", dbErr)
    }

    const finalResult: ParseImportResult = {
      ...result,
      validRows: enhancedValidRows,
      summary: {
        ...result.summary,
        existingCount,
      },
    }

    return actionOk("ตรวจสอบไฟล์สำเร็จ", {
      data: finalResult,
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
  duplicateMode?: ImportDuplicateMode,
): Promise<ActionResult<{ count: number; skippedCount: number; enrolledExistingCount: number }>> {
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

    // When duplicateMode is "error" or omitted (default strict mode), reject in-batch duplicates
    if (!duplicateMode || duplicateMode === "error") {
      const studentCodes = new Set<string>()
      const nationalIds = new Set<string>()
      for (const row of students) {
        if (studentCodes.has(row.studentCode)) {
          return actionFail("VALIDATION_ERROR", `รหัสนักเรียน ${row.studentCode} ซ้ำในชุดนำเข้า`)
        }
        studentCodes.add(row.studentCode)

        if (row.nationalId) {
          if (nationalIds.has(row.nationalId)) {
            return actionFail("VALIDATION_ERROR", `เลขประจำตัวประชาชน ${row.nationalId} ซ้ำในชุดนำเข้า`)
          }
          nationalIds.add(row.nationalId)
        }
      }
    }

    const parsedStudents = studentImportBatchSchema.safeParse(students)
    if (!parsedStudents.success) {
      return actionFail("VALIDATION_ERROR", "ข้อมูลนักเรียนไม่ผ่านการตรวจสอบฝั่งเซิร์ฟเวอร์")
    }

    let finalStudents = parsedStudents.data as ParsedStudentRow[]
    if (duplicateMode === "skip") {
      const seen = new Set<string>()
      finalStudents = finalStudents.filter((s) => {
        if (seen.has(s.studentCode)) return false
        seen.add(s.studentCode)
        return true
      })
    }

    const rpcRes = duplicateMode
      ? await executeStudentImportRpc(classroomId, semesterId, finalStudents, duplicateMode)
      : await executeStudentImportRpc(classroomId, semesterId, finalStudents)

    if (!rpcRes.success) {
      return actionFail("CONFLICT", rpcRes.error || "เกิดข้อผิดพลาดในการบันทึกข้อมูล")
    }

    revalidatePath("/students")
    revalidatePath("/attendance")
    revalidatePath("/academics")
    revalidatePath("/settings/academic")
    revalidatePath("/")

    let msg = `นำเข้าข้อมูลนักเรียนสำเร็จ ${rpcRes.count} คน`
    if (rpcRes.enrolledExistingCount > 0) {
      msg += ` (ดึงเข้าห้องเรียนนี้ ${rpcRes.enrolledExistingCount} คน)`
    }
    if (rpcRes.skippedCount > 0) {
      msg += ` ข้ามรายการซ้ำ ${rpcRes.skippedCount} คน`
    }

    return actionOk(msg, {
      data: {
        count: rpcRes.count,
        skippedCount: rpcRes.skippedCount,
        enrolledExistingCount: rpcRes.enrolledExistingCount,
      },
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
