"use client"

import React, { useState, useTransition } from "react"
import Link from "next/link"
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  FileSpreadsheet,
  FileText,
  Layers,
  Loader2,
  ShieldCheck,
  Sparkles,
  Upload,
  UserCheck,
  Users,
  X,
} from "lucide-react"
import { toast } from "sonner"

import { EmptyState } from "@/components/feedback/empty-state"
import type {
  ImportDuplicateMode,
  ParseImportResult,
} from "@/lib/student-import-parser"
import {
  executeStudentImportAction,
  getStudentImportTemplateAction,
  parseStudentFileAction,
} from "@/app/actions/student-import.actions"
import type { ImportContextData } from "@/lib/server/student-import-service"

// Helper to auto-match classroom name to sheet name in multi-sheet Excel
function findMatchingSheet(classroomName: string, sheets: string[]): string | undefined {
  const cleanName = classroomName.toLowerCase().replace(/[\s\-_/.]/g, "")

  // 1. Direct contains or exact match
  for (const sheet of sheets) {
    const cleanSheet = sheet.toLowerCase().replace(/[\s\-_/.]/g, "")
    if (cleanName.includes(cleanSheet) || cleanSheet.includes(cleanName)) {
      return sheet
    }
  }

  // 2. Grade mapping dictionary (covers Kindergarten, Primary, Secondary)
  const grades = [
    { classKeywords: ["ประถม1", "ป1", "grade1", "p1"], sheetKeywords: ["ป1", "ประถม1", "ป.1"] },
    { classKeywords: ["ประถม2", "ป2", "grade2", "p2"], sheetKeywords: ["ป2", "ประถม2", "ป.2"] },
    { classKeywords: ["ประถม3", "ป3", "grade3", "p3"], sheetKeywords: ["ป3", "ประถม3", "ป.3"] },
    { classKeywords: ["ประถม4", "ป4", "grade4", "p4"], sheetKeywords: ["ป4", "ประถม4", "ป.4"] },
    { classKeywords: ["ประถม5", "ป5", "grade5", "p5"], sheetKeywords: ["ป5", "ประถม5", "ป.5"] },
    { classKeywords: ["ประถม6", "ป6", "grade6", "p6"], sheetKeywords: ["ป6", "ประถม6", "ป.6"] },
    { classKeywords: ["อนุบาล1", "อ1", "k1", "kindergarten1"], sheetKeywords: ["อนุบาล1", "อ1", "อ.1"] },
    { classKeywords: ["อนุบาล2", "อ2", "k2", "kindergarten2"], sheetKeywords: ["อนุบาล2", "อ2", "อ.2"] },
    { classKeywords: ["อนุบาล3", "อ3", "k3", "kindergarten3"], sheetKeywords: ["อนุบาล3", "อ3", "อ.3"] },
    { classKeywords: ["มัธยม1", "ม1", "m1"], sheetKeywords: ["มัธยม1", "ม1", "ม.1"] },
    { classKeywords: ["มัธยม2", "ม2", "m2"], sheetKeywords: ["มัธยม2", "ม2", "ม.2"] },
    { classKeywords: ["มัธยม3", "ม3", "m3"], sheetKeywords: ["มัธยม3", "ม3", "ม.3"] },
  ]

  for (const g of grades) {
    const isClassMatch = g.classKeywords.some((k) => cleanName.includes(k))
    if (isClassMatch) {
      const matchingSheet = sheets.find((s) => {
        const cs = s.toLowerCase().replace(/[\s\-_/.]/g, "")
        return g.sheetKeywords.some((sk) => cs.includes(sk))
      })
      if (matchingSheet) return matchingSheet
    }
  }

  return undefined
}

interface ImportResultStats {
  count: number
  skippedCount: number
  enrolledExistingCount: number
}

