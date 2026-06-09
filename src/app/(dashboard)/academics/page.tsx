"use client"

import React, { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const mockStudents = [
  { id: 1, name: "อลิซ จอห์นสัน", scores: { "คณิตศาสตร์": 95, "วิทยาศาสตร์": 88, "ภาษาอังกฤษ": 92, "ประวัติศาสตร์": 85 } },
  { id: 2, name: "บ็อบ สมิธ", scores: { "คณิตศาสตร์": 78, "วิทยาศาสตร์": 82, "ภาษาอังกฤษ": 80, "ประวัติศาสตร์": 75 } },
  { id: 3, name: "ชาร์ลี เดวิส", scores: { "คณิตศาสตร์": 90, "วิทยาศาสตร์": 95, "ภาษาอังกฤษ": 88, "ประวัติศาสตร์": 91 } },
  { id: 4, name: "ไดอาน่า อีวานส์", scores: { "คณิตศาสตร์": 85, "วิทยาศาสตร์": 89, "ภาษาอังกฤษ": 90, "ประวัติศาสตร์": 88 } },
]

const subjects = ["คณิตศาสตร์", "วิทยาศาสตร์", "ภาษาอังกฤษ", "ประวัติศาสตร์"]

export default function AcademicsPage() {
  const [data, setData] = useState(mockStudents)
  const [searchTerm, setSearchTerm] = useState("")

  const handleScoreChange = (studentId: number, subject: string, newScore: string) => {
    setData((prev) =>
      prev.map((student) => {
        if (student.id === studentId) {
          return {
            ...student,
            scores: {
              ...student.scores,
              [subject]: Number(newScore) || 0,
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
        <h1 className="text-2xl font-bold tracking-tight">ผลการเรียน</h1>
        <p className="text-muted-foreground">กรอกคะแนนวิชาต่างๆ สำหรับภาคเรียนปัจจุบัน</p>
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
          <Select defaultValue="term1">
            <SelectTrigger className="w-40">
              <SelectValue placeholder="เลือกภาคเรียน" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="term1">ภาคเรียนที่ 1</SelectItem>
              <SelectItem value="term2">ภาคเรียนที่ 2</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">ชื่อนักเรียน</TableHead>
              {subjects.map((subject) => (
                <TableHead key={subject} className="text-center w-[120px]">{subject}</TableHead>
              ))}
              <TableHead className="text-center w-[120px]">เกรดเฉลี่ย</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStudents.map((student) => {
              const totalScore = Object.values(student.scores).reduce((a, b) => a + b, 0)
              const gpa = (totalScore / subjects.length).toFixed(1)
              
              return (
                <TableRow key={student.id}>
                  <TableCell className="font-medium">{student.name}</TableCell>
                  {subjects.map((subject) => (
                    <TableCell key={subject}>
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        value={(student.scores as any)[subject]}
                        onChange={(e) => handleScoreChange(student.id, subject, e.target.value)}
                        className="w-full text-center"
                      />
                    </TableCell>
                  ))}
                  <TableCell className="text-center font-bold">
                    {gpa}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
