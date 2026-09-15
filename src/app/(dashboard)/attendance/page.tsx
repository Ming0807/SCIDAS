import Link from "next/link"
import { PageHeader, PageShell, MetricCard, StatusBadge, StudentIdentity } from "@/components/dashboard"
import { EmptyState } from "@/components/feedback/empty-state"
import { ErrorState } from "@/components/feedback/error-state"
import {
  getAttendanceDashboard,
  getClassroomMonthlyAttendance,
  type MonthlyAttendanceSummary,
} from "@/lib/server/attendance-read-models"
import { getAttendanceForDate, getClassroomStudents } from "@/app/actions/attendance.actions"
import { AttendanceForm } from "./attendance-form"

type AttendancePageProps = {
  searchParams: Promise<{
    date?: string | string[]
    classroomId?: string | string[]
    month?: string | string[]
  }>
}
const isoDatePattern = /^\d{4}-\d{2}-\d{2}$/
const today = () => new Date().toISOString().slice(0, 10)

export default async function AttendancePage({ searchParams }: AttendancePageProps) {
  const params = await searchParams
  const requestedDate = Array.isArray(params.date) ? params.date[0] : params.date
  const date = requestedDate && isoDatePattern.test(requestedDate) ? requestedDate : today()

  const requestedClassroomId = Array.isArray(params.classroomId)
    ? params.classroomId[0]
    : params.classroomId
  const requestedMonth = Array.isArray(params.month) ? params.month[0] : params.month

  let classroomData: Awaited<ReturnType<typeof getClassroomStudents>>
  try {
    classroomData = await getClassroomStudents(requestedClassroomId)
  } catch {
    return (
      <PageShell size="wide">
        <ErrorState
          title="ไม่สามารถโหลดรายชื่อนักเรียนได้"
          description="กรุณาลองใหม่อีกครั้ง"
        />
      </PageShell>
    )
  }
  const { classroom, classrooms = [], students } = classroomData

  let dashboard: Awaited<ReturnType<typeof getAttendanceDashboard>>
  let initialRecords: Awaited<ReturnType<typeof getAttendanceForDate>> = []
  let monthlySummary: MonthlyAttendanceSummary | undefined

  try {
    const [dashRes, initRecsRes, monthlyRes] = await Promise.all([
      getAttendanceDashboard(date, classroom?.id),
      classroom ? getAttendanceForDate(classroom.id, date) : Promise.resolve([]),
      classroom
        ? getClassroomMonthlyAttendance(classroom.id, requestedMonth)
        : Promise.resolve(undefined),
    ])
    dashboard = dashRes
    initialRecords = initRecsRes
    monthlySummary = monthlyRes
  } catch {
    return (
      <PageShell size="wide">
        <ErrorState
          title="ไม่สามารถโหลดข้อมูลการมาเรียนได้"
          description="กรุณาลองใหม่อีกครั้ง"
        />
      </PageShell>
    )
  }

  const { summary, records } = dashboard
  const dateLabel = new Intl.DateTimeFormat("th-TH", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(`${date}T00:00:00`))

  return (
    <PageShell size="wide">
      <PageHeader
        title="การมาเรียน"
        description={`ข้อมูลวันที่ ${dateLabel} ${classroom ? `· ${classroom.name}` : ""}`}
        actions={null}
      />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        <MetricCard
          title="ทั้งหมด"
          value={summary.total.toLocaleString()}
          status="neutral"
          size="compact"
          statusLabel="คน"
        />
        <MetricCard
          title="มาเรียน"
          value={summary.present.toLocaleString()}
          status="success"
          size="compact"
          statusLabel={summary.presentRate != null ? `${summary.presentRate}%` : undefined}
        />
        <MetricCard
          title="ขาด"
          value={summary.absent.toLocaleString()}
          status="danger"
          size="compact"
        />
        <MetricCard
          title="มาสาย"
          value={summary.late.toLocaleString()}
          status="info"
          size="compact"
        />
        <MetricCard
          title="ลา / ป่วย"
          value={(summary.leave + summary.sick).toLocaleString()}
          status="warning"
          size="compact"
        />
      </div>
      {classroom ? (
        <AttendanceForm
          key={`${classroom.id}:${date}`}
          classroom={classroom}
          classrooms={classrooms}
          students={students}
          initialRecords={initialRecords}
          dateStr={date}
          monthlySummary={monthlySummary}
        />
      ) : (
        <div className="rounded-xl border border-border bg-card shadow-sm">
          <div className="border-b border-border p-5">
            <h2 className="font-semibold text-foreground">ภาพรวมการมาเรียนทั้งโรงเรียน</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              รายการบันทึกการมาเรียนประจำวันที่ {dateLabel}
            </p>
          </div>
          {records.length === 0 ? (
            <div className="p-8">
              <EmptyState
                title="ไม่มีข้อมูลการมาเรียนวันนี้"
                description="ยังไม่มีการบันทึกการมาเรียนสำหรับวันที่เลือก"
              />
            </div>
          ) : (
            <Overview records={records} />
          )}
        </div>
      )}
    </PageShell>
  )
}

function Overview({ records }: { records: Awaited<ReturnType<typeof getAttendanceDashboard>>["records"] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[680px] text-left text-sm">
        <thead className="border-b border-border bg-muted/40 text-xs text-muted-foreground">
          <tr>
            <th className="px-5 py-3 font-medium">นักเรียน</th>
            <th className="px-4 py-3 font-medium">ห้องเรียน</th>
            <th className="px-4 py-3 font-medium">สถานะ</th>
            <th className="px-4 py-3 font-medium">เวลาเข้า</th>
            <th className="px-5 py-3 font-medium">หมายเหตุ / ผู้บันทึก</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {records.map((record) => {
            const statusVariant =
              record.status === "present"
                ? "success"
                : record.status === "absent"
                  ? "danger"
                  : record.status === "late"
                    ? "warning"
                    : "info"

            return (
              <tr key={record.id} className="transition-colors hover:bg-muted/30">
                <td className="px-5 py-3">
                  <StudentIdentity
                    name={
                      <Link
                        href={`/students/${record.studentId}`}
                        className="font-medium text-foreground hover:underline"
                      >
                        {record.studentName}
                      </Link>
                    }
                    studentCode={record.studentCode ?? undefined}
                    size="sm"
                  />
                </td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                    {record.classroomName ?? "-"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={statusVariant} label={record.statusLabel} />
                </td>
                <td className="px-4 py-3 font-mono text-xs tabular-nums text-muted-foreground">
                  {record.checkInTime ?? "-"}
                </td>
                <td className="px-5 py-3 text-xs text-muted-foreground">
                  {record.remark ? (
                    <span>{record.remark}</span>
                  ) : record.recordedByName ? (
                    <span className="text-muted-foreground/80">โดย {record.recordedByName}</span>
                  ) : (
                    "-"
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
