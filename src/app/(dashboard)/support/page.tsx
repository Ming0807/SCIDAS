import Link from "next/link"
import {
  CalendarClock,
  CheckCircle2,
  HeartHandshake,
  ListChecks,
  MessageSquarePlus,
  Plus,
  ShieldAlert,
} from "lucide-react"

import { addStudentNoteFormAction, setActionItemStatusFormAction } from "@/app/actions/care.actions"
import {
  MetricCard,
  PageHeader,
  PageShell,
  Section,
  StatusBadge,
  StudentIdentity,
} from "@/components/dashboard"
import { DataTable, type DataTableColumn } from "@/components/data"
import { EmptyState, ErrorState } from "@/components/feedback"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  formatClassroomSection,
  formatGradeLevel,
  formatThaiDateTime,
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

function getTimelineTypeLabel(type: string) {
  const labels: Record<string, string> = {
    attendance: "การมาเรียน",
    behavior: "พฤติกรรม",
    support: "ดูแลช่วยเหลือ",
    risk: "ความเสี่ยง",
    idp: "แผนพัฒนา",
    home_visit: "เยี่ยมบ้าน",
  }

  return labels[type] ?? type
}

function getSeverityTone(severity?: string | null) {
  if (severity === "critical" || severity === "high") return "high-risk"
  if (severity === "medium") return "watch"
  if (severity === "low") return "normal"
  return "neutral"
}

function getNoteVisibilityLabel(visibility: StudentNoteItem["visibility"]) {
  const labels: Record<StudentNoteItem["visibility"], string> = {
    team: "ทีมดูแล",
    private: "ส่วนตัว",
    leadership: "ผู้บริหาร",
  }

  return labels[visibility]
}

