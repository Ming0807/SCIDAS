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

  // Fetch linked addresses for students to auto-fill visit address
  const studentIds = students.map((s) => s.studentId)
  const addressMap = new Map<string, string>()

  if (studentIds.length > 0) {
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

  const studentOptions = students.map((s) => ({
    id: s.studentId,
    name: s.fullName,
    classroom: s.classroomName ?? undefined,
    code: s.studentCode,
    address: addressMap.get(s.studentId) || "",
  }))

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
