"use client"

import React, { useState, useTransition, useMemo } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Save, Loader2, Search } from "lucide-react"
import { upsertAcademicScores } from "@/app/actions/academic.actions"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

type Student = {
  id: string
  name: string
}

type Subject = {
  id: string
  subject_id: string
  name: string
  code: string
}

type ScoreRecord = {
  student_id: string
  classroom_subject_id: string
  total_score: number
  grade?: string
}

type AcademicFormProps = {
  classroom: { id: string; name: string }
  students: Student[]
  subjects: Subject[]
  initialScores: ScoreRecord[]
  semesters: { id: string; name: string; is_current: boolean }[]
  currentSemesterId: string
}

export function AcademicForm({ 
  classroom, 
  students, 
  subjects, 
  initialScores, 
  semesters, 
  currentSemesterId 
}: AcademicFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [searchTerm, setSearchTerm] = useState("")

  // Convert initialScores array to a mapped object for easy lookup and mutation
  // Map structure: { [student_id]: { [classroom_subject_id]: total_score } }
  const [scoreData, setScoreData] = useState<Record<string, Record<string, number>>>(() => {
    const data: Record<string, Record<string, number>> = {}
    
    // Initialize with 0 or empty for all students and subjects
    students.forEach(student => {
      data[student.id] = {}
      subjects.forEach(subject => {
        data[student.id][subject.id] = 0 // default empty state
      })
    })

    // Populate with actual initial scores
    initialScores.forEach(score => {
      if (data[score.student_id]) {
        data[score.student_id][score.classroom_subject_id] = score.total_score || 0
      }
    })

    return data
  })

  const handleScoreChange = (studentId: string, subjectId: string, value: string) => {
    const numValue = value === "" ? 0 : Number(value)
    // Optional: add validation (0-100)
    if (numValue < 0 || numValue > 100) return

    setScoreData(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [subjectId]: numValue
      }
    }))
  }

  const handleSemesterChange = (semesterId: string) => {
    router.push(`/academics?semesterId=${semesterId}`)
  }

  const onSubmit = async () => {
    startTransition(async () => {
      try {
        // Prepare payload
        const records: ScoreRecord[] = []
        
        Object.entries(scoreData).forEach(([studentId, subjectsScores]) => {
          Object.entries(subjectsScores).forEach(([subjectId, score]) => {
            records.push({
              student_id: studentId,
              classroom_subject_id: subjectId,
              total_score: score
            })
          })
        })

        await upsertAcademicScores(currentSemesterId, records)
        toast.success("บันทึกผลการเรียนเรียบร้อยแล้ว")
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        toast.error("เกิดข้อผิดพลาดในการบันทึก", {
          description: message
        })
      }
    })
  }

  const filteredStudents = useMemo(() => {
    return students.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()))
  }, [students, searchTerm])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="ค้นหานักเรียน..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <div className="flex gap-2">
          {semesters.length > 0 && (
            <Select value={currentSemesterId} onValueChange={(val) => handleSemesterChange(val as string)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="เลือกภาคเรียน" />
              </SelectTrigger>
              <SelectContent>
                {semesters.map(term => (
                  <SelectItem key={term.id} value={term.id}>
                    {term.name} {term.is_current ? "(ปัจจุบัน)" : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Button onClick={onSubmit} disabled={isPending}>
            {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            บันทึกข้อมูล
          </Button>
        </div>
      </div>

      <div className="border rounded-md bg-card overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px] text-center">เลขที่</TableHead>
              <TableHead className="min-w-[200px]">ชื่อ-นามสกุล</TableHead>
              {subjects.map((subject) => (
                <TableHead key={subject.id} className="text-center min-w-[120px]">
                  <div className="font-semibold">{subject.name}</div>
                  <div className="text-xs text-muted-foreground font-normal">{subject.code}</div>
                </TableHead>
              ))}
              <TableHead className="text-center min-w-[100px]">เกรดเฉลี่ย</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStudents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={subjects.length + 3} className="h-24 text-center">
                  ไม่พบข้อมูลนักเรียน
                </TableCell>
              </TableRow>
            ) : (
              filteredStudents.map((student, index) => {
                const studentScores = scoreData[student.id] || {}
                const totalScore = Object.values(studentScores).reduce((a, b) => a + b, 0)
                
                // Calculate pseudo GPA based on score values for display
                const calculateGrade = (score: number) => {
                  if (score >= 80) return 4.0;
                  if (score >= 75) return 3.5;
                  if (score >= 70) return 3.0;
                  if (score >= 65) return 2.5;
                  if (score >= 60) return 2.0;
                  if (score >= 55) return 1.5;
                  if (score >= 50) return 1.0;
                  return 0.0;
                }
                
                let totalGrades = 0
                Object.values(studentScores).forEach(score => {
                  totalGrades += calculateGrade(score)
                })
                
                const gpa = subjects.length > 0 ? (totalGrades / subjects.length).toFixed(2) : "0.00"
                
                return (
                  <TableRow key={student.id}>
                    <TableCell className="text-center">{index + 1}</TableCell>
                    <TableCell className="font-medium whitespace-nowrap">{student.name}</TableCell>
                    {subjects.map((subject) => (
                      <TableCell key={subject.id}>
                        <Input
                          type="number"
                          min={0}
                          max={100}
                          value={studentScores[subject.id] === 0 ? "" : studentScores[subject.id]}
                          onChange={(e) => handleScoreChange(student.id, subject.id, e.target.value)}
                          className="w-full text-center"
                          placeholder="0"
                        />
                      </TableCell>
                    ))}
                    <TableCell className="text-center font-semibold text-primary">
                      {gpa}
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
