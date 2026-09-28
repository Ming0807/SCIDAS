import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { getStudents } from "@/app/actions/student.actions"
import { PageHeader, PageShell } from "@/components/dashboard"
import { buttonVariants } from "@/components/ui/button"
import { EmptyState } from "@/components/feedback/empty-state"
import { cn } from "@/lib/utils"
import { ReferralForm } from "../_components/referral-form"

type NewReferralPageProps = {
  searchParams?: Promise<{
    studentId?: string
  }>
}

export const metadata = {
  title: "บันทึกการส่งต่อนักเรียนใหม่ | SCIDAS",
  description: "สร้างบันทึกการส่งต่อนักเรียนทั้งภายในสถานศึกษาและภายนอกสถานศึกษา",
}

export default async function NewReferralPage({
  searchParams,
}: NewReferralPageProps) {
  const params = searchParams ? await searchParams : {}
  const preselectedStudentId = params.studentId

  const students = await getStudents()

  return (
    <PageShell size="default" spacing="default">
      <PageHeader
        title="สร้างเคสส่งต่อนักเรียน (Referral Form)"
        description="แบบบันทึกการส่งต่อนักเรียนไปยังครูแนะแนว/ฝ่ายที่เกี่ยวข้อง หรือส่งต่อไปยังหน่วยงานภายนอกสถานศึกษา"
        actions={
          <Link
            href="/referrals"
            className={cn(buttonVariants({ variant: "outline" }))}
          >
            <ArrowLeft className="size-4 mr-1.5" />
            กลับหน้ารายการ
          </Link>
        }
      />

      {students.length === 0 ? (
        <EmptyState
          title="ยังไม่มีข้อมูลนักเรียน"
          description="เพิ่มข้อมูลนักเรียนก่อนสร้างเคสส่งต่อ"
          action={
            <Link href="/students/new" className={cn(buttonVariants())}>
              เพิ่มนักเรียน
            </Link>
          }
        />
      ) : (
        <ReferralForm
          students={students}
          preselectedStudentId={preselectedStudentId}
        />
      )}
    </PageShell>
  )
}
