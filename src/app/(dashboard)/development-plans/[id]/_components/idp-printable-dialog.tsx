"use client"

import {
  CheckCircle2,
  ClipboardList,
  Printer,
  Target,
  User,
  X,
} from "lucide-react"

import type {
  DevelopmentActivity,
  DevelopmentEvaluation,
  DevelopmentGoal,
} from "@/app/actions/idp.actions"
import { Button } from "@/components/ui/button"

export type IdpPrintData = {
  planTitle: string
  planDescription: string | null
  studentName: string
  studentCode: string | null
  creatorName: string
  semesterName: string
  startDate: string | null
  endDate: string | null
  progress: number
  statusLabel: string
  goals: DevelopmentGoal[]
  activitiesByGoal: Record<string, DevelopmentActivity[]>
  evaluations: DevelopmentEvaluation[]
}

interface IdpPrintableDialogProps {
  isOpen: boolean
  onClose: () => void
  data: IdpPrintData
}

function goalStatusLabel(status: DevelopmentGoal["status"]) {
  return (
    {
      not_started: "ยังไม่เริ่ม",
      in_progress: "กำลังดำเนินการ",
      achieved: "บรรลุเป้าหมาย",
      not_achieved: "ยังไม่บรรลุ",
      cancelled: "ยกเลิก",
    }[status] ?? status
  )
}

