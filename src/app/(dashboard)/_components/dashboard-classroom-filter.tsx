import Form from "next/form"
import Link from "next/link"

import type { ClassroomOption } from "@/lib/server/executive-read-models"

export function DashboardClassroomFilter({
  options,
  activeClassroomId,
}: {
  options: ClassroomOption[]
  activeClassroomId: string | null
}) {
  if (options.length === 0) return null

  const activeName = options.find((o) => o.id === activeClassroomId)?.name ?? null

  return (
    <Form
      action="/"
      className="flex flex-col gap-2 rounded-xl border border-border bg-card p-3 text-card-foreground sm:flex-row sm:items-center"
    >
      <label className="flex flex-1 flex-col gap-1 text-xs font-medium sm:max-w-xs">
        <span className="text-muted-foreground">
          กรองตามห้องเรียน{activeName ? ` • กำลังดู: ${activeName}` : " • กำลังดู: ทุกห้อง"}
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
      <div className="flex items-end gap-2">
        <button
          type="submit"
          className="h-9 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
        >
          กรอง
        </button>
        {activeClassroomId ? (
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
