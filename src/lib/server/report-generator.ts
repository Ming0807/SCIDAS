import "server-only"

import writeXlsxFile from "write-excel-file/node"
import { PDFDocument, rgb } from "pdf-lib"
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
// Multi-Page Thai PDF Generator with fontkit, text wrapping & dynamic row height
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

  // Calculate dynamic column widths: allocate more width for names/descriptions
  const baseColWidth = contentWidth / colCount
  const colWidths: number[] = headers.map((h) => {
    if (h.includes("ชื่อ") || h.includes("ผู้ปกครอง") || h.includes("หมายเหตุ") || h.includes("รายวิชา")) {
      return baseColWidth * 1.35
    }
    if (h.includes("รหัส") || h.includes("เกรด") || h.includes("สถานะ") || h.includes("วันที่") || h.includes("คะแนน")) {
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

  const titleSize = 14
  const subtitleSize = 9
  const headerFontSize = 8.5
  const rowFontSize = 8
  const baseRowHeight = 18
  const rowLineHeight = 10
  const maxCellLines = 6

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

  const drawPageHeader = (page: ReturnType<typeof doc.addPage>) => {
    page.drawText(schoolName, {
      x: margin,
      y: pageHeight - 32,
      size: subtitleSize,
      font: customFont,
      color: rgb(0.3, 0.4, 0.5),
    })

    page.drawText(title, {
      x: margin,
      y: pageHeight - 48,
      size: titleSize,
      font: customFont,
      color: rgb(0.08, 0.15, 0.25),
    })

    page.drawText(subtitle, {
      x: margin,
      y: pageHeight - 62,
      size: subtitleSize,
      font: customFont,
      color: rgb(0.4, 0.45, 0.5),
    })

    page.drawLine({
      start: { x: margin, y: pageHeight - 68 },
      end: { x: pageWidth - margin, y: pageHeight - 68 },
      thickness: 1,
      color: rgb(0.2, 0.4, 0.8),
    })
  }

  const drawTableHeader = (page: ReturnType<typeof doc.addPage>, y: number) => {
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

  // Draw rows with automatic pagination and bounded multi-line cells.
  for (let r = 0; r < rows.length; r++) {
    const rowData = rows[r]
    const wrappedCells = rowData.map((cellText, columnIndex) =>
      wrapCellText(cellText, normalizedColWidths[columnIndex] - 6),
    )
    const rowHeight = Math.max(
      baseRowHeight,
      Math.max(...wrappedCells.map((cellLines) => cellLines.length)) * rowLineHeight + 8,
    )

    if (currentY - rowHeight < margin + 12) {
      currentPage = doc.addPage([pageWidth, pageHeight])
      drawPageHeader(currentPage)
      currentY = drawTableHeader(currentPage, pageHeight - 88)
    }

    const rowTop = currentY + 8
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
          y: rowTop - 12 - lineIndex * rowLineHeight,
          size: rowFontSize,
          font: customFont,
          color: rgb(0.15, 0.15, 0.2),
        })
      })
    })

    currentY = rowBottom - 8
  }

  const totalPages = doc.getPageCount()
  for (let p = 0; p < totalPages; p++) {
    const page = doc.getPage(p)
    const footerText = `ระบบดูแลช่วยเหลือนักเรียน SCIDAS  |  หน้า ${p + 1} จาก ${totalPages}`
    page.drawText(footerText, {
      x: margin,
      y: 18,
      size: 7.5,
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
    backgroundColor: "#F1F5F9",
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
      value: `วันที่สร้าง: ${new Date().toLocaleDateString("th-TH")}`,
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
// Report Data Fetcher & Master Dispatcher
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

  switch (job.reportType) {
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
        const { data: pageData, error } = await supabase
          .from("v_student_worklist")
          .select(
            "student_id, student_code, full_name, grade_level, classroom_name, risk_level, attendance_rate_30d, open_support_count, primary_guardian_name, primary_guardian_phone",
          )
          .eq("school_id", job.schoolId)
          .order("student_code", { ascending: true, nullsFirst: false })
          .order("student_id", { ascending: true })
          .range(from, from + pageSize - 1)

        if (error) {
          throw new Error(`Failed to load student summary: ${error.message}`)
        }
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
        const { data: pageData, error } = await supabase
          .from("v_student_worklist")
          .select(
            "student_id, student_code, full_name, classroom_name, risk_level, risk_score, active_flag_count, primary_guardian_name, primary_guardian_phone",
          )
          .eq("school_id", job.schoolId)
          .in("risk_level", ["high", "watch"])
          .order("risk_score", { ascending: false, nullsFirst: false })
          .order("student_id", { ascending: true })
          .range(from, from + pageSize - 1)

        if (error) {
          throw new Error(`Failed to load risk report: ${error.message}`)
        }
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
        const { data: pageData, error } = await supabase
          .from("attendance_records")
          .select(`
            id, date, status, remark,
            students(student_code, first_name, last_name),
            classrooms(name)
          `)
          .eq("school_id", job.schoolId)
          .order("date", { ascending: false })
          .order("id", { ascending: true })
          .range(from, from + pageSize - 1)

        if (error) {
          throw new Error(`Failed to load attendance report: ${error.message}`)
        }

        if (!pageData || pageData.length === 0) {
          hasMore = false
        } else {
          allAttendance.push(...pageData)
          if (pageData.length < pageSize) {
            hasMore = false
          } else {
            from += pageSize
          }
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
        const st = a.students as unknown as {
          student_code: string
          first_name: string
          last_name: string
        } | null
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
        const { data: pageData, error } = await supabase
          .from("academic_scores")
          .select(`
            id, classwork_score, midterm_score, final_score, total_score, grade,
            students(student_code, first_name, last_name),
            classroom_subjects(subjects(name, subject_code))
          `)
          .eq("school_id", job.schoolId)
          .order("created_at", { ascending: false })
          .order("id", { ascending: true })
          .range(from, from + pageSize - 1)

        if (error) {
          throw new Error(`Failed to load academic report: ${error.message}`)
        }

        if (!pageData || pageData.length === 0) {
          hasMore = false
        } else {
          allScores.push(...pageData)
          if (pageData.length < pageSize) {
            hasMore = false
          } else {
            from += pageSize
          }
        }
      }

      rows = allScores.map((sc) => {
        const st = sc.students as unknown as {
          student_code: string
          first_name: string
          last_name: string
        } | null
        const cs = sc.classroom_subjects as unknown as {
          subjects: { name: string; subject_code: string } | null
        } | null
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
