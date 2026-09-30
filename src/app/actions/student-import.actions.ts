"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"

import { createClient } from "@/utils/supabase/server"
import { getCurrentUserContext, type AppRole } from "@/lib/server/current-user"
import { actionFail, actionOk, type ActionResult } from "@/lib/server/action-result"
import type { Database } from "@/types/database.types"
import {
  generateStudentImportTemplateCsv,
  generateStudentImportTemplateXlsx,
  parseAndValidateStudentRows,
  parseAndValidateAllGroups,
  type ParsedStudentRow,
  type ParseImportResult,
  type MultiGroupParseResult,
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
    const autoGenerateMissingCode = formData.get("autoGenerateMissingCode") === "true"
    const allowInvalidNationalIdAsNull = formData.get("allowInvalidNationalIdAsNull") !== "false"

    const result = await parseAndValidateStudentRows(buffer, file.name, {
      sheet: targetSheet,
      skipInFileDuplicates,
      autoGenerateMissingCode,
      allowInvalidNationalIdAsNull,
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
    const context = await getCurrentUserContext()
    if (!context.profileId || !importAllowedRoles.has(context.role)) {
      return actionFail(
        "FORBIDDEN",
        "คุณไม่มีสิทธิ์ในการนำเข้าข้อมูลนักเรียน (เฉพาะผู้ดูแลระบบ ผู้บริหาร หรือครูประจำชั้น)",
      )
    }

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

// ----------------------------------------------------------------------------
// Batch Multi-Group Parser Action
// ----------------------------------------------------------------------------
export async function parseAllStudentGroupsAction(
  _prevState: ActionResult<MultiGroupParseResult> | null,
  formData: FormData,
): Promise<ActionResult<MultiGroupParseResult>> {
  try {
    const context = await getCurrentUserContext()
    if (!importAllowedRoles.has(context.role)) {
      return actionFail("FORBIDDEN", "คุณไม่มีสิทธิ์ในการนำเข้าข้อมูลนักเรียน (เฉพาะผู้ดูแลระบบ ผู้บริหาร หรือครูประจำชั้น)")
    }

    const file = formData.get("file") as File | null
    if (!file || file.size === 0) {
      return actionFail("VALIDATION_ERROR", "กรุณาเลือกไฟล์ CSV หรือ Excel (.xlsx) สำหรับนำเข้า")
    }

    if (file.size > 10 * 1024 * 1024) {
      return actionFail("VALIDATION_ERROR", "ขนาดไฟล์ต้องไม่เกิน 10 MB")
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
      if (
        buffer.length >= 2 &&
        ((buffer[0] === 0x4d && buffer[1] === 0x5a) ||
          (buffer[0] === 0x7f && buffer[1] === 0x45) ||
          (buffer[0] === 0x50 && buffer[1] === 0x4b))
      ) {
        return actionFail("VALIDATION_ERROR", "ไฟล์ CSV มีรูปแบบข้อมูลผิดปกติ")
      }
    }

    const skipInFileDuplicates = formData.get("skipInFileDuplicates") === "true"
    const autoGenerateMissingCode = formData.get("autoGenerateMissingCode") === "true"
    const allowInvalidNationalIdAsNull = formData.get("allowInvalidNationalIdAsNull") !== "false"

    const multiResult = await parseAndValidateAllGroups(buffer, file.name, {
      skipInFileDuplicates,
      autoGenerateMissingCode,
      allowInvalidNationalIdAsNull,
    })

    if (multiResult.allTotalCount === 0) {
      return actionFail("VALIDATION_ERROR", "ไม่พบข้อมูลในไฟล์ หรือไฟล์ว่างเปล่า")
    }

    // Collect all valid student codes and national IDs across groups for DB pre-check
    const allCodes: string[] = []
    const allNids: string[] = []
    for (const grp of multiResult.groups) {
      for (const row of grp.validRows) {
        if (row.studentCode) allCodes.push(row.studentCode)
        if (row.nationalId) allNids.push(row.nationalId)
      }
    }

    let existingMap = new Map<string, { fullName: string }>()
    try {
      if (allCodes.length > 0 || allNids.length > 0) {
        existingMap = await findExistingStudentsInSchool(allCodes, allNids)
      }
    } catch (dbErr) {
      console.warn("Could not pre-check existing students across groups:", dbErr)
    }

    // Annotate rows in each group
    const annotatedGroups = multiResult.groups.map((grp) => {
      const enhancedRows = grp.validRows.map((r) => {
        const byCode = existingMap.get(`code:${r.studentCode}`)
        const byNid = r.nationalId ? existingMap.get(`nid:${r.nationalId}`) : undefined
        const match = byCode || byNid
        if (match) {
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
      return {
        ...grp,
        validRows: enhancedRows,
      }
    })

    const finalResult: MultiGroupParseResult = {
      ...multiResult,
      groups: annotatedGroups,
    }

    return actionOk("ตรวจสอบไฟล์สำเร็จ", {
      data: finalResult,
    })
  } catch (error) {
    console.error("parseAllStudentGroupsAction error:", error)
    return actionFail("INTERNAL_ERROR", "เกิดข้อผิดพลาดในการอ่านและตรวจสอบโครงสร้างไฟล์")
  }
}

// ----------------------------------------------------------------------------
// Quick-Create Classroom Action
// ----------------------------------------------------------------------------
const QuickCreateClassroomSchema = z.object({
  academicYearId: z.string().uuid("กรุณาเลือกปีการศึกษา"),
  gradeLevel: z.enum([
    "k1",
    "k2",
    "k3",
    "p1",
    "p2",
    "p3",
    "p4",
    "p5",
    "p6",
    "m1",
    "m2",
    "m3",
    "m4",
    "m5",
    "m6",
  ]),
  section: z.coerce.number().int().min(1).default(1),
  name: z.string().trim().min(1, "กรุณาระบุชื่อห้องเรียน"),
})

export type CreatedClassroomInfo = {
  id: string
  name: string
  grade_level: Database["public"]["Enums"]["grade_level"]
  section: number
}

export async function quickCreateClassroomAction(input: {
  academicYearId: string
  gradeLevel: string
  section: number
  name: string
}): Promise<ActionResult<CreatedClassroomInfo>> {
  try {
    const context = await getCurrentUserContext()
    if (!["admin", "director"].includes(context.role)) {
      return actionFail("FORBIDDEN", "คุณไม่มีสิทธิ์ในการสร้างห้องเรียน (เฉพาะผู้ดูแลระบบหรือผู้บริหาร)")
    }

    const parsed = QuickCreateClassroomSchema.safeParse(input)
    if (!parsed.success) {
      return actionFail("VALIDATION_ERROR", "ข้อมูลห้องเรียนไม่ถูกต้อง", {
        fieldErrors: parsed.error.flatten().fieldErrors,
      })
    }

    const d = parsed.data
    const supabase = await createClient()

    // Check if room with same year, grade_level, section already exists
    const { data: existing } = await supabase
      .from("classrooms")
      .select("id, name, grade_level, section")
      .eq("school_id", context.schoolId)
      .eq("academic_year_id", d.academicYearId)
      .eq("grade_level", d.gradeLevel as Database["public"]["Enums"]["grade_level"])
      .eq("section", d.section)
      .maybeSingle()

    if (existing) {
      return actionOk("ห้องเรียนนี้มีอยู่แล้วในระบบ", {
        data: existing as CreatedClassroomInfo,
      })
    }

    const { data: created, error } = await supabase
      .from("classrooms")
      .insert({
        school_id: context.schoolId,
        academic_year_id: d.academicYearId,
        grade_level: d.gradeLevel as Database["public"]["Enums"]["grade_level"],
        section: d.section,
        name: d.name,
        is_active: true,
        max_students: 40,
      })
      .select("id, name, grade_level, section")
      .single()

    if (error) {
      console.error("quickCreateClassroomAction error:", error)
      return actionFail("INTERNAL_ERROR", `ไม่สามารถสร้างห้องเรียนได้: ${error.message}`)
    }

    revalidatePath("/students")
    revalidatePath("/students/import")
    revalidatePath("/settings/academic")

    return actionOk(`สร้างห้องเรียน ${created.name} สำเร็จ`, {
      data: created as CreatedClassroomInfo,
    })
  } catch (error) {
    console.error("quickCreateClassroomAction error:", error)
    return actionFail("INTERNAL_ERROR", "เกิดข้อผิดพลาดในการสร้างห้องเรียน")
  }
}

// ----------------------------------------------------------------------------
// Batch Multi-Room Import Coordinator Action
// ----------------------------------------------------------------------------
export type BatchRoomImportPayload = {
  groupId: string
  roomName: string
  classroomId: string
  semesterId: string
  students: ParsedStudentRow[]
}

export type BatchRoomResult = {
  groupId: string
  roomName: string
  classroomId: string
  success: boolean
  count: number
  skippedCount: number
  enrolledExistingCount: number
  error?: string
}

export type BatchImportSummaryResult = {
  totalRooms: number
  successRooms: number
  failedRooms: number
  totalImported: number
  totalSkipped: number
  totalEnrolledExisting: number
  roomResults: BatchRoomResult[]
}

export async function executeBatchStudentImportAction(
  payloads: BatchRoomImportPayload[],
  duplicateMode: ImportDuplicateMode = "skip",
): Promise<ActionResult<BatchImportSummaryResult>> {
  try {
    const context = await getCurrentUserContext()
    if (!importAllowedRoles.has(context.role)) {
      return actionFail("FORBIDDEN", "คุณไม่มีสิทธิ์ในการนำเข้าข้อมูลนักเรียน")
    }

    if (!payloads || payloads.length === 0) {
      return actionFail("VALIDATION_ERROR", "ไม่มีห้องเรียนที่เลือกสำหรับการนำเข้า")
    }

    const roomResults: BatchRoomResult[] = []
    let totalImported = 0
    let totalSkipped = 0
    let totalEnrolledExisting = 0
    let successRooms = 0
    let failedRooms = 0

    for (const item of payloads) {
      if (!item.classroomId || !item.semesterId) {
        roomResults.push({
          groupId: item.groupId,
          roomName: item.roomName,
          classroomId: item.classroomId,
          success: false,
          count: 0,
          skippedCount: 0,
          enrolledExistingCount: 0,
          error: "ยังไม่ได้จับคู่ห้องเรียนหรือภาคเรียนปลายทาง",
        })
        failedRooms++
        continue
      }

      if (!item.students || item.students.length === 0) {
        roomResults.push({
          groupId: item.groupId,
          roomName: item.roomName,
          classroomId: item.classroomId,
          success: false,
          count: 0,
          skippedCount: 0,
          enrolledExistingCount: 0,
          error: "ไม่มีข้อมูลนักเรียนที่ถูกต้องในห้องนี้",
        })
        failedRooms++
        continue
      }

      const parsedBatch = studentImportBatchSchema.safeParse(item.students)
      if (!parsedBatch.success) {
        roomResults.push({
          groupId: item.groupId,
          roomName: item.roomName,
          classroomId: item.classroomId,
          success: false,
          count: 0,
          skippedCount: 0,
          enrolledExistingCount: 0,
          error: "ข้อมูลนักเรียนไม่ผ่านเกณฑ์การตรวจสอบ",
        })
        failedRooms++
        continue
      }

      let studentsToImport = parsedBatch.data as ParsedStudentRow[]
      if (duplicateMode === "skip") {
        const seen = new Set<string>()
        studentsToImport = studentsToImport.filter((s) => {
          if (seen.has(s.studentCode)) return false
          seen.add(s.studentCode)
          return true
        })
      }

      const rpcRes = await executeStudentImportRpc(
        item.classroomId,
        item.semesterId,
        studentsToImport,
        duplicateMode,
      )

      if (rpcRes.success) {
        successRooms++
        totalImported += rpcRes.count
        totalSkipped += rpcRes.skippedCount
        totalEnrolledExisting += rpcRes.enrolledExistingCount
        roomResults.push({
          groupId: item.groupId,
          roomName: item.roomName,
          classroomId: item.classroomId,
          success: true,
          count: rpcRes.count,
          skippedCount: rpcRes.skippedCount,
          enrolledExistingCount: rpcRes.enrolledExistingCount,
        })
      } else {
        failedRooms++
        roomResults.push({
          groupId: item.groupId,
          roomName: item.roomName,
          classroomId: item.classroomId,
          success: false,
          count: 0,
          skippedCount: 0,
          enrolledExistingCount: 0,
          error: rpcRes.error || "เกิดข้อผิดพลาดในการนำเข้า",
        })
      }
    }

    revalidatePath("/students")
    revalidatePath("/attendance")
    revalidatePath("/academics")
    revalidatePath("/settings/academic")
    revalidatePath("/")

    const summary: BatchImportSummaryResult = {
      totalRooms: payloads.length,
      successRooms,
      failedRooms,
      totalImported,
      totalSkipped,
      totalEnrolledExisting,
      roomResults,
    }

    return actionOk(`ประมวลผลการนำเข้าสำเร็จ ${successRooms}/${payloads.length} ห้อง`, {
      data: summary,
    })
  } catch (error) {
    console.error("executeBatchStudentImportAction error:", error)
    return actionFail("INTERNAL_ERROR", "เกิดข้อผิดพลาดในการประมวลผลการนำเข้าแบบกลุ่ม")
  }
}

