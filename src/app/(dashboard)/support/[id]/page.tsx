import Link from "next/link"
import { ArrowLeft, CalendarDays, FilePenLine } from "lucide-react"
import { notFound } from "next/navigation"

import { getSupportRecord, type SupportCase } from "@/app/actions/support.actions"
import { SupportStatusForm } from "@/app/(dashboard)/support/_components/support-status-form"
import { ErrorState } from "@/components/feedback"
import { StatusBadge } from "@/components/dashboard"
import { Button } from "@/components/ui/button"
import { formatThaiDateTime, formatThaiShortDate } from "@/lib/student-care-formatters"

type SupportCasePageProps = {
  params: Promise<{ id: string }>
}

const supportTypeLabels: Record<SupportCase["support_type"], string> = {
  academic: "ด้านวิชาการ",
  behavioral: "ด้านพฤติกรรม",
  emotional: "ด้านจิตใจ/อารมณ์",
  financial: "ด้านเศรษฐกิจ",
  health: "ด้านสุขภาพ",
  family: "ด้านครอบครัว",
  social: "ด้านสังคม",
  other: "อื่น ๆ",
}

const statusLabels: Record<SupportCase["status"], string> = {
  pending: "รอดำเนินการ",
  in_progress: "กำลังดำเนินการ",
  completed: "เสร็จสิ้น",
  cancelled: "ยกเลิก",
  referred: "ส่งต่อ",
}

const priorityLabels: Record<NonNullable<SupportCase["priority"]>, string> = {
  low: "ต่ำ",
  medium: "ปานกลาง",
  high: "สูง",
  critical: "วิกฤต",
}

function DetailItem({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="space-y-1">
      <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
      <dd className="whitespace-pre-wrap text-sm text-foreground">{value || "-"}</dd>
    </div>
  )
}

export default async function SupportCasePage({ params }: SupportCasePageProps) {
  const { id } = await params
  const result = await getSupportRecord(id)

  if (!result.ok && result.code === "NOT_FOUND") notFound()
  if (!result.ok || !result.data) {
    return (
      <main className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6">
        <ErrorState
          title="โหลดรายละเอียดเคสไม่ได้"
          description={result.ok ? "ไม่พบข้อมูลเคส" : result.message}
        />
      </main>
    )
  }

  const supportCase = result.data
  const studentName = supportCase.student
    ? `${supportCase.student.first_name} ${supportCase.student.last_name}`
    : "ไม่พบข้อมูลนักเรียน"
  const providerName = supportCase.provider
    ? `${supportCase.provider.first_name} ${supportCase.provider.last_name}`
    : "ไม่พบข้อมูลผู้บันทึก"

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-6 sm:px-6 lg:py-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <Button nativeButton={false} variant="outline" size="icon" render={<Link href="/support" />} aria-label="กลับไปหน้าดูแลช่วยเหลือ">
            <ArrowLeft aria-hidden="true" />
          </Button>
          <div className="min-w-0">
            <p className="text-sm text-muted-foreground">เคสช่วยเหลือของ {studentName}</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">{supportCase.title}</h1>
            <p className="mt-2 text-sm text-muted-foreground">สร้างเมื่อ {formatThaiDateTime(supportCase.created_at)}</p>
          </div>
        </div>
        {supportCase.canEdit ? (
          <Button nativeButton={false} variant="outline" render={<Link href={`/support/${supportCase.id}/edit`} />}>
            <FilePenLine aria-hidden="true" />
            แก้ไขเคส
          </Button>
        ) : null}
      </header>

      <section className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">สถานะ</p>
          <div className="mt-2"><StatusBadge status={supportCase.status} label={statusLabels[supportCase.status]} /></div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">ความเร่งด่วน</p>
          <div className="mt-2"><StatusBadge status={supportCase.priority ?? "neutral"} label={supportCase.priority ? priorityLabels[supportCase.priority] : "ไม่ระบุ"} /></div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">หมวดหมู่</p>
          <p className="mt-2 text-sm font-medium text-foreground">{supportTypeLabels[supportCase.support_type]}</p>
        </div>
      </section>

      <section className="rounded-xl border border-border bg-card p-5 sm:p-6">
        <h2 className="text-base font-semibold text-foreground">รายละเอียดเคส</h2>
        <dl className="mt-5 grid gap-5 sm:grid-cols-2">
          <DetailItem label="นักเรียน" value={`${studentName}${supportCase.student?.student_code ? ` (${supportCase.student.student_code})` : ""}`} />
          <DetailItem label="ผู้บันทึก" value={providerName} />
          <DetailItem label="วันที่เริ่มต้น" value={formatThaiShortDate(supportCase.started_at)} />
          <DetailItem label="วันที่เสร็จสิ้น" value={formatThaiShortDate(supportCase.completed_at)} />
          <DetailItem label="ภาคการศึกษา" value={supportCase.semester_id} />
          <DetailItem label="อัปเดตล่าสุด" value={formatThaiDateTime(supportCase.updated_at)} />
        </dl>
        <div className="mt-6 border-t border-border pt-5">
          <DetailItem label="รายละเอียด" value={supportCase.description} />
        </div>
      </section>

      <section className="rounded-xl border border-border bg-card p-5 sm:p-6">
        <div className="flex items-center gap-2">
          <CalendarDays aria-hidden="true" className="size-4 text-muted-foreground" />
          <h2 className="text-base font-semibold text-foreground">แผนและการติดตาม</h2>
        </div>
        <dl className="mt-5 grid gap-5 lg:grid-cols-3">
          <DetailItem label="แผนดำเนินการ" value={supportCase.action_plan} />
          <DetailItem label="การช่วยเหลือที่ดำเนินการแล้ว" value={supportCase.provided_support} />
          <DetailItem label="การส่งต่อภายนอก" value={supportCase.external_referral} />
        </dl>
      </section>

      {supportCase.canEdit ? (
        <section className="rounded-xl border border-border bg-card p-5 sm:p-6">
          <h2 className="text-base font-semibold text-foreground">การดำเนินการ</h2>
          <p className="mt-1 text-sm text-muted-foreground">เลือกได้เฉพาะสถานะที่ต่อเนื่องจากสถานะปัจจุบัน</p>
          <div className="mt-4">
            <SupportStatusForm id={supportCase.id} currentStatus={supportCase.status} />
          </div>
        </section>
      ) : null}
    </main>
  )
}
