"use client"

import React, { useMemo, useState, useEffect } from "react"
import Form from "next/form"
import Link from "next/link"
import { Search, X } from "lucide-react"

import { FilterBar } from "@/components/data"
import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { inferGradeAndSection } from "@/lib/student-room-inference"

import type { StudentFilterOptions, StudentFilterState } from "./student-data"

function SelectControl({
  label,
  name,
  value,
  allLabel,
  options,
  onChange,
}: {
  label: string
  name: keyof StudentFilterState
  value: string
  allLabel: string
  options: Array<{ value: string; label: string; count: number; gradeLevel?: string }>
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void
}) {
  return (
    <label className="min-w-32 text-sm">
      <span className="sr-only">{label}</span>
      <select
        className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground outline-none transition-colors focus:border-ring focus:ring-3 focus:ring-ring/50"
        value={value}
        name={name}
        onChange={onChange}
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

function ActiveFilterTag({
  label,
  value,
  removeHref,
}: {
  label: string
  value: string
  removeHref: string
}) {
  return (
    <span className="inline-flex min-h-6 items-center gap-1 rounded-full border border-border bg-muted pl-2.5 pr-1.5 py-0.5 text-xs font-medium text-muted-foreground">
      <span>
        {label}: <strong className="text-foreground">{value}</strong>
      </span>
      <Link
        href={removeHref}
        className="rounded-full p-0.5 hover:bg-background/80 hover:text-foreground text-muted-foreground transition"
        title={`ลบตัวกรอง ${label}`}
      >
        <X className="size-3" />
      </Link>
    </span>
  )
}

function createHrefWithoutKey(
  filters: StudentFilterState,
  keyToRemove: keyof StudentFilterState,
) {
  const params = new URLSearchParams()
  if (keyToRemove !== "q" && filters.q) params.set("q", filters.q)
  if (keyToRemove !== "grade" && filters.grade) params.set("grade", filters.grade)
  if (keyToRemove !== "classroom" && filters.classroom)
    params.set("classroom", filters.classroom)
  if (keyToRemove !== "status" && filters.status) params.set("status", filters.status)
  const q = params.toString()
  return q ? `/students?${q}` : "/students"
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
  const [selectedGrade, setSelectedGrade] = useState<string>(filters.grade || "")
  const [selectedClassroom, setSelectedClassroom] = useState<string>(
    filters.classroom || "",
  )
  const [selectedStatus, setSelectedStatus] = useState<string>(filters.status || "")

  useEffect(() => {
    setSelectedGrade(filters.grade || "")
    setSelectedClassroom(filters.classroom || "")
    setSelectedStatus(filters.status || "")
  }, [filters.grade, filters.classroom, filters.status])

  // Contextually filter classroom options based on the chosen grade
  const contextualClassrooms = useMemo(() => {
    if (!selectedGrade) {
      return options.classrooms
    }

    const filtered = options.classrooms.filter((c) => {
      if (c.gradeLevel && c.gradeLevel.toLowerCase() === selectedGrade.toLowerCase()) {
        return true
      }
      const inferred = inferGradeAndSection(c.label) || inferGradeAndSection(c.value)
      return inferred?.gradeLevel?.toLowerCase() === selectedGrade.toLowerCase()
    })

    // If grade was specified but no rooms matched, keep all as safe fallback
    return filtered.length > 0 ? filtered : options.classrooms
  }, [selectedGrade, options.classrooms])

  const activeFilters = [
    filters.q
      ? {
          label: "ค้นหา",
          value: filters.q,
          removeHref: createHrefWithoutKey(filters, "q"),
        }
      : null,
    filters.grade
      ? {
          label: "ชั้นเรียน",
          value:
            options.grades.find((option) => option.value === filters.grade)?.label ??
            filters.grade,
          removeHref: createHrefWithoutKey(filters, "grade"),
        }
      : null,
    filters.classroom
      ? {
          label: "ห้องเรียน",
          value:
            options.classrooms.find((option) => option.value === filters.classroom)
              ?.label ?? filters.classroom,
          removeHref: createHrefWithoutKey(filters, "classroom"),
        }
      : null,
    filters.status
      ? {
          label: "สถานะ",
          value:
            options.statuses.find((option) => option.value === filters.status)?.label ??
            filters.status,
          removeHref: createHrefWithoutKey(filters, "status"),
        }
      : null,
  ].filter(Boolean) as Array<{ label: string; value: string; removeHref: string }>

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
              value={selectedGrade}
              allLabel="ชั้นเรียนทั้งหมด"
              options={options.grades}
              onChange={(e) => {
                const newGrade = e.target.value
                setSelectedGrade(newGrade)
                setSelectedClassroom("") // reset classroom when grade changes
                e.target.form?.requestSubmit()
              }}
            />
            <SelectControl
              label="ห้องเรียน"
              name="classroom"
              value={selectedClassroom}
              allLabel="ห้องเรียนทั้งหมด"
              options={contextualClassrooms}
              onChange={(e) => {
                setSelectedClassroom(e.target.value)
                e.target.form?.requestSubmit()
              }}
            />
            <SelectControl
              label="สถานะ"
              name="status"
              value={selectedStatus}
              allLabel="สถานะทั้งหมด"
              options={options.statuses}
              onChange={(e) => {
                setSelectedStatus(e.target.value)
                e.target.form?.requestSubmit()
              }}
            />
            <Button type="submit" variant="secondary">
              <Search className="size-4" /> ค้นหา
            </Button>
          </>
        }
        activeFilters={
          activeFilters.length > 0
            ? activeFilters.map((filter) => (
                <ActiveFilterTag
                  key={`${filter.label}-${filter.value}`}
                  label={filter.label}
                  value={filter.value}
                  removeHref={filter.removeHref}
                />
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
        actions={null}
      />
    </Form>
  )
}
