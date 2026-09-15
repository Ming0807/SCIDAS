import Link from "next/link"
import {
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  ListChecks,
} from "lucide-react"

import { StatusBadge } from "@/components/dashboard"
import { EmptyState } from "@/components/feedback"
import { formatThaiShortDate } from "@/lib/student-care-formatters"
import type { ActionQueueItem } from "@/lib/server/student-care-read-models"
import { cn } from "@/lib/utils"

function getPriorityTone(priority: ActionQueueItem["priority"]) {
  if (priority === "critical" || priority === "high") return "high-risk"
  if (priority === "medium") return "watch"
  return "normal"
}

function getPriorityLabel(priority: ActionQueueItem["priority"]) {
  const labels: Record<ActionQueueItem["priority"], string> = {
    low: "ต่ำ",
    medium: "กลาง",
    high: "สูง",
    critical: "เร่งด่วน",
  }

  return labels[priority]
}

function isPastDue(dueDateStr?: string | null) {
  if (!dueDateStr) return false
  const d = new Date(dueDateStr)
  if (Number.isNaN(d.getTime())) return false
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return d.getTime() < today.getTime()
}

function formatActionTitle(title: string) {
  if (title === "Review high-risk student") return "ทบทวนแผนช่วยเหลือนักเรียนกลุ่มเสี่ยงสูง"
  if (title === "Review watch student") return "ทบทวนการติดตามนักเรียนกลุ่มเฝ้าระวัง"
  if (title.startsWith("Review ")) {
    return title.replace("Review ", "ทบทวน ").replace("student", "นักเรียน")
  }
  return title
}

function formatActionCategory(category: string) {
  const map: Record<string, string> = {
    risk_follow_up: "ติดตามความเสี่ยง",
    home_visit: "เยี่ยมบ้าน",
    support: "การช่วยเหลือ",
    support_case: "เคสช่วยเหลือ",
    academic: "วิชาการ",
    attendance: "เวลาเรียน",
    behavior: "พฤติกรรม",
    sdq: "คัดกรอง SDQ",
    counseling: "ให้คำปรึกษา",
  }
  return map[category] ?? category
}

export function ActionItems({
  items,
  className,
}: {
  items: ActionQueueItem[]
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex flex-col justify-between rounded-2xl border border-border bg-card p-5 shadow-xs transition-all",
        className,
      )}
    >
      <div>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-border/60">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <ListChecks className="size-4" />
              </span>
              <h3 className="text-base font-bold text-foreground tracking-tight">
                ศูนย์ปฏิบัติการดูแล (Care Action Queue)
              </h3>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {items.length > 0
                ? `มีงานค้างดำเนินการ ${items.length.toLocaleString("th-TH")} รายการที่ต้องติดตาม`
                : "ไม่มีงานค้างติดตามในขณะนี้"}
            </p>
          </div>
          <Link
            href="/support"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary/80 transition-colors shrink-0 group"
          >
            <span>ดูทั้งหมด</span>
            <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        {/* Content List */}
        <div className="mt-3 space-y-2">
          {items.length > 0 ? (
            items.slice(0, 5).map((item) => {
              const pastDue = isPastDue(item.dueDate)
              return (
                <div
                  key={item.id}
                  className="group relative flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-background/50 p-2.5 sm:p-3 transition-all hover:bg-muted/40 hover:border-primary/20 hover:shadow-2xs"
                >
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "size-2 shrink-0 rounded-full",
                          item.priority === "critical"
                            ? "bg-rose-600 animate-pulse"
                            : item.priority === "high"
                              ? "bg-rose-500"
                              : item.priority === "medium"
                                ? "bg-amber-500"
                                : "bg-emerald-500",
                        )}
                      />
                      <p className="truncate text-xs sm:text-sm font-semibold text-foreground group-hover:text-primary transition-colors leading-tight">
                        {formatActionTitle(item.title)}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 text-micro sm:text-xs text-muted-foreground">
                      {item.studentId ? (
                        <Link
                          href={`/students/${item.studentId}`}
                          className="font-medium text-foreground hover:text-primary hover:underline truncate max-w-[130px]"
                        >
                          {item.studentName ?? "นักเรียน"}
                        </Link>
                      ) : (
                        <span className="font-medium text-foreground truncate max-w-[130px]">
                          {item.studentName ?? "ทั่วไป"}
                        </span>
                      )}
                      <span className="text-muted-foreground/40">•</span>
                      <span className="rounded-md bg-muted px-1.5 py-0.5 text-micro font-medium text-muted-foreground">
                        {formatActionCategory(item.category)}
                      </span>
                      {item.dueDate && (
                        <>
                          <span className="text-muted-foreground/40">•</span>
                          <span
                            className={cn(
                              "inline-flex items-center gap-1 text-micro font-medium whitespace-nowrap",
                              pastDue ? "text-destructive font-semibold" : "text-muted-foreground",
                            )}
                          >
                            <CalendarClock className="size-3 shrink-0" />
                            {pastDue ? "เลยกำหนด " : "ครบกำหนด "}
                            {formatThaiShortDate(item.dueDate)}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <StatusBadge
                      status={getPriorityTone(item.priority)}
                      label={getPriorityLabel(item.priority)}
                      size="sm"
                    />
                    <Link
                      href={item.studentId ? `/students/${item.studentId}` : "/support"}
                      className="inline-flex items-center gap-1 rounded-lg border border-border bg-card px-2.5 py-1 text-xs font-medium text-foreground transition-all hover:bg-primary hover:text-primary-foreground hover:border-primary shadow-2xs"
                    >
                      <span className="hidden sm:inline">จัดการ</span>
                      <ChevronRight className="size-3" />
                    </Link>
                  </div>
                </div>
              )
            })
          ) : (
            <EmptyState
              icon={CheckCircle2}
              size="compact"
              title="ไม่มีงานค้างติดตาม"
              description="เมื่อตรวจพบความเสี่ยงหรือสร้างเคสดูแล งานจะปรากฏตรงนี้อัตโนมัติ"
            />
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <CheckCircle2 className="size-3.5 text-muted-foreground/80" />
          <span>ส่งต่อและติดตามความคืบหน้าแบบบูรณาการ</span>
        </span>
        <Link
          href="/support"
          className="text-micro text-primary hover:underline flex items-center font-medium"
        >
          จัดการเคส <ChevronRight className="size-3" />
        </Link>
      </div>
    </div>
  )
}
