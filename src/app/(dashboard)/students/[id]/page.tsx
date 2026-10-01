import Link from "next/link"
import { notFound } from "next/navigation"
import {
  Activity,
  ArrowLeft,
  Brain,
  Calendar,
  CalendarClock,
  CreditCard,
  Edit2,
  FileText,
  HeartHandshake,
  Home,
  ListChecks,
  MapPinned,
  Phone,
  Scale,
  Share2,
  ShieldAlert,
  Sparkles,
  UserRound,
  Users,
} from "lucide-react"
import { createClient } from "@/utils/supabase/server"

import {
  ActionStatusControls,
  StudentAttachmentsPanel,
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
  getFamilyStatusLabel,
  getStudentRiskLabel,
  getStudentRiskTone,
} from "@/lib/student-care-formatters"
import {
  getStudentActionItems,
  getStudentAttachments,
  getStudentCareProfile,
  getStudentGuardians,
  getStudentNotes,
  getStudentTimeline,
  type ActionQueueItem,
  type StudentAttachmentItem,
  type StudentCareProfile,
  type StudentGuardianItem,
  type StudentNoteItem,
  type StudentTimelineItem,
} from "@/lib/server/student-care-read-models"
import { cn } from "@/lib/utils"
import { getCurrentUserContext } from "@/lib/server/current-user"
import { getStudentById } from "@/app/actions/student.actions"
import { getTeacherFlag } from "@/app/actions/flag.actions"
import type { Tables } from "@/types/database.types"
import {
  getStudentRiskActionSuggestions,
  type SuggestedActionItem,
} from "@/lib/server/risk-action-rules"
import { StudentGuardianManager } from "./_components/student-guardian-manager"
import { StudentPrintableCard } from "./_components/student-printable-card"
import { StudentCarePathway } from "./_components/student-care-pathway"
import { StudentHealthCard } from "./_components/student-health-card"
import { StudentPhotoEditor } from "./_components/student-photo-editor"
import { TeacherFlagControl } from "./_components/teacher-flag-control"

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

function formatNationalId(id?: string | null) {
  if (!id) return "-"
  const clean = id.replace(/\D/g, "")
  if (clean.length === 13) {
    return `${clean[0]}-${clean.slice(1, 5)}-${clean.slice(5, 10)}-${clean.slice(10, 12)}-${clean[12]}`
  }
  return id
}

