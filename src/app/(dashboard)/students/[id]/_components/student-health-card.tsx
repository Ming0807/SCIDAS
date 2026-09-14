import {
  Activity,
  AlertCircle,
  Heart,
  MapPin,
  Sparkles,
} from "lucide-react"

import type { Tables } from "@/types/database.types"
import { formatThaiShortDate } from "@/lib/student-care-formatters"

interface StudentHealthCardProps {
  student: Tables<"students"> | null
}

export function StudentHealthCard({ student }: StudentHealthCardProps) {
  if (!student) return null

  const hasHealthAlert = Boolean(student.medical_conditions || student.special_needs)

  const fullAddress = [
    student.address,
    student.subdistrict ? `ต.${student.subdistrict}` : null,
    student.district ? `อ.${student.district}` : null,
    student.province ? `จ.${student.province}` : null,
    student.postal_code,
  ]
    .filter(Boolean)
    .join(" ")

  return (
    <section className="rounded-xl border border-border bg-card p-5 shadow-sm sm:p-6">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div className="flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400">
            <Heart className="size-4" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-foreground">
              ข้อมูลสุขภาพ สวัสดิภาพ และที่อยู่อาศัย
            </h2>
            <p className="text-xs text-muted-foreground">
              ข้อมูลด้านสุขภาพ โรคประจำตัว ความต้องการจำเป็นพิเศษ และภูมิลำเนาผู้เรียน
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
        {/* Blood Group */}
        <div className="rounded-lg border border-border bg-background p-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">หมู่โลหิต (Blood Group)</span>
            <Activity className="size-3.5 text-muted-foreground" />
          </div>
          <p className="mt-1 text-base font-bold text-foreground">
            {student.blood_type ? `กรุ๊ป ${student.blood_type}` : "ไม่ได้ระบุ"}
          </p>
        </div>

        {/* Date of Birth */}
        <div className="rounded-lg border border-border bg-background p-3">
          <span className="text-xs text-muted-foreground">วันเดือนปีเกิด</span>
          <p className="mt-1 text-sm font-semibold text-foreground">
            {student.date_of_birth ? formatThaiShortDate(student.date_of_birth) : "-"}
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
            <span className="font-medium">ความต้องการจำเป็นพิเศษ</span>
          </div>
          <p className="mt-1 text-sm text-foreground leading-relaxed">
            {student.special_needs || "ปกติ (ไม่มีความต้องการพิเศษ)"}
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
