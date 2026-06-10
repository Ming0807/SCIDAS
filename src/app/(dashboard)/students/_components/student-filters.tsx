import Form from "next/form"
import Link from "next/link"
import { Download, Plus, Search, Upload, Users } from "lucide-react"

import { FilterBar } from "@/components/data"
import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

import type { StudentFilterOptions, StudentFilterState } from "./student-data"

function SelectControl({
  label,
  name,
  value,
  allLabel,
  options,
}: {
  label: string
  name: keyof StudentFilterState
  value: string
  allLabel: string
  options: Array<{ value: string; label: string; count: number }>
}) {
  return (
    <label className="min-w-32 text-sm">
      <span className="sr-only">{label}</span>
      <select
        className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground outline-none transition-colors focus:border-ring focus:ring-3 focus:ring-ring/50"
        defaultValue={value}
        name={name}
      >
        <option value="">{allLabel}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label} ({option.count})
          </option>
        ))}
      </select>
    </label>
  )
}

function ActiveFilter({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <span className="inline-flex min-h-6 items-center rounded-full border border-border bg-muted px-2 text-xs font-medium text-muted-foreground">
      {label}: {value}
    </span>
  )
}

export function StudentFilters({
  filters,
  options,
  visibleCount,
  totalCount,
}: {
  filters: StudentFilterState
  options: StudentFilterOptions
  visibleCount: number
  totalCount: number
}) {
  const activeFilters = [
    filters.q ? { label: "ค้นหา", value: filters.q } : null,
    filters.grade
      ? {
          label: "ชั้นเรียน",
          value: options.grades.find((option) => option.value === filters.grade)?.label ?? filters.grade,
        }
      : null,
    filters.classroom
      ? {
          label: "ห้อง",
          value:
            options.classrooms.find((option) => option.value === filters.classroom)?.label ??
            filters.classroom,
        }
      : null,
    filters.status
      ? {
          label: "สถานะ",
          value:
            options.statuses.find((option) => option.value === filters.status)?.label ??
            filters.status,
        }
      : null,
  ].filter(Boolean) as Array<{ label: string; value: string }>

  return (
    <Form action="/students">
      <FilterBar
        title="ค้นหาและกรองข้อมูล"
        summary={`แสดง ${visibleCount.toLocaleString("th-TH")} จาก ${totalCount.toLocaleString("th-TH")} คน`}
        search={
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              name="q"
              defaultValue={filters.q}
              placeholder="ค้นหาชื่อนักเรียน, เลขประจำตัว, ผู้ปกครอง..."
              className="h-9 w-full rounded-lg border border-input bg-background pl-9 pr-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-3 focus:ring-ring/50"
            />
          </div>
        }
        filters={
          <>
            <SelectControl
              label="ชั้นเรียน"
              name="grade"
              value={filters.grade}
              allLabel="ชั้นเรียนทั้งหมด"
              options={options.grades}
            />
            <SelectControl
              label="ห้องเรียน"
              name="classroom"
              value={filters.classroom}
              allLabel="ห้องเรียนทั้งหมด"
              options={options.classrooms}
            />
            <SelectControl
              label="สถานะ"
              name="status"
              value={filters.status}
              allLabel="สถานะทั้งหมด"
              options={options.statuses}
            />
            <Button type="submit" variant="secondary">
              <Search /> ค้นหา
            </Button>
          </>
        }
        activeFilters={
          activeFilters.length > 0
            ? activeFilters.map((filter) => (
                <ActiveFilter key={`${filter.label}-${filter.value}`} {...filter} />
              ))
            : null
        }
        clearAction={
          activeFilters.length > 0 ? (
            <Link
              href="/students"
              className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
            >
              ล้างตัวกรอง
            </Link>
          ) : null
        }
        actions={
          <>
            <Button type="button">
              <Plus /> เพิ่มนักเรียน
            </Button>
            <Button type="button" variant="outline">
              <Upload /> นำเข้า
            </Button>
            <Button type="button" variant="outline">
              <Download /> ส่งออก
            </Button>
            <Button type="button" variant="secondary">
              <Users /> จัดการกลุ่ม
            </Button>
          </>
        }
      />
    </Form>
  )
}
