import { notFound } from "next/navigation"
import { getStudentCareProfile } from "@/lib/server/student-care-read-models"
import { PageShell } from "@/components/dashboard"
import { SdqAssessmentForm } from "../_components/sdq-assessment-form"

interface SdqStudentPageProps {
  params: Promise<{ studentId: string }>
}

export default async function SdqStudentPage({ params }: SdqStudentPageProps) {
  const { studentId } = await params
  const profile = await getStudentCareProfile(studentId)

  if (!profile) {
    notFound()
  }

  return (
    <PageShell>
      <SdqAssessmentForm
        student={{
          id: profile.studentId,
          name: profile.fullName,
          code: profile.studentCode,
          classroom: profile.classroomName,
        }}
      />
    </PageShell>
  )
}
