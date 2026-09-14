import Link from "next/link"
import {
  AlertTriangle,
  ArrowLeft,
  Brain,
  CheckCircle2,
  Search,
  Users,
} from "lucide-react"
import { PageHeader, PageShell } from "@/components/dashboard"
import { getStudentWorklist } from "@/lib/server/student-care-read-models"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SdqTableActions } from "./_components/sdq-table-actions"

type SearchParams = Record<string, string | string[] | undefined>

interface SdqOverviewPageProps {
  searchParams?: Promise<SearchParams>
}

export default async function SdqOverviewPage({ searchParams }: SdqOverviewPageProps) {
  const resolvedParams = searchParams ? await searchParams : {}
  const query = typeof resolvedParams.q === "string" ? resolvedParams.q.trim().toLowerCase() : ""

  const worklist = await getStudentWorklist()
  const filteredStudents = worklist.filter((s) => {
    if (!query) return true
    return (
      s.fullName.toLowerCase().includes(query) ||
      s.studentCode.toLowerCase().includes(query) ||
      (s.classroomName && s.classroomName.toLowerCase().includes(query))
    )
  })

  // Group metrics
  const total = worklist.length
  const normalCount = worklist.filter((s) => s.riskLevel === "normal").length
  const riskCount = worklist.filter((s) => s.riskLevel === "watch").length
  const problemCount = worklist.filter((s) => s.riskLevel === "high").length

  return (
    <PageShell>
      <PageHeader
        title="แบบประเมินพฤติกรรมและอารมณ์เด็ก (SDQ)"
        description="Strengths and Difficulties Questionnaire — ระบบคัดกรอง 25 ข้อ 5 ด้าน ตามมาตรฐาน สพฐ. และกรมสุขภาพจิต"
      >
        <div className="flex items-center gap-2">
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

      {/* Summary KPI Cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">นักเรียนทั้งหมด</span>
            <Users className="size-4 text-muted-foreground" />
          </div>
          <p className="mt-2 text-2xl font-bold text-foreground">{total} คน</p>
          <p className="text-xs text-muted-foreground mt-0.5">ในระบบดูแลช่วยเหลือนักเรียน</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300">กลุ่มปกติ</span>
            <CheckCircle2 className="size-4 text-emerald-500" />
          </div>
          <p className="mt-2 text-2xl font-bold text-emerald-600 dark:text-emerald-400">{normalCount} คน</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {total > 0 ? Math.round((normalCount / total) * 100) : 0}% ของนักเรียนทั้งหมด
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-amber-700 dark:text-amber-300">กลุ่มเสี่ยง</span>
            <AlertTriangle className="size-4 text-amber-500" />
          </div>
          <p className="mt-2 text-2xl font-bold text-amber-600 dark:text-amber-400">{riskCount} คน</p>
          <p className="text-xs text-muted-foreground mt-0.5">ต้องเฝ้าระวังและส่งเสริมพัฒนาการ</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-rose-700 dark:text-rose-300">กลุ่มมีปัญหา</span>
            <AlertTriangle className="size-4 text-rose-500" />
          </div>
          <p className="mt-2 text-2xl font-bold text-rose-600 dark:text-rose-400">{problemCount} คน</p>
          <p className="text-xs text-muted-foreground mt-0.5">ต้องได้รับการช่วยเหลือเร่งด่วน</p>
        </div>
      </div>

      {/* Student List & Action Table */}
      <div className="rounded-2xl border border-border bg-card shadow-xs overflow-hidden">
        <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between border-b border-border">
          <div>
            <h2 className="text-base font-semibold text-foreground">รายชื่อนักเรียนและสถานะการประเมิน</h2>
            <p className="text-xs text-muted-foreground mt-0.5">เลือกนักเรียนเพื่อเริ่มทำแบบประเมิน SDQ</p>
          </div>

          <div className="flex items-center gap-2 max-w-sm w-full sm:w-auto">
            {query ? (
              <Link href="/screening/sdq">
                <Button variant="ghost" size="sm" className="h-9 text-xs text-muted-foreground hover:text-foreground shrink-0">
                  ล้างตัวกรอง (&ldquo;{query}&rdquo;)
                </Button>
              </Link>
            ) : null}

            <form method="GET" className="relative w-full">
              <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
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
            <thead className="border-b border-border bg-muted/40 text-xs text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">รหัส</th>
                <th className="px-4 py-3 font-medium">ชื่อ - นามสกุล</th>
                <th className="px-4 py-3 font-medium">ห้องเรียน</th>
                <th className="px-4 py-3 font-medium">ระดับการประเมิน</th>
                <th className="px-4 py-3 font-medium">คะแนนความเสี่ยง</th>
                <th className="px-4 py-3 text-right font-medium">ดำเนินการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-sm text-muted-foreground">
                    ไม่พบรายชื่อนักเรียนที่ค้นหา
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => {
                  const isRisk = student.riskLevel === "watch"
                  const isProblem = student.riskLevel === "high"

                  return (
                    <tr key={student.studentId} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 text-xs font-mono text-muted-foreground">
                        {student.studentCode}
                      </td>
                      <td className="px-4 py-3 font-medium text-foreground">
                        {student.fullName}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {student.classroomName ?? "-"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${
                            isProblem
                              ? "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400"
                              : isRisk
                                ? "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400"
                                : "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                          }`}
                        >
                          {isProblem ? "กลุ่มมีปัญหา" : isRisk ? "กลุ่มเสี่ยง" : "กลุ่มปกติ"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs font-mono text-foreground">
                        {student.riskScore}
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
