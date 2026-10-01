import Link from "next/link"
import {
  AlertTriangle,
  ArrowLeft,
  Brain,
  CheckCircle2,
  Search,
  Users,
} from "lucide-react"

import {
  MetricCard,
  PageHeader,
  PageShell,
  StatusBadge,
  StudentIdentity,
} from "@/components/dashboard"
import { getStudentWorklist } from "@/lib/server/student-care-read-models"
import { getLatestSchoolSdqAssessments } from "@/app/actions/sdq.actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SdqTableActions } from "./_components/sdq-table-actions"
import { SdqClassroomBulkPrintDialog, type ClassroomStudentSdqSummary } from "./_components/sdq-classroom-bulk-print-dialog"
import { formatPercent } from "@/lib/student-care-formatters"
import { cn } from "@/lib/utils"

type SearchParams = Record<string, string | string[] | undefined>

interface SdqOverviewPageProps {
  searchParams?: Promise<SearchParams>
}

function buildSdqUrl(
  base: { risk?: string; q?: string; studentId?: string; classroom?: string },
  overrides: { risk?: string | null; q?: string | null; studentId?: string | null; classroom?: string | null }
) {
  const sp = new URLSearchParams()
  const risk = overrides.risk !== undefined ? overrides.risk : base.risk
  const q = overrides.q !== undefined ? overrides.q : base.q
  const studentId = overrides.studentId !== undefined ? overrides.studentId : base.studentId
  const classroom = overrides.classroom !== undefined ? overrides.classroom : base.classroom

  if (risk) sp.set("risk", risk)
  if (q) sp.set("q", q)
  if (studentId) sp.set("studentId", studentId)
  if (classroom) sp.set("classroom", classroom)

  const qs = sp.toString()
  return qs ? `/screening/sdq?${qs}` : "/screening/sdq"
}

