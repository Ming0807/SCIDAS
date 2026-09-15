import Link from "next/link"
import { AlertTriangle, ListChecks, ShieldCheck, Users } from "lucide-react"

import { MetricCard } from "@/components/dashboard"
import { formatPercent } from "@/lib/student-care-formatters"
import type { StudentWorklistItem } from "@/lib/server/student-care-read-models"

function getPercent(count: number, total: number) {
  if (total <= 0) return "0.0%"
  return formatPercent((count / total) * 100)
}

export function RiskOverviewCards({
  students,
}: {
  students: StudentWorklistItem[]
}) {
  const total = students.length
  const highRisk = students.filter((student) => student.riskLevel === "high").length
  const watch = students.filter((student) => student.riskLevel === "watch").length
  const normal = students.filter((student) => student.riskLevel === "normal").length
  const openActions = students.reduce((count, student) => count + student.openActionCount, 0)

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <Link href="/students" className="block text-left transition-transform hover:-translate-y-0.5">
        <MetricCard
          title="นักเรียนทั้งหมด"
          value={total.toLocaleString("th-TH")}
          description="อยู่ในฐานวิเคราะห์ความเสี่ยง"
          icon={Users}
          status="primary"
          className="hover:border-primary/40 transition-colors"
        />
      </Link>
      <Link href="/students?status=high" className="block text-left transition-transform hover:-translate-y-0.5">
        <MetricCard
          title="เสี่ยงสูง"
          value={highRisk.toLocaleString("th-TH")}
          description={`${getPercent(highRisk, total)} ของนักเรียนทั้งหมด`}
          icon={AlertTriangle}
          status="high-risk"
          className="hover:border-rose-400 dark:hover:border-rose-700 transition-colors"
        />
      </Link>
      <Link href="/students?status=watch" className="block text-left transition-transform hover:-translate-y-0.5">
        <MetricCard
          title="เฝ้าระวัง"
          value={watch.toLocaleString("th-TH")}
          description={`${getPercent(watch, total)} ควรติดตามแนวโน้ม`}
          icon={ListChecks}
          status="watch"
          className="hover:border-amber-400 dark:hover:border-amber-700 transition-colors"
        />
      </Link>
      <Link href="/students?status=normal" className="block text-left transition-transform hover:-translate-y-0.5">
        <MetricCard
          title="ปกติ"
          value={normal.toLocaleString("th-TH")}
          description={`งานเปิด ${openActions.toLocaleString("th-TH")} รายการ`}
          icon={ShieldCheck}
          status="normal"
          className="hover:border-emerald-400 dark:hover:border-emerald-700 transition-colors"
        />
      </Link>
    </div>
  )
}
