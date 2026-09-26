"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"

import type { ActionResult } from "@/lib/server/action-result"
import { actionFail, actionOk } from "@/lib/server/action-result"
import { createAdminClient } from "@/lib/server/admin-client"
import { logAudit } from "@/lib/server/audit-logger"
import { getCurrentUserContext } from "@/lib/server/current-user"
import type { Database } from "@/types/database.types"
import { createClient } from "@/utils/supabase/server"

export type UserRole = Database["public"]["Enums"]["user_role"]

const LEADERSHIP_ROLES = new Set(["admin", "director"])

const UpdateStaffRoleSchema = z.object({
  profileId: z.string().uuid("รหัสบุคลากรไม่ถูกต้อง"),
  newRole: z.enum(["admin", "director", "counselor", "homeroom_teacher", "subject_teacher"] as const, {
    message: "บทบาทสิทธิ์ไม่ถูกต้อง",
  }),
})

const UpdateStaffStatusSchema = z.object({
  profileId: z.string().uuid("รหัสบุคลากรไม่ถูกต้อง"),
  isActive: z.boolean(),
})

const AssignHomeroomSchema = z.object({
  classroomId: z.string().uuid("รหัสห้องเรียนไม่ถูกต้อง"),
  homeroomTeacherId: z.string().uuid("รหัสครูประจำชั้นไม่ถูกต้อง").nullable(),
  coTeacherId: z.string().uuid("รหัสครูผู้ช่วยไม่ถูกต้อง").nullable().optional(),
})

const InviteStaffSchema = z.object({
  email: z.string().trim().email("รูปแบบอีเมลไม่ถูกต้อง").max(255),
  firstName: z.string().trim().min(1, "กรุณาระบุชื่อ").max(100),
  lastName: z.string().trim().min(1, "กรุณาระบุนามสกุล").max(100),
  role: z.enum(["admin", "director", "counselor", "homeroom_teacher", "subject_teacher"] as const, {
    message: "บทบาทสิทธิ์ไม่ถูกต้อง",
  }),
})

const RemoveStaffSchema = z.object({
  profileId: z.string().uuid("รหัสบุคลากรไม่ถูกต้อง"),
})

export async function updateStaffRoleAction(
  input: z.infer<typeof UpdateStaffRoleSchema>,
): Promise<ActionResult<{ profileId: string; role: UserRole }>> {
  try {
    const context = await getCurrentUserContext()
    if (!context.schoolId || !context.profileId) {
      return actionFail("UNAUTHORIZED", "กรุณาเข้าสู่ระบบก่อนดำเนินการ")
    }

    if (!LEADERSHIP_ROLES.has(context.role)) {
      return actionFail(
        "FORBIDDEN",
        "เฉพาะผู้ดูแลระบบหรือผู้อำนวยการเท่านั้นที่สามารถปรับเปลี่ยนบทบาทและสิทธิ์ของบุคลากรได้",
      )
    }

    const parsed = UpdateStaffRoleSchema.safeParse(input)
    if (!parsed.success) {
      return actionFail("VALIDATION_ERROR", parsed.error.issues[0]?.message || "ข้อมูลไม่ถูกต้อง")
    }

    const { profileId, newRole } = parsed.data

    // Guardrail: prevent self-demotion from admin
    if (context.profileId === profileId && context.role === "admin" && newRole !== "admin") {
      return actionFail(
        "CONFLICT",
        "ไม่สามารถลดสิทธิ์ผู้ดูแลระบบของตนเองได้ เพื่อป้องกันการสูญเสียสิทธิ์ในการจัดการระบบ",
      )
    }

    const supabase = await createClient()

    // Fetch existing profile to log audit
    const profileQuery = supabase
      .from("profiles")
      .select("id, role, first_name, last_name, school_id")
      .eq("id", profileId)
      .eq("school_id", context.schoolId)

    const { data: existingProfile, error: fetchError } =
      typeof profileQuery.maybeSingle === "function"
        ? await profileQuery.maybeSingle()
        : await profileQuery.single()

    if (fetchError || !existingProfile) {
      return actionFail("NOT_FOUND", "ไม่พบข้อมูลบุคลากรในโรงเรียนนี้")
    }

    const oldRole = existingProfile.role

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        role: newRole,
        updated_at: new Date().toISOString(),
      })
      .eq("id", profileId)
      .eq("school_id", context.schoolId)

    if (updateError) {
      console.error("[staff.actions] updateStaffRoleAction error:", updateError)
      return actionFail(
        "INTERNAL_ERROR",
        `ไม่สามารถปรับเปลี่ยนบทบาทได้: ${updateError.message} (กรุณาตรวจสอบว่าบัญชีของคุณมีสิทธิ์ admin ในระบบ Supabase หรือไม่)`,
      )
    }

    // Log security audit for role changes
    await logAudit({
      action: "UPDATE",
      tableName: "profiles",
      recordId: profileId,
      schoolId: context.schoolId,
      userId: context.userId,
      oldData: { role: oldRole },
      newData: { role: newRole },
    })

    revalidatePath("/settings/staff")
    revalidatePath("/settings")
    revalidatePath("/settings/academic")

    return actionOk("ปรับเปลี่ยนบทบาทและสิทธิ์เรียบร้อยแล้ว", {
      data: { profileId, role: newRole },
    })
  } catch (error) {
    console.error("Error in updateStaffRoleAction:", error)
    return actionFail("INTERNAL_ERROR", "เกิดข้อผิดพลาดในการปรับเปลี่ยนบทบาทบุคลากร")
  }
}

