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

  // Fetch linked addresses and student/guardian details for students
  const studentIds = students.map((s) => s.studentId)
  const addressMap = new Map<string, string>()
  const studentMetaMap = new Map<string, {
    address: string
    distanceToSchoolKm: number | null
    travelMethod: string | null
    familyStatus: string | null
  }>()
  const guardianMetaMap = new Map<string, {
    occupation: string | null
    monthlyIncome: number | null
    relation: string | null
  }>()

  if (studentIds.length > 0) {
    const { createClient } = await import("@/utils/supabase/server")
    const supabase = await createClient()
    const [studentRes, guardianRes] = await Promise.all([
      supabase
        .from("students")
        .select("id, address, subdistrict, district, province, postal_code, distance_to_school_km, travel_method, family_status")
        .in("id", studentIds),
      supabase
        .from("student_guardians")
        .select("student_id, relation, guardians(occupation, monthly_income)")
        .in("student_id", studentIds)
        .eq("is_primary", true),
    ])

    if (studentRes.data) {
      for (const row of studentRes.data) {
        const addr = (row.address || "").trim()
        const hasSubdistrict = Boolean(row.subdistrict && addr.includes(row.subdistrict))
        const hasDistrict = Boolean(row.district && addr.includes(row.district))
        const hasProvince = Boolean(row.province && addr.includes(row.province))
        const hasPostalCode = Boolean(row.postal_code && addr.includes(row.postal_code))

        const parts = [
          addr || null,
          !hasSubdistrict && row.subdistrict
            ? row.subdistrict.startsWith("ต.") ? row.subdistrict : `ต.${row.subdistrict}`
            : null,
          !hasDistrict && row.district
            ? row.district.startsWith("อ.") ? row.district : `อ.${row.district}`
            : null,
          !hasProvince && row.province
            ? row.province.startsWith("จ.") ? row.province : `จ.${row.province}`
            : null,
          !hasPostalCode && row.postal_code ? row.postal_code : null,
        ].filter(Boolean)

        const resolvedAddress = parts.join(" ")
        if (resolvedAddress) {
          addressMap.set(row.id, resolvedAddress)
        }

        studentMetaMap.set(row.id, {
          address: resolvedAddress,
          distanceToSchoolKm: row.distance_to_school_km !== null ? Number(row.distance_to_school_km) : null,
          travelMethod: row.travel_method || null,
          familyStatus: row.family_status || null,
        })
      }
    }

    if (guardianRes.data) {
      for (const item of guardianRes.data) {
        const g = item.guardians as unknown as { occupation: string | null; monthly_income: number | null } | null
        guardianMetaMap.set(item.student_id, {
          occupation: g?.occupation || null,
          monthlyIncome: g?.monthly_income !== null && g?.monthly_income !== undefined ? Number(g.monthly_income) : null,
          relation: item.relation || null,
        })
      }
    }
  }

  const studentOptions = students.map((student) => {
    const meta = studentMetaMap.get(student.studentId)
    const gMeta = guardianMetaMap.get(student.studentId)
    return {
      id: student.studentId,
      name: student.fullName,
      classroom: student.classroomName ?? undefined,
      code: student.studentCode,
      address: meta?.address || addressMap.get(student.studentId) || "",
      distanceToSchoolKm: meta?.distanceToSchoolKm ?? null,
      travelMethod: meta?.travelMethod ?? null,
      familyStatus: meta?.familyStatus ?? null,
      guardianOccupation: gMeta?.occupation ?? null,
      guardianMonthlyIncome: gMeta?.monthlyIncome ?? null,
      guardianRelation: gMeta?.relation ?? null,
    }
  })

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
