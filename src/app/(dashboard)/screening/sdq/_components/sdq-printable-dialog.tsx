"use client"

import {
  Brain,
  CheckCircle2,
  Printer,
  ShieldAlert,
  User,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  getEvaluatorTypeLabel,
  getSdqClassificationLabel,
  getSdqDefaultRecommendation,
  SDQ_DIMENSION_CUTOFFS,
  SDQ_DIMENSIONS,
  SDQ_TOTAL_DIFFICULTIES_CUTOFF,
  type SdqDimension,
  type SdqPrintData,
} from "@/lib/sdq-constants"

interface SdqPrintableDialogProps {
  isOpen: boolean
  onClose: () => void
  data: SdqPrintData
}

export function SdqPrintableDialog({
  isOpen,
  onClose,
  data,
}: SdqPrintableDialogProps) {
  if (!isOpen) return null

  const handlePrint = () => {
    window.print()
  }

  const {
    studentName,
    studentCode,
    classroomLabel,
    studentNumber,
    evaluatorType,
    evaluatorName = "ครูประจำชั้น",
    assessmentDate,
    semesterLabel = "ภาคเรียนปัจจุบัน",
    academicYear = "2567",
    dimensionScores,
    dimensionClassifications,
    totalDifficultiesScore,
    overallClassification,
    recommendations,
    notes,
  } = data

  const problemDims = (Object.keys(SDQ_DIMENSIONS) as SdqDimension[]).filter(
    (dim) => dim !== "prosocial" && (dimensionClassifications[dim] === "risk" || dimensionClassifications[dim] === "problem")
  )

  const activeRecommendation =
    recommendations || getSdqDefaultRecommendation(overallClassification, problemDims)

  const overallBadge = getSdqClassificationLabel(overallClassification)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm print:static print:inset-auto print:bg-white print:p-0">
      <div className="flex max-h-[90vh] w-full max-w-4xl flex-col rounded-2xl border border-border bg-card shadow-2xl print:max-h-none print:w-full print:max-w-none print:rounded-none print:border-0 print:shadow-none">
        {/* Modal Controls (Hidden in Print) */}
        <div className="flex items-center justify-between border-b border-border p-4 print:hidden">
          <div className="flex items-center gap-2">
            <Printer className="size-5 text-primary" />
            <h3 className="text-base font-semibold text-foreground">
              พิมพ์แบบรายงานผลการประเมิน SDQ (ฉบับทางการ สพฐ.)
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 text-xs font-semibold"
            >
              <Printer className="size-4" />
              <span>สั่งพิมพ์เอกสาร</span>
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="size-8 p-0 text-muted-foreground hover:text-foreground"
            >
              <X className="size-4" />
            </Button>
          </div>
        </div>

        {/* Document Sheet */}
        <div className="flex-1 overflow-y-auto p-8 print:overflow-visible print:p-6 text-foreground bg-background">
          <div className="space-y-6">
            {/* Official Header */}
            <div className="text-center space-y-1 border-b-2 border-primary/20 pb-4">
              <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                สำนักงานคณะกรรมการการศึกษาขั้นพื้นฐาน • กระทรวงศึกษาธิการ
              </p>
              <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                แบบรายงานสรุปผลการประเมินพฤติกรรมและอารมณ์เด็ก (SDQ)
              </h1>
              <p className="text-xs text-muted-foreground">
                ระบบการดูแลช่วยเหลือนักเรียน (Student Care and Information Decision Aid System - SCIDAS)
              </p>
              <div className="flex flex-wrap justify-between pt-2 text-xs text-muted-foreground">
                <span>แบบประเมิน: <strong className="text-foreground">{getEvaluatorTypeLabel(evaluatorType)}</strong></span>
                <span>ภาคเรียนที่: <strong className="text-foreground">{semesterLabel} ปีการศึกษา {academicYear}</strong></span>
                <span>วันที่ประเมิน: <strong className="text-foreground">{assessmentDate}</strong></span>
              </div>
            </div>

            {/* Section 1: General Info */}
            <section className="space-y-3 rounded-lg border border-border bg-muted/10 p-4 text-xs">
              <h2 className="text-sm font-bold text-foreground flex items-center gap-1.5 border-b border-border/60 pb-2">
                <User className="size-4 text-primary" />
                หมวดที่ 1: ข้อมูลนักเรียนและผู้ประเมิน
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <span className="text-muted-foreground">ชื่อ-สกุลนักเรียน: </span>
                  <span className="font-semibold text-foreground">{studentName}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">รหัสประจำตัว: </span>
                  <span className="font-semibold text-foreground">{studentCode || "-"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">ระดับชั้น/ห้องเรียน: </span>
                  <span className="font-semibold text-foreground">{classroomLabel || "-"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">เลขที่: </span>
                  <span className="font-semibold text-foreground">{studentNumber ?? "-"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">ผู้ประเมิน: </span>
                  <span className="font-semibold text-foreground">{getEvaluatorTypeLabel(evaluatorType)}</span>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-muted-foreground">ชื่อผู้ประเมิน/ผู้บันทึก: </span>
                  <span className="font-semibold text-foreground">{evaluatorName}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">ระดับผลรวม: </span>
                  <span className={`inline-flex px-2 py-0.5 rounded text-xs font-semibold border ${overallBadge.color}`}>
                    {overallBadge.text}
                  </span>
                </div>
              </div>
            </section>

            {/* Section 2: 5 Dimensions Evaluation Table */}
            <section className="space-y-3 rounded-lg border border-border bg-muted/10 p-4 text-xs">
              <h2 className="text-sm font-bold text-foreground flex items-center gap-1.5 border-b border-border/60 pb-2">
                <Brain className="size-4 text-primary" />
                หมวดที่ 2: ผลคะแนนการประเมิน 5 มิติ (ตามเกณฑ์มาตรฐาน สพฐ. และกรมสุขภาพจิต)
              </h2>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border bg-muted/30 text-muted-foreground">
                      <th className="py-2 px-3 font-semibold text-center w-12">ที่</th>
                      <th className="py-2 px-3 font-semibold">มิติการประเมิน</th>
                      <th className="py-2 px-2 font-semibold text-center">คะแนน</th>
                      <th className="py-2 px-2 font-semibold text-center">เต็ม</th>
                      <th className="py-2 px-2 font-semibold text-center">ปกติ</th>
                      <th className="py-2 px-2 font-semibold text-center">เสี่ยง</th>
                      <th className="py-2 px-2 font-semibold text-center">มีปัญหา</th>
                      <th className="py-2 px-3 font-semibold text-center">แปลผล</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {(["emotional", "conduct", "hyperactivity", "peer"] as SdqDimension[]).map((dim, idx) => {
                      const score = dimensionScores[dim] ?? 0
                      const cls = dimensionClassifications[dim] ?? "normal"
                      const badge = getSdqClassificationLabel(cls)
                      const cutoff = SDQ_DIMENSION_CUTOFFS[dim]

                      return (
                        <tr key={dim} className="hover:bg-muted/20">
                          <td className="py-2.5 px-3 text-center text-muted-foreground">{idx + 1}</td>
                          <td className="py-2.5 px-3">
                            <span className="font-semibold text-foreground">{SDQ_DIMENSIONS[dim].label}</span>
                            <p className="text-muted-foreground text-xs">{SDQ_DIMENSIONS[dim].description}</p>
                          </td>
                          <td className="py-2.5 px-2 text-center font-bold font-mono text-foreground">{score}</td>
                          <td className="py-2.5 px-2 text-center text-muted-foreground">{cutoff.maxScore}</td>
                          <td className="py-2.5 px-2 text-center text-emerald-600 dark:text-emerald-400">{cutoff.normalRange}</td>
                          <td className="py-2.5 px-2 text-center text-amber-600 dark:text-amber-400">{cutoff.riskRange}</td>
                          <td className="py-2.5 px-2 text-center text-rose-600 dark:text-rose-400">{cutoff.problemRange}</td>
                          <td className="py-2.5 px-3 text-center">
                            <span className={`inline-flex px-2 py-0.5 rounded text-xs font-semibold border ${badge.color}`}>
                              {badge.text}
                            </span>
                          </td>
                        </tr>
                      )
                    })}

                    {/* Total Difficulties Summary Row */}
                    <tr className="bg-primary/5 font-bold border-y-2 border-primary/30">
                      <td className="py-3 px-3 text-center text-primary">★</td>
                      <td className="py-3 px-3">
                        <span className="text-primary font-bold">รวมความยากลำบาก 4 ด้าน (Total Difficulties)</span>
                        <p className="text-xs text-muted-foreground font-normal">รวมคะแนนด้านที่ 1-4 ใช้คัดกรองระดับความเสี่ยงของนักเรียน</p>
                      </td>
                      <td className="py-3 px-2 text-center font-mono text-base text-primary font-extrabold">
                        {totalDifficultiesScore}
                      </td>
                      <td className="py-3 px-2 text-center text-foreground">{SDQ_TOTAL_DIFFICULTIES_CUTOFF.maxScore}</td>
                      <td className="py-3 px-2 text-center text-emerald-600 dark:text-emerald-400 font-medium">
                        {SDQ_TOTAL_DIFFICULTIES_CUTOFF.normalRange}
                      </td>
                      <td className="py-3 px-2 text-center text-amber-600 dark:text-amber-400 font-medium">
                        {SDQ_TOTAL_DIFFICULTIES_CUTOFF.riskRange}
                      </td>
                      <td className="py-3 px-2 text-center text-rose-600 dark:text-rose-400 font-medium">
                        {SDQ_TOTAL_DIFFICULTIES_CUTOFF.problemRange}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold border ${overallBadge.color}`}>
                          {overallBadge.text}
                        </span>
                      </td>
                    </tr>

                    {/* Dimension 5: Prosocial */}
                    {(() => {
                      const score = dimensionScores.prosocial ?? 0
                      const cls = dimensionClassifications.prosocial ?? "normal"
                      const badge = getSdqClassificationLabel(cls)
                      const cutoff = SDQ_DIMENSION_CUTOFFS.prosocial

                      return (
                        <tr className="hover:bg-muted/20">
                          <td className="py-2.5 px-3 text-center text-muted-foreground">5</td>
                          <td className="py-2.5 px-3">
                            <span className="font-semibold text-foreground">{SDQ_DIMENSIONS.prosocial.label} (จุดแข็ง/จุดเด่น)</span>
                            <p className="text-muted-foreground text-xs">{SDQ_DIMENSIONS.prosocial.description}</p>
                          </td>
                          <td className="py-2.5 px-2 text-center font-bold font-mono text-foreground">{score}</td>
                          <td className="py-2.5 px-2 text-center text-muted-foreground">{cutoff.maxScore}</td>
                          <td className="py-2.5 px-2 text-center text-emerald-600 dark:text-emerald-400">{cutoff.normalRange}</td>
                          <td className="py-2.5 px-2 text-center text-amber-600 dark:text-amber-400">{cutoff.riskRange}</td>
                          <td className="py-2.5 px-2 text-center text-rose-600 dark:text-rose-400">{cutoff.problemRange}</td>
                          <td className="py-2.5 px-3 text-center">
                            <span className={`inline-flex px-2 py-0.5 rounded text-xs font-semibold border ${badge.color}`}>
                              {badge.text}
                            </span>
                          </td>
                        </tr>
                      )
                    })()}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Section 3: Interpretation & Action Plan */}
            <section className="space-y-3 rounded-lg border border-border bg-muted/10 p-4 text-xs">
              <h2 className="text-sm font-bold text-foreground flex items-center gap-1.5 border-b border-border/60 pb-2">
                <ShieldAlert className="size-4 text-primary" />
                หมวดที่ 3: สรุปผลการคัดกรองและแนวทางการดูแลช่วยเหลือ
              </h2>
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <span className="font-semibold text-foreground shrink-0">ผลการวิเคราะห์ระดับความเสี่ยง:</span>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-xs font-bold border ${overallBadge.color}`}>
                      {overallBadge.text}
                    </span>
                    <span className="text-muted-foreground">
                      (คะแนนรวมความยากลำบาก {totalDifficultiesScore}/40 คะแนน)
                    </span>
                  </div>
                </div>

                {problemDims.length > 0 ? (
                  <div>
                    <span className="font-semibold text-rose-700 dark:text-rose-400">
                      มิติที่ควรเฝ้าระวังหรือให้ความช่วยเหลือเป็นพิเศษ:
                    </span>
                    <ul className="mt-1 list-disc list-inside space-y-0.5 text-muted-foreground pl-2">
                      {problemDims.map((d) => (
                        <li key={d}>
                          <strong className="text-foreground">{SDQ_DIMENSIONS[d].label}:</strong> {dimensionScores[d]}/10 คะแนน ({getSdqClassificationLabel(dimensionClassifications[d]).text})
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
                    <CheckCircle2 className="size-4" />
                    <span>ไม่พบปัญหาในมิติด้านความยากลำบากทั้ง 4 ด้าน นักเรียนมีพัฒนาการตามวัย</span>
                  </div>
                )}

                <div>
                  <p className="font-semibold text-foreground">แนวทางการส่งเสริมและดูแลช่วยเหลือ (Action Plan):</p>
                  <p className="mt-1 leading-relaxed rounded border border-border bg-background p-3 text-foreground whitespace-pre-wrap">
                    {activeRecommendation}
                  </p>
                </div>

                {notes ? (
                  <div>
                    <p className="font-semibold text-foreground">บันทึกเพิ่มเติมจากครูผู้ประเมิน:</p>
                    <p className="mt-1 leading-relaxed rounded border border-border bg-background p-2.5 text-muted-foreground">
                      {notes}
                    </p>
                  </div>
                ) : null}
              </div>
            </section>

            {/* Section 4: Official 3-Party Signatures */}
            <div className="pt-8 border-t-2 border-border/80">
              <p className="text-center text-xs font-semibold text-muted-foreground mb-8">
                ขอรับรองว่าผลการประเมิน SDQ และการคัดกรองนี้ถูกต้องตามข้อเท็จจริงและมาตรฐานระบบดูแลช่วยเหลือนักเรียน สพฐ.
              </p>
              <div className="grid grid-cols-3 gap-4 text-center text-xs">
                {/* 1. Evaluator / Homeroom Teacher */}
                <div className="space-y-12">
                  <p className="font-medium text-muted-foreground">ลงชื่อ..................................................</p>
                  <div>
                    <p className="font-semibold text-foreground">({evaluatorName})</p>
                    <p className="text-muted-foreground">{getEvaluatorTypeLabel(evaluatorType)} / ครูประจำชั้น</p>
                    <p className="text-muted-foreground">วันที่ ......./......./.......</p>
                  </div>
                </div>

                {/* 2. Guidance Teacher / Care Lead */}
                <div className="space-y-12">
                  <p className="font-medium text-muted-foreground">ลงชื่อ..................................................</p>
                  <div>
                    <p className="font-semibold text-foreground">(..................................................)</p>
                    <p className="text-muted-foreground">ครูแนะแนว / หัวหน้างานดูแลช่วยเหลือนักเรียน</p>
                    <p className="text-muted-foreground">วันที่ ......./......./.......</p>
                  </div>
                </div>

                {/* 3. School Principal */}
                <div className="space-y-12">
                  <p className="font-medium text-muted-foreground">ลงชื่อ..................................................</p>
                  <div>
                    <p className="font-semibold text-foreground">(..................................................)</p>
                    <p className="text-muted-foreground">ผู้อำนวยการสถานศึกษา</p>
                    <p className="text-muted-foreground">วันที่ ......./......./.......</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
