import React from "react"
import { AlertTriangle, CheckCircle2, ShieldAlert } from "lucide-react"

import { EmptyState } from "@/components/feedback/empty-state"
import type { RiskFactorDistribution } from "@/lib/server/risk-read-models"
import type { StudentRiskFactorData } from "@/lib/server/risk-read-models"
import type { StudentWorklistItem } from "@/lib/server/student-care-read-models"

type MobileRiskFactorsProps = {
  factorDistribution: RiskFactorDistribution
  student?: StudentWorklistItem | null
  studentFactors?: StudentRiskFactorData | null
}

export function MobileRiskFactors({
  factorDistribution,
  student,
  studentFactors,
}: MobileRiskFactorsProps) {
  const isStudentView = studentFactors !== null && studentFactors !== undefined
  const factors = isStudentView
    ? (studentFactors?.factors ?? []).map((factor) => ({
        factorKey: factor.factorKey,
        factorLabel: factor.factorLabel,
        count: factor.score,
        percentage: null as number | null,
        evidence: factor.evidence,
      }))
    : factorDistribution.factors.map((factor) => ({
        factorKey: factor.factorKey,
        factorLabel: factor.factorLabel,
        count: factor.count,
        percentage:
          factorDistribution.totalStudents > 0
            ? Math.round((factor.count / factorDistribution.totalStudents) * 100)
            : 0,
        evidence: null as string | null,
      }))

  if (factors.length === 0) {
    return (
      <div className="bg-card rounded-xl p-5 border border-border shadow-sm h-full">
          <h3 className="text-sm font-semibold text-foreground mb-3">
            {isStudentView ? "ปัจจัยเสี่ยงของนักเรียน" : "ปัจจัยเสี่ยงหลักของโรงเรียน"}
          </h3>
          <EmptyState
          title={isStudentView && !studentFactors?.hasAssessment ? "ยังไม่มีผลประเมินของนักเรียน" : "ไม่พบปัจจัยเสี่ยง"}
          description={
            isStudentView
              ? "นักเรียนคนนี้ยังไม่มีปัจจัยจากผลประเมินในภาคเรียนปัจจุบัน"
              : "ระบบยังไม่พบกลุ่มเสี่ยงสำคัญในโรงเรียนขณะนี้"
          }
          className="py-6"
        />
      </div>
    )
  }

  return (
    <div className="bg-card rounded-xl p-5 border border-border shadow-sm h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-foreground">
          {student ? `ปัจจัยเสี่ยงที่เกี่ยวข้องกับ ${student.fullName}` : "ปัจจัยเสี่ยงหลักในโรงเรียน"}
        </h3>
        <span className="text-xs text-muted-foreground">{factors.length} รายการ</span>
      </div>

      <div className="flex flex-col gap-3">
        {factors.map((factor) => {
          const percentage = factor.percentage ?? 0
          const isHigh = !isStudentView && percentage >= 40
          const isWatch = !isStudentView && percentage >= 15

          return (
            <div key={factor.factorKey} className="flex items-center gap-3 rounded-lg border border-border/70 bg-muted/20 p-3">
              <div
                className={`size-9 rounded-lg flex items-center justify-center shrink-0 ${
                  isHigh
                    ? "bg-red-100 text-red-700"
                    : isWatch
                      ? "bg-amber-100 text-amber-700"
                      : isStudentView
                        ? "bg-primary/10 text-primary"
                        : "bg-emerald-100 text-emerald-700"
                }`}
              >
                {isHigh ? (
                  <ShieldAlert className="size-4" />
                ) : isWatch ? (
                  <AlertTriangle className="size-4" />
                ) : isStudentView ? (
                  <ShieldAlert className="size-4" />
                ) : (
                  <CheckCircle2 className="size-4" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-semibold text-foreground truncate">{factor.factorLabel}</h4>
                <p className="text-xs text-muted-foreground">
                  {isStudentView
                    ? `${factor.count} คะแนน${factor.evidence ? `, ${factor.evidence}` : ""}`
                    : `พบ ${factor.count} คน (${percentage}%)`}
                </p>
              </div>
              <span
                className={`text-[11px] font-bold px-2 py-0.5 rounded border shrink-0 ${
                  isHigh
                    ? "text-red-700 bg-red-50 border-red-200"
                    : isWatch
                      ? "text-amber-700 bg-amber-50 border-amber-200"
                      : isStudentView
                        ? "border-primary/20 bg-primary/10 text-primary"
                        : "text-emerald-700 bg-emerald-50 border-emerald-200"
                }`}
              >
                {isStudentView ? "คะแนนปัจจัย" : isHigh ? "เสี่ยงสูง" : isWatch ? "เฝ้าระวัง" : "ปกติ"}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
