"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"

import type { ActionResult } from "@/lib/server/action-result"
import { actionFail, actionOk } from "@/lib/server/action-result"
import { createAdminClient } from "@/lib/server/admin-client"
import { logAudit } from "@/lib/server/audit-logger"
import { getCurrentUserContext } from "@/lib/server/current-user"
import { createClient } from "@/utils/supabase/server"

const STAFF_INVITERS = new Set(["admin", "homeroom_teacher", "counselor"])

const InviteParentSchema = z.object({
  guardianId: z.string().uuid("รหัสผู้ปกครองไม่ถูกต้อง"),
  email: z.string().trim().email("รูปแบบอีเมลไม่ถูกต้อง").max(255),
  firstName: z.string().trim().min(1, "กรุณาระบุชื่อ").max(100),
  lastName: z.string().trim().min(1, "กรุณาระบุนามสกุล").max(100),
})

const RemoveParentSchema = z.object({
  guardianId: z.string().uuid("รหัสผู้ปกครองไม่ถูกต้อง"),
})

function generateTempPassword(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789"
  const bytes = crypto.getRandomValues(new Uint8Array(12))
  return Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("")
}

export async function inviteParentAction(
  input: z.infer<typeof InviteParentSchema>,
): Promise<ActionResult<{ guardianId: string; tempPassword: string }>> {
  try {
    const context = await getCurrentUserContext()
    if (!context.schoolId || !context.profileId) {
      return actionFail("UNAUTHORIZED", "กรุณาเข้าสู่ระบบก่อนดำเนินการ")
    }

    if (!STAFF_INVITERS.has(context.role)) {
      return actionFail("FORBIDDEN", "เฉพาะครูที่ดูแลนักเรียนเท่านั้นที่สามารถเปิดบัญชีผู้ปกครองได้")
    }

    const parsed = InviteParentSchema.safeParse(input)
    if (!parsed.success) {
      return actionFail("VALIDATION_ERROR", parsed.error.issues[0]?.message || "ข้อมูลไม่ถูกต้อง")
    }

    const { guardianId, email, firstName, lastName } = parsed.data
    const normalizedEmail = email.toLowerCase()
    const supabase = await createClient()

    const { data: guardian, error: guardianError } = await supabase
      .from("guardians")
      .select("id, first_name, last_name, user_id")
      .eq("id", guardianId)
      .eq("school_id", context.schoolId)
      .maybeSingle()

    if (guardianError || !guardian) {
      return actionFail("NOT_FOUND", "ไม่พบข้อมูลผู้ปกครองในโรงเรียนนี้")
    }

    if (guardian.user_id) {
      return actionFail("CONFLICT", "ผู้ปกครองท่านนี้มีบัญชีใช้งานแล้ว")
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
      console.error("[parent.actions] inviteParentAction createUser error:", createError)
      return actionFail("INTERNAL_ERROR", "ไม่สามารถสร้างบัญชีผู้ใช้ได้ กรุณาลองใหม่")
    }

    const { error: profileError } = await supabase.from("profiles").insert({
      id: created.user.id,
      school_id: context.schoolId,
      role: "parent",
      first_name: firstName,
      last_name: lastName,
      email: normalizedEmail,
      is_active: true,
    })

    if (profileError) {
      await admin.auth.admin.deleteUser(created.user.id).catch(() => undefined)
      console.error("[parent.actions] inviteParentAction profile error:", profileError)
      return actionFail("INTERNAL_ERROR", "ไม่สามารถบันทึกข้อมูลบุคลากรได้ กรุณาลองใหม่")
    }

    const { error: linkError } = await supabase
      .from("guardians")
      .update({ user_id: created.user.id })
      .eq("id", guardianId)
      .eq("school_id", context.schoolId)

    if (linkError) {
      await supabase.from("profiles").delete().eq("id", created.user.id)
      await admin.auth.admin.deleteUser(created.user.id).catch(() => undefined)
      console.error("[parent.actions] inviteParentAction link error:", linkError)
      return actionFail("INTERNAL_ERROR", "ไม่สามารถผูกบัญชีกับผู้ปกครองได้ กรุณาลองใหม่")
    }

    await logAudit({
      action: "INSERT",
      tableName: "guardians",
      recordId: guardianId,
      schoolId: context.schoolId,
      userId: context.userId,
      newData: { email: normalizedEmail, role: "parent" },
    })

    revalidatePath(`/students`)

    return actionOk("เปิดบัญชีผู้ปกครองเรียบร้อยแล้ว แจ้งรหัสผ่านชั่วคราวให้เจ้าตัวเปลี่ยนหลังเข้าสู่ระบบ", {
      data: { guardianId, tempPassword },
    })
  } catch (error) {
    console.error("Error in inviteParentAction:", error)
    return actionFail("INTERNAL_ERROR", "เกิดข้อผิดพลาดในการเปิดบัญชีผู้ปกครอง")
  }
}