function calculateAge(dob?: string | null): string | null {
  if (!dob) return null
  const birthDate = new Date(dob)
  if (isNaN(birthDate.getTime())) return null
  const now = new Date()
  let age = now.getFullYear() - birthDate.getFullYear()
  const m = now.getMonth() - birthDate.getMonth()
  if (m < 0 || (m === 0 && now.getDate() < birthDate.getDate())) {
    age--
  }
  return age >= 0 ? `${age} ปี` : null
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
  const context = await getCurrentUserContext()
  const canEdit = ["admin", "homeroom_teacher", "counselor"].includes(context.role)
  let profile: StudentCareProfile | null = null
  let actionItems: ActionQueueItem[] = []
  let notes: StudentNoteItem[] = []
  let timeline: StudentTimelineItem[] = []
  let attachments: StudentAttachmentItem[] = []
  let guardians: StudentGuardianItem[] = []
  let studentDetails: Tables<"students"> | null = null
  let loadError: string | null = null
  let teacherFlag = { flagged: false, reason: null as string | null, flaggedAt: null as string | null }
  let peerCount = 0
  let suggestedActions: SuggestedActionItem[] = []

  try {
    const [
      profileData,
      actionData,
      notesData,
      timelineData,
      attachmentData,
      guardiansData,
      studentData,
      flagData,
      suggestedData,
    ] = await Promise.all([
      getStudentCareProfile(id),
      getStudentActionItems(id, { limit: 12 }),
      getStudentNotes(id, 8),
      getStudentTimeline(id, 12),
      getStudentAttachments(id, 10),
      getStudentGuardians(id),
      getStudentById(id).catch(() => null),
      getTeacherFlag(id).catch(() => ({ flagged: false, reason: null, flaggedAt: null })),
      getStudentRiskActionSuggestions(id).catch(() => []),
    ])

    profile = profileData
    actionItems = actionData
    notes = notesData
    timeline = timelineData
    attachments = attachmentData
    guardians = guardiansData
    studentDetails = studentData
    teacherFlag = flagData
    suggestedActions = suggestedData

    if (profile && context.schoolId && profile.gradeLevel && profile.section) {
      try {
        const supabase = await createClient()
        const { count } = await supabase
          .from("v_current_student_directory")
          .select("student_id", { count: "exact", head: true })
          .eq("school_id", context.schoolId)
          .eq("grade_level", profile.gradeLevel)
          .eq("section", profile.section)
          .eq("status", "active")
        peerCount = count ?? 0
      } catch {
        // Fallback gracefully
      }
    }
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
            <StudentPrintableCard
              profile={profile}
              guardians={guardians}
              actionItems={actionItems}
              student={studentDetails}
            />
            {canEdit ? <Link href={`/students/${profile.studentId}/edit`} className={cn(buttonVariants({ variant: "outline" }))}>
              <Edit2 /> แก้ไขข้อมูล
            </Link> : null}
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

      <StudentCarePathway profile={profile} suggestedActions={suggestedActions} />

      {/* Student 360° Quick Care Handoff */}
      <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Sparkles className="size-4 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">
                การส่งต่องานดูแล 360° (Student 360° Care Handoff)
              </h3>
              {peerCount > 0 ? (
                <span className="rounded-full bg-primary/15 px-2.5 py-0.5 text-xs font-semibold text-primary">
                  เพื่อนร่วมห้อง {peerCount} คน
                </span>
              ) : null}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              สร้างงานดูแลหรือบันทึกใหม่โดยระบุข้อมูลของ {profile.fullName} อัตโนมัติ (1-Click Action)
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/home-visits/new?studentId=${profile.studentId}`}
              className={cn(buttonVariants({ variant: "outline", size: "sm" }), "text-xs gap-1.5 bg-background shadow-2xs hover:bg-muted")}
            >
              <Home className="size-3.5 text-emerald-600 dark:text-emerald-400" />
              เยี่ยมบ้าน
            </Link>
            <Link
              href={`/behavior/record?studentId=${profile.studentId}`}
              className={cn(buttonVariants({ variant: "outline", size: "sm" }), "text-xs gap-1.5 bg-background shadow-2xs hover:bg-muted")}
            >
              <Scale className="size-3.5 text-amber-600 dark:text-amber-400" />
              บันทึกพฤติกรรม
            </Link>
            <Link
              href={`/screening/sdq/${profile.studentId}`}
              className={cn(buttonVariants({ variant: "outline", size: "sm" }), "text-xs gap-1.5 bg-background shadow-2xs hover:bg-muted")}
            >
              <Brain className="size-3.5 text-purple-600 dark:text-purple-400" />
              ประเมิน SDQ
            </Link>
            <Link
              href={`/support/new?studentId=${profile.studentId}`}
              className={cn(buttonVariants({ variant: "outline", size: "sm" }), "text-xs gap-1.5 bg-background shadow-2xs hover:bg-muted")}
            >
              <HeartHandshake className="size-3.5 text-blue-600 dark:text-blue-400" />
              เปิดเคสช่วยเหลือ
            </Link>
            <Link
              href={`/development-plans/new?studentId=${profile.studentId}`}
              className={cn(buttonVariants({ variant: "outline", size: "sm" }), "text-xs gap-1.5 bg-background shadow-2xs hover:bg-muted")}
            >
              <FileText className="size-3.5 text-indigo-600 dark:text-indigo-400" />
              สร้างแผน IDP
            </Link>
            <Link
              href={`/referrals/new?studentId=${profile.studentId}`}
              className={cn(buttonVariants({ variant: "outline", size: "sm" }), "text-xs gap-1.5 bg-background shadow-2xs hover:bg-muted")}
            >
              <Share2 className="size-3.5 text-rose-600 dark:text-rose-400" />
              ส่งต่อเคส
            </Link>
          </div>
        </div>
      </div>

      {(canEdit || teacherFlag.flagged) ? (
        <TeacherFlagControl
          studentId={profile.studentId}
          studentName={profile.fullName}
          initialFlagged={teacherFlag.flagged}
          initialReason={teacherFlag.reason}
          canFlag={canEdit}
        />
      ) : null}

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
            <StudentPhotoEditor
              studentId={profile.studentId}
              studentName={profile.fullName}
              hasPhoto={Boolean(profile.photoUrl)}
              canEdit={canEdit}
            />

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
              <DetailItem
                icon={CreditCard}
                label="เลขประจำตัวประชาชน"
                value={<span className="font-mono">{formatNationalId(studentDetails?.national_id)}</span>}
              />
              <DetailItem
                icon={Calendar}
                label="วันเกิด / อายุ"
                value={
                  studentDetails?.date_of_birth ? (
                    <span>
                      {formatThaiShortDate(studentDetails.date_of_birth)}
                      {calculateAge(studentDetails.date_of_birth) ? (
                        <span className="ml-1.5 text-xs text-muted-foreground font-normal">
                          ({calculateAge(studentDetails.date_of_birth)})
                        </span>
                      ) : null}
                    </span>
                  ) : (
                    "-"
                  )
                }
              />
              <DetailItem icon={UserRound} label="เพศ" value={getGenderLabel(profile.gender)} />
              <DetailItem
                icon={Users}
                label="สถานะครอบครัว"
                value={getFamilyStatusLabel(studentDetails?.family_status)}
              />
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

          <StudentHealthCard student={studentDetails} />

          <StudentGuardianManager
            studentId={profile.studentId}
            guardians={guardians}
            canEdit={canEdit}
          />

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

          <StudentAttachmentsPanel
            studentId={profile.studentId}
            attachments={attachments}
            referenceTable="students"
            referenceId={profile.studentId}
          />

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
