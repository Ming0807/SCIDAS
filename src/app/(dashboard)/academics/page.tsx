"use client"

import React, { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const mockStudents = [
  { id: 1, name: "Alice Johnson", scores: { "Math": 95, "Science": 88, "English": 92, "History": 85 } },
  { id: 2, name: "Bob Smith", scores: { "Math": 78, "Science": 82, "English": 80, "History": 75 } },
  { id: 3, name: "Charlie Davis", scores: { "Math": 90, "Science": 95, "English": 88, "History": 91 } },
  { id: 4, name: "Diana Evans", scores: { "Math": 85, "Science": 89, "English": 90, "History": 88 } },
]

const subjects = ["Math", "Science", "English", "History"]

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
        <h1 className="text-2xl font-bold tracking-tight">Academic Scores</h1>
        <p className="text-muted-foreground">Enter subject scores for the current term.</p>
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
          <Select defaultValue="term1">
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Select Term" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="term1">Term 1</SelectItem>
              <SelectItem value="term2">Term 2</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Student Name</TableHead>
              {subjects.map((subject) => (
                <TableHead key={subject} className="text-center w-[120px]">{subject}</TableHead>
              ))}
              <TableHead className="text-center w-[120px]">GPA</TableHead>
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
