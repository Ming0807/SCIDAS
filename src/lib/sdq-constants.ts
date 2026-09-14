export type SdqDimension =
  | "emotional"
  | "conduct"
  | "hyperactivity"
  | "peer"
  | "prosocial"

export type SdqEvaluatorType = "teacher" | "student" | "parent"

export interface SdqQuestion {
  id: number
  text: string
  dimension: SdqDimension
  isReversed?: boolean
}

export const SDQ_DIMENSIONS: Record<
  SdqDimension,
  { label: string; description: string }
> = {
  emotional: {
    label: "ด้านอารมณ์",
    description: "ความวิตกกังวล ความเศร้าหมอง และอาการทางกายจากความเครียด",
  },
  conduct: {
    label: "ด้านความประพฤติ/เกเร",
    description: "การควบคุมอารมณ์ ความก้าวร้าว และการปฏิบัติตามกฎระเบียบ",
  },
  hyperactivity: {
    label: "ด้านพฤติกรรมไม่อยู่นิ่ง/สมาธิสั้น",
    description: "สมาธิ ความอยู่ไม่สุข และการคิดก่อนทำ",
  },
  peer: {
    label: "ด้านความสัมพันธ์กับเพื่อน",
    description: "การเข้ากลุ่ม การเป็นที่ยอมรับ และการถูกรังแกจากเพื่อน",
  },
  prosocial: {
    label: "ด้านสัมพันธภาพทางสังคม",
    description: "ความมีน้ำใจ ความเอื้อเฟื้อเผื่อแผ่ และการช่วยเหลือผู้อื่น",
  },
}

export const SDQ_QUESTIONS: SdqQuestion[] = [
  { id: 1, text: "ห่วงใยความรู้สึกของคนอื่น", dimension: "prosocial" },
  { id: 2, text: "อยู่ไม่นิ่ง กระสับกระส่าย นั่งนิ่งๆ นานๆ ไม่ได้", dimension: "hyperactivity" },
  { id: 3, text: "มักจะบ่นว่าปวดศีรษะ ปวดท้อง หรือไม่สบายบ่อยๆ", dimension: "emotional" },
  { id: 4, text: "เต็มใจแบ่งปันสิ่งของให้เพื่อน (เช่น ขนม ของเล่น ดินสอ)", dimension: "prosocial" },
  { id: 5, text: "มักจะอารมณ์เสีย หรือโมโหร้ายบ่อยๆ", dimension: "conduct" },
  { id: 6, text: "ค่อนข้างจะแยกตัว ชอบเล่นหรืออยู่คนเดียว", dimension: "peer" },
  { id: 7, text: "มักจะเชื่อฟัง ทำตามที่ครูหรือผู้ใหญ่บอก", dimension: "conduct", isReversed: true },
  { id: 8, text: "มีความกังวลใจ หรือดูเหมือนมีเรื่องกังวลหลายอย่าง", dimension: "emotional" },
  { id: 9, text: "ชอบช่วยเหลือผู้อื่นเมื่อเขาเจ็บป่วย หรือเสียใจ", dimension: "prosocial" },
  { id: 10, text: "อยู่ไม่สุข ยุกยิก ลุกลี้ลุกลนตลอดเวลา", dimension: "hyperactivity" },
  { id: 11, text: "มีเพื่อนสนิทอย่างน้อย 1 คน", dimension: "peer", isReversed: true },
  { id: 12, text: "มักจะทะเลาะวิวาทกับเด็กคนอื่น หรือข่มเหงรังแกคนอื่น", dimension: "conduct" },
  { id: 13, text: "ดูไม่มีความสุข ท้อแท้ หรือร้องไห้ง่าย", dimension: "emotional" },
  { id: 14, text: "โดยทั่วไปเพื่อนๆ มักจะชอบเขาและยอมรับเข้ากลุ่ม", dimension: "peer", isReversed: true },
  { id: 15, text: "วอกแวกง่าย ขาดสมาธิ สมาธิหลุดได้ง่าย", dimension: "hyperactivity" },
  { id: 16, text: "ขี้ประหม่า ไม่มั่นใจ หรือกังวลในสถานการณ์ใหม่ๆ", dimension: "emotional" },
  { id: 17, text: "อ่อนโยนและใจดีต่อเด็กที่เล็กกว่า", dimension: "prosocial" },
  { id: 18, text: "มักโกหกหรือหลอกลวงผู้อื่น", dimension: "conduct" },
  { id: 19, text: "มักถูกเด็กคนอื่นล้อเลียน หรือกลั่นแกล้งรังแก", dimension: "peer" },
  { id: 20, text: "มักอาสาช่วยเหลือคนอื่น (เช่น ครู เพื่อน ครอบครัว)", dimension: "prosocial" },
  { id: 21, text: "คิดไตร่ตรองก่อนที่จะลงมือทำสิ่งต่างๆ", dimension: "hyperactivity", isReversed: true },
  { id: 22, text: "ขโมยของจากที่บ้าน โรงเรียน หรือที่อื่น", dimension: "conduct" },
  { id: 23, text: "เข้ากับผู้ใหญ่ได้ดีกว่าเด็กวัยเดียวกัน", dimension: "peer" },
  { id: 24, text: "ขี้กลัว ตกใจง่าย กลัวสิ่งต่างๆ ได้ง่าย", dimension: "emotional" },
  { id: 25, text: "ทำงานได้จนเสร็จ มีความมุ่งมั่นและสมาธิดี", dimension: "hyperactivity", isReversed: true },
]

