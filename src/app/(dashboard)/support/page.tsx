import Link from "next/link"
import {
  CalendarClock,
  HeartHandshake,
  ListChecks,
  Plus,
  ShieldAlert,
} from "lucide-react"

import {
  ActionStatusControls,
  StudentNotesPanel,
  StudentTimelinePanel,
} from "@/components/care"
import {
  MetricCard,
  PageHeader,
  PageShell,
  StatusBadge,
  StudentIdentity,
} from "@/components/dashboard"
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
  getActionQueue,
  getStudentCareDashboard,
  getStudentNotes,
  getStudentTimeline,
  getStudentWorklist,
  type ActionQueueItem,
  type StudentCareDashboard,
  type StudentNoteItem,
  type StudentTimelineItem,
  type StudentWorklistItem,
} from "@/lib/server/student-care-read-models"
import { cn } from "@/lib/utils"

type SearchParams = Record<string, string | string[] | undefined>

type SupportPageProps = {
  searchParams?: Promise<SearchParams>
}

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

function getSearchParam(params: SearchParams, key: string) {
  const value = params[key]

  if (Array.isArray(value)) {
    return value[0] ?? ""
  }

  return value ?? ""
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

function getActionStatusLabel(status: ActionQueueItem["status"]) {
  const labels: Record<ActionQueueItem["status"], string> = {
    todo: "รอดำเนินการ",
    in_progress: "กำลังทำ",
    done: "ปิดแล้ว",
    cancelled: "ยกเลิก",
  }

  return labels[status]
}

function getActionStatusTone(status: ActionQueueItem["status"]) {
  if (status === "done") return "normal"
  if (status === "in_progress") return "info"
  if (status === "cancelled") return "neutral"
  return "watch"
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
    cell: (item) => (
      <StatusBadge
        status={getActionStatusTone(item.status)}
        label={getActionStatusLabel(item.status)}
        size="sm"
      />
    ),
  },
  {
    id: "actions",
    header: "จัดการ",
    align: "right",
    sticky: "right",
    cell: (item) => <ActionStatusControls item={item} />,
  },
]

function StudentCareCard({
  student,
  isSelected,
}: {
  student: StudentWorklistItem
  isSelected: boolean
}) {
  return (
    <Link
      href={`/support?studentId=${student.studentId}`}
      className={cn(
        "rounded-xl border border-border bg-card p-4 text-card-foreground shadow-sm transition-colors hover:bg-muted/30",
        isSelected && "border-primary bg-primary/5 ring-1 ring-primary",
      )}
    >
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

export default async function SupportPage({ searchParams }: SupportPageProps) {
  const params = searchParams ? await searchParams : {}
  let dashboard = emptyDashboard
  let worklist: StudentWorklistItem[] = []
  let actionQueue: ActionQueueItem[] = []
  let loadError: string | null = null

  try {
    const [dashboardData, worklistData, actionData] = await Promise.all([
      getStudentCareDashboard(),
      getStudentWorklist({ limit: 500 }),
      getActionQueue({ limit: 24 }),
    ])

    dashboard = dashboardData
    worklist = worklistData
    actionQueue = actionData
  } catch (error) {
    loadError = error instanceof Error ? error.message : "Unknown support data error"
  }

  const studentsNeedingCare = worklist
    .filter(
      (student) =>
        student.openSupportCount > 0 ||
        student.activePlanCount > 0 ||
        student.openActionCount > 0 ||
        student.riskLevel !== "normal",
    )
    .sort((a, b) => b.priorityScore - a.priorityScore)

  const requestedStudentId = getSearchParam(params, "studentId")
  const fallbackStudentId = studentsNeedingCare[0]?.studentId ?? worklist[0]?.studentId ?? ""
  const selectedStudent =
    worklist.find((student) => student.studentId === requestedStudentId) ??
    worklist.find((student) => student.studentId === fallbackStudentId) ??
    null
  let notes: StudentNoteItem[] = []
  let timeline: StudentTimelineItem[] = []
  let detailError: string | null = null

  if (selectedStudent) {
    try {
      ;[notes, timeline] = await Promise.all([
        getStudentNotes(selectedStudent.studentId, 8),
        getStudentTimeline(selectedStudent.studentId, 8),
      ])
    } catch (error) {
      detailError = error instanceof Error ? error.message : "Unknown student care detail error"
    }
  }

  return (
    <PageShell size="wide" spacing="default">
      <PageHeader
        title="ดูแลช่วยเหลือ"
        description="ติดตามเคส แผนพัฒนา งานดูแล บันทึกทีม และไทม์ไลน์ของนักเรียนในหน้าเดียว"
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
          description="รายการที่ยังต้องติดตาม"
          icon={HeartHandshake}
          status="info"
          size="compact"
        />
        <MetricCard
          title="แผนกำลังติดตาม"
          value={dashboard.metrics.activePlans.toLocaleString("th-TH")}
          description="แผนรายบุคคลที่ยังดำเนินการอยู่"
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
          value={actionQueue.filter((item) => item.dueDate).length.toLocaleString("th-TH")}
          description="งานที่มีวันครบกำหนด"
          icon={CalendarClock}
          status="watch"
          size="compact"
        />
      </div>

      {loadError ? (
        <ErrorState
          title="โหลดข้อมูลงานดูแลไม่ได้"
          description="ตรวจสอบสิทธิ์ผู้ใช้และการตั้งค่าฐานข้อมูลล่าสุด"
          details={loadError}
        />
      ) : null}

      {detailError ? (
        <ErrorState
          title="โหลดรายละเอียดนักเรียนไม่ได้"
          description="ตรวจสอบสิทธิ์การเข้าถึงบันทึกและไทม์ไลน์ของนักเรียนที่เลือก"
          details={detailError}
        />
      ) : null}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(360px,0.65fr)]">
        <div className="flex min-w-0 flex-col gap-6">
          <DataTable
            className="min-h-[460px]"
            columns={actionColumns}
            data={actionQueue}
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
                  <h2 className="text-sm font-semibold text-foreground">คิวงานดูแล</h2>
                  <p className="text-sm text-muted-foreground">
                    เริ่มงานหรือปิดงานได้จากตารางนี้ แล้วหน้าที่เกี่ยวข้องจะอัปเดตตาม
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

          <div className="grid grid-cols-1 gap-6 2xl:grid-cols-2">
            <StudentNotesPanel studentId={selectedStudent?.studentId ?? null} notes={notes} />
            <StudentTimelinePanel
              studentId={selectedStudent?.studentId ?? null}
              timeline={timeline}
            />
          </div>
        </div>

        <section className="flex min-w-0 flex-col gap-3">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-foreground">นักเรียนที่ต้องดูแลต่อ</h2>
            <p className="text-sm text-muted-foreground">
              เลือกนักเรียนเพื่อดูบันทึก ไทม์ไลน์ และบริบทล่าสุด
            </p>
          </div>

          {studentsNeedingCare.length > 0 ? (
            <div className="grid grid-cols-1 gap-3">
              {studentsNeedingCare.slice(0, 10).map((student) => (
                <StudentCareCard
                  key={student.studentId}
                  student={student}
                  isSelected={student.studentId === selectedStudent?.studentId}
                />
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
