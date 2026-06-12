import React from "react"
import { BookOpen, TrendingDown, TrendingUp } from "lucide-react"

import { PageShell, PageHeader, MetricCard } from "@/components/dashboard"
import { StatusBadge } from "@/components/dashboard/status-badge"
import { EmptyState } from "@/components/feedback/empty-state"
import { ErrorState } from "@/components/feedback/error-state"
import { cn } from "@/lib/utils"
import { getStudentInitials, formatGradeLevel } from "@/lib/student-care-formatters"
import { getAcademicDashboard, type AcademicScoreItem } from "@/lib/server/academic-read-models"

export default async function AcademicsPage() {
  let dashboard: Awaited<ReturnType<typeof getAcademicDashboard>>

  try {
    dashboard = await getAcademicDashboard()
  } catch {
    return (
      <PageShell size="wide">
        <ErrorState
          title="ไม่สามารถโหลดข้อมูลผลการเรียนได้"
          description="กรุณาลองใหม่อีกครั้ง"
        />
      </PageShell>
    )
  }

  const { summary, students } = dashboard

  return (
    <PageShell size="wide">
      <PageHeader
        title="ผลการเรียน"
        description="ภาพรวมผลการเรียน เกรดเฉลี่ย และรายวิชาของนักเรียน"
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard
          title="นักเรียนทั้งหมด"
          value={summary.totalStudents.toLocaleString()}
          icon={BookOpen}
          status="neutral"
          size="compact"
          statusLabel="คน"
        />
        <MetricCard
          title="เกรดเฉลี่ยรวม"
          value={summary.averageGpa?.toFixed(2) ?? "-"}
          status={summary.averageGpa != null && summary.averageGpa >= 3.0 ? "success" : "watch"}
          size="compact"
        />
        <MetricCard
          title="เกรด ≥ 3.00"
          value={summary.studentsAbove3.toLocaleString()}
          icon={TrendingUp}
          status="success"
          size="compact"
          statusLabel={
            summary.totalStudents > 0
              ? `${Math.round((summary.studentsAbove3 / summary.totalStudents) * 100)}%`
              : undefined
          }
        />
        <MetricCard
          title="เกรด &lt; 2.00"
          value={summary.studentsBelow2.toLocaleString()}
          icon={TrendingDown}
          status={summary.studentsBelow2 > 0 ? "danger" : "success"}
          size="compact"
          statusLabel="คน"
        />
      </div>

      {/* Subject highlights */}
      {(summary.topSubject || summary.weakestSubject) ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          {summary.topSubject ? (
            <div className="bg-card border border-border rounded-lg px-4 py-3 flex items-center gap-3">
              <span className="text-xs text-muted-foreground">วิชาที่คะแนนสูงสุด:</span>
              <span className="font-semibold text-foreground">{summary.topSubject}</span>
              {summary.topSubjectAvg != null ? (
                <span className="text-xs text-emerald-600 font-medium ml-auto">
                  เฉลี่ย {summary.topSubjectAvg}
                </span>
              ) : null}
            </div>
          ) : null}
          {summary.weakestSubject ? (
            <div className="bg-card border border-border rounded-lg px-4 py-3 flex items-center gap-3">
              <span className="text-xs text-muted-foreground">วิชาที่ต้องพัฒนา:</span>
              <span className="font-semibold text-foreground">{summary.weakestSubject}</span>
              {summary.weakestSubjectAvg != null ? (
                <span className="text-xs text-amber-600 font-medium ml-auto">
                  เฉลี่ย {summary.weakestSubjectAvg}
                </span>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}

      {/* Student Scores Table */}
      <div className="bg-card rounded-xl border border-border shadow-sm flex flex-col min-h-0">
        <div className="p-5 border-b border-border flex items-center justify-between">
          <h2 className="text-base font-semibold text-foreground">
            ผลการเรียนนักเรียน
          </h2>
          <span className="text-xs text-muted-foreground">
            {students.length} รายการ
          </span>
        </div>

        {students.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title="ไม่มีข้อมูลผลการเรียน"
              description="ยังไม่มีการบันทึกผลการเรียนในภาคการศึกษานี้"
            />
          </div>
        ) : (
          <div className="p-0 overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[750px]">
              <thead>
                <tr className="border-b border-border text-xs font-semibold text-muted-foreground bg-muted/30">
                  <th className="py-3 px-4 whitespace-nowrap">#</th>
                  <th className="py-3 px-4 whitespace-nowrap">นักเรียน</th>
                  <th className="py-3 px-4 whitespace-nowrap">ชั้น</th>
                  <th className="py-3 px-4 whitespace-nowrap">วิชา</th>
                  <th className="py-3 px-4 text-right whitespace-nowrap">เก็บคะแนน</th>
                  <th className="py-3 px-4 text-right whitespace-nowrap">กลางภาค</th>
                  <th className="py-3 px-4 text-right whitespace-nowrap">ปลายภาค</th>
                  <th className="py-3 px-4 text-right whitespace-nowrap">รวม</th>
                  <th className="py-3 px-4 text-center whitespace-nowrap">เกรด</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {students.map((item, i) => (
                  <ScoreRow key={item.id} item={item} index={i + 1} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </PageShell>
  )
}

function ScoreRow({ item, index }: { item: AcademicScoreItem; index: number }) {
  const initials = getStudentInitials(item.studentName)
  const scoreOk = (item.totalScore ?? 0) >= 50

  return (
    <tr className="border-b border-border hover:bg-muted/30 transition-colors">
      <td className="py-3 px-4 text-muted-foreground text-xs">{index}</td>
      <td className="py-3 px-4 whitespace-nowrap">
        <div className="flex items-center gap-3">
          <span className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold shrink-0">
            {initials}
          </span>
          <div>
            <div className="font-semibold text-foreground">{item.studentName}</div>
            <div className="text-xs text-muted-foreground">{item.studentCode ?? "-"}</div>
          </div>
        </div>
      </td>
      <td className="py-3 px-4 text-muted-foreground whitespace-nowrap">
        {formatGradeLevel(item.gradeLevel)}
        {item.classroomName ? `/${item.classroomName}` : ""}
      </td>
      <td className="py-3 px-4 text-foreground font-medium whitespace-nowrap">
        {item.subjectName}
      </td>
      <td className="py-3 px-4 text-right text-muted-foreground whitespace-nowrap">
        {item.classworkScore != null ? item.classworkScore.toFixed(1) : "-"}
      </td>
      <td className="py-3 px-4 text-right text-muted-foreground whitespace-nowrap">
        {item.midtermScore != null ? item.midtermScore.toFixed(1) : "-"}
      </td>
      <td className="py-3 px-4 text-right text-muted-foreground whitespace-nowrap">
        {item.finalScore != null ? item.finalScore.toFixed(1) : "-"}
      </td>
      <td className="py-3 px-4 text-right font-semibold whitespace-nowrap">
        <span className={cn(scoreOk ? "text-foreground" : "text-red-600")}>
          {item.totalScore != null ? item.totalScore.toFixed(1) : "-"}
        </span>
      </td>
      <td className="py-3 px-4 text-center whitespace-nowrap">
        {item.grade ? (
          <StatusBadge
            status={
              item.gradePoint != null && item.gradePoint >= 3.0
                ? "success"
                : item.gradePoint != null && item.gradePoint >= 2.0
                  ? "info"
                  : "danger"
            }
            label={item.grade}
            size="sm"
          />
        ) : (
          <span className="text-xs text-muted-foreground">-</span>
        )}
      </td>
    </tr>
  )
}
