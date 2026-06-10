import { BarChart2, Eye, MoreHorizontal } from "lucide-react"

import { StatusBadge, StudentIdentity } from "@/components/dashboard"
import { DataTable, Pagination, type DataTableColumn } from "@/components/data"
import { Button } from "@/components/ui/button"

import {
  academicRiskStudents,
  academicSummary,
  type AcademicStudent,
} from "./academic-data"

const columns: Array<DataTableColumn<AcademicStudent>> = [
  {
    id: "student",
    header: "นักเรียน",
    className: "min-w-64",
    cell: (student) => (
      <StudentIdentity
        avatarUrl={student.avatarUrl}
        name={student.name}
        grade={student.classroom}
        status={student.statusTone}
        statusLabel={student.status}
        size="sm"
      />
    ),
  },
  {
    id: "gpa",
    header: "GPA",
    className: "font-semibold text-red-700",
    cell: (student) => student.gpa.toFixed(2),
  },
  {
    id: "previousGpa",
    header: "เทอมก่อน",
    className: "text-muted-foreground",
    cell: (student) => student.previousGpa.toFixed(2),
  },
  {
    id: "weakSubject",
    header: "รายวิชาที่ต่ำกว่า 2.00",
    className: "min-w-52 text-muted-foreground",
    cell: (student) => student.weakSubject,
  },
  {
    id: "status",
    header: "สถานะ",
    cell: (student) => (
      <StatusBadge
        status={student.statusTone}
        label={student.status}
        size="sm"
      />
    ),
  },
  {
    id: "actions",
    header: "การจัดการ",
    align: "center",
    sticky: "right",
    cell: () => (
      <div className="flex items-center justify-center gap-1">
        <Button aria-label="ดูรายละเอียด" size="icon-sm" variant="ghost">
          <Eye />
        </Button>
        <Button aria-label="ดูพัฒนาการ" size="icon-sm" variant="ghost">
          <BarChart2 />
        </Button>
        <Button aria-label="เมนูเพิ่มเติม" size="icon-sm" variant="ghost">
          <MoreHorizontal />
        </Button>
      </div>
    ),
  },
]

export function StudentAcademicTable() {
  return (
    <DataTable
      className="min-h-[420px]"
      columns={columns}
      data={academicRiskStudents}
      getRowKey={(student) => student.id}
      toolbar={
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-foreground">
            รายชื่อนักเรียนและผลการเรียนรายบุคคล
          </h2>
          <span className="text-sm text-muted-foreground">
            ทั้งหมด {academicSummary.totalStudents} คน
          </span>
        </div>
      }
      footer={
        <Pagination
          page={1}
          totalPages={16}
          totalItems={academicSummary.totalStudents}
          pageSize={10}
          pageSizeLabel="10 ต่อหน้า"
        />
      }
    />
  )
}
