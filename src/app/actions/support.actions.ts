"use server"

import { revalidatePath } from "next/cache"

import type { ActionResult } from "@/lib/server/action-result"
import { actionFail, actionOk } from "@/lib/server/action-result"
import { getCurrentSemesterId, getCurrentUserContext } from "@/lib/server/current-user"
import type { Database, Tables, TablesUpdate } from "@/types/database.types"
import { createClient } from "@/utils/supabase/server"

type SeverityLevel = Database["public"]["Enums"]["severity_level"]
export type SupportStatus = Database["public"]["Enums"]["support_status"]
export type SupportType = Database["public"]["Enums"]["support_type"]

export type SupportActionData = { id: string; status?: SupportStatus }

type RelatedStudent = {
  id: string
  first_name: string
  last_name: string
  student_code: string | null
}

type RelatedProfile = {
  id: string
  first_name: string
  last_name: string
}

export type SupportCase = Pick<
  Tables<"support_records">,
  | "id"
  | "school_id"
  | "student_id"
  | "semester_id"
  | "support_type"
  | "title"
  | "description"
  | "action_plan"
  | "provided_support"
  | "resources_used"
  | "external_referral"
  | "status"
  | "priority"
  | "started_at"
  | "completed_at"
  | "provided_by"
  | "approved_by"
  | "created_at"
  | "updated_at"
> & {
  student: RelatedStudent | null
  provider: RelatedProfile | null
  canEdit: boolean
}

export type SupportRecordListItem = Pick<
  SupportCase,
  | "id"
  | "student_id"
  | "support_type"
  | "title"
  | "status"
  | "priority"
  | "completed_at"
  | "created_at"
  | "updated_at"
> & {
  student: RelatedStudent | null
  provider: RelatedProfile | null
}

type SupportQueryRow = Tables<"support_records"> & {
  students: RelatedStudent | null
  profiles: RelatedProfile | null
}

const supportEditors = new Set(["admin", "homeroom_teacher", "counselor"])
const supportStatuses: SupportStatus[] = [
  "pending",
  "in_progress",
  "completed",
  "cancelled",
  "referred",
]
const supportTypes: SupportType[] = [
  "academic",
  "behavioral",
  "emotional",
  "financial",
  "health",
  "family",
  "social",
  "other",
]
const severityLevels: SeverityLevel[] = ["low", "medium", "high", "critical"]

const allowedTransitions: Record<SupportStatus, SupportStatus[]> = {
  pending: ["in_progress", "cancelled", "referred"],
  in_progress: ["pending", "completed", "cancelled", "referred"],
  completed: ["in_progress", "referred"],
  cancelled: ["pending", "referred"],
  referred: ["in_progress", "completed", "cancelled"],
}

const supportSelect =
  "id, school_id, student_id, semester_id, support_type, title, description, action_plan, provided_support, resources_used, external_referral, status, priority, started_at, completed_at, provided_by, approved_by, created_at, updated_at, student:students(id, first_name, last_name, student_code), provider:profiles!support_records_provided_by_fkey(id, first_name, last_name)"

function getFormString(formData: FormData, name: string): string {
  const value = formData.get(name)
  return typeof value === "string" ? value.trim() : ""
}

function getOptionalFormString(formData: FormData, name: string): string | undefined {
  return formData.has(name) ? getFormString(formData, name) : undefined
}

function isValidDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const date = new Date(`${value}T00:00:00.000Z`)
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
}

function actionFailureFromError(error: unknown, fallbackMessage: string): ActionResult<SupportActionData> {
  if (error instanceof Error) {
    if (error.message === "UNAUTHORIZED") {
      return actionFail("UNAUTHORIZED", "กรุณาเข้าสู่ระบบก่อนดำเนินการ")
    }
    if (error.message === "FORBIDDEN") {
      return actionFail("FORBIDDEN", "คุณไม่มีสิทธิ์ดำเนินการนี้")
    }
  }

  return actionFail("INTERNAL_ERROR", fallbackMessage)
}

