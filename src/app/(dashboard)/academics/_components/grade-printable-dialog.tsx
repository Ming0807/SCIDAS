"use client"

import { Printer, X } from "lucide-react"

import { Button } from "@/components/ui/button"

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

type ScoreEntry = {
  classwork_score: string
  midterm_score: string
  final_score: string
  remark: string
}

interface GradePrintableDialogProps {
  isOpen: boolean
  onClose: () => void
  classroomName: string
  semesterName: string
  students: Student[]
  subjects: Subject[]
  scoreData: Record<string, ScoreEntry>
  classGpa: number
}

function numericScore(val: string) {
  if (!val || val.trim() === "") return 0
  const n = Number.parseFloat(val)
  return Number.isNaN(n) ? 0 : n
}

function gradeFromScore(score: number): { grade: string; gradePoint: number } {
  if (score >= 80) return { grade: "4", gradePoint: 4 }
  if (score >= 75) return { grade: "3.5", gradePoint: 3.5 }
  if (score >= 70) return { grade: "3", gradePoint: 3 }
  if (score >= 65) return { grade: "2.5", gradePoint: 2.5 }
  if (score >= 60) return { grade: "2", gradePoint: 2 }
  if (score >= 55) return { grade: "1.5", gradePoint: 1.5 }
  if (score >= 50) return { grade: "1", gradePoint: 1 }
  return { grade: "0", gradePoint: 0 }
}

