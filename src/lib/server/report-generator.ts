import "server-only"

import writeXlsxFile from "write-excel-file/node"
import { PDFDocument, rgb, type PDFPage } from "pdf-lib"
import fontkit from "@pdf-lib/fontkit"

import { createClient } from "@/utils/supabase/server"
import { getThaiFontBuffer } from "@/lib/fonts/thai-font"

export type GeneratedArtifact = {
  contentType: string
  fileExtension: string
  buffer: Buffer
  fileName: string
}

// ----------------------------------------------------------------------------
// Multi-Page Thai PDF Generator with fontkit, official header, signatures & pagination
// ----------------------------------------------------------------------------
export async function buildThaiPdfDocument(
  title: string,
  subtitle: string,
  schoolName: string,
  headers: string[],
  rows: string[][],
): Promise<Buffer> {
  const doc = await PDFDocument.create()
  doc.registerFontkit(fontkit)

  const fontBuffer = getThaiFontBuffer()
  const customFont = await doc.embedFont(new Uint8Array(fontBuffer))

  const pageWidth = 595.28 // A4 width
  const pageHeight = 841.89 // A4 height
  const margin = 36
  const contentWidth = pageWidth - margin * 2

  const colCount = Math.max(headers.length, 1)

  // Dynamic column weighting based on content type
  const baseColWidth = contentWidth / colCount
  const colWidths: number[] = headers.map((h) => {
    if (h.includes("ชื่อ") || h.includes("ผู้ปกครอง") || h.includes("หมายเหตุ") || h.includes("รายวิชา") || h.includes("รายละเอียด") || h.includes("เป้าหมาย")) {
      return baseColWidth * 1.4
    }
    if (h.includes("รหัส") || h.includes("เกรด") || h.includes("สถานะ") || h.includes("วันที่") || h.includes("คะแนน") || h.includes("ความคืบหน้า")) {
      return baseColWidth * 0.75
    }
    return baseColWidth
  })

  // Normalize column widths to fit exact contentWidth
  const totalAllocated = colWidths.reduce((a, b) => a + b, 0)
  const normalizedColWidths = colWidths.map((w) => (w / totalAllocated) * contentWidth)

  const colXOffsets: number[] = []
  let accX = margin
  for (let i = 0; i < colCount; i++) {
    colXOffsets.push(accX)
    accX += normalizedColWidths[i]
  }

  const titleSize = 13
  const subtitleSize = 8.5
  const headerFontSize = 8
  const rowFontSize = 7.5
  const baseRowHeight = 17
  const rowLineHeight = 9.5
  const maxCellLines = 5

  const wrapCellText = (value: unknown, maxWidth: number): string[] => {
    const text = String(value ?? "-").replace(/\s+/g, " ").trim() || "-"
    const lines: string[] = []
    let line = ""

    for (const char of text) {
      const candidate = line + char
      if (line && customFont.widthOfTextAtSize(candidate, rowFontSize) > maxWidth) {
        lines.push(line.trimEnd())
        line = char.trimStart()
      } else {
        line = candidate
      }

      if (lines.length === maxCellLines) break
    }

    if (lines.length < maxCellLines && line) lines.push(line.trimEnd())
    if (lines.length === maxCellLines && lines.join("").length < text.length) {
      let lastLine = lines[maxCellLines - 1]
      while (
        lastLine &&
        customFont.widthOfTextAtSize(`${lastLine}…`, rowFontSize) > maxWidth
      ) {
        lastLine = lastLine.slice(0, -1)
      }
      lines[maxCellLines - 1] = `${lastLine}…`
    }

    return lines.length ? lines : ["-"]
  }

  const drawPageHeader = (page: PDFPage) => {
    // Official system header
    page.drawText("ระบบดูแลช่วยเหลือนักเรียนและวิเคราะห์พัฒนาการรายบุคคล (SCIDAS)", {
      x: margin,
      y: pageHeight - 26,
      size: 7.5,
      font: customFont,
      color: rgb(0.45, 0.5, 0.55),
    })

    // School Name
    page.drawText(schoolName, {
      x: margin,
      y: pageHeight - 39,
      size: 10.5,
      font: customFont,
      color: rgb(0.12, 0.18, 0.28),
    })

    // Report Title
    page.drawText(title, {
      x: margin,
      y: pageHeight - 54,
      size: titleSize,
      font: customFont,
      color: rgb(0.08, 0.12, 0.2),
    })

    // Subtitle & Filters
    page.drawText(subtitle, {
      x: margin,
      y: pageHeight - 67,
      size: subtitleSize,
      font: customFont,
      color: rgb(0.35, 0.4, 0.48),
    })

    // Top rule
    page.drawLine({
      start: { x: margin, y: pageHeight - 72 },
      end: { x: pageWidth - margin, y: pageHeight - 72 },
      thickness: 1,
      color: rgb(0.2, 0.4, 0.75),
    })
  }

  const drawTableHeader = (page: PDFPage, y: number) => {
    page.drawRectangle({
      x: margin,
      y: y - 4,
      width: contentWidth,
      height: baseRowHeight + 2,
      color: rgb(0.92, 0.95, 0.99),
      borderColor: rgb(0.8, 0.85, 0.92),
      borderWidth: 0.5,
    })

    headers.forEach((headerText, i) => {
      const x = colXOffsets[i] + 3
      page.drawText(headerText, {
        x,
        y: y + 2,
        size: headerFontSize,
        font: customFont,
        color: rgb(0.1, 0.2, 0.35),
      })
    })

    return y - baseRowHeight - 2
  }

  let currentPage = doc.addPage([pageWidth, pageHeight])
  drawPageHeader(currentPage)
  let currentY = drawTableHeader(currentPage, pageHeight - 88)

  // Draw data rows
  for (let r = 0; r < rows.length; r++) {
    const rowData = rows[r]
    const wrappedCells = rowData.map((cellText, columnIndex) =>
      wrapCellText(cellText, normalizedColWidths[columnIndex] - 6),
    )
    const rowHeight = Math.max(
      baseRowHeight,
      Math.max(...wrappedCells.map((cellLines) => cellLines.length)) * rowLineHeight + 6,
    )

    if (currentY - rowHeight < margin + 14) {
      currentPage = doc.addPage([pageWidth, pageHeight])
      drawPageHeader(currentPage)
      currentY = drawTableHeader(currentPage, pageHeight - 88)
    }

    const rowTop = currentY + 6
    const rowBottom = rowTop - rowHeight

    if (r % 2 === 1) {
      currentPage.drawRectangle({
        x: margin,
        y: rowBottom,
        width: contentWidth,
        height: rowHeight,
        color: rgb(0.98, 0.985, 0.995),
      })
    }

    currentPage.drawLine({
      start: { x: margin, y: rowBottom },
      end: { x: pageWidth - margin, y: rowBottom },
      thickness: 0.3,
      color: rgb(0.88, 0.88, 0.9),
    })

    wrappedCells.forEach((cellLines, c) => {
      const x = colXOffsets[c] + 3
      cellLines.forEach((line, lineIndex) => {
        currentPage.drawText(line, {
          x,
          y: rowTop - 11 - lineIndex * rowLineHeight,
          size: rowFontSize,
          font: customFont,
          color: rgb(0.15, 0.15, 0.2),
        })
      })
    })

    currentY = rowBottom - 6
  }

  // Draw official signatures block
  const signatureHeight = 65
  if (currentY - signatureHeight < margin + 20) {
    currentPage = doc.addPage([pageWidth, pageHeight])
    drawPageHeader(currentPage)
    currentY = pageHeight - 110
  }

  const sigY = currentY - 24
  // Left: Teacher / Reporter Signature
  currentPage.drawText("ลงชื่อ ........................................................... ผู้จัดทำรายงาน", {
    x: margin + 15,
    y: sigY,
    size: 8,
    font: customFont,
    color: rgb(0.2, 0.25, 0.35),
  })
  currentPage.drawText("( ........................................................... )", {
    x: margin + 35,
    y: sigY - 14,
    size: 7.5,
    font: customFont,
    color: rgb(0.4, 0.45, 0.5),
  })
  currentPage.drawText("ตำแหน่ง ครูประจำชั้น / ผู้รับผิดชอบ", {
    x: margin + 35,
    y: sigY - 27,
    size: 7.5,
    font: customFont,
    color: rgb(0.4, 0.45, 0.5),
  })

  // Right: School Director Signature
  currentPage.drawText("ลงชื่อ ........................................................... ผู้รับรอง", {
    x: pageWidth - margin - 220,
    y: sigY,
    size: 8,
    font: customFont,
    color: rgb(0.2, 0.25, 0.35),
  })
  currentPage.drawText("( ........................................................... )", {
    x: pageWidth - margin - 200,
    y: sigY - 14,
    size: 7.5,
    font: customFont,
    color: rgb(0.4, 0.45, 0.5),
  })
  currentPage.drawText(`ตำแหน่ง ผู้อำนวยการ${schoolName}`, {
    x: pageWidth - margin - 215,
    y: sigY - 27,
    size: 7.5,
    font: customFont,
    color: rgb(0.4, 0.45, 0.5),
  })

  // Page numbering in footer
  const totalPages = doc.getPageCount()
  for (let p = 0; p < totalPages; p++) {
    const page = doc.getPage(p)
    const footerText = `ระบบดูแลช่วยเหลือนักเรียน SCIDAS  |  หน้า ${p + 1} จาก ${totalPages}`
    page.drawText(footerText, {
      x: margin,
      y: 18,
      size: 7,
      font: customFont,
      color: rgb(0.55, 0.55, 0.6),
    })
  }

  const pdfBytes = await doc.save()
  return Buffer.from(pdfBytes)
}

