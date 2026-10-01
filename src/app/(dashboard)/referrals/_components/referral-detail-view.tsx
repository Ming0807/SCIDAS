"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  Building2,
  Calendar,
  Clock,
  Hospital,
  LoaderCircle,
  Printer,
  Send,
  User,
} from "lucide-react"

import {
  addReferralFollowupAction,
  updateReferralStatusAction,
  type ReferralDetail,
  type SupportStatus,
} from "@/app/actions/referral.actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { formatGradeLevel, formatThaiShortDate } from "@/lib/student-care-formatters"

const referralStatusLabels: Record<SupportStatus, string> = {
  pending: "รอดำเนินการ",
  referred: "รอหน่วยงานปลายทางตอบรับ",
  in_progress: "อยู่ระหว่างประสานงาน",
  completed: "เสร็จสมบูรณ์",
  cancelled: "ยกเลิก",
}

const referralPriorityLabels: Record<string, string> = {
  low: "ต่ำ",
  medium: "ปานกลาง",
  high: "สูง",
  critical: "เร่งด่วนที่สุด",
}

function formatMaskedNationalId(id?: string | null): string {
  if (!id) return "-"
  const clean = id.replace(/\D/g, "")
  if (clean.length === 13) {
    return `${clean[0]}-XXXX-XXXXX-${clean.slice(10, 12)}-${clean[12]}`
  }
  return id
}

