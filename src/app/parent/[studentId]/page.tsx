import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, Activity, BookOpen, HeartHandshake, ClipboardList, Smile, ShieldAlert } from "lucide-react"

import { MetricCard, PageHeader, PageShell, StatusBadge, StudentIdentity } from "@/components/dashboard"
import { EmptyState } from "@/components/feedback"
import { getParentChildDetail } from "@/lib/server/parent-read-models"
import {
  formatClassroomLabel,
  formatPercent,
  formatThaiShortDate,
  getStudentRiskLabel,
  getStudentRiskTone,
} from "@/lib/student-care-formatters"
import { getAttendanceStatusLabel, type AttendanceStatus } from "@/lib/attendance-constants"
import { cn } from "@/lib/utils"
import { ParentTeacherContactDialog } from "../_components/parent-teacher-contact-dialog"
import { ParentConsentAckDialog } from "../_components/parent-consent-ack-dialog"

type ParentChildPageProps = {
  params: Promise<{ studentId: string }>
}

const behaviorLabels: Record<string, string> = {
  positive: "พฤติกรรมดี",
  negative: "ควรติดตาม",
  neutral: "ทั่วไป",
}

const supportLabels: Record<string, string> = {
  pending: "รอดำเนินการ",
  in_progress: "กำลังดำเนินการ",
  completed: "สำเร็จ",
  cancelled: "ยกเลิก",
  referred: "ส่งต่อ",
}

const planLabels: Record<string, string> = {
  draft: "ร่าง",
  active: "ดำเนินการ",
  completed: "สำเร็จ",
  cancelled: "ยกเลิก",
}