// ----------------------------------------------------------------------------
// Genuine XLSX Spreadsheet Generator using write-excel-file
// ----------------------------------------------------------------------------
export async function buildXlsxSpreadsheet(
  title: string,
  headers: string[],
  rows: string[][],
): Promise<Buffer> {
  const headerRow = headers.map((h) => ({
    value: h,
    fontWeight: "bold" as const,
    backgroundColor: "#E2E8F0",
  }))

  const dataRows = rows.map((r) =>
    r.map((cell) => ({
      value: String(cell ?? ""),
    })),
  )

  const titleRow = [
    {
      value: title,
      fontWeight: "bold" as const,
      fontSize: 14,
    },
  ]

  const dateRow = [
    {
      value: `วันที่สร้างเอกสาร: ${new Date().toLocaleDateString("th-TH")}`,
      color: "#64748B",
    },
  ]

  const emptyRow: { value: string }[] = []
  const allRows = [titleRow, dateRow, emptyRow, headerRow, ...dataRows]

  const columns = headers.map((h, colIndex) => {
    let maxLen = h.length
    for (const r of rows) {
      const cellVal = String(r[colIndex] ?? "")
      if (cellVal.length > maxLen) maxLen = cellVal.length
    }
    return { width: Math.min(Math.max(maxLen + 4, 14), 45) }
  })

  const res = await writeXlsxFile(allRows, { columns })
  return await res.toBuffer()
}

