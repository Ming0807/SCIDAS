"use client"

import { Printer, X } from "lucide-react"

import type { MonthlyAttendanceSummary } from "@/lib/attendance-constants"
import { Button } from "@/components/ui/button"

interface AttendancePrintableDialogProps {
  isOpen: boolean
  onClose: () => void
  classroomName: string
  monthlySummary: MonthlyAttendanceSummary
}

export function AttendancePrintableDialog({
  isOpen,
  onClose,
  classroomName,
  monthlySummary,
}: AttendancePrintableDialogProps) {
  if (!isOpen) return null

  const {
    monthLabel,
    totalSchoolDays,
    averageAttendanceRate,
    criticalRiskCount,
    items,
  } = monthlySummary

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm print:static print:inset-auto print:bg-white print:p-0">
      <div className="flex max-h-[90vh] w-full max-w-4xl flex-col rounded-2xl border border-border bg-card shadow-2xl print:max-h-none print:w-full print:max-w-none print:rounded-none print:border-0 print:shadow-none">
        {/* Modal Controls (Hidden in Print) */}
        <div className="flex items-center justify-between border-b border-border p-4 print:hidden">
          <div className="flex items-center gap-2">
            <Printer className="size-5 text-primary" />
            <h3 className="text-base font-semibold text-foreground">
              พิมพ์แบบบันทึกเวลาเรียนประจำเดือน (ปพ.5)
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5"
            >
              <Printer className="size-4" />
              <span>พิมพ์เอกสาร</span>
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="size-8 p-0 text-muted-foreground hover:text-foreground"
            >
              <X className="size-4" />
            </Button>
          </div>
        </div>

        {/* Printable Paper Area */}
        <div className="flex-1 overflow-y-auto p-8 print:overflow-visible print:p-6 text-foreground bg-background">
          <style dangerouslySetInnerHTML={{ __html: "@media print { @page { size: A4 landscape; margin: 10mm; } }" }} />
          <div className="space-y-6">
            {/* Official Thai School Document Header */}
            <div className="text-center space-y-1 border-b-2 border-primary/20 pb-4">
              <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                กระทรวงศึกษาธิการ • สำนักงานคณะกรรมการการศึกษาขั้นพื้นฐาน
              </p>
              <h1 className="text-xl font-bold tracking-tight text-foreground">
                แบบบันทึกเวลาเรียนและสถิติการมาเรียนประจำเดือน (ปพ.5)
              </h1>
              <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-1 text-sm font-medium text-muted-foreground pt-1">
                <span>
                  ห้องเรียน: <strong className="text-foreground">{classroomName}</strong>
                </span>
                <span>
                  ประจำเดือน: <strong className="text-foreground">{monthLabel}</strong>
                </span>
                <span>
                  จำนวนวันเปิดเรียน:{" "}
                  <strong className="text-foreground">{totalSchoolDays} วัน</strong>
                </span>
                <span>
                  นักเรียนทั้งหมด:{" "}
                  <strong className="text-foreground">{items.length} คน</strong>
                </span>
              </div>
            </div>

            {/* Attendance Analytics Summary Bar */}
            <div className="grid grid-cols-3 gap-3 rounded-lg border border-border bg-muted/20 p-3 text-center text-xs">
              <div>
                <span className="text-muted-foreground">เวลาเรียนเฉลี่ยทั้งห้อง: </span>
                <strong className="font-semibold text-foreground">
                  {averageAttendanceRate}%
                </strong>
              </div>
              <div>
                <span className="text-muted-foreground">นักเรียนผ่านเกณฑ์ (≥ 80%): </span>
                <strong className="font-semibold text-emerald-700">
                  {items.length - criticalRiskCount} คน
                </strong>
              </div>
              <div>
                <span className="text-muted-foreground">นักเรียนเสี่ยง มส. (&lt; 80%): </span>
                <strong className="font-semibold text-rose-700">
                  {criticalRiskCount} คน
                </strong>
              </div>
            </div>

            {/* Student Attendance Ledger Table */}
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-border bg-muted/40 font-semibold text-muted-foreground">
                  <tr>
                    <th className="py-2.5 px-3 text-center w-12">ลำดับ</th>
                    <th className="py-2.5 px-3 w-28">รหัสนักเรียน</th>
                    <th className="py-2.5 px-4 min-w-[180px]">ชื่อ - สกุล</th>
                    <th className="py-2.5 px-3 text-center">มาเรียน</th>
                    <th className="py-2.5 px-3 text-center">ขาด</th>
                    <th className="py-2.5 px-3 text-center">มาสาย</th>
                    <th className="py-2.5 px-3 text-center">ลา/ป่วย</th>
                    <th className="py-2.5 px-3 text-center">ร้อยละ (%)</th>
                    <th className="py-2.5 px-3 text-center">ผลการประเมิน</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {items.map((item, idx) => (
                    <tr
                      key={item.studentId}
                      className={
                        item.riskLevel === "critical"
                          ? "bg-rose-50/40 print:bg-rose-50/20"
                          : idx % 2 === 0
                            ? "bg-background"
                            : "bg-muted/10"
                      }
                    >
                      <td className="py-2 px-3 text-center font-medium text-muted-foreground">
                        {idx + 1}
                      </td>
                      <td className="py-2 px-3 font-mono text-muted-foreground">
                        {item.studentCode ?? "-"}
                      </td>
                      <td className="py-2 px-4 font-medium text-foreground">
                        {item.studentName}
                      </td>
                      <td className="py-2 px-3 text-center font-medium text-emerald-700">
                        {item.presentDays}
                      </td>
                      <td className="py-2 px-3 text-center font-medium text-rose-700">
                        {item.absentDays}
                      </td>
                      <td className="py-2 px-3 text-center text-amber-700">
                        {item.lateDays}
                      </td>
                      <td className="py-2 px-3 text-center text-muted-foreground">
                        {item.leaveDays + item.sickDays}
                      </td>
                      <td className="py-2 px-3 text-center font-semibold text-foreground">
                        {item.attendanceRate}%
                      </td>
                      <td className="py-2 px-3 text-center">
                        <span
                          className={`inline-block rounded px-2 py-0.5 text-xs font-semibold ${
                            item.riskLevel === "critical"
                              ? "bg-rose-100 text-rose-800"
                              : item.riskLevel === "watch"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-emerald-100 text-emerald-800"
                          }`}
                        >
                          {item.riskLevel === "critical"
                            ? "เสี่ยง มส."
                            : item.riskLevel === "watch"
                              ? "เฝ้าระวัง"
                              : "ปกติ"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Official 3-Party Signatures Section */}
            <div className="pt-8 border-t border-border/80 break-inside-avoid">
              <div className="grid grid-cols-3 gap-6 text-center text-xs">
                {/* 1. Homeroom Teacher */}
                <div className="space-y-12">
                  <p className="font-medium text-muted-foreground">ลงชื่อ..................................................</p>
                  <div>
                    <p className="font-semibold text-foreground">(..................................................)</p>
                    <p className="text-muted-foreground">ครูประจำชั้น / ครูที่ปรึกษา</p>
                    <p className="text-muted-foreground">วันที่ ......./......./.......</p>
                  </div>
                </div>

                {/* 2. Head of Academic Affairs */}
                <div className="space-y-12">
                  <p className="font-medium text-muted-foreground">ลงชื่อ..................................................</p>
                  <div>
                    <p className="font-semibold text-foreground">(..................................................)</p>
                    <p className="text-muted-foreground">หัวหน้าฝ่ายวิชาการ</p>
                    <p className="text-muted-foreground">วันที่ ......./......./.......</p>
                  </div>
                </div>

                {/* 3. School Principal */}
                <div className="space-y-12">
                  <p className="font-medium text-muted-foreground">ลงชื่อ..................................................</p>
                  <div>
                    <p className="font-semibold text-foreground">(..................................................)</p>
                    <p className="text-muted-foreground">ผู้อำนวยการสถานศึกษา</p>
                    <p className="text-muted-foreground">วันที่ ......./......./.......</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
