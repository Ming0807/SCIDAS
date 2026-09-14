import Link from "next/link"
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
      description={`รวม ${total.toLocaleString("th-TH")} คนจากข้อมูลปัจจุบัน · คลิกเพื่อกรองตามระดับชั้น`}
      actions={<Users aria-hidden="true" className="size-4 text-muted-foreground" />}
      contentClassName="pt-1"
    >
      {items.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
          {items.map((item) => {
            const isActive = activeGrade === item.gradeLevel
            const href = isActive
              ? "/students"
              : item.gradeLevel
                ? `/students?grade=${encodeURIComponent(item.gradeLevel)}`
                : "/students"

            return (
              <Link
                key={item.id}
                href={href}
                className={cn(
                  "group flex min-h-24 flex-col justify-between rounded-xl border border-border/80 bg-background p-3.5 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-xs",
                  isActive && "border-primary bg-primary/5 ring-1 ring-primary shadow-xs",
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <span
                    className={cn(
                      "text-sm font-semibold transition-colors group-hover:text-primary",
                      isActive ? "text-primary" : "text-foreground",
                    )}
                  >
                    {item.label}
                  </span>
                  {item.highRisk > 0 ? (
                    <StatusBadge status="high-risk" label={`เสี่ยง ${item.highRisk}`} size="sm" />
                  ) : item.watch > 0 ? (
                    <StatusBadge status="watch" label={`เฝ้าระวัง ${item.watch}`} size="sm" />
                  ) : null}
                </div>
                <div className="space-y-1 mt-2">
                  <div className="text-xl font-bold tabular-nums text-foreground">
                    {item.count.toLocaleString("th-TH")}
                    <span className="ml-1 text-xs font-normal text-muted-foreground">คน</span>
                  </div>
                  <div className="flex items-center justify-between text-micro text-muted-foreground">
                    <span>ติดตาม {(item.watch + item.highRisk).toLocaleString("th-TH")} คน</span>
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity text-primary font-medium">
                      {isActive ? "ล้าง" : "กรอง"} &rarr;
                    </span>
                  </div>
                </div>
              </Link>
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
