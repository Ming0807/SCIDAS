import { StudentForm } from "./_components/student-form"
import { notFound } from "next/navigation"
import { getCurrentUserContext } from "@/lib/server/current-user"
import { getClassroomOptions } from "@/lib/server/executive-read-models"

export default async function NewStudentPage() {
  const context = await getCurrentUserContext()
  if (!["admin", "homeroom_teacher", "counselor"].includes(context.role)) {
    notFound()
  }
  const classrooms = await getClassroomOptions().catch(() => [])
  return <StudentForm mode="create" classrooms={classrooms} />
}
