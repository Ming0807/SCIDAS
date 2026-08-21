import { getStudents } from "@/app/actions/student.actions"
import { ErrorState } from "@/components/feedback/error-state"
import { PageHeader } from "@/components/dashboard/page-header"
import { PageShell } from "@/components/dashboard/page-shell"
import { getCurrentUserContext } from "@/lib/server/current-user"
import { createClient } from "@/utils/supabase/server"

import { PlanForm, type PlanSemesterOption, type PlanStudentOption } from "../_components/plan-form"
import { canEditDevelopmentPlans } from "../_lib/permissions"

async function getPlanOptions(schoolId: string) {
  const client = await createClient()
  const [students, semesterResult] = await Promise.all([
    getStudents(),
    client
      .from("semesters")
      .select("id, semester, start_date, end_date, is_current, academic_year_id")
      .eq("school_id", schoolId)
      .order("start_date", { ascending: false })
      .limit(12),
  ])

  if (semesterResult.error) throw new Error(semesterResult.error.message)

  const yearIds = [...new Set((semesterResult.data ?? []).map((semester) => semester.academic_year_id))]
  const { data: years, error: yearError } = yearIds.length
    ? await client.from("academic_years").select("id, year").in("id", yearIds).eq("school_id", schoolId)
    : { data: [], error: null }
  if (yearError) throw new Error(yearError.message)

  const yearMap = new Map((years ?? []).map((year) => [year.id, String(year.year)]))
  return {
    students: students
      .filter((student) => student.status === "active")
      .map((student): PlanStudentOption => ({
        id: student.id,
        student_code: student.student_code,
        prefix: student.prefix,
        first_name: student.first_name,
        last_name: student.last_name,
        status: student.status,
      })),
    semesters: (semesterResult.data ?? []).map((semester): PlanSemesterOption => ({
      id: semester.id,
      semester: semester.semester,
      start_date: semester.start_date,
      end_date: semester.end_date,
      academic_year_label: yearMap.get(semester.academic_year_id) ?? "ไม่ระบุปีการศึกษา",
      is_current: semester.is_current,
    })),
  }
}

export default async function NewDevelopmentPlanPage() {
  let context: Awaited<ReturnType<typeof getCurrentUserContext>>
  try {
    context = await getCurrentUserContext()
  } catch {
    return <PageShell><ErrorState title="ไม่สามารถตรวจสอบสิทธิ์ได้" description="กรุณาเข้าสู่ระบบใหม่แล้วลองอีกครั้ง" /></PageShell>
  }

  if (!canEditDevelopmentPlans(context.role)) {
    return <PageShell><ErrorState title="คุณไม่มีสิทธิ์สร้างแผนพัฒนา" description="เฉพาะผู้ดูแลระบบ ครูที่ปรึกษา และครูแนะแนวเท่านั้นที่สร้างแผนได้" /></PageShell>
  }

  let options: Awaited<ReturnType<typeof getPlanOptions>>
  try {
    options = await getPlanOptions(context.schoolId)
  } catch {
    return <PageShell><ErrorState title="ไม่สามารถเตรียมแบบฟอร์มสร้างแผนได้" description="กรุณาลองใหม่อีกครั้ง หรือตรวจสอบข้อมูลนักเรียนและภาคเรียน" /></PageShell>
  }

  return (
    <PageShell>
      <PageHeader title="สร้างแผนพัฒนารายบุคคล" description="บันทึกแผนที่ช่วยให้ทีมดูแลนักเรียนติดตามเป้าหมายและผลลัพธ์ได้ต่อเนื่อง" />
      <PlanForm mode="create" {...options} />
    </PageShell>
  )
}
