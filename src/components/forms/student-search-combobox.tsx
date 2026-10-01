"use client"

import { useId, useMemo, useState } from "react"
import { Search, X } from "lucide-react"

import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export type ComboboxStudent = {
  id: string
  first_name: string
  last_name: string
  student_code?: string | null
  classroom_name?: string | null
  classroom?: string | null
  prefix?: string | null
}

export type StudentSearchComboboxProps = {
  students: ComboboxStudent[]
  name?: string
  id?: string
  value?: string
  defaultValue?: string
  onChange?: (studentId: string) => void
  label?: string
  required?: boolean
  disabled?: boolean
  error?: string
  className?: string
  placeholder?: string
  compact?: boolean
}

export function StudentSearchCombobox({
  students,
  name = "student_id",
  id: customId,
  value,
  defaultValue,
  onChange,
  label = "เลือกนักเรียน",
  required = false,
  disabled = false,
  error,
  className,
  placeholder = "-- เลือกนักเรียน --",
  compact = false,
}: StudentSearchComboboxProps) {
  const generatedId = useId()
  const selectId = customId ?? `student-select-${generatedId}`
  const searchId = `student-search-${generatedId}`
  const classroomId = `student-class-${generatedId}`

  const [internalSelectedId, setInternalSelectedId] = useState<string>(
    value ?? defaultValue ?? "",
  )
  const [selectedClassroom, setSelectedClassroom] = useState<string>("")
  const [searchKeyword, setSearchKeyword] = useState<string>("")

  const activeSelectedId = value !== undefined ? value : internalSelectedId

  // Extract unique classrooms if available
  const availableClassrooms = useMemo(() => {
    const set = new Set<string>()
    for (const s of students) {
      const room = s.classroom_name || s.classroom
      if (room && room.trim()) {
        set.add(room.trim())
      }
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b, "th"))
  }, [students])

  const filteredStudents = useMemo(() => {
    const q = searchKeyword.trim().toLowerCase()
    return students.filter((s) => {
      const room = (s.classroom_name || s.classroom || "").trim()
      if (selectedClassroom && room !== selectedClassroom) {
        return false
      }
      if (q) {
        const fullName = `${s.prefix ?? ""} ${s.first_name} ${s.last_name}`.toLowerCase()
        const code = (s.student_code ?? "").toLowerCase()
        if (!fullName.includes(q) && !code.includes(q)) {
          return false
        }
      }
      return true
    })
  }, [students, selectedClassroom, searchKeyword])

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nextId = e.target.value
    if (value === undefined) {
      setInternalSelectedId(nextId)
    }
    onChange?.(nextId)
  }

  const hasClassrooms = availableClassrooms.length > 0

  return (
    <div className={cn("space-y-3 rounded-2xl border border-border/70 bg-muted/30 p-3.5", className)}>
      <div className={cn("grid gap-2.5", hasClassrooms && !compact ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1")}>
        {hasClassrooms && (
          <div>
            <label htmlFor={classroomId} className="text-xs font-medium text-muted-foreground mb-1 block">
              กรองตามห้องเรียน
            </label>
            <select
              id={classroomId}
              value={selectedClassroom}
              onChange={(e) => setSelectedClassroom(e.target.value)}
              disabled={disabled}
              className="w-full h-9 rounded-xl border border-input bg-background px-3 py-1 text-xs focus:outline-hidden focus:ring-2 focus:ring-ring"
            >
              <option value="">ทุกห้องเรียน ({students.length} คน)</option>
              {availableClassrooms.map((c) => {
                const count = students.filter(
                  (s) => (s.classroom_name || s.classroom || "").trim() === c,
                ).length
                return (
                  <option key={c} value={c}>
                    ห้อง {c} ({count} คน)
                  </option>
                )
              })}
            </select>
          </div>
        )}

        <div>
          <label htmlFor={searchId} className="text-xs font-medium text-muted-foreground mb-1 block">
            ค้นหาชื่อ หรือ รหัสนักเรียน
          </label>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
            <Input
              id={searchId}
              type="search"
              placeholder="พิมพ์ชื่อ นามสกุล หรือรหัส..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              disabled={disabled}
              className="h-9 pl-8 pr-7 text-xs bg-background rounded-xl"
            />
            {searchKeyword ? (
              <button
                type="button"
                onClick={() => setSearchKeyword("")}
                disabled={disabled}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-xs p-0.5 cursor-pointer"
                title="ล้างคำค้นหา"
              >
                <X className="size-3.5" />
              </button>
            ) : null}
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <label htmlFor={selectId} className="text-xs font-medium text-foreground">
            {label} {required && <span className="text-destructive">*</span>}
          </label>
          <span className="text-xs text-muted-foreground">
            พบ {filteredStudents.length} จาก {students.length} คน
          </span>
        </div>
        <select
          id={selectId}
          name={name}
          required={required}
          disabled={disabled}
          value={activeSelectedId}
          onChange={handleSelectChange}
          aria-invalid={error ? true : undefined}
          className="w-full h-10 rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-hidden focus:ring-2 focus:ring-ring"
        >
          <option value="">{placeholder}</option>
          {filteredStudents.map((s) => {
            const room = s.classroom_name || s.classroom
            return (
              <option key={s.id} value={s.id}>
                {s.prefix ? `${s.prefix} ` : ""}
                {s.first_name} {s.last_name}
                {s.student_code ? ` (รหัส: ${s.student_code})` : ""}
                {room ? ` - ห้อง ${room}` : ""}
              </option>
            )
          })}
        </select>
        {error && (
          <p className="mt-1 text-xs text-destructive" role="alert">
            {error}
          </p>
        )}
      </div>
    </div>
  )
}
