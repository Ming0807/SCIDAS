import Form from "next/form"
import Link from "next/link"
import {
  AlertTriangle,
  Calendar,
  Clock,
  Home,
  MapPin,
  Plus,
  Route,
  Search,
} from "lucide-react"

import { MetricCard, PageHeader, PageShell, StatusBadge, StudentIdentity } from "@/components/dashboard"
import { FilterBar } from "@/components/data"
import { EmptyState, ErrorState } from "@/components/feedback"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  formatThaiShortDate,
  type StudentRiskLevel,
} from "@/lib/student-care-formatters"
import {
  getHomeVisitDashboard,
  type HomeVisitRecord,
  type HomeVisitSummary,
  type HomeVisitStatus,
} from "@/lib/server/home-visit-read-models"
import { cn } from "@/lib/utils"

type SearchParams = Record<string, string | string[] | undefined>

type HomeVisitsPageProps = {
  searchParams?: Promise<SearchParams>
}

type VisitFilters = {
  q: string
  status: string
}

const emptySummary: HomeVisitSummary = {
  total: 0,
  followUpNeeded: 0,
  urgent: 0,
  familyProblems: 0,
  travelDifficulty: 0,
  latestVisitDate: null,
}

function getSearchParam(params: SearchParams, key: string) {
  const value = params[key]

  if (Array.isArray(value)) {
    return value[0] ?? ""
  }

  return value ?? ""
}

function normalizeFilters(params: SearchParams): VisitFilters {
  return {
    q: getSearchParam(params, "q").trim(),
    status: getSearchParam(params, "status"),
  }
}

function getVisitStatusLabel(status: HomeVisitStatus) {
  const labels: Record<HomeVisitStatus, string> = {
    completed: "เยี่ยมแล้ว",
    follow_up: "ต้องติดตาม",
    urgent: "เร่งดูแล",
  }

  return labels[status]
}

function getVisitStatusTone(status: HomeVisitStatus): StudentRiskLevel {
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

  return condition ? labels[condition] : "-"
}

function filterVisits(records: HomeVisitRecord[], filters: VisitFilters) {
  const query = filters.q.trim().toLowerCase()

  return records.filter((record) => {
    const matchesQuery =
      !query ||
      record.studentName.toLowerCase().includes(query) ||
      record.studentCode.toLowerCase().includes(query) ||
      record.visitorName.toLowerCase().includes(query) ||
      (record.address?.toLowerCase().includes(query) ?? false)
    const matchesStatus = !filters.status || record.status === filters.status

    return matchesQuery && matchesStatus
  })
}

function HomeVisitFilters({
  filters,
  visibleCount,
  totalCount,
}: {
  filters: VisitFilters
  visibleCount: number
  totalCount: number
}) {
  return (
    <Form action="/home-visits">
      <FilterBar
        title="ค้นหาและกรองบันทึก"
        summary={`แสดง ${visibleCount.toLocaleString("th-TH")} จาก ${totalCount.toLocaleString("th-TH")} รายการ`}
        search={
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              name="q"
              defaultValue={filters.q}
              placeholder="ค้นหานักเรียน ผู้เยี่ยม หรือที่อยู่..."
              className="h-9 w-full rounded-lg border border-input bg-background pl-9 pr-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-3 focus:ring-ring/50"
            />
          </div>
        }
        filters={
          <>
            <label className="min-w-36 text-sm">
              <span className="sr-only">สถานะ</span>
              <select
                name="status"
                defaultValue={filters.status}
                className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground outline-none transition-colors focus:border-ring focus:ring-3 focus:ring-ring/50"
              >
                <option value="">สถานะทั้งหมด</option>
                <option value="urgent">เร่งดูแล</option>
                <option value="follow_up">ต้องติดตาม</option>
                <option value="completed">เยี่ยมแล้ว</option>
              </select>
            </label>
            <Button type="submit" variant="secondary">
              <Search /> ค้นหา
            </Button>
          </>
        }
        clearAction={
          filters.q || filters.status ? (
            <Link href="/home-visits" className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}>
              ล้างตัวกรอง
            </Link>
          ) : null
        }
      />
    </Form>
  )
}

