import { Download, FileSpreadsheet, Plus, Search } from "lucide-react"

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
    <label className="min-w-36 text-sm">
      <span className="sr-only">{label}</span>
      <select className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground outline-none transition-colors focus:border-ring focus:ring-3 focus:ring-ring/50">
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </label>
  )
}

export function AttendanceFilters() {
  return (
    <FilterBar
      title="ค้นหาและกรองการมาเรียน"
      summary="ตัวกรองเดียวกันสำหรับตาราง รายการมือถือ และรายงาน"
      search={
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="ค้นหาชื่อนักเรียน, เลขประจำตัว, ห้องเรียน"
            className="h-9 w-full rounded-lg border border-input bg-background pl-9 pr-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-3 focus:ring-ring/50"
          />
        </div>
      }
      filters={
        <>
          <SelectControl
            label="ระดับชั้น"
            options={["ระดับชั้นทั้งหมด", "ป.1", "ป.2", "ป.3", "ป.4", "ป.5", "ป.6"]}
          />
          <SelectControl
            label="ห้องเรียน"
            options={["ห้องเรียนทั้งหมด", "ห้อง 1", "ห้อง 2"]}
          />
          <SelectControl
            label="เดือน"
            options={["พฤษภาคม 2567", "เมษายน 2567"]}
          />
        </>
      }
      actions={
        <>
          <Button>
            <Plus /> บันทึกการมาเรียน
          </Button>
          <Button variant="outline">
            <FileSpreadsheet /> นำเข้า Excel
          </Button>
          <Button variant="outline">
            <Download /> ส่งออกรายงาน
          </Button>
        </>
      }
    />
  )
}
