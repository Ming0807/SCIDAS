import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { getStudents } from "@/app/actions/student.actions"
import { Button } from "@/components/ui/button"
import { getCurrentUserContext } from "@/lib/server/current-user"
import { notFound } from "next/navigation"

import { BehaviorRecordForm } from "./_components/behavior-record-form"

export default async function RecordBehaviorPage() {
  const context = await getCurrentUserContext()
  if (!["admin", "homeroom_teacher", "subject_teacher", "counselor"].includes(context.role)) {
    notFound()
  }
  const students = await getStudents()

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-4 sm:p-6">
      <div className="flex items-start gap-3 sm:items-center sm:gap-4">
        <Button nativeButton={false} variant="outline" size="icon" className="h-8 w-8" aria-label="กลับไปภาพรวมพฤติกรรม" render={<Link href="/behavior" />}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            บันทึกพฤติกรรม
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            เพิ่มข้อมูลพฤติกรรมเชิงบวก เชิงลบ หรือทั่วไปของนักเรียน
          </p>
        </div>
      </div>

      <BehaviorRecordForm students={students} />
    </div>
  )
}
