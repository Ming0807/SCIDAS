import React from "react"
import { AlertCircle, Pencil, Plus, ThumbsDown, ThumbsUp, TrendingUp } from "lucide-react"
import Link from "next/link"

import { PageShell } from "@/components/dashboard/page-shell"
import { PageHeader } from "@/components/dashboard/page-header"
import { MetricCard } from "@/components/dashboard/metric-card"
import { StatusBadge } from "@/components/dashboard/status-badge"
import { StudentIdentity } from "@/components/dashboard/student-identity"
import { EmptyState } from "@/components/feedback/empty-state"
import { ErrorState } from "@/components/feedback/error-state"
import { cn } from "@/lib/utils"
import { formatRelativeTime } from "@/lib/server/notification-read-models"
import {
  getBehaviorDashboard,
  getBehaviorTypeLabel,
  type BehaviorRecordItem,
  type BehaviorLeaderboardItem,
} from "@/lib/server/behavior-read-models"
import { getCurrentUserContext } from "@/lib/server/current-user"

import { ConductSummaryCard } from "./_components/conduct-summary-card"

type SearchParams = Promise<{
  studentId?: string
}>

export default async function BehaviorDashboardPage({
  searchParams,
}: {
  searchParams?: SearchParams
}) {
  const params = searchParams ? await searchParams : {}
  const selectedStudentId = params.studentId || ""
  const context = await getCurrentUserContext()
  const canCreate = ["admin", "homeroom_teacher", "subject_teacher", "counselor"].includes(context.role)
  const canEditAll = context.role === "admin"
  let dashboard: Awaited<ReturnType<typeof getBehaviorDashboard>>

  try {
    dashboard = await getBehaviorDashboard(selectedStudentId ? { studentId: selectedStudentId } : undefined)
  } catch {
    return (
      <PageShell>
        <ErrorState
          title="ไม่สามารถโหลดข้อมูลพฤติกรรมได้"
          description="กรุณาลองใหม่อีกครั้ง หรือตรวจสอบการเชื่อมต่อ"
        />
      </PageShell>
    )
  }

  return (
    <PageShell>
      <PageHeader
        title="ภาพรวมพฤติกรรมนักเรียน"
        description="บันทึกและติดตามพฤติกรรมเชิงบวก เชิงลบ และทั่วไปของนักเรียน"
        actions={canCreate ? (
          <Link
            href="/behavior/record"
            className="inline-flex items-center gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold py-2 px-4 rounded-lg transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            บันทึกพฤติกรรม
          </Link>
        ) : undefined}
      />

      {selectedStudentId ? (
        <div className="flex items-center justify-between rounded-xl border border-primary/20 bg-primary/5 p-3.5 text-xs text-foreground">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-primary">กรองเฉพาะพฤติกรรมของนักเรียน:</span>
            <span>
              {dashboard.recentRecords[0]?.studentName
                ? `${dashboard.recentRecords[0].studentName} (${dashboard.recentRecords[0].studentClass ?? "นักเรียน"})`
                : selectedStudentId}
            </span>
          </div>
          <Link href="/behavior" className="font-medium text-primary hover:underline">
            ล้างตัวกรอง (แสดงทั้งหมด)
          </Link>
        </div>
      ) : null}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <MetricCard
          title="บันทึกพฤติกรรมทั้งหมด"
          value={dashboard.summary.totalRecords.toLocaleString()}
          icon={TrendingUp}
          status="info"
          delta={{
            value: "ครั้ง",
            trend: "neutral",
            tone: "neutral",
          }}
        />
        <MetricCard
          title="พฤติกรรมเชิงบวก"
          value={dashboard.summary.positiveCount.toLocaleString()}
          description={`คิดเป็น ${dashboard.summary.positivePct}%`}
          icon={ThumbsUp}
          status="success"
          statusLabel={`${dashboard.summary.positivePct}%`}
        />
        <MetricCard
          title="พฤติกรรมเชิงลบ"
          value={dashboard.summary.negativeCount.toLocaleString()}
          description={`คิดเป็น ${dashboard.summary.negativePct}%`}
          icon={ThumbsDown}
          status="danger"
          statusLabel={`${dashboard.summary.negativePct}%`}
        />
        <MetricCard
          title="นักเรียนที่ต้องติดตามพิเศษ"
          value={dashboard.summary.studentsNeedingFollowUp.toLocaleString()}
          description="มีพฤติกรรมลบซ้ำซ้อน"
          icon={AlertCircle}
          status={dashboard.summary.studentsNeedingFollowUp > 0 ? "warning" : "success"}
          statusLabel="คน"
        />
      </div>

      {/* Conduct Scoring & Merit/Demerit System */}
      <ConductSummaryCard conductSummary={dashboard.conductSummary} />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Recent Behaviors Table */}
        <div className="xl:col-span-2 bg-card rounded-xl border border-border shadow-sm flex flex-col min-h-0">
          <div className="p-5 border-b border-border">
            <h2 className="text-base font-semibold text-foreground">
              บันทึกพฤติกรรมล่าสุด
            </h2>
          </div>

          {dashboard.recentRecords.length === 0 ? (
            <div className="p-8">
              <EmptyState
                title="ยังไม่มีบันทึกพฤติกรรม"
                description="เริ่มบันทึกพฤติกรรมนักเรียนเพื่อติดตามและส่งเสริมการพัฒนา"
                action={
                  <Link
                    href="/behavior/record"
                    className="inline-flex items-center gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold py-2 px-4 rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    บันทึกพฤติกรรม
                  </Link>
                }
              />
            </div>
          ) : (
            <div className="p-0 overflow-x-auto">
              <table className="w-full min-w-[680px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-border text-xs font-semibold text-muted-foreground bg-muted/30">
                    <th className="py-3 px-5 whitespace-nowrap">นักเรียน</th>
                    <th className="py-3 px-4 whitespace-nowrap">ประเภท</th>
                    <th className="py-3 px-4 whitespace-nowrap">พฤติกรรม</th>
                    <th className="py-3 px-3 text-center whitespace-nowrap">คะแนน</th>
                    <th className="py-3 px-4 hidden md:table-cell whitespace-nowrap">
                      วันที่
                    </th>
                    <th className="py-3 px-5 text-center whitespace-nowrap">
                      จัดการ
                    </th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {dashboard.recentRecords.map((record) => (
                    <BehaviorTableRow key={record.id} record={record} profileId={context.profileId} canEditAll={canEditAll} />
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {dashboard.totalRecords > 10 && (
            <div className="p-4 border-t border-border text-center">
              <Link
                href="/behavior/record"
                className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
              >
                ดูประวัติทั้งหมด ({dashboard.totalRecords} รายการ)
              </Link>
            </div>
          )}
        </div>

        {/* Leaderboard */}
        <div className="bg-card rounded-xl border border-border shadow-sm flex flex-col p-5">
          <h2 className="text-base font-semibold text-foreground mb-4">
            นักเรียนที่ได้รับคำชมสูงสุด
          </h2>

          {dashboard.leaderboard.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-sm text-muted-foreground">ยังไม่มีข้อมูล</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {dashboard.leaderboard.map((student, i) => (
                <LeaderboardRow key={student.studentId} student={student} rank={i + 1} />
              ))}
            </div>
          )}

          <Link
            href="/behavior/record"
            className="mt-auto pt-4 text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
          >
            ดูอันดับทั้งหมด →
          </Link>
        </div>
      </div>
    </PageShell>
  )
}