export async function removeParentAccessAction(
  input: z.infer<typeof RemoveParentSchema>,
): Promise<ActionResult<{ guardianId: string }>> {
  try {
    const context = await getCurrentUserContext()
    if (!context.schoolId || !context.profileId) {
      return actionFail("UNAUTHORIZED", "กรุณาเข้าสู่ระบบก่อนดำเนินการ")
    }

    if (!STAFF_INVITERS.has(context.role)) {
      return actionFail("FORBIDDEN", "เฉพาะครูที่ดูแลนักเรียนเท่านั้นที่สามารถปิดบัญชีผู้ปกครองได้")
    }

    const parsed = RemoveParentSchema.safeParse(input)
    if (!parsed.success) {
      return actionFail("VALIDATION_ERROR", parsed.error.issues[0]?.message || "ข้อมูลไม่ถูกต้อง")
    }

    const { guardianId } = parsed.data
    const supabase = await createClient()

    const { data: guardian, error: fetchError } = await supabase
      .from("guardians")
      .select("id, user_id")
      .eq("id", guardianId)
      .eq("school_id", context.schoolId)
      .maybeSingle()

    if (fetchError || !guardian) {
      return actionFail("NOT_FOUND", "ไม่พบข้อมูลผู้ปกครองในโรงเรียนนี้")
    }

    if (!guardian.user_id) {
      return actionFail("CONFLICT", "ผู้ปกครองท่านนี้ยังไม่มีบัญชีใช้งาน")
    }

    let admin: ReturnType<typeof createAdminClient>
    try {
      admin = createAdminClient()
    } catch {
      return actionFail("INTERNAL_ERROR", "ยังไม่ได้ตั้งค่า SUPABASE_SERVICE_ROLE_KEY บนเซิร์ฟเวอร์")
    }

    const { error: deleteError } = await admin.auth.admin.deleteUser(guardian.user_id)
    if (deleteError && !/not found/i.test(deleteError.message)) {
      console.error("[parent.actions] removeParentAccessAction deleteUser error:", deleteError)
      return actionFail("INTERNAL_ERROR", "ไม่สามารถลบบัญชีผู้ใช้ได้ กรุณาลองใหม่")
    }

    const { error: unlinkError } = await supabase
      .from("guardians")
      .update({ user_id: null })
      .eq("id", guardianId)
      .eq("school_id", context.schoolId)

    if (unlinkError) {
      console.error("[parent.actions] removeParentAccessAction unlink error:", unlinkError)
      return actionFail("INTERNAL_ERROR", "ยกเลิกการผูกบัญชีไม่สำเร็จ กรุณาลองใหม่")
    }

    // Keep the parent profile row for history, but deactivate it.
    await supabase
      .from("profiles")
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq("id", guardian.user_id)

    await logAudit({
      action: "DELETE",
      tableName: "guardians",
      recordId: guardianId,
      schoolId: context.schoolId,
      userId: context.userId,
    })

    revalidatePath(`/students`)

    return actionOk("ปิดบัญชีผู้ปกครองเรียบร้อยแล้ว", { data: { guardianId } })
  } catch (error) {
    console.error("Error in removeParentAccessAction:", error)
    return actionFail("INTERNAL_ERROR", "เกิดข้อผิดพลาดในการปิดบัญชีผู้ปกครอง")
  }
}
