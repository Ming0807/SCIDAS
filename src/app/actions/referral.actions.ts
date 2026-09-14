"use server"

import { revalidatePath } from "next/cache"
import type { ActionResult } from "@/lib/server/action-result"
import { actionFail, actionOk } from "@/lib/server/action-result"
import { getCurrentSemesterId, getCurrentUserContext } from "@/lib/server/current-user"
import type { Database } from "@/types/database.types"
import { createClient } from "@/utils/supabase/server"

export type ReferralType = "internal" | "external"
export type SupportStatus = Database["public"]["Enums"]["support_status"]
export type SupportType = Database["public"]["Enums"]["support_type"]
export type SeverityLevel = Database["public"]["Enums"]["severity_level"]

export type ReferralListItem = {
  id: string
  student_id: string
  student_name: string
  student_code: string | null
  classroom_name: string | null
  support_type: SupportType
  referral_type: ReferralType
  target_agency: string
  title: string
  description: string
  status: SupportStatus
  priority: SeverityLevel | null
  created_at: string
  updated_at: string
  provider_name: string | null
}

export type ReferralDetail = {
  id: string
  school_id: string
  student_id: string
  semester_id: string
  support_type: SupportType
  title: string
  description: string
  action_plan: string | null
  provided_support: string | null
  resources_used: string | null
  external_referral: string | null
  status: SupportStatus
  priority: SeverityLevel | null
  started_at: string | null
  completed_at: string | null
  provided_by: string
  created_at: string
  updated_at: string
  referral_type: ReferralType
  target_agency: string
  student: {
    id: string
    first_name: string
    last_name: string
    student_code: string | null
    gender?: string | null
    date_of_birth?: string | null
    national_id?: string | null
    classroom?: {
      grade_level: number
      section: number
      name?: string | null
    } | null
  } | null
  provider: {
    id: string
    first_name: string
    last_name: string
  } | null
  followups: {
    id: string
    followup_date: string
    result: string | null
    description: string
    next_action: string | null
    next_followup_date: string | null
    follower_name?: string | null
  }[]
  canEdit: boolean
}

export type ReferralFilters = {
  type?: "all" | "internal" | "external"
  status?: string
  search?: string
  studentId?: string
}

function parseReferralTypeAndAgency(externalReferral: string | null): {
  referralType: ReferralType
  targetAgency: string
} {
  if (!externalReferral) {
    return { referralType: "internal", targetAgency: "งานแนะแนวภายในโรงเรียน" }
  }

  if (externalReferral.includes("[ส่งต่อภายใน]")) {
    return {
      referralType: "internal",
      targetAgency: externalReferral.replace("[ส่งต่อภายใน]", "").trim(),
    }
  }

  if (externalReferral.includes("[ส่งต่อภายนอก]")) {
    return {
      referralType: "external",
      targetAgency: externalReferral.replace("[ส่งต่อภายนอก]", "").trim(),
    }
  }

  return {
    referralType: "external",
    targetAgency: externalReferral.trim(),
  }
}

