import React from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { PageShell } from "@/components/dashboard/page-shell"
import { ErrorState } from "@/components/feedback/error-state"
import { getStudentWorklist } from "@/lib/server/student-care-read-models"
import { HomeVisitForm } from "./_components/home-visit-form"

export default async function RecordHomeVisitPage() {
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

  const studentOptions = students.map((s) => ({
    id: s.studentId,
    name: s.fullName,
    classroom: s.classroomName ?? undefined,
    code: s.studentCode,
  }))

  return (
    <PageShell>
      <div className="flex items-center gap-4 mb-6">
        <Link href="/home-visits">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            บันทึกการเยี่ยมบ้าน
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            บันทึกข้อมูลการเยี่ยมบ้านและอัปโหลดหลักฐาน
          </p>
        </div>
      </div>

      <HomeVisitForm studentOptions={studentOptions} />
    </PageShell>
  )
}
