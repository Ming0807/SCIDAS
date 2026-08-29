"use client"

import React, { useState, useTransition } from "react"
import Link from "next/link"
import {
  AlertTriangle,
  CheckCircle2,
  FileSpreadsheet,
  FileText,
  Loader2,
  Upload,
  UserCheck,
  Users,
  X,
} from "lucide-react"
import { toast } from "sonner"

import { EmptyState } from "@/components/feedback/empty-state"
import type { ParseImportResult } from "@/lib/student-import-parser"
import {
  executeStudentImportAction,
  getStudentImportTemplateAction,
  parseStudentFileAction,
} from "@/app/actions/student-import.actions"
import type { ImportContextData } from "@/lib/server/student-import-service"

export function StudentImportClient({ context }: { context: ImportContextData }) {
  const [selectedClassroomId, setSelectedClassroomId] = useState<string>(
    context.classrooms[0]?.id || "",
  )
  const [selectedSemesterId, setSelectedSemesterId] = useState<string>(
    context.currentSemesterId || context.semesters[0]?.id || "",
  )
  const [file, setFile] = useState<File | null>(null)
  const [parseResult, setParseResult] = useState<ParseImportResult | null>(null)
  const [activeTab, setActiveTab] = useState<"valid" | "invalid">("valid")
  const [isParsing, startParseTransition] = useTransition()
  const [isImporting, startImportTransition] = useTransition()
  const [importSuccessCount, setImportSuccessCount] = useState<number | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  // Download CSV template via Server Action
  const handleDownloadCsvTemplate = async () => {
    try {
      const res = await getStudentImportTemplateAction("csv")
      if (!res.ok || !res.data) {
        toast.error(res.message || "ไม่สามารถสร้างแบบฟอร์ม CSV ได้")
        return
      }

      const byteCharacters = atob(res.data.contentBase64)
      const byteNumbers = new Array(byteCharacters.length)
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i)
      }
      const byteArray = new Uint8Array(byteNumbers)
      const blob = new Blob([byteArray], { type: res.data.contentType })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = res.data.fileName
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast.success("ดาวน์โหลดแบบฟอร์ม CSV เรียบร้อยแล้ว")
    } catch (err) {
      console.error("Download CSV error:", err)
      toast.error("เกิดข้อผิดพลาดในการดาวน์โหลดแบบฟอร์ม CSV")
    }
  }

  // Download XLSX template via Server Action
  const handleDownloadXlsxTemplate = async () => {
    try {
      const res = await getStudentImportTemplateAction("xlsx")
      if (!res.ok || !res.data) {
        toast.error(res.message || "ไม่สามารถสร้างแบบฟอร์ม Excel ได้")
        return
      }

      const byteCharacters = atob(res.data.contentBase64)
      const byteNumbers = new Array(byteCharacters.length)
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i)
      }
      const byteArray = new Uint8Array(byteNumbers)
      const blob = new Blob([byteArray], { type: res.data.contentType })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = res.data.fileName
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast.success("ดาวน์โหลดแบบฟอร์ม Excel (.xlsx) เรียบร้อยแล้ว")
    } catch (err) {
      console.error("Download XLSX error:", err)
      toast.error("เกิดข้อผิดพลาดในการดาวน์โหลดแบบฟอร์ม Excel")
    }
  }

  // Handle file select (CSV or XLSX) through Server Action
  const processFile = (selected: File) => {
    const ext = selected.name.split(".").pop()?.toLowerCase() ?? ""
    if (ext !== "csv" && ext !== "xlsx") {
      toast.error("กรุณาเลือกไฟล์รูปแบบ .csv หรือ .xlsx")
      return
    }

    if (selected.size > 5 * 1024 * 1024) {
      toast.error("ขนาดไฟล์เกิน 5 MB")
      return
    }

    setFile(selected)
    setImportSuccessCount(null)

    startParseTransition(async () => {
      const formData = new FormData()
      formData.set("file", selected)

      const res = await parseStudentFileAction(null, formData)
      if (res.ok && res.data) {
        setParseResult(res.data)
        if (res.data.validRows.length > 0) {
          toast.success(`ตรวจสอบไฟล์สำเร็จ: พร้อมนำเข้า ${res.data.validRows.length} คน`)
          setActiveTab("valid")
        } else {
          toast.error("ไม่พบข้อมูลนักเรียนที่ถูกต้องในไฟล์")
          setActiveTab("invalid")
        }
      } else {
        toast.error(res.message || "เกิดข้อผิดพลาดในการตรวจสอบไฟล์")
        setParseResult(null)
      }
    })
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0]
    if (selected) processFile(selected)
  }

  const handleFileDrop = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault()
    setIsDragging(false)
    const selected = event.dataTransfer.files?.[0]
    if (selected) processFile(selected)
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
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={handleDownloadCsvTemplate}
              className="inline-flex items-center gap-2 rounded-lg border border-input bg-background px-3.5 py-2 text-xs font-medium hover:bg-muted shadow-sm transition-colors"
            >
              <FileText className="size-4 text-primary" />
              แบบฟอร์ม CSV
            </button>
            <button
              type="button"
              onClick={handleDownloadXlsxTemplate}
              className="inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-800 px-3.5 py-2 text-xs font-medium hover:bg-emerald-100 shadow-sm transition-colors"
            >
              <FileSpreadsheet className="size-4 text-emerald-600" />
              แบบฟอร์ม Excel (.xlsx)
            </button>
          </div>
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
              className="mt-1.5 w-full rounded-lg border border-input bg-background px-3.5 py-2.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {context.classrooms.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.isHomeroom ? "(ครูประจำชั้น)" : ""}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="importSemester" className="block text-sm font-medium">
              ภาคเรียน <span className="text-destructive">*</span>
            </label>
            <select
              id="importSemester"
              value={selectedSemesterId}
              onChange={(e) => setSelectedSemesterId(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-input bg-background px-3.5 py-2.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {context.semesters.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label} {s.isCurrent ? "(ภาคเรียนปัจจุบัน)" : ""}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 2. File Upload Dropzone */}
      <div className="rounded-xl border border-border bg-card p-5 shadow-sm sm:p-6">
        <h3 className="text-base font-semibold">ขั้นตอนที่ 2: อัปโหลดไฟล์รายชื่อนักเรียน (CSV หรือ Excel)</h3>
        <p className="mt-0.5 text-sm text-muted-foreground">
          รองรับไฟล์นามสกุล .csv และ .xlsx ขนาดไม่เกิน 5 MB และไม่เกิน 500 รายชื่อต่อครั้ง
        </p>

        {isParsing ? (
          <div className="mt-4 flex items-center justify-center gap-3 rounded-xl border border-border bg-muted/30 p-8 text-center">
            <Loader2 className="size-6 animate-spin text-primary" />
            <p className="text-sm font-medium text-muted-foreground">กำลังอ่านและตรวจสอบโครงสร้างไฟล์...</p>
          </div>
        ) : !file ? (
          <label
            onDragEnter={(event) => {
              event.preventDefault()
              setIsDragging(true)
            }}
            onDragOver={(event) => event.preventDefault()}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleFileDrop}
            className={`mt-4 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center transition ${
              isDragging
                ? "border-primary bg-primary/10"
                : "border-border bg-muted/30 hover:bg-muted/50"
            }`}
          >
            <input
              type="file"
              accept=".csv,.xlsx,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              onChange={handleFileChange}
              className="sr-only"
            />
            <div className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary mb-3">
              <Upload className="size-7" />
            </div>
            <p className="text-sm font-semibold">คลิกเพื่อเลือกไฟล์ หรือลากไฟล์มาวางที่นี่</p>
            <p className="mt-1 text-xs text-muted-foreground">
              รองรับไฟล์ .csv (UTF-8) หรือ .xlsx
            </p>
          </label>
        ) : (
          <div className="mt-4 flex items-center justify-between rounded-xl border border-border bg-muted/40 p-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary/15 text-primary">
                <FileSpreadsheet className="size-5" />
              </div>
              <div>
                <p className="text-sm font-semibold">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(file.size / 1024).toFixed(1)} KB &bull; ตรวจสอบพบทั้งหมด {parseResult?.totalRows || 0} รายการ
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleClearFile}
              className="inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
              title="ลบไฟล์"
              aria-label="ลบไฟล์ที่เลือก"
            >
              <X className="size-4" />
            </button>
          </div>
        )}
      </div>

      {/* 3. Validation Summary & Preview Table */}
      {parseResult && (
        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border bg-muted/20 px-5 py-4 sm:px-6">
            <div>
              <h3 className="text-base font-semibold">ขั้นตอนที่ 3: ตรวจสอบความถูกต้องและยืนยันการนำเข้า</h3>
              <p className="text-sm text-muted-foreground">
                พร้อมนำเข้า {parseResult.summary.validCount} คน &bull; พบข้อผิดพลาด {parseResult.summary.invalidCount} รายการ
              </p>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-2" role="tablist" aria-label="ผลการตรวจสอบไฟล์">
              <button
                type="button"
                id="valid-import-tab"
                role="tab"
                aria-selected={activeTab === "valid"}
                aria-controls="valid-import-panel"
                onClick={() => setActiveTab("valid")}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  activeTab === "valid"
                    ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                <CheckCircle2 className="size-3.5 text-emerald-600" />
                ข้อมูลถูกต้อง ({parseResult.summary.validCount})
              </button>

              <button
                type="button"
                id="invalid-import-tab"
                role="tab"
                aria-selected={activeTab === "invalid"}
                aria-controls="invalid-import-panel"
                onClick={() => setActiveTab("invalid")}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  activeTab === "invalid"
                    ? "bg-destructive/10 text-destructive border border-destructive/20"
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                <AlertTriangle className="size-3.5 text-destructive" />
                พบข้อผิดพลาด ({parseResult.summary.invalidCount})
              </button>
            </div>
          </div>

          {/* Valid Rows Tab */}
          {activeTab === "valid" && (
            <div
              id="valid-import-panel"
              role="tabpanel"
              aria-labelledby="valid-import-tab"
              className="p-0"
            >
              {parseResult.validRows.length === 0 ? (
                <div className="p-8">
                  <EmptyState
                    icon={AlertTriangle}
                    title="ไม่มีรายการข้อมูลที่ถูกต้อง"
                    description="โปรดตรวจสอบแถวที่มีข้อผิดพลาดในแท็บ 'พบข้อผิดพลาด' และแก้ไขข้อมูลในไฟล์"
                  />
                </div>
              ) : (
                <div className="overflow-x-auto max-h-96">
                  <table className="w-full text-left text-sm">
                    <thead className="sticky top-0 z-10 border-b border-border bg-muted/80 text-xs font-semibold text-muted-foreground backdrop-blur">
                      <tr>
                        <th className="px-4 py-3">แถว</th>
                        <th className="px-4 py-3">เลขที่</th>
                        <th className="px-4 py-3">รหัสนักเรียน</th>
                        <th className="px-4 py-3">ชื่อ - นามสกุล</th>
                        <th className="px-4 py-3">เพศ</th>
                        <th className="px-4 py-3">วันเกิด</th>
                        <th className="px-4 py-3">เลขประจำตัวประชาชน</th>
                        <th className="px-4 py-3">ผู้ปกครอง</th>
                        <th className="px-4 py-3">เบอร์ติดต่อผู้ปกครอง</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {parseResult.validRows.map((r) => (
                        <tr key={r.rowNumber} className="hover:bg-muted/30">
                          <td className="px-4 py-2.5 text-xs text-muted-foreground">{r.rowNumber}</td>
                          <td className="px-4 py-2.5 font-medium">{r.studentNumber ?? "-"}</td>
                          <td className="px-4 py-2.5 font-mono text-xs font-semibold text-primary">{r.studentCode}</td>
                          <td className="px-4 py-2.5 font-medium">{`${r.prefix || ""} ${r.firstName} ${r.lastName}`.trim()}</td>
                          <td className="px-4 py-2.5 text-xs">
                            {r.gender === "male" ? "ชาย" : r.gender === "female" ? "หญิง" : "อื่นๆ"}
                          </td>
                          <td className="px-4 py-2.5 text-xs text-muted-foreground">{r.dateOfBirth}</td>
                          <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground">{r.nationalId || "-"}</td>
                          <td className="px-4 py-2.5 text-xs">{`${r.guardianFirstName || ""} ${r.guardianLastName || ""}`.trim() || "-"}</td>
                          <td className="px-4 py-2.5 text-xs text-muted-foreground">{r.guardianPhone || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Invalid Rows Tab */}
          {activeTab === "invalid" && (
            <div
              id="invalid-import-panel"
              role="tabpanel"
              aria-labelledby="invalid-import-tab"
              className="p-0"
            >
              {parseResult.invalidRows.length === 0 ? (
                <div className="p-8">
                  <EmptyState
                    icon={CheckCircle2}
                    title="ยอดเยี่ยม! ไม่พบข้อผิดพลาด"
                    description="ข้อมูลทุกแถวในไฟล์ผ่านการตรวจสอบโครงสร้างและความถูกต้องครบถ้วน"
                  />
                </div>
              ) : (
                <div className="overflow-x-auto max-h-96">
                  <table className="w-full text-left text-sm">
                    <thead className="sticky top-0 z-10 border-b border-border bg-muted/80 text-xs font-semibold text-muted-foreground backdrop-blur">
                      <tr>
                        <th className="px-4 py-3">แถวที่</th>
                        <th className="px-4 py-3">รหัสนักเรียน</th>
                        <th className="px-4 py-3">ชื่อ - นามสกุล</th>
                        <th className="px-4 py-3">สาเหตุข้อผิดพลาด</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {parseResult.invalidRows.map((err) => (
                        <tr key={err.rowNumber} className="bg-destructive/5 hover:bg-destructive/10">
                          <td className="px-4 py-3 font-semibold text-destructive">{err.rowNumber}</td>
                          <td className="px-4 py-3 font-mono text-xs">{err.studentCode || "-"}</td>
                          <td className="px-4 py-3 text-xs">{err.studentName || "-"}</td>
                          <td className="px-4 py-3">
                            <ul className="list-disc list-inside space-y-1 text-xs text-destructive">
                              {err.errors.map((e, i) => (
                                <li key={i}>{e}</li>
                              ))}
                            </ul>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* 4. Action & Submit Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border bg-card px-5 py-4 sm:px-6">
            <div className="text-sm">
              <span className="text-muted-foreground">ห้องเรียนปลายทาง: </span>
              <span className="font-semibold">{selectedClassroom?.name || "ยังไม่ได้เลือก"}</span>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleClearFile}
                disabled={isImporting}
                className="rounded-lg border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-muted disabled:opacity-50"
              >
                ยกเลิก
              </button>

              <button
                type="button"
                onClick={handleConfirmImport}
                disabled={isImporting || parseResult.validRows.length === 0}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 disabled:opacity-50"
              >
                {isImporting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    กำลังนำเข้าข้อมูล...
                  </>
                ) : (
                  <>
                    <UserCheck className="size-4" />
                    ยืนยันนำเข้า ({parseResult.validRows.length} คน)
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Success Banner */}
      {importSuccessCount !== null && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-emerald-950 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
              <CheckCircle2 className="size-6" />
            </div>
            <div className="flex-1">
              <h4 className="text-base font-semibold">นำเข้าข้อมูลนักเรียนเสร็จสมบูรณ์</h4>
              <p className="mt-1 text-sm text-emerald-800">
                เพิ่มนักเรียนจำนวน {importSuccessCount} คน เข้าสู่ห้องเรียน {selectedClassroom?.name} เรียบร้อยแล้ว
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link
                  href="/students"
                  className="inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-800 transition"
                >
                  <Users className="size-4" />
                  ไปยังหน้ารายชื่อนักเรียน
                </Link>
                <button
                  type="button"
                  onClick={handleClearFile}
                  className="rounded-lg border border-emerald-300 bg-white px-4 py-2 text-sm font-medium text-emerald-900 hover:bg-emerald-100 transition"
                >
                  นำเข้าไฟล์อื่นเพิ่มเติม
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
