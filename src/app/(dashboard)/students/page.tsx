import React from "react"
import { AlertTriangle, Heart, Plus, Smile, Users } from "lucide-react"

import { MetricCard, PageHeader, PageShell } from "@/components/dashboard"
import { ErrorState } from "@/components/feedback"
import { Button } from "@/components/ui/button"
import { getStudentWorklist } from "@/lib/server/student-care-read-models"

import { ClassSummary } from "./_components/class-summary"
import { MobileStudents } from "./_components/mobile-students"
import {
  createClassSummary,
  createStudentFilterOptions,
  createStudentSummary,
  filterStudentRows,
  pickFeaturedStudent,
  toStudentListItem,
  type StudentFilterState,
  type StudentListItem,
} from "./_components/student-data"
import { StudentFilters } from "./_components/student-filters"
import { StudentProfilePanel } from "./_components/student-profile-panel"
import { StudentTable } from "./_components/student-table"

const PAGE_SIZE = 20

type SearchParams = Record<string, string | string[] | undefined>

type StudentsPageProps = {
  searchParams?: Promise<SearchParams>
}

function getSearchParam(params: SearchParams, key: string) {
  const value = params[key]

  if (Array.isArray(value)) {
    return value[0] ?? ""
  }

  return value ?? ""
}

function normalizeFilters(params: SearchParams): StudentFilterState {
  return {
    q: getSearchParam(params, "q").trim(),
    grade: getSearchParam(params, "grade"),
    classroom: getSearchParam(params, "classroom"),
    status: getSearchParam(params, "status"),
  }
}

function getCurrentPage(params: SearchParams, totalPages: number) {
  const page = Number.parseInt(getSearchParam(params, "page"), 10)
  const safePage = Number.isFinite(page) && page > 0 ? page : 1

  return Math.min(safePage, Math.max(totalPages, 1))
}

function createPageHref(filters: StudentFilterState) {
  return (page: number) => {
    const params = new URLSearchParams()

    if (filters.q) params.set("q", filters.q)
    if (filters.grade) params.set("grade", filters.grade)
    if (filters.classroom) params.set("classroom", filters.classroom)
    if (filters.status) params.set("status", filters.status)
    if (page > 1) params.set("page", String(page))

    const query = params.toString()
    return query ? `/students?${query}` : "/students"
  }
}

export default async function StudentsPage({ searchParams }: StudentsPageProps) {
  const params = searchParams ? await searchParams : {}
  const filters = normalizeFilters(params)
  let loadError: string | null = null
  let studentRows: StudentListItem[] = []

  try {
    studentRows = (await getStudentWorklist({ limit: 500 })).map(toStudentListItem)
  } catch (error) {
    loadError = error instanceof Error ? error.message : "Unknown student data error"
  }

  const summary = createStudentSummary(studentRows)
  const classSummary = createClassSummary(studentRows)
  const filterOptions = createStudentFilterOptions(studentRows)
  const filteredStudents = filterStudentRows(studentRows, filters)
  const totalPages = Math.max(1, Math.ceil(filteredStudents.length / PAGE_SIZE))
  const currentPage = getCurrentPage(params, totalPages)
  const pageStart = (currentPage - 1) * PAGE_SIZE
  const pagedStudents = filteredStudents.slice(pageStart, pageStart + PAGE_SIZE)
  const selectedStudent = pickFeaturedStudent(filteredStudents)
  const getPageHref = createPageHref(filters)

  return (
    <PageShell size="wide" spacing="default">
      <PageHeader
        title="ข้อมูลนักเรียนและการจัดการ"
        description="จัดการข้อมูลนักเรียน บันทึก แก้ไข และติดตามข้อมูลรายบุคคล"
        actions={
          <Button>
            <Plus /> เพิ่มนักเรียน
          </Button>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="นักเรียนทั้งหมด"
          value={summary.total.toLocaleString("th-TH")}
          description="ข้อมูลนักเรียนในระบบ"
          icon={Users}
          status="primary"
          size="compact"
        />
        <MetricCard
          title="ปกติ"
          value={summary.normal.toLocaleString("th-TH")}
          description="ไม่พบสัญญาณเสี่ยง"
          icon={Smile}
          status="normal"
          size="compact"
        />
        <MetricCard
          title="ต้องติดตาม"
          value={summary.watch.toLocaleString("th-TH")}
          description={`เสี่ยงสูง ${summary.highRisk.toLocaleString("th-TH")} คน`}
          icon={AlertTriangle}
          status="watch"
          size="compact"
        />
        <MetricCard
          title="ติดตามพิเศษ"
          value={summary.specialCare.toLocaleString("th-TH")}
          description="มีเคส แผน ธง หรือผู้รับผิดชอบชัดเจน"
          icon={Heart}
          status="info"
          size="compact"
        />
      </div>

      {loadError ? (
        <ErrorState
          title="โหลดข้อมูลนักเรียนไม่ได้"
          description="ตรวจสอบว่า Supabase ใช้ migration 0008_ux_data_foundation.sql แล้ว และผู้ใช้มีสิทธิ์เข้าถึงโรงเรียนนี้"
          details={loadError}
        />
      ) : null}

      <StudentFilters
        filters={filters}
        options={filterOptions}
        visibleCount={filteredStudents.length}
        totalCount={summary.total}
      />

      <div className="grid min-h-0 gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
        <div className="flex min-w-0 flex-col gap-6">
          <div className="hidden min-h-[480px] md:block">
            <StudentTable
              students={pagedStudents}
              summary={summary}
              totalFiltered={filteredStudents.length}
              page={currentPage}
              totalPages={totalPages}
              pageSize={PAGE_SIZE}
              getPageHref={getPageHref}
            />
          </div>
          <div className="md:hidden">
            <MobileStudents
              students={pagedStudents}
              totalFiltered={filteredStudents.length}
              page={currentPage}
              totalPages={totalPages}
              pageSize={PAGE_SIZE}
              getPageHref={getPageHref}
            />
          </div>
          <ClassSummary
            items={classSummary}
            total={summary.total}
            activeGrade={filters.grade}
          />
        </div>

        <div className="min-w-0">
          <StudentProfilePanel student={selectedStudent} />
        </div>
      </div>
    </PageShell>
  )
}
