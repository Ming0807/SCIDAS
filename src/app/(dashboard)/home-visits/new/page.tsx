import React from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { PageShell } from "@/components/dashboard/page-shell"
import { ErrorState } from "@/components/feedback/error-state"
import { createClient } from "@/utils/supabase/server"
import { getStudentWorklist } from "@/lib/server/student-care-read-models"
import { HomeVisitForm } from "./_components/home-visit-form"

type RecordHomeVisitPageProps = {
  searchParams?: Promise<{ studentId?: string }>
}

export default async function RecordHomeVisitPage({ searchParams }: RecordHomeVisitPageProps) {
  const resolvedParams = searchParams ? await searchParams : {}
  const defaultStudentId = resolvedParams.studentId

  let students: Awaited<ReturnType<typeof getStudentWorklist>>

  try {
    students = await getStudentWorklist({})
  } catch {
    return (
      <PageShell>
        <ErrorState
          title="ไม่สามารถโหลดข้อมูลนักเรียนได้"
          description="กรุณาลองใหม่อีกครั้ง"
        />
      </PageShell>
    )
  }

  // Fetch linked addresses and student/guardian details to auto-fill visit form
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

    // Fallback: check recent home visit address for students who don't have an address in profile
    const missingIds = studentIds.filter((id) => !addressMap.has(id))
    if (missingIds.length > 0) {
      const { data: visitRows } = await supabase
        .from("home_visits")
        .select("student_id, address_visited, visit_date")
        .in("student_id", missingIds)
        .not("address_visited", "is", null)
        .order("visit_date", { ascending: false })

      if (visitRows) {
        for (const v of visitRows) {
          if (v.address_visited && !addressMap.has(v.student_id)) {
            addressMap.set(v.student_id, v.address_visited)
          }
        }
      }
    }
  }

  const studentOptions = students.map((s) => {
    const meta = studentMetaMap.get(s.studentId)
    const gMeta = guardianMetaMap.get(s.studentId)
    return {
      id: s.studentId,
      name: s.fullName,
      classroom: s.classroomName ?? undefined,
      code: s.studentCode,
      address: meta?.address || addressMap.get(s.studentId) || "",
      distanceToSchoolKm: meta?.distanceToSchoolKm ?? null,
      travelMethod: meta?.travelMethod ?? null,
      familyStatus: meta?.familyStatus ?? null,
      guardianOccupation: gMeta?.occupation ?? null,
      guardianMonthlyIncome: gMeta?.monthlyIncome ?? null,
      guardianRelation: gMeta?.relation ?? null,
    }
  })

  return (
    <PageShell>
      <div className="flex items-center gap-4 mb-6">
        <Button nativeButton={false} variant="ghost" size="icon" className="rounded-full" aria-label="กลับไปรายการเยี่ยมบ้าน" render={<Link href="/home-visits" />}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            บันทึกการเยี่ยมบ้าน
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            บันทึกข้อมูลการเยี่ยมบ้านและอัปโหลดหลักฐาน
          </p>
        </div>
      </div>

      <HomeVisitForm
        studentOptions={studentOptions}
        defaultStudentId={defaultStudentId}
      />
    </PageShell>
  )

}
