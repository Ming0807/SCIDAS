"use client"

import { useState } from "react"
import { Printer, X, Users, CheckCircle2, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatThaiShortDate, formatPercent } from "@/lib/student-care-formatters"
import { getSdqClassificationLabel } from "@/lib/sdq-constants"

export interface ClassroomStudentSdqSummary {
  studentId: string
  studentCode: string
  fullName: string
  studentNumber: number | null
  classroomName: string | null
  isAssessed: boolean
  assessmentDate: string | null
  riskScore: number | null
  riskLevel: "normal" | "watch" | "high" | null
  evaluatorType: string | null
}

interface SdqClassroomBulkPrintDialogProps {
  classroomName: string
  students: ClassroomStudentSdqSummary[]
  academicYear?: string
  semesterLabel?: string
}

export function SdqClassroomBulkPrintDialog({
  classroomName,
  students,
  academicYear = "2567",
  semesterLabel = "ภาคเรียนที่ 1",
}: SdqClassroomBulkPrintDialogProps) {
  const [isOpen, setIsOpen] = useState(false)

  const total = students.length
  const assessed = students.filter((s) => s.isAssessed).length
  const normal = students.filter((s) => s.riskLevel === "normal").length
  const watch = students.filter((s) => s.riskLevel === "watch").length
  const high = students.filter((s) => s.riskLevel === "high").length
  const rate = total > 0 ? (assessed / total) * 100 : 0

  const handlePrint = () => {
    window.print()
  }

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="gap-1.5 text-xs h-9 rounded-xl border-dashed"
      >
        <Printer className="size-3.5 text-primary" />
        <span>พิมพ์รายงาน SDQ ทั้งห้อง ({classroomName})</span>
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm print:static print:inset-auto print:bg-white print:p-0">
          <div className="flex max-h-[92vh] w-full max-w-5xl flex-col rounded-2xl border border-border bg-card shadow-2xl print:max-h-none print:w-full print:max-w-none print:rounded-none print:border-0 print:shadow-none">
            {/* Modal Controls (Hidden in Print) */}
            <div className="flex items-center justify-between border-b border-border p-4 print:hidden">
              <div className="flex items-center gap-2">
                <Printer className="size-5 text-primary" />
                <div>
                  <h3 className="text-sm font-semibold text-foreground">
                    พิมพ์รายงานสรุปผล SDQ รายห้องเรียน — {classroomName}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    ประเมินแล้ว {assessed}/{total} คน ({formatPercent(rate)})
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="default"
                  size="sm"
                  onClick={handlePrint}
                  className="gap-1.5 text-xs font-semibold"
                >
                  <Printer className="size-4" />
                  <span>สั่งพิมพ์เอกสาร</span>
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="size-8 p-0 text-muted-foreground hover:text-foreground"
                >
                  <X className="size-4" />
                </Button>
              </div>
            </div>

            {/* Printable Content Body */}
            <div className="flex-1 overflow-y-auto p-6 text-foreground print:p-0">
              <div className="space-y-4">
                {/* Official Document Header */}
                <div className="text-center space-y-1 border-b border-border pb-4 print:pb-2">
                  <h1 className="text-base font-bold sm:text-lg">
                    แบบสรุปผลการประเมินพฤติกรรมและอารมณ์เด็ก (SDQ) รายห้องเรียน
                  </h1>
                  <p className="text-xs text-muted-foreground print:text-neutral-800">
                    ระบบดูแลช่วยเหลือนักเรียน สำนักงานคณะกรรมการการศึกษาขั้นพื้นฐาน (สพฐ.)
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-medium pt-1">
                    <span>ห้องเรียน: <strong>{classroomName}</strong></span>
                    <span>ภาคเรียน: <strong>{semesterLabel}</strong></span>
                    <span>ปีการศึกษา: <strong>{academicYear}</strong></span>
                    <span>จำนวนนักเรียน: <strong>{total} คน</strong></span>
                  </div>
                </div>

                {/* Summary Metrics Bar */}
                <div className="grid grid-cols-4 gap-2 text-center text-xs py-2 px-3 rounded-xl bg-muted/50 border border-border print:bg-neutral-50 print:border-neutral-300">
                  <div>
                    <span className="text-muted-foreground print:text-neutral-600 block">ประเมินแล้ว</span>
                    <strong className="text-sm">{assessed} / {total} คน ({formatPercent(rate)})</strong>
                  </div>
                  <div>
                    <span className="text-muted-foreground print:text-neutral-600 block">กลุ่มปกติ</span>
                    <strong className="text-sm text-emerald-700 dark:text-emerald-400 print:text-emerald-800">{normal} คน</strong>
                  </div>
                  <div>
                    <span className="text-muted-foreground print:text-neutral-600 block">กลุ่มเสี่ยง</span>
                    <strong className="text-sm text-amber-700 dark:text-amber-400 print:text-amber-800">{watch} คน</strong>
                  </div>
                  <div>
                    <span className="text-muted-foreground print:text-neutral-600 block">กลุ่มมีปัญหา</span>
                    <strong className="text-sm text-rose-700 dark:text-rose-400 print:text-rose-800">{high} คน</strong>
                  </div>
                </div>

                {/* Students Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border border-border border-collapse print:border-neutral-400">
                    <thead>
                      <tr className="bg-muted/70 print:bg-neutral-100 border-b border-border print:border-neutral-400">
                        <th className="p-2 border-r border-border text-center w-12 print:border-neutral-400">ลำดับ</th>
                        <th className="p-2 border-r border-border text-center w-24 print:border-neutral-400">รหัสนักเรียน</th>
                        <th className="p-2 border-r border-border print:border-neutral-400">ชื่อ - นามสกุล</th>
                        <th className="p-2 border-r border-border text-center w-28 print:border-neutral-400">วันที่ประเมิน</th>
                        <th className="p-2 border-r border-border text-center w-24 print:border-neutral-400">คะแนนรวม</th>
                        <th className="p-2 border-r border-border text-center w-28 print:border-neutral-400">ผลการคัดกรอง</th>
                        <th className="p-2 text-center w-24">สถานะ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border print:divide-neutral-300">
                      {students.map((student, idx) => {
                        const badge = student.riskLevel
                          ? getSdqClassificationLabel(
                              student.riskLevel === "high"
                                ? "problem"
                                : student.riskLevel === "watch"
                                  ? "risk"
                                  : "normal"
                            )
                          : null

                        return (
                          <tr key={student.studentId} className="hover:bg-muted/30">
                            <td className="p-2 border-r border-border text-center print:border-neutral-300">
                              {student.studentNumber ?? idx + 1}
                            </td>
                            <td className="p-2 border-r border-border text-center font-mono print:border-neutral-300">
                              {student.studentCode}
                            </td>
                            <td className="p-2 border-r border-border font-medium print:border-neutral-300">
                              {student.fullName}
                            </td>
                            <td className="p-2 border-r border-border text-center print:border-neutral-300">
                              {student.assessmentDate
                                ? formatThaiShortDate(student.assessmentDate)
                                : "-"}
                            </td>
                            <td className="p-2 border-r border-border text-center font-mono font-semibold print:border-neutral-300">
                              {student.riskScore !== null ? `${student.riskScore} / 40` : "-"}
                            </td>
                            <td className="p-2 border-r border-border text-center print:border-neutral-300">
                              {badge ? (
                                <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${badge.color}`}>
                                  {badge.text}
                                </span>
                              ) : (
                                <span className="text-muted-foreground print:text-neutral-500">
                                  ยังไม่ประเมิน
                                </span>
                              )}
                            </td>
                            <td className="p-2 text-center font-medium">
                              {student.isAssessed ? "เรียบร้อย" : "รอดำเนินการ"}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Sign-off Footer for Official Submissions */}
                <div className="pt-8 grid grid-cols-2 gap-8 text-center text-xs print:pt-12">
                  <div className="space-y-1">
                    <p className="text-muted-foreground print:text-neutral-600">ผู้รายงานข้อมูล</p>
                    <div className="pt-8">
                      <p className="font-semibold">ลงชื่อ..........................................................</p>
                      <p className="mt-1 text-muted-foreground print:text-neutral-600">( ครูประจำชั้น / ผู้ประเมิน )</p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className="text-muted-foreground print:text-neutral-600">ผู้รับรองข้อมูล</p>
                    <div className="pt-8">
                      <p className="font-semibold">ลงชื่อ..........................................................</p>
                      <p className="mt-1 text-muted-foreground print:text-neutral-600">( หัวหน้างานแนะแนว / ผู้บริหารสถานศึกษา )</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
