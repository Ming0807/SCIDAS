import { FileCheck2 } from "lucide-react"

import { MetricCard } from "@/components/dashboard/metric-card"
import { EmptyState } from "@/components/feedback/empty-state"
import { ErrorState } from "@/components/feedback/error-state"
import { getAssignmentDashboard } from "@/lib/server/assignment-read-models"
import { getStudentWorklist } from "@/lib/server/student-care-read-models"
import { getCurrentUserContext } from "@/lib/server/current-user"

import { AssignmentManager } from "./assignment-manager"

export async function AssignmentPanel() {
  const context = await getCurrentUserContext()
  const canCreate = ["admin", "homeroom_teacher", "subject_teacher", "counselor"].includes(context.role)

  let dashboard: Awaited<ReturnType<typeof getAssignmentDashboard>>
  let studentOptions: Array<{ id: string; name: string; classroom: string | null }> = []
  try {
    ;[dashboard] = await Promise.all([getAssignmentDashboard()])
    try {
      const worklist = await getStudentWorklist({ limit: 200 })
      studentOptions = worklist.map((s) => ({
        id: s.studentId,
        name: s.fullName,
        classroom: s.classroomName,
      }))
    } catch {
      studentOptions = []
    }
  } catch {
    return (
      <section aria-label="การส่งงาน" className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <ErrorState
          title="ไม่สามารถโหลดข้อมูลการส่งงานได้"
          description="กรุณาลองใหม่อีกครั้ง"
        />
      </section>
    )
  }

  return (
    <section aria-label="การส่งงาน" className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <span className="inline-flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <FileCheck2 className="size-4.5" aria-hidden="true" />
        </span>
        <div>
          <h2 className="text-base font-semibold text-foreground">การส่งงาน</h2>
          <p className="text-xs text-muted-foreground">
            มอบหมายงาน ติดตามสถานะ ส่งแล้ว {dashboard.summary.submitted} • ส่งช้า {dashboard.summary.late} • ไม่ส่ง {dashboard.summary.notSubmitted} • อัตราส่ง {dashboard.summary.submissionRate}%
          </p>
        </div>
      </div>

      <div className="mb-5 grid grid-cols-2 gap-3 xl:grid-cols-4">
        <MetricCard title="งานทั้งหมด" value={dashboard.summary.total.toLocaleString("th-TH")} status="info" />
        <MetricCard
          title="ส่งแล้ว"
          value={dashboard.summary.submitted.toLocaleString("th-TH")}
          description={`อัตราส่ง ${dashboard.summary.submissionRate}%`}
          status="success"
        />
        <MetricCard title="ส่งช้า" value={dashboard.summary.late.toLocaleString("th-TH")} status="warning" />
        <MetricCard title="ไม่ส่ง" value={dashboard.summary.notSubmitted.toLocaleString("th-TH")} status="danger" />
      </div>

      {dashboard.recent.length === 0 && !canCreate ? (
        <EmptyState
          title="ยังไม่มีงานที่มอบหมาย"
          description="เมื่อครูมอบหมายงาน รายการและสถานะการส่งจะแสดงที่นี่"
        />
      ) : (
        <AssignmentManager
          recent={dashboard.recent}
          subjects={dashboard.subjects}
          students={studentOptions}
          canCreate={canCreate}
        />
      )}
    </section>
  )
}
