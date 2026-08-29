"use client"

import React, { useState } from "react"

import type { StudentWorklistItem } from "@/lib/server/student-care-read-models"
import type {
  RiskDimensionBenchmark,
  RiskFactorDistribution,
  StudentRiskFactorData,
} from "@/lib/server/risk-read-models"
import { MobileRiskHeader } from "./mobile-risk-header"
import { MobileOverallRisk } from "./mobile-overall-risk"
import { MobileRiskBenchmark } from "./mobile-risk-benchmark"
import { MobileRiskSpiderChart } from "./mobile-risk-spider-chart"
import { MobileRiskFactors } from "./mobile-risk-factors"
import { MobileRiskGuidelines } from "./mobile-risk-guidelines"

type MobileRiskProfileProps = {
  students: StudentWorklistItem[]
  riskCounts: { high: number; watch: number; normal: number; total: number }
  factorDistribution: RiskFactorDistribution
  dimensionBenchmarks: RiskDimensionBenchmark[]
  studentRiskFactors: Record<string, StudentRiskFactorData>
}

export function MobileRiskProfile({
  students,
  riskCounts,
  factorDistribution,
  dimensionBenchmarks,
  studentRiskFactors,
}: MobileRiskProfileProps) {
  const [selectedStudentId, setSelectedStudentId] = useState<string>("")

  const selectedStudent = students.find((s) => s.studentId === selectedStudentId) || null
  const selectedStudentFactors = selectedStudent
    ? studentRiskFactors[selectedStudent.studentId] ?? { hasAssessment: false, factors: [] }
    : null

  // Calculate school average risk score
  const validScores = students.map((s) => s.riskScore).filter((score): score is number => score !== null)
  const schoolAverageScore =
    validScores.length > 0
      ? Math.round(validScores.reduce((a, b) => a + b, 0) / validScores.length)
      : 0

  return (
    <div className="bg-background min-h-screen relative pb-10">
      <MobileRiskHeader />

      <div className="max-w-md mx-auto">
        {/* Student Selector */}
        <div className="px-4 pt-4">
          <label htmlFor="mobileStudentSelect" className="block text-xs font-semibold text-muted-foreground mb-1.5">
            เลือกนักเรียนเพื่อดูการวิเคราะห์รายบุคคล
          </label>
          <div className="relative">
            <select
              id="mobileStudentSelect"
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="w-full rounded-xl border border-input bg-card px-3.5 py-2.5 text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">ภาพรวมโรงเรียน ({students.length} คน)</option>
              {students.map((s) => (
                <option key={s.studentId} value={s.studentId}>
                  {s.studentCode ? `[${s.studentCode}] ` : ""}
                  {s.fullName} ({s.classroomName || s.gradeLevel || "-"}) -{" "}
                  {s.riskLevel === "high" ? "เสี่ยงสูง" : s.riskLevel === "watch" ? "ต้องติดตาม" : "ปกติ"}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 1. Overall Risk */}
        <div className="px-4 py-4">
          <MobileOverallRisk
            riskScore={selectedStudent ? selectedStudent.riskScore : schoolAverageScore}
            riskLevel={selectedStudent ? selectedStudent.riskLevel : riskCounts.high > 0 ? "high" : riskCounts.watch > 0 ? "watch" : "normal"}
            isSchoolOverview={!selectedStudent}
            riskCounts={riskCounts}
          />
        </div>

        {/* 2. Benchmark */}
        <div className="px-4 mb-5">
          <MobileRiskBenchmark
            totalStudents={students.length}
            benchmarks={dimensionBenchmarks}
            studentFactors={selectedStudentFactors}
          />
        </div>

        {/* 3. Spider / Dimension Chart */}
        <div className="px-4 mb-5">
          <MobileRiskSpiderChart
            factorDistribution={factorDistribution}
            studentFactors={selectedStudentFactors}
          />
        </div>

        {/* 4. Risk Factors List */}
        <div className="px-4 mb-5">
          <MobileRiskFactors
            factorDistribution={factorDistribution}
            student={selectedStudent}
            studentFactors={selectedStudentFactors}
          />
        </div>

        {/* 5. Guidelines */}
        <MobileRiskGuidelines />
      </div>
    </div>
  )
}
