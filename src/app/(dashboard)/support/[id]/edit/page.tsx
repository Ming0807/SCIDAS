import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { notFound } from "next/navigation"

import { getSupportRecord } from "@/app/actions/support.actions"
import { getStudents } from "@/app/actions/student.actions"
import { SupportCaseForm } from "@/app/(dashboard)/support/_components/support-case-form"
import { ErrorState } from "@/components/feedback"
import { Button } from "@/components/ui/button"

type SupportCaseEditPageProps = {
  params: Promise<{ id: string }>
}

export default async function SupportCaseEditPage({ params }: SupportCaseEditPageProps) {
  const { id } = await params
  const [caseResult, students] = await Promise.all([getSupportRecord(id), getStudents()])

  if (!caseResult.ok && caseResult.code === "NOT_FOUND") notFound()
  if (!caseResult.ok || !caseResult.data) {
    return (
      <main className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6">
        <ErrorState
          title="โหลดเคสเพื่อแก้ไขไม่ได้"
          description={caseResult.ok ? "ไม่พบข้อมูลเคส" : caseResult.message}
        />
      </main>
    )
  }

  if (!caseResult.data.canEdit) {
    return (
      <main className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6">
        <ErrorState
          title="คุณไม่มีสิทธิ์แก้ไขเคสนี้"
          description="โปรดติดต่อผู้ดูแลระบบหรือทีมดูแลช่วยเหลือนักเรียน"
        />
      </main>
    )
  }

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-6 sm:px-6 lg:py-8">
      <header className="flex items-start gap-3 sm:items-center">
        <Button nativeButton={false} variant="outline" size="icon" render={<Link href={`/support/${id}`} />} aria-label="กลับไปดูรายละเอียดเคส">
          <ArrowLeft aria-hidden="true" />
        </Button>
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">แก้ไขเคสช่วยเหลือ</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">{caseResult.data.title}</h1>
        </div>
      </header>

      <SupportCaseForm students={students} initialCase={caseResult.data} />
    </main>
  )
}
