import { Download, Plus, Search, Upload, Users } from "lucide-react"

import { FilterBar } from "@/components/data"
import { Button } from "@/components/ui/button"

function SelectControl({
  label,
  options,
}: {
  label: string
  options: string[]
}) {
  return (
    <label className="min-w-32 text-sm">
      <span className="sr-only">{label}</span>
      <select className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground outline-none transition-colors focus:border-ring focus:ring-3 focus:ring-ring/50">
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </label>
  )
}

export function StudentFilters() {
  return (
    <FilterBar
      title="ค้นหาและกรองข้อมูล"
      summary="ใช้ตัวกรองเดียวกันทั้งตารางและรายการบนมือถือ"
      search={
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="ค้นหาชื่อนักเรียน, เลขประจำตัว..."
            className="h-9 w-full rounded-lg border border-input bg-background pl-9 pr-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-3 focus:ring-ring/50"
          />
        </div>
      }
      filters={
        <>
          <SelectControl
            label="ชั้นเรียน"
            options={["ชั้นเรียนทั้งหมด", "ป.1", "ป.2", "ป.3", "ป.4", "ป.5", "ป.6"]}
          />
          <SelectControl
            label="ห้องเรียน"
            options={["ห้องเรียนทั้งหมด", "ห้อง 1", "ห้อง 2"]}
          />
          <SelectControl
            label="สถานะ"
            options={["สถานะทั้งหมด", "ปกติ", "ติดตาม", "เสี่ยงสูง"]}
          />
        </>
      }
      actions={
        <>
          <Button>
            <Plus /> เพิ่มนักเรียน
          </Button>
          <Button variant="outline">
            <Upload /> นำเข้า
          </Button>
          <Button variant="outline">
            <Download /> ส่งออก
          </Button>
          <Button variant="secondary">
            <Users /> จัดการกลุ่ม
          </Button>
        </>
      }
    />
  )
}
