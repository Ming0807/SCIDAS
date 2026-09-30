import {
  Activity,
  AlertCircle,
  CreditCard,
  Heart,
  MapPin,
  Sparkles,
} from "lucide-react"

import type { Tables } from "@/types/database.types"
import { formatThaiShortDate, getFamilyStatusLabel } from "@/lib/student-care-formatters"

interface StudentHealthCardProps {
  student: Tables<"students"> | null
}

function formatNationalId(id?: string | null) {
  if (!id) return "ไม่ได้ระบุ"
  const clean = id.replace(/\D/g, "")
  if (clean.length === 13) {
    return `${clean[0]}-${clean.slice(1, 5)}-${clean.slice(5, 10)}-${clean.slice(10, 12)}-${clean[12]}`
  }
  return id
}

function calculateAge(dob?: string | null): string | null {
  if (!dob) return null
  const birthDate = new Date(dob)
  if (isNaN(birthDate.getTime())) return null
  const now = new Date()
  let age = now.getFullYear() - birthDate.getFullYear()
  const m = now.getMonth() - birthDate.getMonth()
  if (m < 0 || (m === 0 && now.getDate() < birthDate.getDate())) {
    age--
  }
  return age >= 0 ? `${age} ปี` : null
}

export function StudentHealthCard({ student }: StudentHealthCardProps) {
  if (!student) return null

  const hasHealthAlert = Boolean(student.medical_conditions || student.special_needs)

  const addr = (student.address || "").trim()
  const hasSubdistrict = Boolean(student.subdistrict && addr.includes(student.subdistrict))
  const hasDistrict = Boolean(student.district && addr.includes(student.district))
  const hasProvince = Boolean(student.province && addr.includes(student.province))
  const hasPostalCode = Boolean(student.postal_code && addr.includes(student.postal_code))

  const fullAddress = [
    addr || null,
    !hasSubdistrict && student.subdistrict
      ? student.subdistrict.startsWith("ต.")
        ? student.subdistrict
        : `ต.${student.subdistrict}`
      : null,
    !hasDistrict && student.district
      ? student.district.startsWith("อ.")
        ? student.district
        : `อ.${student.district}`
      : null,
    !hasProvince && student.province
      ? student.province.startsWith("จ.")
        ? student.province
        : `จ.${student.province}`
      : null,
    !hasPostalCode && student.postal_code ? student.postal_code : null,
  ]
    .filter(Boolean)
    .join(" ")

  const ageLabel = calculateAge(student.date_of_birth)

  return (
    <section className="rounded-xl border border-border bg-card p-5 shadow-sm sm:p-6">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div className="flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400">
            <Heart className="size-4" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-foreground">
              ข้อมูลส่วนตัว สุขภาพ และที่อยู่อาศัย (DMC)
            </h2>
            <p className="text-xs text-muted-foreground">
              ข้อมูลระบุตัวตน เลขบัตรประชาชน สุขภาพ ความต้องการพิเศษ และภูมิลำเนาผู้เรียน
            </p>
          </div>
        </div>
        {hasHealthAlert && (
          <div className="flex items-center gap-1 rounded-md bg-amber-500/10 px-2 py-1 text-xs font-medium text-amber-700 dark:text-amber-400">
            <AlertCircle className="size-3.5" />
            <span>มีข้อควรระวังสุขภาพ</span>
          </div>
        )}
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* National ID (13 digits) */}
        <div className="rounded-lg border border-border bg-background p-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">เลขประจำตัวประชาชน (13 หลัก)</span>
            <CreditCard className="size-3.5 text-muted-foreground" />
          </div>
          <p className="mt-1 font-mono text-sm font-semibold text-foreground">
            {formatNationalId(student.national_id)}
          </p>
        </div>

        {/* Date of Birth & Age */}
        <div className="rounded-lg border border-border bg-background p-3">
          <span className="text-xs text-muted-foreground">วันเดือนปีเกิด / อายุ</span>
          <p className="mt-1 text-sm font-semibold text-foreground">
            {student.date_of_birth ? formatThaiShortDate(student.date_of_birth) : "-"}
            {ageLabel ? <span className="ml-2 text-xs font-normal text-muted-foreground">({ageLabel})</span> : null}
          </p>
        </div>

        {/* Blood Group */}
        <div className="rounded-lg border border-border bg-background p-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">หมู่โลหิต (Blood Group)</span>
            <Activity className="size-3.5 text-muted-foreground" />
          </div>
          <p className="mt-1 text-sm font-semibold text-foreground">
            {student.blood_type ? `กรุ๊ป ${student.blood_type}` : "ไม่ได้ระบุ"}
          </p>
        </div>

        {/* Ethnicity / Nationality / Religion */}
        <div className="rounded-lg border border-border bg-background p-3">
          <span className="text-xs text-muted-foreground">สัญชาติ / เชื้อชาติ / ศาสนา</span>
          <p className="mt-1 text-sm font-semibold text-foreground">
            {[student.nationality || "ไทย", student.ethnicity || "ไทย", student.religion || "พุทธ"]
              .filter(Boolean)
              .join(" · ")}
          </p>
        </div>

        {/* Medical Conditions & Allergies */}
        <div className="rounded-lg border border-border bg-background p-3 sm:col-span-2">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <AlertCircle className="size-3.5 text-amber-500" />
            <span className="font-medium">โรคประจำตัว / ประวัติแพ้ยาและอาหาร</span>
          </div>
          <p className="mt-1 text-sm text-foreground leading-relaxed">
            {student.medical_conditions || "ไม่มีโรคประจำตัวหรือประวัติการแพ้ที่ระบุ"}
          </p>
        </div>

        {/* Special Needs */}
        <div className="rounded-lg border border-border bg-background p-3">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Sparkles className="size-3.5 text-primary" />
            <span className="font-medium">ความต้องการจำเป็นพิเศษ / ความพิการ (DMC)</span>
          </div>
          <p className="mt-1 text-sm text-foreground leading-relaxed">
            {student.special_needs || "ปกติ (ไม่มีความพิการหรือความต้องการพิเศษ)"}
          </p>
        </div>

        {/* Family Status */}
        <div className="rounded-lg border border-border bg-background p-3">
          <span className="text-xs text-muted-foreground">สถานะครอบครัว</span>
          <p className="mt-1 text-sm font-semibold text-foreground">
            {getFamilyStatusLabel(student.family_status)}
          </p>
        </div>

        {/* Travel */}
        <div className="rounded-lg border border-border bg-background p-3 sm:col-span-2">
          <span className="text-xs text-muted-foreground">การเดินทางมาโรงเรียน</span>
          <p className="mt-1 text-sm font-semibold text-foreground">
            {student.travel_method || "ไม่ระบุวิธีเดินทาง"}
            {student.distance_to_school_km !== null && student.distance_to_school_km !== undefined
              ? ` · ${Number(student.distance_to_school_km).toLocaleString("th-TH")} กม.`
              : ""}
          </p>
        </div>

        {/* Registered Address */}
        <div className="rounded-lg border border-border bg-background p-3 sm:col-span-2 lg:col-span-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <MapPin className="size-3.5 text-muted-foreground" />
              <span className="font-medium">ที่อยู่ตามทะเบียนบ้าน / ภูมิลำเนา</span>
            </div>
            {student.latitude && student.longitude ? (
              <span className="text-xs text-muted-foreground">
                พิกัด GPS: {student.latitude.toFixed(4)}, {student.longitude.toFixed(4)}
              </span>
            ) : null}
          </div>
          <p className="mt-1 text-sm text-foreground leading-relaxed">
            {fullAddress || "ไม่ได้ระบุที่อยู่"}
          </p>
        </div>
      </div>
    </section>
  )
}
