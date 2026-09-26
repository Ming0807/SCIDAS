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
          <Link
            href="/parent"
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium hover:bg-muted"
          >
            <ArrowLeft className="size-4" /> บุตรหลาน
          </Link>
        }
      />

      <div className="rounded-xl border border-border bg-card p-4 text-card-foreground shadow-sm">
        <StudentIdentity
          avatarUrl={profile.photoUrl ?? ""}
          name={profile.fullName}
          studentCode={profile.studentCode}
          status={riskTone}
          statusLabel={riskLabel}
        />
        <div className="mt-4 grid grid-cols-2 gap-2">
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
          <ul className="space-y-2">
            {detail.supportCases.map((row) => (
              <li key={`s-${row.id}`} className="flex items-center justify-between gap-3 rounded-lg bg-muted/40 p-3 text-sm">
                <span className="min-w-0 truncate font-medium text-foreground">{row.title}</span>
                <StatusBadge status="info" label={supportLabels[row.status] ?? row.status} size="sm" />
              </li>
            ))}
            {detail.plans.map((row) => (
              <li key={`p-${row.id}`} className="flex items-center justify-between gap-3 rounded-lg bg-muted/40 p-3 text-sm">
                <span className="flex min-w-0 items-center gap-1.5 truncate font-medium text-foreground">
                  <ClipboardList aria-hidden="true" className="size-3.5 shrink-0 text-muted-foreground" />
                  {row.title}
                </span>
                <StatusBadge status="info" label={planLabels[row.status] ?? row.status} size="sm" />
              </li>
            ))}
          </ul>
        )}
      </section>
    </PageShell>
  )
}