export type SdqClassification = "normal" | "risk" | "problem"

export interface SdqResultSummary {
  rawAnswers: Record<number, number>
  dimensionScores: Record<SdqDimension, number>
  totalDifficultiesScore: number
  overallClassification: SdqClassification
  dimensionClassifications: Record<SdqDimension, SdqClassification>
}

/**
 * Score calculation following official Thai Department of Mental Health cutoffs.
 */
export function calculateSdqScores(
  answers: Record<number, number>
): SdqResultSummary {
  const dimensionScores: Record<SdqDimension, number> = {
    emotional: 0,
    conduct: 0,
    hyperactivity: 0,
    peer: 0,
    prosocial: 0,
  }

  for (const q of SDQ_QUESTIONS) {
    const rawVal = answers[q.id] ?? 0
    let scoredVal = Math.min(2, Math.max(0, rawVal))
    if (q.isReversed) {
      scoredVal = 2 - scoredVal
    }
    dimensionScores[q.dimension] += scoredVal
  }

  const totalDifficultiesScore =
    dimensionScores.emotional +
    dimensionScores.conduct +
    dimensionScores.hyperactivity +
    dimensionScores.peer

  // Official cutoffs for Thai children
  const overallClassification: SdqClassification =
    totalDifficultiesScore <= 15
      ? "normal"
      : totalDifficultiesScore <= 18
        ? "risk"
        : "problem"

  const dimensionClassifications: Record<SdqDimension, SdqClassification> = {
    emotional:
      dimensionScores.emotional <= 4
        ? "normal"
        : dimensionScores.emotional === 5
          ? "risk"
          : "problem",
    conduct:
      dimensionScores.conduct <= 3
        ? "normal"
        : dimensionScores.conduct === 4
          ? "risk"
          : "problem",
    hyperactivity:
      dimensionScores.hyperactivity <= 5
        ? "normal"
        : dimensionScores.hyperactivity === 6
          ? "risk"
          : "problem",
    peer:
      dimensionScores.peer <= 3
        ? "normal"
        : dimensionScores.peer === 4
          ? "risk"
          : "problem",
    prosocial:
      dimensionScores.prosocial >= 6
        ? "normal"
        : dimensionScores.prosocial === 5
          ? "risk"
          : "problem",
  }

  return {
    rawAnswers: answers,
    dimensionScores,
    totalDifficultiesScore,
    overallClassification,
    dimensionClassifications,
  }
}

