"use client"

import React, { useState, useTransition } from "react"
import Link from "next/link"
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  Loader2,
  Upload,
  UserCheck,
  Users,
  X,
} from "lucide-react"
import { toast } from "sonner"

import { EmptyState } from "@/components/feedback/empty-state"
import {
  generateStudentImportTemplateCsv,
  parseAndValidateStudentRows,
  type ParseImportResult,
} from "@/lib/student-import-parser"
import { executeStudentImportAction } from "@/app/actions/student-import.actions"
import type { ImportContextData } from "@/lib/server/student-import-service"

export function StudentImportClient({ context }: { context: ImportContextData }) {
  const [selectedClassroomId, setSelectedClassroomId] = useState<string>(
    context.classrooms[0]?.id || ""
  )
  const [selectedSemesterId, setSelectedSemesterId] = useState<string>(
    context.currentSemesterId || context.semesters[0]?.id || ""
  )
  const [file, setFile] = useState<File | null>(null)
  const [parseResult, setParseResult] = useState<ParseImportResult | null>(null)
  const [activeTab, setActiveTab] = useState<"valid" | "invalid">("valid")
  const [isImporting, startImportTransition] = useTransition()
  const [importSuccessCount, setImportSuccessCount] = useState<number | null>(null)

  // Download template
  const handleDownloadTemplate = () => {
    const csvData = generateStudentImportTemplateCsv()
    const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "แบบฟอร์มนำเข้านักเรียน_SCIDAS.csv"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success("ดาวน์โหลดแบบฟอร์ม CSV เรียบร้อยแล้ว")
  }

  // Handle file select
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0]
    if (!selected) return

    if (!selected.name.endsWith(".csv") && !selected.name.endsWith(".txt")) {
      toast.error("กรุณาเลือกไฟล์รูปแบบ .csv")
      return
    }

    setFile(selected)
    setImportSuccessCount(null)

    try {
      const text = await selected.text()
      const result = parseAndValidateStudentRows(text)
      setParseResult(result)

      if (result.validRows.length > 0) {
        toast.success(`ตรวจสอบไฟล์สำเร็จ: พร้อมนำเข้า ${result.validRows.length} คน`)
        setActiveTab("valid")
      } else {
        toast.error("ไม่พบข้อมูลนักเรียนที่ถูกต้องในไฟล์")
        setActiveTab("invalid")
      }
    } catch {
      toast.error("เกิดข้อผิดพลาดในการอ่านไฟล์")
    }
  }

  // Clear file
  const handleClearFile = () => {
    setFile(null)
    setParseResult(null)
    setImportSuccessCount(null)
  }

  // Execute Import
  const handleConfirmImport = () => {
    if (!parseResult || parseResult.validRows.length === 0) return
    if (!selectedClassroomId) {
      toast.error("กรุณาเลือกห้องเรียนสำหรับนำเข้า")
      return
    }
    if (!selectedSemesterId) {
      toast.error("กรุณาเลือกภาคเรียน")
      return
    }

    startImportTransition(async () => {
      const res = await executeStudentImportAction(
        selectedClassroomId,
        selectedSemesterId,
        parseResult.validRows
      )

      if (res.ok && res.data) {
        setImportSuccessCount(res.data.count)
        toast.success(res.message)
      } else {
        toast.error(res.message)
      }
    })
  }

  const selectedClassroom = context.classrooms.find((c) => c.id === selectedClassroomId)

  return (
    <div className="space-y-6">
      {/* 1. Header Options & Template Download */}
      <div className="rounded-xl border border-border bg-card p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-5">
          <div>
            <h3 className="text-base font-semibold">ขั้นตอนที่ 1: กำหนดห้องเรียนและดาวน์โหลดแบบฟอร์ม</h3>
            <p className="text-sm text-muted-foreground">
              เลือกห้องเรียนและภาคเรียนปลายทางที่ต้องการนำเข้านักเรียน
            </p>
          </div>
          <button
            type="button"
            onClick={handleDownloadTemplate}
            className="inline-flex items-center gap-2 rounded-lg border border-input bg-background px-3.5 py-2 text-sm font-medium hover:bg-muted shadow-sm transition-colors"
          >
            <Download className="size-4 text-primary" />
            ดาวน์โหลดแบบฟอร์ม CSV
          </button>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="importClassroom" className="block text-sm font-medium">
              ห้องเรียนปลายทาง <span className="text-destructive">*</span>
            </label>
            <select
              id="importClassroom"
              value={selectedClassroomId}
              onChange={(e) => setSelectedClassroomId(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {context.classrooms.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} (ปีการศึกษา {c.academicYear}) {c.isHomeroom ? "— ครูประจำชั้น" : ""}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="importSemester" className="block text-sm font-medium">
              ภาคเรียนที่ลงทะเบียน <span className="text-destructive">*</span>
            </label>
            <select
              id="importSemester"
              value={selectedSemesterId}
              onChange={(e) => setSelectedSemesterId(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {context.semesters.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label} {s.isCurrent ? "(ปัจจุบัน)" : ""}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 2. File Upload Dropzone */}
      <div className="rounded-xl border border-border bg-card p-5 shadow-sm sm:p-6">
        <h3 className="text-base font-semibold">ขั้นตอนที่ 2: เลือกไฟล์ข้อมูลนักเรียน</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          รองรับไฟล์ .CSV ที่กรอกตามแบบฟอร์มมาตรฐาน (เข้ารหัส UTF-8)
        </p>

        {!file ? (
          <label className="mt-4 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/20 p-8 text-center transition-colors hover:border-primary/50 hover:bg-muted/40">
            <Upload className="size-10 text-muted-foreground" />
            <span className="mt-3 text-sm font-semibold">คลิกเพื่อเลือกไฟล์ CSV หรือลากไฟล์มาวางที่นี่</span>
            <span className="mt-1 text-xs text-muted-foreground">ขนาดไฟล์ไม่เกิน 5 MB</span>
            <input
              type="file"
              accept=".csv,text/csv"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        ) : (
          <div className="mt-4 flex items-center justify-between rounded-lg border border-border bg-muted/30 p-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <FileSpreadsheet className="size-5" />
              </div>
              <div>
                <p className="font-semibold">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(file.size / 1024).toFixed(1)} KB · ตรวจสอบแล้ว{" "}
                  {parseResult ? `${parseResult.totalRows} แถว` : "กำลังอ่าน..."}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleClearFile}
              className="rounded-lg p-1.5 text-muted-foreground hover:bg-background hover:text-foreground"
              title="ยกเลิกไฟล์"
            >
              <X className="size-5" />
            </button>
          </div>
        )}
      </div>

      {/* 3. Validation Preview & Import Action */}
      {parseResult && (
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm sm:p-6 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
            <div>
              <h3 className="text-base font-semibold">ขั้นตอนที่ 3: ตรวจสอบข้อมูลก่อนนำเข้า</h3>
              <p className="text-sm text-muted-foreground">
                นำเข้าสู่ห้องเรียน: <span className="font-semibold text-foreground">{selectedClassroom?.name}</span>
              </p>
            </div>

            {/* Metric chips */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab("valid")}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                  activeTab === "valid"
                    ? "bg-emerald-600 text-white"
                    : "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300"
                }`}
              >
                <CheckCircle2 className="size-3.5" />
                ข้อมูลถูกต้อง ({parseResult.summary.validCount})
              </button>

              {parseResult.summary.invalidCount > 0 && (
                <button
                  type="button"
                  onClick={() => setActiveTab("invalid")}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                    activeTab === "invalid"
                      ? "bg-amber-600 text-white"
                      : "bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 dark:bg-amber-950/40 dark:text-amber-300"
                  }`}
                >
                  <AlertTriangle className="size-3.5" />
                  พบข้อผิดพลาด ({parseResult.summary.invalidCount})
                </button>
              )}
            </div>
          </div>

          {/* Valid Rows Table */}
          {activeTab === "valid" && (
            <div>
              {parseResult.validRows.length === 0 ? (
                <EmptyState
                  title="ไม่มีข้อมูลที่พร้อมนำเข้า"
                  description="แถวทั้งหมดในไฟล์มีข้อผิดพลาด กรุณาตรวจสอบแท็บ 'พบข้อผิดพลาด'"
                />
              ) : (
                <div className="overflow-hidden rounded-xl border border-border bg-card">
                  <div className="overflow-x-auto max-h-[380px]">
                    <table className="w-full text-left text-sm">
                      <thead className="sticky top-0 border-b border-border bg-muted/80 backdrop-blur text-xs font-semibold text-muted-foreground">
                        <tr>
                          <th className="px-3 py-2.5">เลขที่</th>
                          <th className="px-3 py-2.5">รหัสนักเรียน</th>
                          <th className="px-3 py-2.5">ชื่อ - นามสกุล</th>
                          <th className="px-3 py-2.5">เพศ</th>
                          <th className="px-3 py-2.5">วันเกิด</th>
                          <th className="px-3 py-2.5">เลขบัตรประชาชน</th>
                          <th className="px-3 py-2.5">ผู้ปกครอง</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {parseResult.validRows.map((r, idx) => (
                          <tr key={r.studentCode} className="hover:bg-muted/30">
                            <td className="px-3 py-2 text-muted-foreground font-mono">
                              {r.studentNumber ?? idx + 1}
                            </td>
                            <td className="px-3 py-2 font-mono font-semibold text-primary">
                              {r.studentCode}
                            </td>
                            <td className="px-3 py-2">
                              <span className="font-medium">
                                {r.prefix ? `${r.prefix}` : ""}
                                {r.firstName} {r.lastName}
                              </span>
                              {r.nickname && (
                                <span className="ml-1 text-xs text-muted-foreground">({r.nickname})</span>
                              )}
                            </td>
                            <td className="px-3 py-2 text-muted-foreground text-xs">
                              {r.gender === "male" ? "ชาย" : r.gender === "female" ? "หญิง" : "อื่นๆ"}
                            </td>
                            <td className="px-3 py-2 text-muted-foreground font-mono text-xs">
                              {r.dateOfBirth}
                            </td>
                            <td className="px-3 py-2 text-muted-foreground font-mono text-xs">
                              {r.nationalId || "-"}
                            </td>
                            <td className="px-3 py-2 text-xs">
                              {r.guardianFirstName ? (
                                <span>
                                  {r.guardianFirstName} ({r.guardianRelation || "ผู้ปกครอง"})
                                </span>
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Invalid Rows Report */}
          {activeTab === "invalid" && (
            <div className="space-y-3">
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/50 dark:bg-amber-950/20 text-xs text-amber-900 dark:text-amber-200">
                <p className="font-semibold">แถวที่มีข้อผิดพลาดจะไม่ถูกนำเข้า:</p>
                <p className="mt-1">
                  กรุณาตรวจสอบและแก้ไขข้อผิดพลาดในไฟล์ Excel/CSV จากนั้นอัปโหลดไฟล์ใหม่อีกครั้ง
                </p>
              </div>

              <div className="overflow-hidden rounded-xl border border-border bg-card">
                <div className="overflow-x-auto max-h-[380px]">
                  <table className="w-full text-left text-sm">
                    <thead className="sticky top-0 border-b border-border bg-muted/80 backdrop-blur text-xs font-semibold text-muted-foreground">
                      <tr>
                        <th className="px-3 py-2.5">แถวที่ (Excel)</th>
                        <th className="px-3 py-2.5">รหัส/ชื่อ</th>
                        <th className="px-3 py-2.5">สาเหตุข้อผิดพลาด</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {parseResult.invalidRows.map((inv) => (
                        <tr key={inv.rowNumber} className="hover:bg-muted/30">
                          <td className="px-3 py-2.5 font-mono font-semibold text-destructive">
                            แถว {inv.rowNumber}
                          </td>
                          <td className="px-3 py-2.5">
                            <p className="font-medium">{inv.studentName}</p>
                            <p className="text-xs font-mono text-muted-foreground">รหัส: {inv.studentCode}</p>
                          </td>
                          <td className="px-3 py-2.5">
                            <ul className="list-disc list-inside space-y-0.5 text-xs text-destructive">
                              {inv.errors.map((err, eIdx) => (
                                <li key={eIdx}>{err}</li>
                              ))}
                            </ul>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Confirm Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border pt-4">
            <div className="text-xs text-muted-foreground">
              {parseResult.validRows.length > 0 ? (
                <span>
                  พร้อมนำเข้า <strong className="text-foreground">{parseResult.validRows.length}</strong> คน เข้าสู่{" "}
                  <strong>{selectedClassroom?.name}</strong>
                </span>
              ) : (
                <span className="text-destructive font-medium">ไม่สามารถนำเข้าได้เนื่องจากไม่มีข้อมูลที่ถูกต้อง</span>
              )}
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleClearFile}
                disabled={isImporting}
                className="rounded-lg border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-muted"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                disabled={isImporting || parseResult.validRows.length === 0}
                onClick={handleConfirmImport}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 shadow-sm"
              >
                {isImporting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    กำลังบันทึกข้อมูล...
                  </>
                ) : (
                  <>
                    <UserCheck className="size-4" />
                    ยืนยันการนำเข้า ({parseResult.validRows.length} คน)
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal / Banner */}
      {importSuccessCount !== null && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-6 dark:border-emerald-900/50 dark:bg-emerald-950/30">
          <div className="flex items-start gap-4">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white">
              <CheckCircle2 className="size-6" />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-base font-semibold text-emerald-900 dark:text-emerald-200">
                นำเข้าข้อมูลนักเรียนสำเร็จ!
              </h4>
              <p className="mt-1 text-sm text-emerald-800 dark:text-emerald-300">
                บันทึกข้อมูลนักเรียนและลงทะเบียนเข้าห้องเรียน {selectedClassroom?.name} เรียบร้อยแล้ว จำนวน{" "}
                <strong>{importSuccessCount}</strong> คน
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link
                  href="/students"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 shadow-sm transition-colors"
                >
                  <Users className="size-4" />
                  ดูรายชื่อนักเรียนทั้งหมด
                </Link>
                <button
                  type="button"
                  onClick={handleClearFile}
                  className="rounded-lg border border-emerald-300 bg-white dark:bg-background px-4 py-2 text-sm font-medium hover:bg-muted"
                >
                  นำเข้าห้องเรียนอื่นต่อ
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
