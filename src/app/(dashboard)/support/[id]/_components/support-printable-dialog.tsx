"use client"

import {
  CalendarClock,
  HeartHandshake,
  Printer,
  ShieldAlert,
  User,
  X,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  getSupportPriorityLabel,
  getSupportStatusLabel,
  getSupportTypeLabel,
  type SupportPrintData,
} from "@/lib/support-constants"
import { formatThaiDateTime, formatThaiShortDate } from "@/lib/student-care-formatters"

interface SupportPrintableDialogProps {
  isOpen: boolean
  onClose: () => void
  data: SupportPrintData
}

export function SupportPrintableDialog({
  isOpen,
  onClose,
  data,
}: SupportPrintableDialogProps) {
  if (!isOpen) return null

  const handlePrint = () => {
    window.print()
  }

  const {
    caseId,
    title,
    description,
    supportType,
    status,
    priority,
    studentName,
    studentCode,
    classroomLabel,
    providerName,
    semesterId,
    startedAt,
    completedAt,
    createdAt,
    actionPlan,
    providedSupport,
    resourcesUsed,
    externalReferral,
    followups,
  } = data

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm print:static print:inset-auto print:bg-white print:p-0">
      <div className="flex max-h-[90vh] w-full max-w-4xl flex-col rounded-2xl border border-border bg-card shadow-2xl print:max-h-none print:w-full print:max-w-none print:rounded-none print:border-0 print:shadow-none">
        {/* Modal Controls (Hidden in Print) */}
        <div className="flex items-center justify-between border-b border-border p-4 print:hidden">
          <div className="flex items-center gap-2">
            <Printer className="size-5 text-primary" />
            <h3 className="text-base font-semibold text-foreground">
              พิมพ์แบบบันทึกการให้คำปรึกษาและช่วยเหลือผู้เรียนรายบุคคล (สพฐ.)
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
              <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                แบบบันทึกการให้คำปรึกษาและช่วยเหลือผู้เรียนรายบุคคล (แบบ บร. - สพฐ.)
              </h1>
              <p className="text-xs text-muted-foreground">
                ระบบการดูแลช่วยเหลือนักเรียน (Student Care and Information Decision Aid System - SCIDAS)
              </p>
              <div className="flex flex-wrap justify-between pt-2 text-xs text-muted-foreground">
                <span>รหัสเคส: <strong className="text-foreground">{caseId.slice(0, 8)}</strong></span>
                <span>ภาคเรียนที่: <strong className="text-foreground">{semesterId || "ปัจจุบัน"}</strong></span>
                <span>วันที่สร้างเคส: <strong className="text-foreground">{formatThaiDateTime(createdAt)}</strong></span>
              </div>
            </div>

            {/* Section 1: General Info */}
            <section className="space-y-3 rounded-lg border border-border bg-muted/10 p-4 text-xs">
              <h2 className="text-sm font-bold text-foreground flex items-center gap-1.5 border-b border-border/60 pb-2">
                <User className="size-4 text-primary" />
                หมวดที่ 1: ข้อมูลนักเรียนและผู้รับผิดชอบเคส
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
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
                  <span className="text-muted-foreground">ผู้ให้การปรึกษา/ผู้บันทึก: </span>
                  <span className="font-semibold text-foreground">{providerName}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">ประเภทการช่วยเหลือ: </span>
                  <span className="font-semibold text-foreground">{getSupportTypeLabel(supportType)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">ระดับความเร่งด่วน: </span>
                  <span className="font-semibold text-foreground">{getSupportPriorityLabel(priority)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">สถานะการช่วยเหลือ: </span>
                  <span className="font-semibold text-foreground">{getSupportStatusLabel(status)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">วันที่เริ่มต้นเคส: </span>
                  <span className="font-semibold text-foreground">{formatThaiShortDate(startedAt)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">วันที่เสร็จสิ้นเคส: </span>
                  <span className="font-semibold text-foreground">{formatThaiShortDate(completedAt)}</span>
                </div>
              </div>
            </section>

            {/* Section 2: Assessment & Underlying Causes */}
            <section className="space-y-3 rounded-lg border border-border bg-muted/10 p-4 text-xs">
              <h2 className="text-sm font-bold text-foreground flex items-center gap-1.5 border-b border-border/60 pb-2">
                <ShieldAlert className="size-4 text-primary" />
                หมวดที่ 2: สภาพปัญหา สาเหตุ และการประเมินเบื้องต้น
              </h2>
              <div className="space-y-2">
                <div>
                  <p className="font-semibold text-foreground">หัวข้อปัญหา/ความต้องการช่วยเหลือ:</p>
                  <p className="mt-1 text-foreground leading-relaxed pl-2 border-l-2 border-primary/40">
                    {title}
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-foreground">รายละเอียดสภาพปัญหาและพฤติกรรมบ่งชี้:</p>
                  <p className="mt-1 whitespace-pre-wrap text-foreground leading-relaxed pl-2 border-l-2 border-border">
                    {description || "ไม่มีรายละเอียดเพิ่มเติม"}
                  </p>
                </div>
                {resourcesUsed ? (
                  <div>
                    <p className="font-semibold text-foreground">ทรัพยากร/เครื่องมือที่นำมาใช้:</p>
                    <p className="mt-1 text-muted-foreground leading-relaxed pl-2">
                      {resourcesUsed}
                    </p>
                  </div>
                ) : null}
              </div>
            </section>

            {/* Section 3: Action Plan & Intervention */}
            <section className="space-y-3 rounded-lg border border-border bg-muted/10 p-4 text-xs">
              <h2 className="text-sm font-bold text-foreground flex items-center gap-1.5 border-b border-border/60 pb-2">
                <HeartHandshake className="size-4 text-primary" />
                หมวดที่ 3: แผนปฏิบัติการและมาตรการการช่วยเหลือ (Intervention Plan)
              </h2>
              <div className="space-y-3">
                <div className="rounded border border-border bg-background p-3">
                  <p className="font-semibold text-foreground">1. แผนการดำเนินงานและเป้าหมาย (Action Plan):</p>
                  <p className="mt-1 whitespace-pre-wrap text-foreground leading-relaxed">
                    {actionPlan || "ไม่ได้ระบุแผนปฏิบัติการ"}
                  </p>
                </div>
                <div className="rounded border border-border bg-background p-3">
                  <p className="font-semibold text-foreground">2. การช่วยเหลือที่ได้ดำเนินการไปแล้ว (Provided Support):</p>
                  <p className="mt-1 whitespace-pre-wrap text-foreground leading-relaxed">
                    {providedSupport || "อยู่ระหว่างการดำเนินงาน/ยังไม่มีการบันทึก"}
                  </p>
                </div>
                {externalReferral ? (
                  <div className="rounded border border-amber-500/40 bg-amber-500/5 p-3">
                    <p className="font-semibold text-amber-700 dark:text-amber-400">
                      3. การประสานงานส่งต่อภายนอก (External Referral):
                    </p>
                    <p className="mt-1 whitespace-pre-wrap text-foreground leading-relaxed">
                      {externalReferral}
                    </p>
                  </div>
                ) : null}
              </div>
            </section>

            {/* Section 4: Follow-up Timeline */}
            <section className="space-y-3 rounded-lg border border-border bg-muted/10 p-4 text-xs">
              <h2 className="text-sm font-bold text-foreground flex items-center gap-1.5 border-b border-border/60 pb-2">
                <CalendarClock className="size-4 text-primary" />
                หมวดที่ 4: บันทึกการติดตามผลการช่วยเหลือ (Follow-up Records)
              </h2>
              {followups.length === 0 ? (
                <p className="text-center py-3 text-muted-foreground italic">
                  ยังไม่มีประวัติการติดตามผลในเคสนี้
                </p>
              ) : (
                <div className="space-y-2">
                  {followups.map((item, idx) => (
                    <div key={item.id} className="rounded border border-border bg-background p-3 space-y-1.5">
                      <div className="flex items-center justify-between font-semibold text-foreground border-b border-border/40 pb-1">
                        <span>ครั้งที่ {followups.length - idx}: วันที่ {formatThaiShortDate(item.followupDate)}</span>
                        <span className={item.improvementNoted ? "text-emerald-600 font-medium" : "text-amber-600 font-medium"}>
                          {item.improvementNoted ? "✓ มีพัฒนาการดีขึ้น" : "− ยังทรงตัว / ต้องติดตามต่อ"}
                        </span>
                      </div>
                      <p className="text-foreground leading-relaxed">
                        <span className="font-medium text-muted-foreground">สาระสำคัญ: </span>
                        {item.description}
                      </p>
                      {item.result ? (
                        <p className="text-foreground leading-relaxed">
                          <span className="font-medium text-muted-foreground">ผลลัพธ์: </span>
                          {item.result}
                        </p>
                      ) : null}
                      {item.nextAction ? (
                        <p className="text-muted-foreground leading-relaxed">
                          <span className="font-medium">แผนติดตามครั้งต่อไป: </span>
                          {item.nextAction}
                        </p>
                      ) : null}
                      {item.followerName ? (
                        <p className="text-right text-muted-foreground pt-1">
                          ผู้ติดตาม: {item.followerName}
                        </p>
                      ) : null}
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Section 5: Official 3-Party Signatures */}
            <div className="pt-8 border-t-2 border-border/80 break-inside-avoid">
              <p className="text-center text-xs font-semibold text-muted-foreground mb-8">
                ขอรับรองว่าการให้คำปรึกษาและช่วยเหลือผู้เรียนรายบุคคลนี้ได้ดำเนินการตามขั้นตอนระบบดูแลช่วยเหลือนักเรียน สพฐ. อย่างครบถ้วน
              </p>
              <div className="grid grid-cols-3 gap-4 text-center text-xs">
                {/* 1. Student / Advisee */}
                <div className="space-y-12">
                  <p className="font-medium text-muted-foreground">ลงชื่อ..................................................</p>
                  <div>
                    <p className="font-semibold text-foreground">({studentName})</p>
                    <p className="text-muted-foreground">ผู้รับการปรึกษา / นักเรียน</p>
                    <p className="text-muted-foreground">วันที่ ......./......./.......</p>
                  </div>
                </div>

                {/* 2. Counselor / Teacher */}
                <div className="space-y-12">
                  <p className="font-medium text-muted-foreground">ลงชื่อ..................................................</p>
                  <div>
                    <p className="font-semibold text-foreground">({providerName})</p>
                    <p className="text-muted-foreground">ครูที่ปรึกษา / ผู้ให้การปรึกษา</p>
                    <p className="text-muted-foreground">วันที่ ......./......./.......</p>
                  </div>
                </div>

                {/* 3. School Principal / Care Lead */}
                <div className="space-y-12">
                  <p className="font-medium text-muted-foreground">ลงชื่อ..................................................</p>
                  <div>
                    <p className="font-semibold text-foreground">(..................................................)</p>
                    <p className="text-muted-foreground">ผู้อำนวยการสถานศึกษา / หัวหน้างานดูแล</p>
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
