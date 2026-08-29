import React from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { PageHeader } from "@/components/dashboard/page-header"
import { PageShell } from "@/components/dashboard/page-shell"
import { PermissionState } from "@/components/feedback/permission-state"
import { getStudentImportContext } from "@/lib/server/student-import-service"
import { StudentImportClient } from "./_components/student-import-client"

export default async function StudentImportPage() {
  const context = await getStudentImportContext()

  if (!context.canImport) {
    return (
      <PageShell>
        <PermissionState
          title="ไม่มีสิทธิ์นำเข้าข้อมูลนักเรียน"
          description="เฉพาะผู้ดูแลระบบ ผู้อำนวยการ หรือครูประจำชั้นที่มีห้องเรียนที่ได้รับมอบหมายเท่านั้นที่สามารถนำเข้าข้อมูลนักเรียนได้"
          action={
            <Link
              href="/students"
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
            >
              กลับหน้ารายชื่อนักเรียน
            </Link>
          }
        />
      </PageShell>
    )
  }

  return (
    <PageShell size="wide" spacing="default">
      <PageHeader
        title="นำเข้าข้อมูลนักเรียน"
        description="นำเข้ารายชื่อนักเรียนและข้อมูลผู้ปกครองจากไฟล์ CSV เข้าสู่ห้องเรียนและภาคเรียนที่กำหนด"
        actions={
          <Link
            href="/students"
            className="inline-flex items-center gap-1.5 rounded-lg border border-input bg-background px-3 py-1.5 text-sm font-medium hover:bg-muted shadow-sm transition-colors"
          >
            <ArrowLeft className="size-4" />
            กลับหน้ารายชื่อนักเรียน
          </Link>
        }
      />

      <StudentImportClient context={context} />
    </PageShell>
  )
}
