"use client"

import { useActionState, useEffect, useMemo, useState, type ReactNode } from "react"
import { Loader2, Save, Search, X } from "lucide-react"
import { useRouter } from "next/navigation"

import { updateHomeVisitAction } from "@/app/actions/home-visit.actions"
import { ActionFeedback } from "@/components/forms/action-feedback"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import type { ActionResult } from "@/lib/server/action-result"
import type { HomeVisitRecord } from "@/lib/server/home-visit-read-models"

type StudentOption = {
  id: string
  name: string
  classroom?: string
  code: string
  address?: string
}

type HomeVisitEditFormProps = {
  record: HomeVisitRecord
  studentOptions: StudentOption[]
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

export function HomeVisitEditForm({ record, studentOptions }: HomeVisitEditFormProps) {
  const router = useRouter()
  const [state, formAction, pending] = useActionState<
    ActionResult<{ id: string }> | null,
    FormData
  >(updateHomeVisitAction, null)

  const initialStudent = studentOptions.find((s) => s.id === record.studentId)
  const [selectedStudentId, setSelectedStudentId] = useState<string>(record.studentId)
  const [addressVisited, setAddressVisited] = useState<string>(record.address ?? "")

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

  const handleStudentChange = (newStudentId: string) => {
    setSelectedStudentId(newStudentId)
    const st = studentOptions.find((s) => s.id === newStudentId)
    if (st?.address && st.address.trim()) {
      setAddressVisited(st.address.trim())
    }
  }

  const currentStudent = studentOptions.find((s) => s.id === selectedStudentId)

  useEffect(() => {
    if (state?.ok && state.redirectTo) router.push(state.redirectTo)
  }, [router, state])

  const fieldErrors = state?.ok === false ? state.fieldErrors : undefined

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="record_id" value={record.id} />

      <Card>
        <CardHeader>
          <CardTitle>รายละเอียดการเยี่ยมบ้าน</CardTitle>
          <CardDescription>
            แก้ไขเฉพาะข้อมูลการเยี่ยมบ้าน ระบบจะคงโรงเรียน ผู้บันทึก และภาคเรียนเดิมไว้
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-5 md:grid-cols-2">
            {/* Student Selector with Classroom Filter and Search */}
            <div className="space-y-3 md:col-span-2 p-3.5 rounded-xl bg-muted/40 border border-border/70">
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
                  aria-invalid={!!fieldErrors?.studentId}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring focus:ring-3 focus:ring-ring/50 font-medium"
                >
                  <option value="">
                    {filteredStudentOptions.length === 0
                      ? "-- ไม่พบรายชื่อนักเรียนที่ตรงกับเงื่อนไข --"
                      : `-- เลือกนักเรียน (${filteredStudentOptions.length} คน) --`}
                  </option>
                  {filteredStudentOptions.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.name} {student.classroom ? `(${student.classroom})` : ""} — รหัส {student.code}
                    </option>
                  ))}
                </select>
                <FieldError message={fieldErrors?.studentId?.[0]} />
              </div>

              {/* Selected Student Information & Address Status Card */}
              {currentStudent && (
                <div
                  className={`p-3 rounded-lg text-xs border ${
                    currentStudent.address
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-950 dark:text-emerald-200"
                      : "bg-amber-500/10 border-amber-500/30 text-amber-950 dark:text-amber-200"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
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
                      <div>
                        {currentStudent.address ? (
                          <p className="flex items-baseline gap-1 flex-wrap">
                            <span className="font-medium">📍 ที่อยู่ตามฐานข้อมูล:</span>
                            <span>{currentStudent.address}</span>
                          </p>
                        ) : (
                          <p>
                            ⚠️ นักเรียนคนนี้ยังไม่มีข้อมูลที่อยู่ในฐานข้อมูล (สามารถพิมพ์ระบุในช่องด้านล่างได้)
                          </p>
                        )}
                      </div>
                    </div>
                    {currentStudent.address && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300 shrink-0">
                        ✓ ดึงที่อยู่อัตโนมัติแล้ว
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            <Field id="visitDate" label="วันที่เยี่ยม" error={fieldErrors?.visitDate?.[0]}>
              <Input
                id="visitDate"
                name="visitDate"
                type="date"
                required
                defaultValue={record.visitDate}
                aria-invalid={!!fieldErrors?.visitDate}
              />
            </Field>
            <Field id="visitTime" label="เวลา" error={fieldErrors?.visitTime?.[0]}>
              <Input
                id="visitTime"
                name="visitTime"
                type="time"
                defaultValue={record.visitTime?.slice(0, 5) ?? ""}
                aria-invalid={!!fieldErrors?.visitTime}
              />
            </Field>
          </div>

          <Field id="addressVisited" label="ที่อยู่ที่เยี่ยม" error={fieldErrors?.addressVisited?.[0]}>
            <div className="space-y-1.5">
              <Input
                id="addressVisited"
                name="addressVisited"
                value={addressVisited}
                onChange={(e) => setAddressVisited(e.target.value)}
                maxLength={2000}
                placeholder="ที่อยู่ที่ไปเยี่ยม..."
                aria-invalid={!!fieldErrors?.addressVisited}
              />
              {currentStudent?.address && currentStudent.address !== addressVisited && (
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setAddressVisited(currentStudent.address || "")}
                    className="text-xs text-primary underline hover:text-primary/80 cursor-pointer"
                  >
                    🔗 ใช้ที่อยู่ตามข้อมูลนักเรียน ({currentStudent.address})
                  </button>
                </div>
              )}
            </div>
          </Field>

          <div className="space-y-2">
            <label htmlFor="housingCondition" className="text-sm font-medium">
              สภาพบ้าน
            </label>
            <select
              id="housingCondition"
              name="housingCondition"
              defaultValue={record.housingCondition ?? ""}
              aria-invalid={!!fieldErrors?.housingCondition}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-3 focus:ring-ring/50"
            >
              <option value="">ไม่ระบุ</option>
              <option value="good">ดี</option>
              <option value="moderate">พอใช้</option>
              <option value="poor">ควรดูแล</option>
              <option value="critical">เร่งดูแล</option>
            </select>
            <FieldError message={fieldErrors?.housingCondition?.[0]} />
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <Checkbox name="followUpNeeded" checked={record.followUpNeeded}>
              ต้องติดตามต่อเนื่อง
            </Checkbox>
            <Checkbox name="hasFamilyProblem" checked={record.hasFamilyProblem}>
              มีปัญหาครอบครัว
            </Checkbox>
            <Checkbox name="travelDifficulty" checked={record.travelDifficulty}>
              เดินทางลำบาก
            </Checkbox>
            <Checkbox name="hasStudySpace" checked={record.hasStudySpace}>
              มีมุมอ่านหนังสือ
            </Checkbox>
            <Checkbox name="hasInternet" checked={record.hasInternet}>
              มีอินเทอร์เน็ตใช้
            </Checkbox>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <Field id="housingType" label="ประเภทที่อยู่อาศัย" error={fieldErrors?.housingType?.[0]}>
              <Input
                id="housingType"
                name="housingType"
                defaultValue={record.housingType ?? ""}
                maxLength={100}
                placeholder="เช่น บ้านไม้, ห้องเช่า"
                aria-invalid={!!fieldErrors?.housingType}
              />
            </Field>
            <Field id="housingOwnership" label="การครอบครอง" error={fieldErrors?.housingOwnership?.[0]}>
              <Input
                id="housingOwnership"
                name="housingOwnership"
                defaultValue={record.housingOwnership ?? ""}
                maxLength={100}
                placeholder="เช่น เป็นของตนเอง, เช่า"
                aria-invalid={!!fieldErrors?.housingOwnership}
              />
            </Field>
            <Field id="familyMembersCount" label="จำนวนสมาชิกในบ้าน (คน)" error={fieldErrors?.familyMembersCount?.[0]}>
              <Input
                id="familyMembersCount"
                name="familyMembersCount"
                type="number"
                min={0}
                step={1}
                defaultValue={record.familyMembersCount ?? ""}
                aria-invalid={!!fieldErrors?.familyMembersCount}
              />
            </Field>
            <Field id="familyIncome" label="รายได้ครอบครัว/เดือน (บาท)" error={fieldErrors?.familyIncome?.[0]}>
              <Input
                id="familyIncome"
                name="familyIncome"
                type="number"
                min={0}
                step="0.01"
                defaultValue={record.familyIncome ?? ""}
                aria-invalid={!!fieldErrors?.familyIncome}
              />
            </Field>
            <Field id="familySituation" label="สภาพครอบครัว" error={fieldErrors?.familySituation?.[0]}>
              <Textarea
                id="familySituation"
                name="familySituation"
                defaultValue={record.familySituation ?? ""}
                maxLength={5000}
                className="min-h-28 resize-y"
                aria-invalid={!!fieldErrors?.familySituation}
              />
            </Field>
            <Field id="studentBehaviorAtHome" label="พฤติกรรมนักเรียนที่บ้าน" error={fieldErrors?.studentBehaviorAtHome?.[0]}>
              <Textarea
                id="studentBehaviorAtHome"
                name="studentBehaviorAtHome"
                defaultValue={record.studentBehaviorAtHome ?? ""}
                maxLength={5000}
                className="min-h-28 resize-y"
                aria-invalid={!!fieldErrors?.studentBehaviorAtHome}
              />
            </Field>
            <Field id="environmentSafety" label="ความปลอดภัยของสภาพแวดล้อม" error={fieldErrors?.environmentSafety?.[0]}>
              <Textarea
                id="environmentSafety"
                name="environmentSafety"
                defaultValue={record.environmentSafety ?? ""}
                maxLength={2000}
                className="min-h-28 resize-y"
                aria-invalid={!!fieldErrors?.environmentSafety}
              />
            </Field>
            <Field id="travelDifficultyDetail" label="รายละเอียดการเดินทางลำบาก" error={fieldErrors?.travelDifficultyDetail?.[0]}>
              <Textarea
                id="travelDifficultyDetail"
                name="travelDifficultyDetail"
                defaultValue={record.travelDifficultyDetail ?? ""}
                maxLength={2000}
                className="min-h-28 resize-y"
                aria-invalid={!!fieldErrors?.travelDifficultyDetail}
              />
            </Field>
          </div>

          <Field id="coVisitors" label="ผู้ร่วมเยี่ยม (คั่นด้วยจุลภาคหรือขึ้นบรรทัดใหม่)" error={fieldErrors?.coVisitors?.[0]}>
            <Textarea
              id="coVisitors"
              name="coVisitors"
              defaultValue={(record.coVisitors ?? []).join(", ")}
              maxLength={2000}
              className="min-h-20 resize-y"
              aria-invalid={!!fieldErrors?.coVisitors}
            />
          </Field>

          <div className="grid gap-5 md:grid-cols-2">
            <Field id="overallAssessment" label="ผลประเมินโดยรวม" error={fieldErrors?.overallAssessment?.[0]}>
              <Textarea
                id="overallAssessment"
                name="overallAssessment"
                defaultValue={record.overallAssessment ?? ""}
                maxLength={5000}
                className="min-h-28 resize-y"
                aria-invalid={!!fieldErrors?.overallAssessment}
              />
            </Field>
            <Field id="familyProblemDetail" label="รายละเอียดปัญหาครอบครัว" error={fieldErrors?.familyProblemDetail?.[0]}>
              <Textarea
                id="familyProblemDetail"
                name="familyProblemDetail"
                defaultValue={record.familyProblemDetail ?? ""}
                maxLength={5000}
                className="min-h-28 resize-y"
                aria-invalid={!!fieldErrors?.familyProblemDetail}
              />
            </Field>
            <Field id="suggestions" label="ข้อเสนอแนะ" error={fieldErrors?.suggestions?.[0]}>
              <Textarea
                id="suggestions"
                name="suggestions"
                defaultValue={record.suggestions ?? ""}
                maxLength={5000}
                className="min-h-28 resize-y"
                aria-invalid={!!fieldErrors?.suggestions}
              />
            </Field>
            <Field id="followUpDetail" label="รายละเอียดการติดตาม" error={fieldErrors?.followUpDetail?.[0]}>
              <Textarea
                id="followUpDetail"
                name="followUpDetail"
                defaultValue={record.followUpDetail ?? ""}
                maxLength={5000}
                className="min-h-28 resize-y"
                aria-invalid={!!fieldErrors?.followUpDetail}
              />
            </Field>
          </div>

          <ActionFeedback result={state} />
        </CardContent>
        <CardFooter className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button type="button" variant="ghost" onClick={() => router.push(`/home-visits/${record.id}`)}>
            ยกเลิก
          </Button>
          <Button type="submit" disabled={pending || studentOptions.length === 0} className="w-full gap-2 sm:w-auto">
            {pending ? <Loader2 className="animate-spin" /> : <Save />}
            {pending ? "กำลังบันทึก..." : "บันทึกการแก้ไข"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}

function Field({
  id,
  label,
  error,
  children,
}: {
  id: string
  label: string
  error?: string
  children: ReactNode
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-sm font-medium">{label}</label>
      {children}
      <FieldError message={error} />
    </div>
  )
}

function Checkbox({
  name,
  checked,
  children,
}: {
  name: string
  checked: boolean
  children: ReactNode
}) {
  return (
    <label className="flex items-center gap-2 text-sm text-foreground">
      <input
        type="checkbox"
        name={name}
        defaultChecked={checked}
        className="size-4 rounded border-input text-primary focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      />
      {children}
    </label>
  )
}

function FieldError({ message }: { message?: string }) {
  return message ? <p className="text-xs text-destructive">{message}</p> : null
}
