import * as XLSX from "xlsx"

export type ParsedStudentRow = {
  rowNumber: number
  studentCode: string
  nationalId?: string | null
  prefix?: string | null
  firstName: string
  lastName: string
  nickname?: string | null
  gender: "male" | "female" | "other"
  dateOfBirth: string // YYYY-MM-DD
  bloodType?: string | null
  address?: string | null
  studentNumber?: number | null
  guardianPrefix?: string | null
  guardianFirstName?: string | null
  guardianLastName?: string | null
  guardianPhone?: string | null
  guardianRelation?: "father" | "mother" | "grandfather" | "grandmother" | "uncle" | "aunt" | "sibling" | "other_relative" | "guardian" | null
}

export type RowValidationError = {
  rowNumber: number
  studentCode?: string
  studentName?: string
  errors: string[]
}

export type ParseImportResult = {
  validRows: ParsedStudentRow[]
  invalidRows: RowValidationError[]
  totalRows: number
  summary: {
    validCount: number
    invalidCount: number
  }
}

// ----------------------------------------------------------------------------
// CSV Parser (RFC 4180 Compliant with Quote Handling & Thai UTF-8 Support)
// ----------------------------------------------------------------------------
export function parseCsvContent(content: string): string[][] {
  // Strip BOM if present
  let cleanContent = content.charCodeAt(0) === 0xfeff ? content.slice(1) : content
  cleanContent = cleanContent.replace(/\r\n/g, "\n").replace(/\r/g, "\n")

  const rows: string[][] = []
  let currentRow: string[] = []
  let currentField = ""
  let inQuotes = false

  for (let i = 0; i < cleanContent.length; i++) {
    const char = cleanContent[i]
    const nextChar = cleanContent[i + 1]

    if (inQuotes) {
      if (char === '"') {
        if (nextChar === '"') {
          currentField += '"'
          i++ // skip escaped quote
        } else {
          inQuotes = false
        }
      } else {
        currentField += char
      }
    } else {
      if (char === '"') {
        inQuotes = true
      } else if (char === ",") {
        currentRow.push(currentField.trim())
        currentField = ""
      } else if (char === "\n") {
        currentRow.push(currentField.trim())
        if (currentRow.some((field) => field.length > 0)) {
          rows.push(currentRow)
        }
        currentRow = []
        currentField = ""
      } else {
        currentField += char
      }
    }
  }

  if (currentField.length > 0 || currentRow.length > 0) {
    currentRow.push(currentField.trim())
    if (currentRow.some((field) => field.length > 0)) {
      rows.push(currentRow)
    }
  }

  return rows
}

// ----------------------------------------------------------------------------
// XLSX / XLS Parser using SheetJS
// ----------------------------------------------------------------------------
export function parseXlsxContent(buffer: Buffer | ArrayBuffer | Uint8Array): string[][] {
  const workbook = XLSX.read(buffer, { type: "buffer", raw: false })
  const firstSheetName = workbook.SheetNames[0]
  if (!firstSheetName) return []

  const worksheet = workbook.Sheets[firstSheetName]
  const rawRows = XLSX.utils.sheet_to_json<string[]>(worksheet, {
    header: 1,
    defval: "",
    blankrows: false,
  })

  return rawRows.map((row) => row.map((cell) => String(cell ?? "").trim()))
}

// ----------------------------------------------------------------------------
// Master File-to-Table Dispatcher (Handles CSV & XLSX)
// ----------------------------------------------------------------------------
export function parseFileContent(
  fileData: string | Buffer | ArrayBuffer | Uint8Array,
  fileName: string
): string[][] {
  const ext = fileName.split(".").pop()?.toLowerCase() ?? ""

  if (ext === "xlsx" || ext === "xls") {
    const buf = typeof fileData === "string" ? Buffer.from(fileData, "binary") : Buffer.from(fileData as ArrayBuffer)
    return parseXlsxContent(buf)
  }

  // Treat as text CSV
  const textContent = typeof fileData === "string" ? fileData : Buffer.from(fileData as ArrayBuffer).toString("utf8")
  return parseCsvContent(textContent)
}