export function ReferralDetailView({
  referral,
}: {
  referral: ReferralDetail
}) {
  const [isPending, startTransition] = useTransition()
  const [selectedStatus, setSelectedStatus] = useState<SupportStatus>(referral.status)
  const [targetStatus, setTargetStatus] = useState<SupportStatus>(referral.status)
  const [statusNote, setStatusNote] = useState("")

  const [followupDescription, setFollowupDescription] = useState("")
  const [followupResult, setFollowupResult] = useState("ติดตามผลความคืบหน้า")
  const [feedback, setFeedback] = useState<{ ok: boolean; message: string } | null>(null)

  const handleUpdateStatus = () => {
    startTransition(async () => {
      setFeedback(null)
      const res = await updateReferralStatusAction(referral.id, targetStatus, statusNote)
      if (res.ok) {
        setSelectedStatus(targetStatus)
        setStatusNote("")
        setFeedback({
          ok: true,
          message: `เปลี่ยนสถานะเป็น "${referralStatusLabels[targetStatus]}" เรียบร้อยแล้ว`,
        })
      } else {
        setFeedback({ ok: false, message: res.message })
      }
    })
  }

  const handleAddFollowup = () => {
    if (!followupDescription.trim()) return
    startTransition(async () => {
      setFeedback(null)
      const res = await addReferralFollowupAction(
        referral.id,
        followupDescription,
        followupResult,
      )
      if (res.ok) {
        setFollowupDescription("")
        setFeedback({ ok: true, message: "บันทึกความคืบหน้าการติดตามผลเรียบร้อยแล้ว" })
      } else {
        setFeedback({ ok: false, message: res.message })
      }
    })
  }

  const handlePrint = () => {
    window.print()
  }

  const student = referral.student
  const studentName = student ? `${student.first_name} ${student.last_name}` : "ไม่ระบุชื่อ"
  const classroomLabel = student?.classroom
    ? `${formatGradeLevel(student.classroom.grade_level)}/${student.classroom.section}`
    : ""

  return (
    <div className="space-y-6">
      {/* Action and Print Toolbar (hidden during print) */}
      <div className="print:hidden flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4 shadow-xs">
        <div className="flex items-center gap-2">
          <Link
            href="/referrals"
            className="flex items-center gap-1.5 rounded-xl border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <ArrowLeft className="size-3.5" />
            กลับหน้ารายการส่งต่อ
          </Link>
          <span className="text-xs text-muted-foreground">·</span>
          <span className="text-xs text-muted-foreground">
            สถานะปัจจุบัน: <strong className="text-foreground">{referralStatusLabels[selectedStatus]}</strong>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handlePrint}
            className="text-xs gap-1.5"
          >
            <Printer className="size-3.5" />
            พิมพ์หนังสือส่งต่อนักเรียน (ปพ./สพฐ.)
          </Button>

          {referral.student_id ? (
            <Link
              href={`/students/${referral.student_id}`}
              className="rounded-xl border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              ดูประวัตินักเรียน 360°
            </Link>
          ) : null}
        </div>
      </div>

      {feedback ? (
        <div
          className={`print:hidden rounded-xl border p-4 text-xs ${
            feedback.ok
              ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-200"
              : "border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900 dark:bg-rose-950/50 dark:text-rose-200"
          }`}
        >
          {feedback.message}
        </div>
      ) : null}

      {/* Screen View: Detail Information (hidden during print) */}
      <div className="print:hidden grid gap-6 lg:grid-cols-3">
        {/* Left Column (2 cols): Case Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-xs space-y-5">
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                      referral.referral_type === "external"
                        ? "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800"
                        : "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800"
                    }`}
                  >
                    {referral.referral_type === "external" ? (
                      <>
                        <Hospital className="size-3" />
                        ส่งต่อหน่วยงานภายนอก
                      </>
                    ) : (
                      <>
                        <Building2 className="size-3" />
                        ส่งต่อภายในสถานศึกษา
                      </>
                    )}
                  </span>
                  <span className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground border border-border">
                    ความสำคัญ: {referralPriorityLabels[referral.priority ?? ""] || referral.priority || "ปกติ"}
                  </span>
                </div>
                <h1 className="text-xl font-bold text-foreground">{referral.title}</h1>
              </div>

              <div className="text-right">
                <span className="text-xs text-muted-foreground block">ปลายทางที่รับส่งต่อ</span>
                <span className="text-sm font-semibold text-primary">{referral.target_agency}</span>
              </div>
            </div>

            {/* Student card strip */}
            <div className="flex items-center gap-3 rounded-xl bg-muted/50 p-3.5 border border-border/60">
              <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
                <User className="size-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-sm text-foreground">{studentName}</p>
                <p className="text-xs text-muted-foreground">
                  รหัสประจำตัว: {student?.student_code || "ไม่ระบุ"} · {classroomLabel || "ไม่ระบุห้อง"}
                </p>
              </div>
              <Link
                href={`/students/${referral.student_id}`}
                className="text-xs text-primary hover:underline shrink-0 font-medium"
              >
                ดูข้อมูลนักเรียน →
              </Link>
            </div>

            {/* Case Details */}
            <div className="space-y-4 text-sm">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  เหตุผลและข้อบ่งชี้ในการส่งต่อ (ตามเกณฑ์ สพฐ.)
                </h3>
                <div className="rounded-xl border border-border bg-card p-4 text-foreground whitespace-pre-wrap leading-relaxed">
                  {referral.description}
                </div>
              </div>

              {referral.provided_support ? (
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                    การช่วยเหลือเบื้องต้นที่สถานศึกษาได้ดำเนินการแล้ว
                  </h3>
                  <div className="rounded-xl border border-border bg-card p-4 text-foreground whitespace-pre-wrap leading-relaxed">
                    {referral.provided_support}
                  </div>
                </div>
              ) : null}

              {referral.action_plan ? (
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                    สิ่งที่คาดหวัง / สิ่งที่ขอความร่วมมือจากหน่วยงานปลายทาง
                  </h3>
                  <div className="rounded-xl border border-border bg-card p-4 text-foreground whitespace-pre-wrap leading-relaxed">
                    {referral.action_plan}
                  </div>
                </div>
              ) : null}
            </div>

            {/* Metadata Footer */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <User className="size-3.5" />
                ผู้บันทึกส่งต่อ: {referral.provider ? `${referral.provider.first_name} ${referral.provider.last_name}` : "ไม่ระบุ"}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="size-3.5" />
                วันที่สร้างเคส: {formatThaiShortDate(referral.created_at)}
              </span>
            </div>
          </div>

          {/* Follow-up Timeline */}
          <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-xs space-y-4">
            <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
              <Clock className="size-4 text-primary" />
              ประวัติการติดตามผลและความคืบหน้า ({referral.followups.length})
            </h2>

            {referral.followups.length === 0 ? (
              <div className="p-6 text-center text-xs text-muted-foreground bg-muted/30 rounded-xl">
                ยังไม่มีบันทึกการติดตามผล คุณสามารถบันทึกความคืบหน้าด้านขวามือได้
              </div>
            ) : (
              <div className="divide-y divide-border">
                {referral.followups.map((f) => (
                  <div key={f.id} className="py-3.5 first:pt-0 last:pb-0 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-foreground flex items-center gap-1">
                        <Calendar className="size-3 text-muted-foreground" />
                        {formatThaiShortDate(f.followup_date)}
                      </span>
                      {f.result ? (
                        <span className="rounded-md bg-muted px-2 py-0.5 text-xs text-foreground font-medium">
                          {f.result}
                        </span>
                      ) : null}
                    </div>
                    <p className="text-sm text-foreground whitespace-pre-wrap">{f.description}</p>
                    {f.follower_name ? (
                      <p className="text-xs text-muted-foreground">
                        ผู้บันทึก: {f.follower_name}
                      </p>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Split Status Transition & Follow-up Forms (E6) */}
        <div className="space-y-6">
          {/* Form 1: Status Transition */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-2.5">
              <h2 className="text-sm font-semibold text-foreground">จัดการสถานะการส่งต่อ</h2>
              <span className="text-xs text-muted-foreground">
                ปัจจุบัน: <strong className="text-foreground">{referralStatusLabels[selectedStatus]}</strong>
              </span>
            </div>

            {referral.canEdit ? (
              <div className="space-y-3">
                <div className="space-y-2" role="radiogroup" aria-label="เลือกสถานะการส่งต่อ">
                  {[
                    {
                      id: "referred" as SupportStatus,
                      title: "1. รอหน่วยงานปลายทางตอบรับ",
                      desc: "ออกเอกสารส่งตัวแล้ว รอผลการตอบรับ",
                      activeClass:
                        "border-amber-400 bg-amber-50 text-amber-900 dark:bg-amber-950/40 dark:text-amber-200 dark:border-amber-800",
                    },
                    {
                      id: "in_progress" as SupportStatus,
                      title: "2. อยู่ระหว่างประสานงาน / รับบริการ",
                      desc: "นักเรียนกำลังรับคำปรึกษาหรือการรักษา",
                      activeClass:
                        "border-blue-400 bg-blue-50 text-blue-900 dark:bg-blue-950/40 dark:text-blue-200 dark:border-blue-800",
                    },
                    {
                      id: "completed" as SupportStatus,
                      title: "3. การส่งต่อเสร็จสมบูรณ์",
                      desc: "ได้รับการช่วยเหลือเสร็จสิ้น มีผลประเมินชัดเจน",
                      activeClass:
                        "border-emerald-400 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200 dark:border-emerald-800",
                    },
                    {
                      id: "cancelled" as SupportStatus,
                      title: "ยกเลิกการส่งต่อ",
                      desc: "ยุติรายการนี้โดยไม่ส่งต่อ (ยังคงเก็บประวัติไว้)",
                      activeClass:
                        "border-rose-400 bg-rose-50 text-rose-900 dark:bg-rose-950/40 dark:text-rose-200 dark:border-rose-800",
                    },
                  ].map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setTargetStatus(s.id)}
                      disabled={isPending}
                      aria-pressed={targetStatus === s.id}
                      className={`w-full text-left p-3 rounded-xl border text-xs font-medium transition-colors ${
                        targetStatus === s.id
                          ? s.activeClass
                          : "border-border bg-card hover:bg-muted/60 text-foreground"
                      }`}
                    >
                      <div className="font-semibold">{s.title}</div>
                      <div className="text-muted-foreground mt-0.5">{s.desc}</div>
                    </button>
                  ))}
                </div>

                <div className="pt-2">
                  <label
                    htmlFor="statusNote"
                    className="block text-xs font-medium text-foreground mb-1"
                  >
                    หมายเหตุการเปลี่ยนสถานะ (ระบุหรือไม่ก็ได้)
                  </label>
                  <Input
                    id="statusNote"
                    value={statusNote}
                    onChange={(e) => setStatusNote(e.target.value)}
                    placeholder="เช่น หนังสือตอบรับเลขที่... หรือผลสรุปเบื้องต้น"
                    className="text-xs rounded-xl"
                  />
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleUpdateStatus}
                    disabled={isPending || targetStatus === selectedStatus}
                    className="w-full mt-2 text-xs"
                  >
                    {isPending ? (
                      <LoaderCircle className="size-3.5 animate-spin mr-1" />
                    ) : null}
                    บันทึกเปลี่ยนสถานะเป็น &quot;{referralStatusLabels[targetStatus]}&quot;
                  </Button>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-border/70 bg-muted/30 p-4 text-xs text-muted-foreground space-y-2">
                <p className="font-medium text-foreground">
                  สถานะปัจจุบัน: {referralStatusLabels[referral.status] ?? referral.status}
                </p>
                <p>คุณไม่มีสิทธิ์แก้ไขสถานะของเคสนี้ (เฉพาะผู้บันทึกส่งต่อ, ครูแนะแนว, หรือผู้บริหาร)</p>
              </div>
            )}
          </div>

          {/* Form 2: Standalone Follow-up Progress Log */}
          {referral.canEdit ? (
            <div className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-2.5">
                <h2 className="text-sm font-semibold text-foreground">บันทึกความคืบหน้าการติดตามผล</h2>
                <span className="text-xs text-muted-foreground">ไม่เปลี่ยนสถานะ</span>
              </div>

              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label
                    htmlFor="followupResult"
                    className="block text-xs font-medium text-foreground"
                  >
                    ผลการประสานงาน / หัวข้อ
                  </label>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {[
                      "โทรติดตามความคืบหน้า",
                      "หน่วยงานตอบรับหนังสือแล้ว",
                      "ผู้ปกครองพานักเรียนไปรับบริการแล้ว",
                      "อยู่ระหว่างรอผลการตรวจ",
                      "เสร็จสิ้นการบำบัดรักษา",
                    ].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setFollowupResult(preset)}
                        className={`rounded-md px-2 py-0.5 text-xs font-medium border transition-colors ${
                          followupResult === preset
                            ? "bg-primary/10 border-primary text-primary"
                            : "bg-muted border-border text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                  <Input
                    id="followupResult"
                    value={followupResult}
                    onChange={(e) => setFollowupResult(e.target.value)}
                    placeholder="หัวข้อผลการติดตาม..."
                    className="text-xs rounded-xl"
                  />
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="followupDescription"
                    className="block text-xs font-medium text-foreground"
                  >
                    รายละเอียดการติดตามผล <span className="text-destructive">*</span>
                  </label>
                  <Textarea
                    id="followupDescription"
                    value={followupDescription}
                    onChange={(e) => setFollowupDescription(e.target.value)}
                    placeholder="ระบุข้อความติดต่อหน่วยงาน ผลการพบแพทย์ หรือความก้าวหน้า..."
                    rows={3}
                    className="text-xs rounded-xl"
                  />
                </div>

                <Button
                  type="button"
                  size="sm"
                  onClick={handleAddFollowup}
                  disabled={isPending || followupDescription.trim().length === 0}
                  className="w-full text-xs"
                >
                  {isPending ? (
                    <LoaderCircle className="size-3.5 animate-spin mr-1" />
                  ) : (
                    <Send className="size-3.5 mr-1" />
                  )}
                  เพิ่มบันทึกติดตามผลใหม่
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* Printable Thai OBEC Referral Slip (Official Layout for Print) */}
      <div className="hidden print:block font-serif bg-white text-black p-8 max-w-3xl mx-auto space-y-6 text-sm leading-relaxed">
        <style dangerouslySetInnerHTML={{ __html: "@media print { @page { size: A4 portrait; margin: 12mm; } }" }} />
        <div className="text-center space-y-1 border-b-2 border-black pb-4">
          <h2 className="text-lg font-bold">แบบบันทึกการส่งต่อนักเรียน (Referral Form)</h2>
          <p className="text-sm">ระบบการดูแลช่วยเหลือนักเรียน สำนักงานคณะกรรมการการศึกษาขั้นพื้นฐาน (สพฐ.)</p>
          <p className="text-xs">ประเภทการส่งต่อ: {referral.referral_type === "internal" ? "การส่งต่อภายในสถานศึกษา" : "การส่งต่อภายนอกสถานศึกษา"}</p>
        </div>

        <div className="flex justify-between text-xs">
          <span>เลขที่บันทึก: {referral.id.slice(0, 8)}</span>
          <span>วันที่ส่งต่อ: {formatThaiShortDate(referral.created_at)}</span>
        </div>

        <div className="border border-black p-3 space-y-2">
          <p className="font-bold underline text-xs">1. หน่วยงาน/บุคคลที่รับการส่งต่อ</p>
          <p><strong>ส่งต่อไปยัง:</strong> {referral.target_agency}</p>
          <p><strong>ระดับความเร่งด่วน:</strong> {referralPriorityLabels[referral.priority ?? ""] || referral.priority || "ปกติ"}</p>
        </div>

        <div className="border border-black p-3 space-y-2">
          <p className="font-bold underline text-xs">2. ข้อมูลนักเรียนผู้รับการส่งต่อ</p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <p><strong>ชื่อ-สกุล:</strong> {studentName}</p>
            <p><strong>รหัสประจำตัว:</strong> {student?.student_code || "-"}</p>
            <p><strong>ชั้น/ห้อง:</strong> {classroomLabel || "-"}</p>
            <p><strong>วันเกิด:</strong> {student?.date_of_birth ? formatThaiShortDate(student.date_of_birth) : "-"}</p>
            <p><strong>เลขประจำตัวประชาชน:</strong> {formatMaskedNationalId(student?.national_id)}</p>
            <p><strong>เพศ:</strong> {student?.gender === "male" ? "ชาย" : student?.gender === "female" ? "หญิง" : "-"}</p>
          </div>
        </div>

        <div className="border border-black p-3 space-y-2">
          <p className="font-bold underline text-xs">3. สภาพปัญหาและเหตุผลในการส่งต่อ</p>
          <p className="text-xs whitespace-pre-wrap">{referral.description}</p>
        </div>

        {referral.provided_support ? (
          <div className="border border-black p-3 space-y-2">
            <p className="font-bold underline text-xs">4. การดำเนินการช่วยเหลือเบื้องต้นที่โรงเรียนได้ปฏิบัติแล้ว</p>
            <p className="text-xs whitespace-pre-wrap">{referral.provided_support}</p>
          </div>
        ) : null}

        {referral.action_plan ? (
          <div className="border border-black p-3 space-y-2">
            <p className="font-bold underline text-xs">5. สิ่งที่ประสงค์ให้หน่วยงานปลายทางดำเนินการช่วยเหลือ</p>
            <p className="text-xs whitespace-pre-wrap">{referral.action_plan}</p>
          </div>
        ) : null}

        {/* Signatures */}
        <div className="grid grid-cols-3 gap-4 pt-8 text-center text-xs break-inside-avoid">
          <div className="space-y-6">
            <div className="border-b border-black w-32 mx-auto pt-8"></div>
            <div>
              <p>ลงชื่อ..................................................</p>
              <p>({referral.provider ? `${referral.provider.first_name} ${referral.provider.last_name}` : "ครูผู้ส่งต่อ"})</p>
              <p>ครูประจำชั้น / ครูผู้ส่งต่อ</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="border-b border-black w-32 mx-auto pt-8"></div>
            <div>
              <p>ลงชื่อ..................................................</p>
              <p>(..........................................................)</p>
              <p>ครูแนะแนว / หัวหน้างานดูแลช่วยเหลือนักเรียน</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="border-b border-black w-32 mx-auto pt-8"></div>
            <div>
              <p>ลงชื่อ..................................................</p>
              <p>(..........................................................)</p>
              <p>ผู้อำนวยการสถานศึกษา</p>
            </div>
          </div>
        </div>

        {/* Tear-off acknowledgment section */}
        <div className="border-t-2 border-dashed border-black pt-4 mt-6 text-xs space-y-2 break-inside-avoid">
          <p className="font-bold text-center underline">แบบตอบรับการส่งต่อนักเรียน (สำหรับหน่วยงานปลายทางส่งคืนสถานศึกษา)</p>
          <p>เรียน ผู้อำนวยการสถานศึกษา</p>
          <p>
            หน่วยงาน <strong>{referral.target_agency}</strong> ได้รับการส่งตัวนักเรียน <strong>{studentName}</strong> ไว้ในความดูแลแล้ว เมื่อวันที่ ....................................
          </p>
          <p>ผลการพิจารณาเบื้องต้น: ( ) รับดำเนินการช่วยเหลือ/บำบัดรักษา ( ) ส่งต่อผู้เชี่ยวชาญเฉพาะทางขั้นสูง ( ) อื่น ๆ ....................................</p>
          <div className="pt-6 text-right space-y-1">
            <p>ลงชื่อ.................................................................. ผู้รับการส่งต่อ</p>
            <p>ตำแหน่ง............................................................................</p>
          </div>
        </div>
      </div>
    </div>
  )
}
