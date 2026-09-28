import Form from "next/form"
import Link from "next/link"

import type { ClassroomOption, SemesterOption } from "@/lib/server/executive-read-models"

export function DashboardClassroomFilter({
  options,
  activeClassroomId,
  semesterOptions = [],
  activeSemesterId = null,
}: {
  options: ClassroomOption[]
  activeClassroomId: string | null
  semesterOptions?: SemesterOption[]
  activeSemesterId?: string | null
}) {
  if (options.length === 0 && semesterOptions.length === 0) return null

  const activeName = options.find((o) => o.id === activeClassroomId)?.name ?? null
  const activeSemesterName = semesterOptions.find((s) => s.id === activeSemesterId)?.name ?? null

  return (
    <Form
      action="/"
      className="flex flex-col gap-2 rounded-xl border border-border bg-card p-3 text-card-foreground sm:flex-row sm:items-end"
    >
      <span className="sr-only">
        ตัวกรองนี้มีผลกับตารางติดตามและข้อมูลเชิงลึกด้านล่าง การ์ดสรุปด้านบนเป็นภาพรวมทั้งโรงเรียนเสมอ
      </span>
      {options.length > 0 ? (
        <label className="flex flex-1 flex-col gap-1 text-xs font-medium sm:max-w-xs">
          <span className="text-muted-foreground">
            กรองตารางติดตาม: ห้องเรียน{activeName ? ` • ${activeName}` : " • ทุกห้อง"}
          </span>
          <select
            name="classroom"
            defaultValue={activeClassroomId ?? ""}
            className="h-9 rounded-lg border border-input bg-background px-2.5 text-sm"
          >
            <option value="">ทุกห้องเรียน</option>
            {options.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name}
              </option>
            ))}
          </select>
        </label>
      ) : null}
      {semesterOptions.length > 0 ? (
        <label className="flex flex-1 flex-col gap-1 text-xs font-medium sm:max-w-xs">
          <span className="text-muted-foreground">
            ภาคเรียน (ผลการเรียน){activeSemesterName ? ` • ${activeSemesterName}` : ""}
          </span>
          <select
            name="semester"
            defaultValue={activeSemesterId ?? ""}
            className="h-9 rounded-lg border border-input bg-background px-2.5 text-sm"
          >
            {semesterOptions.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
                {s.isCurrent ? " (ปัจจุบัน)" : ""}
              </option>
            ))}
          </select>
        </label>
      ) : null}
      <div className="flex items-end gap-2">
        <button
          type="submit"
          className="h-9 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
        >
          กรอง
        </button>
        {activeClassroomId || (activeSemesterId && !semesterOptions.find((s) => s.id === activeSemesterId)?.isCurrent) ? (
          <Link
            href="/"
            className="inline-flex h-9 items-center rounded-lg border border-border px-4 text-sm font-medium hover:bg-muted"
          >
            ล้าง
          </Link>
        ) : null}
      </div>
    </Form>
  )
}
