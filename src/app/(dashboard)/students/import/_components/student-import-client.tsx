"use client"

import React, { useMemo, useState, useTransition } from "react"
import Link from "next/link"
import {
  AlertCircle,
  AlertTriangle,
  Building2,
  CheckCircle2,
  CheckSquare,
  Eye,
  FileSpreadsheet,
  FileText,
  Layers,
  Loader2,
  Plus,
  ShieldCheck,
  Sparkles,
  Square,
  Trash2,
  Upload,
  UserCheck,
  Users,
  X,
} from "lucide-react"
import { toast } from "sonner"

import { EmptyState } from "@/components/feedback/empty-state"
import { clearAllStudentsInSchoolAction } from "@/app/actions/student.actions"
import {
  type ImportDuplicateMode,
  type ParseImportResult,
  type MultiGroupParseResult,
  type ParsedStudentGroup,
  type InferredRoomInfo,
  inferGradeAndSection,
} from "@/lib/student-room-inference"
import {
  executeStudentImportAction,
  executeBatchStudentImportAction,
  getStudentImportTemplateAction,
  parseStudentFileAction,
  parseAllStudentGroupsAction,
  quickCreateClassroomAction,
  batchQuickCreateClassroomsAction,
  type BatchRoomImportPayload,
  type BatchImportSummaryResult,
} from "@/app/actions/student-import.actions"
import type {
  ImportClassroomOption,
  ImportContextData,
} from "@/lib/server/student-import-service"
import { cn } from "@/lib/utils"

const IMPORT_WIZARD_STEPS = [
  { id: 1, title: "1. เลือกและอัปโหลดไฟล์", desc: "แบบฟอร์ม & ไฟล์ Excel/CSV" },
  { id: 2, title: "2. จัดการแมปห้องเรียน", desc: "จับคู่ชีตกับห้องเรียนในระบบ" },
  { id: 3, title: "3. ตรวจสอบข้อมูลซ้ำ", desc: "นโยบายซ้ำ & ดูตัวอย่างข้อมูล" },
  { id: 4, title: "4. นำเข้าสำเร็จ", desc: "สรุปผลการนำเข้านักเรียน" },
]

// ----------------------------------------------------------------------------
// Room Matching Helper
// ----------------------------------------------------------------------------
function autoMatchRoomToClassroom(
  inferred: InferredRoomInfo | null | undefined,
  groupName: string,
  classrooms: ImportClassroomOption[],
): string {
  if (inferred) {
    const exact = classrooms.find(
      (c) => c.gradeLevel === inferred.gradeLevel && c.section === inferred.section,
    )
    if (exact) return exact.id

    const sameGrade = classrooms.filter((c) => c.gradeLevel === inferred.gradeLevel)
    if (sameGrade.length === 1) return sameGrade[0].id
  }

  const cleanGroup = groupName.toLowerCase().replace(/[\s\-_/.]/g, "")
  const found = classrooms.find((c) => {
    const cleanC = c.name.toLowerCase().replace(/[\s\-_/.]/g, "")
    return cleanC.includes(cleanGroup) || cleanGroup.includes(cleanC)
  })
  return found ? found.id : ""
}

