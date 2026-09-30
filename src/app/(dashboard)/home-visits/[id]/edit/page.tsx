import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"

import { PageShell } from "@/components/dashboard"
import { ErrorState } from "@/components/feedback"
import { getStudentWorklist } from "@/lib/server/student-care-read-models"
import { getHomeVisitById } from "@/lib/server/home-visit-read-models"

import { HomeVisitEditForm } from "./_components/home-visit-edit-form"

type PageProps = {
  params: Promise<{ id: string }>
}

export default async function EditHomeVisitPage({ params }: PageProps) {
  const { id } = await params

  let record: Awaited<ReturnType<typeof getHomeVisitById>>
  let students: Awaited<ReturnType<typeof getStudentWorklist>>

  try {
    const result = await Promise.all([getHomeVisitById(id), getStudentWorklist({})])
    record = result[0]
    students = result[1]
  } catch {
    return (
      <PageShell>
        <ErrorState
          title="ไม่สามารถโหลดข้อมูลเพื่อแก้ไขได้"
          description="กรุณาลองใหม่อีกครั้ง หรือตรวจสอบสิทธิ์การเข้าถึง"
        />
      </PageShell>
    )
  }

  if (!record) notFound()

  if (!record.canEdit) {
    return (
      <PageShell>
        <ErrorState
          title="คุณไม่มีสิทธิ์แก้ไขรายการนี้"
          description="แก้ไขได้เฉพาะรายการที่คุณเป็นผู้บันทึก หรือโดยผู้ดูแลระบบ"
        />
      </PageShell>
    )
  }

  // Fetch linked addresses for students
  const studentIds = students.map((s) => s.studentId)
  const addressMap = new Map<string, string>()

  if (studentIds.length > 0) {
    const { createClient } = await import("@/utils/supabase/server")
    const supabase = await createClient()
    const { data: studentRows } = await supabase
      .from("students")
      .select("id, address, subdistrict, district, province, postal_code")
      .in("id", studentIds)

    if (studentRows) {
      for (const row of studentRows) {
        let addr = (row.address || "").trim()
        if (!addr) {
          const parts: string[] = []
          if (row.subdistrict) parts.push(`ต.${row.subdistrict}`)
          if (row.district) parts.push(`อ.${row.district}`)
          if (row.province) parts.push(`จ.${row.province}`)
          if (row.postal_code) parts.push(row.postal_code)
          addr = parts.join(" ")
        }
        if (addr) {
          addressMap.set(row.id, addr)
        }
      }
    }
  }

  const studentOptions = students.map((student) => ({
    id: student.studentId,
    name: student.fullName,
    classroom: student.classroomName ?? undefined,
    code: student.studentCode,
    address: addressMap.get(student.studentId) || "",
  }))

  return (
    <PageShell size="wide" spacing="default">
      <div className="flex items-start gap-3 sm:items-center sm:gap-4">
        <Link
          href={`/home-visits/${record.id}`}
          aria-label="กลับไปดูรายละเอียดเยี่ยมบ้าน"
          className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg border border-border bg-background text-foreground transition-colors hover:bg-muted"
        >
          <ArrowLeft className="size-4" />
        </Link>
        <div className="min-w-0">
          <h1 className="break-words text-2xl font-semibold tracking-tight text-foreground">
            แก้ไขบันทึกเยี่ยมบ้าน
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            ปรับปรุงข้อมูลของ {record.studentName} โดยไม่เปลี่ยนผู้บันทึกหรือภาคเรียน
          </p>
        </div>
      </div>

      <HomeVisitEditForm record={record} studentOptions={studentOptions} />
    </PageShell>
  )
}
