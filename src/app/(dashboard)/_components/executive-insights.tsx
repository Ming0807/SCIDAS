import Link from "next/link"
import { CalendarX2, GraduationCap, BarChart3, Building2, TrendingUp } from "lucide-react"

import { Section } from "@/components/dashboard/section"
import { EmptyState } from "@/components/feedback/empty-state"
import type { ExecutiveInsights } from "@/lib/server/executive-read-models"

function Bar({ value, max, tone }: { value: number; max: number; tone: "rose" | "amber" | "sky" | "emerald" }) {
  const tones = {
    rose: "bg-rose-500",
    amber: "bg-amber-500",
    sky: "bg-sky-500",
    emerald: "bg-emerald-500",
  }
  return (
    <div className="h-2 min-w-20 flex-1 overflow-hidden rounded-full bg-muted" aria-hidden="true">
      <div
        className={`h-full rounded-full ${tones[tone]}`}
        style={{ width: `${max > 0 ? Math.max(4, Math.min(100, (value / max) * 100)) : 0}%` }}
      />
    </div>
  )
}

export function ExecutiveInsights({ insights }: { insights: ExecutiveInsights }) {
  const maxAbsent = Math.max(1, ...insights.topAbsence.map((s) => s.absentDays30d))
  const maxFactor = Math.max(1, ...insights.factors.map((f) => f.count))
  const maxClassRisk = Math.max(
    1,
    ...insights.classrooms.map((c) => c.highRiskCount + c.watchRiskCount),
  )

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Section
          variant="surface"
          title="ขาดเรียนบ่อย 10 อันดับแรก"
          description="นักเรียนที่ขาดเรียนมากสุดใน 30 วันที่ผ่านมา"
          actions={<CalendarX2 aria-hidden="true" className="size-4 text-muted-foreground" />}
        >
          {insights.topAbsence.length === 0 ? (
            <EmptyState size="compact" title="ไม่มีข้อมูลการขาดเรียน" description="เมื่อมีการบันทึกการมาเรียน รายชื่อจะแสดงที่นี่" />
          ) : (
            <ol className="divide-y divide-border">
              {insights.topAbsence.map((s, i) => (
                <li key={s.studentId} className="flex items-center gap-3 py-2.5">
                  <span className="w-6 shrink-0 text-center text-sm font-bold tabular-nums text-muted-foreground">
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <Link href={`/students/${s.studentId}`} className="truncate text-sm font-medium text-foreground hover:text-primary hover:underline">
                      {s.fullName}
                    </Link>
                    <p className="truncate text-xs text-muted-foreground">
                      {s.classroomName ?? "ไม่ระบุห้อง"} · มาเรียน {s.attendanceRate30d ?? "-"}%
                    </p>
                  </div>
                  <span className="shrink-0 text-sm font-bold tabular-nums text-rose-600 dark:text-rose-400">
                    ขาด {s.absentDays30d.toLocaleString("th-TH")} วัน
                  </span>
                  <Bar value={s.absentDays30d} max={maxAbsent} tone="rose" />
                </li>
              ))}
            </ol>
          )}
        </Section>

        <Section
          variant="surface"
          title="ผลการเรียนต่ำ 10 อันดับแรก"
          description={
            insights.gpaSemesterLabel
              ? `เกรดเฉลี่ยต่ำสุด${insights.gpaSemesterLabel} · ความเสี่ยง/มาเรียนเป็นข้อมูลปัจจุบัน`
              : "เกรดเฉลี่ยต่ำสุดภาคเรียนปัจจุบัน"
          }
          actions={<GraduationCap aria-hidden="true" className="size-4 text-muted-foreground" />}
        >
          {insights.topLowGpa.length === 0 ? (
            <EmptyState size="compact" title="ไม่มีข้อมูลคะแนน" description="เมื่อมีการบันทึกคะแนน รายชื่อจะแสดงที่นี่" />
          ) : (
            <ol className="divide-y divide-border">
              {insights.topLowGpa.map((s, i) => (
                <li key={s.studentId} className="flex items-center gap-3 py-2.5">
                  <span className="w-6 shrink-0 text-center text-sm font-bold tabular-nums text-muted-foreground">
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <Link href={`/students/${s.studentId}`} className="truncate text-sm font-medium text-foreground hover:text-primary hover:underline">
                      {s.fullName}
                    </Link>
                    <p className="truncate text-xs text-muted-foreground">
                      {s.classroomName ?? "ไม่ระบุห้อง"} · {s.subjectCount} วิชา
                    </p>
                  </div>
                  <span className="shrink-0 text-sm font-bold tabular-nums text-amber-600 dark:text-amber-400">
                    GPA {s.averageGpa.toLocaleString("th-TH")}
                  </span>
                  <Bar value={4 - s.averageGpa} max={4} tone="amber" />
                </li>
              ))}
            </ol>
          )}
        </Section>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Section
          variant="surface"
          title="สาเหตุความเสี่ยงที่พบบ่อย"
          description={
            insights.factorsTotalStudents > 0
              ? `จากนักเรียนที่มีผลประเมิน ${insights.factorsTotalStudents.toLocaleString("th-TH")} คน`
              : "ยังไม่มีผลประเมินความเสี่ยง"
          }
          actions={<BarChart3 aria-hidden="true" className="size-4 text-muted-foreground" />}
        >
          {insights.factors.length === 0 ? (
            <EmptyState size="compact" title="ไม่มีข้อมูลปัจจัยเสี่ยง" description="เมื่อมีการประเมินความเสี่ยง กราฟจะแสดงที่นี่" />
          ) : (
            <ul className="space-y-3">
              {insights.factors.map((f) => (
                <li key={f.factorKey} className="flex items-center gap-3">
                  <span className="w-40 shrink-0 truncate text-sm text-foreground">{f.factorLabel}</span>
                  <Bar value={f.count} max={maxFactor} tone="sky" />
                  <span className="w-16 shrink-0 text-right text-sm font-semibold tabular-nums text-foreground">
                    {f.count.toLocaleString("th-TH")} คน
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Section>

        <Section
          variant="surface"
          title="เปรียบเทียบความเสี่ยงรายห้อง"
          description="จำนวนนักเรียนเฝ้าระวัง + เสี่ยงสูงในแต่ละห้อง"
          actions={<Building2 aria-hidden="true" className="size-4 text-muted-foreground" />}
        >
          {insights.classrooms.length === 0 ? (
            <EmptyState size="compact" title="ไม่มีข้อมูลรายห้อง" description="เมื่อมีข้อมูลห้องเรียนและผลประเมิน กราฟจะแสดงที่นี่" />
          ) : (
            <ul className="space-y-3">
              {insights.classrooms.map((c) => {
                const atRisk = c.highRiskCount + c.watchRiskCount
                return (
                  <li key={c.classroomId} className="flex items-center gap-3">
                    <span className="w-24 shrink-0 truncate text-sm text-foreground">{c.classroomName}</span>
                    <Bar value={atRisk} max={maxClassRisk} tone="emerald" />
                    <span className="w-28 shrink-0 text-right text-xs tabular-nums text-muted-foreground">
                      {atRisk.toLocaleString("th-TH")} / {c.totalStudents.toLocaleString("th-TH")} คน
                    </span>
                  </li>
                )
              })}
            </ul>
          )}
        </Section>
      </div>

      {insights.trend.length > 0 ? (
        <Section
          variant="surface"
          title="แนวโน้มความเสี่ยงรายเดือน"
          description="จำนวนนักเรียนแต่ละกลุ่มย้อนหลัง"
          actions={<TrendingUp aria-hidden="true" className="size-4 text-muted-foreground" />}
        >
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
            {insights.trend.map((t) => {
              const max = Math.max(1, t.highCount + t.watchCount + t.normalCount)
              return (
                <div key={t.periodLabel} className="rounded-lg border border-border bg-background p-3">
                  <p className="text-xs font-medium text-muted-foreground">{t.periodLabel}</p>
                  <div className="mt-2 flex h-16 items-end gap-1" aria-hidden="true">
                    <div className="w-full rounded-sm bg-emerald-500/80" style={{ height: `${(t.normalCount / max) * 100}%` }} title={`ปกติ ${t.normalCount}`} />
                    <div className="w-full rounded-sm bg-amber-500/80" style={{ height: `${(t.watchCount / max) * 100}%` }} title={`เฝ้าระวัง ${t.watchCount}`} />
                    <div className="w-full rounded-sm bg-rose-500/80" style={{ height: `${(t.highCount / max) * 100}%` }} title={`เสี่ยงสูง ${t.highCount}`} />
                  </div>
                  <p className="mt-1.5 text-xs tabular-nums text-muted-foreground">
                    🔴 {t.highCount} 🟡 {t.watchCount} 🟢 {t.normalCount}
                  </p>
                </div>
              )
            })}
          </div>
        </Section>
      ) : null}
    </div>
  )
}
