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
  phone?: string | null
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
// CSV Parser (RFC 4180 Compliant with Quote Handling & Thai Support)
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
          i++ // skip next quote
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
// Header Mapping Helper
// ----------------------------------------------------------------------------
const HEADER_MAP: Record<string, keyof ParsedStudentRow> = {
  // รหัสนักเรียน
  student_code: "studentCode",
  รหัสนักเรียน: "studentCode",
  รหัสประจำตัว: "studentCode",
  เลขประจำตัว: "studentCode",
  code: "studentCode",

  // เลขบัตรประชาชน
  national_id: "nationalId",
  เลขประจำตัวประชาชน: "nationalId",
  เลขบัตรประชาชน: "nationalId",
  รหัสบัตรประชาชน: "nationalId",
  citizen_id: "nationalId",

  // คำนำหน้า
  prefix: "prefix",
  คำนำหน้า: "prefix",
  คำนำหน้านาม: "prefix",

  // ชื่อ
  first_name: "firstName",
  ชื่อ: "firstName",
  ชื่อจริง: "firstName",
  firstname: "firstName",

  // นามสกุล
  last_name: "lastName",
  นามสกุล: "lastName",
  lastname: "lastName",

  // ชื่อเล่น
  nickname: "nickname",
  ชื่อเล่น: "nickname",

  // เพศ
  gender: "gender",
  เพศ: "gender",

  // วันเกิด
  date_of_birth: "dateOfBirth",
  วันเกิด: "dateOfBirth",
  วันเดือนปีเกิด: "dateOfBirth",
  dob: "dateOfBirth",

  // กรุ๊ปเลือด
  blood_type: "bloodType",
  กรุ๊ปเลือด: "bloodType",
  หมู่เลือด: "bloodType",

  // โทรศัพท์
  phone: "phone",
  เบอร์โทร: "phone",
  เบอร์โทรศัพท์: "phone",
  โทรศัพท์: "phone",

  // ที่อยู่
  address: "address",
  ที่อยู่: "address",

  // เลขที่ในห้องเรียน
  student_number: "studentNumber",
  เลขที่: "studentNumber",
  ลำดับที่: "studentNumber",

  // ผู้ปกครอง
  guardian_prefix: "guardianPrefix",
  คำนำหน้าผู้ปกครอง: "guardianPrefix",
  guardian_first_name: "guardianFirstName",
  ชื่อผู้ปกครอง: "guardianFirstName",
  guardian_last_name: "guardianLastName",
  นามสกุลผู้ปกครอง: "guardianLastName",
  guardian_phone: "guardianPhone",
  เบอร์ผู้ปกครอง: "guardianPhone",
  เบอร์โทรผู้ปกครอง: "guardianPhone",
  guardian_relation: "guardianRelation",
  ความสัมพันธ์: "guardianRelation",
  ความสัมพันธ์ผู้ปกครอง: "guardianRelation",
}

// ----------------------------------------------------------------------------
// Normalization Helpers
// ----------------------------------------------------------------------------
function normalizeGender(raw: string): "male" | "female" | "other" | null {
  const v = raw.trim().toLowerCase()
  if (["ชาย", "ด.ช.", "เด็กชาย", "นาย", "male", "m", "1"].includes(v)) return "male"
  if (["หญิง", "ด.ญ.", "เด็กหญิง", "นางสาว", "น.ส.", "female", "f", "2"].includes(v)) return "female"
  if (["อื่นๆ", "other", "3"].includes(v)) return "other"
  return null
}

function normalizeRelation(raw: string): ParsedStudentRow["guardianRelation"] {
  const v = raw.trim().toLowerCase()
  if (["บิดา", "พ่อ", "father", "dad"].includes(v)) return "father"
  if (["มารดา", "แม่", "mother", "mom"].includes(v)) return "mother"
  if (["ปู่", "ตา", "grandfather"].includes(v)) return "grandfather"
  if (["ย่า", "ยาย", "grandmother"].includes(v)) return "grandmother"
  if (["ลุง", "uncle"].includes(v)) return "uncle"
  if (["ป้า", "น้า", "อา", "aunt"].includes(v)) return "aunt"
  if (["พี่", "น้อง", "sibling"].includes(v)) return "sibling"
  if (["ญาติ", "other_relative"].includes(v)) return "other_relative"
  return "guardian"
}

