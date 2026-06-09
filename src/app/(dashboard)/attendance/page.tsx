"use client"

import React, { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"

const mockStudents = [
  { id: 1, name: "Alice Johnson", attendance: { "Mon": "Present", "Tue": "Present", "Wed": "Absent", "Thu": "Present", "Fri": "Present" } },
  { id: 2, name: "Bob Smith", attendance: { "Mon": "Late", "Tue": "Present", "Wed": "Present", "Thu": "Present", "Fri": "Present" } },
  { id: 3, name: "Charlie Davis", attendance: { "Mon": "Present", "Tue": "Absent", "Wed": "Present", "Thu": "Present", "Fri": "Present" } },
  { id: 4, name: "Diana Evans", attendance: { "Mon": "Present", "Tue": "Present", "Wed": "Present", "Thu": "Excused", "Fri": "Present" } },
]

const days = ["Mon", "Tue", "Wed", "Thu", "Fri"]
const statuses = ["Present", "Absent", "Late", "Excused"]

export default function AttendancePage() {
  const [data, setData] = useState(mockStudents)
  const [searchTerm, setSearchTerm] = useState("")

  const handleAttendanceChange = (studentId: number, day: string, newStatus: string) => {
    setData((prev) =>
      prev.map((student) => {
        if (student.id === studentId) {
          return {
            ...student,
            attendance: {
              ...student.attendance,
              [day]: newStatus,
            },
          }
        }
        return student
      })
    )
  }

  const filteredStudents = data.filter(student => student.name.toLowerCase().includes(searchTerm.toLowerCase()))

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Bulk Attendance</h1>
        <p className="text-muted-foreground">Record attendance for your homeroom students.</p>
      </div>

      <div className="flex items-center justify-between">
        <div className="w-full max-w-sm">
          <Input 
            placeholder="Search students..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Select defaultValue="week1">
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Select Week" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week1">Week of June 1</SelectItem>
              <SelectItem value="week2">Week of June 8</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Student Name</TableHead>
              {days.map((day) => (
                <TableHead key={day} className="text-center w-[120px]">{day}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStudents.map((student) => (
              <TableRow key={student.id}>
                <TableCell className="font-medium">{student.name}</TableCell>
                {days.map((day) => (
                  <TableCell key={day}>
                    <Select 
                      value={(student.attendance as any)[day]} 
                      onValueChange={(val) => handleAttendanceChange(student.id, day, val)}
                    >
                      <SelectTrigger className="w-full text-sm">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        {statuses.map(status => (
                          <SelectItem key={status} value={status}>{status}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
