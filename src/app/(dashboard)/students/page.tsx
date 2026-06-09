import { Student, columns } from "./columns"
import { DataTable } from "./data-table"

const mockStudents: Student[] = [
  { id: "S001", name: "Alice Johnson", grade: "10th", attendance: 95, riskStatus: "Low" },
  { id: "S002", name: "Bob Smith", grade: "11th", attendance: 82, riskStatus: "Medium" },
  { id: "S003", name: "Charlie Brown", grade: "9th", attendance: 75, riskStatus: "High" },
  { id: "S004", name: "Diana Prince", grade: "12th", attendance: 98, riskStatus: "Low" },
  { id: "S005", name: "Evan Wright", grade: "10th", attendance: 88, riskStatus: "Medium" },
  { id: "S006", name: "Fiona Gallagher", grade: "11th", attendance: 65, riskStatus: "High" },
  { id: "S007", name: "George Miller", grade: "9th", attendance: 92, riskStatus: "Low" },
  { id: "S008", name: "Hannah Abbott", grade: "12th", attendance: 85, riskStatus: "Medium" },
]

export default function StudentsPage() {
  return (
    <div className="container mx-auto py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Students</h1>
        <p className="text-muted-foreground">Manage and monitor student performance.</p>
      </div>
      <DataTable columns={columns} data={mockStudents} />
    </div>
  )
}
