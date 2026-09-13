"use client"

import { useActionState, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Building2, Hospital, LoaderCircle, Send } from "lucide-react"

import { createReferralAction, type ReferralType } from "@/app/actions/referral.actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

type StudentOption = {
  id: string
  first_name: string
  last_name: string
  student_code: string | null
  classroom_name?: string | null
}

const COMMON_INTERNAL_AGENCIES = [
  "งานแนะแนว / ห้องแนะแนวโรงเรียน",
  "ฝ่ายกิจการนักเรียน / ฝ่ายปกครอง",
  "ห้องพยาบาล / ครูพยาบาล",
  "ฝ่ายวิชาการ / ครูผู้สอนประจำวิชา",
  "คณะกรรมการงานระบบดูแลช่วยเหลือนักเรียน",
]

const COMMON_EXTERNAL_AGENCIES = [
  "โรงพยาบาลส่งเสริมสุขภาพตำบล (รพ.สต.)",
  "โรงพยาบาลชุมชน / โรงพยาบาลศูนย์ประจำจังหวัด",
  "สถาบันสุขภาพจิตเด็กและวัยรุ่น",
  "สำนักงานพัฒนาสังคมและความมั่นคงของมนุษย์จังหวัด (พมจ.)",
  "ศูนย์บริการสาธารณสุข เทศบาล/อบต.",
  "บ้านพักเด็กและครอบครัวประจำจังหวัด",
  "สถานีตำรวจภูธร / เจ้าหน้าที่ฝ่ายปกครอง",
]

