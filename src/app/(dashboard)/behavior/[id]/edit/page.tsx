import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { notFound } from "next/navigation"

import { getStudents } from "@/app/actions/student.actions"
import { Button } from "@/components/ui/button"
import { getBehaviorRecordById } from "@/lib/server/behavior-read-models"
import { getCurrentUserContext } from "@/lib/server/current-user"

import { BehaviorEditForm } from "./_components/behavior-edit-form"

type PageProps = {
  params: Promise<{ id: string }>
}

export default async function EditBehaviorPage({ params }: PageProps) {
  const { id } = await params
  const context = await getCurrentUserContext()
  const [record, students] = await Promise.all([
    getBehaviorRecordById(id),
    getStudents(),
  ])

  if (!record) notFound()
  if (context.role !== "admin" && record.reportedById !== context.profileId) notFound()

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-4 sm:p-6">
      <div className="flex items-start gap-3 sm:items-center sm:gap-4">
        <Button nativeButton={false} variant="outline" size="icon" className="h-8 w-8" aria-label="กลับไปดูรายละเอียดพฤติกรรม" render={<Link href={`/behavior/${record.id}`} />}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            แก้ไขบันทึกพฤติกรรม
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            ปรับปรุงข้อมูลของ {record.studentName} โดยผู้บันทึกเดิมยังคงเดิม
          </p>
        </div>
      </div>

      <BehaviorEditForm record={record} students={students} />
    </div>
  )
}
