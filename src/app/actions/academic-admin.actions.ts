"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"

import { createClient } from "@/utils/supabase/server"
import { getCurrentUserContext } from "@/lib/server/current-user"
import { actionFail, actionOk, type ActionResult } from "@/lib/server/action-result"
import type { Database } from "@/types/database.types"

function assertLeadershipRole(role: string) {
  if (!["admin", "director"].includes(role)) {
    throw new Error("เฉพาะผู้ดูแลระบบหรือผู้อำนวยการเท่านั้นที่สามารถจัดการข้อมูลวิชาการได้")
  }
}

// ----------------------------------------------------
// 1. Academic Year Actions
// ----------------------------------------------------
const AcademicYearSchema = z.object({
  id: z.string().uuid().optional(),
  year: z.coerce.number().int().min(2500).max(2700),
  startDate: z.string().min(1, "กรุณาระบุวันเริ่มต้น"),
  endDate: z.string().min(1, "กรุณาระบุวันสิ้นสุด"),
  isCurrent: z.boolean().default(false),
})

export async function upsertAcademicYearAction(
  _prevState: ActionResult<{ id: string }>,
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  try {
    const context = await getCurrentUserContext()
    assertLeadershipRole(context.role)

    const raw = {
      id: formData.get("id") ? String(formData.get("id")) : undefined,
      year: formData.get("year"),
      startDate: formData.get("startDate"),
      endDate: formData.get("endDate"),
      isCurrent: formData.get("isCurrent") === "true" || formData.get("isCurrent") === "on",
    }

    const parsed = AcademicYearSchema.safeParse(raw)
    if (!parsed.success) {
      return actionFail("VALIDATION_ERROR", "ข้อมูลปีการศึกษาไม่ถูกต้อง", {
        fieldErrors: parsed.error.flatten().fieldErrors,
      })
    }

    const { id, year, startDate, endDate, isCurrent } = parsed.data
    const supabase = await createClient()

    if (id) {
      const { error } = await supabase
        .from("academic_years")
        .update({
          year,
          start_date: startDate,
          end_date: endDate,
          is_current: isCurrent,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .eq("school_id", context.schoolId)

      if (error) {
        return actionFail("INTERNAL_ERROR", `ไม่สามารถแก้ไขปีการศึกษาได้: ${error.message}`)
      }
      revalidatePath("/settings/academic")
      revalidatePath("/academics")
      return actionOk("แก้ไขปีการศึกษาเรียบร้อยแล้ว", { data: { id } })
    } else {
      const { data, error } = await supabase
        .from("academic_years")
        .insert({
          school_id: context.schoolId,
          year,
          start_date: startDate,
          end_date: endDate,
          is_current: isCurrent,
        })
        .select("id")
        .single()

      if (error) {
        return actionFail("INTERNAL_ERROR", `ไม่สามารถสร้างปีการศึกษาได้: ${error.message}`)
      }
      revalidatePath("/settings/academic")
      revalidatePath("/academics")
      return actionOk("สร้างปีการศึกษาเรียบร้อยแล้ว", { data: { id: data.id } })
    }
  } catch (error) {
    return actionFail("UNAUTHORIZED", error instanceof Error ? error.message : "เกิดข้อผิดพลาดในการตรวจสอบสิทธิ์")
  }
}

export async function deleteAcademicYearAction(id: string): Promise<ActionResult> {
  try {
    const context = await getCurrentUserContext()
    assertLeadershipRole(context.role)

    const supabase = await createClient()
    const { error } = await supabase
      .from("academic_years")
      .delete()
      .eq("id", id)
      .eq("school_id", context.schoolId)

    if (error) {
      return actionFail("CONFLICT", `ไม่สามารถลบปีการศึกษาได้ เนื่องจากมีข้อมูลภาคเรียนหรือห้องเรียนอ้างอิงอยู่ (${error.message})`)
    }

    revalidatePath("/settings/academic")
    revalidatePath("/academics")
    return actionOk("ลบปีการศึกษาเรียบร้อยแล้ว")
  } catch (error) {
    return actionFail("UNAUTHORIZED", error instanceof Error ? error.message : "เกิดข้อผิดพลาด")
  }
}

// ----------------------------------------------------
// 2. Semester Actions
// ----------------------------------------------------
const SemesterSchema = z.object({
  id: z.string().uuid().optional(),
  academicYearId: z.string().uuid("กรุณาเลือกปีการศึกษา"),
  semester: z.enum(["semester_1", "semester_2"]),
  startDate: z.string().min(1, "กรุณาระบุวันเริ่มต้น"),
  endDate: z.string().min(1, "กรุณาระบุวันสิ้นสุด"),
  isCurrent: z.boolean().default(false),
})

export async function upsertSemesterAction(
  _prevState: ActionResult<{ id: string }>,
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  try {
    const context = await getCurrentUserContext()
    assertLeadershipRole(context.role)

    const raw = {
      id: formData.get("id") ? String(formData.get("id")) : undefined,
      academicYearId: formData.get("academicYearId"),
      semester: formData.get("semester"),
      startDate: formData.get("startDate"),
      endDate: formData.get("endDate"),
      isCurrent: formData.get("isCurrent") === "true" || formData.get("isCurrent") === "on",
    }

    const parsed = SemesterSchema.safeParse(raw)
    if (!parsed.success) {
      return actionFail("VALIDATION_ERROR", "ข้อมูลภาคเรียนไม่ถูกต้อง", {
        fieldErrors: parsed.error.flatten().fieldErrors,
      })
    }

    const { id, academicYearId, semester, startDate, endDate, isCurrent } = parsed.data
    const supabase = await createClient()

    if (id) {
      const { error } = await supabase
        .from("semesters")
        .update({
          academic_year_id: academicYearId,
          semester: semester as Database["public"]["Enums"]["semester_type"],
          start_date: startDate,
          end_date: endDate,
          is_current: isCurrent,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .eq("school_id", context.schoolId)

      if (error) {
        return actionFail("INTERNAL_ERROR", `ไม่สามารถแก้ไขภาคเรียนได้: ${error.message}`)
      }
      revalidatePath("/settings/academic")
      revalidatePath("/academics")
      revalidatePath("/attendance")
      return actionOk("แก้ไขภาคเรียนเรียบร้อยแล้ว", { data: { id } })
    } else {
      const { data, error } = await supabase
        .from("semesters")
        .insert({
          school_id: context.schoolId,
          academic_year_id: academicYearId,
          semester: semester as Database["public"]["Enums"]["semester_type"],
          start_date: startDate,
          end_date: endDate,
          is_current: isCurrent,
        })
        .select("id")
        .single()

      if (error) {
        return actionFail("INTERNAL_ERROR", `ไม่สามารถสร้างภาคเรียนได้: ${error.message}`)
      }
      revalidatePath("/settings/academic")
      revalidatePath("/academics")
      revalidatePath("/attendance")
      return actionOk("สร้างภาคเรียนเรียบร้อยแล้ว", { data: { id: data.id } })
    }
  } catch (error) {
    return actionFail("UNAUTHORIZED", error instanceof Error ? error.message : "เกิดข้อผิดพลาดในการตรวจสอบสิทธิ์")
  }
}

export async function setCurrentSemesterAction(id: string): Promise<ActionResult> {
  try {
    const context = await getCurrentUserContext()
    assertLeadershipRole(context.role)

    const supabase = await createClient()
    const { error } = await supabase
      .from("semesters")
      .update({ is_current: true })
      .eq("id", id)
      .eq("school_id", context.schoolId)

    if (error) {
      return actionFail("INTERNAL_ERROR", `ไม่สามารถตั้งภาคเรียนปัจจุบันได้: ${error.message}`)
    }

    revalidatePath("/settings/academic")
    revalidatePath("/academics")
    revalidatePath("/attendance")
    revalidatePath("/")
    return actionOk("ตั้งเป็นภาคเรียนปัจจุบันเรียบร้อยแล้ว")
  } catch (error) {
    return actionFail("UNAUTHORIZED", error instanceof Error ? error.message : "เกิดข้อผิดพลาด")
  }
}

export async function deleteSemesterAction(id: string): Promise<ActionResult> {
  try {
    const context = await getCurrentUserContext()
    assertLeadershipRole(context.role)

    const supabase = await createClient()
    const { error } = await supabase
      .from("semesters")
      .delete()
      .eq("id", id)
      .eq("school_id", context.schoolId)

    if (error) {
      return actionFail("CONFLICT", `ไม่สามารถลบภาคเรียนได้ เนื่องจากมีข้อมูลคะแนนหรือตารางเรียนอ้างอิงอยู่ (${error.message})`)
    }

    revalidatePath("/settings/academic")
    revalidatePath("/academics")
    return actionOk("ลบภาคเรียนเรียบร้อยแล้ว")
  } catch (error) {
    return actionFail("UNAUTHORIZED", error instanceof Error ? error.message : "เกิดข้อผิดพลาด")
  }
}

// ----------------------------------------------------
// 3. Classroom Actions
// ----------------------------------------------------
const ClassroomSchema = z.object({
  id: z.string().uuid().optional(),
  academicYearId: z.string().uuid("กรุณาเลือกปีการศึกษา"),
  gradeLevel: z.enum(["p1", "p2", "p3", "p4", "p5", "p6", "m1", "m2", "m3", "m4", "m5", "m6"]),
  section: z.coerce.number().int().min(1).default(1),
  name: z.string().min(1, "กรุณาระบุชื่อห้องเรียน"),
  roomNumber: z.string().nullable().optional(),
  maxStudents: z.coerce.number().int().min(1).max(100).default(40),
  homeroomTeacherId: z.string().uuid().nullable().optional(),
  coTeacherId: z.string().uuid().nullable().optional(),
  isActive: z.boolean().default(true),
})

export async function upsertClassroomAction(
  _prevState: ActionResult<{ id: string }>,
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  try {
    const context = await getCurrentUserContext()
    assertLeadershipRole(context.role)

    const raw = {
      id: formData.get("id") ? String(formData.get("id")) : undefined,
      academicYearId: formData.get("academicYearId"),
      gradeLevel: formData.get("gradeLevel"),
      section: formData.get("section"),
      name: formData.get("name"),
      roomNumber: formData.get("roomNumber") ? String(formData.get("roomNumber")).trim() : null,
      maxStudents: formData.get("maxStudents") || 40,
      homeroomTeacherId: formData.get("homeroomTeacherId") ? String(formData.get("homeroomTeacherId")) : null,
      coTeacherId: formData.get("coTeacherId") ? String(formData.get("coTeacherId")) : null,
      isActive: formData.get("isActive") !== "false",
    }

    const parsed = ClassroomSchema.safeParse(raw)
    if (!parsed.success) {
      return actionFail("VALIDATION_ERROR", "ข้อมูลห้องเรียนไม่ถูกต้อง", {
        fieldErrors: parsed.error.flatten().fieldErrors,
      })
    }

    const d = parsed.data
    const supabase = await createClient()

    if (d.id) {
      const { error } = await supabase
        .from("classrooms")
        .update({
          academic_year_id: d.academicYearId,
          grade_level: d.gradeLevel as Database["public"]["Enums"]["grade_level"],
          section: d.section,
          name: d.name,
          room_number: d.roomNumber,
          max_students: d.maxStudents,
          homeroom_teacher_id: d.homeroomTeacherId || null,
          co_teacher_id: d.coTeacherId || null,
          is_active: d.isActive,
          updated_at: new Date().toISOString(),
        })
        .eq("id", d.id)
        .eq("school_id", context.schoolId)

      if (error) {
        return actionFail("INTERNAL_ERROR", `ไม่สามารถแก้ไขห้องเรียนได้: ${error.message}`)
      }
      revalidatePath("/settings/academic")
      revalidatePath("/students")
      revalidatePath("/attendance")
      return actionOk("แก้ไขห้องเรียนเรียบร้อยแล้ว", { data: { id: d.id } })
    } else {
      const { data, error } = await supabase
        .from("classrooms")
        .insert({
          school_id: context.schoolId,
          academic_year_id: d.academicYearId,
          grade_level: d.gradeLevel as Database["public"]["Enums"]["grade_level"],
          section: d.section,
          name: d.name,
          room_number: d.roomNumber,
          max_students: d.maxStudents,
          homeroom_teacher_id: d.homeroomTeacherId || null,
          co_teacher_id: d.coTeacherId || null,
          is_active: d.isActive,
        })
        .select("id")
        .single()

      if (error) {
        return actionFail("INTERNAL_ERROR", `ไม่สามารถสร้างห้องเรียนได้: ${error.message}`)
      }
      revalidatePath("/settings/academic")
      revalidatePath("/students")
      revalidatePath("/attendance")
      return actionOk("สร้างห้องเรียนเรียบร้อยแล้ว", { data: { id: data.id } })
    }
  } catch (error) {
    return actionFail("UNAUTHORIZED", error instanceof Error ? error.message : "เกิดข้อผิดพลาด")
  }
}

export async function deleteClassroomAction(id: string): Promise<ActionResult> {
  try {
    const context = await getCurrentUserContext()
    assertLeadershipRole(context.role)

    const supabase = await createClient()
    const { error } = await supabase
      .from("classrooms")
      .delete()
      .eq("id", id)
      .eq("school_id", context.schoolId)

    if (error) {
      return actionFail("CONFLICT", `ไม่สามารถลบห้องเรียนได้ เนื่องจากมีนักเรียนหรือวิชาที่เปิดสอนผูกอยู่ (${error.message})`)
    }

    revalidatePath("/settings/academic")
    revalidatePath("/students")
    return actionOk("ลบห้องเรียนเรียบร้อยแล้ว")
  } catch (error) {
    return actionFail("UNAUTHORIZED", error instanceof Error ? error.message : "เกิดข้อผิดพลาด")
  }
}

// ----------------------------------------------------
// 4. Subject Actions
// ----------------------------------------------------
const SubjectSchema = z.object({
  id: z.string().uuid().optional(),
  subjectCode: z.string().min(1, "กรุณาระบุรหัสวิชา"),
  name: z.string().min(1, "กรุณาระบุชื่อวิชา"),
  nameEn: z.string().nullable().optional(),
  learningArea: z.string().nullable().optional(),
  gradeLevel: z.enum(["p1", "p2", "p3", "p4", "p5", "p6", "m1", "m2", "m3", "m4", "m5", "m6"]).nullable().optional(),
  credit: z.coerce.number().min(0.5).max(10).default(1.0),
  hoursPerWeek: z.coerce.number().int().min(1).max(20).default(1),
  description: z.string().nullable().optional(),
  isActive: z.boolean().default(true),
})

export async function upsertSubjectAction(
  _prevState: ActionResult<{ id: string }>,
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  try {
    const context = await getCurrentUserContext()
    assertLeadershipRole(context.role)

    const raw = {
      id: formData.get("id") ? String(formData.get("id")) : undefined,
      subjectCode: formData.get("subjectCode"),
      name: formData.get("name"),
      nameEn: formData.get("nameEn") ? String(formData.get("nameEn")).trim() : null,
      learningArea: formData.get("learningArea") ? String(formData.get("learningArea")).trim() : null,
      gradeLevel: formData.get("gradeLevel") || null,
      credit: formData.get("credit") || 1.0,
      hoursPerWeek: formData.get("hoursPerWeek") || 1,
      description: formData.get("description") ? String(formData.get("description")).trim() : null,
      isActive: formData.get("isActive") !== "false",
    }

    const parsed = SubjectSchema.safeParse(raw)
    if (!parsed.success) {
      return actionFail("VALIDATION_ERROR", "ข้อมูลรายวิชาไม่ถูกต้อง", {
        fieldErrors: parsed.error.flatten().fieldErrors,
      })
    }

    const d = parsed.data
    const supabase = await createClient()

    if (d.id) {
      const { error } = await supabase
        .from("subjects")
        .update({
          subject_code: d.subjectCode,
          name: d.name,
          name_en: d.nameEn,
          learning_area: d.learningArea,
          grade_level: d.gradeLevel as Database["public"]["Enums"]["grade_level"] | null,
          credit: d.credit,
          hours_per_week: d.hoursPerWeek,
          description: d.description,
          is_active: d.isActive,
          updated_at: new Date().toISOString(),
        })
        .eq("id", d.id)
        .eq("school_id", context.schoolId)

      if (error) {
        return actionFail("INTERNAL_ERROR", `ไม่สามารถแก้ไขรายวิชาได้: ${error.message}`)
      }
      revalidatePath("/settings/academic")
      revalidatePath("/academics")
      return actionOk("แก้ไขรายวิชาเรียบร้อยแล้ว", { data: { id: d.id } })
    } else {
      const { data, error } = await supabase
        .from("subjects")
        .insert({
          school_id: context.schoolId,
          subject_code: d.subjectCode,
          name: d.name,
          name_en: d.nameEn,
          learning_area: d.learningArea,
          grade_level: d.gradeLevel as Database["public"]["Enums"]["grade_level"] | null,
          credit: d.credit,
          hours_per_week: d.hoursPerWeek,
          description: d.description,
          is_active: d.isActive,
        })
        .select("id")
        .single()

      if (error) {
        return actionFail("INTERNAL_ERROR", `ไม่สามารถสร้างรายวิชาได้: ${error.message}`)
      }
      revalidatePath("/settings/academic")
      revalidatePath("/academics")
      return actionOk("สร้างรายวิชาเรียบร้อยแล้ว", { data: { id: data.id } })
    }
  } catch (error) {
    return actionFail("UNAUTHORIZED", error instanceof Error ? error.message : "เกิดข้อผิดพลาด")
  }
}

export async function deleteSubjectAction(id: string): Promise<ActionResult> {
  try {
    const context = await getCurrentUserContext()
    assertLeadershipRole(context.role)

    const supabase = await createClient()
    const { error } = await supabase
      .from("subjects")
      .delete()
      .eq("id", id)
      .eq("school_id", context.schoolId)

    if (error) {
      return actionFail("CONFLICT", `ไม่สามารถลบรายวิชาได้ เนื่องจากมีตารางสอนหรือคะแนนอ้างอิงอยู่ (${error.message})`)
    }

    revalidatePath("/settings/academic")
    revalidatePath("/academics")
    return actionOk("ลบรายวิชาเรียบร้อยแล้ว")
  } catch (error) {
    return actionFail("UNAUTHORIZED", error instanceof Error ? error.message : "เกิดข้อผิดพลาด")
  }
}

// ----------------------------------------------------
// 5. Classroom Subject Assignment Actions
// ----------------------------------------------------
const AssignmentSchema = z.object({
  id: z.string().uuid().optional(),
  classroomId: z.string().uuid("กรุณาเลือกห้องเรียน"),
  subjectId: z.string().uuid("กรุณาเลือกวิชา"),
  teacherId: z.string().uuid("กรุณาเลือกครูผู้สอน"),
  semesterId: z.string().uuid("กรุณาเลือกภาคเรียน"),
  midtermMaxScore: z.coerce.number().min(0).max(100).default(20),
  finalMaxScore: z.coerce.number().min(0).max(100).default(20),
  classworkMaxScore: z.coerce.number().min(0).max(100).default(60),
})

export async function assignClassroomSubjectAction(
  _prevState: ActionResult<{ id: string }>,
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  try {
    const context = await getCurrentUserContext()
    assertLeadershipRole(context.role)

    const raw = {
      id: formData.get("id") ? String(formData.get("id")) : undefined,
      classroomId: formData.get("classroomId"),
      subjectId: formData.get("subjectId"),
      teacherId: formData.get("teacherId"),
      semesterId: formData.get("semesterId"),
      midtermMaxScore: formData.get("midtermMaxScore") || 20,
      finalMaxScore: formData.get("finalMaxScore") || 20,
      classworkMaxScore: formData.get("classworkMaxScore") || 60,
    }

    const parsed = AssignmentSchema.safeParse(raw)
    if (!parsed.success) {
      return actionFail("VALIDATION_ERROR", "ข้อมูลการมอบหมายวิชาไม่ถูกต้อง", {
        fieldErrors: parsed.error.flatten().fieldErrors,
      })
    }

    const d = parsed.data
    const supabase = await createClient()

    if (d.id) {
      const { error } = await supabase
        .from("classroom_subjects")
        .update({
          classroom_id: d.classroomId,
          subject_id: d.subjectId,
          teacher_id: d.teacherId,
          semester_id: d.semesterId,
          midterm_max_score: d.midtermMaxScore,
          final_max_score: d.finalMaxScore,
          classwork_max_score: d.classworkMaxScore,
          updated_at: new Date().toISOString(),
        })
        .eq("id", d.id)
        .eq("school_id", context.schoolId)

      if (error) {
        return actionFail("INTERNAL_ERROR", `ไม่สามารถแก้ไขการมอบหมายได้: ${error.message}`)
      }
      revalidatePath("/settings/academic")
      revalidatePath("/academics")
      return actionOk("แก้ไขการมอบหมายวิชาเรียบร้อยแล้ว", { data: { id: d.id } })
    } else {
      const { data, error } = await supabase
        .from("classroom_subjects")
        .insert({
          school_id: context.schoolId,
          classroom_id: d.classroomId,
          subject_id: d.subjectId,
          teacher_id: d.teacherId,
          semester_id: d.semesterId,
          midterm_max_score: d.midtermMaxScore,
          final_max_score: d.finalMaxScore,
          classwork_max_score: d.classworkMaxScore,
        })
        .select("id")
        .single()

      if (error) {
        return actionFail("INTERNAL_ERROR", `ไม่สามารถมอบหมายวิชาได้: ${error.message}`)
      }
      revalidatePath("/settings/academic")
      revalidatePath("/academics")
      return actionOk("มอบหมายวิชาเรียบร้อยแล้ว", { data: { id: data.id } })
    }
  } catch (error) {
    return actionFail("UNAUTHORIZED", error instanceof Error ? error.message : "เกิดข้อผิดพลาด")
  }
}

export async function deleteClassroomSubjectAction(id: string): Promise<ActionResult> {
  try {
    const context = await getCurrentUserContext()
    assertLeadershipRole(context.role)

    const supabase = await createClient()
    const { error } = await supabase
      .from("classroom_subjects")
      .delete()
      .eq("id", id)
      .eq("school_id", context.schoolId)

    if (error) {
      return actionFail("CONFLICT", `ไม่สามารถลบการมอบหมายได้ เนื่องจากมีคะแนนของนักเรียนบันทึกอยู่ (${error.message})`)
    }

    revalidatePath("/settings/academic")
    revalidatePath("/academics")
    return actionOk("ยกเลิกการมอบหมายวิชาเรียบร้อยแล้ว")
  } catch (error) {
    return actionFail("UNAUTHORIZED", error instanceof Error ? error.message : "เกิดข้อผิดพลาด")
  }
}