/* ------------------------------------------------------------------ */
/* Sub-components                                                     */
/* ------------------------------------------------------------------ */

function BehaviorTableRow({ record, profileId, canEditAll }: { record: BehaviorRecordItem; profileId: string | null; canEditAll: boolean }) {
  const isPositive = record.behaviorType === "positive"
  const isNegative = record.behaviorType === "negative"
  const statusTone = isPositive ? "success" : isNegative ? "danger" : "neutral"

  return (
    <tr className={cn(
      "border-b border-border transition-colors hover:bg-muted/30",
      isPositive ? "hover:bg-emerald-50/20 dark:hover:bg-emerald-950/10" : isNegative ? "hover:bg-rose-50/20 dark:hover:bg-rose-950/10" : ""
    )}>
      <td className="py-3 px-5 whitespace-nowrap">
        <StudentIdentity
          name={
            <Link
              href={`/students/${record.studentId}`}
              className="font-medium text-foreground hover:underline"
            >
              {record.studentName}
            </Link>
          }
          classroom={record.studentClass ? `ชั้น ${record.studentClass}` : undefined}
          size="sm"
        />
      </td>
      <td className="py-3 px-4 whitespace-nowrap">
        <StatusBadge status={statusTone} label={getBehaviorTypeLabel(record.behaviorType)} size="sm" />
      </td>
      <td className="py-3 px-4 text-foreground font-medium whitespace-nowrap max-w-48 truncate">
        {record.description}
      </td>
      <td className="py-3 px-3 text-center whitespace-nowrap">
        <span
          className={cn(
            "font-mono text-xs font-semibold tabular-nums px-2 py-0.5 rounded-md",
            record.points > 0
              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
              : record.points < 0
                ? "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300"
                : "text-muted-foreground bg-muted/40"
          )}
        >
          {record.points > 0 ? `+${record.points}` : record.points}
        </span>
      </td>
      <td className="py-3 px-4 text-muted-foreground hidden md:table-cell whitespace-nowrap text-xs">
        {formatRelativeTime(record.date)}
      </td>
      <td className="py-3 px-5 text-center whitespace-nowrap">
        <div className="flex items-center justify-center gap-2">
          {(canEditAll || Boolean(profileId && record.reportedById === profileId)) ? (
            <Link
              href={`/behavior/${record.id}`}
              className="inline-flex items-center rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-primary/15 hover:text-primary/80"
            >
              ดูข้อมูล
            </Link>
          ) : null}
          <Link
            href={`/behavior/${record.id}/edit`}
            className="inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-muted"
          >
            <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
            แก้ไข
          </Link>
        </div>
      </td>
    </tr>
  )
}

