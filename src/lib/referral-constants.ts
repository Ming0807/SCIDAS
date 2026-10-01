/**
 * Referral constants, agency directory presets, and SLA calculation utilities (E6).
 */

export interface AgencyDirectoryEntry {
  id: string
  name: string
  type: "internal" | "external"
  category: "counseling" | "medical" | "mental_health" | "social_welfare" | "security" | "academic"
  description: string
  hotline?: string
  operatingHours?: string
  suggestedDimensions: ("emotional" | "behavioral" | "health" | "academic" | "family" | "financial" | "social")[]
}

export const REFERRAL_AGENCY_DIRECTORY: AgencyDirectoryEntry[] = [
  // Internal agencies
  {
    id: "int-counseling",
    name: "งานแนะแนว / ห้องแนะแนวโรงเรียน",
    type: "internal",
    category: "counseling",
    description: "ให้คำปรึกษาเชิงจิตวิทยาเบื้องต้น ประเมินแบบคัดกรอง SDQ และส่งเสริมการปรับตัว",
    operatingHours: "วันและเวลาราชการ (08:00 - 16:30 น.)",
    suggestedDimensions: ["emotional", "behavioral", "academic", "social"],
  },
  {
    id: "int-discipline",
    name: "ฝ่ายกิจการนักเรียน / ฝ่ายปกครอง",
    type: "internal",
    category: "security",
    description: "ดูแลระเบียบวินัย ป้องกันสารเสพติด การทะเลาะวิวาท และประสานงานผู้ปกครอง",
    operatingHours: "วันและเวลาราชการ (08:00 - 16:30 น.)",
    suggestedDimensions: ["behavioral", "social"],
  },
  {
    id: "int-nursing",
    name: "ห้องพยาบาล / ครูพยาบาล",
    type: "internal",
    category: "medical",
    description: "ปฐมพยาบาลเบื้องต้น บันทึกโรคประจำตัว และส่งต่อสถานพยาบาลเมื่อเกิดเหตุฉุกเฉิน",
    operatingHours: "วันทำการตลอดเวลาเรียน",
    suggestedDimensions: ["health"],
  },
  {
    id: "int-academic",
    name: "ฝ่ายวิชาการ / หัวหน้าสายชั้น",
    type: "internal",
    category: "academic",
    description: "วางแผนปรับการเรียนการสอนเฉพาะบุคคล (IDP) สอนเสริม และแก้ปัญหาผลการเรียน",
    operatingHours: "วันและเวลาราชการ",
    suggestedDimensions: ["academic"],
  },

  // External agencies
  {
    id: "ext-mental-hotline",
    name: "สายด่วนสุขภาพจิต 1323 (กรมสุขภาพจิต)",
    type: "external",
    category: "mental_health",
    description: "บริการปรึกษาปัญหาสุขภาพจิต ภาวะเครียด ซึมเศร้า วิตกกังวล โดยผู้เชี่ยวชาญ",
    hotline: "1323",
    operatingHours: "โทรฟรี 24 ชั่วโมง",
    suggestedDimensions: ["emotional", "behavioral"],
  },
  {
    id: "ext-social-hotline",
    name: "ศูนย์ช่วยเหลือสังคม 1300 (กระทรวง พม.)",
    type: "external",
    category: "social_welfare",
    description: "ช่วยเหลือเด็กถูกกระทำรุนแรง ทอดทิ้ง ปัญหาครอบครัว และสวัสดิการคุ้มครองเด็ก",
    hotline: "1300",
    operatingHours: "โทรฟรี 24 ชั่วโมง",
    suggestedDimensions: ["family", "financial", "social"],
  },
  {
    id: "ext-subdistrict-hospital",
    name: "โรงพยาบาลส่งเสริมสุขภาพตำบล (รพ.สต.)",
    type: "external",
    category: "medical",
    description: "สถานบริการสาธารณสุขปฐมภูมิใกล้โรงเรียน ตรวจสุขภาพ ตรวจสายตา และอนามัยชุมชน",
    operatingHours: "08:30 - 16:30 น. (และคลินิกนอกเวลา)",
    suggestedDimensions: ["health"],
  },
  {
    id: "ext-community-hospital",
    name: "โรงพยาบาลชุมชน / โรงพยาบาลประจำอำเภอ",
    type: "external",
    category: "medical",
    description: "ตรวจรักษาโรคกายและจิตเวชเบื้องต้น มีแพทย์เวชปฏิบัติและนักจิตวิทยาคลินิก",
    operatingHours: "แผนกผู้ป่วยนอก 08:30 - 16:30 น. / ฉุกเฉิน 24 ชม.",
    suggestedDimensions: ["health", "emotional"],
  },
  {
    id: "ext-child-mental-health",
    name: "สถาบันสุขภาพจิตเด็กและวัยรุ่น / รพ.จิตเวช",
    type: "external",
    category: "mental_health",
    description: "ประเมินและบำบัดรักษาจิตเวชเด็กและวัยรุ่น สมาธิสั้น ออทิสติก ภาวะซึมเศร้า และการทำร้ายตัวเอง",
    operatingHours: "วันและเวลาราชการ",
    suggestedDimensions: ["emotional", "behavioral"],
  },
  {
    id: "ext-child-shelter",
    name: "บ้านพักเด็กและครอบครัวประจำจังหวัด",
    type: "external",
    category: "social_welfare",
    description: "ที่พักพิงชั่วคราวและคุ้มครองสวัสดิภาพเด็กในภาวะวิกฤตความรุนแรงหรือไร้ที่พึ่ง",
    operatingHours: "พร้อมรับประสานงาน 24 ชั่วโมง",
    suggestedDimensions: ["family", "social"],
  },
  {
    id: "ext-provincial-social-dev",
    name: "สำนักงานพัฒนาสังคมและความมั่นคงของมนุษย์ (พมจ.)",
    type: "external",
    category: "social_welfare",
    description: "สงเคราะห์ครอบครัวผู้มีรายได้น้อย ทุนการศึกษาเด็กยากจนพิเศษ และเงินอุดหนุนเด็ก",
    operatingHours: "วันและเวลาราชการ (08:30 - 16:30 น.)",
    suggestedDimensions: ["financial", "family"],
  },
]

