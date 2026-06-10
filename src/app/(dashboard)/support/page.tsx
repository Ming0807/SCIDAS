import Link from "next/link"
import { CalendarClock, HeartHandshake, ListChecks, Plus, ShieldAlert } from "lucide-react"

import { MetricCard, PageHeader, PageShell, StatusBadge, StudentIdentity } from "@/components/dashboard"
import { DataTable, type DataTableColumn } from "@/components/data"
import { EmptyState, ErrorState } from "@/components/feedback"
import { buttonVariants } from "@/components/ui/button"
import {
  formatClassroomSection,
  formatGradeLevel,
  formatThaiShortDate,
  getStudentRiskLabel,
  getStudentRiskTone,
} from "@/lib/student-care-formatters"
import {
  getStudentCareDashboard,
  type ActionQueueItem,
  type StudentCareDashboard,
  type StudentWorklistItem,
} from "@/lib/server/student-care-read-models"
import { cn } from "@/lib/utils"

const emptyDashboard: StudentCareDashboard = {
  currentSemesterId: null,
  metrics: {
    totalStudents: 0,
    highRiskStudents: 0,
    watchStudents: 0,
    openSupportCases: 0,
    activePlans: 0,
    openActionItems: 0,
    averageAttendance30d: null,
  },
  priorityStudents: [],
  actionQueue: [],
}

function getPriorityTone(priority: ActionQueueItem["priority"]) {
  if (priority === "critical" || priority === "high") return "high-risk"
  if (priority === "medium") return "watch"
  return "normal"
}

function getPriorityLabel(priority: ActionQueueItem["priority"]) {
  const labels: Record<ActionQueueItem["priority"], string> = {
    low: "ต่ำ",
    medium: "กลาง",
    high: "สูง",
    critical: "เร่งด่วน",
  }

  return labels[priority]
}

const actionColumns: Array<DataTableColumn<ActionQueueItem>> = [
  {
    id: "title",
    header: "งานดูแล",
    className: "min-w-64",
    cell: (item) => (
      <div className="min-w-0 space-y-1">
        <p className="truncate font-medium text-foreground">{item.title}</p>
        <p className="truncate text-sm text-muted-foreground">
          {item.studentName ?? "ไม่ระบุนักเรียน"} / {item.category}
        </p>
      </div>
    ),
  },
  {
    id: "priority",
    header: "ความสำคัญ",
    cell: (item) => (
      <StatusBadge
        status={getPriorityTone(item.priority)}
        label={getPriorityLabel(item.priority)}
        size="sm"
      />
    ),
  },
  {
    id: "due",
    header: "กำหนด",
    cell: (item) => (
      <span className="text-muted-foreground">{formatThaiShortDate(item.dueDate)}</span>
    ),
  },
  {
    id: "status",
    header: "สถานะ",
    align: "right",
    cell: (item) => (
      <StatusBadge
        status={item.status === "in_progress" ? "info" : "watch"}
        label={item.status === "in_progress" ? "กำลังทำ" : "รอดำเนินการ"}
        size="sm"
      />
    ),
  },
]

function StudentCareCard({ student }: { student: StudentWorklistItem }) {
  return (
    <Link
      href={`/students/${student.studentId}`}
      className="rounded-xl border border-border bg-card p-4 text-card-foreground shadow-sm transition-colors hover:bg-muted/30"
    >
      <div className="flex items-start justify-between gap-3">
        <StudentIdentity
          avatarUrl={student.photoUrl ?? ""}
          name={student.fullName}
          studentCode={student.studentCode}
          grade={formatGradeLevel(student.gradeLevel)}
          classroom={formatClassroomSection(student.section)}
          status={getStudentRiskTone(student.riskLevel)}
          statusLabel={getStudentRiskLabel(student.riskLevel)}
          size="sm"
        />
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
        <div className="rounded-lg border border-border bg-background p-2">
          <p className="text-muted-foreground">เคส</p>
          <p className="mt-1 font-semibold tabular-nums text-foreground">
            {student.openSupportCount.toLocaleString("th-TH")}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-background p-2">
          <p className="text-muted-foreground">แผน</p>
          <p className="mt-1 font-semibold tabular-nums text-foreground">
            {student.activePlanCount.toLocaleString("th-TH")}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-background p-2">
          <p className="text-muted-foreground">งาน</p>
          <p className="mt-1 font-semibold tabular-nums text-foreground">
            {student.openActionCount.toLocaleString("th-TH")}
          </p>
        </div>
      </div>
    </Link>
  )
}

