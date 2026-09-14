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
  const classroomId = typeof query.classroomId === "string" ? query.classroomId : undefined

  let academicData: Awaited<ReturnType<typeof getClassroomAcademicData>>

  try {
    academicData = await getClassroomAcademicData(semesterId, classroomId)
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
        title="บันทึกผลการเรียนและวิเคราะห์ผลสัมฤทธิ์"
        description="ตรวจสอบคะแนนเก็บ กลางภาค ปลายภาค คำนวณเกรดเฉลี่ย GPA และเฝ้าระวังกลุ่มเสี่ยงทางวิชาการ"
        metadata={
          <>
            <span className="font-medium text-foreground">ห้อง {academicData.classroom.name}</span>
            <span aria-hidden="true">•</span>
            <span>{currentSemester?.name ?? "ยังไม่ได้เลือกภาคเรียน"}</span>
            <span aria-hidden="true">•</span>
            <span>นักเรียน {academicData.students.length} คน</span>
          </>
        }
      />

      {academicData.currentSemesterId ? (
        <AcademicForm
          key={`${academicData.currentSemesterId}-${academicData.classroom.id}`}
          classroom={academicData.classroom}
          classrooms={academicData.classrooms}
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
