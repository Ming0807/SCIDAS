import React from "react"
import Link from "next/link"
import { ClipboardList, Plus, Search, Target, TrendingUp } from "lucide-react"

import { PageShell } from "@/components/dashboard/page-shell"
import { PageHeader } from "@/components/dashboard/page-header"
import { MetricCard } from "@/components/dashboard/metric-card"
import { StatusBadge } from "@/components/dashboard/status-badge"
import { StudentIdentity } from "@/components/dashboard/student-identity"
import { EmptyState } from "@/components/feedback/empty-state"
import { ErrorState } from "@/components/feedback/error-state"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import {
  getDevelopmentPlanList,
  getPlanSummary,
  getPlanStatusLabel,
  getPlanStatusTone,
} from "@/lib/server/idp-read-models"
import { getCurrentUserContext } from "@/lib/server/current-user"
import { getStudentCareProfile } from "@/lib/server/student-care-read-models"
import { formatGradeLevel, getTodayBangkok } from "@/lib/student-care-formatters"

import { canEditDevelopmentPlans } from "./_lib/permissions"

type SearchParams = Promise<{
  studentId?: string
  status?: string
  q?: string
}>

export default async function DevelopmentPlansPage({
  searchParams,
}: {
  searchParams?: SearchParams
}) {
  const params = searchParams ? await searchParams : {}
  const selectedStudentId = params.studentId || ""
  const selectedStatus = params.status || ""
  const searchQuery = params.q || ""
  let plans: Awaited<ReturnType<typeof getDevelopmentPlanList>>
  let summary: Awaited<ReturnType<typeof getPlanSummary>>
  let canCreatePlan = false

  try {
    const [planRows, planSummary, context] = await Promise.all([
      getDevelopmentPlanList({
        studentId: selectedStudentId || undefined,
        status: selectedStatus || undefined,
        q: searchQuery || undefined,
      }),
      getPlanSummary(),
      getCurrentUserContext(),
    ])
    plans = planRows
    summary = planSummary
    canCreatePlan = canEditDevelopmentPlans(context.role)
  } catch {
    return (
      <PageShell>
        <ErrorState
          title="ไม่สามารถโหลดข้อมูลแผนพัฒนาได้"
          description="กรุณาลองใหม่อีกครั้ง หรือตรวจสอบการเชื่อมต่อ"
        />
      </PageShell>
    )
  }

  // FR-09-09: surface plans that need attention — active/draft plans whose
  // end date has passed or falls within the next 7 days in Asia/Bangkok time.
  const todayBangkok = getTodayBangkok()
  const dueSoonTarget = new Date(`${todayBangkok}T00:00:00+07:00`)
  dueSoonTarget.setDate(dueSoonTarget.getDate() + 7)
  const dueSoonLimit = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Bangkok" }).format(dueSoonTarget)

  const duePlans = plans.filter((plan) => {
    if (plan.status !== "active" && plan.status !== "draft") return false
    if (!plan.endDate) return false
    return plan.endDate <= dueSoonLimit
  })
  const overduePlans = duePlans.filter((plan) => (plan.endDate as string) < todayBangkok)

  let filteredStudentName: string | null = null
  if (selectedStudentId) {
    if (plans[0]?.studentName) {
      filteredStudentName = `${plans[0].studentName} (${plans[0].studentCode ?? "รหัส"})`
    } else {
      const sp = await getStudentCareProfile(selectedStudentId).catch(() => null)
      filteredStudentName = sp ? `${sp.fullName} (${sp.studentCode})` : "นักเรียนที่เลือก"
    }
  }

  return (
    <PageShell>
      <PageHeader
        title="แผนพัฒนารายบุคคล"
        description="จัดการและติดตามแผนพัฒนารายบุคคล (IDP) สำหรับนักเรียน"
        actions={canCreatePlan ? (
          <Link
            href="/development-plans/new"
            className="inline-flex items-center gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold py-2 px-4 rounded-lg transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            สร้างแผนใหม่
          </Link>
        ) : undefined}
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <MetricCard
          title="แผนทั้งหมด"
          value={summary.totalPlans.toLocaleString("th-TH")}
          icon={ClipboardList}
          status="neutral"
          statusLabel="แผน"
        />
        <MetricCard
          title="กำลังดำเนินการ"
          value={summary.activePlans.toLocaleString("th-TH")}
          icon={TrendingUp}
          status="info"
          statusLabel={
            summary.totalPlans > 0
              ? `${Math.round((summary.activePlans / summary.totalPlans) * 100)}%`
              : undefined
          }
        />
        <MetricCard
          title="เสร็จสิ้น"
          value={summary.completedPlans.toLocaleString("th-TH")}
          icon={Target}
          status="success"
          statusLabel={
            summary.totalPlans > 0
              ? `${Math.round((summary.completedPlans / summary.totalPlans) * 100)}%`
              : undefined
          }
        />
        <MetricCard
          title="ความก้าวหน้าเฉลี่ย"
          value={`${summary.averageProgress}%`}
          status={
            summary.averageProgress >= 75
              ? "success"
              : summary.averageProgress >= 40
                ? "watch"
                : "warning"
          }
        />
      </div>

      {selectedStudentId ? (
        <div className="flex items-center justify-between rounded-xl border border-primary/20 bg-primary/5 p-3.5 text-xs text-foreground">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-primary">กรองเฉพาะแผนพัฒนารายบุคคลของนักเรียน:</span>
            <span>{filteredStudentName}</span>
          </div>
          <Link href="/development-plans" className="font-medium text-primary hover:underline">
            ล้างตัวกรอง (แสดงทั้งหมด)
          </Link>
        </div>
      ) : null}

      {/* Plans Table */}
      {duePlans.length > 0 ? (
        <div
          role="note"
          aria-label="แผนที่ใกล้ครบกำหนด"
          className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm dark:border-amber-800/60 dark:bg-amber-950/40"
        >
          <p className="font-semibold text-foreground">
            {overduePlans.length > 0
              ? `มีแผนเลยกำหนด ${overduePlans.length.toLocaleString("th-TH")} แผน และใกล้ครบกำหนด (7 วัน) รวม ${duePlans.length.toLocaleString("th-TH")} แผน`
              : `มีแผนใกล้ครบกำหนดภายใน 7 วัน ${duePlans.length.toLocaleString("th-TH")} แผน`}
          </p>
          <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
            {duePlans.slice(0, 5).map((plan) => (
              <li key={plan.id}>
                <Link
                  href={`/development-plans/${plan.id}`}
                  className="font-medium text-primary hover:underline"
                >
                  {plan.title}
                </Link>{" "}
                · {plan.studentName} · สิ้นสุด{" "}
                {plan.endDate
                  ? new Intl.DateTimeFormat("th-TH", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    }).format(new Date(plan.endDate))
                  : "-"}
              </li>
            ))}
          </ul>
          {duePlans.length > 5 ? (
            <p className="mt-1 text-xs text-muted-foreground">
              และอีก {(duePlans.length - 5).toLocaleString("th-TH")} แผน ดูได้จากตารางด้านล่าง
            </p>
          ) : null}
        </div>
      ) : null}
      <div className="bg-card rounded-xl border border-border shadow-sm flex flex-col min-h-0">
        <div className="p-4 sm:p-5 border-b border-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-foreground">
              แผนพัฒนาทั้งหมด
              <span className="ml-2 text-xs font-normal text-muted-foreground">
                (แสดง {plans.length.toLocaleString("th-TH")} จากทั้งหมด {summary.totalPlans.toLocaleString("th-TH")} แผน)
              </span>
            </h2>
            {summary.totalPlans > plans.length && !searchQuery && (!selectedStatus || selectedStatus === "all") ? (
              <p className="text-xs text-muted-foreground mt-0.5">
                จำกัดการแสดงผล 50 รายการล่าสุด กรุณาใช้ช่องค้นหาหรือตัวกรองสถานะเพื่อค้นหาแผนที่ต้องการ
              </p>
            ) : null}
          </div>

          <form method="GET" action="/development-plans" className="relative w-full sm:w-64">
            {selectedStatus && <input type="hidden" name="status" value={selectedStatus} />}
            {selectedStudentId && <input type="hidden" name="studentId" value={selectedStudentId} />}
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            <Input
              name="q"
              defaultValue={searchQuery}
              placeholder="ค้นหาชื่อแผน..."
              className="pl-9 h-8 text-xs rounded-lg"
            />
          </form>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 p-3 sm:px-5 border-b border-border bg-muted/20">
          <Link
            href={`/development-plans?status=all${selectedStudentId ? `&studentId=${selectedStudentId}` : ""}${searchQuery ? `&q=${searchQuery}` : ""}`}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
              !selectedStatus || selectedStatus === "all"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            ทั้งหมด ({summary.totalPlans})
          </Link>
          <Link
            href={`/development-plans?status=active${selectedStudentId ? `&studentId=${selectedStudentId}` : ""}${searchQuery ? `&q=${searchQuery}` : ""}`}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
              selectedStatus === "active"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            กำลังดำเนินการ ({summary.activePlans})
          </Link>
          <Link
            href={`/development-plans?status=draft${selectedStudentId ? `&studentId=${selectedStudentId}` : ""}${searchQuery ? `&q=${searchQuery}` : ""}`}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
              selectedStatus === "draft"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            ฉบับร่าง ({summary.draftPlans})
          </Link>
          <Link
            href={`/development-plans?status=completed${selectedStudentId ? `&studentId=${selectedStudentId}` : ""}${searchQuery ? `&q=${searchQuery}` : ""}`}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
              selectedStatus === "completed"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            เสร็จสิ้น ({summary.completedPlans})
          </Link>
          <Link
            href={`/development-plans?status=cancelled${selectedStudentId ? `&studentId=${selectedStudentId}` : ""}${searchQuery ? `&q=${searchQuery}` : ""}`}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
              selectedStatus === "cancelled"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            ยกเลิก ({summary.cancelledPlans})
          </Link>
        </div>

        {plans.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title="ยังไม่มีแผนพัฒนา"
              description="เริ่มสร้างแผนพัฒนารายบุคคลเพื่อติดตามและส่งเสริมการพัฒนานักเรียน"
              action={canCreatePlan ? (
                <Link
                  href="/development-plans/new"
                  className="inline-flex items-center gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold py-2 px-4 rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  สร้างแผนแรก
                </Link>
              ) : undefined}
            />
          </div>
        ) : (
          <div className="p-0 overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b border-border text-xs font-semibold text-muted-foreground bg-muted/30">
                  <th className="py-3 px-5 whitespace-nowrap">ชื่อแผน</th>
                  <th className="py-3 px-5 whitespace-nowrap">นักเรียน</th>
                  <th className="py-3 px-5 whitespace-nowrap">สถานะ</th>
                  <th className="py-3 px-5 whitespace-nowrap">เป้าหมาย</th>
                  <th className="py-3 px-5 hidden md:table-cell whitespace-nowrap">
                    ความก้าวหน้า
                  </th>
                  <th className="py-3 px-5 hidden lg:table-cell whitespace-nowrap">
                    ผู้จัดทำ
                  </th>
                  <th className="py-3 px-5 text-center whitespace-nowrap">
                    จัดการ
                  </th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {plans.map((plan) => {
                  const tone = getPlanStatusTone(plan.status)

                  return (
                    <tr
                      key={plan.id}
                      className="border-b border-border hover:bg-muted/30 transition-colors"
                    >
                      <td className="py-3 px-5 whitespace-nowrap">
                        <Link
                          href={`/development-plans/${plan.id}`}
                          className="font-semibold text-foreground hover:underline"
                        >
                          {plan.title}
                        </Link>
                        <div className="text-xs text-muted-foreground font-mono tabular-nums">
                          {new Intl.DateTimeFormat("th-TH", {
                            day: "numeric",
                            month: "short",
                            year: "2-digit",
                          }).format(new Date(plan.startDate))}
                          {plan.endDate
                            ? ` - ${new Intl.DateTimeFormat("th-TH", {
                                day: "numeric",
                                month: "short",
                                year: "2-digit",
                              }).format(new Date(plan.endDate))}`
                            : ""}
                        </div>
                        <div className="mt-1.5 flex items-center gap-2 md:hidden">
                          <div className="h-1.5 w-20 overflow-hidden rounded-full bg-muted">
                            <div
                              className="h-full rounded-full bg-primary"
                              style={{ width: `${plan.overallProgress}%` }}
                            />
                          </div>
                          <span className="text-xs tabular-nums text-muted-foreground">
                            {plan.overallProgress}%
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-5 whitespace-nowrap">
                        <StudentIdentity
                          name={
                            <Link
                              href={`/students/${plan.studentId}`}
                              className="font-medium text-foreground hover:underline"
                            >
                              {plan.studentName}
                            </Link>
                          }
                          studentCode={plan.studentCode ?? undefined}
                          classroom={formatGradeLevel(plan.gradeLevel)}
                          size="sm"
                        />
                      </td>
                      <td className="py-3 px-5 whitespace-nowrap">
                        <StatusBadge
                          status={tone}
                          label={getPlanStatusLabel(plan.status)}
                          size="sm"
                        />
                      </td>
                      <td className="py-3 px-5 whitespace-nowrap text-muted-foreground font-mono tabular-nums text-xs">
                        {plan.completedGoalCount}/{plan.goalCount}
                      </td>
                      <td className="py-3 px-5 hidden md:table-cell whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-1.5 bg-muted rounded-full overflow-hidden">
                            <div
                              className={cn(
                                "h-full rounded-full transition-all",
                                plan.overallProgress >= 75
                                  ? "bg-emerald-500"
                                  : plan.overallProgress >= 40
                                    ? "bg-amber-500"
                                    : "bg-primary"
                              )}
                              style={{ width: `${plan.overallProgress}%` }}
                            />
                          </div>
                          <span className="text-xs font-mono tabular-nums font-medium text-muted-foreground w-8 text-right">
                            {plan.overallProgress}%
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-5 hidden lg:table-cell whitespace-nowrap text-muted-foreground text-xs">
                        {plan.creatorName ?? "-"}
                      </td>
                      <td className="py-3 px-5 text-center whitespace-nowrap">
                        <Link
                          href={`/development-plans/${plan.id}`}
                          className="inline-flex items-center rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-primary/15 hover:text-primary/80"
                        >
                          ดูรายละเอียด
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </PageShell>
  )
}