export async function getReferralsList(
  filters?: ReferralFilters,
): Promise<ActionResult<ReferralListItem[]>> {
  try {
    const context = await getCurrentUserContext()
    if (!context.schoolId) {
      return actionFail("UNAUTHORIZED", "ไม่พบข้อมูลโรงเรียนของผู้ใช้")
    }

    const client = await createClient()

    let query = client
      .from("support_records")
      .select(
        `
        id,
        student_id,
        support_type,
        title,
        description,
        external_referral,
        status,
        priority,
        created_at,
        updated_at,
        student:students(id, first_name, last_name, student_code, classroom:classrooms(name, grade_level, section)),
        provider:profiles!support_records_provided_by_fkey(id, first_name, last_name)
      `,
      )
      .eq("school_id", context.schoolId)

    if (filters?.studentId) {
      query = query.eq("student_id", filters.studentId)
    }

    if (filters?.status && filters.status !== "all") {
      query = query.eq("status", filters.status as SupportStatus)
    }

    const { data, error } = await query
      .or("status.eq.referred,external_referral.not.is.null")
      .order("updated_at", { ascending: false })

    if (error) {
      console.error("Error fetching referrals:", error)
      return actionFail("INTERNAL_ERROR", "ไม่สามารถดึงข้อมูลรายการส่งต่อได้")
    }

    type RawReferralRow = {
      id: string
      student_id: string
      support_type: SupportType
      title: string
      description: string
      external_referral: string | null
      status: SupportStatus
      priority: SeverityLevel | null
      created_at: string
      updated_at: string
      student: {
        id: string
        first_name: string
        last_name: string
        student_code: string | null
        classroom: { name: string | null; grade_level: number; section: number } | null
      } | null
      provider: {
        id: string
        first_name: string
        last_name: string
      } | null
    }

    const rows = (data as unknown as RawReferralRow[]) ?? []

    const items: ReferralListItem[] = rows
      .map((row) => {
        const { referralType, targetAgency } = parseReferralTypeAndAgency(row.external_referral)

        const student = row.student
        const studentName = student ? `${student.first_name} ${student.last_name}` : "ไม่ระบุชื่อ"
        const studentCode = student?.student_code ?? null

        let classroomName: string | null = null
        if (student?.classroom) {
          classroomName =
            student.classroom.name ?? `ม.${student.classroom.grade_level}/${student.classroom.section}`
        }

        const providerName = row.provider
          ? `${row.provider.first_name} ${row.provider.last_name}`
          : null

        return {
          id: row.id,
          student_id: row.student_id,
          student_name: studentName,
          student_code: studentCode,
          classroom_name: classroomName,
          support_type: row.support_type,
          referral_type: referralType,
          target_agency: targetAgency,
          title: row.title,
          description: row.description,
          status: row.status,
          priority: row.priority,
          created_at: row.created_at,
          updated_at: row.updated_at,
          provider_name: providerName,
        }
      })
      .filter((item) => {
        if (filters?.studentId && item.student_id !== filters.studentId) {
          return false
        }
        if (filters?.type && filters.type !== "all") {
          if (item.referral_type !== filters.type) return false
        }
        if (filters?.search) {
          const s = filters.search.toLowerCase()
          return (
            item.student_name.toLowerCase().includes(s) ||
            (item.student_code && item.student_code.toLowerCase().includes(s)) ||
            item.target_agency.toLowerCase().includes(s) ||
            item.title.toLowerCase().includes(s)
          )
        }
        return true
      })

    return actionOk("ดึงข้อมูลการส่งต่อสำเร็จ", { data: items })
  } catch (error) {
    console.error("Unexpected error in getReferralsList:", error)
    return actionFail("INTERNAL_ERROR", "เกิดข้อผิดพลาดไม่คาดคิดในการดึงข้อมูลรายการส่งต่อ")
  }
}