function LeaderboardRow({
  student,
  rank,
}: {
  student: BehaviorLeaderboardItem
  rank: number
}) {
  const rankBadges = [
    "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800",
    "bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border border-slate-300 dark:border-slate-700",
    "bg-amber-50 text-amber-900 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200 dark:border-amber-900",
  ]
  const badgeStyle = rank <= 3 ? rankBadges[rank - 1] : "bg-muted text-muted-foreground border border-border"

  return (
    <div className="flex items-center justify-between p-2.5 -mx-2 rounded-lg hover:bg-muted/30 transition-colors">
      <div className="flex items-center gap-3 min-w-0">
        <span
          className={cn(
            "size-6 rounded-full text-xs font-bold flex items-center justify-center shrink-0 tabular-nums",
            badgeStyle
          )}
          aria-hidden="true"
        >
          {rank}
        </span>
        <div className="min-w-0">
          <Link
            href={`/students/${student.studentId}`}
            className="font-medium text-foreground text-sm line-clamp-1 break-all hover:underline"
          >
            {student.studentName}
          </Link>
          {student.studentClass ? (
            <div className="text-xs text-muted-foreground">ชั้น {student.studentClass}</div>
          ) : null}
        </div>
      </div>
      <div className="flex flex-col items-end shrink-0 pl-2">
        <span className="text-sm font-semibold font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
          +{student.positivePoints}
        </span>
        <span className="text-xs text-muted-foreground">ครั้ง</span>
      </div>
    </div>
  )
}
