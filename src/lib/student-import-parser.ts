import readXlsxFile from "read-excel-file/node"
import writeXlsxFile from "write-excel-file/node"

export type ParsedStudentRow = {
  rowNumber: number
  studentCode: string
  nationalId?: string | null
  prefix?: string | null
  firstName: string
  lastName: string
  nickname?: string | null
  gender: "male" | "female" | "other"
  dateOfBirth?: string | null // YYYY-MM-DD (optional)
  bloodType?: string | null
  address?: string | null
  studentNumber?: number | null
  classroomName?: string | null
  guardianPrefix?: string | null
  guardianFirstName?: string | null
  guardianLastName?: string | null
  guardianPhone?: string | null
  guardianRelation?:
    | "father"
    | "mother"
    | "grandfather"
    | "grandmother"
    | "uncle"
    | "aunt"
    | "sibling"
    | "other_relative"
    | "guardian"
    | null
  isExistingInDb?: boolean
  existingStudentName?: string
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
    existingCount?: number
  }
  availableSheets?: string[]
  selectedSheet?: string
}

export type ImportDuplicateMode = "skip" | "enroll_existing" | "error"

export type InferredRoomInfo = {
  gradeLevel:
    | "k1"
    | "k2"
    | "k3"
    | "p1"
    | "p2"
    | "p3"
    | "p4"
    | "p5"
    | "p6"
    | "m1"
    | "m2"
    | "m3"
    | "m4"
    | "m5"
    | "m6"
  section: number
  thaiName: string
}

export type ParsedStudentGroup = {
  groupId: string
  groupName: string
  sourceType: "sheet" | "column" | "file"
  validRows: ParsedStudentRow[]
  invalidRows: RowValidationError[]
  totalRows: number
  inferred?: InferredRoomInfo | null
}

export type MultiGroupParseResult = {
  isMultiGroup: boolean
  groups: ParsedStudentGroup[]
  allValidCount: number
  allInvalidCount: number
  allTotalCount: number
  availableSheets: string[]
}

// ----------------------------------------------------------------------------
// Room / Grade Inference Helper
// ----------------------------------------------------------------------------
export function inferGradeAndSection(name: string): InferredRoomInfo | null {
  const trimmed = (name || "").trim()
  if (!trimmed) return null

  // 1. Kindergarten: อนุบาล 1-3, อ.1-3, k1-3
  const kMatch = trimmed.match(/(?:อนุบาล|อ\.?|k)\s*([1-3])(?:\s*[\/|\-]\s*(\d+))?/i)
  if (kMatch) {
    const gradeNum = kMatch[1]
    const secNum = kMatch[2] ? parseInt(kMatch[2], 10) : 1
    const gradeLevel = `k${gradeNum}` as "k1" | "k2" | "k3"
    const thaiName = secNum > 1 ? `อนุบาล ${gradeNum}/${secNum}` : `อนุบาล ${gradeNum}`
    return { gradeLevel, section: isNaN(secNum) ? 1 : secNum, thaiName }
  }

  // 2. Primary: ป.1-6, ประถมศึกษาปีที่ 1-6, p1-6, grade 1-6
  const pMatch = trimmed.match(
    /(?:ประถม(?:ศึกษา)?(?:ปีที่)?|ป\.?|p|grade)\s*([1-6])(?:\s*[\/|\-]\s*(\d+))?/i,
  )
  if (pMatch) {
    const gradeNum = pMatch[1]
    const secNum = pMatch[2] ? parseInt(pMatch[2], 10) : 1
    const gradeLevel = `p${gradeNum}` as "p1" | "p2" | "p3" | "p4" | "p5" | "p6"
    const thaiName =
      secNum > 1
        ? `ประถมศึกษาปีที่ ${gradeNum}/${secNum}`
        : `ประถมศึกษาปีที่ ${gradeNum}`
    return { gradeLevel, section: isNaN(secNum) ? 1 : secNum, thaiName }
  }

  // 3. Secondary: ม.1-6, มัธยมศึกษาปีที่ 1-6, m1-6
  const mMatch = trimmed.match(
    /(?:มัธยม(?:ศึกษา)?(?:ปีที่)?|ม\.?|m)\s*([1-6])(?:\s*[\/|\-]\s*(\d+))?/i,
  )
  if (mMatch) {
    const gradeNum = mMatch[1]
    const secNum = mMatch[2] ? parseInt(mMatch[2], 10) : 1
    const gradeLevel = `m${gradeNum}` as "m1" | "m2" | "m3" | "m4" | "m5" | "m6"
    const thaiName =
      secNum > 1
        ? `มัธยมศึกษาปีที่ ${gradeNum}/${secNum}`
        : `มัธยมศึกษาปีที่ ${gradeNum}`
    return { gradeLevel, section: isNaN(secNum) ? 1 : secNum, thaiName }
  }

  return null
}

