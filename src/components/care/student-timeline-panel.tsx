import type { SectionVariant } from "@/components/dashboard"
import { Section, StatusBadge } from "@/components/dashboard"
import { EmptyState } from "@/components/feedback"
import { formatThaiDateTime } from "@/lib/student-care-formatters"
import type { StudentTimelineItem } from "@/lib/server/student-care-read-models"

type StudentTimelinePanelProps = {
  studentId: string | null
  timeline: StudentTimelineItem[]
  title?: string
  description?: string
  variant?: SectionVariant
}

function getTimelineTypeLabel(type: string) {
  const labels: Record<string, string> = {
    attendance: "การมาเรียน",
    behavior: "พฤติกรรม",
    support: "ดูแลช่วยเหลือ",
    risk: "ความเสี่ยง",
    idp: "แผนพัฒนา",
    home_visit: "เยี่ยมบ้าน",
  }

  return labels[type] ?? type
}

function getSeverityTone(severity?: string | null) {
  if (severity === "critical" || severity === "high") return "high-risk"
  if (severity === "medium") return "watch"
  if (severity === "low") return "normal"
  return "neutral"
}

export function StudentTimelinePanel({
  studentId,
  timeline,
  title = "ไทม์ไลน์การดูแล",
  description = "รวมเหตุการณ์จากการมาเรียน พฤติกรรม ความเสี่ยง แผน และเยี่ยมบ้าน",
  variant = "plain",
}: StudentTimelinePanelProps) {
  return (
    <Section
      variant={variant}
      title={title}
      description={description}
      contentClassName="space-y-3"
    >
      {studentId ? (
        timeline.length > 0 ? (
          timeline.map((item) => (
            <article
              key={item.id}
              className="rounded-lg border border-border bg-card p-3 text-card-foreground"
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">{item.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatThaiDateTime(item.eventAt)}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <StatusBadge
                    status={getSeverityTone(item.severity)}
                    label={getTimelineTypeLabel(item.eventType)}
                    size="sm"
                  />
                </div>
              </div>
              {item.description ? (
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  {item.description}
                </p>
              ) : null}
            </article>
          ))
        ) : (
          <EmptyState
            size="compact"
            title="ยังไม่มีไทม์ไลน์"
            description="เมื่อมีเหตุการณ์ใหม่ ระบบจะแสดงลำดับการดูแลของนักเรียนคนนี้"
          />
        )
      ) : (
        <EmptyState
          title="เลือกนักเรียนเพื่อดูไทม์ไลน์"
          description="ไทม์ไลน์ช่วยให้เห็นลำดับเหตุการณ์ก่อนตัดสินใจขั้นต่อไป"
        />
      )}
    </Section>
  )
}