export async function updateStaffStatusAction(
  input: z.infer<typeof UpdateStaffStatusSchema>,
): Promise<ActionResult<{ profileId: string; isActive: boolean }>> {
  try {
    const context = await getCurrentUserContext()
    if (!context.schoolId || !context.profileId) {
      return actionFail("UNAUTHORIZED", "กรุณาเข้าสู่ระบบก่อนดำเนินการ")
    }

    if (!LEADERSHIP_ROLES.has(context.role)) {
      return actionFail(
        "FORBIDDEN",
        "เฉพาะผู้ดูแลระบบหรือผู้อำนวยการเท่านั้นที่สามารถเปิด/ระงับสถานะการใช้งานของบุคลากรได้",
      )
    }

    const parsed = UpdateStaffStatusSchema.safeParse(input)
    if (!parsed.success) {
      return actionFail("VALIDATION_ERROR", parsed.error.issues[0]?.message || "ข้อมูลไม่ถูกต้อง")
    }

    const { profileId, isActive } = parsed.data

    // Guardrail: prevent self-deactivation
    if (context.profileId === profileId && !isActive) {
      return actionFail("CONFLICT", "ไม่สามารถระงับการใช้งานบัญชีของตนเองได้")
    }

    const supabase = await createClient()

    const statusQuery = supabase
      .from("profiles")
      .select("id, is_active, first_name, last_name")
      .eq("id", profileId)
      .eq("school_id", context.schoolId)

    const { data: existingProfile, error: fetchError } =
      typeof statusQuery.maybeSingle === "function"
        ? await statusQuery.maybeSingle()
        : await statusQuery.single()

    if (fetchError || !existingProfile) {
      return actionFail("NOT_FOUND", "ไม่พบข้อมูลบุคลากรในโรงเรียนนี้")
    }

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        is_active: isActive,
        updated_at: new Date().toISOString(),
      })
      .eq("id", profileId)
      .eq("school_id", context.schoolId)

    if (updateError) {
      return actionFail("INTERNAL_ERROR", `ไม่สามารถอัปเดตสถานะได้: ${updateError.message}`)
    }

    await logAudit({
      action: "UPDATE",
      tableName: "profiles",
      recordId: profileId,
      schoolId: context.schoolId,
      userId: context.userId,
      oldData: { is_active: existingProfile.is_active },
      newData: { is_active: isActive },
    })

    revalidatePath("/settings/staff")
    revalidatePath("/settings")

    return actionOk(
      isActive ? "เปิดใช้งานบัญชีบุคลากรเรียบร้อยแล้ว" : "ระงับการใช้งานบัญชีบุคลากรเรียบร้อยแล้ว",
      { data: { profileId, isActive } },
    )
  } catch (error) {
    console.error("Error in updateStaffStatusAction:", error)
    return actionFail("INTERNAL_ERROR", "เกิดข้อผิดพลาดในการอัปเดตสถานะบุคลากร")
  }
}