export async function getReferralDetail(id: string): Promise<ActionResult<ReferralDetail>> {
  try {
    const context = await getCurrentUserContext()
    if (!context.schoolId) {
      return actionFail("UNAUTHORIZED", "กรุณาเข้าสู่ระบบก่อนดำเนินการ")
    }

    const client = await createClient()

    const { data: rawRecord, error } = await client
      .from("support_records")
      .select(
        `
        id,
        school_id,
        student_id,
        semester_id,
        support_type,
        title,
        description,
        action_plan,
        provided_support,
        resources_used,
        external_referral,
        status,
        priority,
        started_at,
        completed_at,
        provided_by,
        created_at,
        updated_at,
        student:students(
          id,
          first_name,
          last_name,
          student_code,
          gender,
          date_of_birth,
          national_id,
          classroom:classrooms(grade_level, section, name)
        ),
        provider:profiles!support_records_provided_by_fkey(id, first_name, last_name)
      `,
      )
      .eq("id", id)
      .eq("school_id", context.schoolId)
      .maybeSingle()

    if (error || !rawRecord) {
      return actionFail("NOT_FOUND", "ไม่พบข้อมูลเคสการส่งต่อที่ระบุ")
    }

    // Fetch followups
    const { data: rawFollowups } = await client
      .from("support_followups")
      .select(
        `
        id,
        followup_date,
        result,
        description,
        next_action,
        next_followup_date,
        follower:profiles!support_followups_followed_by_fkey(first_name, last_name)
      `,
      )
      .eq("support_record_id", id)
      .order("followup_date", { ascending: false })

    type RawDetailRow = typeof rawRecord & {
      student: {
        id: string
        first_name: string
        last_name: string
        student_code: string | null
        gender?: string | null
        date_of_birth?: string | null
        national_id?: string | null
        classroom: { grade_level: number; section: number; name?: string | null } | null
      } | null
      provider: {
        id: string
        first_name: string
        last_name: string
      } | null
    }

    const record = rawRecord as unknown as RawDetailRow
    const { referralType, targetAgency } = parseReferralTypeAndAgency(record.external_referral)

    type RawFollowupRow = {
      id: string
      followup_date: string
      result: string | null
      description: string
      next_action: string | null
      next_followup_date: string | null
      follower: { first_name: string; last_name: string } | null
    }

    const followups = ((rawFollowups as unknown as RawFollowupRow[]) ?? []).map((f) => ({
      id: f.id,
      followup_date: f.followup_date,
      result: f.result,
      description: f.description,
      next_action: f.next_action,
      next_followup_date: f.next_followup_date,
      follower_name: f.follower ? `${f.follower.first_name} ${f.follower.last_name}` : null,
    }))

    const canEdit =
      context.role === "admin" ||
      context.role === "director" ||
      context.role === "counselor" ||
      record.provided_by === context.profileId

    return actionOk("ดึงข้อมูลเคสส่งต่อสำเร็จ", {
      data: {
        ...record,
        referral_type: referralType,
        target_agency: targetAgency,
        followups,
        canEdit,
      },
    })
  } catch (error) {
    console.error("Unexpected error in getReferralDetail:", error)
    return actionFail("INTERNAL_ERROR", "ไม่สามารถดึงข้อมูลรายละเอียดการส่งต่อได้")
  }
}

export type CreateReferralInput = {
  student_id: string
  referral_type: ReferralType
  target_agency: string
  support_type: SupportType
  title: string
  reason: string
  preliminary_action?: string
  priority?: SeverityLevel
  action_plan?: string
}

