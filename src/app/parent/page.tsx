import Link from "next/link"
import { ChevronRight, Users } from "lucide-react"

import { PageHeader, PageShell, StatusBadge } from "@/components/dashboard"
import { StudentIdentity } from "@/components/dashboard"
import { EmptyState } from "@/components/feedback"
import { getParentChildren } from "@/lib/server/parent-read-models"
import {
  getStudentRiskLabel,
  getStudentRiskTone,
} from "@/lib/student-care-formatters"
import { cn } from "@/lib/utils"

const relationLabels: Record<string, string> = {
  father: "บิดา",
  mother: "มารดา",
  grandfather: "ปู่/ตา",
  grandmother: "ย่า/ยาย",
  uncle: "ลุง/อา/น้า",
  aunt: "ป้า/อา/น้า",
  sibling: "พี่/น้อง",
  other_relative: "ญาติ",
  guardian: "ผู้ปกครอง",
}

export default async function ParentHomePage() {
  const children = await getParentChildren().catch(() => [])

  return (
    <PageShell size="default" spacing="default">
      <PageHeader
        title="บุตรหลานของท่าน"
        description={
          children.length > 0
            ? `นักเรียนในความดูแล ${children.length.toLocaleString("th-TH")} คน — แตะเพื่อดูรายละเอียด`
            : "บัญชีนี้ยังไม่ผูกกับนักเรียน โปรดติดต่อครูประจำชั้นเพื่อเปิดสิทธิ์"
        }
      />

      {children.length === 0 ? (
        <EmptyState
          title="ยังไม่มีข้อมูลบุตรหลาน"
          description="หากท่านเป็นผู้ปกครองนักเรียน โปรดติดต่อครูประจำชั้นเพื่อผูกบัญชีนี้กับนักเรียน"
        />
      ) : (
        <div className="flex flex-col gap-3">
          {children.map((child) => {
            const riskTone = getStudentRiskTone(child.riskLevel ?? "normal")
            const riskLabel = getStudentRiskLabel(child.riskLevel ?? "normal")

            return (
              <Link
                key={child.studentId}
                href={`/parent/${child.studentId}`}
                className={cn(
                  "flex items-center justify-between gap-3 rounded-xl border border-border p-4 text-card-foreground shadow-sm transition-colors hover:border-primary/40",
                  riskTone === "danger"
                    ? "border-l-4 border-l-rose-500 bg-rose-50/15 dark:bg-rose-950/10"
                    : riskTone === "watch"
                      ? "border-l-4 border-l-amber-500 bg-amber-50/15 dark:bg-amber-950/10"
                      : "border-l-4 border-l-emerald-500 bg-card",
                )}
              >
                <div className="flex min-w-0 items-center gap-3">
                  <StudentIdentity
                    avatarUrl={child.photoUrl ?? ""}
                    name={child.fullName}
                    studentCode={child.studentCode}
                    classroom={child.classroomName ?? undefined}
                    status={riskTone}
                    statusLabel={relationLabels[child.relation] ?? "ผู้ปกครอง"}
                    size="sm"
                  />
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <StatusBadge status={riskTone} label={riskLabel} size="sm" />
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <Users aria-hidden="true" className="size-4" />
                    <ChevronRight aria-hidden="true" className="size-4" />
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      )}

      <p className="text-center text-xs text-muted-foreground">
        ข้อมูล read-only หากพบข้อมูลไม่ถูกต้อง โปรดติดต่อครูประจำชั้น
      </p>
    </PageShell>
  )
}