// ----------------------------------------------------------------------------
// Thai Full Name Splitting Helper
// ----------------------------------------------------------------------------
export function splitThaiFullName(fullName: string): {
  prefix: string | null
  firstName: string
  lastName: string
  inferredGender: "male" | "female" | null
} {
  let raw = (fullName || "").trim()
  let prefix: string | null = null
  let inferredGender: "male" | "female" | null = null

  const KNOWN_PREFIXES = [
    "เด็กชาย",
    "เด็กหญิง",
    "ด.ช.",
    "ด.ญ.",
    "นางสาว",
    "น.ส.",
    "นาย",
    "นาง",
  ]

  for (const p of KNOWN_PREFIXES) {
    if (raw.startsWith(p)) {
      prefix = p
      raw = raw.slice(p.length).trim()
      if (["เด็กชาย", "ด.ช.", "นาย"].includes(p)) inferredGender = "male"
      if (["เด็กหญิง", "ด.ญ.", "นางสาว", "น.ส.", "นาง"].includes(p)) inferredGender = "female"
      break
    }
  }

  const parts = raw.split(/\s+/).filter(Boolean)
  let firstName = ""
  let lastName = ""

  if (parts.length === 1) {
    firstName = parts[0]
    lastName = "-"
  } else if (parts.length === 2) {
    firstName = parts[0]
    lastName = parts[1]
  } else if (parts.length > 2) {
    firstName = parts.slice(0, -1).join(" ")
    lastName = parts[parts.length - 1]
  }

  return { prefix, firstName, lastName, inferredGender }
}