export default async function ParentChildPage({ params }: ParentChildPageProps) {
  const { studentId } = await params
  const detail = await getParentChildDetail(studentId).catch(() => null)

  if (!detail) {
    notFound()
  }

  const { profile } = detail
  const riskTone = getStudentRiskTone(profile.riskLevel)
  const riskLabel = getStudentRiskLabel(profile.riskLevel)

  const isCriticalOrHigh =
    profile.riskLevel === "high" ||
    (profile.riskLevel as string) === "critical" ||
    riskTone === "high-risk" ||
    riskTone === "danger"
  const isWatch = profile.riskLevel === "watch" || riskTone === "watch"

  return (
    <PageShell size="default" spacing="default">
      <PageHeader
        title={profile.fullName}
        description={`รหัส ${profile.studentCode} · ${formatClassroomLabel({
          gradeLevel: profile.gradeLevel,
          section: profile.section,
          classroomName: profile.classroomName,
        })}`}
        actions={
          <div className="flex items-center gap-2">
            <ParentTeacherContactDialog
              teacherContact={detail.teacherContact}
              classroomName={profile.classroomName}
            />
            <Link
              href="/parent"
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium hover:bg-muted"
            >
              <ArrowLeft className="size-3.5" /> บุตรหลาน
            </Link>
          </div>
        }
      />

      {/* Risk-toned Student Summary Card */}
      <div
        className={cn(
          "rounded-xl border border-border p-4 text-card-foreground shadow-sm space-y-4",
          isCriticalOrHigh
            ? "border-l-4 border-l-rose-500 bg-rose-50/15 dark:bg-rose-950/10"
            : isWatch
              ? "border-l-4 border-l-amber-500 bg-amber-50/15 dark:bg-amber-950/10"
              : "border-l-4 border-l-emerald-500 bg-card",
        )}
      >
        <StudentIdentity
          avatarUrl={profile.photoUrl ?? ""}
          name={profile.fullName}
          studentCode={profile.studentCode}
          status={riskTone}
          statusLabel={riskLabel}
        />

        {isCriticalOrHigh || isWatch ? (
          <div className="flex items-start gap-2.5 rounded-lg border border-amber-200 dark:border-amber-800/40 bg-amber-50/70 dark:bg-amber-950/20 p-3 text-xs text-amber-900 dark:text-amber-200">
            <ShieldAlert className="size-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
            <div className="space-y-0.5">
              <p className="font-semibold">ความร่วมมือในการดูแลนักเรียน</p>
              <p className="leading-relaxed text-amber-800/90 dark:text-amber-300/80">
                โรงเรียนกำลังติดตามและร่วมสนับสนุนการเรียนรู้ของนักเรียนเป็นพิเศษ หากท่านมีข้อซักถามหรือประสงค์จะปรึกษา สามารถติดต่อครูประจำชั้นได้ตลอดเวลาทำการ
              </p>
            </div>
          </div>
        ) : null}

        <div className="grid grid-cols-2 gap-2">
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
            description={`ขาด ${profile.absentDays30d.toLocaleString("th-TH")} วัน`}
            icon={Activity}
            status="normal"
            size="compact"
          />
        </div>
      </div>

      <section aria-label="การมาเรียนย้อนหลัง" className="rounded-xl border border-border bg-card p-4 shadow-sm">
        <h2 className="mb-3 flex items-center gap-2 text-base font-semibold text-foreground">
          <Activity aria-hidden="true" className="size-4 text-primary" /> การมาเรียน 30 วันล่าสุด
        </h2>
        {detail.attendance.length === 0 ? (
          <EmptyState size="compact" title="ยังไม่มีบันทึกการมาเรียน" description="ข้อมูลจะแสดงเมื่อครูบันทึกการมาเรียน" />
        ) : (
          <ul className="divide-y divide-border">
            {detail.attendance.slice(0, 10).map((row) => (
              <li key={`${row.date}-${row.status}`} className="flex items-center justify-between gap-3 py-2 text-sm">
                <span className="text-muted-foreground">{formatThaiShortDate(row.date)}</span>
                <StatusBadge
                  status={row.status === "present" ? "success" : row.status === "absent" ? "danger" : "watch"}
                  label={getAttendanceStatusLabel(row.status as AttendanceStatus)}
                  size="sm"
                />
              </li>
            ))}
          </ul>
        )}
        {detail.attendance.length > 10 ? (
          <details className="mt-2">
            <summary className="cursor-pointer text-xs font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded">
              ดูทั้งหมด {detail.attendance.length.toLocaleString("th-TH")} วัน
            </summary>
            <ul className="divide-y divide-border">
              {detail.attendance.slice(10).map((row) => (
                <li key={`${row.date}-${row.status}`} className="flex items-center justify-between gap-3 py-2 text-sm">
                  <span className="text-muted-foreground">{formatThaiShortDate(row.date)}</span>
                  <StatusBadge
                    status={row.status === "present" ? "success" : row.status === "absent" ? "danger" : "watch"}
                    label={getAttendanceStatusLabel(row.status as AttendanceStatus)}
                    size="sm"
                  />
                </li>
              ))}
            </ul>
          </details>
        ) : null}
      </section>

      <section aria-label="ผลการเรียน" className="rounded-xl border border-border bg-card p-4 shadow-sm">
        <h2 className="mb-3 flex items-center gap-2 text-base font-semibold text-foreground">
          <BookOpen aria-hidden="true" className="size-4 text-primary" /> ผลการเรียนที่ควรติดตาม
        </h2>
        {detail.scores.length === 0 ? (
          <EmptyState size="compact" title="ยังไม่มีคะแนน" description="ข้อมูลจะแสดงเมื่อครูบันทึกคะแนน" />
        ) : (
          <ul className="divide-y divide-border">
            {detail.scores.map((row, i) => (
              <li key={`${row.subjectName}-${i}`} className="flex items-center justify-between gap-3 py-2 text-sm">
                <span className="min-w-0 truncate font-medium text-foreground">{row.subjectName}</span>
                <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                  {row.totalScore !== null ? row.totalScore.toLocaleString("th-TH") : "-"}
                  {row.grade ? ` (เกรด ${row.grade})` : ""}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-label="พฤติกรรมล่าสุด" className="rounded-xl border border-border bg-card p-4 shadow-sm">
        <h2 className="mb-3 flex items-center gap-2 text-base font-semibold text-foreground">
          <Smile aria-hidden="true" className="size-4 text-primary" /> พฤติกรรมล่าสุด
        </h2>
        {detail.behaviors.length === 0 ? (
          <EmptyState size="compact" title="ยังไม่มีบันทึกพฤติกรรม" description="พฤติกรรมที่ครูบันทึกจะแสดงที่นี่" />
        ) : (
          <ul className="space-y-2">
            {detail.behaviors.map((row) => (
              <li key={row.id} className="rounded-lg bg-muted/40 p-3 text-sm">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-foreground">{behaviorLabels[row.behaviorType] ?? row.behaviorType}</span>
                  <span className="text-xs text-muted-foreground">{formatThaiShortDate(row.date)}</span>
                </div>
                <p className="mt-1 text-muted-foreground">{row.description}</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-label="การช่วยเหลือและแผนพัฒนา" className="rounded-xl border border-border bg-card p-4 shadow-sm">
        <h2 className="mb-3 flex items-center gap-2 text-base font-semibold text-foreground">
          <HeartHandshake aria-hidden="true" className="size-4 text-primary" /> การช่วยเหลือและแผนพัฒนา
        </h2>
        {detail.supportCases.length === 0 && detail.plans.length === 0 ? (
          <EmptyState size="compact" title="ยังไม่มีเคสช่วยเหลือ" description="เมื่อมีครูจะแจ้งให้ท่านทราบ" />
        ) : (
          <ul className="space-y-2.5">
            {detail.supportCases.map((row) => (
              <li key={`s-${row.id}`} className="flex flex-col gap-2 rounded-lg bg-muted/40 p-3 text-sm sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="truncate font-medium text-foreground">{row.title}</p>
                  <p className="text-xs text-muted-foreground">การให้ความช่วยเหลือ</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <StatusBadge
                    status={row.status === "completed" ? "success" : row.status === "cancelled" ? "danger" : row.status === "in_progress" ? "watch" : "info"}
                    label={supportLabels[row.status] ?? row.status}
                    size="sm"
                  />
                  {row.consentStatus === "acknowledged" ? (
                    <StatusBadge
                      status="success"
                      label={`รับทราบแล้ว ${row.acknowledgedAt ? formatThaiShortDate(row.acknowledgedAt) : ""}`.trim()}
                      size="sm"
                    />
                  ) : row.consentStatus === "pending_ack" ? (
                    <ParentConsentAckDialog
                      studentId={profile.studentId}
                      targetType="support"
                      targetId={row.id}
                      targetTitle={row.title}
                    />
                  ) : null}
                </div>
              </li>
            ))}
            {detail.plans.map((row) => (
              <li key={`p-${row.id}`} className="flex flex-col gap-2 rounded-lg bg-muted/40 p-3 text-sm sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-center gap-1.5 truncate">
                  <ClipboardList aria-hidden="true" className="size-3.5 shrink-0 text-muted-foreground" />
                  <div>
                    <p className="truncate font-medium text-foreground">{row.title}</p>
                    <p className="text-xs text-muted-foreground">แผนพัฒนาเฉพาะบุคคล (IDP)</p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <StatusBadge
                    status={row.status === "completed" ? "success" : row.status === "cancelled" ? "danger" : row.status === "active" ? "watch" : "info"}
                    label={planLabels[row.status] ?? row.status}
                    size="sm"
                  />
                  {row.consentStatus === "acknowledged" ? (
                    <StatusBadge
                      status="success"
                      label={`รับทราบแล้ว ${row.acknowledgedAt ? formatThaiShortDate(row.acknowledgedAt) : ""}`.trim()}
                      size="sm"
                    />
                  ) : row.consentStatus === "pending_ack" ? (
                    <ParentConsentAckDialog
                      studentId={profile.studentId}
                      targetType="plan"
                      targetId={row.id}
                      targetTitle={row.title}
                    />
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </PageShell>
  )
}

