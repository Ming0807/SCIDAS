import Link from "next/link"
import { ArrowLeft, BookOpen, ShieldCheck } from "lucide-react"

import { PageHeader } from "@/components/dashboard/page-header"
import { PageShell } from "@/components/dashboard/page-shell"
import { Button } from "@/components/ui/button"
import { ErrorState } from "@/components/feedback/error-state"
import { PermissionState } from "@/components/feedback/permission-state"
import { getCurrentUserContext } from "@/lib/server/current-user"
import { getStaffManagementData } from "@/lib/server/staff-read-models"

import { StaffManager } from "./_components/staff-manager"

export const metadata = {
  title: "จัดการบุคลากรและครูประจำชั้น (Staff Management) | SCIDAS",
  description: "จัดการรายชื่อบุคลากร กำหนดบทบาทสิทธิ์ และมอบหมายครูประจำชั้นรายห้องเรียน",
}

export default async function StaffManagementPage() {
  let context
  try {
    context = await getCurrentUserContext()
  } catch {
    return (
      <PageShell>
        <PermissionState
          title="จำเป็นต้องเข้าสู่ระบบ"
          description="กรุณาเข้าสู่ระบบเพื่อจัดการข้อมูลบุคลากรและครูประจำชั้น"
          action={
            <Link
              href="/auth/login"
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
            >
              เข้าสู่ระบบ
            </Link>
          }
        />
      </PageShell>
    )
  }

  if (!context?.schoolId || !["admin", "director", "counselor"].includes(context.role)) {
    return (
      <PageShell>
        <PermissionState
          title="ไม่มีสิทธิ์เข้าถึงหน้านี้"
          description="เฉพาะผู้ดูแลระบบ ผู้อำนวยการ หรือครูแนะแนวเท่านั้นที่สามารถเข้าถึงการจัดการบุคลากรได้"
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

  let staffData
  let loadError: string | null = null

  try {
    staffData = await getStaffManagementData()
  } catch (error) {
    loadError = error instanceof Error ? error.message : "ไม่สามารถโหลดข้อมูลบุคลากรได้"
  }

  if (loadError || !staffData) {
    return (
      <PageShell>
        <PageHeader
          title="จัดการบุคลากรและครูประจำชั้น (Staff Management)"
          description="บริหารจัดการบัญชีผู้ใช้งาน สิทธิ์การเข้าถึงระบบดูแลช่วยเหลือนักเรียน และมอบหมายหน้าที่ครูประจำชั้นประจำห้องเรียน"
          actions={
            <Link href="/settings">
              <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                <ArrowLeft className="size-4" />
                กลับหน้าการตั้งค่า
              </Button>
            </Link>
          }
        />
        <ErrorState
          title="เกิดข้อผิดพลาดในการโหลดข้อมูลบุคลากร"
          description={loadError || "ไม่สามารถติดต่อฐานข้อมูลได้ กรุณาลองใหม่อีกครั้ง"}
        />
      </PageShell>
    )
  }

  return (
    <PageShell size="wide" spacing="default">
      <PageHeader
        title="จัดการบุคลากรและครูประจำชั้น (Staff & Homeroom Management)"
        description="บริหารจัดการบัญชีผู้ใช้งาน สิทธิ์การเข้าถึงระบบดูแลช่วยเหลือนักเรียน และมอบหมายหน้าที่ครูประจำชั้นประจำห้องเรียน"
        actions={
          <div className="flex items-center gap-2">
            <Link href="/settings">
              <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                <ArrowLeft className="size-4" />
                กลับหน้าการตั้งค่า
              </Button>
            </Link>
            <Link href="/settings/academic">
              <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                <BookOpen className="size-4" />
                โครงสร้างวิชาการ
              </Button>
            </Link>
            <Link href="/settings/audit-logs">
              <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                <ShieldCheck className="size-4" />
                บันทึกความปลอดภัย
              </Button>
            </Link>
          </div>
        }
      />

      <StaffManager initialData={JSON.parse(JSON.stringify(staffData))} />
    </PageShell>
  )
}
