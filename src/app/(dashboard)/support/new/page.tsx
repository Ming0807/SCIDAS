import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { getStudents } from "@/app/actions/student.actions"
import { SupportCaseForm } from "@/app/(dashboard)/support/_components/support-case-form"
import { Button } from "@/components/ui/button"

export default async function NewSupportCasePage() {
  const students = await getStudents()

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-6 sm:px-6 lg:py-8">
      <header className="flex items-start gap-3 sm:items-center">
        <Button nativeButton={false} variant="outline" size="icon" render={<Link href="/support" />} aria-label="กลับไปหน้าดูแลช่วยเหลือ">
          <ArrowLeft aria-hidden="true" />
        </Button>
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">เปิดเคสส่งต่อและช่วยเหลือ</h1>
          <p className="mt-1 text-sm text-muted-foreground">สร้างบันทึกการช่วยเหลือสำหรับนักเรียนในโรงเรียน</p>
        </div>
      </header>

      <SupportCaseForm students={students} />
    </main>
  )
}
