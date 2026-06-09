"use client"

import React, { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"

const mockStudents = [
  { id: 1, name: "อลิซ จอห์นสัน", attendance: { "จันทร์": "มาเรียน", "อังคาร": "มาเรียน", "พุธ": "ขาดเรียน", "พฤหัสบดี": "มาเรียน", "ศุกร์": "มาเรียน" } },
  { id: 2, name: "บ็อบ สมิธ", attendance: { "จันทร์": "สาย", "อังคาร": "มาเรียน", "พุธ": "มาเรียน", "พฤหัสบดี": "มาเรียน", "ศุกร์": "มาเรียน" } },
  { id: 3, name: "ชาร์ลี เดวิส", attendance: { "จันทร์": "มาเรียน", "อังคาร": "ขาดเรียน", "พุธ": "มาเรียน", "พฤหัสบดี": "มาเรียน", "ศุกร์": "มาเรียน" } },
  { id: 4, name: "ไดอาน่า อีวานส์", attendance: { "จันทร์": "มาเรียน", "อังคาร": "มาเรียน", "พุธ": "มาเรียน", "พฤหัสบดี": "ลากิจ", "ศุกร์": "มาเรียน" } },
]

const days = ["จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์"]
const statuses = ["มาเรียน", "ขาดเรียน", "สาย", "ลากิจ"]

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
        <h1 className="text-2xl font-bold tracking-tight">บันทึกการเข้าเรียนรวม</h1>
        <p className="text-muted-foreground">บันทึกการเข้าเรียนสำหรับนักเรียนในที่ปรึกษาของคุณ</p>
      </div>

      <div className="flex items-center justify-between">
        <div className="w-full max-w-sm">
          <Input 
            placeholder="ค้นหานักเรียน..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Select defaultValue="week1">
            <SelectTrigger className="w-40">
              <SelectValue placeholder="เลือกสัปดาห์" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week1">สัปดาห์ที่ 1 มิ.ย.</SelectItem>
              <SelectItem value="week2">สัปดาห์ที่ 8 มิ.ย.</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">ชื่อนักเรียน</TableHead>
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
                        <SelectValue placeholder="สถานะ" />
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