// ----------------------------------------------------------------------------
// Header Mapping
// ----------------------------------------------------------------------------
const HEADER_MAP: Record<string, keyof ParsedStudentRow> = {
  // รหัสนักเรียน
  รหัสนักเรียน: "studentCode",
  เลขประจำตัวนักเรียน: "studentCode",
  student_code: "studentCode",
  studentcode: "studentCode",
  code: "studentCode",
  รหัส: "studentCode",

  // เลขประจำตัวประชาชน
  เลขประจำตัวประชาชน: "nationalId",
  เลขบัตรประชาชน: "nationalId",
  เลขบัตรประจำตัวประชาชน: "nationalId",
  national_id: "nationalId",
  nationalid: "nationalId",
  id_card: "nationalId",
  เลขประชาชน: "nationalId",

  // คำนำหน้า
  คำนำหน้า: "prefix",
  คำนำหน้านาม: "prefix",
  คำนำหน้าชื่อ: "prefix",
  prefix: "prefix",
  title: "prefix",

  // ชื่อ
  ชื่อ: "firstName",
  ชื่อจริง: "firstName",
  first_name: "firstName",
  firstname: "firstName",
  name: "firstName",

  // นามสกุล
  นามสกุล: "lastName",
  last_name: "lastName",
  lastname: "lastName",
  surname: "lastName",

  // ชื่อเล่น
  ชื่อเล่น: "nickname",
  nickname: "nickname",

  // เพศ
  เพศ: "gender",
  gender: "gender",
  sex: "gender",

  // วันเกิด
  วันเกิด: "dateOfBirth",
  "วัน/เดือน/ปีเกิด": "dateOfBirth",
  วันเดือนปีเกิด: "dateOfBirth",
  date_of_birth: "dateOfBirth",
  dob: "dateOfBirth",
  birthday: "dateOfBirth",

  // กรุ๊ปเลือด
  กรุ๊ปเลือด: "bloodType",
  หมู่เลือด: "bloodType",
  blood_type: "bloodType",
  bloodtype: "bloodType",

  // ที่อยู่
  ที่อยู่: "address",
  address: "address",

  // เลขที่
  เลขที่: "studentNumber",
  ลำดับที่: "studentNumber",
  student_number: "studentNumber",
  no: "studentNumber",

  // ผู้ปกครอง
  คำนำหน้าผู้ปกครอง: "guardianPrefix",
  guardian_prefix: "guardianPrefix",

  ชื่อผู้ปกครอง: "guardianFirstName",
  ชื่อจริงผู้ปกครอง: "guardianFirstName",
  guardian_first_name: "guardianFirstName",
  guardian_name: "guardianFirstName",

  นามสกุลผู้ปกครอง: "guardianLastName",
  guardian_last_name: "guardianLastName",

  เบอร์โทรผู้ปกครอง: "guardianPhone",
  เบอร์โทรศัพท์ผู้ปกครอง: "guardianPhone",
  เบอร์ติดต่อผู้ปกครอง: "guardianPhone",
  โทรศัพท์ผู้ปกครอง: "guardianPhone",
  guardian_phone: "guardianPhone",
  phone: "guardianPhone",

  ความสัมพันธ์: "guardianRelation",
  ความสัมพันธ์ผู้ปกครอง: "guardianRelation",
  เกี่ยวข้องเป็น: "guardianRelation",
  guardian_relation: "guardianRelation",
  relation: "guardianRelation",
}

function normalizeHeaderKey(rawHeader: string): string {
  return rawHeader.trim().toLowerCase().replace(/[\s_\-\.\(\)]/g, "")
}