export default async function SdqOverviewPage({ searchParams }: SdqOverviewPageProps) {
  const resolvedParams = searchParams ? await searchParams : {}
  const query = typeof resolvedParams.q === "string" ? resolvedParams.q.trim().toLowerCase() : ""
  const studentId = typeof resolvedParams.studentId === "string" ? resolvedParams.studentId.trim() : ""
  const riskFilter = typeof resolvedParams.risk === "string" ? resolvedParams.risk.trim() : ""
  const classroomFilter = typeof resolvedParams.classroom === "string" ? resolvedParams.classroom.trim() : ""
  const baseParams = { risk: riskFilter, q: query, studentId, classroom: classroomFilter }

  const [worklist, sdqMap] = await Promise.all([
    getStudentWorklist(),
    getLatestSchoolSdqAssessments(),
  ])

  // Compute classroom completion stats per room (E4)
  type ClassroomStat = {
    name: string
    total: number
    assessed: number
    rate: number
    normal: number
    watch: number
    high: number
  }

  const classroomStatsMap = new Map<string, ClassroomStat>()
  worklist.forEach((s) => {
    const room = s.classroomName || "ไม่ระบุห้อง"
    let stat = classroomStatsMap.get(room)
    if (!stat) {
      stat = { name: room, total: 0, assessed: 0, rate: 0, normal: 0, watch: 0, high: 0 }
      classroomStatsMap.set(room, stat)
    }
    stat.total++
    const sdq = sdqMap[s.studentId]
    if (sdq) {
      stat.assessed++
      if (sdq.riskLevel === "high") stat.high++
      else if (sdq.riskLevel === "watch") stat.watch++
      else stat.normal++
    }
  })

  const classroomStats = Array.from(classroomStatsMap.values())
    .map((c) => ({
      ...c,
      rate: c.total > 0 ? (c.assessed / c.total) * 100 : 0,
    }))
    .sort((a, b) => a.name.localeCompare(b.name, "th"))

  const filteredStudents = worklist.filter((s) => {
    if (studentId && s.studentId !== studentId) return false
    if (classroomFilter && s.classroomName !== classroomFilter) return false
    if (riskFilter) {
      const studentSdq = sdqMap[s.studentId]
      if (riskFilter === "unassessed") {
        if (studentSdq) return false
      } else {
        const effectiveLevel = studentSdq ? studentSdq.riskLevel : s.riskLevel
        if (effectiveLevel !== riskFilter) return false
      }
    }
    if (!query) return true
    return (
      s.fullName.toLowerCase().includes(query) ||
      s.studentCode.toLowerCase().includes(query) ||
      (s.classroomName && s.classroomName.toLowerCase().includes(query))
    )
  })

  // Group metrics
  const total = worklist.length
  const assessedCount = worklist.filter((s) => Boolean(sdqMap[s.studentId])).length
  const normalCount = worklist.filter((s) => (sdqMap[s.studentId] ? sdqMap[s.studentId].riskLevel === "normal" : s.riskLevel === "normal")).length
  const riskCount = worklist.filter((s) => (sdqMap[s.studentId] ? sdqMap[s.studentId].riskLevel === "watch" : s.riskLevel === "watch")).length
  const problemCount = worklist.filter((s) => (sdqMap[s.studentId] ? sdqMap[s.studentId].riskLevel === "high" : s.riskLevel === "high")).length
  const bannerStudent = studentId
    ? (filteredStudents[0] ?? worklist.find((s) => s.studentId === studentId) ?? null)
    : null

  const bulkPrintStudents: ClassroomStudentSdqSummary[] = (
    classroomFilter
      ? worklist.filter((s) => s.classroomName === classroomFilter)
      : filteredStudents
  ).map((s, idx) => {
    const sdq = sdqMap[s.studentId]
    return {
      studentId: s.studentId,
      studentCode: s.studentCode,
      fullName: s.fullName,
      studentNumber: idx + 1,
      classroomName: s.classroomName,
      isAssessed: Boolean(sdq),
      assessmentDate: sdq ? sdq.assessedAt : null,
      riskScore: sdq ? sdq.score : null,
      riskLevel: sdq ? sdq.riskLevel : null,
      evaluatorType: sdq ? "ครูประจำชั้น" : null,
    }
  })

  return (
    <PageShell size="wide" spacing="default">
      <PageHeader
        title="แบบประเมินพฤติกรรมและอารมณ์เด็ก (SDQ)"
        description="Strengths and Difficulties Questionnaire — ระบบคัดกรอง 25 ข้อ 5 ด้าน ตามมาตรฐาน สพฐ. และกรมสุขภาพจิต"
      >
        <div className="flex flex-wrap items-center gap-2">
          <SdqClassroomBulkPrintDialog
            classroomName={classroomFilter || "นักเรียนทั้งหมด"}
            students={bulkPrintStudents}
          />
          <Link href="/screening">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
              <ArrowLeft className="size-3.5" />
              กลับศูนย์คัดกรอง
            </Button>
          </Link>
          <Link href="/risk-analysis">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
              <Brain className="size-3.5" />
              วิเคราะห์ความเสี่ยงรวม (EWS)
            </Button>
          </Link>
        </div>
      </PageHeader>

      {/* Summary KPI Cards with Clickable Filters */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Link
          href={buildSdqUrl(baseParams, { risk: null })}
          aria-current={!riskFilter && !studentId ? "true" : undefined}
          className="group block focus-visible:outline-none"
        >
          <MetricCard
            title="นักเรียนทั้งหมด"
            value={`${total.toLocaleString("th-TH")} คน`}
            description={
              assessedCount > 0
                ? `ประเมิน SDQ แล้ว ${assessedCount.toLocaleString("th-TH")} คน (${formatPercent((assessedCount / (total || 1)) * 100)})`
                : "ยังไม่มีการบันทึกผลประเมิน SDQ"
            }
            icon={Users}
            status="primary"
            size="compact"
            className={cn(
              "transition-colors group-hover:border-primary/40 group-hover:shadow-xs",
              !riskFilter && !studentId && "border-primary/50 shadow-2xs",
            )}
          />
        </Link>

        <Link
          href={buildSdqUrl(baseParams, { risk: "normal" })}
          aria-current={riskFilter === "normal" ? "true" : undefined}
          className="group block focus-visible:outline-none"
        >
          <MetricCard
            title="กลุ่มปกติ"
            value={`${normalCount.toLocaleString("th-TH")} คน`}
            description={
              total > 0
                ? `${formatPercent((normalCount / total) * 100)} ของนักเรียนทั้งหมด`
                : "-"
            }
            icon={CheckCircle2}
            status="normal"
            size="compact"
            className={cn(
              "transition-colors group-hover:border-emerald-500/40 group-hover:shadow-xs",
              riskFilter === "normal" && "border-emerald-500 ring-1 ring-emerald-500 shadow-xs",
            )}
          />
        </Link>

        <Link
          href={buildSdqUrl(baseParams, { risk: "watch" })}
          aria-current={riskFilter === "watch" ? "true" : undefined}
          className="group block focus-visible:outline-none"
        >
          <MetricCard
            title="กลุ่มเสี่ยง"
            value={`${riskCount.toLocaleString("th-TH")} คน`}
            description="ต้องเฝ้าระวังและส่งเสริมพัฒนาการ"
            icon={AlertTriangle}
            status="watch"
            size="compact"
            className={cn(
              "transition-colors group-hover:border-amber-500/40 group-hover:shadow-xs",
              riskFilter === "watch" && "border-amber-500 ring-1 ring-amber-500 shadow-xs",
            )}
          />
        </Link>

        <Link
          href={buildSdqUrl(baseParams, { risk: "high" })}
          aria-current={riskFilter === "high" ? "true" : undefined}
          className="group block focus-visible:outline-none"
        >
          <MetricCard
            title="กลุ่มมีปัญหา"
            value={`${problemCount.toLocaleString("th-TH")} คน`}
            description="ต้องได้รับการช่วยเหลือเร่งด่วน"
            icon={AlertTriangle}
            status="high-risk"
            size="compact"
            className={cn(
              "transition-colors group-hover:border-rose-500/40 group-hover:shadow-xs",
              riskFilter === "high" && "border-rose-500 ring-1 ring-rose-500 shadow-xs",
            )}
          />
        </Link>
      </div>

      {studentId || riskFilter || classroomFilter ? (
        <div className="flex items-center justify-between rounded-xl border border-primary/20 bg-primary/5 p-3.5 text-xs text-foreground">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-primary">ตัวกรองปัจจุบัน:</span>
            {classroomFilter && (
              <span className="font-medium bg-primary/10 text-primary px-2 py-0.5 rounded-md">
                ห้อง: {classroomFilter}
              </span>
            )}
            {studentId && (
              <span>
                นักเรียน: {bannerStudent ? `${bannerStudent.fullName} (${bannerStudent.studentCode})` : "นักเรียนที่เลือก"}
              </span>
            )}
            {riskFilter && (
              <span className="font-medium">
                ระดับ: {riskFilter === "high" ? "กลุ่มมีปัญหา" : riskFilter === "watch" ? "กลุ่มเสี่ยง" : riskFilter === "unassessed" ? "ยังไม่ประเมิน" : "กลุ่มปกติ"}
              </span>
            )}
          </div>
          <Link href={buildSdqUrl(baseParams, { risk: null, studentId: null, classroom: null })} className="font-semibold text-primary hover:underline">
            ล้างตัวกรอง (แสดงทั้งหมด) &times;
          </Link>
        </div>
      ) : null}

      {/* Classroom Completion Stats per Room (E4) */}
      {classroomStats.length > 0 ? (
        <div className="rounded-2xl border border-border bg-card p-4 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-foreground">
              ความคืบหน้าการประเมิน SDQ แยกตามห้องเรียน
            </span>
            <span className="text-xs text-muted-foreground">
              คลิกเพื่อกรองรายชื่อเฉพาะห้อง
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5 pt-1">
            <Link
              href={buildSdqUrl(baseParams, { classroom: null })}
              className={cn(
                "rounded-lg px-2.5 py-1 text-xs font-medium border transition-colors",
                !classroomFilter
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-muted text-muted-foreground hover:text-foreground border-border"
              )}
            >
              ทุกห้อง ({assessedCount}/{total} คน)
            </Link>
            {classroomStats.map((stat) => (
              <Link
                key={stat.name}
                href={buildSdqUrl(baseParams, { classroom: stat.name })}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium border transition-colors",
                  classroomFilter === stat.name
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card text-muted-foreground hover:text-foreground border-border"
                )}
              >
                <span>{stat.name}</span>
                <span
                  className={cn(
                    "text-xs font-mono px-1 py-0.5 rounded",
                    classroomFilter === stat.name
                      ? "bg-primary-foreground/20 text-primary-foreground"
                      : "bg-muted text-foreground"
                  )}
                >
                  {stat.assessed}/{stat.total} ({formatPercent(stat.rate)})
                </span>
              </Link>
            ))}
          </div>
        </div>
      ) : null}

      {/* Student List & Action Table */}
      <div className="rounded-2xl border border-border bg-card shadow-xs overflow-hidden">
        <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between border-b border-border">
          <div>
            <h2 className="text-base font-semibold text-foreground">
              รายชื่อนักเรียนและสถานะการประเมิน
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              เลือกนักเรียนเพื่อเริ่มทำแบบประเมิน SDQ หรือพิมพ์รายงาน สพฐ.
            </p>
          </div>

          <div className="flex items-center gap-2 max-w-sm w-full sm:w-auto">
            {query ? (
              <Link href={buildSdqUrl(baseParams, { q: null })}>
                <Button variant="ghost" size="sm" className="h-9 text-xs text-muted-foreground hover:text-foreground shrink-0">
                  ล้างคำค้น (&ldquo;{query}&rdquo;)
                </Button>
              </Link>
            ) : null}

            <form method="GET" className="relative w-full">
              <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
              {riskFilter ? <input type="hidden" name="risk" value={riskFilter} /> : null}
              {studentId ? <input type="hidden" name="studentId" value={studentId} /> : null}
              {classroomFilter ? <input type="hidden" name="classroom" value={classroomFilter} /> : null}
              <Input
                name="q"
                defaultValue={query}
                placeholder="ค้นหาชื่อ, รหัส, หรือห้องเรียน..."
                className="pl-9 h-9 text-xs"
              />
            </form>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="sticky top-0 z-10 border-b border-border bg-card/95 backdrop-blur-xs text-xs text-muted-foreground shadow-2xs">
              <tr>
                <th className="px-4 py-3 font-medium min-w-56">นักเรียน</th>
                <th className="px-4 py-3 font-medium min-w-20">ห้องเรียน</th>
                <th className="px-4 py-3 font-medium min-w-32">ผลประเมิน SDQ</th>
                <th className="px-4 py-3 font-medium min-w-24">คะแนน SDQ</th>
                <th className="px-4 py-3 font-medium min-w-28">ความเสี่ยงรวม (EWS)</th>
                <th className="px-4 py-3 text-right font-medium min-w-44">การดำเนินการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-sm text-muted-foreground">
                    ไม่พบรายชื่อนักเรียนตามเงื่อนไขที่กำหนด
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => {
                  const sdq = sdqMap[student.studentId]
                  const isEwsRisk = student.riskLevel === "watch"
                  const isEwsProblem = student.riskLevel === "high"

                  return (
                    <tr key={student.studentId} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <Link
                          href={`/students/${student.studentId}`}
                          className="group/link block transition-colors hover:opacity-90"
                        >
                          <StudentIdentity
                            avatarUrl={student.photoUrl ?? ""}
                            name={
                              <span className="group-hover/link:text-primary group-hover/link:underline">
                                {student.fullName}
                              </span>
                            }
                            studentCode={student.studentCode}
                            size="sm"
                          />
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-xs">
                        <span className="inline-flex items-center rounded-md bg-muted/60 px-2 py-0.5 font-medium text-foreground">
                          {student.classroomName ?? "-"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {sdq ? (
                          <StatusBadge
                            status={sdq.riskLevel === "high" ? "high-risk" : sdq.riskLevel === "watch" ? "watch" : "normal"}
                            label={sdq.riskLevel === "high" ? "กลุ่มมีปัญหา" : sdq.riskLevel === "watch" ? "กลุ่มเสี่ยง" : "ปกติ"}
                            size="sm"
                          />
                        ) : (
                          <StatusBadge
                            status="neutral"
                            label="ยังไม่ประเมิน"
                            size="sm"
                          />
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs font-mono font-semibold tabular-nums text-foreground">
                        {sdq ? `${sdq.score}/40` : <span className="text-muted-foreground">-</span>}
                      </td>
                      <td className="px-4 py-3 text-xs">
                        <div className="flex items-center gap-1.5">
                          <StatusBadge
                            status={isEwsProblem ? "high-risk" : isEwsRisk ? "watch" : "normal"}
                            label={isEwsProblem ? "สูง" : isEwsRisk ? "เฝ้าระวัง" : "ปกติ"}
                            size="sm"
                          />
                          <span className="font-mono text-muted-foreground tabular-nums">
                            ({student.riskScore})
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <SdqTableActions
                          student={{
                            studentId: student.studentId,
                            studentCode: student.studentCode,
                            fullName: student.fullName,
                            classroomName: student.classroomName,
                            studentNumber: student.studentNumber,
                            riskLevel: student.riskLevel,
                            riskScore: student.riskScore,
                          }}
                        />
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </PageShell>
  )
}
