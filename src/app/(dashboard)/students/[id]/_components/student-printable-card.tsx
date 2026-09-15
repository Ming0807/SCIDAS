"use client"

import { Printer } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  formatClassroomLabel,
  formatPercent,
  formatThaiShortDate,
  getStudentRiskLabel,
} from "@/lib/student-care-formatters"
import type {
  ActionQueueItem,
  StudentCareProfile,
  StudentGuardianItem,
} from "@/lib/server/student-care-read-models"
import type { Tables } from "@/types/database.types"

export function StudentPrintableCard({
  profile,
  guardians,
  actionItems,
  student,
}: {
  profile: StudentCareProfile
  guardians: StudentGuardianItem[]
  actionItems: ActionQueueItem[]
  student?: Tables<"students"> | null
}) {
  const handlePrint = () => {
    window.print()
  }

  const classroomLabel = formatClassroomLabel({
    gradeLevel: profile.gradeLevel,
    section: profile.section,
    classroomName: profile.classroomName,
  })

  const riskLabel = getStudentRiskLabel(profile.riskLevel)
  const primaryGuardian = guardians.find((g) => g.isPrimary) || guardians[0]

  return (
    <>
      {/* Print Trigger Button (Hidden during print) */}
      <Button
        type="button"
        variant="outline"
        onClick={handlePrint}
        className="print:hidden gap-1.5 text-xs"
      >
        <Printer className="size-4" />
        พิมพ์ระเบียน ปพ.8 ย่อ
      </Button>

      {/* Printable Sheet (Displayed ONLY when printing) */}
      <div className="hidden print:block font-serif bg-white text-black p-6 max-w-4xl mx-auto space-y-4 text-xs leading-relaxed">
        <style dangerouslySetInnerHTML={{ __html: "@media print { @page { size: A4 portrait; margin: 12mm; } }" }} />
        {/* Header */}
        <div className="text-center space-y-0.5 border-b-2 border-black pb-3">
          <h1 className="text-base font-bold">ระเบียนข้อมูลนักเรียนและสรุปการดูแลช่วยเหลือรายบุคคล (ปพ.8 ย่อ)</h1>
          <p className="text-xs">ระบบดูแลช่วยเหลือนักเรียน (SCIDAS) · สำนักงานคณะกรรมการการศึกษาขั้นพื้นฐาน (สพฐ.)</p>
          <div className="flex justify-between pt-1 text-xs">
            <span>รหัสนักเรียน: <strong>{profile.studentCode}</strong></span>
            <span>ชั้น/ห้อง: <strong>{classroomLabel}</strong></span>
            <span>วันที่พิมพ์: {formatThaiShortDate(new Date().toISOString())}</span>
          </div>
        </div>

        {/* Section 1: General Info & Health */}
        <div className="border border-black p-3 space-y-2">
          <h2 className="font-bold underline text-xs">หมวดที่ 1: ข้อมูลทั่วไปและสุขภาพของนักเรียน</h2>
          <div className="grid grid-cols-3 gap-2">
            <p><strong>ชื่อ-สกุล:</strong> {profile.fullName}</p>
            <p><strong>ชื่อเล่น:</strong> {profile.nickname || "-"}</p>
            <p><strong>เลขที่:</strong> {profile.studentNumber ?? "-"}</p>
            <p><strong>เพศ:</strong> {profile.gender === "male" ? "ชาย" : profile.gender === "female" ? "หญิง" : "-"}</p>
            <p><strong>สถานะภาพ:</strong> {profile.status === "active" ? "กำลังศึกษา" : "อื่น ๆ"}</p>
            <p><strong>หมู่โลหิต:</strong> {student?.blood_type ? `กรุ๊ป ${student.blood_type}` : "-"}</p>
            <p><strong>การเดินทาง:</strong> {profile.travelMethod || "-"}</p>
            <p><strong>ระยะทาง:</strong> {profile.distanceToSchoolKm ? `${profile.distanceToSchoolKm} กม.` : "-"}</p>
            <p><strong>ศาสนา/สัญชาติ:</strong> {student?.religion || "พุทธ"} / {student?.nationality || "ไทย"}</p>
          </div>
          <div className="border-t border-gray-300 pt-1.5 grid grid-cols-2 gap-2 text-xs">
            <p><strong>โรคประจำตัว/ประวัติแพ้:</strong> {student?.medical_conditions || "ไม่มี"}</p>
            <p><strong>ความต้องการจำเป็นพิเศษ:</strong> {student?.special_needs || "ปกติ"}</p>
            <p className="col-span-2"><strong>ที่อยู่ตามทะเบียนบ้าน:</strong> {student?.address || "-"}</p>
          </div>
        </div>

        {/* Section 2: Guardian Info */}
        <div className="border border-black p-3 space-y-2">
          <h2 className="font-bold underline text-xs">หมวดที่ 2: ข้อมูลผู้ปกครองและการติดต่อ</h2>
          {primaryGuardian ? (
            <div className="grid grid-cols-2 gap-2">
              <p><strong>ชื่อผู้ปกครองหลัก:</strong> {primaryGuardian.fullName}</p>
              <p><strong>ความสัมพันธ์:</strong> {primaryGuardian.relationship || "ผู้ปกครอง"}</p>
              <p><strong>เบอร์โทรศัพท์:</strong> {primaryGuardian.phone || profile.primaryGuardianPhone || "-"}</p>
              <p><strong>สถานะการติดต่อ:</strong> สามารถติดต่อได้ตามปกติ</p>
            </div>
          ) : (
            <p>ผู้ปกครอง: {profile.primaryGuardianName || "-"} (โทร: {profile.primaryGuardianPhone || "-"})</p>
          )}
        </div>

        {/* Section 3: Risk & Attendance Summary */}
        <div className="border border-black p-3 space-y-2">
          <h2 className="font-bold underline text-xs">หมวดที่ 3: สรุปผลการคัดกรองและการมาเรียน (สพฐ. 5 ขั้น)</h2>
          <div className="grid grid-cols-3 gap-2">
            <p><strong>ระดับความเสี่ยง:</strong> {riskLabel} (คะแนน: {profile.riskScore})</p>
            <p><strong>แนวโน้มความเสี่ยง:</strong> {profile.riskTrend || "คงที่"}</p>
            <p><strong>งานดูแลค้างดำเนินการ:</strong> {profile.openActionCount} รายการ</p>
            <p><strong>อัตราการมาเรียน (30 วัน):</strong> {formatPercent(profile.attendanceRate30d)}</p>
            <p><strong>จำนวนวันขาดเรียน:</strong> {profile.absentDays30d} วัน</p>
            <p><strong>จำนวนวันมาสาย:</strong> {profile.lateDays30d} วัน</p>
          </div>
        </div>

        {/* Section 4: Current Interventions / Action Plan */}
        <div className="border border-black p-3 space-y-2">
          <h2 className="font-bold underline text-xs">หมวดที่ 4: แผนการดูแลช่วยเหลือและการส่งต่อ</h2>
          {actionItems.length === 0 ? (
            <p className="text-muted-foreground">ไม่มีรายการงานดูแลช่วยเหลือที่ค้างดำเนินการในขณะนี้</p>
          ) : (
            <div className="space-y-1">
              {actionItems.slice(0, 5).map((item, idx) => (
                <div key={item.id} className="flex items-start justify-between border-b border-gray-300 pb-1 last:border-b-0">
                  <span>{idx + 1}. {item.title}</span>
                  <span className="font-semibold">ความสำคัญ: {item.priority}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Signatures */}
        <div className="grid grid-cols-3 gap-4 pt-6 text-center text-xs break-inside-avoid">
          <div className="space-y-6">
            <div className="border-b border-black w-32 mx-auto pt-8"></div>
            <div>
              <p>ลงชื่อ..................................................</p>
              <p>(..........................................................)</p>
              <p>ครูประจำชั้น / ครูที่ปรึกษา</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="border-b border-black w-32 mx-auto pt-8"></div>
            <div>
              <p>ลงชื่อ..................................................</p>
              <p>(..........................................................)</p>
              <p>ครูแนะแนว / หัวหน้างานดูแลช่วยเหลือนักเรียน</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="border-b border-black w-32 mx-auto pt-8"></div>
            <div>
              <p>ลงชื่อ..................................................</p>
              <p>(..........................................................)</p>
              <p>ผู้อำนวยการสถานศึกษา</p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