function normalizeDateOfBirth(raw: string): string | null {
  const v = raw.trim()
  if (!v) return null

  // Format 1: YYYY-MM-DD
  const isoMatch = v.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/)
  if (isoMatch) {
    let year = Number.parseInt(isoMatch[1], 10)
    const month = String(Number.parseInt(isoMatch[2], 10)).padStart(2, "0")
    const day = String(Number.parseInt(isoMatch[3], 10)).padStart(2, "0")
    // If year is in Buddhist Era (> 2400), convert to CE
    if (year > 2400) year -= 543
    return `${year}-${month}-${day}`
  }

  // Format 2: DD/MM/YYYY
  const thaiMatch = v.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/)
  if (thaiMatch) {
    const day = String(Number.parseInt(thaiMatch[1], 10)).padStart(2, "0")
    const month = String(Number.parseInt(thaiMatch[2], 10)).padStart(2, "0")
    let year = Number.parseInt(thaiMatch[3], 10)
    if (year > 2400) year -= 543
    return `${year}-${month}-${day}`
  }

  const parsed = new Date(v)
  if (!Number.isNaN(parsed.getTime())) {
    let year = parsed.getFullYear()
    if (year > 2400) year -= 543
    const month = String(parsed.getMonth() + 1).padStart(2, "0")
    const day = String(parsed.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
  }

  return null
}

// ----------------------------------------------------------------------------
// Main Validator
// ----------------------------------------------------------------------------
export function parseAndValidateStudentRows(csvString: string): ParseImportResult {
  const matrix = parseCsvContent(csvString)

  if (matrix.length < 2) {
    return {
      validRows: [],
      invalidRows: [
        {
          rowNumber: 1,
          errors: ["ไฟล์ไม่มีข้อมูล หรือไม่มีแถวหัวตาราง (Header)"],
        },
      ],
      totalRows: 0,
      summary: { validCount: 0, invalidCount: 1 },
    }
  }

  const headerRow = matrix[0]
  const mappedIndices: Record<string, number> = {}

  headerRow.forEach((colName, index) => {
    const cleanName = colName.trim().toLowerCase().replace(/\s+/g, "_")
    const mappedKey = HEADER_MAP[cleanName] || HEADER_MAP[colName.trim()]
    if (mappedKey) {
      mappedIndices[mappedKey] = index
    }
  })

  // Verify mandatory columns exist in header
  const missingHeaders: string[] = []
  if (mappedIndices.studentCode === undefined) missingHeaders.push("รหัสนักเรียน (student_code)")
  if (mappedIndices.firstName === undefined) missingHeaders.push("ชื่อ (first_name)")
  if (mappedIndices.lastName === undefined) missingHeaders.push("นามสกุล (last_name)")

  if (missingHeaders.length > 0) {
    return {
      validRows: [],
      invalidRows: [
        {
          rowNumber: 1,
          errors: [`ไม่พบคอลัมน์บังคับในไฟล์: ${missingHeaders.join(", ")}`],
        },
      ],
      totalRows: matrix.length - 1,
      summary: { validCount: 0, invalidCount: 1 },
    }
  }

  const validRows: ParsedStudentRow[] = []
  const invalidRows: RowValidationError[] = []

  const seenStudentCodes = new Set<string>()
  const seenNationalIds = new Set<string>()

  for (let r = 1; r < matrix.length; r++) {
    const row = matrix[r]
    const rowNum = r + 1 // 1-indexed Excel row number
    const errors: string[] = []

    const getVal = (key: string): string => {
      const idx = mappedIndices[key]
      return idx !== undefined && row[idx] ? row[idx].trim() : ""
    }

    const studentCode = getVal("studentCode")
    const firstName = getVal("firstName")
    const lastName = getVal("lastName")
    const rawNationalId = getVal("nationalId").replace(/[- ]/g, "")
    const rawGender = getVal("gender")
    const rawDob = getVal("dateOfBirth")
    const rawStudentNumber = getVal("studentNumber")

    // Check required fields
    if (!studentCode) {
      errors.push("ไม่พบรหัสนักเรียน")
    } else if (seenStudentCodes.has(studentCode)) {
      errors.push(`รหัสนักเรียน '${studentCode}' ซ้ำกับแถวอื่นในไฟล์`)
    } else {
      seenStudentCodes.add(studentCode)
    }

    if (!firstName) errors.push("ไม่พบชื่อนักเรียน")
    if (!lastName) errors.push("ไม่พบนามสกุลนักเรียน")

    // National ID validation
    let nationalId: string | null = null
    if (rawNationalId) {
      if (!/^\d{13}$/.test(rawNationalId)) {
        errors.push(`เลขประจำตัวประชาชน '${rawNationalId}' ต้องเป็นตัวเลข 13 หลัก`)
      } else if (seenNationalIds.has(rawNationalId)) {
        errors.push(`เลขประจำตัวประชาชน '${rawNationalId}' ซ้ำกับแถวอื่นในไฟล์`)
      } else {
        seenNationalIds.add(rawNationalId)
        nationalId = rawNationalId
      }
    }

    // Gender validation
    const gender = normalizeGender(rawGender || getVal("prefix"))
    if (!gender) {
      errors.push(`เพศ '${rawGender}' ไม่ถูกต้อง (ระบุ: ชาย / หญิง / อื่นๆ)`)
    }

    // DOB validation
    const dateOfBirth = normalizeDateOfBirth(rawDob)
    if (!dateOfBirth) {
      errors.push(`วันเกิด '${rawDob}' รูปแบบไม่ถูกต้อง (ตัวอย่าง: 2012-05-15 หรือ 15/05/2555)`)
    }

    let studentNumber: number | null = null
    if (rawStudentNumber) {
      const num = Number.parseInt(rawStudentNumber, 10)
      if (!Number.isNaN(num) && num > 0) {
        studentNumber = num
      }
    }

    if (errors.length > 0) {
      invalidRows.push({
        rowNumber: rowNum,
        studentCode: studentCode || "-",
        studentName: `${firstName} ${lastName}`.trim() || "-",
        errors,
      })
    } else {
      validRows.push({
        rowNumber: rowNum,
        studentCode,
        nationalId,
        prefix: getVal("prefix") || null,
        firstName,
        lastName,
        nickname: getVal("nickname") || null,
        gender: gender || "male",
        dateOfBirth: dateOfBirth || "2015-01-01",
        bloodType: getVal("bloodType") || null,
        phone: getVal("phone") || null,
        address: getVal("address") || null,
        studentNumber,
        guardianPrefix: getVal("guardianPrefix") || null,
        guardianFirstName: getVal("guardianFirstName") || null,
        guardianLastName: getVal("guardianLastName") || null,
        guardianPhone: getVal("guardianPhone") || null,
        guardianRelation: getVal("guardianRelation")
          ? normalizeRelation(getVal("guardianRelation"))
          : null,
      })
    }
  }

  return {
    validRows,
    invalidRows,
    totalRows: matrix.length - 1,
    summary: {
      validCount: validRows.length,
      invalidCount: invalidRows.length,
    },
  }
}

