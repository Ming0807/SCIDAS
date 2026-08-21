import { StudentForm } from "./_components/student-form"
import { notFound } from "next/navigation"
import { getCurrentUserContext } from "@/lib/server/current-user"

export default async function NewStudentPage() {
  const context = await getCurrentUserContext()
  if (!["admin", "homeroom_teacher", "counselor"].includes(context.role)) {
    notFound()
  }
  return <StudentForm mode="create" />
}
