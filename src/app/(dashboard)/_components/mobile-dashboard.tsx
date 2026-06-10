import Link from "next/link"
import { Bell, ChevronRight, Menu, ShieldAlert, Users } from "lucide-react"

import { StatusBadge, StudentIdentity } from "@/components/dashboard"
import { EmptyState, ErrorState } from "@/components/feedback"
import { Sidebar } from "@/components/layout/sidebar"
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import {
  formatClassroomSection,
  formatGradeLevel,
  formatPercent,
  getStudentRiskLabel,
  getStudentRiskTone,
} from "@/lib/student-care-formatters"
import type { StudentCareDashboard } from "@/lib/server/student-care-read-models"

function MetricTile({
  label,
  value,
  detail,
}: {
  label: string
  value: string
  detail: string
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-3 text-card-foreground">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-2 text-xl font-semibold tabular-nums text-foreground">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
    </div>
  )
}

export function MobileDashboard({
  role,
  dashboard,
  loadError,
}: {
  role?: string | null
  dashboard: StudentCareDashboard
  loadError: string | null
}) {
  const metrics = dashboard.metrics

  return (
    <div className="flex min-h-dvh flex-col bg-background pb-24">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-background/95 px-4 py-3 backdrop-blur">
        <Sheet>
          <SheetTrigger render={<button className="rounded-lg p-2 hover:bg-muted" aria-label="เปิดเมนู" />}>
            <Menu className="size-5 text-foreground" />
          </SheetTrigger>
          <SheetContent side="left" className="w-[280px] p-0">
            <SheetTitle className="sr-only">เมนูหลัก</SheetTitle>
            <SheetDescription className="sr-only">
              เมนูนำทางหลักของระบบดูแลนักเรียน
            </SheetDescription>
            <Sidebar role={role} />
          </SheetContent>
        </Sheet>

        <div className="min-w-0 text-center">
          <h1 className="truncate text-base font-semibold text-foreground">
            ภาพรวมดูแลนักเรียน
          </h1>
          <p className="text-xs text-muted-foreground">ข้อมูลล่าสุดจากระบบ</p>
        </div>

        <button
          type="button"
          aria-label="การแจ้งเตือน"
          className="relative rounded-lg p-2 hover:bg-muted"
        >
          <Bell className="size-5 text-foreground" />
          {metrics.openActionItems > 0 ? (
            <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-destructive" />
          ) : null}
        </button>
      </header>

      <main className="flex flex-1 flex-col gap-5 px-4 py-5">
        {loadError ? (
          <ErrorState
            title="โหลดข้อมูล Dashboard ไม่ได้"
            description="ตรวจสอบ migration 0008 และสิทธิ์การเข้าถึงข้อมูลโรงเรียน"
            details={loadError}
          />
        ) : null}

        <section className="rounded-xl border border-border bg-card p-4 text-card-foreground">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm text-muted-foreground">สถานการณ์วันนี้</p>
              <h2 className="mt-1 text-xl font-semibold text-foreground">
                นักเรียน {metrics.totalStudents.toLocaleString("th-TH")} คน
              </h2>
            </div>
            <span className="inline-flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Users aria-hidden="true" className="size-5" />
            </span>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2">
            <div>
              <p className="text-xs text-muted-foreground">มาเรียนเฉลี่ย</p>
              <p className="mt-1 font-semibold text-foreground">
                {formatPercent(metrics.averageAttendance30d)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">เฝ้าระวัง</p>
              <p className="mt-1 font-semibold text-foreground">
                {metrics.watchStudents.toLocaleString("th-TH")}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">เสี่ยงสูง</p>
              <p className="mt-1 font-semibold text-foreground">
                {metrics.highRiskStudents.toLocaleString("th-TH")}
              </p>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-2 gap-3">
          <MetricTile
            label="งานเปิด"
            value={metrics.openActionItems.toLocaleString("th-TH")}
            detail="ต้องมีคนรับผิดชอบ"
          />
          <MetricTile
            label="เคสดูแล"
            value={metrics.openSupportCases.toLocaleString("th-TH")}
            detail="ยังดำเนินการอยู่"
          />
          <MetricTile
            label="แผนพัฒนา"
            value={metrics.activePlans.toLocaleString("th-TH")}
            detail="กำลังติดตามผล"
          />
          <MetricTile
            label="กลุ่มเสี่ยงรวม"
            value={(metrics.watchStudents + metrics.highRiskStudents).toLocaleString("th-TH")}
            detail="เฝ้าระวังและเสี่ยงสูง"
          />
        </div>

        <section className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-base font-semibold text-foreground">งานที่ต้องติดตาม</h2>
            <Link
              href="/support"
              className="inline-flex items-center gap-1 text-sm font-medium text-primary"
            >
              ดูทั้งหมด <ChevronRight className="size-4" />
            </Link>
          </div>

          {dashboard.actionQueue.length > 0 ? (
            <div className="space-y-2">
              {dashboard.actionQueue.slice(0, 3).map((item) => (
                <article
                  key={item.id}
                  className="rounded-lg border border-border bg-card p-3 text-card-foreground"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">
                        {item.title}
                      </p>
                      <p className="mt-1 truncate text-xs text-muted-foreground">
                        {item.studentName ?? "ไม่ระบุนักเรียน"} / {item.category}
                      </p>
                    </div>
                    <ShieldAlert aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <EmptyState
              size="compact"
              title="ยังไม่มีงานติดตาม"
              description="งานจากความเสี่ยงและเคสดูแลจะแสดงที่นี่"
            />
          )}
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-base font-semibold text-foreground">นักเรียนที่ควรดูแลก่อน</h2>
            <Link
              href="/students?status=high"
              className="inline-flex items-center gap-1 text-sm font-medium text-primary"
            >
              ดูทั้งหมด <ChevronRight className="size-4" />
            </Link>
          </div>

          {dashboard.priorityStudents.length > 0 ? (
            <div className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
              {dashboard.priorityStudents.slice(0, 4).map((student) => (
                <Link
                  key={student.studentId}
                  href={`/students/${student.studentId}`}
                  className="flex items-center justify-between gap-3 p-3 transition-colors hover:bg-muted/40"
                >
                  <StudentIdentity
                    avatarUrl={student.photoUrl ?? ""}
                    name={student.fullName}
                    studentCode={student.studentCode}
                    grade={formatGradeLevel(student.gradeLevel)}
                    classroom={formatClassroomSection(student.section)}
                    size="sm"
                  />
                  <StatusBadge
                    status={getStudentRiskTone(student.riskLevel)}
                    label={getStudentRiskLabel(student.riskLevel)}
                    size="sm"
                  />
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState
              size="compact"
              title="ยังไม่มีรายชื่อ priority"
              description="ระบบจะเรียงรายชื่ออัตโนมัติเมื่อมีข้อมูลความเสี่ยงหรือการติดตาม"
            />
          )}
        </section>
      </main>
    </div>
  )
}
