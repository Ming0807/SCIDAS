import { PageHeader, PageShell } from "@/components/dashboard"
import { EmptyState } from "@/components/feedback/empty-state"
import { ErrorState } from "@/components/feedback/error-state"
import { getClassroomAcademicData } from "@/app/actions/academic.actions"

import { AcademicForm } from "./academic-form"

type AcademicsPageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function AcademicsPage({ searchParams }: AcademicsPageProps) {
  const query = await searchParams
  const semesterId = typeof query.semesterId === "string" ? query.semesterId : undefined

  let academicData: Awaited<ReturnType<typeof getClassroomAcademicData>>

  try {
    academicData = await getClassroomAcademicData(semesterId)
  } catch {
    return (
      <PageShell size="wide">
        <ErrorState
          title="ไม่สามารถโหลดข้อมูลผลการเรียนได้"
          description="กรุณาลองใหม่อีกครั้ง"
        />
      </PageShell>
    )
  }

  if (!academicData.classroom) {
    return (
      <PageShell size="wide">
        <PageHeader
          title="บันทึกผลการเรียน"
          description="จัดการคะแนนรายวิชาของนักเรียนในห้องเรียนที่รับผิดชอบ"
        />
        <EmptyState
          title="ยังไม่มีห้องเรียนสำหรับบันทึกคะแนน"
          description="ตรวจสอบการกำหนดห้องเรียนหรือสิทธิ์การเข้าถึงของคุณ"
        />
      </PageShell>
    )
  }

  const currentSemester = academicData.semesters.find(
    (semester) => semester.id === academicData.currentSemesterId,
  )

  return (
    <PageShell size="wide" spacing="loose">
      <PageHeader
        title="บันทึกผลการเรียน"
        description="แก้ไขคะแนนเก็บ กลางภาค และปลายภาค พร้อมตรวจสอบคะแนนรวมและเกรดก่อนบันทึก"
        metadata={
          <>
            <span className="font-medium text-foreground">ห้อง {academicData.classroom.name}</span>
            <span aria-hidden="true">•</span>
            <span>{currentSemester?.name ?? "ยังไม่ได้เลือกภาคเรียน"}</span>
          </>
        }
      />

      {academicData.currentSemesterId ? (
        <AcademicForm
          key={academicData.currentSemesterId}
          classroom={academicData.classroom}
          students={academicData.students}
          subjects={academicData.subjects}
          initialScores={academicData.scores}
          semesters={academicData.semesters}
          currentSemesterId={academicData.currentSemesterId}
        />
      ) : (
        <EmptyState
          title="ยังไม่มีภาคเรียนให้บันทึกคะแนน"
          description="เพิ่มภาคเรียนก่อนเริ่มบันทึกผลการเรียน"
        />
      )}
    </PageShell>
  )
}
