import Link from "next/link"
import { ArrowLeft, BookOpen, ShieldCheck } from "lucide-react"

import { PageHeader, PageShell } from "@/components/dashboard"
import { Button } from "@/components/ui/button"
import { getStaffManagementData } from "@/lib/server/staff-read-models"

import { StaffManager } from "./_components/staff-manager"

export const metadata = {
  title: "จัดการบุคลากรและครูประจำชั้น (Staff Management) | SCIDAS",
  description: "จัดการรายชื่อบุคลากร กำหนดบทบาทสิทธิ์ และมอบหมายครูประจำชั้นรายห้องเรียน",
}

export default async function StaffManagementPage() {
  const staffData = await getStaffManagementData()

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

      <StaffManager initialData={staffData} />
    </PageShell>
  )
}
