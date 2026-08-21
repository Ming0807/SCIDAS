import React from "react"
import { AlertCircle, Pencil, Plus, ThumbsDown, ThumbsUp, TrendingUp } from "lucide-react"
import Link from "next/link"

import { PageShell } from "@/components/dashboard/page-shell"
import { PageHeader } from "@/components/dashboard/page-header"
import { MetricCard } from "@/components/dashboard/metric-card"
import { StatusBadge } from "@/components/dashboard/status-badge"
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
import { getStudentInitials } from "@/lib/student-care-formatters"
import { getCurrentUserContext } from "@/lib/server/current-user"

export default async function BehaviorDashboardPage() {
  const context = await getCurrentUserContext()
  const canCreate = ["admin", "homeroom_teacher", "subject_teacher", "counselor"].includes(context.role)
  const canEditAll = context.role === "admin"
  let dashboard: Awaited<ReturnType<typeof getBehaviorDashboard>>

  try {
    dashboard = await getBehaviorDashboard()
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
                    <th className="py-3 px-5 whitespace-nowrap">ประเภท</th>
                    <th className="py-3 px-5 whitespace-nowrap">พฤติกรรม</th>
                    <th className="py-3 px-5 hidden md:table-cell whitespace-nowrap">
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
  const initials = getStudentInitials(record.studentName)

  return (
    <tr className="border-b border-border hover:bg-muted/30 transition-colors">
      <td className="py-3 px-5 whitespace-nowrap">
        <div className="flex items-center gap-3">
          <span
            className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
              isPositive
                ? "bg-emerald-100 text-emerald-700"
                : isNegative
                  ? "bg-red-100 text-red-700"
                  : "bg-muted text-muted-foreground",
            )}
            aria-hidden="true"
          >
            {initials}
          </span>
          <div>
            <div className="font-semibold text-foreground">{record.studentName}</div>
            {record.studentClass ? (
              <div className="text-xs text-muted-foreground">ชั้น {record.studentClass}</div>
            ) : null}
          </div>
        </div>
      </td>
      <td className="py-3 px-5 whitespace-nowrap">
        <StatusBadge status={statusTone} label={getBehaviorTypeLabel(record.behaviorType)} size="sm" />
      </td>
      <td className="py-3 px-5 text-foreground font-medium whitespace-nowrap max-w-48 truncate">
        {record.description}
      </td>
      <td className="py-3 px-5 text-muted-foreground hidden md:table-cell whitespace-nowrap">
        {formatRelativeTime(record.date)}
      </td>
      <td className="py-3 px-5 text-center whitespace-nowrap">
        <div className="flex items-center justify-center gap-2">
          {(canEditAll || Boolean(profileId && record.reportedById === profileId)) ? <Link
            href={`/behavior/${record.id}`}
            className="inline-flex items-center rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-primary/15 hover:text-primary/80"
          >
            ดูข้อมูล
          </Link> : null}
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
  return (
    <div className="flex items-center justify-between p-2 -mx-2 rounded-lg hover:bg-muted/30 transition-colors">
      <div className="flex items-center gap-3">
        <span
          className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center justify-center shrink-0"
          aria-hidden="true"
        >
          {rank}
        </span>
        <div>
          <div className="font-semibold text-foreground text-sm line-clamp-1 break-all">
            {student.studentName}
          </div>
          {student.studentClass ? (
            <div className="text-xs text-muted-foreground">ชั้น {student.studentClass}</div>
          ) : null}
        </div>
      </div>
      <div className="flex flex-col items-end shrink-0 pl-2">
        <span className="text-sm font-semibold text-emerald-600">
          {student.positivePoints}
        </span>
        <span className="text-xs text-muted-foreground">ครั้ง</span>
      </div>
    </div>
  )
}