// ----------------------------------------------------------------------------
// CSV Template Generator
// ----------------------------------------------------------------------------
export function generateStudentImportTemplateCsv(): string {
  const headers = [
    "รหัสนักเรียน",
    "เลขประจำตัวประชาชน",
    "คำนำหน้า",
    "ชื่อ",
    "นามสกุล",
    "ชื่อเล่น",
    "เพศ",
    "วันเกิด",
    "กรุ๊ปเลือด",
    "เบอร์โทร",
    "ที่อยู่",
    "เลขที่",
    "คำนำหน้าผู้ปกครอง",
    "ชื่อผู้ปกครอง",
    "นามสกุลผู้ปกครอง",
    "เบอร์ผู้ปกครอง",
    "ความสัมพันธ์",
  ]

  const sampleRows = [
    [
      "STD1001",
      "1100500123456",
      "เด็กชาย",
      "กิตติพงษ์",
      "ใจดี",
      "กอล์ฟ",
      "ชาย",
      "15/05/2556",
      "O",
      "0812345678",
      "123 หมู่ 1 ต.หนองแค",
      "1",
      "นาย",
      "สมศักดิ์",
      "ใจดี",
      "0891234567",
      "บิดา",
    ],
    [
      "STD1002",
      "1100500654321",
      "เด็กหญิง",
      "พัชราภา",
      "สดใส",
      "พลอย",
      "หญิง",
      "22/08/2556",
      "A",
      "0823456789",
      "45/2 หมู่ 3 ต.หนองแค",
      "2",
      "นาง",
      "รัตนา",
      "สดใส",
      "0867891234",
      "มารดา",
    ],
  ]

  const bom = "\uFEFF"
  const csvContent = [
    headers.join(","),
    ...sampleRows.map((r) => r.map((f) => `"${f.replace(/"/g, '""')}"`).join(",")),
  ].join("\r\n")

  return bom + csvContent
}