// ----------------------------------------------------------------------------
// Excel Sheet Names Inspector
// ----------------------------------------------------------------------------
export async function getExcelSheetNames(
  buffer: Buffer | ArrayBuffer | Uint8Array,
): Promise<string[]> {
  const nodeBuf = Buffer.isBuffer(buffer)
    ? buffer
    : Buffer.from(buffer instanceof ArrayBuffer ? buffer : buffer.buffer)

  if (
    nodeBuf.length < 4 ||
    nodeBuf[0] !== 0x50 ||
    nodeBuf[1] !== 0x4b ||
    nodeBuf[2] !== 0x03 ||
    nodeBuf[3] !== 0x04
  ) {
    return []
  }

  try {
    const sheets = await readXlsxFile(nodeBuf)
    if (!sheets || !Array.isArray(sheets)) return []
    if (
      sheets.length > 0 &&
      typeof sheets[0] === "object" &&
      sheets[0] !== null &&
      "sheet" in sheets[0]
    ) {
      return (sheets as unknown as { sheet: string }[]).map((s) => s.sheet)
    }
    return ["Sheet1"]
  } catch {
    return []
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
export type ParsedFileTable = string[][] & {
  availableSheets: string[]
  selectedSheet: string
}

// ----------------------------------------------------------------------------
// XLSX Parser using read-excel-file (Multi-Sheet Support)
// ----------------------------------------------------------------------------
export async function parseXlsxContent(
  buffer: Buffer | ArrayBuffer | Uint8Array,
  sheetOption?: string | number,
): Promise<ParsedFileTable> {
  const nodeBuf = Buffer.isBuffer(buffer)
    ? buffer
    : Buffer.from(buffer instanceof ArrayBuffer ? buffer : buffer.buffer)

  // Verify ZIP magic bytes PK\x03\x04
  if (
    nodeBuf.length < 4 ||
    nodeBuf[0] !== 0x50 ||
    nodeBuf[1] !== 0x4b ||
    nodeBuf[2] !== 0x03 ||
    nodeBuf[3] !== 0x04
  ) {
    throw new Error("ไฟล์ XLSX ไม่ถูกต้อง หรือไม่ใช่ไฟล์สเปรดชีตที่รองรับ")
  }

  try {
    const sheets = await readXlsxFile(nodeBuf)
    if (!sheets || !Array.isArray(sheets) || sheets.length === 0) {
      const empty = [] as unknown as ParsedFileTable
      empty.availableSheets = []
      empty.selectedSheet = ""
      return empty
    }

    let availableSheets: string[] = []
    let selectedSheet = "Sheet1"
    let rawRows: unknown[][] = []

    if (
      sheets.length > 0 &&
      typeof sheets[0] === "object" &&
      sheets[0] !== null &&
      "sheet" in sheets[0]
    ) {
      const typedSheets = sheets as unknown as { sheet: string; data?: unknown[][] }[]
      availableSheets = typedSheets.map((s) => s.sheet)

      let targetSheetObj = typedSheets[0]
      if (sheetOption !== undefined && sheetOption !== null) {
        if (typeof sheetOption === "number") {
          if (sheetOption >= 0 && sheetOption < typedSheets.length) {
            targetSheetObj = typedSheets[sheetOption]
          }
        } else if (typeof sheetOption === "string") {
          const cleanOpt = sheetOption.trim().toLowerCase()
          const found = typedSheets.find(
            (s) => s.sheet.trim().toLowerCase() === cleanOpt,
          )
          if (found) targetSheetObj = found
        }
      }
      selectedSheet = targetSheetObj.sheet
      rawRows = targetSheetObj.data ?? []
    } else {
      availableSheets = ["Sheet1"]
      rawRows = sheets as unknown as unknown[][]
    }

    const formattedRows = rawRows.map((row) =>
      (Array.isArray(row) ? row : []).map((cell) => {
        if (cell === null || cell === undefined) return ""
        if (cell instanceof Date) {
          const y = cell.getFullYear()
          const m = String(cell.getMonth() + 1).padStart(2, "0")
          const d = String(cell.getDate()).padStart(2, "0")
          return `${y}-${m}-${d}`
        }
        return String(cell).trim()
      }),
    ) as ParsedFileTable

    formattedRows.availableSheets = availableSheets
    formattedRows.selectedSheet = selectedSheet

    return formattedRows
  } catch (err) {
    const msg = err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการอ่านไฟล์ XLSX"
    throw new Error(`ไฟล์ XLSX ไม่ถูกต้อง หรือข้อมูลเสียหาย: ${msg}`)
  }
}

// ----------------------------------------------------------------------------
// Master File-to-Table Dispatcher (Handles CSV & XLSX)
// ----------------------------------------------------------------------------
export async function parseFileContent(
  fileData: string | Buffer | ArrayBuffer | Uint8Array,
  fileName: string,
  sheetOption?: string | number,
): Promise<ParsedFileTable> {
  const ext = fileName.split(".").pop()?.toLowerCase() ?? ""

  if (ext === "xlsx") {
    const buf =
      typeof fileData === "string"
        ? Buffer.from(fileData, "binary")
        : Buffer.isBuffer(fileData)
          ? fileData
          : Buffer.from(fileData instanceof ArrayBuffer ? fileData : fileData.buffer)
    return parseXlsxContent(buf, sheetOption)
  }

  if (ext !== "csv") {
    throw new Error("รองรับเฉพาะไฟล์ CSV และ XLSX")
  }

  // Treat as UTF-8 CSV text.
  const textContent =
    typeof fileData === "string"
      ? fileData
      : Buffer.from(
          fileData instanceof ArrayBuffer ? fileData : fileData.buffer,
        ).toString("utf8")
  const rows = parseCsvContent(textContent) as ParsedFileTable
  rows.availableSheets = ["CSV"]
  rows.selectedSheet = "CSV"
  return rows
}

// ----------------------------------------------------------------------------
// Header Mapping
// ----------------------------------------------------------------------------
const HEADER_MAP: Record<string, keyof ParsedStudentRow | "fullName" | "classroomName"> = {
  // ห้องเรียน / ชั้นเรียน
  ห้อง: "classroomName",
  ชั้น: "classroomName",
  ระดับชั้น: "classroomName",
  ห้องเรียน: "classroomName",
  ชั้นเรียน: "classroomName",
  class: "classroomName",
  classroom: "classroomName",
  room: "classroomName",

  // รหัสนักเรียน
  รหัสนักเรียน: "studentCode",
  เลขประจำตัวนักเรียน: "studentCode",
  เลขประจำตัว: "studentCode",
  รหัสประจำตัว: "studentCode",
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

  // ชื่อ-นามสกุล รวมกัน (Composite Name)
  "ชื่อ-สกุล": "fullName",
  "ชื่อ-นามสกุล": "fullName",
  "ชื่อ - สกุล": "fullName",
  "ชื่อ_สกุล": "fullName",
  "ชื่อสกุล": "fullName",
  "ชื่อและนามสกุล": "fullName",
  fullname: "fullName",
  full_name: "fullName",

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
  ลำดับ: "studentNumber",
  ที่: "studentNumber",
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

    return normalizeCalendarDate(year, Number(month), Number(day))
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

    return normalizeCalendarDate(year, Number(month), Number(day))
  }

  // Excel serial date number
  const serialNumber = Number(rawDate)
  if (!isNaN(serialNumber) && serialNumber > 20000 && serialNumber < 60000) {
    const dateObj = new Date((serialNumber - (25567 + 2)) * 86400 * 1000)
    const y = dateObj.getFullYear()
    const m = String(dateObj.getMonth() + 1).padStart(2, "0")
    const d = String(dateObj.getDate()).padStart(2, "0")
    return normalizeCalendarDate(y, Number(m), Number(d))
  }

  return null
}

function normalizeCalendarDate(year: number, month: number, day: number): string | null {
  if (year < 1900 || month < 1 || month > 12 || day < 1 || day > 31) return null

  const value = new Date(Date.UTC(year, month - 1, day))
  if (
    value.getUTCFullYear() !== year ||
    value.getUTCMonth() !== month - 1 ||
    value.getUTCDate() !== day ||
    value.getTime() > Date.now()
  ) {
    return null
  }

  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`
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
// ----------------------------------------------------------------------------
// Master Row Parser & Validator
// ----------------------------------------------------------------------------
export async function parseAndValidateStudentRows(
  input: string | string[][] | Buffer | ArrayBuffer | Uint8Array,
  fileName = "data.csv",
  options?: {
    sheet?: string | number
    skipInFileDuplicates?: boolean
    autoGenerateMissingCode?: boolean
  },
): Promise<ParseImportResult> {
  let table: string[][]
  let availableSheets: string[] = []
  let selectedSheet = ""

  try {
    if (Array.isArray(input)) {
      table = input as string[][]
    } else {
      const parsed = await parseFileContent(input, fileName, options?.sheet)
      table = parsed
      availableSheets = parsed.availableSheets || []
      selectedSheet = parsed.selectedSheet || ""
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : "ไม่สามารถอ่านไฟล์ได้"
    return {
      validRows: [],
      invalidRows: [
        {
          rowNumber: 1,
          errors: [msg],
        },
      ],
      totalRows: 0,
      summary: { validCount: 0, invalidCount: 1 },
      availableSheets: [],
      selectedSheet: "",
    }
  }

  if (table.length < 2) {
    return {
      validRows: [],
      invalidRows: [
        {
          rowNumber: 1,
          errors: [
            "ไม่พบข้อมูลในไฟล์ หรือไฟล์ไม่มีแถวข้อมูล (ต้องมีหัวตารางและข้อมูลอย่างน้อย 1 แถว)",
          ],
        },
      ],
      totalRows: 0,
      summary: { validCount: 0, invalidCount: 1 },
      availableSheets,
      selectedSheet,
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
      availableSheets,
      selectedSheet,
    }
  }

  const rawHeaders = table[0]
  const headerMap: Record<number, keyof ParsedStudentRow | "fullName"> = {}

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
  if (!mappedProps.includes("studentCode")) {
    missingHeaders.push("รหัสนักเรียน (student_code หรือ เลขประจำตัว)")
  }

  const hasSeparateNames = mappedProps.includes("firstName") && mappedProps.includes("lastName")
  const hasFullName = mappedProps.includes("fullName")
  if (!hasSeparateNames && !hasFullName) {
    missingHeaders.push("ชื่อและนามสกุล (first_name, last_name หรือ ชื่อ-สกุล)")
  }

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
      availableSheets,
      selectedSheet,
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

    const rowObj: Record<string, unknown> = { rowNumber }

    row.forEach((cellVal, colIndex) => {
      const propName = headerMap[colIndex]
      if (!propName) return

      const cleanVal = cellVal.trim()
      if (cleanVal.length === 0) return

      if (propName === "studentNumber") {
        const cleanNum = cleanVal.replace(/\D/g, "")
        const num = parseInt(cleanNum, 10)
        if (!isNaN(num)) rowObj.studentNumber = num
      } else {
        rowObj[propName] = cleanVal
      }
    })

    // Skip empty or numbering-only rows (e.g. "13.", null, null, null)
    const hasIdentifyingData = Boolean(
      rowObj.studentCode ||
      rowObj.firstName ||
      rowObj.lastName ||
      rowObj.fullName ||
      rowObj.nationalId
    )
    if (!hasIdentifyingData) {
      continue
    }

    // Auto-split fullName if present
    if (rowObj.fullName) {
      const split = splitThaiFullName(String(rowObj.fullName))
      if (!rowObj.prefix && split.prefix) rowObj.prefix = split.prefix
      if (!rowObj.firstName) rowObj.firstName = split.firstName
      if (!rowObj.lastName) rowObj.lastName = split.lastName
      if (!rowObj.gender && split.inferredGender) rowObj.gender = split.inferredGender
    }

    // Extract prefix from firstName if attached (e.g. "ด.ช.สมชาย")
    if (rowObj.firstName && !rowObj.prefix) {
      const split = splitThaiFullName(String(rowObj.firstName))
      if (split.prefix) {
        rowObj.prefix = split.prefix
        rowObj.firstName = split.firstName
        if (!rowObj.gender && split.inferredGender) rowObj.gender = split.inferredGender
      }
    }

    // Validation 1: Student Code
    if (!rowObj.studentCode) {
      if (options?.autoGenerateMissingCode) {
        let candidate = `AUTO${String(rowNumber).padStart(4, "0")}`
        let counter = 1
        while (seenStudentCodes.has(candidate)) {
          candidate = `AUTO${String(rowNumber).padStart(4, "0")}_${counter++}`
        }
        seenStudentCodes.add(candidate)
        rowObj.studentCode = candidate
      } else {
        rowErrors.push("จำเป็นต้องระบุรหัสนักเรียน (เลขประจำตัว)")
      }
    } else {
      const sCode = String(rowObj.studentCode).trim()
      if (seenStudentCodes.has(sCode)) {
        if (options?.skipInFileDuplicates) {
          continue
        } else {
          rowErrors.push(`รหัสนักเรียน '${sCode}' ซ้ำกับแถวอื่นในไฟล์นี้`)
        }
      } else {
        seenStudentCodes.add(sCode)
      }
      rowObj.studentCode = sCode
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
      const cleanId = String(rowObj.nationalId).replace(/[\s\-]/g, "")
      if (!/^\d{13}$/.test(cleanId)) {
        rowErrors.push(`เลขประจำตัวประชาชนต้องเป็นตัวเลข 13 หลัก (ปัจจุบันมี ${cleanId.length} หลัก)`)
      } else {
        if (seenNationalIds.has(cleanId)) {
          if (options?.skipInFileDuplicates) {
            continue
          } else {
            rowErrors.push(`เลขประจำตัวประชาชน '${cleanId}' ซ้ำกับแถวอื่นในไฟล์นี้`)
          }
        } else {
          seenNationalIds.add(cleanId)
        }
        rowObj.nationalId = cleanId
      }
    }

    // Validation 4: Date of Birth (Optional if not present, but if present must be valid)
    const rawDob = rowObj.dateOfBirth as string | undefined
    if (rawDob) {
      const normalizedDob = normalizeDateOfBirth(rawDob)
      if (!normalizedDob) {
        rowErrors.push("รูปแบบวันเกิดไม่ถูกต้อง (รองรับ วัน/เดือน/ปี หรือ ปี-เดือน-วัน)")
      } else {
        rowObj.dateOfBirth = normalizedDob
      }
    } else {
      rowObj.dateOfBirth = null
    }

    // Validation 5: Gender
    const rawGender = rowObj.gender as string | undefined
    rowObj.gender = normalizeGender(rawGender ?? "", rowObj.prefix as string | undefined)

    // Validation 6: Guardian info
    if (rowObj.guardianFirstName) {
      rowObj.guardianRelation = normalizeGuardianRelation(
        rowObj.guardianRelation as string | undefined,
      )
    }

    delete rowObj.fullName

    if (rowErrors.length > 0) {
      invalidRows.push({
        rowNumber,
        studentCode: rowObj.studentCode as string | undefined,
        studentName:
          `${rowObj.firstName ?? ""} ${rowObj.lastName ?? ""}`.trim() || undefined,
        errors: rowErrors,
      })
    } else {
      validRows.push(rowObj as unknown as ParsedStudentRow)
    }
  }

  const processedCount = validRows.length + invalidRows.length
  return {
    validRows,
    invalidRows,
    totalRows: processedCount,
    summary: {
      validCount: validRows.length,
      invalidCount: invalidRows.length,
    },
    availableSheets,
    selectedSheet,
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
    ...SAMPLE_TEMPLATE_ROWS.map((r) =>
      r.map((c) => `"${c.replace(/"/g, '""')}"`).join(","),
    ),
  ]
  return bom + lines.join("\r\n")
}

