import React from "react"
import Link from "next/link"
import { ClipboardList, Plus, Target, TrendingUp } from "lucide-react"

import { PageShell } from "@/components/dashboard/page-shell"
import { PageHeader } from "@/components/dashboard/page-header"
import { MetricCard } from "@/components/dashboard/metric-card"
import { StatusBadge } from "@/components/dashboard/status-badge"
import { EmptyState } from "@/components/feedback/empty-state"
import { ErrorState } from "@/components/feedback/error-state"
import {
  getDevelopmentPlanList,
  getPlanSummary,
  getPlanStatusLabel,
  getPlanStatusTone,
} from "@/lib/server/idp-read-models"
import { formatGradeLevel } from "@/lib/student-care-formatters"

export default async function DevelopmentPlansPage() {
  let plans: Awaited<ReturnType<typeof getDevelopmentPlanList>>
  let summary: Awaited<ReturnType<typeof getPlanSummary>>

  try {
    plans = await getDevelopmentPlanList()
    summary = await getPlanSummary()
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

  return (
    <PageShell>
      <PageHeader
        title="แผนพัฒนารายบุคคล"
        description="จัดการและติดตามแผนพัฒนารายบุคคล (IDP) สำหรับนักเรียน"
        actions={
          <Link
            href="/development-plans/new"
            className="inline-flex items-center gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold py-2 px-4 rounded-lg transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            สร้างแผนใหม่
          </Link>
        }
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <MetricCard
          title="แผนทั้งหมด"
          value={summary.totalPlans.toLocaleString()}
          icon={ClipboardList}
          status="neutral"
          statusLabel="แผน"
        />
        <MetricCard
          title="กำลังดำเนินการ"
          value={summary.activePlans.toLocaleString()}
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
          value={summary.completedPlans.toLocaleString()}
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

      {/* Plans Table */}
      <div className="bg-card rounded-xl border border-border shadow-sm flex flex-col min-h-0">
        <div className="p-5 border-b border-border">
          <h2 className="text-base font-semibold text-foreground">
            แผนพัฒนาทั้งหมด
          </h2>
        </div>

        {plans.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title="ยังไม่มีแผนพัฒนา"
              description="เริ่มสร้างแผนพัฒนารายบุคคลเพื่อติดตามและส่งเสริมการพัฒนานักเรียน"
              action={
                <Link
                  href="/development-plans/new"
                  className="inline-flex items-center gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold py-2 px-4 rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  สร้างแผนแรก
                </Link>
              }
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
                        <div className="font-semibold text-foreground">
                          {plan.title}
                        </div>
                        <div className="text-xs text-muted-foreground">
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
                      </td>
                      <td className="py-3 px-5 whitespace-nowrap">
                        <div className="font-medium text-foreground">
                          {plan.studentName}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {formatGradeLevel(plan.gradeLevel)}
                          {plan.studentCode ? ` · ${plan.studentCode}` : ""}
                        </div>
                      </td>
                      <td className="py-3 px-5 whitespace-nowrap">
                        <StatusBadge
                          status={tone}
                          label={getPlanStatusLabel(plan.status)}
                          size="sm"
                        />
                      </td>
                      <td className="py-3 px-5 whitespace-nowrap text-muted-foreground">
                        {plan.completedGoalCount}/{plan.goalCount}
                      </td>
                      <td className="py-3 px-5 hidden md:table-cell whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-1.5 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full transition-all"
                              style={{ width: `${plan.overallProgress}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium text-muted-foreground w-8 text-right">
                            {plan.overallProgress}%
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-5 hidden lg:table-cell whitespace-nowrap text-muted-foreground">
                        {plan.creatorName ?? "-"}
                      </td>
                      <td className="py-3 px-5 text-center whitespace-nowrap">
                        <Link
                          href={`/development-plans/${plan.id}`}
                          className="text-primary hover:text-primary/80 font-semibold text-xs bg-primary/10 px-3 py-1.5 rounded-lg hover:bg-primary/15 transition-colors inline-block"
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
