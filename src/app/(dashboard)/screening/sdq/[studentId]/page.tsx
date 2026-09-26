import { notFound } from "next/navigation"
import { getStudentCareProfile } from "@/lib/server/student-care-read-models"
import { getCurrentUserContext } from "@/lib/server/current-user"
import { PageShell } from "@/components/dashboard"
import { SdqAssessmentForm } from "../_components/sdq-assessment-form"
import { SdqHistory } from "../_components/sdq-history"
import { getSdqAssessments } from "@/app/actions/sdq.actions"

interface SdqStudentPageProps {
  params: Promise<{ studentId: string }>
}

export default async function SdqStudentPage({ params }: SdqStudentPageProps) {
  const { studentId } = await params
  const [profile, context] = await Promise.all([
    getStudentCareProfile(studentId),
    getCurrentUserContext().catch(() => null),
  ])

  if (!profile) {
    notFound()
  }

  const assessments = await getSdqAssessments(studentId).catch(() => [])
  const canDelete =
    context !== null &&
    ["admin", "homeroom_teacher", "counselor"].includes(context.role)

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
      <div className="mt-6">
        <SdqHistory assessments={assessments} canDelete={canDelete} />
      </div>
    </PageShell>
  )
}
