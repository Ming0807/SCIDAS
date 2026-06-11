import Link from "next/link"
import { notFound } from "next/navigation"
import {
  Activity,
  ArrowLeft,
  CalendarClock,
  HeartHandshake,
  ListChecks,
  MapPinned,
  Phone,
  ShieldAlert,
  UserRound,
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
  Section,
  StatusBadge,
  StudentIdentity,
} from "@/components/dashboard"
import { DataTable, type DataTableColumn } from "@/components/data"
import { EmptyState, ErrorState } from "@/components/feedback"
import { buttonVariants } from "@/components/ui/button"
import {
  formatClassroomLabel,
  formatPercent,
  formatThaiShortDate,
  getStudentRiskLabel,
  getStudentRiskTone,
} from "@/lib/student-care-formatters"
import {
  getStudentActionItems,
  getStudentCareProfile,
  getStudentNotes,
  getStudentTimeline,
  type ActionQueueItem,
  type StudentCareProfile,
  type StudentNoteItem,
  type StudentTimelineItem,
} from "@/lib/server/student-care-read-models"
import { cn } from "@/lib/utils"

type StudentProfilePageProps = {
  params: Promise<{ id: string }>
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

function getStudentStatusLabel(status: StudentCareProfile["status"]) {
  const labels: Record<NonNullable<StudentCareProfile["status"]>, string> = {
    active: "กำลังศึกษา",
    graduated: "จบการศึกษา",
    transferred: "ย้ายออก",
    dropped_out: "ออกกลางคัน",
    suspended: "พักการเรียน",
  }

  return status ? labels[status] ?? status : "ไม่ระบุสถานะ"
}

function getGenderLabel(gender: StudentCareProfile["gender"]) {
  if (gender === "male") return "ชาย"
  if (gender === "female") return "หญิง"
  if (gender === "other") return "อื่นๆ"
  return "-"
}

function DetailItem({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: React.ReactNode
}) {
  return (
    <div className="flex min-w-0 items-start gap-3 rounded-lg border border-border bg-background p-3">
      <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <div className="mt-1 text-sm font-medium text-foreground">{value}</div>
      </div>
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
        <p className="truncate text-sm text-muted-foreground">{item.category}</p>
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

export default async function StudentProfilePage({ params }: StudentProfilePageProps) {
  const { id } = await params
  let profile: StudentCareProfile | null = null
  let actionItems: ActionQueueItem[] = []
  let notes: StudentNoteItem[] = []
  let timeline: StudentTimelineItem[] = []
  let loadError: string | null = null

  try {
    const [profileData, actionData, notesData, timelineData] = await Promise.all([
      getStudentCareProfile(id),
      getStudentActionItems(id, { limit: 12 }),
      getStudentNotes(id, 8),
      getStudentTimeline(id, 12),
    ])

    profile = profileData
    actionItems = actionData
    notes = notesData
    timeline = timelineData
  } catch (error) {
    loadError = error instanceof Error ? error.message : "Unknown student profile error"
  }

  if (loadError) {
    return (
      <PageShell size="wide" spacing="default">
        <PageHeader
          title="รายละเอียดนักเรียน"
          description="โหลดข้อมูลนักเรียนไม่ได้"
          actions={
            <Link href="/students" className={cn(buttonVariants({ variant: "outline" }))}>
              <ArrowLeft /> กลับรายชื่อนักเรียน
            </Link>
          }
        />
        <ErrorState
          title="โหลดรายละเอียดนักเรียนไม่ได้"
          description="ตรวจสอบสิทธิ์ผู้ใช้และข้อมูลนักเรียนในโรงเรียนนี้"
          details={loadError}
        />
      </PageShell>
    )
  }

  if (!profile) {
    notFound()
  }

  const classroomLabel = formatClassroomLabel({
    gradeLevel: profile.gradeLevel,
    section: profile.section,
    classroomName: profile.classroomName,
  })
  const riskTone = getStudentRiskTone(profile.riskLevel)
  const riskLabel = getStudentRiskLabel(profile.riskLevel)

  return (
    <PageShell size="wide" spacing="default">
      <PageHeader
        title={profile.fullName}
        description={`รหัส ${profile.studentCode} · ${classroomLabel}`}
        actions={
          <>
            <Link href="/students" className={cn(buttonVariants({ variant: "outline" }))}>
              <ArrowLeft /> กลับรายชื่อ
            </Link>
            <Link href={`/support?studentId=${profile.studentId}`} className={cn(buttonVariants())}>
              <HeartHandshake /> เปิดในงานดูแล
            </Link>
          </>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="ระดับความเสี่ยง"
          value={riskLabel}
          description={`คะแนน ${profile.riskScore.toLocaleString("th-TH")}`}
          icon={ShieldAlert}
          status={riskTone}
          size="compact"
        />
        <MetricCard
          title="มาเรียน 30 วัน"
          value={formatPercent(profile.attendanceRate30d)}
          description={`ขาด ${profile.absentDays30d.toLocaleString("th-TH")} วัน · สาย ${profile.lateDays30d.toLocaleString("th-TH")} วัน`}
          icon={Activity}
          status={profile.attendanceRate30d !== null && profile.attendanceRate30d < 85 ? "watch" : "normal"}
          size="compact"
        />
        <MetricCard
          title="งานดูแลค้าง"
          value={profile.openActionCount.toLocaleString("th-TH")}
          description={formatThaiShortDate(profile.nextDueDate)}
          icon={ListChecks}
          status={profile.openActionCount > 0 ? "watch" : "normal"}
          size="compact"
        />
        <MetricCard
          title="เคสและแผน"
          value={(profile.openSupportCount + profile.activePlanCount).toLocaleString("th-TH")}
          description={`เคส ${profile.openSupportCount.toLocaleString("th-TH")} · แผน ${profile.activePlanCount.toLocaleString("th-TH")}`}
          icon={HeartHandshake}
          status={profile.openSupportCount + profile.activePlanCount > 0 ? "info" : "normal"}
          size="compact"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(360px,0.65fr)]">
        <div className="flex min-w-0 flex-col gap-6">
          <Section
            variant="surface"
            title="ข้อมูลนักเรียน"
            description="ข้อมูลระบุตัวตน ห้องเรียน ผู้ปกครอง และบริบทการเดินทาง"
            contentClassName="space-y-4"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <StudentIdentity
                avatarUrl={profile.photoUrl ?? ""}
                name={profile.fullName}
                studentCode={profile.studentCode}
                grade={formatClassroomLabel({
                  gradeLevel: profile.gradeLevel,
                  section: profile.section,
                  classroomName: profile.classroomName,
                })}
                status={riskTone}
                statusLabel={riskLabel}
              />
              <div className="flex flex-wrap gap-2">
                <StatusBadge
                  status={profile.status === "active" ? "normal" : "neutral"}
                  label={getStudentStatusLabel(profile.status)}
                  size="sm"
                />
                {profile.nickname ? (
                  <StatusBadge status="info" label={`ชื่อเล่น ${profile.nickname}`} size="sm" />
                ) : null}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
              <DetailItem icon={UserRound} label="เพศ" value={getGenderLabel(profile.gender)} />
              <DetailItem
                icon={Phone}
                label="ผู้ปกครองหลัก"
                value={
                  profile.primaryGuardianName ? (
                    <span>
                      {profile.primaryGuardianName}
                      {profile.primaryGuardianPhone ? (
                        <span className="block text-xs font-normal text-muted-foreground">
                          {profile.primaryGuardianPhone}
                        </span>
                      ) : null}
                    </span>
                  ) : (
                    "-"
                  )
                }
              />
              <DetailItem
                icon={MapPinned}
                label="การเดินทาง"
                value={
                  profile.travelMethod || profile.distanceToSchoolKm !== null ? (
                    <span>
                      {profile.travelMethod ?? "ไม่ระบุวิธีเดินทาง"}
                      {profile.distanceToSchoolKm !== null ? (
                        <span className="block text-xs font-normal text-muted-foreground">
                          {profile.distanceToSchoolKm.toLocaleString("th-TH")} กม.
                        </span>
                      ) : null}
                    </span>
                  ) : (
                    "-"
                  )
                }
              />
            </div>
          </Section>

          <DataTable
            className="min-h-[360px]"
            columns={actionColumns}
            data={actionItems}
            emptyState={
              <EmptyState
                title="ยังไม่มีงานดูแลค้าง"
                description="เมื่อมีงานติดตามของนักเรียนคนนี้ ระบบจะแสดงและให้ปิดงานได้จากที่นี่"
              />
            }
            getRowKey={(item) => item.id}
            toolbar={
              <div className="flex flex-col gap-1">
                <h2 className="text-sm font-semibold text-foreground">งานดูแลของนักเรียน</h2>
                <p className="text-sm text-muted-foreground">
                  งานที่เปิดอยู่จากความเสี่ยง เคสช่วยเหลือ แผนพัฒนา และการติดตามอื่นๆ
                </p>
              </div>
            }
          />

          <StudentNotesPanel studentId={profile.studentId} notes={notes} />
        </div>

        <div className="flex min-w-0 flex-col gap-6">
          <StudentTimelinePanel studentId={profile.studentId} timeline={timeline} />

          <Section
            variant="surface"
            title="จุดติดตามถัดไป"
            description="สรุปสั้นสำหรับทีมก่อนตัดสินใจดำเนินการต่อ"
            contentClassName="space-y-3"
          >
            <DetailItem
              icon={CalendarClock}
              label="กำหนดถัดไป"
              value={formatThaiShortDate(profile.nextDueDate)}
            />
            <DetailItem
              icon={ShieldAlert}
              label="ธงดูแลที่ยังเปิดอยู่"
              value={profile.activeFlagCount.toLocaleString("th-TH")}
            />
            <DetailItem
              icon={ListChecks}
              label="Priority score"
              value={profile.priorityScore.toLocaleString("th-TH")}
            />
          </Section>
        </div>
      </div>
    </PageShell>
  )
}