function readSupportCase(row: SupportQueryRow, canEdit = false): SupportCase {
  const { students, profiles, ...caseFields } = row
  return { ...caseFields, student: students, provider: profiles, canEdit }
}

async function requireSupportEditor(): Promise<
  | { ok: true; context: Awaited<ReturnType<typeof getCurrentUserContext>> & { profileId: string } }
  | { ok: false; result: ActionResult<SupportActionData> }
> {
  try {
    const context = await getCurrentUserContext()
    const profileId = context.profileId

    if (!profileId) {
      return { ok: false, result: actionFail("UNAUTHORIZED", "กรุณาเข้าสู่ระบบก่อนดำเนินการ") }
    }

    if (!supportEditors.has(context.role)) {
      return { ok: false, result: actionFail("FORBIDDEN", "คุณไม่มีสิทธิ์จัดการเคสช่วยเหลือ") }
    }

    return { ok: true, context: { ...context, profileId } }
  } catch (error) {
    return { ok: false, result: actionFailureFromError(error, "ไม่สามารถตรวจสอบสิทธิ์ผู้ใช้ได้") }
  }
}

async function verifyStudentInSchool(
  client: Awaited<ReturnType<typeof createClient>>,
  studentId: string,
  schoolId: string,
): Promise<ActionResult<SupportActionData> | null> {
  const { data, error } = await client
    .from("students")
    .select("id")
    .eq("id", studentId)
    .eq("school_id", schoolId)
    .maybeSingle()

  if (error) return actionFail("INTERNAL_ERROR", "ไม่สามารถตรวจสอบข้อมูลนักเรียนได้")
  if (!data) {
    return actionFail("FORBIDDEN", "นักเรียนที่เลือกไม่อยู่ในโรงเรียนปัจจุบัน", {
      fieldErrors: { student_id: ["นักเรียนที่เลือกไม่อยู่ในโรงเรียนปัจจุบัน"] },
    })
  }

  return null
}

async function verifySemesterInSchool(
  client: Awaited<ReturnType<typeof createClient>>,
  semesterId: string,
  schoolId: string,
): Promise<ActionResult<SupportActionData> | null> {
  const { data, error } = await client
    .from("semesters")
    .select("id")
    .eq("id", semesterId)
    .eq("school_id", schoolId)
    .maybeSingle()

  if (error) return actionFail("INTERNAL_ERROR", "ไม่สามารถตรวจสอบภาคการศึกษาได้")
  if (!data) {
    return actionFail("FORBIDDEN", "ภาคการศึกษาที่เลือกไม่อยู่ในโรงเรียนปัจจุบัน", {
      fieldErrors: { semester_id: ["ภาคการศึกษาที่เลือกไม่อยู่ในโรงเรียนปัจจุบัน"] },
    })
  }

  return null
}

function validateCommonFields(
  formData: FormData,
  { requireAll }: { requireAll: boolean },
): ActionResult<SupportActionData> | null {
  const studentId = getOptionalFormString(formData, "student_id")
  const supportType = getOptionalFormString(formData, "support_type") as SupportType | undefined
  const priority = getOptionalFormString(formData, "priority") as SeverityLevel | undefined
  const title = getOptionalFormString(formData, "title")
  const description = getOptionalFormString(formData, "description")
  const fieldErrors: Record<string, string[]> = {}

  if (requireAll || studentId !== undefined) {
    if (!studentId) fieldErrors.student_id = ["กรุณาเลือกนักเรียน"]
  }
  if (requireAll || supportType !== undefined) {
    if (!supportType || !supportTypes.includes(supportType)) {
      fieldErrors.support_type = ["กรุณาเลือกหมวดหมู่ความช่วยเหลือ"]
    }
  }
  if (requireAll || priority !== undefined) {
    if (!priority || !severityLevels.includes(priority)) {
      fieldErrors.priority = ["กรุณาเลือกระดับความเร่งด่วน"]
    }
  }
  if (requireAll || title !== undefined) {
    if (!title) fieldErrors.title = ["กรุณากรอกหัวข้อ"]
    else if (title.length > 255) fieldErrors.title = ["หัวข้อต้องมีความยาวไม่เกิน 255 ตัวอักษร"]
  }
  if (requireAll || description !== undefined) {
    if (!description) fieldErrors.description = ["กรุณากรอกรายละเอียดเคส"]
    else if (description.length > 10000) fieldErrors.description = ["รายละเอียดต้องมีความยาวไม่เกิน 10,000 ตัวอักษร"]
  }

  const startedAt = getOptionalFormString(formData, "started_at")
  if (startedAt !== undefined && startedAt !== "" && !isValidDate(startedAt)) {
    fieldErrors.started_at = ["วันที่เริ่มต้นไม่ถูกต้อง"]
  }

  if (Object.keys(fieldErrors).length > 0) {
    return actionFail("VALIDATION_ERROR", "กรุณาตรวจสอบข้อมูลเคส", { fieldErrors })
  }

  return null
}

