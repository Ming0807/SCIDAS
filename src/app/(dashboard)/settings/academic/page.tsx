import React from "react"
import Link from "next/link"
import { ArrowLeft, BookOpen, Calendar } from "lucide-react"

import { PageHeader } from "@/components/dashboard/page-header"
import { PageShell } from "@/components/dashboard/page-shell"
import { MetricCard } from "@/components/dashboard/metric-card"
import { ErrorState } from "@/components/feedback/error-state"
import { PermissionState } from "@/components/feedback/permission-state"
import { getCurrentUserContext } from "@/lib/server/current-user"
import { getAcademicAdminData } from "@/lib/server/academic-admin-read-models"
import { AcademicTabsClient } from "./_components/academic-tabs-client"

export default async function AcademicManagementPage() {
  const context = await getCurrentUserContext()

  if (!["admin", "director"].includes(context.role)) {
    return (
      <PageShell>
        <PermissionState
          title="ไม่มีสิทธิ์เข้าถึงหน้านี้"
          description="เฉพาะผู้ดูแลระบบหรือผู้อำนวยการโรงเรียนเท่านั้นที่สามารถจัดการโครงสร้างวิชาการได้"
          action={
            <Link
              href="/settings"
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
            >
              กลับไปยังหน้าตั้งค่า
            </Link>
          }
        />
      </PageShell>
    )
  }

  let data
  let loadError: string | null = null

  try {
    data = await getAcademicAdminData()
  } catch (error) {
    loadError = error instanceof Error ? error.message : "ไม่สามารถโหลดข้อมูลโครงสร้างวิชาการได้"
  }

  if (loadError || !data) {
    return (
      <PageShell>
        <PageHeader
          title="จัดการโครงสร้างวิชาการ"
          description="กำหนดปีการศึกษา ภาคเรียน ห้องเรียน รายวิชา และมอบหมายครูผู้สอน"
          actions={
            <Link
              href="/settings"
              className="inline-flex items-center gap-1.5 rounded-lg border border-input bg-background px-3 py-1.5 text-sm font-medium hover:bg-muted"
            >
              <ArrowLeft className="size-4" />
              กลับหน้าตั้งค่า
            </Link>
          }
        />
        <ErrorState
          title="เกิดข้อผิดพลาดในการโหลดข้อมูล"
          description={loadError || "ไม่สามารถติดต่อฐานข้อมูลได้ กรุณาลองใหม่อีกครั้ง"}
        />
      </PageShell>
    )
  }

  return (
    <PageShell size="wide" spacing="default">
      <PageHeader
        title="จัดการโครงสร้างวิชาการ"
        description="กำหนดปีการศึกษา ภาคเรียน ห้องเรียน รายวิชา และมอบหมายครูผู้สอน"
        actions={
          <Link
            href="/settings"
            className="inline-flex items-center gap-1.5 rounded-lg border border-input bg-background px-3 py-1.5 text-sm font-medium hover:bg-muted shadow-sm transition-colors"
          >
            <ArrowLeft className="size-4" />
            กลับหน้าตั้งค่า
          </Link>
        }
      />

      {/* Overview Metric Cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="ปีการศึกษาปัจจุบัน"
          value={data.currentAcademicYear ? `พ.ศ. ${data.currentAcademicYear.year}` : "ยังไม่ได้ตั้งค่า"}
          description={
            data.currentSemester
              ? `ภาคเรียนที่ ${data.currentSemester.semester === "semester_1" ? "1" : "2"}`
              : "ยังไม่มีภาคเรียนปัจจุบัน"
          }
          icon={Calendar}
          status="primary"
          size="compact"
        />
        <MetricCard
          title="ห้องเรียนทั้งหมด"
          value={`${data.classrooms.length} ห้อง`}
          description={`เปิดใช้งาน ${data.classrooms.filter((c) => c.isActive).length} ห้อง`}
          icon={BookOpen}
          status="normal"
          size="compact"
        />
        <MetricCard
          title="รายวิชาในระบบ"
          value={`${data.subjects.length} วิชา`}
          description={`เปิดสอน ${data.subjects.filter((s) => s.isActive).length} วิชา`}
          icon={BookOpen}
          status="info"
          size="compact"
        />
        <MetricCard
          title="การมอบหมายวิชา"
          value={`${data.classroomSubjects.length} รายการ`}
          description={`ครูผู้สอน ${data.teachers.length} ท่าน`}
          icon={Calendar}
          status="neutral"
          size="compact"
        />
      </div>

      {/* Main Tabs and Content Area */}
      <div className="rounded-xl border border-border bg-card p-5 shadow-sm sm:p-6">
        <AcademicTabsClient data={data} />
      </div>
    </PageShell>
  )
}