export function IdpPrintableDialog({
  isOpen,
  onClose,
  data,
}: IdpPrintableDialogProps) {
  if (!isOpen) return null

  const handlePrint = () => {
    window.print()
  }

  const {
    planTitle,
    planDescription,
    studentName,
    studentCode,
    creatorName,
    semesterName,
    startDate,
    endDate,
    progress,
    statusLabel,
    goals,
    activitiesByGoal,
    evaluations,
  } = data

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm print:static print:inset-auto print:bg-white print:p-0">
      <div className="flex max-h-[90vh] w-full max-w-4xl flex-col rounded-2xl border border-border bg-card shadow-2xl print:max-h-none print:w-full print:max-w-none print:rounded-none print:border-0 print:shadow-none">
        {/* Modal Controls (Hidden in Print) */}
        <div className="flex items-center justify-between border-b border-border p-4 print:hidden">
          <div className="flex items-center gap-2">
            <Printer className="size-5 text-primary" />
            <h3 className="text-base font-semibold text-foreground">
              พิมพ์แบบแผนพัฒนานักเรียนรายบุคคล (IDP - สพฐ.)
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
          <style dangerouslySetInnerHTML={{ __html: "@media print { @page { size: A4 portrait; margin: 12mm; } }" }} />
          <div className="space-y-6">
            {/* Official Header */}
            <div className="text-center space-y-1 border-b-2 border-primary/20 pb-4">
              <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                สำนักงานคณะกรรมการการศึกษาขั้นพื้นฐาน • กระทรวงศึกษาธิการ
              </p>
              <h1 className="text-xl font-bold tracking-tight text-foreground">
                แบบแผนพัฒนาผู้เรียนรายบุคคล (Individual Development Plan - IDP)
              </h1>
              <p className="text-xs text-muted-foreground">
                การส่งเสริมและพัฒนานักเรียนตามศักยภาพและความต้องการเฉพาะบุคคล
              </p>
            </div>

            {/* General Information Card */}
            <section className="space-y-3 rounded-lg border border-border bg-muted/10 p-4 text-xs">
              <h2 className="text-sm font-bold text-foreground flex items-center gap-1.5 border-b border-border/60 pb-2">
                <User className="size-4 text-primary" />
                ข้อมูลทั่วไปของแผนพัฒนา
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <span className="text-muted-foreground">ชื่อแผนพัฒนา: </span>
                  <strong className="text-foreground">{planTitle}</strong>
                </div>
                <div>
                  <span className="text-muted-foreground">สถานะแผน: </span>
                  <strong className="text-foreground">{statusLabel} ({progress}%)</strong>
                </div>
                <div>
                  <span className="text-muted-foreground">นักเรียน: </span>
                  <strong className="text-foreground">{studentName}</strong>
                </div>
                <div>
                  <span className="text-muted-foreground">รหัสนักเรียน: </span>
                  <strong className="text-foreground">{studentCode ?? "ไม่ระบุ"}</strong>
                </div>
                <div>
                  <span className="text-muted-foreground">ครูผู้จัดทำแผน: </span>
                  <strong className="text-foreground">{creatorName}</strong>
                </div>
                <div>
                  <span className="text-muted-foreground">ภาคเรียน: </span>
                  <strong className="text-foreground">{semesterName}</strong>
                </div>
                <div>
                  <span className="text-muted-foreground">วันที่เริ่มต้น: </span>
                  <strong className="text-foreground">{startDate ?? "ไม่ระบุ"}</strong>
                </div>
                <div>
                  <span className="text-muted-foreground">วันที่สิ้นสุด: </span>
                  <strong className="text-foreground">{endDate ?? "ไม่ระบุ"}</strong>
                </div>
              </div>
              {planDescription && (
                <div className="pt-1 border-t border-border/60 text-muted-foreground">
                  <span className="font-semibold text-foreground">คำอธิบายแผน: </span>
                  {planDescription}
                </div>
              )}
            </section>

            {/* Section 1: Development Goals */}
            <section className="space-y-3 rounded-lg border border-border bg-muted/10 p-4 text-xs">
              <h2 className="text-sm font-bold text-foreground flex items-center gap-1.5 border-b border-border/60 pb-2">
                <Target className="size-4 text-primary" />
                ส่วนที่ 1: เป้าหมายการพัฒนาและเกณฑ์วัดความสำเร็จ
              </h2>
              {goals.length === 0 ? (
                <p className="text-center py-3 text-muted-foreground italic">
                  ยังไม่ได้กำหนดเป้าหมายการพัฒนา
                </p>
              ) : (
                <div className="overflow-x-auto rounded border border-border">
                  <table className="w-full text-left text-xs">
                    <thead className="border-b border-border bg-muted/40 font-semibold text-muted-foreground">
                      <tr>
                        <th className="py-2 px-3 w-10 text-center">#</th>
                        <th className="py-2 px-3 min-w-[180px]">เป้าหมายการพัฒนา</th>
                        <th className="py-2 px-3 min-w-[180px]">เกณฑ์วัดความสำเร็จ</th>
                        <th className="py-2 px-3 w-28 text-center">สถานะ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {goals.map((g, idx) => (
                        <tr key={g.id} className="bg-background">
                          <td className="py-2 px-3 text-center text-muted-foreground">{idx + 1}</td>
                          <td className="py-2 px-3 font-medium text-foreground">{g.title}</td>
                          <td className="py-2 px-3 text-muted-foreground">{g.target_value ?? g.description ?? "-"}</td>
                          <td className="py-2 px-3 text-center">
                            <span className="inline-block rounded px-2 py-0.5 font-medium bg-muted text-foreground">
                              {goalStatusLabel(g.status)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            {/* Section 2: Action Steps & Activities */}
            <section className="space-y-3 rounded-lg border border-border bg-muted/10 p-4 text-xs">
              <h2 className="text-sm font-bold text-foreground flex items-center gap-1.5 border-b border-border/60 pb-2">
                <ClipboardList className="size-4 text-primary" />
                ส่วนที่ 2: กิจกรรมการพัฒนาและผู้รับผิดชอบ
              </h2>
              <div className="space-y-3">
                {goals.map((goal, gIdx) => {
                  const acts = activitiesByGoal[goal.id] ?? []
                  return (
                    <div key={goal.id} className="rounded border border-border bg-background p-3 space-y-2">
                      <p className="font-semibold text-foreground">
                        เป้าหมายที่ {gIdx + 1}: {goal.title}
                      </p>
                      {acts.length === 0 ? (
                        <p className="text-muted-foreground italic">ไม่มีกิจกรรมย่อย</p>
                      ) : (
                        <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                          {acts.map((act) => (
                            <li key={act.id}>
                              <span className="font-medium text-foreground">{act.title}</span>
                              {act.responsible_person && (
                                <span className="ml-1 text-xs">
                                  (ผู้รับผิดชอบ: {act.responsible_person})
                                </span>
                              )}
                              {act.is_completed && (
                                <span className="ml-1.5 text-xs text-emerald-700 font-semibold">
                                  [ดำเนินการเรียบร้อย]
                                </span>
                              )}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )
                })}
              </div>
            </section>

            {/* Section 3: Evaluations */}
            <section className="space-y-3 rounded-lg border border-border bg-muted/10 p-4 text-xs">
              <h2 className="text-sm font-bold text-foreground flex items-center gap-1.5 border-b border-border/60 pb-2">
                <CheckCircle2 className="size-4 text-primary" />
                ส่วนที่ 3: สรุปผลการประเมินและการพัฒนา
              </h2>
              {evaluations.length === 0 ? (
                <p className="text-center py-3 text-muted-foreground italic">
                  ยังไม่มีบันทึกการประเมินผล
                </p>
              ) : (
                <div className="space-y-2">
                  {evaluations.map((ev, idx) => (
                    <div key={ev.id} className="rounded border border-border bg-background p-3 space-y-1">
                      <div className="flex items-center justify-between font-semibold text-foreground">
                        <span>ครั้งที่ {idx + 1} (รอบที่ {ev.evaluation_round}): วันที่ {ev.evaluation_date ?? "-"}</span>
                        <span className="text-primary font-medium">
                          {ev.continue_plan ? "ดำเนินการแผนต่อ" : "สิ้นสุดแผน"}
                        </span>
                      </div>
                      <p className="text-foreground leading-relaxed">
                        <span className="font-medium">ผลการประเมิน: </span>
                        {ev.overall_result}
                      </p>
                      {ev.recommendations && (
                        <p className="text-muted-foreground leading-relaxed">
                          <span className="font-medium">ข้อเสนอแนะ: </span>
                          {ev.recommendations}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Section 4: Official 3-Party Signatures */}
            <div className="pt-8 border-t-2 border-border/80 break-inside-avoid">
              <p className="text-center text-xs font-semibold text-muted-foreground mb-8">
                ขอรับรองว่าแผนพัฒนานักเรียนรายบุคคลนี้ได้รับการจัดทำและตรวจสอบตามมาตรฐานการศึกษา
              </p>
              <div className="grid grid-cols-3 gap-4 text-center text-xs">
                {/* 1. Creator Teacher */}
                <div className="space-y-12">
                  <p className="font-medium text-muted-foreground">ลงชื่อ..................................................</p>
                  <div>
                    <p className="font-semibold text-foreground">({creatorName})</p>
                    <p className="text-muted-foreground">ครูผู้จัดทำแผนพัฒนา</p>
                    <p className="text-muted-foreground">วันที่ ......./......./.......</p>
                  </div>
                </div>

                {/* 2. Counselor / Care Team */}
                <div className="space-y-12">
                  <p className="font-medium text-muted-foreground">ลงชื่อ..................................................</p>
                  <div>
                    <p className="font-semibold text-foreground">(..................................................)</p>
                    <p className="text-muted-foreground">ครูแนะแนว / หัวหน้างานดูแลช่วยเหลือ</p>
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
