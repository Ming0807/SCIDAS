import React from "react"
import { EmptyState } from "@/components/feedback/empty-state"
import type { StudentWorklistItem } from "@/lib/server/student-care-read-models"

type MobileRiskBenchmarkProps = {
  student?: StudentWorklistItem | null
  schoolAverageScore: number
  totalStudents: number
}

export function MobileRiskBenchmark({
  student,
  schoolAverageScore,
  totalStudents,
}: MobileRiskBenchmarkProps) {
  if (totalStudents === 0) {
    return (
      <div className="bg-card rounded-xl p-5 border border-border shadow-sm">
        <h3 className="text-sm font-semibold text-foreground mb-3">เปรียบเทียบกับเกณฑ์</h3>
        <EmptyState
          title="ไม่มีข้อมูลเกณฑ์เปรียบเทียบ"
          description="ยังไม่มีข้อมูลนักเรียนสำหรับคำนวณค่าเฉลี่ยในโรงเรียน"
          className="py-6"
        />
      </div>
    )
  }

  const studentScore = student?.riskScore ?? null

  return (
    <div className="bg-card rounded-xl p-5 border border-border shadow-sm">
      <h3 className="text-sm font-semibold text-foreground mb-4">เปรียบเทียบกับเกณฑ์</h3>

      <div className="flex flex-col gap-4">
        {student ? (
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-foreground w-28 shrink-0 truncate">
              {student.fullName}
            </span>
            <div className="flex-1 h-2.5 bg-muted rounded-full overflow-hidden flex items-center relative">
              <div
                className={`h-full rounded-full ${
                  (studentScore ?? 0) >= 70
                    ? "bg-red-500"
                    : (studentScore ?? 0) >= 40
                      ? "bg-amber-500"
                      : "bg-emerald-500"
                }`}
                style={{ width: `${Math.min(studentScore ?? 0, 100)}%` }}
              />
            </div>
            <span className="text-xs font-bold text-foreground w-7 text-right">
              {studentScore !== null ? studentScore : "-"}
            </span>
          </div>
        ) : null}

        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-muted-foreground w-28 shrink-0">
            ค่าเฉลี่ยโรงเรียน
          </span>
          <div className="flex-1 h-2.5 bg-muted rounded-full overflow-hidden flex items-center relative">
            <div
              className="h-full bg-blue-500 rounded-full"
              style={{ width: `${Math.min(schoolAverageScore, 100)}%` }}
            />
          </div>
          <span className="text-xs font-bold text-muted-foreground w-7 text-right">
            {schoolAverageScore}
          </span>
        </div>

        <div className="flex items-center gap-3 relative pt-2 border-t border-border mt-1">
          <span className="text-xs text-muted-foreground w-28 shrink-0">เกณฑ์เฝ้าระวัง (60)</span>
          <div className="flex-1 relative h-4 flex items-center">
            <div className="absolute left-0 right-0 h-[1px] bg-border border-t border-dashed border-amber-400 z-0 top-1/2" />
          </div>
          <span className="text-xs text-muted-foreground w-7 text-right">60</span>
        </div>

        <div className="flex justify-between pl-32 pr-9 mt-0.5">
          <span className="text-[10px] text-muted-foreground">0</span>
          <span className="text-[10px] text-muted-foreground">25</span>
          <span className="text-[10px] text-muted-foreground">50</span>
          <span className="text-[10px] text-muted-foreground">75</span>
          <span className="text-[10px] text-muted-foreground">100</span>
        </div>
      </div>
    </div>
  )
}