export function StudentImportClient({ context }: { context: ImportContextData }) {
  const [selectedClassroomId, setSelectedClassroomId] = useState<string>(
    context.classrooms[0]?.id || "",
  )
  const [selectedSemesterId, setSelectedSemesterId] = useState<string>(
    context.currentSemesterId || context.semesters[0]?.id || "",
  )
  const [file, setFile] = useState<File | null>(null)
  const [selectedSheet, setSelectedSheet] = useState<string>("")
  const [duplicateMode, setDuplicateMode] = useState<ImportDuplicateMode>("skip")
  const [parseResult, setParseResult] = useState<ParseImportResult | null>(null)
  const [activeTab, setActiveTab] = useState<"valid" | "invalid">("valid")
  const [isParsing, startParseTransition] = useTransition()
  const [isImporting, startImportTransition] = useTransition()
  const [importResultStats, setImportResultStats] = useState<ImportResultStats | null>(null)
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

  // Process file (CSV or XLSX) through Server Action
  const processFile = (
    selected: File,
    targetSheet?: string,
    modeOverride?: ImportDuplicateMode,
  ) => {
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
    setImportResultStats(null)

    const effectiveMode = modeOverride ?? duplicateMode

    startParseTransition(async () => {
      const formData = new FormData()
      formData.set("file", selected)
      if (targetSheet) {
        formData.set("sheet", targetSheet)
      }
      formData.set("skipInFileDuplicates", effectiveMode === "skip" ? "true" : "false")

      const res = await parseStudentFileAction(null, formData)
      if (res.ok && res.data) {
        const availableSheets = res.data.availableSheets || []
        let currentSheet = res.data.selectedSheet || targetSheet || (availableSheets[0] ?? "")

        // Auto-match sheet if user uploaded a multi-sheet file without specifying sheet
        if (!targetSheet && availableSheets.length > 1) {
          const currentClassroom = context.classrooms.find((c) => c.id === selectedClassroomId)
          if (currentClassroom) {
            const matched = findMatchingSheet(currentClassroom.name, availableSheets)
            if (matched && matched !== currentSheet) {
              currentSheet = matched
              // Re-parse with matched sheet automatically
              const reFormData = new FormData()
              reFormData.set("file", selected)
              reFormData.set("sheet", matched)
              reFormData.set("skipInFileDuplicates", effectiveMode === "skip" ? "true" : "false")
              const reRes = await parseStudentFileAction(null, reFormData)
              if (reRes.ok && reRes.data) {
                setParseResult(reRes.data)
                setSelectedSheet(matched)
                if (reRes.data.validRows.length > 0) {
                  toast.success(
                    `เลือกแผ่นงาน "${matched}" ให้สอดคล้องกับ ${currentClassroom.name} อัตโนมัติ (พร้อมนำเข้า ${reRes.data.validRows.length} คน)`,
                  )
                  setActiveTab("valid")
                } else {
                  toast.warning(`สลับเป็นแผ่นงาน "${matched}" แล้ว แต่ไม่พบข้อมูลที่ถูกต้อง`)
                  setActiveTab("invalid")
                }
                return
              }
            }
          }
        }

        setParseResult(res.data)
        setSelectedSheet(currentSheet)

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

  // Handle classroom change with auto-sheet matching
  const handleClassroomChange = (newClassroomId: string) => {
    setSelectedClassroomId(newClassroomId)
    if (file && parseResult?.availableSheets && parseResult.availableSheets.length > 1) {
      const newClass = context.classrooms.find((c) => c.id === newClassroomId)
      if (newClass) {
        const matched = findMatchingSheet(newClass.name, parseResult.availableSheets)
        if (matched && matched !== selectedSheet) {
          setSelectedSheet(matched)
          processFile(file, matched)
          toast.info(`สลับไปที่แผ่นงาน "${matched}" ให้สอดคล้องกับห้องเรียน ${newClass.name}`)
        }
      }
    }
  }

  // Handle explicit sheet change by user
  const handleSheetChange = (sheetName: string) => {
    if (!file || sheetName === selectedSheet) return
    setSelectedSheet(sheetName)
    processFile(file, sheetName)
  }

  // Handle duplicate mode change
  const handleDuplicateModeChange = (mode: ImportDuplicateMode) => {
    setDuplicateMode(mode)
    if (file) {
      processFile(file, selectedSheet, mode)
    }
  }

  // Clear file
  const handleClearFile = () => {
    setFile(null)
    setSelectedSheet("")
    setParseResult(null)
    setImportResultStats(null)
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
        parseResult.validRows,
        duplicateMode,
      )

      if (res.ok && res.data) {
        setImportResultStats({
          count: res.data.count,
          skippedCount: res.data.skippedCount,
          enrolledExistingCount: res.data.enrolledExistingCount,
        })
        toast.success(res.message)
      } else {
        toast.error(res.message)
      }
    })
  }

  const selectedClassroom = context.classrooms.find((c) => c.id === selectedClassroomId)
  const existingCount = parseResult?.summary?.existingCount ?? 0

  return (
    <div className="space-y-6">
      {/* 1. Header Options & Template Download */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-xs sm:p-6">
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
              className="inline-flex items-center gap-2 rounded-xl border border-input bg-background px-3.5 py-2 text-xs font-medium hover:bg-muted shadow-xs transition-colors"
            >
              <FileText className="size-4 text-primary" />
              แบบฟอร์ม CSV
            </button>
            <button
              type="button"
              onClick={handleDownloadXlsxTemplate}
              className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 px-3.5 py-2 text-xs font-medium hover:bg-emerald-500/20 shadow-xs transition-colors"
            >
              <FileSpreadsheet className="size-4 text-emerald-600 dark:text-emerald-400" />
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
              onChange={(e) => handleClassroomChange(e.target.value)}
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
      <div className="rounded-2xl border border-border bg-card p-5 shadow-xs sm:p-6">
        <h3 className="text-base font-semibold">ขั้นตอนที่ 2: อัปโหลดไฟล์รายชื่อนักเรียน (CSV หรือ Excel)</h3>
        <p className="mt-0.5 text-sm text-muted-foreground">
          รองรับไฟล์นามสกุล .csv และ .xlsx (ไฟล์จริงของโรงเรียนที่มีคำนำหน้ารวมชื่อ หรือหลายแผ่นงานนำเข้าได้ทันที)
        </p>

        {isParsing ? (
          <div className="mt-4 flex items-center justify-center gap-3 rounded-2xl border border-border bg-muted/30 p-8 text-center">
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
            className={`mt-4 flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center transition ${
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
            <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-3">
              <Upload className="size-7" />
            </div>
            <p className="text-sm font-semibold">คลิกเพื่อเลือกไฟล์ หรือลากไฟล์มาวางที่นี่</p>
            <p className="mt-1 text-xs text-muted-foreground">
              รองรับไฟล์ .csv (UTF-8) หรือ .xlsx ขนาดไม่เกิน 5 MB
            </p>
          </label>
        ) : (
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between rounded-2xl border border-border bg-muted/40 p-4">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
                  <FileSpreadsheet className="size-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold">{file.name}</p>
                  <p className="text-xs text-muted-foreground font-mono tabular-nums">
                    {(file.size / 1024).toFixed(1)} KB &bull; แผ่นงานปัจจุบัน: {selectedSheet || "แผ่นแรก"} &bull; พบ {parseResult?.totalRows || 0} รายการ
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleClearFile}
                className="inline-flex size-8 items-center justify-center rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground"
                title="ลบไฟล์"
                aria-label="ลบไฟล์ที่เลือก"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Sheet Selector Bar (if multi-sheet Excel) */}
            {parseResult?.availableSheets && parseResult.availableSheets.length > 1 && (
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-primary/20 bg-primary/5 p-3.5 text-sm">
                <div className="flex items-center gap-2">
                  <Layers className="size-4 text-primary" />
                  <span className="font-semibold text-foreground">แผ่นงาน (Sheet) ในไฟล์ Excel:</span>
                  <span className="text-xs text-muted-foreground">
                    (พบ {parseResult.availableSheets.length} แผ่นงาน)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={selectedSheet}
                    onChange={(e) => handleSheetChange(e.target.value)}
                    disabled={isParsing}
                    className="rounded-lg border border-input bg-background px-3 py-1.5 text-xs font-semibold shadow-xs focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    {parseResult.availableSheets.map((sh) => (
                      <option key={sh} value={sh}>
                        แผ่นงาน: {sh}
                      </option>
                    ))}
                  </select>
                  <span className="text-xs text-muted-foreground hidden sm:inline">
                    ระบบจับคู่ให้สอดคล้องกับห้องเรียนปลายทางโดยอัตโนมัติ
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 3. Duplicate Handling Configuration */}
      {parseResult && (
        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold flex items-center gap-2">
                <ShieldCheck className="size-5 text-primary" />
                การตั้งค่าการจัดการข้อมูลซ้ำ (Duplicate Handling)
              </h3>
              <p className="text-sm text-muted-foreground mt-0.5">
                กำหนดแนวทางปฏิบัติเมื่อพบรหัสนักเรียนหรือเลขประจำตัวประชาชนที่ซ้ำกับข้อมูลในระบบ
              </p>
            </div>
            {existingCount > 0 && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-700 dark:text-amber-400">
                <AlertTriangle className="size-3.5" />
                พบข้อมูลเดิมในระบบ {existingCount} รายการ
              </span>
            )}
          </div>

          {/* Alert if duplicates exist */}
          {existingCount > 0 && (
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 text-sm text-amber-800 dark:text-amber-300 flex items-start gap-2.5">
              <AlertCircle className="size-5 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
              <div>
                <p className="font-semibold">
                  ตรวจพบข้อมูลนักเรียนที่มีอยู่ในโรงเรียนนี้แล้ว {existingCount} คน
                </p>
                <p className="text-xs mt-0.5 text-amber-700 dark:text-amber-400">
                  {duplicateMode === "skip" &&
                    `ระบบจะนำเข้าเฉพาะนักเรียนใหม่ (${parseResult.summary.validCount - existingCount} คน) และข้ามข้อมูลที่ซ้ำ ${existingCount} คนโดยไม่เกิดข้อผิดพลาด`}
                  {duplicateMode === "enroll_existing" &&
                    `ระบบจะเพิ่มนักเรียนใหม่ และดึงนักเรียนที่มีอยู่เดิม ${existingCount} คนเข้าสู่ห้องเรียน ${selectedClassroom?.name || ""} ในภาคเรียนนี้ด้วย`}
                  {duplicateMode === "error" &&
                    "ระบบจะระงับการนำเข้าข้อมูล เนื่องจากโหมดเข้มงวดไม่อนุญาตให้นำเข้าข้อมูลที่มีรายการซ้ำ"}
                </p>
              </div>
            </div>
          )}

          {/* Option Cards */}
          <div className="grid gap-3 sm:grid-cols-3">
            <label
              className={`flex flex-col justify-between rounded-xl border p-4 cursor-pointer transition ${
                duplicateMode === "skip"
                  ? "border-primary bg-primary/5 ring-1 ring-primary"
                  : "border-border hover:bg-muted/40"
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm">ข้ามรายการซ้ำ</span>
                  <input
                    type="radio"
                    name="duplicateMode"
                    value="skip"
                    checked={duplicateMode === "skip"}
                    onChange={() => handleDuplicateModeChange("skip")}
                    className="size-4 text-primary focus:ring-primary"
                  />
                </div>
                <span className="mt-1 inline-block text-xs font-medium text-emerald-600 dark:text-emerald-400">
                  ★ ค่าเริ่มต้นที่แนะนำ
                </span>
                <p className="mt-2 text-xs text-muted-foreground">
                  นำเข้าเฉพาะนักเรียนใหม่ หากพบรหัสหรือเลขบัตรประชาชนซ้ำในระบบหรือในไฟล์จะข้ามโดยอัตโนมัติ
                </p>
              </div>
            </label>

            <label
              className={`flex flex-col justify-between rounded-xl border p-4 cursor-pointer transition ${
                duplicateMode === "enroll_existing"
                  ? "border-primary bg-primary/5 ring-1 ring-primary"
                  : "border-border hover:bg-muted/40"
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm">ดึงเข้าห้องเรียนนี้</span>
                  <input
                    type="radio"
                    name="duplicateMode"
                    value="enroll_existing"
                    checked={duplicateMode === "enroll_existing"}
                    onChange={() => handleDuplicateModeChange("enroll_existing")}
                    className="size-4 text-primary focus:ring-primary"
                  />
                </div>
                <span className="mt-1 inline-block text-xs font-medium text-blue-600 dark:text-blue-400">
                  สำหรับเลื่อนชั้น/ย้ายห้อง
                </span>
                <p className="mt-2 text-xs text-muted-foreground">
                  หากพบนักเรียนเดิมในระบบ จะดึงนักเรียนเข้าสู่ห้องเรียนนี้ในภาคเรียนที่เลือกด้วย
                </p>
              </div>
            </label>

            <label
              className={`flex flex-col justify-between rounded-xl border p-4 cursor-pointer transition ${
                duplicateMode === "error"
                  ? "border-primary bg-primary/5 ring-1 ring-primary"
                  : "border-border hover:bg-muted/40"
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm">ระงับหากมีข้อมูลซ้ำ</span>
                  <input
                    type="radio"
                    name="duplicateMode"
                    value="error"
                    checked={duplicateMode === "error"}
                    onChange={() => handleDuplicateModeChange("error")}
                    className="size-4 text-primary focus:ring-primary"
                  />
                </div>
                <span className="mt-1 inline-block text-xs font-medium text-muted-foreground">
                  โหมดตรวจสอบเข้มงวด
                </span>
                <p className="mt-2 text-xs text-muted-foreground">
                  ไม่อนุญาตให้นำเข้าหากพบข้อมูลซ้ำกับในระบบหรือในไฟล์ เพื่อให้กลับไปตรวจสอบและแก้ไขไฟล์ก่อน
                </p>
              </div>
            </label>
          </div>
        </div>
      )}

      {/* 4. Validation Summary & Preview Table */}
      {parseResult && (
        <div className="rounded-2xl border border-border bg-card shadow-xs overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border bg-muted/20 px-5 py-4 sm:px-6">
            <div>
              <h3 className="text-base font-semibold">ขั้นตอนที่ 3: ตรวจสอบความถูกต้องและยืนยันการนำเข้า</h3>
              <p className="text-sm text-muted-foreground">
                พร้อมนำเข้า <span className="font-mono tabular-nums font-medium">{parseResult.summary.validCount}</span> คน &bull; พบข้อผิดพลาด <span className="font-mono tabular-nums font-medium">{parseResult.summary.invalidCount}</span> รายการ
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
                className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                  activeTab === "valid"
                    ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30"
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                <CheckCircle2 className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                ข้อมูลถูกต้อง (<span className="font-mono tabular-nums">{parseResult.summary.validCount}</span>)
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
                        <th className="px-4 py-3">สถานะในระบบ</th>
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
                            {r.isExistingInDb ? (
                              <span
                                className="inline-flex items-center gap-1 rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-400"
                                title={`มีในระบบแล้ว: ${r.existingStudentName || ""}`}
                              >
                                <AlertCircle className="size-3" />
                                มีในระบบแล้ว
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                                <Sparkles className="size-3" />
                                ข้อมูลใหม่
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-2.5 text-xs">
                            {r.gender === "male" ? "ชาย" : r.gender === "female" ? "หญิง" : "อื่นๆ"}
                          </td>
                          <td className="px-4 py-2.5 text-xs text-muted-foreground">
                            {r.dateOfBirth || "-"}
                          </td>
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

          {/* 5. Action & Submit Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border bg-card px-5 py-4 sm:px-6">
            <div className="text-sm">
              <span className="text-muted-foreground">ห้องเรียนปลายทาง: </span>
              <span className="font-semibold text-foreground">{selectedClassroom?.name || "ยังไม่ได้เลือก"}</span>
              {selectedSheet && (
                <span className="ml-2 text-xs text-muted-foreground">
                  (แผ่นงาน: <strong className="text-foreground">{selectedSheet}</strong>)
                </span>
              )}
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleClearFile}
                disabled={isImporting}
                className="rounded-xl border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-muted disabled:opacity-50 transition-colors"
              >
                ยกเลิก
              </button>

              <button
                type="button"
                onClick={handleConfirmImport}
                disabled={isImporting || parseResult.validRows.length === 0}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground shadow-xs hover:bg-primary/90 disabled:opacity-50 transition-colors"
              >
                {isImporting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    กำลังนำเข้าข้อมูล...
                  </>
                ) : (
                  <>
                    <UserCheck className="size-4" />
                    ยืนยันนำเข้า (<span className="font-mono tabular-nums">{parseResult.validRows.length}</span> คน)
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Success Banner */}
      {importResultStats !== null && (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-6 text-foreground shadow-xs">
          <div className="flex items-start gap-4">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="size-6" />
            </div>
            <div className="flex-1">
              <h4 className="text-base font-semibold text-emerald-700 dark:text-emerald-300">นำเข้าข้อมูลนักเรียนเสร็จสมบูรณ์</h4>
              <p className="mt-1 text-sm text-muted-foreground">
                บันทึกข้อมูลเข้าสู่ห้องเรียน <span className="font-medium text-foreground">{selectedClassroom?.name}</span> เรียบร้อยแล้ว
              </p>

              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/20 px-3 py-1 font-semibold text-emerald-800 dark:text-emerald-300">
                  <CheckCircle2 className="size-3.5" />
                  เพิ่มนักเรียนใหม่: {importResultStats.count} คน
                </span>
                {importResultStats.enrolledExistingCount > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-lg bg-blue-500/20 px-3 py-1 font-semibold text-blue-800 dark:text-blue-300">
                    <Users className="size-3.5" />
                    ดึงเข้าห้องเรียนนี้: {importResultStats.enrolledExistingCount} คน
                  </span>
                )}
                {importResultStats.skippedCount > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-lg bg-amber-500/20 px-3 py-1 font-semibold text-amber-800 dark:text-amber-300">
                    <AlertTriangle className="size-3.5" />
                    ข้ามรายการซ้ำ: {importResultStats.skippedCount} คน
                  </span>
                )}
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  href="/students"
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-xs hover:bg-primary/90 transition"
                >
                  <Users className="size-4" />
                  ไปยังหน้ารายชื่อนักเรียน
                </Link>
                <button
                  type="button"
                  onClick={handleClearFile}
                  className="rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium hover:bg-muted transition"
                >
                  นำเข้าห้องเรียนหรือไฟล์อื่นเพิ่มเติม
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
