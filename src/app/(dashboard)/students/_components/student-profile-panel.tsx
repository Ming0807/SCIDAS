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
      <div className="flex h-full min-h-[420px] flex-col rounded-xl border border-border bg-card p-5 text-card-foreground shadow-sm">
        <EmptyState
          title="เลือกนักเรียนเพื่อดูรายละเอียด"
          description="เมื่อมีข้อมูลนักเรียน ระบบจะแสดงสรุปความเสี่ยง ผู้ปกครอง และงานติดตามด้านขวา"
        />
      </div>
    )
  }

  return (
    <aside className="flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-sm">
      <div className="flex items-center justify-between border-b border-border bg-muted/40 px-5 py-3">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          โปรไฟล์นักเรียน
        </span>
        <StatusBadge status={student.status} label={student.statusLabel} size="sm" />
      </div>

      <div className="flex-1 overflow-y-auto p-5">
        <div className="flex flex-col gap-5 border-b border-border pb-5">
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

          <div className="flex flex-wrap gap-2">
            <span className="inline-flex min-h-6 items-center gap-1 rounded-full border border-border bg-muted px-2 text-xs font-medium text-muted-foreground">
              <BadgeCheck aria-hidden="true" className="size-3" />
              Priority {student.priorityScore.toLocaleString("th-TH")}
            </span>
            {student.nextDueDate ? (
              <span className="inline-flex min-h-6 items-center gap-1 rounded-full border border-border bg-muted px-2 text-xs font-medium text-muted-foreground">
                <Clock aria-hidden="true" className="size-3" />
                นัดถัดไป {formatThaiShortDate(student.nextDueDate)}
              </span>
            ) : null}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 py-5">
          <Link
            href={`/support/new?studentId=${student.id}`}
            className={cn(buttonVariants({ variant: "default" }))}
          >
            <ShieldAlert /> สร้างเคสดูแล
          </Link>
          <Link
            href={`/students/${student.id}`}
            className={cn(buttonVariants({ variant: "outline" }))}
          >
            <FileText /> ดูประวัติ
          </Link>
        </div>

        <div className="border-y border-border py-5">
          <h3 className="text-sm font-semibold text-foreground">ข้อมูลเบื้องต้น</h3>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">ชั้นเรียน</dt>
              <dd className="font-medium text-foreground">
                {student.grade}/{student.classroom}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">ผู้ปกครอง</dt>
              <dd className="max-w-44 text-right font-medium text-foreground">
                {student.guardian}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">เบอร์โทร</dt>
              <dd className="font-medium text-foreground">{student.phone}</dd>
            </div>
          </dl>
        </div>

        <div className="py-5">
          <h3 className="text-sm font-semibold text-foreground">สัญญาณที่ต้องดูแล</h3>
          <div className="mt-4 grid grid-cols-1 gap-3 2xl:grid-cols-2">
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
              label="งานที่เปิดอยู่"
              value={student.openActionCount.toLocaleString("th-TH")}
              detail="รายการที่ต้องมีผู้รับผิดชอบ"
            />
            <CareSignal
              label="แผน/เคสดูแล"
              value={(student.activePlanCount + student.openSupportCount).toLocaleString("th-TH")}
              detail="แผนและเคสที่ยังดำเนินการ"
            />
          </div>
        </div>
      </div>
    </aside>
  )
}
