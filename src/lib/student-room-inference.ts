// Client-safe room and grade inference helpers (no node/fs dependencies)

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
  subdistrict?: string | null
  district?: string | null
  province?: string | null
  postalCode?: string | null
  distanceToSchoolKm?: number | null
  travelMethod?: string | null
  familyStatus?:
    | "together"
    | "separated"
    | "single_parent"
    | "orphan"
    | "guardian"
    | "other"
    | null
  religion?: string | null
  nationality?: string | null
  ethnicity?: string | null
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
  guardianNationalId?: string | null
  guardianOccupation?: string | null
  guardianMonthlyIncome?: number | null
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
  let raw = (fullName || "")
    .replace(/\u00A0/g, " ")
    .replace(/[\r\n\t]+/g, " ")
    .trim()
  let prefix: string | null = null
  let inferredGender: "male" | "female" | null = null

  const KNOWN_PREFIXES = [
    "เด็กชาย",
    "เด็กหญิง",
    "ด.ช.",
    "ด.ญ.",
    "ด.ช ",
    "ด.ญ ",
    "ดช.",
    "ดญ.",
    "นางสาว",
    "น.ส.",
    "น.ส ",
    "นส.",
    "นาย",
    "นาง",
  ]

  for (const p of KNOWN_PREFIXES) {
    if (raw.startsWith(p)) {
      const matched = p.trim()
      if (matched === "ดช." || matched === "ด.ช") {
        prefix = "ด.ช."
      } else if (matched === "ดญ." || matched === "ด.ญ") {
        prefix = "ด.ญ."
      } else if (matched === "นส." || matched === "น.ส") {
        prefix = "น.ส."
      } else {
        prefix = matched
      }
      raw = raw.slice(p.length).trim()
      if (["เด็กชาย", "ด.ช.", "นาย"].includes(prefix)) inferredGender = "male"
      if (["เด็กหญิง", "ด.ญ.", "นางสาว", "น.ส.", "นาง"].includes(prefix)) inferredGender = "female"
      break
    }
  }

  const parts = raw.split(/\s+/).filter(Boolean)
  const firstName = parts[0] || ""
  const lastName = parts.slice(1).join(" ") || ""

  return {
    prefix,
    firstName,
    lastName,
    inferredGender,
  }
}
