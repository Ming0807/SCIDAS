"use client"

import { useActionState, useMemo, useState } from "react"
import Link from "next/link"
import { ArrowLeft, CheckCircle2, Eye, Loader2, Save, Search, X } from "lucide-react"

import { createHomeVisitAction } from "@/app/actions/home-visit.actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { StudentAttachmentForm } from "@/components/care/student-attachment-form"
import { getFamilyStatusLabel } from "@/lib/student-care-formatters"
import type { ActionResult } from "@/lib/server/action-result"

type StudentOption = {
  id: string
  name: string
  classroom?: string
  code: string
  address?: string
  distanceToSchoolKm?: number | null
  travelMethod?: string | null
  familyStatus?: string | null
  guardianOccupation?: string | null
  guardianMonthlyIncome?: number | null
  guardianRelation?: string | null
  previousHousingCondition?: string | null
  previousHousingType?: string | null
  previousHousingOwnership?: string | null
  previousFamilyMembersCount?: number | null
}

type HomeVisitFormProps = {
  studentOptions: StudentOption[]
  defaultStudentId?: string
}

function getFamilySituationText(student?: StudentOption): string {
  if (!student) return ""
  const parts: string[] = []
  if (student.familyStatus) {
    parts.push(`สถานะครอบครัว: ${getFamilyStatusLabel(student.familyStatus)}`)
  }
  if (student.guardianOccupation) {
    parts.push(`อาชีพผู้ปกครอง: ${student.guardianOccupation}`)
  }
  return parts.join(" · ")
}

function getTravelDetailText(student?: StudentOption): string {
  if (!student) return ""
  const parts: string[] = []
  if (student.travelMethod) {
    parts.push(`วิธีเดินทาง: ${student.travelMethod}`)
  }
  if (student.distanceToSchoolKm !== null && student.distanceToSchoolKm !== undefined) {
    parts.push(`ระยะทาง: ${student.distanceToSchoolKm} กม.`)
  }
  return parts.join(" · ")
}

function compareClassroomNames(a: string, b: string): number {
  const getWeight = (name: string) => {
    const k = name.match(/^(?:อ\.?|อนุบาล)\s*([1-3])(?:\/(\d+))?/i)
    if (k) return 10 * parseInt(k[1], 10) + (k[2] ? parseInt(k[2], 10) : 0)
    const p = name.match(/^(?:ป\.?|ประถม)\s*([1-6])(?:\/(\d+))?/i)
    if (p) return 100 + 10 * parseInt(p[1], 10) + (p[2] ? parseInt(p[2], 10) : 0)
    const m = name.match(/^(?:ม\.?|มัธยม)\s*([1-6])(?:\/(\d+))?/i)
    if (m) return 200 + 10 * parseInt(m[1], 10) + (m[2] ? parseInt(m[2], 10) : 0)
    return 999
  }
  const diff = getWeight(a) - getWeight(b)
  if (diff !== 0) return diff
  return a.localeCompare(b, "th")
}