function validateStatus(value: string): value is SupportStatus {
  return supportStatuses.includes(value as SupportStatus)
}

function revalidateSupportRoutes(id?: string, studentId?: string) {
  revalidatePath("/support")
  revalidatePath("/support/new")
  if (id) {
    revalidatePath(`/support/${id}`)
    revalidatePath(`/support/${id}/edit`)
  }
  if (studentId) revalidatePath(`/students/${studentId}`)
}

export async function getSupportRecords(): Promise<ActionResult<SupportRecordListItem[]>> {
  try {
    const context = await getCurrentUserContext()
    if (context.role === "student" || !context.profileId) {
      return actionFail("FORBIDDEN", "คุณไม่มีสิทธิ์ดูเคสช่วยเหลือ")
    }

    const client = await createClient()
    const { data, error } = await client
      .from("support_records")
      .select(supportSelect)
      .eq("school_id", context.schoolId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching support records:", error)
      return actionFail("INTERNAL_ERROR", "ไม่สามารถโหลดรายการเคสช่วยเหลือได้")
    }

    const records = (data as unknown as SupportQueryRow[]).map((row) => {
      const record = readSupportCase(row, supportEditors.has(context.role))
      return {
        id: record.id,
        student_id: record.student_id,
        support_type: record.support_type,
        title: record.title,
        status: record.status,
        priority: record.priority,
        completed_at: record.completed_at,
        created_at: record.created_at,
        updated_at: record.updated_at,
        student: record.student,
        provider: record.provider,
      }
    })

    return actionOk("โหลดรายการเคสสำเร็จ", { data: records })
  } catch (error) {
    const result = actionFailureFromError(error, "ไม่สามารถโหลดรายการเคสช่วยเหลือได้")
    return result as ActionResult<SupportRecordListItem[]>
  }
}

export async function getSupportRecord(id: string): Promise<ActionResult<SupportCase>> {
  try {
    const context = await getCurrentUserContext()
    if (context.role === "student" || !context.profileId) {
      return actionFail("FORBIDDEN", "คุณไม่มีสิทธิ์ดูเคสช่วยเหลือ")
    }

    const client = await createClient()
    const { data, error } = await client
      .from("support_records")
      .select(supportSelect)
      .eq("id", id)
      .eq("school_id", context.schoolId)
      .maybeSingle()

    if (error) {
      console.error("Error fetching support record:", error)
      return actionFail("INTERNAL_ERROR", "ไม่สามารถโหลดรายละเอียดเคสได้")
    }
    if (!data) return actionFail("NOT_FOUND", "ไม่พบเคสช่วยเหลือในโรงเรียนปัจจุบัน")

    return actionOk("โหลดรายละเอียดเคสสำเร็จ", {
      data: readSupportCase(data as unknown as SupportQueryRow, supportEditors.has(context.role)),
    })
  } catch (error) {
    const result = actionFailureFromError(error, "ไม่สามารถโหลดรายละเอียดเคสได้")
    return result as ActionResult<SupportCase>
  }
}