export async function assignHomeroomTeacherAction(
  input: z.infer<typeof AssignHomeroomSchema>,
): Promise<ActionResult<{ classroomId: string }>> {
  try {
    const context = await getCurrentUserContext()
    if (!context.schoolId) {
      return actionFail("UNAUTHORIZED", "กรุณาเข้าสู่ระบบก่อนดำเนินการ")
    }

    if (!LEADERSHIP_ROLES.has(context.role)) {
      return actionFail(
        "FORBIDDEN",
        "เฉพาะผู้ดูแลระบบหรือผู้อำนวยการเท่านั้นที่สามารถมอบหมายครูประจำชั้นได้",
      )
    }

    const parsed = AssignHomeroomSchema.safeParse(input)
    if (!parsed.success) {
      return actionFail("VALIDATION_ERROR", parsed.error.issues[0]?.message || "ข้อมูลไม่ถูกต้อง")
    }

    const { classroomId, homeroomTeacherId, coTeacherId } = parsed.data

    const supabase = await createClient()

    const { data: existingClassroom, error: fetchError } = await supabase
      .from("classrooms")
      .select("id, name, homeroom_teacher_id, co_teacher_id")
      .eq("id", classroomId)
      .eq("school_id", context.schoolId)
      .single()

    if (fetchError || !existingClassroom) {
      return actionFail("NOT_FOUND", "ไม่พบข้อมูลห้องเรียนในโรงเรียนนี้")
    }

    const { error: updateError } = await supabase
      .from("classrooms")
      .update({
        homeroom_teacher_id: homeroomTeacherId,
        co_teacher_id: coTeacherId ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", classroomId)
      .eq("school_id", context.schoolId)

    if (updateError) {
      return actionFail("INTERNAL_ERROR", `ไม่สามารถมอบหมายครูประจำชั้นได้: ${updateError.message}`)
    }

    await logAudit({
      action: "UPDATE",
      tableName: "classrooms",
      recordId: classroomId,
      schoolId: context.schoolId,
      userId: context.userId,
      oldData: {
        homeroom_teacher_id: existingClassroom.homeroom_teacher_id,
        co_teacher_id: existingClassroom.co_teacher_id,
      },
      newData: {
        homeroom_teacher_id: homeroomTeacherId,
        co_teacher_id: coTeacherId ?? null,
      },
    })

    revalidatePath("/settings/staff")
    revalidatePath("/settings/academic")
    revalidatePath("/screening")
    revalidatePath("/attendance")

    return actionOk("มอบหมายครูประจำชั้นเรียบร้อยแล้ว", {
      data: { classroomId },
    })
  } catch (error) {
    console.error("Error in assignHomeroomTeacherAction:", error)
    return actionFail("INTERNAL_ERROR", "เกิดข้อผิดพลาดในการมอบหมายครูประจำชั้น")
  }
}

function generateTempPassword(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789"
  const bytes = crypto.getRandomValues(new Uint8Array(12))
  return Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("")
}

export async function inviteStaffAction(
  input: z.infer<typeof InviteStaffSchema>,
): Promise<ActionResult<{ profileId: string; tempPassword: string }>> {
  try {
    const context = await getCurrentUserContext()
    if (!context.schoolId || !context.profileId) {
      return actionFail("UNAUTHORIZED", "กรุณาเข้าสู่ระบบก่อนดำเนินการ")
    }

    if (!LEADERSHIP_ROLES.has(context.role)) {
      return actionFail(
        "FORBIDDEN",
        "เฉพาะผู้ดูแลระบบหรือผู้อำนวยการเท่านั้นที่สามารถเพิ่มบุคลากรได้",
      )
    }

    const parsed = InviteStaffSchema.safeParse(input)
    if (!parsed.success) {
      return actionFail("VALIDATION_ERROR", parsed.error.issues[0]?.message || "ข้อมูลไม่ถูกต้อง")
    }

    const { email, firstName, lastName, role } = parsed.data
    const normalizedEmail = email.toLowerCase()

    const supabase = await createClient()
    const { data: existing } = await supabase
      .from("profiles")
      .select("id")
      .eq("school_id", context.schoolId)
      .eq("email", normalizedEmail)
      .maybeSingle()

    if (existing) {
      return actionFail("CONFLICT", "อีเมลนี้มีบัญชีในโรงเรียนแล้ว")
    }

    let admin: ReturnType<typeof createAdminClient>
    try {
      admin = createAdminClient()
    } catch {
      return actionFail("INTERNAL_ERROR", "ยังไม่ได้ตั้งค่า SUPABASE_SERVICE_ROLE_KEY บนเซิร์ฟเวอร์")
    }

    const tempPassword = generateTempPassword()
    const { data: created, error: createError } = await admin.auth.admin.createUser({
      email: normalizedEmail,
      password: tempPassword,
      email_confirm: true,
      user_metadata: { first_name: firstName, last_name: lastName },
    })

    if (createError || !created.user) {
      if (/already.*(exists|registered)/i.test(createError?.message ?? "")) {
        return actionFail("CONFLICT", "อีเมลนี้มีบัญชีผู้ใช้แล้ว")
      }
      console.error("[staff.actions] inviteStaffAction createUser error:", createError)
      return actionFail("INTERNAL_ERROR", "ไม่สามารถสร้างบัญชีผู้ใช้ได้ กรุณาลองใหม่")
    }

    const { error: profileError } = await supabase.from("profiles").insert({
      id: created.user.id,
      school_id: context.schoolId,
      role,
      first_name: firstName,
      last_name: lastName,
      email: normalizedEmail,
      is_active: true,
    })

    if (profileError) {
      // Roll back the auth account so a retry starts clean.
      await admin.auth.admin.deleteUser(created.user.id).catch(() => undefined)
      console.error("[staff.actions] inviteStaffAction profile error:", profileError)
      return actionFail("INTERNAL_ERROR", "ไม่สามารถบันทึกข้อมูลบุคลากรได้ กรุณาลองใหม่")
    }

    await logAudit({
      action: "INSERT",
      tableName: "profiles",
      recordId: created.user.id,
      schoolId: context.schoolId,
      userId: context.userId,
      newData: { email: normalizedEmail, role },
    })

    revalidatePath("/settings/staff")

    return actionOk("เพิ่มบุคลากรเรียบร้อยแล้ว แจ้งรหัสผ่านชั่วคราวให้เจ้าตัวเปลี่ยนหลังเข้าสู่ระบบ", {
      data: { profileId: created.user.id, tempPassword },
    })
  } catch (error) {
    console.error("Error in inviteStaffAction:", error)
    return actionFail("INTERNAL_ERROR", "เกิดข้อผิดพลาดในการเพิ่มบุคลากร")
  }
}

export async function removeStaffAction(
  input: z.infer<typeof RemoveStaffSchema>,
): Promise<ActionResult<{ profileId: string }>> {
  try {
    const context = await getCurrentUserContext()
    if (!context.schoolId || !context.profileId) {
      return actionFail("UNAUTHORIZED", "กรุณาเข้าสู่ระบบก่อนดำเนินการ")
    }

    if (context.role !== "admin") {
      return actionFail("FORBIDDEN", "เฉพาะผู้ดูแลระบบเท่านั้นที่สามารถลบบัญชีบุคลากรได้")
    }

    const parsed = RemoveStaffSchema.safeParse(input)
    if (!parsed.success) {
      return actionFail("VALIDATION_ERROR", parsed.error.issues[0]?.message || "ข้อมูลไม่ถูกต้อง")
    }

    const { profileId } = parsed.data

    if (context.profileId === profileId) {
      return actionFail("CONFLICT", "ไม่สามารถลบบัญชีของตนเองได้")
    }

    const supabase = await createClient()
    const { data: target, error: fetchError } = await supabase
      .from("profiles")
      .select("id, role, is_active, first_name, last_name")
      .eq("id", profileId)
      .eq("school_id", context.schoolId)
      .maybeSingle()

    if (fetchError || !target) {
      return actionFail("NOT_FOUND", "ไม่พบข้อมูลบุคลากรในโรงเรียนนี้")
    }

    if (target.role === "admin") {
      const { count } = await supabase
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("school_id", context.schoolId)
        .eq("role", "admin")
        .eq("is_active", true)
        .neq("id", profileId)

      if (!count) {
        return actionFail("CONFLICT", "ไม่สามารถลบผู้ดูแลระบบคนสุดท้ายได้")
      }
    }

    let admin: ReturnType<typeof createAdminClient>
    try {
      admin = createAdminClient()
    } catch {
      return actionFail("INTERNAL_ERROR", "ยังไม่ได้ตั้งค่า SUPABASE_SERVICE_ROLE_KEY บนเซิร์ฟเวอร์")
    }

    const { error: deleteError } = await admin.auth.admin.deleteUser(profileId)
    if (deleteError && !/not found/i.test(deleteError.message)) {
      console.error("[staff.actions] removeStaffAction deleteUser error:", deleteError)
      return actionFail("INTERNAL_ERROR", "ไม่สามารถลบบัญชีผู้ใช้ได้ กรุณาลองใหม่")
    }

    // Keep the profile row for historical references, but deactivate it.
    const { error: deactivateError } = await supabase
      .from("profiles")
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq("id", profileId)
      .eq("school_id", context.schoolId)

    if (deactivateError) {
      console.error("[staff.actions] removeStaffAction deactivate error:", deactivateError)
      return actionFail("INTERNAL_ERROR", "ลบบัญชีแล้วแต่ปิดสถานะไม่สำเร็จ กรุณาตรวจสอบ")
    }

    await logAudit({
      action: "DELETE",
      tableName: "profiles",
      recordId: profileId,
      schoolId: context.schoolId,
      userId: context.userId,
      oldData: { role: target.role, is_active: target.is_active },
    })

    revalidatePath("/settings/staff")

    return actionOk("ลบบัญชีบุคลากรเรียบร้อยแล้ว", { data: { profileId } })
  } catch (error) {
    console.error("Error in removeStaffAction:", error)
    return actionFail("INTERNAL_ERROR", "เกิดข้อผิดพลาดในการลบบัญชีบุคลากร")
  }
}