// ----------------------------------------------------------------------------
// Date of Birth Normalizer (Handles Buddhist Era 25xx & Gregorian 20xx)
// ----------------------------------------------------------------------------
export function normalizeDateOfBirth(rawDate: string): string | null {
  if (!rawDate) return null
  const cleaned = rawDate.trim().replace(/[.\/]/g, "-")

  // DD-MM-YYYY or DD/MM/YYYY
  const dmyMatch = cleaned.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/)
  if (dmyMatch) {
    const day = dmyMatch[1].padStart(2, "0")
    const month = dmyMatch[2].padStart(2, "0")
    let year = parseInt(dmyMatch[3], 10)

    // Normalize Buddhist Era (BE 25xx -> AD 20xx/19xx)
    if (year > 2400) {
      year -= 543
    }

    return `${year}-${month}-${day}`
  }

  // YYYY-MM-DD
  const ymdMatch = cleaned.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/)
  if (ymdMatch) {
    let year = parseInt(ymdMatch[1], 10)
    const month = ymdMatch[2].padStart(2, "0")
    const day = ymdMatch[3].padStart(2, "0")

    if (year > 2400) {
      year -= 543
    }

    return `${year}-${month}-${day}`
  }

  // Excel serial date number
  const serialNumber = Number(rawDate)
  if (!isNaN(serialNumber) && serialNumber > 20000 && serialNumber < 60000) {
    const dateObj = new Date((serialNumber - (25567 + 2)) * 86400 * 1000)
    const y = dateObj.getFullYear()
    const m = String(dateObj.getMonth() + 1).padStart(2, "0")
    const d = String(dateObj.getDate()).padStart(2, "0")
    return `${y}-${m}-${d}`
  }

  return null
}

// ----------------------------------------------------------------------------
// Gender Normalizer
// ----------------------------------------------------------------------------
export function normalizeGender(rawGender: string, prefix?: string | null): "male" | "female" | "other" {
  const g = (rawGender || "").trim().toLowerCase()

  if (["ชาย", "ด.ช.", "เด็กชาย", "นาย", "m", "male", "boy", "man"].includes(g)) {
    return "male"
  }
  if (["หญิง", "ด.ญ.", "เด็กหญิง", "นางสาว", "นาง", "น.ส.", "f", "female", "girl", "woman"].includes(g)) {
    return "female"
  }

  // Infer from prefix if gender column is empty
  const p = (prefix || "").trim().toLowerCase()
  if (["ด.ช.", "เด็กชาย", "นาย"].includes(p)) return "male"
  if (["ด.ญ.", "เด็กหญิง", "นางสาว", "นาง", "น.ส."].includes(p)) return "female"

  return "other"
}

// ----------------------------------------------------------------------------
// Guardian Relation Normalizer
// ----------------------------------------------------------------------------
export function normalizeGuardianRelation(
  rawRelation?: string | null
): "father" | "mother" | "grandfather" | "grandmother" | "uncle" | "aunt" | "sibling" | "other_relative" | "guardian" {
  if (!rawRelation) return "guardian"
  const r = rawRelation.trim().toLowerCase()

  if (["บิดา", "พ่อ", "father", "dad"].includes(r)) return "father"
  if (["มารดา", "แม่", "mother", "mom"].includes(r)) return "mother"
  if (["ปู่", "ตา", "grandfather", "grandpa"].includes(r)) return "grandfather"
  if (["ย่า", "ยาย", "grandmother", "grandma"].includes(r)) return "grandmother"
  if (["ลุง", "อา (ชาย)", "น้า (ชาย)", "uncle"].includes(r)) return "uncle"
  if (["ป้า", "อา (หญิง)", "น้า (หญิง)", "aunt"].includes(r)) return "aunt"
  if (["พี่", "น้อง", "sibling", "brother", "sister"].includes(r)) return "sibling"
  if (["ญาติ", "other_relative", "relative"].includes(r)) return "other_relative"

  return "guardian"
}