export function GradePrintableDialog({
  isOpen,
  onClose,
  classroomName,
  semesterName,
  students,
  subjects,
  scoreData,
  classGpa,
}: GradePrintableDialogProps) {
  if (!isOpen) return null

  const handlePrint = () => {
    window.print()
  }

  const currentDateThai = new Intl.DateTimeFormat("th-TH", {
    dateStyle: "long",
  }).format(new Date())

  // Calculate table rows
  const studentRows = students.map((student, idx) => {
    let studentGp = 0
    let subjectCount = 0
    let totalAllScore = 0
    const subjectScores = subjects.map((subj) => {
      const entry = scoreData[`${student.id}:${subj.id}`]
      if (!entry) return { score: 0, grade: "-", isEntered: false }

      const c = numericScore(entry.classwork_score)
      const m = numericScore(entry.midterm_score)
      const f = numericScore(entry.final_score)
      const total = c + m + f
      const hasValue = entry.classwork_score !== "" || entry.midterm_score !== "" || entry.final_score !== ""

      if (hasValue) {
        const { grade, gradePoint } = gradeFromScore(total)
        studentGp += gradePoint
        subjectCount++
        totalAllScore += total
        return { score: total, grade, isEntered: true }
      }
      return { score: total, grade: "-", isEntered: false }
    })

    const gpa = subjectCount > 0 ? Number((studentGp / subjectCount).toFixed(2)) : 0
    const hasFail = subjectScores.some((s) => s.isEntered && s.grade === "0")

    return {
      index: idx + 1,
      name: student.name,
      subjectScores,
      totalScore: totalAllScore,
      gpa,
      isPass: !hasFail && gpa >= 1.0,
    }
  })

  const passCount = studentRows.filter((r) => r.isPass).length
  const failCount = studentRows.filter((r) => !r.isPass).length

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-2 sm:p-4 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-5xl rounded-2xl bg-card border border-border shadow-2xl overflow-hidden my-auto max-h-[95vh] flex flex-col">
        {/* Modal Controls Bar (Hidden during print) */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/30 print:hidden shrink-0">
          <div>
            <h3 className="text-base font-semibold text-foreground">
              พิมพ์แบบบันทึกผลการพัฒนาคุณภาพผู้เรียน (ปพ.5 ย่อ)
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              ห้องเรียน: {classroomName} · {semesterName}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              onClick={handlePrint}
              size="sm"
              className="text-xs gap-1.5"
            >
              <Printer className="size-4" />
              สั่งพิมพ์เอกสาร (Print)
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="text-xs gap-1"
            >
              <X className="size-4" />
              ปิด
            </Button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="p-8 overflow-y-auto flex-1 bg-white text-slate-900 print:p-0 print:m-0">
          <style dangerouslySetInnerHTML={{ __html: "@media print { @page { size: A4 landscape; margin: 10mm; } }" }} />
          {/* Official Document Header */}
          <div className="text-center space-y-1 pb-4 border-b-2 border-slate-900">
            <h1 className="text-lg font-bold tracking-tight text-slate-900">
              แบบบันทึกผลการพัฒนาคุณภาพผู้เรียนรายบุคคลและรายชั้นเรียน (ปพ.5 ย่อ)
            </h1>
            <p className="text-sm font-medium text-slate-800">
              ตามหลักสูตรแกนกลางการศึกษาขั้นพื้นฐาน พุทธศักราช ๒๕๕๑ (ฉบับปรับปรุง)
            </p>
            <div className="flex justify-center items-center gap-4 text-xs text-slate-700 pt-1">
              <span><strong>ห้องเรียน:</strong> {classroomName}</span>
              <span>•</span>
              <span><strong>{semesterName}</strong></span>
              <span>•</span>
              <span><strong>วันที่ออกเอกสาร:</strong> {currentDateThai}</span>
            </div>
          </div>

          {/* Grades Table */}
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-xs border-collapse border border-slate-400">
              <thead>
                <tr className="bg-slate-100 text-slate-800">
                  <th className="border border-slate-300 p-2 text-center w-10">ที่</th>
                  <th className="border border-slate-300 p-2 text-left min-w-[140px]">ชื่อ - นามสกุล</th>
                  {subjects.map((s) => (
                    <th key={s.id} className="border border-slate-300 p-2 text-center">
                      <div className="font-semibold">{s.name}</div>
                      <div className="text-slate-500 font-normal text-micro">{s.code}</div>
                    </th>
                  ))}
                  <th className="border border-slate-300 p-2 text-center w-16">คะแนนรวม</th>
                  <th className="border border-slate-300 p-2 text-center w-14">GPA</th>
                  <th className="border border-slate-300 p-2 text-center w-16">ผลการประเมิน</th>
                </tr>
              </thead>
              <tbody>
                {studentRows.map((r) => (
                  <tr key={r.index} className="hover:bg-slate-50">
                    <td className="border border-slate-300 p-2 text-center">{r.index}</td>
                    <td className="border border-slate-300 p-2 font-medium">{r.name}</td>
                    {r.subjectScores.map((s, idx) => (
                      <td key={idx} className="border border-slate-300 p-2 text-center">
                        {s.isEntered ? (
                          <span>
                            {s.score} <strong className="text-slate-800">({s.grade})</strong>
                          </span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                    ))}
                    <td className="border border-slate-300 p-2 text-center font-semibold">
                      {r.totalScore > 0 ? r.totalScore.toFixed(1) : "-"}
                    </td>
                    <td className="border border-slate-300 p-2 text-center font-bold">
                      {r.gpa > 0 ? r.gpa.toFixed(2) : "-"}
                    </td>
                    <td className="border border-slate-300 p-2 text-center">
                      {r.gpa === 0 ? (
                        <span className="text-slate-400">-</span>
                      ) : r.isPass ? (
                        <span className="text-emerald-700 font-semibold">ผ่าน</span>
                      ) : (
                        <span className="text-rose-700 font-semibold">สอนซ่อมเสริม</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Statistical Summary Bar */}
          <div className="mt-4 p-3 rounded-xl border border-slate-300 bg-slate-50 text-xs text-slate-800 flex flex-wrap items-center justify-between gap-2">
            <div>
              <strong>สรุปผลการเรียน:</strong> นักเรียนทั้งหมด {students.length} คน |{" "}
              ผ่านเกณฑ์ {passCount} คน |{" "}
              ต้องสอนซ่อมเสริม {failCount} คน
            </div>
            <div>
              <strong>GPA เฉลี่ยประจำห้อง:</strong>{" "}
              <span className="text-sm font-bold text-slate-950">
                {classGpa > 0 ? classGpa.toFixed(2) : "-"}
              </span>
            </div>
          </div>

          {/* Official 3-Party Signature Block */}
          <div className="mt-8 pt-4 grid grid-cols-3 gap-6 text-center text-xs text-slate-800 break-inside-avoid">
            <div className="space-y-12">
              <p>ลงชื่อ..........................................................</p>
              <div>
                <p>(..........................................................)</p>
                <p className="text-slate-600 mt-1">ครูประจำชั้น / ครูประจำวิชา</p>
              </div>
            </div>

            <div className="space-y-12">
              <p>ลงชื่อ..........................................................</p>
              <div>
                <p>(..........................................................)</p>
                <p className="text-slate-600 mt-1">หัวหน้ากลุ่มบริหารงานวิชาการ</p>
              </div>
            </div>

            <div className="space-y-12">
              <p>ลงชื่อ..........................................................</p>
              <div>
                <p>(..........................................................)</p>
                <p className="text-slate-600 mt-1">ผู้อำนวยการสถานศึกษา</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