export interface ReferralSlaResult {
  status: "resolved" | "on_track" | "warning" | "overdue"
  label: string
  tone: "neutral" | "normal" | "watch" | "critical"
  isOverdue: boolean
  elapsedDays: number
  slaTargetDays: number
  targetDescription: string
}

/**
 * Calculate SLA progress for a referral case.
 *
 * SLA Standards:
 * - Critical: 2 days (48 hours)
 * - High: 7 days (1 week)
 * - Medium / Low / default: 14 days (2 weeks)
 */
export function calculateReferralSla(
  createdAt: string | Date,
  priority: string | null | undefined = "medium",
  status: string = "pending",
  now: Date = new Date(),
): ReferralSlaResult {
  const isResolved = status === "completed" || status === "cancelled"
  const createdDate = typeof createdAt === "string" ? new Date(createdAt) : createdAt
  const diffMs = now.getTime() - createdDate.getTime()
  const elapsedDays = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)))

  let slaTargetDays = 14
  let targetDescription = "เป้าหมาย 14 วัน"

  const effectivePriority = priority || "medium"
  if (effectivePriority === "critical") {
    slaTargetDays = 2
    targetDescription = "เร่งด่วนวิกฤต (เป้าหมาย 48 ชม.)"
  } else if (effectivePriority === "high") {
    slaTargetDays = 7
    targetDescription = "เร่งด่วนสูง (เป้าหมาย 7 วัน)"
  }

  if (isResolved) {
    return {
      status: "resolved",
      label: `ปิดเคสแล้ว (${elapsedDays} วัน)`,
      tone: "neutral",
      isOverdue: false,
      elapsedDays,
      slaTargetDays,
      targetDescription,
    }
  }

  if (elapsedDays > slaTargetDays) {
    const overdueDays = elapsedDays - slaTargetDays
    return {
      status: "overdue",
      label: `เกิน SLA ${overdueDays} วัน (${targetDescription})`,
      tone: "critical",
      isOverdue: true,
      elapsedDays,
      slaTargetDays,
      targetDescription,
    }
  }

  const remainingDays = slaTargetDays - elapsedDays
  if (remainingDays <= 2) {
    return {
      status: "warning",
      label: remainingDays === 0 ? "ครบกำหนด SLA วันนี้" : `เหลือ SLA ${remainingDays} วัน`,
      tone: "watch",
      isOverdue: false,
      elapsedDays,
      slaTargetDays,
      targetDescription,
    }
  }

  return {
    status: "on_track",
    label: `เหลือ SLA ${remainingDays} วัน`,
    tone: "normal",
    isOverdue: false,
    elapsedDays,
    slaTargetDays,
    targetDescription,
  }
}