export default async function SupportPage() {
  let dashboard = emptyDashboard
  let loadError: string | null = null

  try {
    dashboard = await getStudentCareDashboard()
  } catch (error) {
    loadError = error instanceof Error ? error.message : "Unknown support data error"
  }

  const studentsNeedingCare = dashboard.priorityStudents.filter(
    (student) =>
      student.openSupportCount > 0 ||
      student.activePlanCount > 0 ||
      student.openActionCount > 0 ||
      student.riskLevel !== "normal",
  )

  return (
    <PageShell size="wide" spacing="default">
      <PageHeader
        title="ดูแลช่วยเหลือ"
        description="ติดตามเคส แผนพัฒนา และงานดูแลที่ต้องดำเนินการต่อ"
        actions={
          <Link href="/support/new" className={cn(buttonVariants())}>
            <Plus /> สร้างเคสดูแล
          </Link>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="เคสดูแลเปิดอยู่"
          value={dashboard.metrics.openSupportCases.toLocaleString("th-TH")}
          description="รายการ support_records ที่ยังไม่ปิด"
          icon={HeartHandshake}
          status="info"
          size="compact"
        />
        <MetricCard
          title="แผนกำลังติดตาม"
          value={dashboard.metrics.activePlans.toLocaleString("th-TH")}
          description="แผนพัฒนารายบุคคลที่ active"
          icon={ShieldAlert}
          status="primary"
          size="compact"
        />
        <MetricCard
          title="งานดูแลค้าง"
          value={dashboard.metrics.openActionItems.toLocaleString("th-TH")}
          description="action_items สถานะ todo/in_progress"
          icon={ListChecks}
          status={dashboard.metrics.openActionItems > 0 ? "watch" : "normal"}
          size="compact"
        />
        <MetricCard
          title="ใกล้ครบกำหนด"
          value={dashboard.actionQueue.filter((item) => item.dueDate).length.toLocaleString("th-TH")}
          description="งานที่มีวันครบกำหนด"
          icon={CalendarClock}
          status="watch"
          size="compact"
        />
      </div>

      {loadError ? (
        <ErrorState
          title="โหลดข้อมูลงานดูแลไม่ได้"
          description="ตรวจสอบว่า Supabase ใช้ migration 0008_ux_data_foundation.sql แล้ว และผู้ใช้มีสิทธิ์เข้าถึงโรงเรียนนี้"
          details={loadError}
        />
      ) : null}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(360px,1fr)]">
        <DataTable
          className="min-h-[460px]"
          columns={actionColumns}
          data={dashboard.actionQueue}
          emptyState={
            <EmptyState
              title="ยังไม่มีงานดูแลค้าง"
              description="เมื่อตรวจพบความเสี่ยงหรือสร้างเคส ระบบจะรวมงานที่ต้องติดตามไว้ตรงนี้"
            />
          }
          getRowKey={(item) => item.id}
          toolbar={
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0 space-y-1">
                <h2 className="text-sm font-semibold text-foreground">Action queue</h2>
                <p className="text-sm text-muted-foreground">
                  งานดูแลที่ต้องมีผู้รับผิดชอบและปิดผลให้เรียบร้อย
                </p>
              </div>
              <Link
                href="/students?status=high"
                className="text-xs font-medium text-primary hover:underline"
              >
                ดูนักเรียนเสี่ยงสูง
              </Link>
            </div>
          }
        />

        <section className="flex min-w-0 flex-col gap-3">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-foreground">นักเรียนที่ต้องดูแลต่อ</h2>
            <p className="text-sm text-muted-foreground">
              เรียงจาก priority score พร้อมจำนวนเคส แผน และงานที่เปิดอยู่
            </p>
          </div>

          {studentsNeedingCare.length > 0 ? (
            <div className="grid grid-cols-1 gap-3">
              {studentsNeedingCare.slice(0, 6).map((student) => (
                <StudentCareCard key={student.studentId} student={student} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="ยังไม่มีนักเรียนในรายการดูแลต่อ"
              description="เมื่อมีความเสี่ยงหรือเปิดเคส ระบบจะจัดรายชื่อให้อัตโนมัติ"
            />
          )}
        </section>
      </div>
    </PageShell>
  )
}
