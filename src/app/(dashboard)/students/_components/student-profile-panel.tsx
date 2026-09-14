import Link from "next/link"
import { BadgeCheck, Clock, FileText, ShieldAlert } from "lucide-react"

import { StatusBadge, StudentIdentity } from "@/components/dashboard"
import { EmptyState } from "@/components/feedback"
import { buttonVariants } from "@/components/ui/button"
import { formatPercent, formatThaiShortDate } from "@/lib/student-care-formatters"
import { cn } from "@/lib/utils"

import type { StudentListItem } from "./student-data"

function CareSignal({
  label,
  value,
  detail,
}: {
  label: string
  value: string | number
  detail: string
}) {
  return (
    <div className="rounded-lg border border-border bg-background p-3">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-2 text-xl font-semibold tabular-nums text-foreground">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
    </div>
  )
}

export function StudentProfilePanel({
  student,
}: {
  student: StudentListItem | null
}) {
  if (!student) {
    return (
      <div className="flex h-full min-h-[420px] flex-col rounded-2xl border border-border bg-card p-6 text-card-foreground shadow-xs">
        <EmptyState
          title="เลือกนักเรียนเพื่อดูรายละเอียด"
          description="เมื่อคลิกที่นักเรียนในตาราง ระบบจะแสดงสรุปความเสี่ยง ผู้ปกครอง และสัญญาณดูแลทันทีที่นี่"
        />
      </div>
    )
  }

  return (
    <aside className="flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card text-card-foreground shadow-xs transition-all">
      <div className="flex items-center justify-between border-b border-border/70 bg-muted/30 px-5 py-3.5">
        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          สรุปแฟ้มประวัติรายบุคคล
        </span>
        <StatusBadge status={student.status} label={student.statusLabel} size="sm" />
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        <div className="flex flex-col gap-3 pb-5 border-b border-border/60">
          <StudentIdentity
            avatarUrl={student.avatarUrl}
            name={student.name}
            studentCode={student.studentCode}
            grade={student.grade}
            classroom={student.classroom}
            meta={student.studentNumber ? `เลขที่ ${student.studentNumber}` : undefined}
            status={student.status}
            statusLabel={student.statusLabel}
          />

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="inline-flex min-h-6 items-center gap-1 rounded-full border border-border bg-muted/60 px-2.5 text-xs font-semibold text-foreground">
              <BadgeCheck aria-hidden="true" className="size-3 text-primary" />
              Priority Score: {student.priorityScore.toLocaleString("th-TH")}
            </span>
            {student.nextDueDate ? (
              <span className="inline-flex min-h-6 items-center gap-1 rounded-full border border-border bg-muted/60 px-2.5 text-xs font-medium text-muted-foreground">
                <Clock aria-hidden="true" className="size-3" />
                นัดหมาย {formatThaiShortDate(student.nextDueDate)}
              </span>
            ) : null}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Link
            href={`/students/${student.id}`}
            className={cn(
              buttonVariants({ variant: "default" }),
              "gap-1.5 font-semibold text-xs shadow-xs",
            )}
          >
            <FileText className="size-3.5" /> ดูประวัติ 360°
          </Link>
          <Link
            href={`/support/new?studentId=${student.id}`}
            className={cn(
              buttonVariants({ variant: "outline" }),
              "gap-1.5 font-semibold text-xs border-border/80 hover:border-primary/40",
            )}
          >
            <ShieldAlert className="size-3.5 text-rose-500" /> เปิดเคสช่วยเหลือ
          </Link>
        </div>

        <div className="rounded-xl border border-border/60 bg-muted/20 p-3.5 space-y-2.5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            ข้อมูลติดต่อ & ครอบครัว
          </h3>
          <dl className="space-y-2 text-xs">
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">ระดับชั้น/ห้อง</dt>
              <dd className="font-semibold text-foreground">
                {student.grade}/{student.classroom}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">ผู้ปกครองหลัก</dt>
              <dd className="max-w-44 text-right font-semibold text-foreground truncate">
                {student.guardian || "-"}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">เบอร์โทรศัพท์</dt>
              <dd className="font-semibold text-foreground tabular-nums">
                {student.phone ? (
                  <a href={`tel:${student.phone}`} className="hover:text-primary hover:underline">
                    {student.phone}
                  </a>
                ) : (
                  "-"
                )}
              </dd>
            </div>
          </dl>
        </div>

        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
            สัญญาณและตัวชี้วัดความเสี่ยง
          </h3>
          <div className="grid grid-cols-2 gap-2.5">
            <CareSignal
              label="การมาเรียน 30 วัน"
              value={formatPercent(student.attendanceRate30d)}
              detail={`ขาด ${student.absentDays30d} วัน / สาย ${student.lateDays30d} วัน`}
            />
            <CareSignal
              label="คะแนนความเสี่ยง"
              value={student.riskScore.toLocaleString("th-TH")}
              detail={student.statusLabel}
            />
            <CareSignal
              label="งานดูแลค้าง"
              value={student.openActionCount.toLocaleString("th-TH")}
              detail="งานที่ยังเปิดอยู่"
            />
            <CareSignal
              label="แผน/เคสช่วยเหลือ"
              value={(student.activePlanCount + student.openSupportCount).toLocaleString("th-TH")}
              detail="กำลังดำเนินการ"
            />
          </div>
        </div>
      </div>
    </aside>
  )
}