// ----------------------------------------------------------------------------
// Master Row Parser & Validator
// ----------------------------------------------------------------------------
export function parseAndValidateStudentRows(
  input: string | string[][] | Buffer | ArrayBuffer | Uint8Array,
  fileName = "data.csv"
): ParseImportResult {
  let table: string[][]

  if (Array.isArray(input)) {
    table = input as string[][]
  } else {
    table = parseFileContent(input, fileName)
  }

  if (table.length < 2) {
    return {
      validRows: [],
      invalidRows: [
        {
          rowNumber: 1,
          errors: ["ไม่พบข้อมูลในไฟล์ หรือไฟล์ไม่มีแถวข้อมูล (ต้องมีหัวตารางและข้อมูลอย่างน้อย 1 แถว)"],
        },
      ],
      totalRows: 0,
      summary: { validCount: 0, invalidCount: 1 },
    }
  }

  if (table.length > 501) {
    return {
      validRows: [],
      invalidRows: [
        {
          rowNumber: 1,
          errors: ["ไฟล์มีจำนวนแถวเกินขนาดที่กำหนด (สูงสุด 500 รายการต่อครั้ง)"],
        },
      ],
      totalRows: table.length - 1,
      summary: { validCount: 0, invalidCount: 1 },
    }
  }

  const rawHeaders = table[0]
  const headerMap: Record<number, keyof ParsedStudentRow> = {}

  rawHeaders.forEach((header, index) => {
    const directKey = HEADER_MAP[header.trim()]
    if (directKey) {
      headerMap[index] = directKey
    } else {
      const normalized = normalizeHeaderKey(header)
      for (const [thaiKey, propName] of Object.entries(HEADER_MAP)) {
        if (normalizeHeaderKey(thaiKey) === normalized) {
          headerMap[index] = propName
          break
        }
      }
    }
  })

  // Ensure mandatory header columns are present
  const mappedProps = Object.values(headerMap)
  const missingHeaders: string[] = []
  if (!mappedProps.includes("studentCode")) missingHeaders.push("รหัสนักเรียน (student_code)")
  if (!mappedProps.includes("firstName")) missingHeaders.push("ชื่อ (first_name)")
  if (!mappedProps.includes("lastName")) missingHeaders.push("นามสกุล (last_name)")

  if (missingHeaders.length > 0) {
    return {
      validRows: [],
      invalidRows: [
        {
          rowNumber: 1,
          errors: [`ไม่พบคอลัมน์บังคับ: ${missingHeaders.join(", ")}`],
        },
      ],
      totalRows: table.length - 1,
      summary: { validCount: 0, invalidCount: 1 },
    }
  }

  const validRows: ParsedStudentRow[] = []
  const invalidRows: RowValidationError[] = []

  const seenStudentCodes = new Set<string>()
  const seenNationalIds = new Set<string>()

  for (let rowIndex = 1; rowIndex < table.length; rowIndex++) {
    const row = table[rowIndex]
    const rowNumber = rowIndex + 1
    const rowErrors: string[] = []

    const rowObj: Partial<ParsedStudentRow> = { rowNumber }

    row.forEach((cellVal, colIndex) => {
      const propName = headerMap[colIndex]
      if (!propName) return

      const cleanVal = cellVal.trim()
      if (cleanVal.length === 0) return

      if (propName === "studentNumber") {
        const num = parseInt(cleanVal, 10)
        if (!isNaN(num)) rowObj.studentNumber = num
      } else {
        ;(rowObj as Record<string, unknown>)[propName] = cleanVal
      }
    })

    // Validation 1: Student Code
    if (!rowObj.studentCode) {
      rowErrors.push("จำเป็นต้องระบุรหัสนักเรียน")
    } else {
      if (seenStudentCodes.has(rowObj.studentCode)) {
        rowErrors.push(`รหัสนักเรียน '${rowObj.studentCode}' ซ้ำกับแถวอื่นในไฟล์นี้`)
      } else {
        seenStudentCodes.add(rowObj.studentCode)
      }
    }

    // Validation 2: First & Last Name
    if (!rowObj.firstName) {
      rowErrors.push("จำเป็นต้องระบุชื่อจริง")
    }
    if (!rowObj.lastName) {
      rowErrors.push("จำเป็นต้องระบุนามสกุล")
    }

    // Validation 3: National ID (Optional, but if present must be 13 digits)
    if (rowObj.nationalId) {
      const cleanId = rowObj.nationalId.replace(/[\s\-]/g, "")
      if (!/^\d{13}$/.test(cleanId)) {
        rowErrors.push("เลขประจำตัวประชาชนต้องเป็นตัวเลข 13 หลัก")
      } else {
        if (seenNationalIds.has(cleanId)) {
          rowErrors.push(`เลขประจำตัวประชาชน '${cleanId}' ซ้ำกับแถวอื่นในไฟล์นี้`)
        } else {
          seenNationalIds.add(cleanId)
        }
        rowObj.nationalId = cleanId
      }
    }

    // Validation 4: Date of Birth
    const rawDob = (rowObj as { dateOfBirth?: string }).dateOfBirth
    if (rawDob) {
      const normalizedDob = normalizeDateOfBirth(rawDob)
      if (!normalizedDob) {
        rowErrors.push("รูปแบบวันเกิดไม่ถูกต้อง (รองรับ วัน/เดือน/ปี หรือ ปี-เดือน-วัน)")
      } else {
        rowObj.dateOfBirth = normalizedDob
      }
    } else {
      // Default to 10 years ago if blank
      const defaultYear = new Date().getFullYear() - 10
      rowObj.dateOfBirth = `${defaultYear}-01-01`
    }

    // Validation 5: Gender
    const rawGender = (rowObj as { gender?: string }).gender
    rowObj.gender = normalizeGender(rawGender ?? "", rowObj.prefix)

    // Validation 6: Guardian info
    if (rowObj.guardianFirstName) {
      rowObj.guardianRelation = normalizeGuardianRelation(
        rowObj.guardianRelation as string | undefined
      )
    }

    if (rowErrors.length > 0) {
      invalidRows.push({
        rowNumber,
        studentCode: rowObj.studentCode,
        studentName: `${rowObj.firstName ?? ""} ${rowObj.lastName ?? ""}`.trim() || undefined,
        errors: rowErrors,
      })
    } else {
      validRows.push(rowObj as ParsedStudentRow)
    }
  }

  return {
    validRows,
    invalidRows,
    totalRows: table.length - 1,
    summary: {
      validCount: validRows.length,
      invalidCount: invalidRows.length,
    },
  }
}

