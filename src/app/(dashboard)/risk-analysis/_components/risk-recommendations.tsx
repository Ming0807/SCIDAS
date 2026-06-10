import Link from "next/link"
import {
  BookOpen,
  ChevronRight,
  Clock,
  HeartPulse,
  ShieldAlert,
  type LucideIcon,
} from "lucide-react"

import { Section, StatusBadge } from "@/components/dashboard"
import { buttonVariants } from "@/components/ui/button"
import type { StudentWorklistItem } from "@/lib/server/student-care-read-models"
import { cn } from "@/lib/utils"

function RecommendationItem({
  icon: Icon,
  title,
  description,
  count,
  href,
  tone,
}: {
  icon: LucideIcon
  title: string
  description: string
  count: number
  href: string
  tone: string
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-lg border border-border bg-background p-3 transition-colors hover:bg-muted/40"
    >
      <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        <Icon aria-hidden="true" className="size-5" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-center gap-2">
          <h4 className="truncate text-sm font-semibold text-foreground">{title}</h4>
          <StatusBadge status={tone} label={count.toLocaleString("th-TH")} size="sm" />
        </div>
        <p className="mt-1 truncate text-xs text-muted-foreground">{description}</p>
      </div>
      <ChevronRight aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
    </Link>
  )
}

export function RiskRecommendations({
  students,
}: {
  students: StudentWorklistItem[]
}) {
  const highRisk = students.filter((student) => student.riskLevel === "high").length
  const watch = students.filter((student) => student.riskLevel === "watch").length
  const attendanceIssues = students.filter(
    (student) => student.absentDays30d > 0 || student.lateDays30d > 2,
  ).length
  const openActions = students.reduce((total, student) => total + student.openActionCount, 0)

  return (
    <Section
      variant="surface"
      title="ข้อเสนอแนะ"
      description="สร้างจากข้อมูลความเสี่ยง งานเปิด และการมาเรียนล่าสุด"
      contentClassName="space-y-3"
      className="h-full"
    >
      <RecommendationItem
        icon={ShieldAlert}
        title="กลุ่มเสี่ยงสูง"
        description="ควรสร้างเคสดูแลและกำหนดผู้รับผิดชอบ"
        count={highRisk}
        href="/students?status=high"
        tone="high-risk"
      />
      <RecommendationItem
        icon={HeartPulse}
        title="กลุ่มเฝ้าระวัง"
        description="ติดตามแนวโน้มก่อนยกระดับเป็นเคส"
        count={watch}
        href="/students?status=watch"
        tone="watch"
      />
      <RecommendationItem
        icon={BookOpen}
        title="ประเด็นการมาเรียน"
        description="ตรวจสอบการขาด สาย และการติดต่อผู้ปกครอง"
        count={attendanceIssues}
        href="/attendance"
        tone="info"
      />
      <RecommendationItem
        icon={Clock}
        title="งานที่ยังเปิด"
        description="ปิดงานที่เสร็จแล้วและนัดติดตามรายการค้าง"
        count={openActions}
        href="/support"
        tone={openActions > 0 ? "watch" : "normal"}
      />

      <Link href="/support/new" className={cn(buttonVariants(), "mt-1 w-full")}>
        สร้างแผนช่วยเหลือกลุ่มเสี่ยง
      </Link>
    </Section>
  )
}
