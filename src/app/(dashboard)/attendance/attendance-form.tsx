"use client"

import React, { useState, useTransition } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { format } from "date-fns"
import { Calendar as CalendarIcon, Loader2, Save } from "lucide-react"
import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { upsertAttendance } from "@/app/actions/attendance.actions"

type Student = {
  id: string
  name: string
}

type AttendanceRecord = {
  student_id: string
  status: 'present' | 'absent' | 'late' | 'leave'
  remark?: string
}

interface AttendanceFormProps {
  classroom: { id: string, name: string }
  students: Student[]
  initialRecords: AttendanceRecord[]
  dateStr: string
}

const statusOptions = [
  { value: "present", label: "มาเรียน" },
  { value: "absent", label: "ขาดเรียน" },
  { value: "late", label: "สาย" },
  { value: "leave", label: "ลา" },
]

export function AttendanceForm({ classroom, students, initialRecords, dateStr }: AttendanceFormProps) {
  const [isPending, startTransition] = useTransition()
  const [searchTerm, setSearchTerm] = useState("")
  const [date, setDate] = useState<Date>(new Date(dateStr))
  
  // Transform initial records into a dictionary for fast lookup
  const initialState = students.reduce((acc, student) => {
    const record = initialRecords.find(r => r.student_id === student.id)
    acc[student.id] = record?.status || "present" // Default to present
    return acc
  }, {} as Record<string, string>)

  const [attendance, setAttendance] = useState<Record<string, string>>(initialState)

  const handleStatusChange = (studentId: string, value: string) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: value
    }))
  }

  const handleSave = () => {
    startTransition(async () => {
      try {
        const records = Object.entries(attendance).map(([studentId, status]) => ({
          student_id: studentId,
          status: status as any
        }))
        
        // Format date to YYYY-MM-DD for PG
        // Adjusting for local timezone correctly
        const tzoffset = (new Date()).getTimezoneOffset() * 60000; //offset in milliseconds
        const localISOTime = (new Date(date.getTime() - tzoffset)).toISOString().slice(0, 10);
        
        await upsertAttendance(classroom.id, localISOTime, records)
        alert('บันทึกข้อมูลการเข้าเรียนเรียบร้อยแล้ว')
      } catch (error) {
        console.error(error)
        alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล')
      }
    })
  }

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      // In a real app, this should trigger a hard navigation or router.push 
      // with the date as a searchParam to refetch server-side records for that date.
      // For simplicity here, we just update the local state. A full implementation
      // would pass `?date=YYYY-MM-DD` and the Server Component would pass down the new `initialRecords`.
      setDate(selectedDate)
      window.location.href = `/attendance?date=${selectedDate.toISOString().split('T')[0]}`
    }
  }

  const filteredStudents = students.filter(student => 
    student.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Input 
            placeholder="ค้นหานักเรียน..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-xs"
          />
          <Popover>
            <PopoverTrigger>
              <Button
                variant={"outline"}
                className={cn(
                  "w-[240px] justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : <span>เลือกวันที่</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={handleDateSelect}
                autoFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        
        <Button onClick={handleSave} disabled={isPending}>
          {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          บันทึกการเข้าเรียน
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">ลำดับ</TableHead>
              <TableHead>ชื่อ-นามสกุล</TableHead>
              <TableHead className="w-[200px]">สถานะการเข้าเรียน</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStudents.length > 0 ? (
              filteredStudents.map((student, index) => (
                <TableRow key={student.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell className="font-medium">{student.name}</TableCell>
                  <TableCell>
                    <Select 
                      value={attendance[student.id]} 
                      onValueChange={(val) => handleStatusChange(student.id, val as any)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} className="h-24 text-center">
                  ไม่พบรายชื่อนักเรียน
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