export async function createReferralAction(
  _prev: ActionResult<{ id: string }> | null,
  formData: FormData,
): Promise<ActionResult<{ id: string }>> {
  try {
    const context = await getCurrentUserContext()
    if (!context.profileId || !context.schoolId) {
      return actionFail("UNAUTHORIZED", "กรุณาเข้าสู่ระบบก่อนดำเนินการ")
    }

    const allowedRoles = new Set(["admin", "director", "counselor", "homeroom_teacher"])
    if (!allowedRoles.has(context.role)) {
      return actionFail("FORBIDDEN", "คุณไม่มีสิทธิ์สร้างการส่งต่อนักเรียน")
    }

    const studentId = formData.get("student_id")?.toString().trim()
    const referralType = (formData.get("referral_type")?.toString().trim() || "internal") as ReferralType
    const targetAgency = formData.get("target_agency")?.toString().trim()
    const supportType = (formData.get("support_type")?.toString().trim() || "other") as SupportType
    const title = formData.get("title")?.toString().trim()
    const reason = formData.get("reason")?.toString().trim()
    const preliminaryAction = formData.get("preliminary_action")?.toString().trim() || null
    const priority = (formData.get("priority")?.toString().trim() || "medium") as SeverityLevel
    const actionPlan = formData.get("action_plan")?.toString().trim() || null

    if (!studentId) {
      return actionFail("VALIDATION_ERROR", "กรุณาเลือกนักเรียน", {
        fieldErrors: { student_id: ["กรุณาเลือกนักเรียน"] },
      })
    }
    if (!targetAgency) {
      return actionFail("VALIDATION_ERROR", "กรุณาระบุหน่วยงานหรือบุคคลปลายทาง", {
        fieldErrors: { target_agency: ["กรุณาระบุหน่วยงานหรือบุคคลปลายทาง"] },
      })
    }
    if (!title) {
      return actionFail("VALIDATION_ERROR", "กรุณาระบุหัวข้อการส่งต่อ", {
        fieldErrors: { title: ["กรุณาระบุหัวข้อการส่งต่อ"] },
      })
    }
    if (!reason) {
      return actionFail("VALIDATION_ERROR", "กรุณาระบุเหตุผลและข้อบ่งชี้ในการส่งต่อ", {
        fieldErrors: { reason: ["กรุณาระบุเหตุผลและข้อบ่งชี้ในการส่งต่อ"] },
      })
    }

    const client = await createClient()

    // Verify student exists in current school
    const { data: student } = await client
      .from("students")
      .select("id")
      .eq("id", studentId)
      .eq("school_id", context.schoolId)
      .maybeSingle()

    if (!student) {
      return actionFail("VALIDATION_ERROR", "นักเรียนไม่อยู่ในโรงเรียนนี้")
    }

    const semesterId = await getCurrentSemesterId(context.schoolId)
    if (!semesterId) {
      return actionFail("VALIDATION_ERROR", "ไม่พบภาคการศึกษาปัจจุบันในระบบ")
    }

    const externalReferralString = `[${referralType === "internal" ? "ส่งต่อภายใน" : "ส่งต่อภายนอก"}] ${targetAgency}`

    const insertData = {
      student_id: studentId,
      semester_id: semesterId,
      school_id: context.schoolId,
      support_type: supportType,
      priority,
      title,
      description: reason,
      action_plan: actionPlan,
      provided_support: preliminaryAction,
      external_referral: externalReferralString,
      status: "referred" as const,
      provided_by: context.profileId,
      started_at: new Date().toISOString(),
    }

    const { data, error } = await client
      .from("support_records")
      .insert(insertData)
      .select("id")
      .single()

    if (error || !data) {
      console.error("Error creating referral record:", error)
      return actionFail("INTERNAL_ERROR", "ไม่สามารถบันทึกการส่งต่อนักเรียนได้")
    }

    revalidatePath("/referrals")
    revalidatePath("/support")
    revalidatePath(`/students/${studentId}`)

    return actionOk("บันทึกการส่งต่อนักเรียนสำเร็จ", { data: { id: data.id } })
  } catch (error) {
    console.error("Unexpected error in createReferralAction:", error)
    return actionFail("INTERNAL_ERROR", "เกิดข้อผิดพลาดไม่คาดคิดในการบันทึกการส่งต่อ")
  }
}

export async function updateReferralStatusAction(
  referralId: string,
  newStatus: SupportStatus,
  followupNote?: string,
): Promise<ActionResult<{ id: string }>> {
  try {
    const context = await getCurrentUserContext()
    if (!context.profileId || !context.schoolId) {
      return actionFail("UNAUTHORIZED", "กรุณาเข้าสู่ระบบก่อนดำเนินการ")
    }

    const client = await createClient()

    const updatePayload: Database["public"]["Tables"]["support_records"]["Update"] = {
      status: newStatus,
      updated_at: new Date().toISOString(),
    }

    if (newStatus === "completed") {
      updatePayload.completed_at = new Date().toISOString()
    }

    const { error } = await client
      .from("support_records")
      .update(updatePayload)
      .eq("id", referralId)
      .eq("school_id", context.schoolId)

    if (error) {
      console.error("Error updating referral status:", error)
      return actionFail("INTERNAL_ERROR", "ไม่สามารถอัปเดตสถานะการส่งต่อได้")
    }

    // Add followup log if provided
    if (followupNote && followupNote.trim().length > 0) {
      await client.from("support_followups").insert({
        support_record_id: referralId,
        followed_by: context.profileId,
        followup_date: new Date().toISOString().slice(0, 10),
        description: followupNote.trim(),
        result: `อัปเดตสถานะเป็น: ${newStatus}`,
      })
    }

    revalidatePath("/referrals")
    revalidatePath(`/referrals/${referralId}`)
    revalidatePath("/support")

    return actionOk("อัปเดตสถานะการส่งต่อสำเร็จ", { data: { id: referralId } })
  } catch (error) {
    console.error("Unexpected error in updateReferralStatusAction:", error)
    return actionFail("INTERNAL_ERROR", "เกิดข้อผิดพลาดในการอัปเดตสถานะการส่งต่อ")
  }
}