export async function createSupportRecord(
  _prev: ActionResult<SupportActionData> | null,
  formData: FormData,
): Promise<ActionResult<SupportActionData>> {
  const access = await requireSupportEditor()
  if (!access.ok) return access.result

  try {
    const validationError = validateCommonFields(formData, { requireAll: true })
    if (validationError) return validationError

    const context = access.context
    const providedBy = context.profileId
    const studentId = getFormString(formData, "student_id")
    const supportType = getFormString(formData, "support_type") as SupportType
    const priority = getFormString(formData, "priority") as SeverityLevel
    const title = getFormString(formData, "title")
    const description = getFormString(formData, "description")
    const client = await createClient()

    const studentError = await verifyStudentInSchool(client, studentId, context.schoolId)
    if (studentError) return studentError

    const semesterId = await getCurrentSemesterId(context.schoolId)
    if (!semesterId) return actionFail("VALIDATION_ERROR", "ไม่พบภาคการศึกษาปัจจุบันในระบบ")

    const semesterError = await verifySemesterInSchool(client, semesterId, context.schoolId)
    if (semesterError) return semesterError

    const insertData = {
      student_id: studentId,
      semester_id: semesterId,
      school_id: context.schoolId,
      support_type: supportType,
      priority,
      title,
      description,
      action_plan: getOptionalFormString(formData, "action_plan") || null,
      provided_support: getOptionalFormString(formData, "provided_support") || null,
      resources_used: getOptionalFormString(formData, "resources_used") || null,
      external_referral: getOptionalFormString(formData, "external_referral") || null,
      provided_by: providedBy,
      status: "pending" as const,
    }

    const { data, error } = await client.from("support_records").insert(insertData).select("id").single()
    if (error) {
      console.error("Error creating support record:", error)
      return error.code === "42501"
        ? actionFail("FORBIDDEN", "คุณไม่มีสิทธิ์สร้างเคสช่วยเหลือในโรงเรียนนี้")
        : actionFail("INTERNAL_ERROR", "ไม่สามารถสร้างเคสช่วยเหลือได้")
    }

    revalidateSupportRoutes(data.id, studentId)
    return actionOk("สร้างเคสช่วยเหลือสำเร็จ", {
      data: { id: data.id, status: "pending" },
      redirectTo: `/support/${data.id}`,
    })
  } catch (error) {
    return actionFailureFromError(error, "ไม่สามารถสร้างเคสช่วยเหลือได้")
  }
}