function ActionStatusControls({ item }: { item: ActionQueueItem }) {
  return (
    <div className="flex justify-end gap-1">
      {item.status === "todo" ? (
        <form action={setActionItemStatusFormAction}>
          <input type="hidden" name="actionItemId" value={item.id} />
          <input type="hidden" name="status" value="in_progress" />
          <Button type="submit" size="sm" variant="outline">
            เริ่มทำ
          </Button>
        </form>
      ) : null}
      {item.status !== "done" && item.status !== "cancelled" ? (
        <form action={setActionItemStatusFormAction}>
          <input type="hidden" name="actionItemId" value={item.id} />
          <input type="hidden" name="status" value="done" />
          <Button type="submit" size="sm" variant="secondary">
            <CheckCircle2 /> ปิดงาน
          </Button>
        </form>
      ) : null}
    </div>
  )
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

function StudentNoteForm({ studentId }: { studentId: string }) {
  return (
    <form action={addStudentNoteFormAction} className="space-y-3">
      <input type="hidden" name="studentId" value={studentId} />
      <textarea
        name="body"
        required
        rows={4}
        placeholder="บันทึกสิ่งที่พบ การประสานงาน หรือขั้นตอนถัดไป..."
        className="min-h-28 w-full resize-y rounded-lg border border-input bg-background px-3 py-2 text-sm leading-6 text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-3 focus:ring-ring/50"
      />
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          <label className="text-sm">
            <span className="sr-only">หมวดบันทึก</span>
            <select
              name="category"
              defaultValue="support"
              className="h-8 rounded-lg border border-input bg-background px-2 text-sm text-foreground outline-none focus:border-ring focus:ring-3 focus:ring-ring/50"
            >
              <option value="support">ดูแลช่วยเหลือ</option>
              <option value="risk">ความเสี่ยง</option>
              <option value="attendance">การมาเรียน</option>
              <option value="family">ครอบครัว</option>
              <option value="home_visit">เยี่ยมบ้าน</option>
              <option value="idp">แผนพัฒนา</option>
              <option value="general">ทั่วไป</option>
            </select>
          </label>
          <label className="text-sm">
            <span className="sr-only">การมองเห็น</span>
            <select
              name="visibility"
              defaultValue="team"
              className="h-8 rounded-lg border border-input bg-background px-2 text-sm text-foreground outline-none focus:border-ring focus:ring-3 focus:ring-ring/50"
            >
              <option value="team">ทีมดูแล</option>
              <option value="private">ส่วนตัว</option>
              <option value="leadership">ผู้บริหาร</option>
            </select>
          </label>
        </div>
        <Button type="submit">
          <MessageSquarePlus /> เพิ่มบันทึก
        </Button>
      </div>
    </form>
  )
}

function StudentNotesPanel({
  selectedStudent,
  notes,
}: {
  selectedStudent: StudentWorklistItem | null
  notes: StudentNoteItem[]
}) {
  return (
    <Section
      title="บันทึกทีมดูแล"
      description="เก็บบริบทล่าสุดของนักเรียน เพื่อให้ทีมเห็นภาพเดียวกันก่อนติดตามต่อ"
      contentClassName="space-y-4"
    >
      {selectedStudent ? (
        <>
          <StudentNoteForm studentId={selectedStudent.studentId} />
          {notes.length > 0 ? (
            <div className="space-y-3">
              {notes.map((note) => (
                <article
                  key={note.id}
                  className="rounded-lg border border-border bg-card p-3 text-card-foreground"
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground">{note.authorName}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatThaiDateTime(note.createdAt)}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <StatusBadge status="info" label={note.category} size="sm" />
                      <StatusBadge
                        status="neutral"
                        label={getNoteVisibilityLabel(note.visibility)}
                        size="sm"
                      />
                    </div>
                  </div>
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-foreground">
                    {note.body}
                  </p>
                </article>
              ))}
            </div>
          ) : (
            <EmptyState
              size="compact"
              title="ยังไม่มีบันทึกของนักเรียนคนนี้"
              description="เพิ่มบันทึกแรกเพื่อให้ทีมเห็นบริบทและขั้นตอนถัดไปตรงกัน"
            />
          )}
        </>
      ) : (
        <EmptyState
          title="เลือกนักเรียนเพื่อเพิ่มบันทึก"
          description="เลือกรายชื่อด้านข้างเพื่อดูประวัติและเพิ่มบันทึกของทีมดูแล"
        />
      )}
    </Section>
  )
}

function StudentTimelinePanel({
  selectedStudent,
  timeline,
}: {
  selectedStudent: StudentWorklistItem | null
  timeline: StudentTimelineItem[]
}) {
  return (
    <Section
      title="ไทม์ไลน์การดูแล"
      description="รวมเหตุการณ์จากการมาเรียน พฤติกรรม ความเสี่ยง แผน และเยี่ยมบ้าน"
      contentClassName="space-y-3"
    >
      {selectedStudent ? (
        timeline.length > 0 ? (
          timeline.map((item) => (
            <article
              key={item.id}
              className="rounded-lg border border-border bg-card p-3 text-card-foreground"
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">{item.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatThaiDateTime(item.eventAt)}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <StatusBadge
                    status={getSeverityTone(item.severity)}
                    label={getTimelineTypeLabel(item.eventType)}
                    size="sm"
                  />
                </div>
              </div>
              {item.description ? (
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  {item.description}
                </p>
              ) : null}
            </article>
          ))
        ) : (
          <EmptyState
            size="compact"
            title="ยังไม่มีไทม์ไลน์"
            description="เมื่อมีเหตุการณ์ใหม่ ระบบจะแสดงลำดับการดูแลของนักเรียนคนนี้"
          />
        )
      ) : (
        <EmptyState
          title="เลือกนักเรียนเพื่อดูไทม์ไลน์"
          description="ไทม์ไลน์ช่วยให้เห็นลำดับเหตุการณ์ก่อนตัดสินใจขั้นต่อไป"
        />
      )}
    </Section>
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
            <StudentNotesPanel selectedStudent={selectedStudent} notes={notes} />
            <StudentTimelinePanel selectedStudent={selectedStudent} timeline={timeline} />
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
