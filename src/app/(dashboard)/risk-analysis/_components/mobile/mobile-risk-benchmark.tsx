import React from "react"
import { EmptyState } from "@/components/feedback/empty-state"
import type {
  RiskDimensionBenchmark,
  StudentRiskFactorData,
} from "@/lib/server/risk-read-models"

type MobileRiskBenchmarkProps = {
  totalStudents: number
  benchmarks: RiskDimensionBenchmark[]
  studentFactors?: StudentRiskFactorData | null
}

export function MobileRiskBenchmark({
  totalStudents,
  benchmarks,
  studentFactors,
}: MobileRiskBenchmarkProps) {
  const isStudentView = studentFactors !== null && studentFactors !== undefined

  if (totalStudents === 0 || benchmarks.length === 0 || (isStudentView && !studentFactors?.hasAssessment)) {
    return (
      <div className="bg-card rounded-xl p-5 border border-border shadow-sm">
        <h3 className="text-sm font-semibold text-foreground mb-3">
          {isStudentView ? "เปรียบเทียบความเสี่ยงรายมิติ" : "เปรียบเทียบกับเกณฑ์"}
        </h3>
        <EmptyState
          title={isStudentView && !studentFactors?.hasAssessment ? "ยังไม่มีผลประเมินของนักเรียน" : "ไม่มีข้อมูลเกณฑ์เปรียบเทียบรายมิติ"}
          description={
            isStudentView && !studentFactors?.hasAssessment
              ? "ยังเปรียบเทียบรายมิติไม่ได้จนกว่าจะมีผลประเมินในภาคเรียนปัจจุบัน"
              : "ยังไม่มีข้อมูลปัจจัยความเสี่ยงเพียงพอสำหรับสร้างเกณฑ์เปรียบเทียบ"
          }
          className="py-6"
        />
      </div>
    )
  }

  return (
    <div className="bg-card rounded-xl p-5 border border-border shadow-sm">
      <h3 className="text-sm font-semibold text-foreground mb-4">
        {isStudentView
          ? "เปรียบเทียบความเสี่ยงรายมิติ"
          : "เกณฑ์เปรียบเทียบรายมิติของโรงเรียน"}
      </h3>

      <div className="flex flex-col gap-4">
        {benchmarks.map((benchmark) => {
          const studentFactor = studentFactors?.factors.find(
            (factor) => factor.factorKey === benchmark.dimensionKey,
          )
          const studentDimensionScore = studentFactor?.score ?? null
          const maxScore = Math.max(benchmark.averageScore, studentDimensionScore ?? 0, 1)

          return (
            <div key={benchmark.dimensionKey} className="space-y-2 border-b border-border pb-3 last:border-0 last:pb-0">
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-medium text-foreground truncate">{benchmark.dimensionLabel}</span>
                <span className="text-[10px] text-muted-foreground shrink-0">
                  {isStudentView ? `${studentDimensionScore ?? "ไม่มีข้อมูล"} / ${benchmark.averageScore}` : `${benchmark.averageScore} คะแนนเฉลี่ย`}
                </span>
              </div>
              <div className="space-y-1">
                {isStudentView ? (
                  <div className="flex items-center gap-2">
                    <span className="w-12 text-[10px] text-muted-foreground">นักเรียน</span>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                      <div className="h-full rounded-full bg-primary" style={{ width: `${((studentDimensionScore ?? 0) / maxScore) * 100}%` }} />
                    </div>
                  </div>
                ) : null}
                <div className="flex items-center gap-2">
                  <span className="w-12 text-[10px] text-muted-foreground">โรงเรียน</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-blue-500" style={{ width: `${(benchmark.averageScore / maxScore) * 100}%` }} />
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