export async function updateSupportRecord(
  _prev: ActionResult<SupportActionData> | null,
  formData: FormData,
): Promise<ActionResult<SupportActionData>> {
  const access = await requireSupportEditor()
  if (!access.ok) return access.result

  try {
    const id = getFormString(formData, "id")
    if (!id) {
      return actionFail("VALIDATION_ERROR", "ไม่พบรหัสเคส", { fieldErrors: { id: ["ไม่พบรหัสเคส"] } })
    }

    const validationError = validateCommonFields(formData, { requireAll: false })
    if (validationError) return validationError

    const client = await createClient()
    const { data: existingData, error: existingError } = await client
      .from("support_records")
      .select("*")
      .eq("id", id)
      .eq("school_id", access.context.schoolId)
      .maybeSingle()

    if (existingError) {
      console.error("Error loading support record for update:", existingError)
      return actionFail("INTERNAL_ERROR", "ไม่สามารถตรวจสอบเคสก่อนแก้ไขได้")
    }
    if (!existingData) return actionFail("NOT_FOUND", "ไม่พบเคสช่วยเหลือในโรงเรียนปัจจุบัน")

    const studentId = getOptionalFormString(formData, "student_id") ?? existingData.student_id
    const semesterId = getOptionalFormString(formData, "semester_id") ?? existingData.semester_id
    const studentError = await verifyStudentInSchool(client, studentId, access.context.schoolId)
    if (studentError) return studentError
    const semesterError = await verifySemesterInSchool(client, semesterId, access.context.schoolId)
    if (semesterError) return semesterError

    const requestedStatus = getOptionalFormString(formData, "status")
    let nextStatus = existingData.status
    if (requestedStatus !== undefined) {
      if (!validateStatus(requestedStatus)) {
        return actionFail("VALIDATION_ERROR", "สถานะเคสไม่ถูกต้อง", {
          fieldErrors: { status: ["สถานะเคสไม่ถูกต้อง"] },
        })
      }
      if (requestedStatus !== existingData.status && !allowedTransitions[existingData.status].includes(requestedStatus)) {
        return actionFail("CONFLICT", "ไม่สามารถเปลี่ยนสถานะเคสตามลำดับนี้ได้", {
          fieldErrors: { status: ["สถานะปัจจุบันไม่อนุญาตให้เปลี่ยนเป็นสถานะนี้"] },
        })
      }
      nextStatus = requestedStatus
    }

    const updateData: TablesUpdate<"support_records"> = {
      student_id: studentId,
      semester_id: semesterId,
      support_type:
        (getOptionalFormString(formData, "support_type") as SupportType | undefined) ?? existingData.support_type,
      priority:
        (getOptionalFormString(formData, "priority") as SeverityLevel | undefined) ?? existingData.priority,
      title: getOptionalFormString(formData, "title") ?? existingData.title,
      description: getOptionalFormString(formData, "description") ?? existingData.description,
      status: nextStatus,
      completed_at:
        nextStatus === "completed"
          ? existingData.status === "completed" && existingData.completed_at
            ? existingData.completed_at
            : new Date().toISOString().slice(0, 10)
          : null,
    }

    for (const field of ["action_plan", "provided_support", "resources_used", "external_referral"] as const) {
      const value = getOptionalFormString(formData, field)
      if (value !== undefined) updateData[field] = value || null
    }

    const startedAt = getOptionalFormString(formData, "started_at")
    if (startedAt !== undefined) updateData.started_at = startedAt || null
    if (nextStatus === "in_progress" && !existingData.started_at && startedAt === undefined) {
      updateData.started_at = new Date().toISOString().slice(0, 10)
    }

    const { data, error } = await client
      .from("support_records")
      .update(updateData)
      .eq("id", id)
      .eq("school_id", access.context.schoolId)
      .select("id, status")
      .single()

    if (error) {
      console.error("Error updating support record:", error)
      return error.code === "42501"
        ? actionFail("FORBIDDEN", "คุณไม่มีสิทธิ์แก้ไขเคสช่วยเหลือในโรงเรียนนี้")
        : actionFail("INTERNAL_ERROR", "ไม่สามารถแก้ไขเคสช่วยเหลือได้")
    }

    revalidateSupportRoutes(data.id, studentId)
    return actionOk("แก้ไขเคสช่วยเหลือสำเร็จ", {
      data: { id: data.id, status: data.status },
      redirectTo: `/support/${data.id}`,
    })
  } catch (error) {
    return actionFailureFromError(error, "ไม่สามารถแก้ไขเคสช่วยเหลือได้")
  }
}

export async function transitionSupportRecord(
  _prev: ActionResult<SupportActionData> | null,
  formData: FormData,
): Promise<ActionResult<SupportActionData>> {
  const id = getFormString(formData, "id")
  const status = getFormString(formData, "status")

  if (!id || !status) {
    return actionFail("VALIDATION_ERROR", "กรุณาระบุเคสและสถานะใหม่", {
      fieldErrors: {
        ...(id ? {} : { id: ["ไม่พบรหัสเคส"] }),
        ...(status ? {} : { status: ["กรุณาเลือกสถานะใหม่"] }),
      },
    })
  }
  if (!validateStatus(status)) {
    return actionFail("VALIDATION_ERROR", "สถานะเคสไม่ถูกต้อง", {
      fieldErrors: { status: ["สถานะเคสไม่ถูกต้อง"] },
    })
  }

  const nextFormData = new FormData()
  nextFormData.set("id", id)
  nextFormData.set("status", status)
  return updateSupportRecord(_prev, nextFormData)
}

export async function updateSupportStatus(
  prev: ActionResult<SupportActionData> | null,
  formData: FormData,
): Promise<ActionResult<SupportActionData>> {
  return transitionSupportRecord(prev, formData)
}

export async function createSupportRecordFormAction(
  prev: ActionResult<SupportActionData> | null,
  formData: FormData,
): Promise<ActionResult<SupportActionData>> {
  return createSupportRecord(prev, formData)
}