export function HomeVisitForm({ studentOptions, defaultStudentId }: HomeVisitFormProps) {
  const [state, formAction, pending] = useActionState<
    ActionResult<{ id: string }> | null,
    FormData
  >(createHomeVisitAction, null)

  const initialStudent = studentOptions.find((s) => s.id === (defaultStudentId ?? ""))
  const [selectedStudentId, setSelectedStudentId] = useState<string>(defaultStudentId ?? "")
  const [addressVisited, setAddressVisited] = useState<string>(initialStudent?.address ?? "")
  const [familyIncome, setFamilyIncome] = useState<string>(
    initialStudent?.guardianMonthlyIncome !== null && initialStudent?.guardianMonthlyIncome !== undefined
      ? String(initialStudent.guardianMonthlyIncome)
      : ""
  )
  const [familySituation, setFamilySituation] = useState<string>(getFamilySituationText(initialStudent))
  const [travelDifficultyDetail, setTravelDifficultyDetail] = useState<string>(getTravelDetailText(initialStudent))
  const [travelDifficulty, setTravelDifficulty] = useState<boolean>(
    Boolean(initialStudent?.distanceToSchoolKm && initialStudent.distanceToSchoolKm > 10)
  )
  const [hasFamilyProblem, setHasFamilyProblem] = useState<boolean>(
    Boolean(initialStudent?.familyStatus === "orphan" || initialStudent?.familyStatus === "separated")
  )
  const [housingCondition, setHousingCondition] = useState<string>(initialStudent?.previousHousingCondition ?? "")
  const [housingType, setHousingType] = useState<string>(initialStudent?.previousHousingType ?? "")
  const [housingOwnership, setHousingOwnership] = useState<string>(initialStudent?.previousHousingOwnership ?? "")
  const [familyMembersCount, setFamilyMembersCount] = useState<string>(
    initialStudent?.previousFamilyMembersCount !== null && initialStudent?.previousFamilyMembersCount !== undefined
      ? String(initialStudent.previousFamilyMembersCount)
      : ""
  )

  const [selectedClassroomFilter, setSelectedClassroomFilter] = useState<string>(
    initialStudent?.classroom ?? "",
  )
  const [searchKeyword, setSearchKeyword] = useState<string>("")

  const availableClassrooms = useMemo(() => {
    const set = new Set<string>()
    for (const opt of studentOptions) {
      if (opt.classroom && opt.classroom.trim()) {
        set.add(opt.classroom.trim())
      }
    }
    return Array.from(set).sort(compareClassroomNames)
  }, [studentOptions])

  const filteredStudentOptions = useMemo(() => {
    return studentOptions.filter((opt) => {
      if (
        selectedClassroomFilter &&
        opt.classroom !== selectedClassroomFilter &&
        opt.id !== selectedStudentId
      ) {
        return false
      }
      if (searchKeyword.trim()) {
        const q = searchKeyword.trim().toLowerCase()
        const matchName = opt.name.toLowerCase().includes(q)
        const matchCode = opt.code.toLowerCase().includes(q)
        const matchClass = (opt.classroom || "").toLowerCase().includes(q)
        if (!matchName && !matchCode && !matchClass && opt.id !== selectedStudentId) {
          return false
        }
      }
      return true
    })
  }, [studentOptions, selectedClassroomFilter, searchKeyword, selectedStudentId])

  const handleStudentChange = (studentId: string) => {
    setSelectedStudentId(studentId)
    const student = studentOptions.find((s) => s.id === studentId)
    if (student) {
      setAddressVisited(student.address?.trim() ?? "")
      if (student.guardianMonthlyIncome !== null && student.guardianMonthlyIncome !== undefined) {
        setFamilyIncome(String(student.guardianMonthlyIncome))
      } else {
        setFamilyIncome("")
      }
      setFamilySituation(getFamilySituationText(student))
      setTravelDifficultyDetail(getTravelDetailText(student))
      setTravelDifficulty(Boolean(student.distanceToSchoolKm && student.distanceToSchoolKm > 10))
      setHasFamilyProblem(Boolean(student.familyStatus === "orphan" || student.familyStatus === "separated"))
      setHousingCondition(student.previousHousingCondition ?? "")
      setHousingType(student.previousHousingType ?? "")
      setHousingOwnership(student.previousHousingOwnership ?? "")
      setFamilyMembersCount(
        student.previousFamilyMembersCount !== null && student.previousFamilyMembersCount !== undefined
          ? String(student.previousFamilyMembersCount)
          : ""
      )
    } else {
      setAddressVisited("")
      setFamilyIncome("")
      setFamilySituation("")
      setTravelDifficultyDetail("")
      setTravelDifficulty(false)
      setHasFamilyProblem(false)
      setHousingCondition("")
      setHousingType("")
      setHousingOwnership("")
      setFamilyMembersCount("")
    }
  }

  const currentStudent = studentOptions.find((s) => s.id === selectedStudentId)

  const visitCreated = state?.ok && state.data?.id

  // ── After successful creation: show evidence upload (outside form) ──
  if (visitCreated && selectedStudentId) {
    return (
      <div className="space-y-6">
        <Card className="rounded-2xl border-emerald-500/30 bg-emerald-500/10 shadow-xs">
          <CardContent className="p-6 flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-200">
                บันทึกการเยี่ยมบ้านสำเร็จ
              </p>
              <p className="text-xs text-emerald-700 dark:text-emerald-300">{state?.message}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border shadow-xs">
          <CardHeader>
            <CardTitle>หลักฐาน</CardTitle>
            <CardDescription>อัปโหลดรูปภาพหรือเอกสาร</CardDescription>
          </CardHeader>
          <CardContent>
            <StudentAttachmentForm
              studentId={selectedStudentId}
              referenceTable="home_visits"
              referenceId={state.data!.id}
            />
          </CardContent>
        </Card>

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button nativeButton={false} variant="outline" render={<Link href="/home-visits" />}>
            <ArrowLeft aria-hidden="true" /> กลับรายการเยี่ยมบ้าน
          </Button>
          <Button nativeButton={false} render={<Link href={`/home-visits/${state.data!.id}`} />}>
            <Eye aria-hidden="true" /> ดูบันทึกนี้
          </Button>
        </div>
      </div>
    )
  }

  // ── Before creation: show visit form ──
  return (
    <form action={formAction}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left: Visit Details */}
        <div className="md:col-span-2 space-y-6">
          <Card className="rounded-2xl border-border shadow-xs">
            <CardHeader>
              <CardTitle>รายละเอียดการเยี่ยมบ้าน</CardTitle>
              <CardDescription>กรอกข้อมูลพื้นฐานเกี่ยวกับการเยี่ยมบ้าน</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Student Selector with Classroom Filter and Search */}
                <div className="space-y-3 sm:col-span-2 p-3.5 rounded-xl bg-muted/40 border border-border/70">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {/* Classroom Dropdown Filter */}
                    <div>
                      <label htmlFor="classroomFilter" className="text-xs font-medium text-muted-foreground mb-1 block">
                        กรองตามห้องเรียน
                      </label>
                      <select
                        id="classroomFilter"
                        value={selectedClassroomFilter}
                        onChange={(e) => setSelectedClassroomFilter(e.target.value)}
                        className="w-full h-9 rounded-md border border-input bg-background px-2.5 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-ring/50"
                      >
                        <option value="">ทุกห้องเรียน ({studentOptions.length} คน)</option>
                        {availableClassrooms.map((c) => {
                          const count = studentOptions.filter((s) => s.classroom === c).length
                          return (
                            <option key={c} value={c}>
                              ห้อง {c} ({count} คน)
                            </option>
                          )
                        })}
                      </select>
                    </div>

                    {/* Search Input Filter */}
                    <div>
                      <label htmlFor="searchFilter" className="text-xs font-medium text-muted-foreground mb-1 block">
                        ค้นหาชื่อ หรือ รหัสนักเรียน
                      </label>
                      <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                        <Input
                          id="searchFilter"
                          type="text"
                          placeholder="พิมพ์ชื่อ นามสกุล หรือรหัส..."
                          value={searchKeyword}
                          onChange={(e) => setSearchKeyword(e.target.value)}
                          className="h-9 pl-8 pr-7 text-xs bg-background"
                        />
                        {searchKeyword && (
                          <button
                            type="button"
                            onClick={() => setSearchKeyword("")}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-xs p-0.5 cursor-pointer"
                            title="ล้างคำค้นหา"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Student Select Dropdown */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label htmlFor="studentId" className="text-xs font-medium text-foreground">
                        เลือกนักเรียน <span className="text-destructive">*</span>
                      </label>
                      <span className="text-xs text-muted-foreground">
                        พบ {filteredStudentOptions.length} จาก {studentOptions.length} คน
                      </span>
                    </div>
                    <select
                      id="studentId"
                      name="studentId"
                      required
                      value={selectedStudentId}
                      onChange={(e) => handleStudentChange(e.target.value)}
                      className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring/50 font-medium"
                    >
                      <option value="">
                        {filteredStudentOptions.length === 0
                          ? "-- ไม่พบรายชื่อนักเรียนที่ตรงกับเงื่อนไข --"
                          : `-- เลือกนักเรียน (${filteredStudentOptions.length} คน) --`}
                      </option>
                      {filteredStudentOptions.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} {s.classroom ? `(${s.classroom})` : ""} — รหัส {s.code}
                        </option>
                      ))}
                    </select>
                    {state?.ok === false && state.fieldErrors?.studentId ? (
                      <p className="text-xs text-destructive mt-1">
                        {state.fieldErrors.studentId[0]}
                      </p>
                    ) : null}
                  </div>

                  {/* Selected Student Information & Auto-fill Card */}
                  {currentStudent && (
                    <div
                      className={`p-3.5 rounded-xl text-xs border ${
                        currentStudent.address
                          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-950 dark:text-emerald-200"
                          : "bg-amber-500/10 border-amber-500/30 text-amber-950 dark:text-amber-200"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1.5 flex-1">
                          <div className="font-semibold text-sm flex items-center gap-1.5 flex-wrap">
                            <span>👤 {currentStudent.name}</span>
                            {currentStudent.classroom && (
                              <span className="px-1.5 py-0.5 rounded bg-background/80 text-xs border">
                                {currentStudent.classroom}
                              </span>
                            )}
                            <span className="text-muted-foreground text-xs font-normal">
                              (รหัส: {currentStudent.code})
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 pt-1 border-t border-border/40 text-xs">
                            <div>
                              <span className="font-medium text-muted-foreground">📍 ที่อยู่: </span>
                              <span>{currentStudent.address || "ยังไม่ได้ระบุในฐานข้อมูล"}</span>
                            </div>
                            {currentStudent.guardianMonthlyIncome !== null && currentStudent.guardianMonthlyIncome !== undefined && (
                              <div>
                                <span className="font-medium text-muted-foreground">💰 รายได้ผู้ปกครอง: </span>
                                <span>{currentStudent.guardianMonthlyIncome.toLocaleString("th-TH")} บาท/เดือน</span>
                              </div>
                            )}
                            {currentStudent.guardianOccupation && (
                              <div>
                                <span className="font-medium text-muted-foreground">💼 อาชีพผู้ปกครอง: </span>
                                <span>{currentStudent.guardianOccupation}</span>
                              </div>
                            )}
                            {currentStudent.familyStatus && (
                              <div>
                                <span className="font-medium text-muted-foreground">👨‍👩‍👧 สถานะครอบครัว: </span>
                                <span>{getFamilyStatusLabel(currentStudent.familyStatus)}</span>
                              </div>
                            )}
                            {(currentStudent.travelMethod || currentStudent.distanceToSchoolKm !== null) && (
                              <div>
                                <span className="font-medium text-muted-foreground">🛵 การเดินทาง: </span>
                                <span>
                                  {currentStudent.travelMethod || "ไม่ระบุ"}
                                  {currentStudent.distanceToSchoolKm !== null ? ` (${currentStudent.distanceToSchoolKm} กม.)` : ""}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-600 text-white shrink-0">
                          ✓ ลิงก์ข้อมูลอัตโนมัติแล้ว
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="visitDate" className="text-sm font-medium">
                    วันที่เยี่ยม
                  </label>
                  <Input
                    id="visitDate"
                    name="visitDate"
                    type="date"
                    required
                    defaultValue={new Date().toISOString().split("T")[0]}
                  />
                  {state?.ok === false && state.fieldErrors?.visitDate ? (
                    <p className="text-xs text-destructive">
                      {state.fieldErrors.visitDate[0]}
                    </p>
                  ) : null}
                </div>
                <div className="space-y-2">
                  <label htmlFor="visitTime" className="text-sm font-medium">
                    เวลา
                  </label>
                  <Input id="visitTime" name="visitTime" type="time" />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="addressVisited" className="text-sm font-medium">
                    ที่อยู่ที่เยี่ยม
                  </label>
                  {currentStudent && (
                    <div className="flex items-center gap-2">
                      {currentStudent.address ? (
                        <>
                          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                            🔗 ดึงที่อยู่จากข้อมูลนักเรียนอัตโนมัติ
                          </span>
                          {addressVisited !== currentStudent.address && (
                            <button
                              type="button"
                              onClick={() => setAddressVisited(currentStudent.address || "")}
                              className="text-xs text-primary underline hover:text-primary/80 cursor-pointer"
                            >
                              คืนค่าที่อยู่ตามประวัติ
                            </button>
                          )}
                        </>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          (ยังไม่มีที่อยู่ในข้อมูลนักเรียน สามารถพิมพ์ระบุได้)
                        </span>
                      )}
                    </div>
                  )}
                </div>
                <Input
                  id="addressVisited"
                  name="addressVisited"
                  placeholder="เช่น บ้านเลขที่ 13 หมู่ 6 ต.โพธิ์ไทร อ.ป่าติ้ว..."
                  value={addressVisited}
                  onChange={(e) => setAddressVisited(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label htmlFor="housingCondition" className="text-sm font-medium">
                      สภาพบ้าน
                    </label>
                    {currentStudent?.previousHousingCondition && (
                      <span className="text-micro text-emerald-600 dark:text-emerald-400 font-medium">
                        🔗 จากประวัติเดิม
                      </span>
                    )}
                  </div>
                  <select
                    id="housingCondition"
                    name="housingCondition"
                    value={housingCondition}
                    onChange={(e) => setHousingCondition(e.target.value)}
                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring/50"
                  >
                    <option value="">ไม่ระบุ</option>
                    <option value="good">ดี</option>
                    <option value="moderate">พอใช้</option>
                    <option value="poor">ควรปรับปรุง</option>
                    <option value="critical">วิกฤต/ไม่ปลอดภัย</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label htmlFor="housingType" className="text-sm font-medium">
                      ประเภทที่อยู่อาศัย
                    </label>
                    {currentStudent?.previousHousingType && (
                      <span className="text-micro text-emerald-600 dark:text-emerald-400 font-medium">
                        🔗 จากประวัติเดิม
                      </span>
                    )}
                  </div>
                  <Input
                    id="housingType"
                    name="housingType"
                    placeholder="เช่น บ้านไม้, บ้านปูน, ห้องเช่า"
                    value={housingType}
                    onChange={(e) => setHousingType(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label htmlFor="housingOwnership" className="text-sm font-medium">
                      การครอบครอง
                    </label>
                    {currentStudent?.previousHousingOwnership && (
                      <span className="text-micro text-emerald-600 dark:text-emerald-400 font-medium">
                        🔗 จากประวัติเดิม
                      </span>
                    )}
                  </div>
                  <Input
                    id="housingOwnership"
                    name="housingOwnership"
                    placeholder="เช่น เป็นของตนเอง, เช่า, อาศัยญาติ"
                    value={housingOwnership}
                    onChange={(e) => setHousingOwnership(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label htmlFor="familyMembersCount" className="text-sm font-medium">
                      จำนวนสมาชิกในบ้าน (คน)
                    </label>
                    {currentStudent?.previousFamilyMembersCount !== null && currentStudent?.previousFamilyMembersCount !== undefined && (
                      <span className="text-micro text-emerald-600 dark:text-emerald-400 font-medium">
                        🔗 จากประวัติเดิม
                      </span>
                    )}
                  </div>
                  <Input
                    id="familyMembersCount"
                    name="familyMembersCount"
                    type="number"
                    min={0}
                    step={1}
                    placeholder="เช่น 4"
                    value={familyMembersCount}
                    onChange={(e) => setFamilyMembersCount(e.target.value)}
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <div className="flex items-center justify-between">
                    <label htmlFor="familyIncome" className="text-sm font-medium">
                      รายได้ครอบครัว/เดือน (บาท)
                    </label>
                    {currentStudent?.guardianMonthlyIncome !== null && currentStudent?.guardianMonthlyIncome !== undefined && (
                      <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                        🔗 ดึงจากข้อมูลผู้ปกครอง
                      </span>
                    )}
                  </div>
                  <Input
                    id="familyIncome"
                    name="familyIncome"
                    type="number"
                    min={0}
                    step="0.01"
                    placeholder="เช่น 9000"
                    value={familyIncome}
                    onChange={(e) => setFamilyIncome(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="familySituation" className="text-sm font-medium">
                    สภาพครอบครัว
                  </label>
                  {(currentStudent?.familyStatus || currentStudent?.guardianOccupation) && (
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                      🔗 ดึงสถานะและอาชีพผู้ปกครอง
                    </span>
                  )}
                </div>
                <Textarea
                  id="familySituation"
                  name="familySituation"
                  placeholder="เช่น อยู่พร้อมหน้า บิดาทำงานรับจ้าง มารดาทำงาน..."
                  className="min-h-[80px]"
                  value={familySituation}
                  onChange={(e) => setFamilySituation(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="studentBehaviorAtHome" className="text-sm font-medium">
                  พฤติกรรมนักเรียนที่บ้าน
                </label>
                <Textarea
                  id="studentBehaviorAtHome"
                  name="studentBehaviorAtHome"
                  placeholder="เช่น ช่วยงานบ้าน อ่านหนังสือตอนเย็น..."
                  className="min-h-[80px]"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="environmentSafety" className="text-sm font-medium">
                  ความปลอดภัยของสภาพแวดล้อม
                </label>
                <Textarea
                  id="environmentSafety"
                  name="environmentSafety"
                  placeholder="เช่น บ้านใกล้ถนนใหญ่ ควรระวัง..."
                  className="min-h-[80px]"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="coVisitors" className="text-sm font-medium">
                  ผู้ร่วมเยี่ยม (คั่นด้วยจุลภาคหรือขึ้นบรรทัดใหม่)
                </label>
                <Textarea
                  id="coVisitors"
                  name="coVisitors"
                  placeholder={"เช่น ครูสมชาย, ผอ.วิภา"}
                  className="min-h-[60px]"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="travelDifficultyDetail" className="text-sm font-medium">
                    รายละเอียดการเดินทางลำบาก
                  </label>
                  {(currentStudent?.travelMethod || currentStudent?.distanceToSchoolKm !== null) && (
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                      🔗 ดึงวิธีและระยะทางจากข้อมูลนักเรียน
                    </span>
                  )}
                </div>
                <Input
                  id="travelDifficultyDetail"
                  name="travelDifficultyDetail"
                  placeholder="เช่น ระยะทาง 12 กม. ไม่มีรถส่วนตัว"
                  value={travelDifficultyDetail}
                  onChange={(e) => setTravelDifficultyDetail(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="suggestions" className="text-sm font-medium">
                  บันทึกการเยี่ยม
                </label>
                <Textarea
                  id="suggestions"
                  name="suggestions"
                  placeholder="สรุปผลการเยี่ยมบ้าน..."
                  className="min-h-[100px]"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="overallAssessment"
                  className="text-sm font-medium"
                >
                  ผลประเมินโดยรวม
                </label>
                <Textarea
                  id="overallAssessment"
                  name="overallAssessment"
                  placeholder="ประเมินสภาพโดยรวมของครอบครัว..."
                  className="min-h-[80px]"
                />
              </div>

              {/* Checkboxes */}
              <div className="flex flex-wrap gap-4 text-sm">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="followUpNeeded"
                    className="size-4 rounded border-input"
                  />
                  ต้องติดตามต่อเนื่อง
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="hasFamilyProblem"
                    className="size-4 rounded border-input"
                    checked={hasFamilyProblem}
                    onChange={(e) => setHasFamilyProblem(e.target.checked)}
                  />
                  มีปัญหาครอบครัว
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="travelDifficulty"
                    className="size-4 rounded border-input"
                    checked={travelDifficulty}
                    onChange={(e) => setTravelDifficulty(e.target.checked)}
                  />
                  เดินทางลำบาก
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="hasStudySpace"
                    className="size-4 rounded border-input"
                  />
                  มีมุมอ่านหนังสือ
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="hasInternet"
                    className="size-4 rounded border-input"
                  />
                  มีอินเทอร์เน็ตใช้
                </label>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Submit */}
        <div className="space-y-6">
          {selectedStudentId ? (
            <Card className="rounded-2xl border-border bg-muted/30 shadow-xs">
              <CardContent className="p-6 text-center text-sm text-muted-foreground">
                บันทึกการเยี่ยมบ้านก่อนเพื่ออัปโหลดหลักฐาน
              </CardContent>
            </Card>
          ) : (
            <Card className="rounded-2xl border-border bg-muted/30 shadow-xs">
              <CardContent className="p-6 text-center text-sm text-muted-foreground">
                เลือกนักเรียนก่อนเพื่ออัปโหลดหลักฐาน
              </CardContent>
            </Card>
          )}

          {/* Submit */}
          <Card className="rounded-2xl border-border bg-primary/5 shadow-xs">
            <CardContent className="p-6">
              <Button
                type="submit"
                disabled={pending || !selectedStudentId}
                className="w-full gap-2 rounded-xl"
                size="lg"
              >
                {pending ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Save className="h-5 w-5" />
                )}
                {pending ? "กำลังบันทึก..." : "บันทึกการเยี่ยมบ้าน"}
              </Button>
            </CardContent>
          </Card>

          {/* Error feedback */}
          {state && !state.ok ? (
            <div
              aria-live="polite"
              className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
            >
              {state.message}
            </div>
          ) : null}
        </div>
      </div>
    </form>
  )
}
