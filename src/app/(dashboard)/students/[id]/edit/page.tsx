import { notFound } from "next/navigation"

import { getStudentById } from "@/app/actions/student.actions"

import { StudentForm } from "../../new/_components/student-form"
import { getCurrentUserContext } from "@/lib/server/current-user"

type EditStudentPageProps = {
  params: Promise<{ id: string }>
}

export default async function EditStudentPage({ params }: EditStudentPageProps) {
  const { id } = await params
  const context = await getCurrentUserContext()
  if (!["admin", "homeroom_teacher", "counselor"].includes(context.role)) {
    notFound()
  }
  const student = await getStudentById(id)

  if (!student) {
    notFound()
  }

  return <StudentForm mode="edit" student={student} />
}
