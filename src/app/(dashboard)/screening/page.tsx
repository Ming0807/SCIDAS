import Link from "next/link"
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Brain,
  CheckCircle2,
  ClipboardCheck,
  ClipboardList,
  Layers,
  Users,
} from "lucide-react"

import { MetricCard, PageHeader, PageShell } from "@/components/dashboard"
import { Button } from "@/components/ui/button"
import { getCurrentUserContext } from "@/lib/server/current-user"
import { getStudentWorklist } from "@/lib/server/student-care-read-models"
import { createClient } from "@/utils/supabase/server"

export const metadata = {
  title: "ศูนย์การคัดกรองนักเรียน (Screening Hub) | SCIDAS",
  description: "ระบบคัดกรองนักเรียนรอบด้าน ตามระบบดูแลช่วยเหลือนักเรียน สพฐ. 5 ขั้นตอน",
}

export default async function ScreeningHubPage() {
  const context = await getCurrentUserContext()
  const worklist = await getStudentWorklist()

  // Calculate high-level metrics
  const totalStudents = worklist.length
  const normalCount = worklist.filter((s) => s.riskLevel === "normal").length
  const watchCount = worklist.filter((s) => s.riskLevel === "watch").length
  const highRiskCount = worklist.filter((s) => s.riskLevel === "high").length

  // Query classrooms for classroom breakdown
  let classrooms: {
    id: string
    name: string
    grade_level: string
    section: number
    homeroom_teacher?: { first_name: string; last_name: string } | null
  }[] = []

  if (context.schoolId) {
    const supabase = await createClient()
    const { data } = await supabase
      .from("classrooms")
      .select(`
        id,
        name,
        grade_level,
        section,
        homeroom_teacher:profiles!classrooms_homeroom_teacher_id_fkey(first_name, last_name)
      `)
      .eq("school_id", context.schoolId)
      .eq("is_active", true)
      .order("grade_level", { ascending: true })
      .order("section", { ascending: true })

    if (data) {
      type RawClassroom = {
        id: string
        name: string
        grade_level: string
        section: number
        homeroom_teacher: { first_name: string; last_name: string } | null
      }
      classrooms = (data as unknown as RawClassroom[]) ?? []
    }
  }

  // Calculate per-classroom screening breakdown
  const classroomStats = classrooms.map((c) => {
    const studentsInClass = worklist.filter(
      (s) =>
        s.classroomName === c.name ||
        (s.gradeLevel === c.grade_level && s.section === c.section),
    )
    const count = studentsInClass.length
    const normalInClass = studentsInClass.filter((s) => s.riskLevel === "normal").length
    const atRiskInClass = studentsInClass.filter(
      (s) => s.riskLevel === "watch" || s.riskLevel === "high",
    ).length

    return {
      id: c.id,
      name: c.name || `ม.${c.grade_level}/${c.section}`,
      teacherName: c.homeroom_teacher
        ? `${c.homeroom_teacher.first_name} ${c.homeroom_teacher.last_name}`
        : "ยังไม่ระบุครูประจำชั้น",
      totalCount: count,
      normalCount: normalInClass,
      atRiskCount: atRiskInClass,
    }
  })

  return (
    <PageShell size="wide" spacing="default">
      <PageHeader
        title="ศูนย์กลางการคัดกรองนักเรียน (Screening Hub)"
        description="ขั้นตอนที่ 2 ของระบบดูแลช่วยเหลือนักเรียน สพฐ. — จำแนกนักเรียนออกเป็นกลุ่มปกติ กลุ่มเสี่ยง และกลุ่มมีปัญหา เพื่อจัดกิจกรรมส่งเสริมและป้องกันช่วยเหลืออย่างตรงจุด"
        actions={
          <div className="flex items-center gap-2">
            <Link href="/screening/sdq">
              <Button size="sm" className="gap-1.5 text-xs">
                <ClipboardCheck className="size-4" />
                ทำแบบประเมิน SDQ
              </Button>
            </Link>
            <Link href="/risk-analysis">
              <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                <Brain className="size-4" />
                วิเคราะห์ความเสี่ยง EWS
              </Button>
            </Link>
          </div>
        }
      />

      {/* Summary KPI Cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="นักเรียนทั้งหมดในระบบ"
          value={`${totalStudents} คน`}
          description="ฐานข้อมูลนักเรียนปัจจุบัน"
          icon={Users}
          status="normal"
          size="compact"
        />
        <MetricCard
          title="กลุ่มปกติ (Normal)"
          value={`${normalCount} คน`}
          description={
            totalStudents > 0
              ? `${Math.round((normalCount / totalStudents) * 100)}% ของนักเรียนทั้งหมด`
              : "0%"
          }
          icon={CheckCircle2}
          status="normal"
          size="compact"
        />
        <MetricCard
          title="กลุ่มเสี่ยง (At-Risk)"
          value={`${watchCount} คน`}
          description="ควรได้รับการเฝ้าระวังและส่งเสริม"
          icon={AlertTriangle}
          status="watch"
          size="compact"
        />
        <MetricCard
          title="กลุ่มมีปัญหา (Problematic)"
          value={`${highRiskCount} คน`}
          description="ต้องการการดูแลช่วยเหลือเร่งด่วน"
          icon={AlertTriangle}
          status="high-risk"
          size="compact"
        />
      </div>

      {/* 3 Core Screening Modules Grid */}
      <div className="space-y-3">
        <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
          <Layers className="size-5 text-primary" />
          เครื่องมือคัดกรองหลัก (สพฐ. & กรมสุขภาพจิต)
        </h2>

        <div className="grid gap-4 md:grid-cols-3">
          {/* Module 1: SDQ */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-xs flex flex-col justify-between hover:border-primary/50 transition-colors">
            <div className="space-y-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950/50 dark:text-purple-300">
                <Brain className="size-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">
                  แบบประเมินพฤติกรรมและอารมณ์เด็ก (SDQ)
                </h3>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  แบบประเมิน 25 ข้อ 5 มิติ (อารมณ์, ความประพฤติ, สมาธิสั้น, เพื่อน, และพฤติกรรมเกื้อกูล) มาตรฐานกรมสุขภาพจิต
                </p>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                  25 ข้อคำถาม
                </span>
                <span className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                  5 ด้าน
                </span>
                <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-xs text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                  พร้อมใช้งาน
                </span>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-border">
              <Link href="/screening/sdq" className="w-full block">
                <Button size="sm" className="w-full text-xs gap-1">
                  เปิดทำแบบประเมิน SDQ
                  <ArrowRight className="size-3.5" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Module 2: 5 Domains Screening */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-xs flex flex-col justify-between hover:border-primary/50 transition-colors">
            <div className="space-y-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-300">
                <ClipboardList className="size-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">
                  การคัดกรอง 5 ด้านทั่วไป (สพฐ.)
                </h3>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  คัดกรองด้านการเรียน, ด้านสุขภาพกาย, ด้านจิตใจ/พฤติกรรม, ด้านเศรษฐกิจ/ครอบครัว, และด้านสวัสดิภาพความปลอดภัย
                </p>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                  5 มิติ สพฐ.
                </span>
                <span className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                  คัดกรองรายบุคคล
                </span>
                <span className="rounded-md bg-blue-50 px-2 py-0.5 text-xs text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
                  ระบบวิเคราะห์อัตโนมัติ
                </span>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-border">
              <Link href="/risk-analysis" className="w-full block">
                <Button variant="outline" size="sm" className="w-full text-xs gap-1">
                  ดูการวิเคราะห์ 5 ด้าน
                  <ArrowRight className="size-3.5" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Module 3: Basic Skills (3R) */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-xs flex flex-col justify-between hover:border-primary/50 transition-colors">
            <div className="space-y-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-300">
                <BookOpen className="size-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">
                  การประเมินทักษะพื้นฐาน 3R
                </h3>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  คัดกรองและติดตามทักษะการอ่าน (Reading), การเขียน (Writing), และการคิดเลข (aRithmetics) ตามนโยบายเร่งด่วน
                </p>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                  อ่านออก เขียนได้
                </span>
                <span className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                  คิดเลขเป็น
                </span>
                <span className="rounded-md bg-amber-50 px-2 py-0.5 text-xs text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
                  สพฐ. จุดเน้น
                </span>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-border">
              <Link href="/academics" className="w-full block">
                <Button variant="outline" size="sm" className="w-full text-xs gap-1">
                  ดูผลการเรียนและทักษะ
                  <ArrowRight className="size-3.5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Classroom Screening Progress Breakdown */}
      <div className="rounded-2xl border border-border bg-card shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h2 className="text-base font-semibold text-foreground">
              ความคืบหน้าการคัดกรองรายห้องเรียน
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              ติดตามสถานะการคัดกรองของครูประจำชั้นในแต่ละห้องเรียน
            </p>
          </div>

          <Link href="/screening/sdq">
            <Button variant="outline" size="sm" className="text-xs">
              ทำแบบประเมินรายบุคคล
            </Button>
          </Link>
        </div>

        {classroomStats.length === 0 ? (
          <div className="p-8 text-center text-xs text-muted-foreground">
            ยังไม่มีการบันทึกข้อมูลห้องเรียนในโรงเรียนนี้ กรุณาตั้งค่าห้องเรียนในหน้าจัดการโครงสร้างวิชาการ
          </div>
        ) : (
          <div className="divide-y divide-border">
            {classroomStats.map((room) => (
              <div
                key={room.id}
                className="p-4 sm:px-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-muted/40 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-foreground">
                      {room.name}
                    </span>
                    <span className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                      {room.totalCount} คน
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    ครูประจำชั้น: <strong className="text-foreground">{room.teacherName}</strong>
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                      <span className="size-2 rounded-full bg-emerald-500" />
                      ปกติ: {room.normalCount}
                    </span>
                    <span className="text-muted-foreground">·</span>
                    <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium">
                      <span className="size-2 rounded-full bg-amber-500" />
                      เสี่ยง/มีปัญหา: {room.atRiskCount}
                    </span>
                  </div>

                  <Link href={`/screening/sdq`}>
                    <Button variant="outline" size="sm" className="text-xs gap-1">
                      คัดกรองห้องนี้
                      <ArrowRight className="size-3" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageShell>
  )
}