export function getSdqClassificationLabel(
  classification: SdqClassification
): { text: string; color: string } {
  switch (classification) {
    case "normal":
      return { text: "ปกติ", color: "text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-950/40" }
    case "risk":
      return { text: "เสี่ยง", color: "text-amber-700 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-950/40" }
    case "problem":
      return { text: "มีปัญหา", color: "text-rose-700 bg-rose-50 border-rose-200 dark:text-rose-400 dark:bg-rose-950/40" }
  }
}

export function getEvaluatorTypeLabel(type: SdqEvaluatorType): string {
  switch (type) {
    case "teacher":
      return "ครูประเมิน"
    case "student":
      return "นักเรียนประเมินตนเอง"
    case "parent":
      return "ผู้ปกครองประเมิน"
  }
}

export interface SdqDimensionCutoff {
  maxScore: number
  normalRange: string
  riskRange: string
  problemRange: string
}

export const SDQ_DIMENSION_CUTOFFS: Record<SdqDimension, SdqDimensionCutoff> = {
  emotional: {
    maxScore: 10,
    normalRange: "0 - 4",
    riskRange: "5",
    problemRange: "6 - 10",
  },
  conduct: {
    maxScore: 10,
    normalRange: "0 - 3",
    riskRange: "4",
    problemRange: "5 - 10",
  },
  hyperactivity: {
    maxScore: 10,
    normalRange: "0 - 5",
    riskRange: "6",
    problemRange: "7 - 10",
  },
  peer: {
    maxScore: 10,
    normalRange: "0 - 3",
    riskRange: "4",
    problemRange: "5 - 10",
  },
  prosocial: {
    maxScore: 10,
    normalRange: "6 - 10",
    riskRange: "5",
    problemRange: "0 - 4",
  },
}

export const SDQ_TOTAL_DIFFICULTIES_CUTOFF: SdqDimensionCutoff = {
  maxScore: 40,
  normalRange: "0 - 15",
  riskRange: "16 - 18",
  problemRange: "19 - 40",
}

export function getSdqDefaultRecommendation(
  classification: SdqClassification,
  problemDimensions: SdqDimension[] = []
): string {
  if (classification === "normal") {
    return "นักเรียนมีพัฒนาการทางอารมณ์ พฤติกรรม และสัมพันธภาพทางสังคมอยู่ในเกณฑ์ปกติ ควรจัดกิจกรรมส่งเสริมศักยภาพและจุดเด่นอย่างต่อเนื่อง เสริมสร้างภูมิคุ้มกันทางจิตใจและทักษะชีวิต"
  }

  const dimNames = problemDimensions.map((d) => SDQ_DIMENSIONS[d].label).join(", ")
  if (classification === "risk") {
    return `พบแนวโน้มความเสี่ยงใน${dimNames ? ` ${dimNames}` : "ด้านพฤติกรรมหรืออารมณ์"} ครูประจำชั้นควรดูแลใกล้ชิด จัดกิจกรรมปรับพฤติกรรมเชิงบวก ให้คำปรึกษาเบื้องต้น และประสานงานผู้ปกครองร่วมเฝ้าระวังอย่างต่อเนื่อง`
  }

  return `นักเรียนมีปัญหาพฤติกรรมหรืออารมณ์ใน${dimNames ? ` ${dimNames}` : "ระดับที่ส่งผลกระทบต่อการเรียนและการใช้ชีวิต"} ควรได้รับการช่วยเหลือเร่งด่วน โดยประสานงานครูแนะแนว จัดทำแผนพัฒนาพฤติกรรมรายบุคคล (IDP) ประสานงานผู้ปกครอง หรือพิจารณาส่งต่อผู้เชี่ยวชาญทางการแพทย์/จิตวิทยา`
}

export interface SdqPrintData {
  studentId: string
  studentName: string
  studentCode: string
  classroomLabel: string
  studentNumber?: number | null
  evaluatorType: SdqEvaluatorType
  evaluatorName?: string
  assessmentDate: string
  semesterLabel?: string
  academicYear?: string
  dimensionScores: Record<SdqDimension, number>
  dimensionClassifications: Record<SdqDimension, SdqClassification>
  totalDifficultiesScore: number
  overallClassification: SdqClassification
  recommendations?: string
  notes?: string
}