// ----------------------------------------------------------------------------
// Single-Room Sheet Finder Helper
// ----------------------------------------------------------------------------
function findMatchingSheet(classroomName: string, sheets: string[]): string | undefined {
  const cleanName = classroomName.toLowerCase().replace(/[\s\-_/.]/g, "")

  for (const sheet of sheets) {
    const cleanSheet = sheet.toLowerCase().replace(/[\s\-_/.]/g, "")
    if (cleanName.includes(cleanSheet) || cleanSheet.includes(cleanName)) {
      return sheet
    }
  }

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

interface QuickCreateModalState {
  isOpen: boolean
  sourceGroupId?: string
  academicYearId: string
  gradeLevel: string
  section: number
  name: string
}

export function StudentImportClient({ context }: { context: ImportContextData }) {
  // Mode selection: "batch" for multi-room / whole-school, "single" for single-room teacher
  const [importMode, setImportMode] = useState<"batch" | "single">("batch")

  // Classrooms local list (can be updated when a quick classroom is created)
  const [classroomsList, setClassroomsList] = useState<ImportClassroomOption[]>(context.classrooms)

  // Primary Single-Room state
  const [selectedClassroomId, setSelectedClassroomId] = useState<string>(
    context.classrooms[0]?.id || "",
  )
  const [selectedSemesterId, setSelectedSemesterId] = useState<string>(
    context.currentSemesterId || context.semesters[0]?.id || "",
  )
  const [file, setFile] = useState<File | null>(null)
  const [selectedSheet, setSelectedSheet] = useState<string>("")
  const [duplicateMode, setDuplicateMode] = useState<ImportDuplicateMode>("skip")
  const [autoGenerateMissingCode, setAutoGenerateMissingCode] = useState<boolean>(true)
  const [allowInvalidNationalIdAsNull, setAllowInvalidNationalIdAsNull] = useState<boolean>(true)
  const [parseResult, setParseResult] = useState<ParseImportResult | null>(null)
  const [activeTab, setActiveTab] = useState<"valid" | "invalid">("valid")
  const [isParsing, startParseTransition] = useTransition()
  const [isImporting, startImportTransition] = useTransition()
  const [importResultStats, setImportResultStats] = useState<ImportResultStats | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  // Multi-Group / Batch State
  const [multiGroupResult, setMultiGroupResult] = useState<MultiGroupParseResult | null>(null)
  const [roomSelections, setRoomSelections] = useState<Record<string, boolean>>({})
  const [roomTargets, setRoomTargets] = useState<Record<string, string>>({})
  const [batchImportResult, setBatchImportResult] = useState<BatchImportSummaryResult | null>(null)

  // Preview Drawer Modal State
  const [previewGroup, setPreviewGroup] = useState<ParsedStudentGroup | null>(null)
  const [previewTab, setPreviewTab] = useState<"valid" | "invalid">("valid")

  // Quick Create Classroom Modal State
  const [quickCreateModal, setQuickCreateModal] = useState<QuickCreateModalState>({
    isOpen: false,
    academicYearId: context.activeAcademicYearId || context.academicYears[0]?.id || "",
    gradeLevel: "k1",
    section: 1,
    name: "",
  })
  const [isCreatingRoom, startCreateRoomTransition] = useTransition()

  // Reset/Clear all existing students state
  const [isResetModalOpen, setIsResetModalOpen] = useState(false)
  const [resetConfirmText, setResetConfirmText] = useState("")
  const [isResetting, startResetTransition] = useTransition()

  const handleResetStudents = () => {
    if (resetConfirmText.trim() !== "ยืนยัน") return
    startResetTransition(async () => {
      const res = await clearAllStudentsInSchoolAction()
      if (res.ok) {
        toast.success(res.message)
        setIsResetModalOpen(false)
        setResetConfirmText("")
        if (file) {
          processFile(file)
        }
      } else {
        toast.error(res.message || "ไม่สามารถล้างข้อมูลนักเรียนได้")
      }
    })
  }

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

  // Master Process File: Parses both Multi-Group and Single-Room representations
  const processFile = (
    selected: File,
    targetSheet?: string,
    modeOverride?: ImportDuplicateMode,
    autoGenOverride?: boolean,
    allowInvalidNidOverride?: boolean,
  ) => {
    const ext = selected.name.split(".").pop()?.toLowerCase() ?? ""
    if (ext !== "csv" && ext !== "xlsx") {
      toast.error("กรุณาเลือกไฟล์รูปแบบ .csv หรือ .xlsx")
      return
    }

    if (selected.size > 10 * 1024 * 1024) {
      toast.error("ขนาดไฟล์เกิน 10 MB")
      return
    }

    setFile(selected)
    setImportResultStats(null)
    setBatchImportResult(null)

    const effectiveMode = modeOverride ?? duplicateMode
    const effectiveAutoGen = autoGenOverride ?? autoGenerateMissingCode
    const effectiveAllowInvalidNid = allowInvalidNidOverride ?? allowInvalidNationalIdAsNull

    startParseTransition(async () => {
      // 1. Run Multi-Group Action
      const multiFormData = new FormData()
      multiFormData.set("file", selected)
      multiFormData.set("skipInFileDuplicates", effectiveMode === "skip" ? "true" : "false")
      multiFormData.set("autoGenerateMissingCode", effectiveAutoGen ? "true" : "false")
      multiFormData.set("allowInvalidNationalIdAsNull", effectiveAllowInvalidNid ? "true" : "false")

      const multiRes = await parseAllStudentGroupsAction(null, multiFormData)

      if (multiRes.ok && multiRes.data) {
        const mg = multiRes.data
        setMultiGroupResult(mg)

        // Initialize selections and auto-match target classrooms
        const newSelections: Record<string, boolean> = {}
        const newTargets: Record<string, string> = {}

        for (const g of mg.groups) {
          newSelections[g.groupId] = g.validRows.length > 0
          const matchedId = autoMatchRoomToClassroom(g.inferred, g.groupName, classroomsList)
          newTargets[g.groupId] = matchedId
        }

        setRoomSelections(newSelections)
        setRoomTargets(newTargets)

        // Auto-switch mode: If multiple groups detected, recommend batch mode!
        if (mg.isMultiGroup) {
          setImportMode("batch")
          toast.success(
            `ตรวจพบ ${mg.groups.length} ห้องเรียนในไฟล์ (รวม ${mg.allValidCount} คน) สลับสู่โหมดนำเข้าหลายห้องพร้อมกันอัตโนมัติ`,
          )
        }
      }

      // 2. Also run single-room parse for fallback/focused single room view
      const singleFormData = new FormData()
      singleFormData.set("file", selected)
      if (targetSheet) {
        singleFormData.set("sheet", targetSheet)
      }
      singleFormData.set("skipInFileDuplicates", effectiveMode === "skip" ? "true" : "false")
      singleFormData.set("autoGenerateMissingCode", effectiveAutoGen ? "true" : "false")
      singleFormData.set("allowInvalidNationalIdAsNull", effectiveAllowInvalidNid ? "true" : "false")

      const singleRes = await parseStudentFileAction(null, singleFormData)
      if (singleRes.ok && singleRes.data) {
        const availableSheets = singleRes.data.availableSheets || []
        let currentSheet = singleRes.data.selectedSheet || targetSheet || (availableSheets[0] ?? "")

        if (!targetSheet && availableSheets.length > 1) {
          const currentClassroom = classroomsList.find((c) => c.id === selectedClassroomId)
          if (currentClassroom) {
            const matched = findMatchingSheet(currentClassroom.name, availableSheets)
            if (matched && matched !== currentSheet) {
              currentSheet = matched
            }
          }
        }

        setParseResult(singleRes.data)
        setSelectedSheet(currentSheet)
        if (singleRes.data.validRows.length > 0) {
          setActiveTab("valid")
        } else {
          setActiveTab("invalid")
        }
      } else {
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

  const handleDuplicateModeChange = (mode: ImportDuplicateMode) => {
    setDuplicateMode(mode)
    if (file) {
      processFile(file, selectedSheet, mode)
    }
  }

  const handleAutoGenToggle = (enabled: boolean) => {
    setAutoGenerateMissingCode(enabled)
    if (file) {
      processFile(file, selectedSheet, duplicateMode, enabled, allowInvalidNationalIdAsNull)
    }
  }

  const handleAllowInvalidNidToggle = (enabled: boolean) => {
    setAllowInvalidNationalIdAsNull(enabled)
    if (file) {
      processFile(file, selectedSheet, duplicateMode, autoGenerateMissingCode, enabled)
    }
  }

  const handleClearFile = () => {
    setFile(null)
    setSelectedSheet("")
    setParseResult(null)
    setMultiGroupResult(null)
    setImportResultStats(null)
    setBatchImportResult(null)
    setRoomSelections({})
    setRoomTargets({})
    setPreviewGroup(null)
  }

  // Batch Selection Toggles
  const handleToggleSelectAll = (select: boolean) => {
    if (!multiGroupResult) return
    const updated: Record<string, boolean> = {}
    for (const g of multiGroupResult.groups) {
      updated[g.groupId] = select && g.validRows.length > 0
    }
    setRoomSelections(updated)
  }

  const handleToggleGroup = (groupId: string) => {
    setRoomSelections((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }))
  }

  const handleGroupTargetChange = (groupId: string, classroomId: string) => {
    if (classroomId === "__CREATE_NEW__") {
      // Open Quick Create Modal pre-filled with group info
      const group = multiGroupResult?.groups.find((g) => g.groupId === groupId)
      openQuickCreateModal(group)
      return
    }
    setRoomTargets((prev) => ({
      ...prev,
      [groupId]: classroomId,
    }))
  }

  // Quick Create Modal Helpers
  const openQuickCreateModal = (group?: ParsedStudentGroup) => {
    const inf = group?.inferred
    const defaultGrade = inf?.gradeLevel || "p1"
    const defaultSection = inf?.section || 1
    const defaultName = inf?.thaiName || group?.groupName || "ห้องเรียนใหม่"

    setQuickCreateModal({
      isOpen: true,
      sourceGroupId: group?.groupId,
      academicYearId: context.activeAcademicYearId || context.academicYears[0]?.id || "",
      gradeLevel: defaultGrade,
      section: defaultSection,
      name: defaultName,
    })
  }

  const handleQuickCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!quickCreateModal.name.trim()) {
      toast.error("กรุณาระบุชื่อห้องเรียน")
      return
    }

    startCreateRoomTransition(async () => {
      const res = await quickCreateClassroomAction({
        academicYearId: quickCreateModal.academicYearId,
        gradeLevel: quickCreateModal.gradeLevel,
        section: quickCreateModal.section,
        name: quickCreateModal.name.trim(),
      })

      if (res.ok && res.data) {
        const created = res.data
        const newOption: ImportClassroomOption = {
          id: created.id,
          name: created.name,
          gradeLevel: created.grade_level,
          section: created.section,
          academicYear: 2567,
          isHomeroom: false,
        }

        // Add to local list if not already present
        setClassroomsList((prev) => {
          if (prev.some((c) => c.id === created.id)) return prev
          return [...prev, newOption]
        })

        // Auto-assign to the source group if opened from a specific row
        if (quickCreateModal.sourceGroupId) {
          setRoomTargets((prev) => ({
            ...prev,
            [quickCreateModal.sourceGroupId!]: created.id,
          }))
        }

        toast.success(`ห้องเรียน "${created.name}" พร้อมใช้งานแล้ว`)
        setQuickCreateModal((prev) => ({ ...prev, isOpen: false }))
      } else {
        toast.error(res.message || "ไม่สามารถสร้างห้องเรียนได้")
      }
    })
  }

  const [isBatchCreatingRooms, startBatchCreateRoomsTransition] = useTransition()

  // Calculate unmatched groups that are currently selected and have no target classroom assigned
  const unmatchedGroups = useMemo(() => {
    if (!multiGroupResult) return []
    return multiGroupResult.groups.filter(
      (g: ParsedStudentGroup) => roomSelections[g.groupId] && !roomTargets[g.groupId],
    )
  }, [multiGroupResult, roomSelections, roomTargets])

  const handleAutoCreateAllMissingRooms = () => {
    if (unmatchedGroups.length === 0) return
    const yearId = context.activeAcademicYearId || context.academicYears[0]?.id || ""
    if (!yearId) {
      toast.error("ไม่พบปีการศึกษาที่เปิดใช้งาน")
      return
    }

    const items = unmatchedGroups.map((g: ParsedStudentGroup) => {
      const inf = g.inferred || inferGradeAndSection(g.groupName)
      return {
        sourceGroupId: g.groupId,
        academicYearId: yearId,
        gradeLevel: inf?.gradeLevel || "k1",
        section: inf?.section || 1,
        name: inf?.thaiName || g.groupName,
      }
    })

    startBatchCreateRoomsTransition(async () => {
      const res = await batchQuickCreateClassroomsAction(items)
      if (res.ok && res.data) {
        const createdItems = res.data
        const newClassroomOptions: ImportClassroomOption[] = []
        const newTargets: Record<string, string> = {}

        for (const item of createdItems) {
          const c = item.classroom
          newTargets[item.sourceGroupId] = c.id
          if (!classroomsList.some((existing) => existing.id === c.id)) {
            newClassroomOptions.push({
              id: c.id,
              name: c.name,
              gradeLevel: c.grade_level,
              section: c.section,
              academicYear: 2567,
              isHomeroom: false,
            })
          }
        }

        if (newClassroomOptions.length > 0) {
          setClassroomsList((prev) => [...prev, ...newClassroomOptions])
        }

        setRoomTargets((prev) => ({
          ...prev,
          ...newTargets,
        }))

        toast.success(
          `สร้างห้องเรียนอัตโนมัติสำเร็จ ${createdItems.length} ห้อง พร้อมนำเข้าได้ทันที`,
        )
      } else {
        toast.error(res.message || "เกิดข้อผิดพลาดในการสร้างห้องเรียนอัตโนมัติ")
      }
    })
  }

  // Execute Batch Import
  const handleExecuteBatchImport = () => {
    if (!multiGroupResult || !selectedSemesterId) {
      toast.error("กรุณาเลือกภาคเรียนปลายทาง")
      return
    }

    // Build payloads for selected rooms
    const payloads: BatchRoomImportPayload[] = []
    const unmappedRooms: string[] = []

    for (const g of multiGroupResult.groups) {
      if (roomSelections[g.groupId]) {
        const targetId = roomTargets[g.groupId]
        if (!targetId) {
          unmappedRooms.push(g.groupName)
        } else if (g.validRows.length > 0) {
          payloads.push({
            groupId: g.groupId,
            roomName: g.groupName,
            classroomId: targetId,
            semesterId: selectedSemesterId,
            students: g.validRows,
          })
        }
      }
    }

    if (unmappedRooms.length > 0) {
      toast.error(`กรุณาจับคู่ห้องเรียนสำหรับ: ${unmappedRooms.join(", ")} ก่อนเริ่มนำเข้า`)
      return
    }

    if (payloads.length === 0) {
      toast.error("ไม่มีห้องเรียนหรือนักเรียนที่เลือกสำหรับการนำเข้า")
      return
    }

    startImportTransition(async () => {
      const res = await executeBatchStudentImportAction(payloads, duplicateMode)
      if (res.ok && res.data) {
        setBatchImportResult(res.data)
        toast.success(res.message)
      } else {
        toast.error(res.message || "เกิดข้อผิดพลาดในการนำเข้าแบบกลุ่ม")
      }
    })
  }

  // Execute Single Room Import
  const handleExecuteSingleImport = () => {
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

  // Computed summary counts
  const totalSelectedRooms = multiGroupResult?.groups.filter((g) => roomSelections[g.groupId]).length ?? 0
  const totalSelectedStudents =
    multiGroupResult?.groups
      .filter((g) => roomSelections[g.groupId])
      .reduce((sum, g) => sum + g.validRows.length, 0) ?? 0

  const selectedClassroom = classroomsList.find((c) => c.id === selectedClassroomId)

  const hasSecondaryInSchool = classroomsList.some((c) =>
    ["m1", "m2", "m3", "m4", "m5", "m6"].includes(c.gradeLevel) ||
    c.name.includes("ม.") ||
    c.name.includes("มัธยม"),
  )

  const importWizardStep = useMemo(() => {
    if (batchImportResult !== null || importResultStats !== null) return 4
    if (file && (multiGroupResult || parseResult)) {
      if (duplicateMode !== "skip" || previewGroup !== null) return 3
      return 2
    }
    return 1
  }, [batchImportResult, importResultStats, file, multiGroupResult, parseResult, duplicateMode, previewGroup])

  return (
    <div className="space-y-6">
      {/* 4-Step Import Wizard Indicator */}
      <nav aria-label="ขั้นตอนการนำเข้าข้อมูลนักเรียน" className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
        {IMPORT_WIZARD_STEPS.map((s) => {
          const isCompleted = importWizardStep > s.id
          const isActive = importWizardStep === s.id
          return (
            <div
              key={s.id}
              className={cn(
                "flex items-center gap-2.5 rounded-xl border p-2.5 sm:p-3 transition-colors",
                isActive
                  ? "border-primary bg-primary/10 text-primary ring-1 ring-primary/30 shadow-xs"
                  : isCompleted
                  ? "border-emerald-500/30 bg-emerald-500/5 text-foreground"
                  : "border-border bg-card text-muted-foreground opacity-75"
              )}
            >
              <div
                className={cn(
                  "flex size-6 sm:size-7 shrink-0 items-center justify-center rounded-lg text-xs font-semibold",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : isCompleted
                    ? "bg-emerald-600 text-white"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {isCompleted ? <CheckCircle2 className="size-3.5" /> : s.id}
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold text-foreground">{s.title}</p>
                <p className="hidden sm:block truncate text-xs text-muted-foreground">{s.desc}</p>
              </div>
            </div>
          )
        })}
      </nav>

      {/* 1. Header & Download Templates */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-xs sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold text-xs">
                1
              </span>
              <h3 className="text-base font-semibold">ดาวน์โหลดแบบฟอร์ม & เลือกลักษณะการนำเข้า</h3>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              ระบบรองรับทั้งไฟล์รายห้องเดี่ยว และไฟล์รวมทั้งโรงเรียนที่มีหลายแผ่นงาน (Sheet) หรือมีคอลัมน์ระบุห้อง
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
            <button
              type="button"
              onClick={() => setIsResetModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/10 text-destructive px-3.5 py-2 text-xs font-semibold hover:bg-destructive/20 shadow-xs transition-colors cursor-pointer"
              title="ล้างข้อมูลนักเรียนเดิมในโรงเรียนเพื่อนำเข้าใหม่"
            >
              <Trash2 className="size-4" />
              ล้างข้อมูลเดิมเพื่อเริ่มใหม่
            </button>
          </div>
        </div>

        {/* Global Target Semester */}
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="globalSemester" className="block text-sm font-medium">
              ภาคเรียนเป้าหมายหลัก <span className="text-destructive">*</span>
            </label>
            <select
              id="globalSemester"
              value={selectedSemesterId}
              onChange={(e) => setSelectedSemesterId(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-input bg-background px-3.5 py-2.5 text-sm shadow-xs focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {context.semesters.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label} {s.isCurrent ? "(ภาคเรียนปัจจุบัน)" : ""}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium">โหมดการแสดงผลและการนำเข้า</label>
            <div className="mt-1.5 flex items-center rounded-lg border border-border bg-muted/30 p-1" role="group" aria-label="โหมดการนำเข้า">
              <button
                type="button"
                aria-pressed={importMode === "batch"}
                onClick={() => setImportMode("batch")}
                className={`flex-1 flex items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                  importMode === "batch"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Building2 className="size-3.5" />
                นำเข้าหลายห้องพร้อมกัน (Batch Multi-Room)
              </button>
              <button
                type="button"
                aria-pressed={importMode === "single"}
                onClick={() => setImportMode("single")}
                className={`flex-1 flex items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                  importMode === "single"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Users className="size-3.5" />
                นำเข้าเฉพาะห้อง (Single Room Focus)
              </button>
            </div>
          </div>
          {importMode === "single" ? (
            <div className="mt-4">
              <label htmlFor="singleRoomClassroom" className="block text-sm font-medium">
                ห้องเรียนเป้าหมาย (โหมดห้องเดี่ยว)
              </label>
              <select
                id="singleRoomClassroom"
                value={selectedClassroomId}
                onChange={(e) => setSelectedClassroomId(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-input bg-background px-3.5 py-2.5 text-sm shadow-xs focus:outline-none focus:ring-2 focus:ring-ring sm:max-w-xs"
              >
                {classroomsList.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          ) : null}
        </div>
      </div>

      {/* 2. File Upload Dropzone & Auto-Gen Option */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-xs sm:p-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold text-xs">
              2
            </span>
            <h3 className="text-base font-semibold">อัปโหลดไฟล์รายชื่อนักเรียน</h3>
          </div>

          {/* Option Checkboxes */}
          <div className="flex flex-wrap items-center gap-2">
            <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-medium text-foreground bg-muted/40 hover:bg-muted/70 px-3 py-1.5 rounded-xl border border-border transition">
              <input
                type="checkbox"
                checked={autoGenerateMissingCode}
                onChange={(e) => handleAutoGenToggle(e.target.checked)}
                className="size-4 rounded text-primary focus:ring-primary"
              />
              <span>สร้างรหัสชั่วคราวอัตโนมัติ (กรณีเด็กอนุบาล/เข้าใหม่ยังไม่มีเลขประจำตัว)</span>
            </label>

            <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-medium text-foreground bg-muted/40 hover:bg-muted/70 px-3 py-1.5 rounded-xl border border-border transition">
              <input
                type="checkbox"
                checked={allowInvalidNationalIdAsNull}
                onChange={(e) => handleAllowInvalidNidToggle(e.target.checked)}
                className="size-4 rounded text-primary focus:ring-primary"
              />
              <span>ผ่อนปรนเลขประชาชนที่ไม่ครบ 13 หลัก (บันทึกเป็นค่าว่างชั่วคราว)</span>
            </label>
          </div>
        </div>

        <p className="mt-1 text-sm text-muted-foreground">
          รองรับทั้งไฟล์ .xlsx ที่มีหลายชีต (เช่น อนุบาล 1 ถึง ป.6) และไฟล์ .csv ที่มีคอลัมน์ระบุห้อง
        </p>

        {isParsing ? (
          <div className="mt-4 flex items-center justify-center gap-3 rounded-2xl border border-border bg-muted/30 p-8 text-center">
            <Loader2 className="size-6 animate-spin text-primary" />
            <p className="text-sm font-medium text-muted-foreground">
              กำลังอ่านและตรวจสอบโครงสร้างไฟล์นักเรียนทุกห้อง...
            </p>
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
              รองรับไฟล์ .csv (UTF-8) หรือ .xlsx ขนาดไม่เกิน 10 MB
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
                    {(file.size / 1024).toFixed(1)} KB &bull;{" "}
                    {multiGroupResult?.isMultiGroup
                      ? `ตรวจพบ ${multiGroupResult.groups.length} ห้องเรียน/ชีต (${multiGroupResult.allValidCount} คนพร้อมนำเข้า)`
                      : `พบ ${parseResult?.totalRows || 0} รายการ`}
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
          </div>
        )}
      </div>

      {/* 3. Duplicate Handling Configuration */}
      {file && (
        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs sm:p-6 space-y-4">
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold text-xs">
              3
            </span>
            <h3 className="text-base font-semibold flex items-center gap-2">
              <ShieldCheck className="size-5 text-primary" />
              การจัดการข้อมูลซ้ำในระบบ (Duplicate Handling Strategy)
            </h3>
          </div>

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
                  หากพบนักเรียนเดิมในระบบ จะดึงนักเรียนเข้าสู่ห้องเรียนปลายทางในภาคเรียนที่เลือกด้วย
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

      {/* 4. WORKSPACE: Mode A - Batch Multi-Room Workspace */}
      {importMode === "batch" && multiGroupResult && (
        <div className="rounded-2xl border border-border bg-card shadow-xs overflow-hidden">
          {/* Workspace Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border bg-muted/20 px-5 py-4 sm:px-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold text-xs">
                  4
                </span>
                <h3 className="text-base font-semibold">
                  พื้นที่จับคู่ห้องเรียน & เตรียมนำเข้าแบบกลุ่ม (Interactive Room Matrix)
                </h3>
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">
                เลือกห้องที่ต้องการนำเข้า จับคู่กับห้องเรียนในระบบ หรือกดสร้างห้องเรียนใหม่ได้ทันที
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleToggleSelectAll(true)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-input bg-background px-3 py-1.5 text-xs font-medium hover:bg-muted"
              >
                <CheckSquare className="size-3.5 text-primary" />
                เลือกทั้งหมด
              </button>
              <button
                type="button"
                onClick={() => handleToggleSelectAll(false)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-input bg-background px-3 py-1.5 text-xs font-medium hover:bg-muted"
              >
                <Square className="size-3.5 text-muted-foreground" />
                ยกเลิกทั้งหมด
              </button>
              <button
                type="button"
                onClick={() => openQuickCreateModal()}
                className="inline-flex items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/10 text-primary px-3 py-1.5 text-xs font-semibold hover:bg-primary/20"
              >
                <Plus className="size-3.5" />
                สร้างห้องเรียนใหม่
              </button>

              {unmatchedGroups.length > 0 && (
                <button
                  type="button"
                  onClick={handleAutoCreateAllMissingRooms}
                  disabled={isBatchCreatingRooms}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 text-xs font-semibold shadow-xs transition disabled:opacity-50"
                  title="สร้างห้องเรียนทั้งหมดที่ยังไม่ได้จับคู่ตามชื่อที่พบในไฟล์"
                >
                  {isBatchCreatingRooms ? (
                    <>
                      <Loader2 className="size-3.5 animate-spin" />
                      กำลังสร้างห้องเรียน...
                    </>
                  ) : (
                    <>
                      <Sparkles className="size-3.5" />
                      สร้างห้องเรียนอัตโนมัติตามไฟล์ ({unmatchedGroups.length} ห้อง)
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Interactive Room Mapping Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-muted/50 text-xs font-semibold text-muted-foreground">
                <tr>
                  <th className="px-4 py-3.5 w-12 text-center">เลือก</th>
                  <th className="px-4 py-3.5">ห้องเรียนจากไฟล์</th>
                  <th className="px-4 py-3.5 text-center">จำนวนนักเรียน</th>
                  <th className="px-4 py-3.5">ห้องเรียนปลายทางในระบบ</th>
                  <th className="px-4 py-3.5">สถานะความพร้อม</th>
                  <th className="px-4 py-3.5 text-right">ตรวจสอบรายชื่อ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {multiGroupResult.groups.map((group) => {
                  const isChecked = Boolean(roomSelections[group.groupId])
                  const targetId = roomTargets[group.groupId] || ""
                  const validCount = group.validRows.length
                  const invalidCount = group.invalidRows.length
                  const existingInDbCount = group.validRows.filter((r) => r.isExistingInDb).length

                  return (
                    <tr
                      key={group.groupId}
                      className={`transition ${isChecked ? "bg-card" : "bg-muted/10 opacity-70"}`}
                    >
                      {/* Checkbox */}
                      <td className="px-4 py-3 text-center">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleGroup(group.groupId)}
                          disabled={validCount === 0}
                          className="size-4 rounded text-primary focus:ring-primary cursor-pointer disabled:opacity-30"
                        />
                      </td>

                      {/* Source Room */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Layers className="size-4 text-primary shrink-0" />
                          <div>
                            <span className="font-semibold text-foreground">{group.groupName}</span>
                            {group.inferred && (
                              <span className="ml-2 inline-flex items-center rounded-md bg-muted px-1.5 py-0.5 text-xs font-mono font-medium text-muted-foreground">
                                {group.inferred.thaiName}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Student Count */}
                      <td className="px-4 py-3 text-center font-mono font-medium tabular-nums">
                        {group.totalRows} คน
                      </td>

                      {/* Target Classroom Dropdown */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <select
                            value={targetId}
                            onChange={(e) => handleGroupTargetChange(group.groupId, e.target.value)}
                            disabled={!isChecked}
                            className={`w-full max-w-xs rounded-lg border px-3 py-1.5 text-xs font-medium shadow-xs focus:outline-none focus:ring-2 focus:ring-ring ${
                              !targetId && isChecked
                                ? "border-amber-500 bg-amber-500/10 text-amber-900 dark:text-amber-200"
                                : "border-input bg-background"
                            }`}
                          >
                            <option value="">-- กรุณาเลือกห้องเรียนปลายทาง --</option>
                            {classroomsList.map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.name} {c.isHomeroom ? "(ครูประจำชั้น)" : ""}
                              </option>
                            ))}
                            <option value="__CREATE_NEW__" className="text-primary font-semibold">
                              ✨ + สร้างห้องเรียน &quot;{group.inferred?.thaiName || group.groupName}&quot; ใหม่...
                            </option>
                          </select>

                          {!targetId && isChecked && (
                            <button
                              type="button"
                              onClick={() => openQuickCreateModal(group)}
                              className="shrink-0 inline-flex items-center gap-1 rounded-lg border border-amber-500/40 bg-amber-500/10 px-2 py-1 text-xs font-semibold text-amber-800 dark:text-amber-300 hover:bg-amber-500/20"
                              title="สร้างห้องเรียนนี้ทันที"
                            >
                              <Plus className="size-3" />
                              สร้างด่วน
                            </button>
                          )}
                        </div>
                      </td>

                      {/* Status Badges */}
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap items-center gap-1.5 text-xs">
                          {validCount > 0 && (
                            <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-300">
                              <CheckCircle2 className="size-3" />
                              พร้อมนำเข้า {validCount}
                            </span>
                          )}
                          {existingInDbCount > 0 && (
                            <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-400">
                              <AlertCircle className="size-3" />
                              มีเดิมในระบบ {existingInDbCount}
                            </span>
                          )}
                          {invalidCount > 0 && (
                            <span className="inline-flex items-center gap-1 rounded-md bg-destructive/10 border border-destructive/20 px-2 py-0.5 text-xs font-medium text-destructive">
                              <AlertTriangle className="size-3" />
                              ข้อผิดพลาด {invalidCount}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Action: Open Preview Drawer */}
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            setPreviewGroup(group)
                            setPreviewTab(group.validRows.length > 0 ? "valid" : "invalid")
                          }}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-input bg-background px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition"
                        >
                          <Eye className="size-3.5 text-primary" />
                          ดูรายชื่อ
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Batch Submit Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border bg-card px-5 py-4 sm:px-6">
            <div className="text-sm">
              <span className="text-muted-foreground">สรุปการเลือก: </span>
              <strong className="text-foreground">{totalSelectedRooms}</strong> ห้องเรียน &bull;{" "}
              <strong className="text-foreground">{totalSelectedStudents}</strong> คนพร้อมนำเข้า
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleClearFile}
                disabled={isImporting}
                className="rounded-xl border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-muted disabled:opacity-50"
              >
                ยกเลิก
              </button>

              <button
                type="button"
                onClick={handleExecuteBatchImport}
                disabled={isImporting || totalSelectedRooms === 0 || totalSelectedStudents === 0}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-xs hover:bg-primary/90 disabled:opacity-50 transition"
              >
                {isImporting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    กำลังประมวลผลการนำเข้าแบบกลุ่ม...
                  </>
                ) : (
                  <>
                    <Building2 className="size-4" />
                    🚀 เริ่มนำเข้าข้อมูลทั้งหมดที่เลือก ({totalSelectedRooms} ห้อง / {totalSelectedStudents} คน)
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. WORKSPACE: Mode B - Single Room Focused Workspace */}
      {importMode === "single" && parseResult && (
        <div className="rounded-2xl border border-border bg-card shadow-xs overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border bg-muted/20 px-5 py-4 sm:px-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold text-xs">
                  4
                </span>
                <h3 className="text-base font-semibold">นำเข้าเฉพาะห้อง (Single Room Focus)</h3>
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">
                พร้อมนำเข้า <span className="font-mono font-medium">{parseResult.summary.validCount}</span> คน &bull; พบข้อผิดพลาด <span className="font-mono font-medium">{parseResult.summary.invalidCount}</span> รายการ
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab("valid")}
                className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                  activeTab === "valid"
                    ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30"
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                <CheckCircle2 className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                ข้อมูลถูกต้อง ({parseResult.summary.validCount})
              </button>
              <button
                type="button"
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

          {/* Valid Rows Table */}
          {activeTab === "valid" && (
            <div className="p-0">
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
                        <th className="px-4 py-3">สถานะ</th>
                        <th className="px-4 py-3">เพศ</th>
                        <th className="px-4 py-3">วันเกิด</th>
                        <th className="px-4 py-3">เลขประจำตัวประชาชน</th>
                        <th className="px-4 py-3">ผู้ปกครอง</th>
                        <th className="px-4 py-3">เบอร์ติดต่อ</th>
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
                              <span className="inline-flex items-center gap-1 rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-400">
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
                          <td className="px-4 py-2.5 text-xs text-muted-foreground">{r.dateOfBirth || "-"}</td>
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

          {/* Invalid Rows Table */}
          {activeTab === "invalid" && (
            <div className="p-0">
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

          {/* Single Submit Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border bg-card px-5 py-4 sm:px-6">
            <div className="text-sm">
              <span className="text-muted-foreground">ห้องเรียนเป้าหมาย: </span>
              <span className="font-semibold text-foreground">{selectedClassroom?.name || "ยังไม่ได้เลือก"}</span>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleClearFile}
                disabled={isImporting}
                className="rounded-xl border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-muted disabled:opacity-50"
              >
                ยกเลิก
              </button>

              <button
                type="button"
                onClick={handleExecuteSingleImport}
                disabled={isImporting || parseResult.validRows.length === 0}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground shadow-xs hover:bg-primary/90 disabled:opacity-50"
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

      {/* 5. Batch Success Report */}
      {batchImportResult !== null && (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-6 text-foreground shadow-xs">
          <div className="flex items-start gap-4">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="size-7" />
            </div>
            <div className="flex-1">
              <h4 className="text-base font-semibold text-emerald-700 dark:text-emerald-300">
                นำเข้าข้อมูลนักเรียนแบบกลุ่มสำเร็จ ({batchImportResult.successRooms}/{batchImportResult.totalRooms} ห้อง)
              </h4>
              <p className="mt-1 text-sm text-muted-foreground">
                นำเข้านักเรียนใหม่ทั้งหมด{" "}
                <strong className="text-foreground">{batchImportResult.totalImported}</strong> คน
                {batchImportResult.totalEnrolledExisting > 0 &&
                  ` &bull; ดึงเข้าห้องเรียนเดิม ${batchImportResult.totalEnrolledExisting} คน`}
                {batchImportResult.totalSkipped > 0 &&
                  ` &bull; ข้ามรายการซ้ำ ${batchImportResult.totalSkipped} คน`}
              </p>

              {/* Room by Room Report Checklist */}
              <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {batchImportResult.roomResults.map((r) => (
                  <div
                    key={r.groupId}
                    className={`flex items-center justify-between rounded-xl border p-3 text-xs ${
                      r.success
                        ? "border-emerald-500/30 bg-emerald-500/5 text-foreground"
                        : "border-destructive/30 bg-destructive/5 text-destructive"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {r.success ? (
                        <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
                      ) : (
                        <AlertCircle className="size-4 text-destructive shrink-0" />
                      )}
                      <span className="font-semibold">{r.roomName}</span>
                    </div>
                    <span className="font-mono tabular-nums">
                      {r.success ? `+${r.count} คน` : r.error || "เกิดข้อผิดพลาด"}
                    </span>
                  </div>
                ))}
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
                  นำเข้าไฟล์อื่นเพิ่มเติม
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. Single Import Success Report */}
      {importResultStats !== null && (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-6 text-foreground shadow-xs">
          <div className="flex items-start gap-4">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="size-6" />
            </div>
            <div className="flex-1">
              <h4 className="text-base font-semibold text-emerald-700 dark:text-emerald-300">
                นำเข้าข้อมูลนักเรียนเสร็จสมบูรณ์
              </h4>
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

      {/* 7. QUICK CREATE CLASSROOM MODAL DIALOG */}
      {quickCreateModal.isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="quick-create-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4"
        >
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl animate-in fade-in-0 zoom-in-95">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-2">
                <Building2 className="size-5 text-primary" />
                <h3 id="quick-create-title" className="text-base font-semibold">
                  สร้างห้องเรียนใหม่อย่างรวดเร็ว
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setQuickCreateModal((prev) => ({ ...prev, isOpen: false }))}
                className="rounded-lg p-1 text-muted-foreground hover:bg-muted"
                aria-label="ปิดหน้าต่าง"
              >
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleQuickCreateSubmit} className="mt-4 space-y-4">
              {/* Academic Year */}
              <div>
                <label htmlFor="qcYear" className="block text-xs font-semibold text-muted-foreground">
                  ปีการศึกษา
                </label>
                <select
                  id="qcYear"
                  value={quickCreateModal.academicYearId}
                  onChange={(e) =>
                    setQuickCreateModal((prev) => ({ ...prev, academicYearId: e.target.value }))
                  }
                  className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {context.academicYears.map((y) => (
                    <option key={y.id} value={y.id}>
                      ปีการศึกษา {y.year} {y.isCurrent ? "(ปัจจุบัน)" : ""}
                    </option>
                  ))}
                </select>
              </div>

              {/* Grade Level */}
              <div>
                <label htmlFor="qcGrade" className="block text-xs font-semibold text-muted-foreground">
                  ระดับชั้น
                </label>
                <select
                  id="qcGrade"
                  value={quickCreateModal.gradeLevel}
                  onChange={(e) => {
                    const gl = e.target.value
                    setQuickCreateModal((prev) => {
                      const thaiLabels: Record<string, string> = {
                        k1: "อนุบาล 1",
                        k2: "อนุบาล 2",
                        k3: "อนุบาล 3",
                        p1: "ประถมศึกษาปีที่ 1",
                        p2: "ประถมศึกษาปีที่ 2",
                        p3: "ประถมศึกษาปีที่ 3",
                        p4: "ประถมศึกษาปีที่ 4",
                        p5: "ประถมศึกษาปีที่ 5",
                        p6: "ประถมศึกษาปีที่ 6",
                        m1: "มัธยมศึกษาปีที่ 1",
                        m2: "มัธยมศึกษาปีที่ 2",
                        m3: "มัธยมศึกษาปีที่ 3",
                        m4: "มัธยมศึกษาปีที่ 4",
                        m5: "มัธยมศึกษาปีที่ 5",
                        m6: "มัธยมศึกษาปีที่ 6",
                      }
                      const name = `${thaiLabels[gl] || gl}/${prev.section}`
                      return { ...prev, gradeLevel: gl, name }
                    })
                  }}
                  className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <optgroup label="ระดับอนุบาล">
                    <option value="k1">อนุบาล 1 (อ.1)</option>
                    <option value="k2">อนุบาล 2 (อ.2)</option>
                    <option value="k3">อนุบาล 3 (อ.3)</option>
                  </optgroup>
                  <optgroup label="ระดับประถมศึกษา">
                    <option value="p1">ประถมศึกษาปีที่ 1 (ป.1)</option>
                    <option value="p2">ประถมศึกษาปีที่ 2 (ป.2)</option>
                    <option value="p3">ประถมศึกษาปีที่ 3 (ป.3)</option>
                    <option value="p4">ประถมศึกษาปีที่ 4 (ป.4)</option>
                    <option value="p5">ประถมศึกษาปีที่ 5 (ป.5)</option>
                    <option value="p6">ประถมศึกษาปีที่ 6 (ป.6)</option>
                  </optgroup>
                  {hasSecondaryInSchool && (
                    <optgroup label="ระดับมัธยมศึกษา">
                      <option value="m1">มัธยมศึกษาปีที่ 1 (ม.1)</option>
                      <option value="m2">มัธยมศึกษาปีที่ 2 (ม.2)</option>
                      <option value="m3">มัธยมศึกษาปีที่ 3 (ม.3)</option>
                      <option value="m4">มัธยมศึกษาปีที่ 4 (ม.4)</option>
                      <option value="m5">มัธยมศึกษาปีที่ 5 (ม.5)</option>
                      <option value="m6">มัธยมศึกษาปีที่ 6 (ม.6)</option>
                    </optgroup>
                  )}
                </select>
              </div>

              {/* Section */}
              <div>
                <label htmlFor="qcSection" className="block text-xs font-semibold text-muted-foreground">
                  ห้องที่ / ทับ (Section)
                </label>
                <input
                  id="qcSection"
                  type="number"
                  min="1"
                  max="30"
                  value={quickCreateModal.section}
                  onChange={(e) => {
                    const s = parseInt(e.target.value, 10) || 1
                    setQuickCreateModal((prev) => {
                      const baseName = prev.name.split("/")[0] || prev.name
                      return { ...prev, section: s, name: `${baseName}/${s}` }
                    })
                  }}
                  className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              {/* Name */}
              <div>
                <label htmlFor="qcName" className="block text-xs font-semibold text-muted-foreground">
                  ชื่อห้องเรียนที่จะแสดงผล <span className="text-destructive">*</span>
                </label>
                <input
                  id="qcName"
                  type="text"
                  value={quickCreateModal.name}
                  onChange={(e) =>
                    setQuickCreateModal((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="เช่น อนุบาล 1/1 หรือ ประถมศึกษาปีที่ 3/2"
                  className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setQuickCreateModal((prev) => ({ ...prev, isOpen: false }))}
                  className="rounded-xl border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-muted"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={isCreatingRoom}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-xs hover:bg-primary/90 disabled:opacity-50"
                >
                  {isCreatingRoom ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      กำลังสร้าง...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="size-4" />
                      บันทึกและใช้ห้องนี้
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 8. STUDENT PREVIEW DRAWER / MODAL */}
      {previewGroup && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="preview-drawer-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 sm:p-6"
        >
          <div className="flex flex-col h-full max-h-[85vh] w-full max-w-4xl rounded-2xl border border-border bg-card shadow-2xl animate-in fade-in-0 zoom-in-95 overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-border bg-muted/20 px-6 py-4">
              <div>
                <div className="flex items-center gap-2">
                  <Eye className="size-5 text-primary" />
                  <h3 id="preview-drawer-title" className="text-base font-semibold">
                    ตรวจสอบรายชื่อนักเรียน: {previewGroup.groupName}
                  </h3>
                  {previewGroup.inferred && (
                    <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-mono font-medium text-primary">
                      {previewGroup.inferred.thaiName}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  พบทั้งหมด {previewGroup.totalRows} คน &bull; พร้อมนำเข้า {previewGroup.validRows.length} คน
                </p>
              </div>

              <div className="flex items-center gap-2">
                {/* Tabs */}
                <div className="flex items-center rounded-lg border border-border bg-muted/30 p-1">
                  <button
                    type="button"
                    onClick={() => setPreviewTab("valid")}
                    className={`rounded-md px-2.5 py-1 text-xs font-semibold transition ${
                      previewTab === "valid"
                        ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    ถูกต้อง ({previewGroup.validRows.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewTab("invalid")}
                    className={`rounded-md px-2.5 py-1 text-xs font-semibold transition ${
                      previewTab === "invalid"
                        ? "bg-destructive/10 text-destructive border border-destructive/20"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    ข้อผิดพลาด ({previewGroup.invalidRows.length})
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setPreviewGroup(null)}
                  className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted"
                  aria-label="ปิดหน้ารายชื่อ"
                >
                  <X className="size-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-0">
              {previewTab === "valid" ? (
                previewGroup.validRows.length === 0 ? (
                  <div className="p-8">
                    <EmptyState
                      icon={AlertTriangle}
                      title="ไม่มีข้อมูลที่ผ่านการตรวจสอบ"
                      description="โปรดตรวจสอบแท็บข้อผิดพลาดเพื่อดูสาเหตุที่ข้อมูลไม่ผ่าน"
                    />
                  </div>
                ) : (
                  <table className="w-full text-left text-sm">
                    <thead className="sticky top-0 z-10 border-b border-border bg-muted/80 text-xs font-semibold text-muted-foreground backdrop-blur">
                      <tr>
                        <th className="px-4 py-2.5">แถว</th>
                        <th className="px-4 py-2.5">เลขที่</th>
                        <th className="px-4 py-2.5">รหัสนักเรียน</th>
                        <th className="px-4 py-2.5">ชื่อ - นามสกุล</th>
                        <th className="px-4 py-2.5">เพศ</th>
                        <th className="px-4 py-2.5">สถานะ</th>
                        <th className="px-4 py-2.5">วันเกิด</th>
                        <th className="px-4 py-2.5">เลขประชาชน</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {previewGroup.validRows.map((r) => (
                        <tr key={r.rowNumber} className="hover:bg-muted/30">
                          <td className="px-4 py-2 text-xs text-muted-foreground">{r.rowNumber}</td>
                          <td className="px-4 py-2 font-medium">{r.studentNumber ?? "-"}</td>
                          <td className="px-4 py-2 font-mono text-xs font-semibold text-primary">{r.studentCode}</td>
                          <td className="px-4 py-2 font-medium">{`${r.prefix || ""} ${r.firstName} ${r.lastName}`.trim()}</td>
                          <td className="px-4 py-2 text-xs">
                            {r.gender === "male" ? "ชาย" : r.gender === "female" ? "หญิง" : "อื่นๆ"}
                          </td>
                          <td className="px-4 py-2 text-xs">
                            {r.isExistingInDb ? (
                              <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-400">
                                <AlertCircle className="size-3" />
                                มีในระบบ
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                                <Sparkles className="size-3" />
                                ข้อมูลใหม่
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-2 text-xs text-muted-foreground">{r.dateOfBirth || "-"}</td>
                          <td className="px-4 py-2 font-mono text-xs text-muted-foreground">{r.nationalId || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )
              ) : previewGroup.invalidRows.length === 0 ? (
                <div className="p-8">
                  <EmptyState
                    icon={CheckCircle2}
                    title="ไม่มีข้อผิดพลาดในห้องนี้"
                    description="ข้อมูลนักเรียนทุกคนในห้องนี้ผ่านการตรวจสอบเรียบร้อยแล้ว"
                  />
                </div>
              ) : (
                <table className="w-full text-left text-sm">
                  <thead className="sticky top-0 z-10 border-b border-border bg-muted/80 text-xs font-semibold text-muted-foreground backdrop-blur">
                    <tr>
                      <th className="px-4 py-2.5">แถวที่</th>
                      <th className="px-4 py-2.5">ชื่อนักเรียน</th>
                      <th className="px-4 py-2.5">สาเหตุข้อผิดพลาด</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {previewGroup.invalidRows.map((err) => (
                      <tr key={err.rowNumber} className="bg-destructive/5 hover:bg-destructive/10">
                        <td className="px-4 py-2 font-semibold text-destructive">{err.rowNumber}</td>
                        <td className="px-4 py-2 text-xs">{err.studentName || "-"}</td>
                        <td className="px-4 py-2 text-xs text-destructive">
                          <ul className="list-disc list-inside space-y-0.5">
                            {err.errors.map((e, i) => (
                              <li key={i}>{e}</li>
                            ))}
                          </ul>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Modal Footer */}
            <div className="border-t border-border bg-card px-6 py-3 text-right">
              <button
                type="button"
                onClick={() => setPreviewGroup(null)}
                className="rounded-xl bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground shadow-xs hover:bg-primary/90"
              >
                เสร็จสิ้น
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 9. CLEAR / RESET ALL STUDENTS MODAL */}
      {isResetModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4"
        >
          <div className="w-full max-w-md rounded-2xl border border-destructive/30 bg-card p-6 shadow-2xl animate-in fade-in-0 zoom-in-95">
            <div className="flex items-start gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
                <AlertTriangle className="size-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-semibold text-destructive">
                  ล้างข้อมูลนักเรียนเดิมทั้งหมดในโรงเรียน
                </h3>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                  เหมาะสำหรับใช้เมื่อต้องการเคลียร์ข้อมูลเก่า หรือทดสอบนำเข้าไฟล์ใหม่ตั้งแต่ต้น ระบบจะลบข้อมูลนักเรียนเดิมทั้งหมดอย่างถาวร
                </p>
              </div>
            </div>

            <div className="mt-4 rounded-lg bg-destructive/10 p-3 text-xs text-destructive border border-destructive/20">
              คำเตือน: ข้อมูลนักเรียนทั้งหมด การเข้าเรียน และประวัติในระบบจะถูกลบถาวร ไม่สามารถย้อนกลับได้
            </div>

            <div className="mt-4">
              <label htmlFor="importResetInput" className="block text-xs font-medium text-foreground">
                พิมพ์คำว่า <span className="font-bold text-destructive">ยืนยัน</span> เพื่อดำเนินการ:
              </label>
              <input
                id="importResetInput"
                type="text"
                value={resetConfirmText}
                onChange={(e) => setResetConfirmText(e.target.value)}
                placeholder="พิมพ์ 'ยืนยัน'"
                className="mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-destructive"
              />
            </div>

            <div className="mt-6 flex items-center justify-end gap-2.5">
              <button
                type="button"
                disabled={isResetting}
                onClick={() => {
                  setIsResetModalOpen(false)
                  setResetConfirmText("")
                }}
                className="rounded-xl border border-input bg-background px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                disabled={isResetting || resetConfirmText.trim() !== "ยืนยัน"}
                onClick={handleResetStudents}
                className="inline-flex items-center gap-1.5 rounded-xl bg-destructive px-4 py-2 text-xs font-semibold text-destructive-foreground shadow-xs hover:bg-destructive/90 disabled:opacity-40 cursor-pointer"
              >
                {isResetting ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    กำลังล้างข้อมูล...
                  </>
                ) : (
                  <>
                    <Trash2 className="size-3.5" />
                    ยืนยันล้างข้อมูลนักเรียนเดิม
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