export async function generateStudentImportTemplateXlsx(): Promise<Buffer> {
  const headerRow = SAMPLE_TEMPLATE_HEADERS.map((h) => ({
    value: h,
    fontWeight: "bold" as const,
    backgroundColor: "#F1F5F9",
  }))

  const dataRows = SAMPLE_TEMPLATE_ROWS.map((row) =>
    row.map((cell) => ({
      value: cell,
    })),
  )

  const rows = [headerRow, ...dataRows]
  const columns = SAMPLE_TEMPLATE_HEADERS.map((h) => ({
    width: Math.max(h.length * 2, 16),
  }))

  const res = await writeXlsxFile(rows, { columns })
  return await res.toBuffer()
}

// ----------------------------------------------------------------------------
// Multi-Group Parser & Dispatcher (Sheets & Classrooms)
// ----------------------------------------------------------------------------
export async function parseAndValidateAllGroups(
  input: string | Buffer | ArrayBuffer | Uint8Array,
  fileName = "data.csv",
  options?: {
    skipInFileDuplicates?: boolean
    autoGenerateMissingCode?: boolean
  },
): Promise<MultiGroupParseResult> {
  const ext = fileName.split(".").pop()?.toLowerCase() ?? ""
  const isXlsx = ext === "xlsx"

  // 1. If XLSX, check if there are multiple sheets
  if (isXlsx) {
    const sheetNames = await getExcelSheetNames(
      typeof input === "string" ? Buffer.from(input) : input,
    )

    if (sheetNames.length > 1) {
      const groups: ParsedStudentGroup[] = []
      let allValid = 0
      let allInvalid = 0
      let allTotal = 0

      for (let i = 0; i < sheetNames.length; i++) {
        const sheetName = sheetNames[i]
        const res = await parseAndValidateStudentRows(input, fileName, {
          sheet: sheetName,
          skipInFileDuplicates: options?.skipInFileDuplicates,
          autoGenerateMissingCode: options?.autoGenerateMissingCode,
        })

        // Skip sheets that have no data at all (e.g. blank trailing sheets)
        if (
          res.totalRows === 0 &&
          res.invalidRows.length === 1 &&
          res.invalidRows[0].errors[0]?.includes("ไม่พบข้อมูลในไฟล์")
        ) {
          continue
        }

        const inferred = inferGradeAndSection(sheetName)
        groups.push({
          groupId: `sheet_${i}_${encodeURIComponent(sheetName)}`,
          groupName: sheetName,
          sourceType: "sheet",
          validRows: res.validRows,
          invalidRows: res.invalidRows,
          totalRows: res.totalRows,
          inferred,
        })

        allValid += res.validRows.length
        allInvalid += res.invalidRows.length
        allTotal += res.totalRows
      }

      if (groups.length > 0) {
        return {
          isMultiGroup: groups.length > 1,
          groups,
          allValidCount: allValid,
          allInvalidCount: allInvalid,
          allTotalCount: allTotal,
          availableSheets: sheetNames,
        }
      }
    }
  }

  // 2. Single-sheet XLSX or CSV: Parse entire content into table first
  const parsedTable = await parseFileContent(input, fileName)
  if (parsedTable.length < 2) {
    const singleRes = await parseAndValidateStudentRows(input, fileName, options)
    return {
      isMultiGroup: false,
      groups: [
        {
          groupId: "default",
          groupName: fileName.replace(/\.[^/.]+$/, "") || "รายชื่อนักเรียน",
          sourceType: "file",
          validRows: singleRes.validRows,
          invalidRows: singleRes.invalidRows,
          totalRows: singleRes.totalRows,
          inferred: inferGradeAndSection(fileName),
        },
      ],
      allValidCount: singleRes.validRows.length,
      allInvalidCount: singleRes.invalidRows.length,
      allTotalCount: singleRes.totalRows,
      availableSheets: parsedTable.availableSheets || [],
    }
  }

  // 3. Inspect headers for classroom column
  const headerRow = parsedTable[0]
  let classroomColIdx = -1
  headerRow.forEach((h, idx) => {
    const norm = normalizeHeaderKey(h)
    for (const [key, val] of Object.entries(HEADER_MAP)) {
      if (val === "classroomName" && normalizeHeaderKey(key) === norm) {
        classroomColIdx = idx
        break
      }
    }
  })

  if (classroomColIdx !== -1) {
    const dataRows = parsedTable.slice(1)
    const classroomMap = new Map<string, string[][]>()

    for (const row of dataRows) {
      const roomVal = (row[classroomColIdx] || "").trim()
      const roomKey = roomVal || "ไม่ระบุห้อง"
      if (!classroomMap.has(roomKey)) {
        classroomMap.set(roomKey, [])
      }
      classroomMap.get(roomKey)!.push(row)
    }

    if (classroomMap.size > 1) {
      const groups: ParsedStudentGroup[] = []
      let allValid = 0
      let allInvalid = 0
      let allTotal = 0
      let idx = 0

      for (const [roomName, roomRows] of classroomMap.entries()) {
        const subTable = [headerRow, ...roomRows]
        const res = await parseAndValidateStudentRows(subTable, fileName, options)

        const inferred = roomName !== "ไม่ระบุห้อง" ? inferGradeAndSection(roomName) : null
        groups.push({
          groupId: `col_${idx++}_${encodeURIComponent(roomName)}`,
          groupName: roomName,
          sourceType: "column",
          validRows: res.validRows,
          invalidRows: res.invalidRows,
          totalRows: res.totalRows,
          inferred,
        })

        allValid += res.validRows.length
        allInvalid += res.invalidRows.length
        allTotal += res.totalRows
      }

      return {
        isMultiGroup: true,
        groups,
        allValidCount: allValid,
        allInvalidCount: allInvalid,
        allTotalCount: allTotal,
        availableSheets: parsedTable.availableSheets || [],
      }
    }
  }

  // 4. Default: Single group
  const singleRes = await parseAndValidateStudentRows(input, fileName, options)
  const defaultGroupName =
    parsedTable.selectedSheet && parsedTable.selectedSheet !== "Sheet1"
      ? parsedTable.selectedSheet
      : fileName.replace(/\.[^/.]+$/, "") || "รายชื่อนักเรียน"

  return {
    isMultiGroup: false,
    groups: [
      {
        groupId: "default",
        groupName: defaultGroupName,
        sourceType: parsedTable.selectedSheet ? "sheet" : "file",
        validRows: singleRes.validRows,
        invalidRows: singleRes.invalidRows,
        totalRows: singleRes.totalRows,
        inferred: inferGradeAndSection(defaultGroupName),
      },
    ],
    allValidCount: singleRes.validRows.length,
    allInvalidCount: singleRes.invalidRows.length,
    allTotalCount: singleRes.totalRows,
    availableSheets: parsedTable.availableSheets || [],
  }
}