export function ReferralForm({
  students,
  preselectedStudentId,
}: {
  students: StudentOption[]
  preselectedStudentId?: string
}) {
  const router = useRouter()
  const [state, formAction, isPending] = useActionState(createReferralAction, null)

  const [referralType, setReferralType] = useState<ReferralType>("internal")
  const [selectedStudentId, setSelectedStudentId] = useState(preselectedStudentId || "")
  const [targetAgency, setTargetAgency] = useState("")

  useEffect(() => {
    if (state?.ok && state.data?.id) {
      router.push(`/referrals/${state.data.id}`)
    }
  }, [state, router])

  const suggestedAgencies =
    referralType === "internal" ? COMMON_INTERNAL_AGENCIES : COMMON_EXTERNAL_AGENCIES

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="referral_type" value={referralType} />

      {state && !state.ok ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-800 dark:border-rose-900 dark:bg-rose-950/50 dark:text-rose-200">
          <p className="font-semibold">{state.message}</p>
        </div>
      ) : null}

      {/* Step 1: Select Student & Referral Type */}
      <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-xs space-y-4">
        <h2 className="text-base font-semibold text-foreground">
          1. ข้อมูลนักเรียนและประเภทการส่งต่อ
        </h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="student_id" className="block text-xs font-medium text-foreground mb-1">
              นักเรียนที่ต้องการส่งต่อ <span className="text-destructive">*</span>
            </label>
            <select
              id="student_id"
              name="student_id"
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              required
              className="w-full h-10 rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-hidden focus:ring-2 focus:ring-ring"
            >
              <option value="">-- เลือกนักเรียน --</option>
              {students.map((stu) => (
                <option key={stu.id} value={stu.id}>
                  {stu.first_name} {stu.last_name}
                  {stu.student_code ? ` (รหัส: ${stu.student_code})` : ""}
                  {stu.classroom_name ? ` - ${stu.classroom_name}` : ""}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-foreground mb-1">
              ลักษณะการส่งต่อ <span className="text-destructive">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setReferralType("internal")
                  setTargetAgency("")
                }}
                className={`flex items-center justify-center gap-2 h-10 rounded-xl border text-xs font-medium transition-colors ${
                  referralType === "internal"
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-muted/60 text-muted-foreground border-border hover:bg-muted"
                }`}
              >
                <Building2 className="size-4" />
                ส่งต่อภายในโรงเรียน
              </button>
              <button
                type="button"
                onClick={() => {
                  setReferralType("external")
                  setTargetAgency("")
                }}
                className={`flex items-center justify-center gap-2 h-10 rounded-xl border text-xs font-medium transition-colors ${
                  referralType === "external"
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-muted/60 text-muted-foreground border-border hover:bg-muted"
                }`}
              >
                <Hospital className="size-4" />
                ส่งต่อหน่วยงานภายนอก
              </button>
            </div>
          </div>
        </div>

        {/* Target Agency */}
        <div>
          <label htmlFor="target_agency" className="block text-xs font-medium text-foreground mb-1">
            หน่วยงาน / บุคคล / สถาบันปลายทางที่รับส่งต่อ <span className="text-destructive">*</span>
          </label>
          <Input
            id="target_agency"
            name="target_agency"
            value={targetAgency}
            onChange={(e) => setTargetAgency(e.target.value)}
            placeholder="เช่น งานแนะแนวโรงเรียน หรือ โรงพยาบาลส่งเสริมสุขภาพตำบล..."
            required
            className="text-sm rounded-xl"
          />

          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <span className="text-xs text-muted-foreground">หน่วยงานแนะนำ:</span>
            {suggestedAgencies.map((agency) => (
              <button
                key={agency}
                type="button"
                onClick={() => setTargetAgency(agency)}
                className="rounded-lg bg-muted px-2 py-0.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                + {agency}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Step 2: Referral Reason and Dimension */}
      <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-xs space-y-4">
        <h2 className="text-base font-semibold text-foreground">
          2. รายละเอียดและเหตุผลในการส่งต่อ (ตามเกณฑ์ สพฐ.)
        </h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="support_type" className="block text-xs font-medium text-foreground mb-1">
              ด้านที่ประสบปัญหา / ต้องการส่งต่อ <span className="text-destructive">*</span>
            </label>
            <select
              id="support_type"
              name="support_type"
              defaultValue="emotional"
              className="w-full h-10 rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-hidden focus:ring-2 focus:ring-ring"
            >
              <option value="emotional">ด้านจิตใจ / อารมณ์ / สุขภาพจิต</option>
              <option value="behavioral">ด้านพฤติกรรมและความประพฤติ</option>
              <option value="health">ด้านสุขภาพกาย / โรคประจำตัว</option>
              <option value="academic">ด้านการเรียน / ผลการเรียน</option>
              <option value="family">ด้านครอบครัวและการเลี้ยงดู</option>
              <option value="financial">ด้านเศรษฐกิจและความเป็นอยู่</option>
              <option value="social">ด้านสังคมและความสัมพันธ์กับเพื่อน</option>
              <option value="other">ด้านอื่น ๆ</option>
            </select>
          </div>

          <div>
            <label htmlFor="priority" className="block text-xs font-medium text-foreground mb-1">
              ระดับความเร่งด่วน <span className="text-destructive">*</span>
            </label>
            <select
              id="priority"
              name="priority"
              defaultValue="medium"
              className="w-full h-10 rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-hidden focus:ring-2 focus:ring-ring"
            >
              <option value="low">ปกติ - ติดตามดูแลตามแผน</option>
              <option value="medium">ปานกลาง - ควรได้รับการช่วยเหลือใน 1-2 สัปดาห์</option>
              <option value="high">สูง - ต้องการความช่วยเหลืออย่างเร่งด่วนใน 1-3 วัน</option>
              <option value="critical">วิกฤต - ภาวะฉุกเฉิน ต้องส่งต่อทันทีวันนี้</option>
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="title" className="block text-xs font-medium text-foreground mb-1">
            หัวข้อการส่งต่อนักเรียน <span className="text-destructive">*</span>
          </label>
          <Input
            id="title"
            name="title"
            placeholder="เช่น ขอส่งต่อนักเรียนเพื่อรับคำปรึกษาด้านอารมณ์และความเครียด"
            required
            className="text-sm rounded-xl"
          />
        </div>

        <div>
          <label htmlFor="reason" className="block text-xs font-medium text-foreground mb-1">
            เหตุผลและสภาพปัญหาที่พบ / ข้อมูลจากการคัดกรองหรือเยี่ยมบ้าน{" "}
            <span className="text-destructive">*</span>
          </label>
          <Textarea
            id="reason"
            name="reason"
            rows={4}
            placeholder="ระบุพฤติกรรมที่สังเกตเห็น ผลกระทบต่อการเรียน ผลการประเมิน SDQ หรือข้อมูลแวดล้อมที่เป็นข้อบ่งชี้ในการส่งต่อ..."
            required
            className="text-sm rounded-xl"
          />
        </div>

        <div>
          <label htmlFor="preliminary_action" className="block text-xs font-medium text-foreground mb-1">
            การช่วยเหลือเบื้องต้นที่โรงเรียนได้ดำเนินการไปแล้ว
          </label>
          <Textarea
            id="preliminary_action"
            name="preliminary_action"
            rows={2}
            placeholder="เช่น ให้คำปรึกษาเบื้องต้น 2 ครั้ง, พบผู้ปกครองเพื่อวางแผนร่วมกัน, ปรับสภาพแวดล้อมในชั้นเรียน..."
            className="text-sm rounded-xl"
          />
        </div>

        <div>
          <label htmlFor="action_plan" className="block text-xs font-medium text-foreground mb-1">
            สิ่งที่ต้องการให้หน่วยงานปลายทางช่วยดำเนินการ / ข้อสังเกตเพิ่มเติม
          </label>
          <Textarea
            id="action_plan"
            name="action_plan"
            rows={2}
            placeholder="เช่น ตรวจวินิจฉัยและประเมินภาวะสุขภาพจิต, ให้การบำบัดรักษา, สนับสนุนทุนสงเคราะห์..."
            className="text-sm rounded-xl"
          />
        </div>
      </div>

      {/* Form Buttons */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <Link
          href="/referrals"
          className="rounded-xl border border-border px-4 py-2 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          ยกเลิก
        </Link>
        <Button type="submit" disabled={isPending} className="text-xs">
          {isPending ? (
            <>
              <LoaderCircle className="size-4 animate-spin mr-1.5" />
              กำลังบันทึก...
            </>
          ) : (
            <>
              <Send className="size-4 mr-1.5" />
              บันทึกส่งต่อนักเรียน
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
