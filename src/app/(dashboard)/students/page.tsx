import { Student, columns } from "./columns"
import { DataTable } from "./data-table"

const mockStudents: Student[] = [
  { id: "S001", name: "อลิซ จอห์นสัน", grade: "ม.4", attendance: 95, riskStatus: "ต่ำ" },
  { id: "S002", name: "บ็อบ สมิธ", grade: "ม.5", attendance: 82, riskStatus: "ปานกลาง" },
  { id: "S003", name: "ชาร์ลี บราวน์", grade: "ม.3", attendance: 75, riskStatus: "สูง" },
  { id: "S004", name: "ไดอาน่า พรินซ์", grade: "ม.6", attendance: 98, riskStatus: "ต่ำ" },
  { id: "S005", name: "อีวาน ไรท์", grade: "ม.4", attendance: 88, riskStatus: "ปานกลาง" },
  { id: "S006", name: "ฟิโอน่า แกลลาเกอร์", grade: "ม.5", attendance: 65, riskStatus: "สูง" },
  { id: "S007", name: "จอร์จ มิลเลอร์", grade: "ม.3", attendance: 92, riskStatus: "ต่ำ" },
  { id: "S008", name: "ฮานนาห์ แอบบอตต์", grade: "ม.6", attendance: 85, riskStatus: "ปานกลาง" },
]

export default function StudentsPage() {
  return (
    <div className="container mx-auto py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">ข้อมูลนักเรียน</h1>
        <p className="text-muted-foreground">จัดการและติดตามผลการเรียนของนักเรียน</p>
      </div>
      <DataTable columns={columns} data={mockStudents} />
    </div>
  )
}