// ----------------------------------------------------------------------------
// Template Generators (CSV & XLSX)
// ----------------------------------------------------------------------------
export const SAMPLE_TEMPLATE_HEADERS = [
  "รหัสนักเรียน",
  "เลขประจำตัวประชาชน",
  "คำนำหน้า",
  "ชื่อ",
  "นามสกุล",
  "ชื่อเล่น",
  "เพศ",
  "วัน/เดือน/ปีเกิด",
  "เลขที่",
  "ชื่อผู้ปกครอง",
  "นามสกุลผู้ปกครอง",
  "เบอร์โทรผู้ปกครอง",
  "ความสัมพันธ์",
  "ที่อยู่",
]

export const SAMPLE_TEMPLATE_ROWS = [
  [
    "STD1001",
    "1100500123456",
    "เด็กชาย",
    "สมชาย",
    "ใจดี",
    "ชาย",
    "ชาย",
    "15/05/2556",
    "1",
    "สมศักดิ์",
    "ใจดี",
    "0812345678",
    "บิดา",
    "123 หมู่ 1 ต.ในเมือง",
  ],
  [
    "STD1002",
    "1100500123457",
    "เด็กหญิง",
    "สมหญิง",
    "ดีใจ",
    "หญิง",
    "หญิง",
    "20/08/2556",
    "2",
    "วันเพ็ญ",
    "ดีใจ",
    "0898765432",
    "มารดา",
    "45/6 หมู่ 2 ต.ในเมือง",
  ],
]

export function generateStudentImportTemplateCsv(): string {
  const bom = "\uFEFF"
  const lines = [
    SAMPLE_TEMPLATE_HEADERS.join(","),
    ...SAMPLE_TEMPLATE_ROWS.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(",")),
  ]
  return bom + lines.join("\r\n")
}

export function generateStudentImportTemplateXlsx(): Buffer {
  const aoa = [SAMPLE_TEMPLATE_HEADERS, ...SAMPLE_TEMPLATE_ROWS]
  const worksheet = XLSX.utils.aoa_to_sheet(aoa)
  worksheet["!cols"] = SAMPLE_TEMPLATE_HEADERS.map((h) => ({ wch: Math.max(h.length * 2, 14) }))

  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, "รายชื่อนักเรียน")

  return XLSX.write(workbook, { type: "buffer", bookType: "xlsx" }) as Buffer
}
