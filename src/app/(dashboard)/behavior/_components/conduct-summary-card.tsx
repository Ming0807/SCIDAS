"use client"

import { useState } from "react"
import {
  AlertCircle,
  Award,
  CheckCircle2,
  FileText,
  Printer,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react"

import { MetricCard } from "@/components/dashboard/metric-card"
import { Button } from "@/components/ui/button"
import type {
  ConductSummary,
  StudentConductItem,
} from "@/lib/behavior-constants"

import { ConductPrintableDialog } from "./conduct-printable-dialog"

export function ConductSummaryCard({
  conductSummary,
}: {
  conductSummary: ConductSummary
}) {
  const [selectedStudent, setSelectedStudent] = useState<StudentConductItem | null>(null)
  const [docType, setDocType] = useState<"notice" | "certificate">("notice")
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleOpenPrint = (student: StudentConductItem, type: "notice" | "certificate") => {
    setSelectedStudent(student)
    setDocType(type)
    setIsDialogOpen(true)
  }

  const hasData = conductSummary.conductList.length > 0

  return (
    <div className="space-y-4">
      {/* KPI Metrics */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="คะแนนความประพฤติเฉลี่ย"
          value={hasData ? `${conductSummary.averageScore}` : "100"}
          description="จากฐานคะแนนเต็ม 100 คะแนน"
          icon={ShieldCheck}
          status={conductSummary.averageScore >= 80 ? "normal" : conductSummary.averageScore >= 60 ? "watch" : "high-risk"}
          size="compact"
        />
        <MetricCard
          title="ความประพฤติดีเยี่ยม (90-100)"
          value={`${conductSummary.excellentCount} คน`}
          description="ปฏิบัติตามกฎระเบียบและมีจิตอาสา"
          icon={Award}
          status="normal"
          size="compact"
        />
        <MetricCard
          title="ความประพฤติดี/ปานกลาง (60-89)"
          value={`${conductSummary.goodCount + conductSummary.fairCount} คน`}
          description="อยู่ในเกณฑ์มาตรฐาน สพฐ."
          icon={CheckCircle2}
          status="normal"
          size="compact"
        />
        <MetricCard
          title="ต้องปรับปรุงเร่งด่วน (<60)"
          value={`${conductSummary.needsImprovementCount} คน`}
          description={
            conductSummary.needsImprovementCount > 0
              ? "ต้องออกหนังสือแจ้งผู้ปกครอง"
              : "ไม่มีนักเรียนที่ถูกตัดคะแนนเกินเกณฑ์"
          }
          icon={AlertCircle}
          status={conductSummary.needsImprovementCount > 0 ? "high-risk" : "normal"}
          size="compact"
        />
      </div>

      {/* Conduct Ranking & Action Table */}
      <div className="rounded-2xl border border-border bg-card shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
              <ShieldAlert className="size-5 text-primary" />
              สรุปคะแนนความประพฤติรายบุคคล (Conduct Points Ledger)
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              ฐาน 100 คะแนนตามระเบียบกระทรวงศึกษาธิการว่าด้วยการตัดคะแนนความประพฤติ
            </p>
          </div>

          <span className="text-xs text-muted-foreground">
            แสดง {conductSummary.conductList.length} คนที่มีประวัติการบันทึก
          </span>
        </div>

        {conductSummary.conductList.length === 0 ? (
          <div className="p-8 text-center text-xs text-muted-foreground">
            ยังไม่มีข้อมูลการตัดหรือเพิ่มคะแนนความประพฤติในภาคเรียนนี้
          </div>
        ) : (
          <div className="divide-y divide-border overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-muted/40 text-muted-foreground font-semibold border-b border-border">
                  <th className="py-3 px-4">นักเรียน</th>
                  <th className="py-3 px-4 hidden sm:table-cell">ห้องเรียน</th>
                  <th className="py-3 px-4 text-center">ถูกตัดคะแนน</th>
                  <th className="py-3 px-4 text-center">จิตอาสา/ความดี</th>
                  <th className="py-3 px-4 text-center">คะแนนคงเหลือ</th>
                  <th className="py-3 px-4 text-center">ระดับความประพฤติ</th>
                  <th className="py-3 px-4 text-center">เอกสารทางการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {conductSummary.conductList.map((student) => {
                  const isLow = student.finalScore < 60
                  const isHigh = student.finalScore >= 90

                  return (
                    <tr key={student.studentId} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4 font-medium text-foreground">
                        {student.studentName}
                      </td>
                      <td className="py-3 px-4 text-muted-foreground hidden sm:table-cell">
                        {student.studentClass || "ไม่ระบุ"}
                      </td>
                      <td className="py-3 px-4 text-center font-semibold text-rose-600 dark:text-rose-400">
                        {student.deductedPoints > 0 ? `-${student.deductedPoints}` : "0"}
                      </td>
                      <td className="py-3 px-4 text-center font-semibold text-emerald-600 dark:text-emerald-400">
                        {student.addedPoints > 0 ? `+${student.addedPoints}` : "0"}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-lg text-xs font-bold ${
                            isLow
                              ? "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300"
                              : isHigh
                                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                                : "bg-muted text-foreground"
                          }`}
                        >
                          {student.finalScore} / 100
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`rounded-md px-2 py-0.5 text-xs font-medium ${
                            student.tier === "needs_improvement"
                              ? "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300"
                              : student.tier === "excellent"
                                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                                : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {student.tierLabel}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {isLow ? (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenPrint(student, "notice")}
                              className="text-xs gap-1 h-7 px-2 text-rose-700 border-rose-300 hover:bg-rose-50 dark:border-rose-800 dark:text-rose-300 dark:hover:bg-rose-950/40"
                            >
                              <Printer className="size-3" />
                              แจ้งผู้ปกครอง
                            </Button>
                          ) : isHigh ? (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenPrint(student, "certificate")}
                              className="text-xs gap-1 h-7 px-2 text-emerald-700 border-emerald-300 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-300 dark:hover:bg-emerald-950/40"
                            >
                              <Award className="size-3" />
                              ใบรับรอง
                            </Button>
                          ) : (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenPrint(student, "notice")}
                              className="text-xs gap-1 h-7 px-2 text-muted-foreground"
                            >
                              <FileText className="size-3" />
                              ใบบันทึก
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Printable Dialog */}
      {selectedStudent && (
        <ConductPrintableDialog
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          student={selectedStudent}
          docType={docType}
        />
      )}
    </div>
  )
}