// ----------------------------------------------------------------------------
// Report Data Fetcher & Master Dispatcher across all 9 Report Types
// ----------------------------------------------------------------------------
export async function generateReportArtifact(job: {
  id: string
  schoolId: string
  reportType: string
  title: string
  filters?: Record<string, unknown>
}): Promise<GeneratedArtifact> {
  const supabase = await createClient()

  // Load school info
  const { data: school } = await supabase
    .from("schools")
    .select("name, school_code")
    .eq("id", job.schoolId)
    .single()

  const schoolName = school?.name || "โรงเรียนขนาดเล็ก"

  let headers: string[] = []
  let rows: string[][] = []
  let subtitle = `วันที่สร้าง: ${new Date().toLocaleDateString("th-TH")}`

  const format = (job.filters?.format as string) === "xlsx" ? "xlsx" : "pdf"
  const classroomFilter = job.filters?.classroomId as string | undefined
  const studentFilter = job.filters?.studentId as string | undefined
  const semesterFilter = job.filters?.semesterId as string | undefined
  const dateFrom = job.filters?.dateFrom as string | undefined
  const dateTo = job.filters?.dateTo as string | undefined

  switch (job.reportType) {
    // ------------------------------------------------------------------------
    // 1. Student Profile / Student Summary
    // ------------------------------------------------------------------------
    case "student_profile":
    case "student_summary": {
      headers = [
        "รหัสนักเรียน",
        "ชื่อ - นามสกุล",
        "ระดับชั้น/ห้อง",
        "สถานะความเสี่ยง",
        "สถิติมาเรียน 30 วัน",
        "เคสช่วยเหลือ",
        "ผู้ปกครอง",
        "เบอร์โทรผู้ปกครอง",
      ]
      const pageSize = 1000
      let from = 0
      const students: {
        student_id: string | null
        student_code: string | null
        full_name: string | null
        grade_level: string | null
        classroom_name: string | null
        risk_level: string | null
        attendance_rate_30d: number | null
        open_support_count: number | null
        primary_guardian_name: string | null
        primary_guardian_phone: string | null
      }[] = []

      while (true) {
        let query = supabase
          .from("v_student_worklist")
          .select(
            "student_id, student_code, full_name, grade_level, classroom_name, risk_level, attendance_rate_30d, open_support_count, primary_guardian_name, primary_guardian_phone",
          )
          .eq("school_id", job.schoolId)

        if (classroomFilter) query = query.eq("classroom_id", classroomFilter)
        if (studentFilter) query = query.eq("student_id", studentFilter)

        const { data: pageData, error } = await query
          .order("student_code", { ascending: true, nullsFirst: false })
          .order("student_id", { ascending: true })
          .range(from, from + pageSize - 1)

        if (error) throw new Error(`Failed to load student summary: ${error.message}`)
        if (!pageData?.length) break
        students.push(...pageData)
        if (pageData.length < pageSize) break
        from += pageSize
      }

      rows = students.map((s) => [
        s.student_code || "-",
        s.full_name || "-",
        s.classroom_name || s.grade_level || "-",
        s.risk_level === "high" ? "เสี่ยงสูง" : s.risk_level === "watch" ? "ต้องติดตาม" : "ปกติ",
        s.attendance_rate_30d !== null ? `${s.attendance_rate_30d}%` : "-",
        s.open_support_count ? `${s.open_support_count} เคส` : "ไม่มี",
        s.primary_guardian_name || "-",
        s.primary_guardian_phone || "-",
      ])
      subtitle += ` | นักเรียนทั้งหมด: ${rows.length} คน`
      break
    }

    // ------------------------------------------------------------------------
    // 2. Behavior Summary
    // ------------------------------------------------------------------------
    case "behavior_summary": {
      headers = [
        "วันที่",
        "รหัสนักเรียน",
        "ชื่อ - นามสกุล",
        "ประเภทพฤติกรรม",
        "คะแนน",
        "ระดับความรุนแรง",
        "รายละเอียดเหตุการณ์",
      ]
      const pageSize = 1000
      let from = 0
      let hasMore = true
      const behaviors: {
        id: string
        date: string
        behavior_type: string
        points: number | null
        severity: string | null
        description: string
        students: unknown
      }[] = []

      while (hasMore) {
        let query = supabase
          .from("behavior_records")
          .select(`
            id, date, behavior_type, points, severity, description,
            students(student_code, first_name, last_name)
          `)
          .eq("school_id", job.schoolId)

        if (dateFrom) query = query.gte("date", dateFrom)
        if (dateTo) query = query.lte("date", dateTo)
        if (studentFilter) query = query.eq("student_id", studentFilter)

        const { data: pageData, error } = await query
          .order("date", { ascending: false })
          .order("id", { ascending: true })
          .range(from, from + pageSize - 1)

        if (error) throw new Error(`Failed to load behavior summary: ${error.message}`)
        if (!pageData || pageData.length === 0) {
          hasMore = false
        } else {
          behaviors.push(...pageData)
          if (pageData.length < pageSize) hasMore = false
          else from += pageSize
        }
      }

      const severityMap: Record<string, string> = {
        low: "เล็กน้อย",
        medium: "ปานกลาง",
        high: "รุนแรง",
        critical: "วิกฤต",
      }

      rows = behaviors.map((b) => {
        const st = b.students as unknown as { student_code: string; first_name: string; last_name: string } | null
        const pointSign = (b.points ?? 0) > 0 ? `+${b.points}` : String(b.points ?? 0)
        return [
          b.date || "-",
          st?.student_code || "-",
          `${st?.first_name || ""} ${st?.last_name || ""}`.trim() || "-",
          b.behavior_type === "positive" ? "พฤติกรรมเชิงบวก" : "พฤติกรรมเสี่ยง",
          pointSign,
          severityMap[b.severity || "low"] || b.severity || "-",
          b.description || "-",
        ]
      })
      subtitle += ` | บันทึกพฤติกรรม: ${rows.length} รายการ`
      break
    }

    // ------------------------------------------------------------------------
    // 3. Attendance Summary / Attendance Report
    // ------------------------------------------------------------------------
    case "attendance_report":
    case "attendance_summary": {
      headers = ["วันที่", "รหัสนักเรียน", "ชื่อ - นามสกุล", "ห้องเรียน", "สถานะ", "หมายเหตุ"]
      const pageSize = 1000
      let from = 0
      let hasMore = true
      const allAttendance: {
        id: string
        date: string | null
        status: string
        remark: string | null
        students: unknown
        classrooms: unknown
      }[] = []

      while (hasMore) {
        let query = supabase
          .from("attendance_records")
          .select(`
            id, date, status, remark,
            students(student_code, first_name, last_name),
            classrooms(name)
          `)
          .eq("school_id", job.schoolId)

        if (dateFrom) query = query.gte("date", dateFrom)
        if (dateTo) query = query.lte("date", dateTo)
        if (classroomFilter) query = query.eq("classroom_id", classroomFilter)
        if (studentFilter) query = query.eq("student_id", studentFilter)

        const { data: pageData, error } = await query
          .order("date", { ascending: false })
          .order("id", { ascending: true })
          .range(from, from + pageSize - 1)

        if (error) throw new Error(`Failed to load attendance report: ${error.message}`)
        if (!pageData || pageData.length === 0) {
          hasMore = false
        } else {
          allAttendance.push(...pageData)
          if (pageData.length < pageSize) hasMore = false
          else from += pageSize
        }
      }

      const statusMap: Record<string, string> = {
        present: "มาเรียน",
        absent: "ขาดเรียน",
        late: "มาสาย",
        leave: "ลากิจ",
        sick: "ลาป่วย",
      }

      rows = allAttendance.map((a) => {
        const st = a.students as unknown as { student_code: string; first_name: string; last_name: string } | null
        const cl = a.classrooms as unknown as { name: string } | null
        return [
          a.date || "-",
          st?.student_code || "-",
          `${st?.first_name || ""} ${st?.last_name || ""}`.trim() || "-",
          cl?.name || "-",
          statusMap[a.status] || a.status,
          a.remark || "-",
        ]
      })
      subtitle += ` | รายการบันทึก: ${rows.length} รายการ`
      break
    }

    // ------------------------------------------------------------------------
    // 4. Grade Report / Academic Report
    // ------------------------------------------------------------------------
    case "grade_report":
    case "academic_report": {
      headers = [
        "รหัสนักเรียน",
        "ชื่อ - นามสกุล",
        "รายวิชา",
        "คะแนนเก็บ",
        "กลางภาค",
        "ปลายภาค",
        "รวม",
        "เกรด",
      ]
      const pageSize = 1000
      let from = 0
      let hasMore = true
      const allScores: {
        id: string
        classwork_score: number | null
        midterm_score: number | null
        final_score: number | null
        total_score: number | null
        grade: string | null
        students: unknown
        classroom_subjects: unknown
      }[] = []

      while (hasMore) {
        let query = supabase
          .from("academic_scores")
          .select(`
            id, classwork_score, midterm_score, final_score, total_score, grade,
            students(student_code, first_name, last_name),
            classroom_subjects(subjects(name, subject_code))
          `)
          .eq("school_id", job.schoolId)

        if (semesterFilter) query = query.eq("semester_id", semesterFilter)
        if (studentFilter) query = query.eq("student_id", studentFilter)

        const { data: pageData, error } = await query
          .order("created_at", { ascending: false })
          .order("id", { ascending: true })
          .range(from, from + pageSize - 1)

        if (error) throw new Error(`Failed to load academic report: ${error.message}`)
        if (!pageData || pageData.length === 0) {
          hasMore = false
        } else {
          allScores.push(...pageData)
          if (pageData.length < pageSize) hasMore = false
          else from += pageSize
        }
      }

      rows = allScores.map((sc) => {
        const st = sc.students as unknown as { student_code: string; first_name: string; last_name: string } | null
        const cs = sc.classroom_subjects as unknown as { subjects: { name: string; subject_code: string } | null } | null
        return [
          st?.student_code || "-",
          `${st?.first_name || ""} ${st?.last_name || ""}`.trim() || "-",
          cs?.subjects?.name || "-",
          String(sc.classwork_score ?? "-"),
          String(sc.midterm_score ?? "-"),
          String(sc.final_score ?? "-"),
          String(sc.total_score ?? "-"),
          sc.grade || "-",
        ]
      })
      subtitle += ` | ผลการเรียน: ${rows.length} รายการ`
      break
    }

    // ------------------------------------------------------------------------
    // 5. Screening Summary / Risk Report
    // ------------------------------------------------------------------------
    case "screening_summary":
    case "risk_report":
    case "risk_assessment": {
      headers = [
        "รหัสนักเรียน",
        "ชื่อ - นามสกุล",
        "ห้องเรียน",
        "ระดับความเสี่ยง",
        "คะแนนความเสี่ยง",
        "จำนวนการแจ้งเตือน",
        "ผู้ปกครอง",
        "เบอร์ติดต่อ",
      ]
      const pageSize = 1000
      let from = 0
      const risks: {
        student_id: string | null
        student_code: string | null
        full_name: string | null
        classroom_name: string | null
        risk_level: string | null
        risk_score: number | null
        active_flag_count: number | null
        primary_guardian_name: string | null
        primary_guardian_phone: string | null
      }[] = []

      while (true) {
        let query = supabase
          .from("v_student_worklist")
          .select(
            "student_id, student_code, full_name, classroom_name, risk_level, risk_score, active_flag_count, primary_guardian_name, primary_guardian_phone",
          )
          .eq("school_id", job.schoolId)
          .in("risk_level", ["high", "watch"])

        if (classroomFilter) query = query.eq("classroom_id", classroomFilter)

        const { data: pageData, error } = await query
          .order("risk_score", { ascending: false, nullsFirst: false })
          .order("student_id", { ascending: true })
          .range(from, from + pageSize - 1)

        if (error) throw new Error(`Failed to load risk report: ${error.message}`)
        if (!pageData?.length) break
        risks.push(...pageData)
        if (pageData.length < pageSize) break
        from += pageSize
      }

      rows = risks.map((r) => [
        r.student_code || "-",
        r.full_name || "-",
        r.classroom_name || "-",
        r.risk_level === "high" ? "เสี่ยงสูง (High)" : "ต้องติดตาม (Watch)",
        r.risk_score !== null ? String(r.risk_score) : "-",
        r.active_flag_count ? `${r.active_flag_count} รายการ` : "0",
        r.primary_guardian_name || "-",
        r.primary_guardian_phone || "-",
      ])
      subtitle += ` | นักเรียนกลุ่มเสี่ยง: ${rows.length} คน`
      break
    }

    // ------------------------------------------------------------------------
    // 6. Home Visit Summary
    // ------------------------------------------------------------------------
    case "home_visit_summary": {
      headers = [
        "วันที่เยี่ยม",
        "รหัสนักเรียน",
        "ชื่อ - นามสกุล",
        "สภาพที่อยู่อาศัย",
        "ความปลอดภัย",
        "ปัญหาครอบครัว",
        "การติดตามผล",
        "ข้อเสนอแนะ",
      ]
      const pageSize = 1000
      let from = 0
      let hasMore = true
      const visits: {
        id: string
        visit_date: string
        housing_condition: string | null
        environment_safety: string | null
        has_family_problem: boolean | null
        follow_up_needed: boolean | null
        suggestions: string | null
        students: unknown
      }[] = []

      while (hasMore) {
        let query = supabase
          .from("home_visits")
          .select(`
            id, visit_date, housing_condition, environment_safety, has_family_problem, follow_up_needed, suggestions,
            students(student_code, first_name, last_name)
          `)
          .eq("school_id", job.schoolId)

        if (dateFrom) query = query.gte("visit_date", dateFrom)
        if (dateTo) query = query.lte("visit_date", dateTo)
        if (studentFilter) query = query.eq("student_id", studentFilter)

        const { data: pageData, error } = await query
          .order("visit_date", { ascending: false })
          .order("id", { ascending: true })
          .range(from, from + pageSize - 1)

        if (error) throw new Error(`Failed to load home visit report: ${error.message}`)
        if (!pageData || pageData.length === 0) {
          hasMore = false
        } else {
          visits.push(...pageData)
          if (pageData.length < pageSize) hasMore = false
          else from += pageSize
        }
      }

      const housingMap: Record<string, string> = {
        good: "มั่นคงถาวร",
        fair: "พอใช้/ปานกลาง",
        poor: "ทรุดโทรม/ไม่มั่นคง",
      }

      rows = visits.map((v) => {
        const st = v.students as unknown as { student_code: string; first_name: string; last_name: string } | null
        return [
          v.visit_date || "-",
          st?.student_code || "-",
          `${st?.first_name || ""} ${st?.last_name || ""}`.trim() || "-",
          housingMap[v.housing_condition || ""] || v.housing_condition || "-",
          v.environment_safety || "ปลอดภัย",
          v.has_family_problem ? "มีปัญหา" : "ปกติ",
          v.follow_up_needed ? "ต้องติดตาม" : "ไม่ต้องติดตาม",
          v.suggestions || "-",
        ]
      })
      subtitle += ` | การเยี่ยมบ้าน: ${rows.length} รายการ`
      break
    }

    // ------------------------------------------------------------------------
    // 7. Support Summary
    // ------------------------------------------------------------------------
    case "support_summary": {
      headers = [
        "รหัสนักเรียน",
        "ชื่อ - นามสกุล",
        "หมวดหมู่",
        "ความเร่งด่วน",
        "หัวข้อการช่วยเหลือ",
        "สถานะ",
        "วันที่เริ่มต้น",
        "วันที่เสร็จสิ้น",
      ]
      const pageSize = 1000
      let from = 0
      let hasMore = true
      const records: {
        id: string
        support_type: string
        priority: string | null
        title: string
        status: string
        started_at: string | null
        completed_at: string | null
        students: unknown
      }[] = []

      while (hasMore) {
        let query = supabase
          .from("support_records")
          .select(`
            id, support_type, priority, title, status, started_at, completed_at,
            students(student_code, first_name, last_name)
          `)
          .eq("school_id", job.schoolId)

        if (studentFilter) query = query.eq("student_id", studentFilter)

        const { data: pageData, error } = await query
          .order("created_at", { ascending: false })
          .order("id", { ascending: true })
          .range(from, from + pageSize - 1)

        if (error) throw new Error(`Failed to load support summary: ${error.message}`)
        if (!pageData || pageData.length === 0) {
          hasMore = false
        } else {
          records.push(...pageData)
          if (pageData.length < pageSize) hasMore = false
          else from += pageSize
        }
      }

      const typeMap: Record<string, string> = {
        academic: "วิชาการ",
        behavioral: "พฤติกรรม",
        emotional: "อารมณ์/จิตใจ",
        financial: "การเงิน/ทุน",
        health: "สุขภาพ",
        family: "ครอบครัว",
        social: "สังคม",
        other: "อื่นๆ",
      }

      const statusMap: Record<string, string> = {
        pending: "รอดำเนินการ",
        in_progress: "กำลังช่วยเหลือ",
        completed: "เสร็จสิ้น",
        cancelled: "ยกเลิก",
        referred: "ส่งต่อ",
      }

      rows = records.map((s) => {
        const st = s.students as unknown as { student_code: string; first_name: string; last_name: string } | null
        return [
          st?.student_code || "-",
          `${st?.first_name || ""} ${st?.last_name || ""}`.trim() || "-",
          typeMap[s.support_type] || s.support_type,
          s.priority || "ปกติ",
          s.title || "-",
          statusMap[s.status] || s.status,
          s.started_at || "-",
          s.completed_at || "-",
        ]
      })
      subtitle += ` | เคสช่วยเหลือ: ${rows.length} รายการ`
      break
    }

    // ------------------------------------------------------------------------
    // 8. IDP Summary
    // ------------------------------------------------------------------------
    case "idp_summary": {
      headers = [
        "รหัสนักเรียน",
        "ชื่อ - นามสกุล",
        "ชื่อแผนพัฒนาการ",
        "ความคืบหน้า",
        "สถานะแผน",
        "วันที่เริ่มต้น",
        "วันที่สิ้นสุด",
      ]
      const pageSize = 1000
      let from = 0
      let hasMore = true
      const plans: {
        id: string
        title: string
        overall_progress: number | null
        status: string
        start_date: string
        end_date: string
        students: unknown
      }[] = []

      while (hasMore) {
        let query = supabase
          .from("development_plans")
          .select(`
            id, title, overall_progress, status, start_date, end_date,
            students(student_code, first_name, last_name)
          `)
          .eq("school_id", job.schoolId)

        if (studentFilter) query = query.eq("student_id", studentFilter)

        const { data: pageData, error } = await query
          .order("created_at", { ascending: false })
          .order("id", { ascending: true })
          .range(from, from + pageSize - 1)

        if (error) throw new Error(`Failed to load IDP summary: ${error.message}`)
        if (!pageData || pageData.length === 0) {
          hasMore = false
        } else {
          plans.push(...pageData)
          if (pageData.length < pageSize) hasMore = false
          else from += pageSize
        }
      }

      const planStatusMap: Record<string, string> = {
        draft: "ร่างแผน",
        active: "กำลังดำเนินการ",
        completed: "สำเร็จตามเป้าหมาย",
        cancelled: "ยกเลิก",
      }

      rows = plans.map((p) => {
        const st = p.students as unknown as { student_code: string; first_name: string; last_name: string } | null
        return [
          st?.student_code || "-",
          `${st?.first_name || ""} ${st?.last_name || ""}`.trim() || "-",
          p.title || "-",
          `${p.overall_progress ?? 0}%`,
          planStatusMap[p.status] || p.status,
          p.start_date || "-",
          p.end_date || "-",
        ]
      })
      subtitle += ` | แผนพัฒนาการ (IDP): ${rows.length} รายการ`
      break
    }

    // ------------------------------------------------------------------------
    // 9. Comprehensive Holistic Report
    // ------------------------------------------------------------------------
    case "comprehensive": {
      headers = [
        "รหัสนักเรียน",
        "ชื่อ - นามสกุล",
        "ห้องเรียน",
        "สถานะความเสี่ยง",
        "การมาเรียน 30 วัน",
        "เคสช่วยเหลือที่เปิดอยู่",
        "ผู้ปกครอง",
        "เบอร์โทรศัพท์",
      ]
      const pageSize = 1000
      let from = 0
      const items: {
        student_id: string | null
        student_code: string | null
        full_name: string | null
        classroom_name: string | null
        risk_level: string | null
        attendance_rate_30d: number | null
        open_support_count: number | null
        primary_guardian_name: string | null
        primary_guardian_phone: string | null
      }[] = []

      while (true) {
        let query = supabase
          .from("v_student_worklist")
          .select(
            "student_id, student_code, full_name, classroom_name, risk_level, attendance_rate_30d, open_support_count, primary_guardian_name, primary_guardian_phone",
          )
          .eq("school_id", job.schoolId)

        if (classroomFilter) query = query.eq("classroom_id", classroomFilter)
        if (studentFilter) query = query.eq("student_id", studentFilter)

        const { data: pageData, error } = await query
          .order("classroom_name", { ascending: true, nullsFirst: false })
          .order("student_code", { ascending: true, nullsFirst: false })
          .range(from, from + pageSize - 1)

        if (error) throw new Error(`Failed to load comprehensive report: ${error.message}`)
        if (!pageData?.length) break
        items.push(...pageData)
        if (pageData.length < pageSize) break
        from += pageSize
      }

      rows = items.map((s) => [
        s.student_code || "-",
        s.full_name || "-",
        s.classroom_name || "-",
        s.risk_level === "high" ? "เสี่ยงสูง" : s.risk_level === "watch" ? "ต้องติดตาม" : "ปกติ",
        s.attendance_rate_30d !== null ? `${s.attendance_rate_30d}%` : "-",
        s.open_support_count ? `${s.open_support_count} เคส` : "ไม่มี",
        s.primary_guardian_name || "-",
        s.primary_guardian_phone || "-",
      ])
      subtitle += ` | รายงานรอบด้าน: ${rows.length} คน`
      break
    }

    default: {
      throw new Error(`ประเภทรายงาน '${job.reportType}' ยังไม่เปิดให้บริการในระบบ`)
    }
  }

  if (format === "xlsx") {
    const xlsxBuffer = await buildXlsxSpreadsheet(job.title, headers, rows)
    return {
      contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      fileExtension: "xlsx",
      buffer: xlsxBuffer,
      fileName: `${job.id}.xlsx`,
    }
  } else {
    const pdfBuffer = await buildThaiPdfDocument(job.title, subtitle, schoolName, headers, rows)
    return {
      contentType: "application/pdf",
      fileExtension: "pdf",
      buffer: pdfBuffer,
      fileName: `${job.id}.pdf`,
    }
  }
}