function HomeVisitCard({ visit }: { visit: HomeVisitRecord }) {
  const statusTone = getVisitStatusTone(visit.status)

  return (
    <article className="overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-sm">
      <div className="relative aspect-[16/9] bg-muted">
        {visit.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={visit.imageUrl}
            alt={`ภาพเยี่ยมบ้าน ${visit.studentName}`}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
            <Home aria-hidden="true" className="size-8" />
            <span className="text-sm">ไม่มีภาพแนบ</span>
          </div>
        )}
        <div className="absolute right-3 top-3">
          <StatusBadge
            status={statusTone}
            label={getVisitStatusLabel(visit.status)}
            size="sm"
          />
        </div>
      </div>

      <div className="space-y-4 p-4">
        <StudentIdentity
          avatarUrl={visit.studentPhotoUrl ?? ""}
          name={visit.studentName}
          studentCode={visit.studentCode}
          description={`ผู้เยี่ยม ${visit.visitorName}`}
          size="sm"
        />

        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar aria-hidden="true" className="size-4" />
            <span>{formatThaiShortDate(visit.visitDate)}</span>
            {visit.visitTime ? (
              <>
                <Clock aria-hidden="true" className="ml-2 size-4" />
                <span>{visit.visitTime}</span>
              </>
            ) : null}
          </div>
          <div className="flex items-start gap-2">
            <MapPin aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
            <span className="line-clamp-2">{visit.address ?? "ไม่ระบุที่อยู่"}</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 rounded-lg border border-border bg-muted/30 p-3 text-xs">
          <div>
            <p className="text-muted-foreground">สภาพบ้าน</p>
            <p className="mt-1 font-medium text-foreground">
              {getHousingLabel(visit.housingCondition)}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">ครอบครัว</p>
            <p className="mt-1 font-medium text-foreground">
              {visit.hasFamilyProblem ? "มีประเด็น" : "ปกติ"}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">เดินทาง</p>
            <p className="mt-1 font-medium text-foreground">
              {visit.travelDifficulty ? "ลำบาก" : "ปกติ"}
            </p>
          </div>
        </div>

        {visit.overallAssessment ? (
          <p className="line-clamp-3 text-sm leading-6 text-muted-foreground">
            {visit.overallAssessment}
          </p>
        ) : null}

        <div className="flex items-center justify-between gap-2 border-t border-border pt-3">
          <Link
            href={`/students/${visit.studentId}`}
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          >
            ดูนักเรียน
          </Link>
          {visit.followUpNeeded ? (
            <StatusBadge status="watch" label="มีงานติดตาม" size="sm" />
          ) : null}
        </div>
      </div>
    </article>
  )
}

export default async function HomeVisitsPage({ searchParams }: HomeVisitsPageProps) {
  const params = searchParams ? await searchParams : {}
  const filters = normalizeFilters(params)
  let records: HomeVisitRecord[] = []
  let summary = emptySummary
  let loadError: string | null = null

  try {
    const dashboard = await getHomeVisitDashboard()
    records = dashboard.records
    summary = dashboard.summary
  } catch (error) {
    loadError = error instanceof Error ? error.message : "Unknown home visit data error"
  }

  const filteredVisits = filterVisits(records, filters)

  return (
    <PageShell size="wide" spacing="default">
      <PageHeader
        title="บันทึกการเยี่ยมบ้าน"
        description="ติดตามสภาพแวดล้อม ครอบครัว และประเด็นที่ต้องดูแลต่อเนื่อง"
        actions={
          <Link href="/home-visits/new" className={cn(buttonVariants())}>
            <Plus /> เพิ่มบันทึกเยี่ยมบ้าน
          </Link>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="เยี่ยมบ้านทั้งหมด"
          value={summary.total.toLocaleString("th-TH")}
          description={`ล่าสุด ${formatThaiShortDate(summary.latestVisitDate)}`}
          icon={Home}
          status="primary"
          size="compact"
        />
        <MetricCard
          title="ต้องติดตาม"
          value={summary.followUpNeeded.toLocaleString("th-TH")}
          description="มีรายละเอียด follow-up"
          icon={Calendar}
          status="watch"
          size="compact"
        />
        <MetricCard
          title="เร่งดูแล"
          value={summary.urgent.toLocaleString("th-TH")}
          description={`ครอบครัว ${summary.familyProblems.toLocaleString("th-TH")} ราย`}
          icon={AlertTriangle}
          status="high-risk"
          size="compact"
        />
        <MetricCard
          title="เดินทางลำบาก"
          value={summary.travelDifficulty.toLocaleString("th-TH")}
          description="อาจต้องประสานการช่วยเหลือ"
          icon={Route}
          status="info"
          size="compact"
        />
      </div>

      {loadError ? (
        <ErrorState
          title="โหลดข้อมูลเยี่ยมบ้านไม่ได้"
          description="ตรวจสอบสิทธิ์การเข้าถึงและตาราง home_visits ใน Supabase"
          details={loadError}
        />
      ) : null}

      <HomeVisitFilters
        filters={filters}
        visibleCount={filteredVisits.length}
        totalCount={records.length}
      />

      {filteredVisits.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-3">
          {filteredVisits.map((visit) => (
            <HomeVisitCard key={visit.id} visit={visit} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="ไม่พบบันทึกเยี่ยมบ้าน"
          description="ลองล้างตัวกรอง หรือเพิ่มบันทึกเยี่ยมบ้านรายการแรกเพื่อเริ่มติดตามข้อมูลครอบครัว"
          action={
            <Link href="/home-visits/new" className={cn(buttonVariants())}>
              <Plus /> เพิ่มบันทึกเยี่ยมบ้าน
            </Link>
          }
        />
      )}
    </PageShell>
  )
}
