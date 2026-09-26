"use server"

import { revalidatePath } from "next/cache"

import type { ActionResult } from "@/lib/server/action-result"
import { actionFail, actionOk } from "@/lib/server/action-result"
import { getCurrentUserContext } from "@/lib/server/current-user"
import { createClient } from "@/utils/supabase/server"

const photoBucket = "student-photos"
const maxPhotoBytes = 5 * 1024 * 1024
const allowedMimeTypes = new Set(["image/jpeg", "image/png", "image/webp"])

// Roles allowed by both the storage INSERT policy and the students UPDATE policy.
const photoEditorRoles = new Set(["admin", "homeroom_teacher", "counselor"])

function photoPathFromUrl(url: string | null): string | null {
  if (!url) return null
  const marker = `/${photoBucket}/`
  const index = url.indexOf(marker)
  if (index === -1) return null
  const path = url.slice(index + marker.length).split("?")[0]
  return path || null
}

async function assertCanEditPhoto(studentId: string) {
  const context = await getCurrentUserContext()
  if (!photoEditorRoles.has(context.role)) {
    return { ok: false as const, code: "FORBIDDEN" as const, message: "คุณไม่มีสิทธิ์เปลี่ยนรูปนักเรียน" }
  }
  if (!context.profileId) {
    return { ok: false as const, code: "UNAUTHORIZED" as const, message: "กรุณาเข้าสู่ระบบก่อนดำเนินการ" }
  }
  if (!studentId) {
    return { ok: false as const, code: "VALIDATION_ERROR" as const, message: "ไม่พบรหัสนักเรียน" }
  }

  const supabase = await createClient()
  const { data: student } = await supabase
    .from("students")
    .select("id, photo_url")
    .eq("id", studentId)
    .eq("school_id", context.schoolId)
    .maybeSingle()

  if (!student) {
    return { ok: false as const, code: "NOT_FOUND" as const, message: "ไม่พบนักเรียนในโรงเรียนของคุณ" }
  }

  return { ok: true as const, context, supabase, student }
}

export async function uploadStudentPhotoAction(input: {
  student_id: string
  file: File
}): Promise<ActionResult<{ photoUrl: string }>> {
  try {
    const gate = await assertCanEditPhoto(input.student_id)
    if (!gate.ok) return actionFail(gate.code, gate.message)
    const { context, supabase, student } = gate

    if (!(input.file instanceof File) || input.file.size <= 0) {
      return actionFail("VALIDATION_ERROR", "กรุณาเลือกรูปภาพ")
    }
    if (!allowedMimeTypes.has(input.file.type)) {
      return actionFail("VALIDATION_ERROR", "รองรับเฉพาะไฟล์ JPG, PNG หรือ WebP")
    }
    if (input.file.size > maxPhotoBytes) {
      return actionFail("VALIDATION_ERROR", "รูปภาพต้องมีขนาดไม่เกิน 5 MB")
    }

    const extension = input.file.type === "image/png" ? "png" : input.file.type === "image/webp" ? "webp" : "jpg"
    const storagePath = `${input.student_id}/${globalThis.crypto.randomUUID()}.${extension}`
    const { error: uploadError } = await supabase.storage.from(photoBucket).upload(
      storagePath,
      await input.file.arrayBuffer(),
      { cacheControl: "31536000", contentType: input.file.type, upsert: false },
    )

    if (uploadError) {
      if (/row-level security/i.test(uploadError.message)) {
        return actionFail("INTERNAL_ERROR", "อัปโหลดไม่สำเร็จ: ฐานข้อมูลปฏิเสธสิทธิ์ (RLS)")
      }
      console.error("Student photo upload failed", uploadError)
      return actionFail("INTERNAL_ERROR", "ไม่สามารถอัปโหลดรูปได้ กรุณาลองใหม่")
    }

    const { data: urlData } = supabase.storage.from(photoBucket).getPublicUrl(storagePath)
    const photoUrl = urlData.publicUrl

    const { error: updateError } = await supabase
      .from("students")
      .update({ photo_url: photoUrl })
      .eq("id", input.student_id)
      .eq("school_id", context.schoolId)

    if (updateError) {
      await supabase.storage.from(photoBucket).remove([storagePath]).catch(() => undefined)
      console.error("Student photo_url update failed", updateError)
      return actionFail("INTERNAL_ERROR", "ไม่สามารถบันทึกรูปได้ กรุณาลองใหม่")
    }

    // Best-effort cleanup of the previous photo (skip external/legacy URLs).
    const oldPath = photoPathFromUrl(student.photo_url)
    if (oldPath && oldPath !== storagePath) {
      await supabase.storage.from(photoBucket).remove([oldPath]).catch(() => undefined)
    }

    revalidatePath("/students")
    revalidatePath(`/students/${input.student_id}`)
    return actionOk("เปลี่ยนรูปโปรไฟล์เรียบร้อยแล้ว", {
      data: { photoUrl },
      revalidated: ["/students", `/students/${input.student_id}`],
    })
  } catch (error) {
    console.error("Student photo action failed", error)
    return actionFail("INTERNAL_ERROR", "ไม่สามารถอัปโหลดรูปได้ กรุณาลองใหม่")
  }
}

export async function removeStudentPhotoAction(input: {
  student_id: string
}): Promise<ActionResult<{ studentId: string }>> {
  try {
    const gate = await assertCanEditPhoto(input.student_id)
    if (!gate.ok) return actionFail(gate.code, gate.message)
    const { context, supabase, student } = gate

    const oldPath = photoPathFromUrl(student.photo_url)
    if (oldPath) {
      const { error: removeError } = await supabase.storage.from(photoBucket).remove([oldPath])
      if (removeError && !/not found|does not exist/i.test(removeError.message)) {
        console.error("Student photo remove failed", removeError)
        return actionFail("INTERNAL_ERROR", "ไม่สามารถลบรูปได้ กรุณาลองใหม่")
      }
    }

    const { error: updateError } = await supabase
      .from("students")
      .update({ photo_url: null })
      .eq("id", input.student_id)
      .eq("school_id", context.schoolId)

    if (updateError) {
      console.error("Student photo_url clear failed", updateError)
      return actionFail("INTERNAL_ERROR", "ไม่สามารถลบรูปได้ กรุณาลองใหม่")
    }

    revalidatePath("/students")
    revalidatePath(`/students/${input.student_id}`)
    return actionOk("ลบรูปโปรไฟล์เรียบร้อยแล้ว", {
      data: { studentId: input.student_id },
      revalidated: ["/students", `/students/${input.student_id}`],
    })
  } catch (error) {
    console.error("Student photo remove action failed", error)
    return actionFail("INTERNAL_ERROR", "ไม่สามารถลบรูปได้ กรุณาลองใหม่")
  }
}
