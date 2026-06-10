import { Users } from "lucide-react"

import { Section, StatusBadge } from "@/components/dashboard"
import { EmptyState } from "@/components/feedback"
import { cn } from "@/lib/utils"

import type { ClassSummaryItem } from "./student-data"

export function ClassSummary({
  items,
  total,
  activeGrade,
}: {
  items: ClassSummaryItem[]
  total: number
  activeGrade?: string
}) {
  return (
    <Section
      variant="surface"
      title="จำนวนนักเรียนตามชั้นเรียน"
      description={`รวม ${total.toLocaleString("th-TH")} คนจากข้อมูลปัจจุบัน`}
      actions={<Users aria-hidden="true" className="size-4 text-muted-foreground" />}
      contentClassName="pt-1"
    >
      {items.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
          {items.map((item) => {
            const isActive = activeGrade === item.gradeLevel

            return (
              <div
                key={item.id}
                className={cn(
                  "flex min-h-24 flex-col justify-between rounded-lg border border-border bg-background p-3 transition-colors",
                  isActive && "border-primary bg-primary/5 ring-1 ring-primary",
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-sm font-medium text-muted-foreground">
                    {item.label}
                  </span>
                  {item.highRisk > 0 ? (
                    <StatusBadge status="high-risk" label={item.highRisk} size="sm" />
                  ) : item.watch > 0 ? (
                    <StatusBadge status="watch" label={item.watch} size="sm" />
                  ) : null}
                </div>
                <div className="space-y-1">
                  <div className="text-xl font-semibold tabular-nums text-foreground">
                    {item.count.toLocaleString("th-TH")}
                    <span className="ml-1 text-xs font-normal text-muted-foreground">คน</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    ติดตาม {(item.watch + item.highRisk).toLocaleString("th-TH")} คน
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <EmptyState
          size="compact"
          title="ยังไม่มีข้อมูลชั้นเรียน"
          description="เมื่อนำเข้าข้อมูลนักเรียน ระบบจะแสดงจำนวนแยกตามชั้นเรียนอัตโนมัติ"
        />
      )}
    </Section>
  )
}
