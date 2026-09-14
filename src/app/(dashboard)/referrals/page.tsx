import Link from "next/link"
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Clock,
  Hospital,
  Plus,
  Search,
  Share2,
  Users,
} from "lucide-react"

import {
  getReferralsList,
  type ReferralListItem,
} from "@/app/actions/referral.actions"
import {
  MetricCard,
  PageHeader,
  PageShell,
  StatusBadge,
} from "@/components/dashboard"
import { buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { formatThaiShortDate } from "@/lib/student-care-formatters"
import { cn } from "@/lib/utils"

type SearchParams = Promise<{
  type?: string
  status?: string
  q?: string
  studentId?: string
}>

export const metadata = {
  title: "ศูนย์การส่งต่อนักเรียน (Referral Center) | SCIDAS",
  description: "ระบบบริหารจัดการการส่งต่อนักเรียนทั้งภายในและภายนอกสถานศึกษา ตามระบบดูแลช่วยเหลือนักเรียน สพฐ. 5 ขั้นตอน",
}

function getPriorityBadge(priority: ReferralListItem["priority"]) {
  switch (priority) {
    case "critical":
      return { text: "เร่งด่วนที่สุด", color: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900" }
    case "high":
      return { text: "สูง", color: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900" }
    case "medium":
      return { text: "ปานกลาง", color: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900" }
    default:
      return { text: "ปกติ", color: "bg-muted text-muted-foreground border-border" }
  }
}

function getStatusBadge(status: ReferralListItem["status"]) {
  switch (status) {
    case "completed":
      return { text: "เสร็จสิ้นแล้ว", tone: "normal" as const }
    case "in_progress":
      return { text: "อยู่ระหว่างประสานงาน", tone: "info" as const }
    case "cancelled":
      return { text: "ยกเลิก", tone: "neutral" as const }
    case "referred":
    case "pending":
    default:
      return { text: "รอหน่วยงานตอบรับ", tone: "watch" as const }
  }
}

export default async function ReferralsPage({
  searchParams,
}: {
  searchParams?: SearchParams
}) {
  const params = searchParams ? await searchParams : {}
  const selectedType = params.type || "all"
  const selectedStatus = params.status || "all"
  const searchQuery = params.q || ""
  const selectedStudentId = params.studentId || ""

  const result = await getReferralsList({
    type: selectedType as "all" | "internal" | "external",
    status: selectedStatus,
    search: searchQuery,
    studentId: selectedStudentId || undefined,
  })

  const referrals = result.ok && result.data ? result.data : []

  // Calculate metrics
  const total = referrals.length
  const internalCount = referrals.filter((r) => r.referral_type === "internal").length
  const externalCount = referrals.filter((r) => r.referral_type === "external").length
  const completedCount = referrals.filter((r) => r.status === "completed").length

  return (
    <PageShell size="wide" spacing="default">
      <PageHeader
        title="ระบบส่งต่อนักเรียน (Referral Center)"
        description="การส่งต่อนักเรียนทั้งภายในสถานศึกษาและส่งต่อไปยังผู้เชี่ยวชาญภายนอก (ขั้นตอนที่ 5 ของระบบดูแลช่วยเหลือนักเรียน สพฐ.)"
        actions={
          <Link
            href="/referrals/new"
            className={cn(buttonVariants({ variant: "default" }))}
          >
            <Plus className="size-4 mr-1.5" />
            สร้างเคสส่งต่อใหม่
          </Link>
        }
      />

      {/* Metrics Row */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="เคสส่งต่อทั้งหมด"
          value={`${total} เคส`}
          description="ในภาคเรียนปัจจุบัน"
          icon={Share2}
          status="normal"
          size="compact"
        />
        <MetricCard
          title="ส่งต่อภายในสถานศึกษา"
          value={`${internalCount} เคส`}
          description="เช่น งานแนะแนว ฝ่ายปกครอง"
          icon={Building2}
          status="info"
          size="compact"
        />
        <MetricCard
          title="ส่งต่อหน่วยงานภายนอก"
          value={`${externalCount} เคส`}
          description="เช่น โรงพยาบาล รพ.สต. พมจ."
          icon={Hospital}
          status="watch"
          size="compact"
        />
        <MetricCard
          title="ตอบรับ/ส่งต่อสำเร็จ"
          value={`${completedCount} เคส`}
          description={total > 0 ? `${Math.round((completedCount / total) * 100)}% ของเคสทั้งหมด` : "ยังไม่มีเคสส่งต่อ"}
          icon={CheckCircle2}
          status="normal"
          size="compact"
        />
      </div>

      {selectedStudentId ? (
        <div className="flex items-center justify-between rounded-xl border border-primary/20 bg-primary/5 p-3.5 text-xs text-foreground">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-primary">กรองเฉพาะเคสส่งต่อของนักเรียน:</span>
            <span>{referrals[0]?.student_name ? `${referrals[0].student_name} (${referrals[0].student_code ?? "รหัส"})` : selectedStudentId}</span>
          </div>
          <Link href="/referrals" className="font-medium text-primary hover:underline">
            ล้างตัวกรอง (แสดงทั้งหมด)
          </Link>
        </div>
      ) : null}

      {/* Filters and List */}
      <div className="rounded-2xl border border-border bg-card shadow-xs overflow-hidden">
        {/* Search & Tabs Header */}
        <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between border-b border-border">
          <div className="flex flex-wrap items-center gap-1.5">
            <Link
              href={`/referrals?type=all&status=${selectedStatus}${searchQuery ? `&q=${searchQuery}` : ""}`}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                selectedType === "all"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              ทั้งหมด
            </Link>
            <Link
              href={`/referrals?type=internal&status=${selectedStatus}${searchQuery ? `&q=${searchQuery}` : ""}`}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                selectedType === "internal"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              ส่งต่อภายใน ({internalCount})
            </Link>
            <Link
              href={`/referrals?type=external&status=${selectedStatus}${searchQuery ? `&q=${searchQuery}` : ""}`}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                selectedType === "external"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              ส่งต่อภายนอก ({externalCount})
            </Link>
          </div>

          <form method="GET" className="flex items-center gap-2 max-w-sm w-full sm:w-auto">
            <input type="hidden" name="type" value={selectedType} />
            <input type="hidden" name="status" value={selectedStatus} />
            <div className="relative w-full">
              <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
              <Input
                name="q"
                defaultValue={searchQuery}
                placeholder="ค้นหาชื่อ, รหัสนักเรียน, หน่วยงาน..."
                className="pl-9 h-9 text-xs"
              />
            </div>
          </form>
        </div>

        {/* Referrals List Table */}
        {referrals.length === 0 ? (
          <div className="p-12 text-center">
            <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
              <Share2 className="size-6" />
            </div>
            <h3 className="mt-3 text-base font-semibold text-foreground">ไม่พบรายการส่งต่อ</h3>
            <p className="mt-1 text-xs text-muted-foreground max-w-sm mx-auto">
              ยังไม่มีบันทึกการส่งต่อนักเรียนที่ตรงกับเงื่อนไขการค้นหา คุณสามารถกดปุ่มเพื่อสร้างเคสส่งต่อใหม่
            </p>
            <div className="mt-4">
              <Link
                href="/referrals/new"
                className={cn(buttonVariants({ variant: "outline" }))}
              >
                <Plus className="size-4 mr-1.5" />
                สร้างการส่งต่อใหม่
              </Link>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {referrals.map((item) => {
              const priority = getPriorityBadge(item.priority)
              const status = getStatusBadge(item.status)

              return (
                <div
                  key={item.id}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-muted/40 transition-colors"
                >
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                          item.referral_type === "external"
                            ? "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800"
                            : "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800"
                        }`}
                      >
                        {item.referral_type === "external" ? (
                          <>
                            <Hospital className="size-3" />
                            ส่งต่อภายนอก
                          </>
                        ) : (
                          <>
                            <Building2 className="size-3" />
                            ส่งต่อภายใน
                          </>
                        )}
                      </span>

                      <span className={`px-2 py-0.5 rounded-md text-xs font-medium border ${priority.color}`}>
                        ความสำคัญ: {priority.text}
                      </span>

                      <StatusBadge status={status.tone} label={status.text} />
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold text-foreground hover:text-primary transition-colors">
                        <Link href={`/referrals/${item.id}`} className="hover:underline">
                          {item.title}
                        </Link>
                      </h3>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                        {item.description}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground pt-1">
                      <span className="flex items-center gap-1 font-medium text-foreground">
                        <Users className="size-3 text-muted-foreground" />
                        {item.student_name}
                        {item.classroom_name ? ` (${item.classroom_name})` : ""}
                      </span>

                      <span className="flex items-center gap-1">
                        <Building2 className="size-3" />
                        ปลายทาง: <strong className="text-foreground">{item.target_agency}</strong>
                      </span>

                      <span className="flex items-center gap-1">
                        <Clock className="size-3" />
                        บันทึกเมื่อ: {formatThaiShortDate(item.created_at)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Link
                      href={`/referrals/${item.id}`}
                      className={cn(buttonVariants({ variant: "outline", size: "sm" }), "text-xs")}
                    >
                      ดูรายละเอียด / พิมพ์ใบส่งต่อ
                      <ArrowRight className="size-3.5 ml-1" />
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </PageShell>
  )
}
