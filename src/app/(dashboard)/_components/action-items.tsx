import Link from "next/link"
import { AlertTriangle, CalendarClock, ChevronRight, ListChecks } from "lucide-react"

import { Section, StatusBadge } from "@/components/dashboard"
import { EmptyState } from "@/components/feedback"
import { formatThaiShortDate } from "@/lib/student-care-formatters"
import type { ActionQueueItem } from "@/lib/server/student-care-read-models"

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

export function ActionItems({ items }: { items: ActionQueueItem[] }) {
  return (
    <Section
      variant="surface"
      className="col-span-1 lg:col-span-3"
      title="รายการที่ต้องติดตาม"
      description={`${items.length.toLocaleString("th-TH")} งานที่ยังเปิดอยู่`}
      actions={
        <Link
          href="/support"
          className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
        >
          ดูทั้งหมด <ChevronRight className="size-3" />
        </Link>
      }
      contentClassName="space-y-3"
    >
      {items.length > 0 ? (
        items.slice(0, 5).map((item) => (
          <div
            key={item.id}
            className="flex items-start justify-between gap-3 rounded-lg border border-border bg-background p-3 transition-colors hover:bg-muted/40"
          >
            <div className="min-w-0 space-y-1">
              <div className="flex min-w-0 items-center gap-2">
                <ListChecks aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
                <p className="truncate text-sm font-medium text-foreground">{item.title}</p>
              </div>
              <p className="truncate text-xs text-muted-foreground">
                {item.studentName ?? "ไม่ระบุนักเรียน"} / {item.category}
              </p>
              {item.dueDate ? (
                <p className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <CalendarClock aria-hidden="true" className="size-3" />
                  ครบกำหนด {formatThaiShortDate(item.dueDate)}
                </p>
              ) : null}
            </div>
            <StatusBadge
              status={getPriorityTone(item.priority)}
              label={getPriorityLabel(item.priority)}
              size="sm"
            />
          </div>
        ))
      ) : (
        <EmptyState
          icon={AlertTriangle}
          size="compact"
          title="ยังไม่มีงานติดตามที่เปิดอยู่"
          description="เมื่อตรวจพบความเสี่ยงหรือสร้างเคสดูแล งานจะปรากฏตรงนี้อัตโนมัติ"
        />
      )}
    </Section>
  )
}
