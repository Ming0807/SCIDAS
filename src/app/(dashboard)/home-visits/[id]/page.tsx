import Link from "next/link"
import { notFound } from "next/navigation"
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  Home,
  MapPin,
  Pencil,
  User,
} from "lucide-react"

import { PageShell, StatusBadge } from "@/components/dashboard"
import { ErrorState } from "@/components/feedback"
import { buttonVariants } from "@/components/ui/button"
import {
  getHomeVisitById,
  type HomeVisitRecord,
  type HomeVisitStatus,
} from "@/lib/server/home-visit-read-models"
import { formatThaiShortDate, type StudentRiskLevel } from "@/lib/student-care-formatters"
import { cn } from "@/lib/utils"

type PageProps = {
  params: Promise<{ id: string }>
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}

function getStatusLabel(status: HomeVisitStatus) {
  const labels: Record<HomeVisitStatus, string> = {
    completed: "เยี่ยมแล้ว",
    follow_up: "ต้องติดตาม",
    urgent: "เร่งดูแล",
  }

  return labels[status]
}

function getStatusTone(status: HomeVisitStatus): StudentRiskLevel {
  if (status === "urgent") return "high"
  if (status === "follow_up") return "watch"
  return "normal"
}

function getHousingLabel(condition: HomeVisitRecord["housingCondition"]) {
  const labels = {
    good: "ดี",
    moderate: "พอใช้",
    poor: "ควรดูแล",
    critical: "เร่งดูแล",
  }

  return condition ? labels[condition] : "ไม่ระบุ"
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
      <dd className="break-words text-sm font-medium text-foreground">{value}</dd>
    </div>
  )
}

function TextSection({ title, value }: { title: string; value: string | null }) {
  if (!value) return null

  return (
    <section className="border-t border-border pt-5">
      <h2 className="text-sm font-semibold text-foreground">{title}</h2>
      <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">{value}</p>
    </section>
  )
}

export default async function HomeVisitDetailPage({ params, searchParams }: PageProps) {
  const { id } = await params
  let record: HomeVisitRecord | null

  try {
    record = await getHomeVisitById(id)
  } catch {
    return (
      <PageShell>
        <ErrorState
          title="ไม่สามารถโหลดข้อมูลเยี่ยมบ้านได้"
          description="กรุณาลองใหม่อีกครั้ง หรือตรวจสอบสิทธิ์การเข้าถึง"
        />
      </PageShell>
    )
  }

  if (!record) notFound()

  const query = searchParams ? await searchParams : {}
  const updated = query.updated === "1" || (Array.isArray(query.updated) && query.updated.includes("1"))

  return (
    <PageShell size="wide" spacing="default">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/home-visits"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> กลับไปบันทึกเยี่ยมบ้าน
        </Link>
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/students/${record.studentId}`}
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          >
            <User /> ดูข้อมูลนักเรียน
          </Link>
          {record.canEdit ? (
            <Link
              href={`/home-visits/${record.id}/edit`}
              className={cn(buttonVariants({ size: "sm" }))}
            >
              <Pencil /> แก้ไขบันทึก
            </Link>
          ) : null}
        </div>
      </div>

      {updated ? (
        <div
          role="status"
          aria-live="polite"
          className="flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900"
        >
          <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
          <span>บันทึกการแก้ไขข้อมูลเยี่ยมบ้านเรียบร้อยแล้ว</span>
        </div>
      ) : null}

      <header className="flex flex-col gap-3 border-b border-border pb-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">รายละเอียดการเยี่ยมบ้าน</p>
          <h1 className="mt-1 break-words text-2xl font-semibold tracking-tight text-foreground">
            {record.studentName}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">รหัสนักเรียน {record.studentCode}</p>
        </div>
        <StatusBadge
          status={getStatusTone(record.status)}
          label={getStatusLabel(record.status)}
          size="default"
        />
      </header>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(300px,0.75fr)]">
        <section className="space-y-5 rounded-xl border border-border bg-card p-4 shadow-sm sm:p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <DetailItem
              label="วันที่เยี่ยม"
              value={formatThaiShortDate(record.visitDate)}
            />
            <DetailItem
              label="เวลา"
              value={record.visitTime ? record.visitTime.slice(0, 5) : "ไม่ระบุ"}
            />
            <DetailItem label="ผู้บันทึก" value={record.visitorName} />
            <DetailItem label="สภาพบ้าน" value={getHousingLabel(record.housingCondition)} />
            <DetailItem
              label="ปัญหาครอบครัว"
              value={record.hasFamilyProblem ? "มีประเด็น" : "ไม่พบประเด็น"}
            />
            <DetailItem
              label="การเดินทาง"
              value={record.travelDifficulty ? "ลำบาก" : "ปกติ"}
            />
          </div>

          <div className="flex items-start gap-2 border-t border-border pt-5 text-sm">
            <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
            <div>
              <p className="text-xs font-medium text-muted-foreground">ที่อยู่ที่เยี่ยม</p>
              <p className="mt-1 whitespace-pre-wrap text-foreground">{record.address ?? "ไม่ระบุที่อยู่"}</p>
            </div>
          </div>

          <div className="flex items-start gap-2 border-t border-border pt-5 text-sm">
            <Calendar className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
            <div>
              <p className="text-xs font-medium text-muted-foreground">การติดตาม</p>
              <p className="mt-1 text-foreground">
                {record.followUpNeeded ? "ต้องติดตามต่อเนื่อง" : "ยังไม่ต้องติดตามเพิ่มเติม"}
              </p>
            </div>
          </div>

          <TextSection title="ผลประเมินโดยรวม" value={record.overallAssessment} />
          <TextSection title="รายละเอียดปัญหาครอบครัว" value={record.familyProblemDetail} />
          <TextSection title="ข้อเสนอแนะ" value={record.suggestions} />
          <TextSection title="รายละเอียดการติดตาม" value={record.followUpDetail} />
        </section>

        <aside className="space-y-5">
          <section className="rounded-xl border border-border bg-card p-4 shadow-sm sm:p-6">
            <div className="flex items-center gap-2">
              <Home className="size-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold text-foreground">หลักฐานการเยี่ยมบ้าน</h2>
            </div>
            {record.images.length > 0 ? (
              <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                {record.images.map((image) => (
                  <figure key={image.id} className="overflow-hidden rounded-lg border border-border bg-muted">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={image.imageUrl}
                      alt={image.caption || `ภาพหลักฐานของ ${record.studentName}`}
                      className="aspect-[4/3] w-full object-cover"
                    />
                    {image.caption ? (
                      <figcaption className="px-3 py-2 text-xs text-muted-foreground">
                        {image.caption}
                      </figcaption>
                    ) : null}
                  </figure>
                ))}
              </div>
            ) : (
              <div className="mt-4 rounded-lg border border-dashed border-border p-5 text-sm text-muted-foreground">
                ยังไม่มีหลักฐานแนบในรายการนี้
              </div>
            )}
          </section>

          <section className="rounded-xl border border-border bg-card p-4 shadow-sm sm:p-6">
            <div className="flex items-center gap-2">
              <Clock className="size-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold text-foreground">ข้อมูลระบบ</h2>
            </div>
            <dl className="mt-4 space-y-3">
              <DetailItem label="บันทึกเมื่อ" value={new Date(record.createdAt).toLocaleString("th-TH")} />
              <DetailItem label="สถานะการติดตาม" value={record.followUpNeeded ? "ต้องติดตาม" : "ปิดการติดตาม"} />
            </dl>
          </section>
        </aside>
      </div>
    </PageShell>
  )
}
