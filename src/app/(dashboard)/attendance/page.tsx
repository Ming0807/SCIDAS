import { PageHeader, PageShell, MetricCard } from "@/components/dashboard"
import { EmptyState } from "@/components/feedback/empty-state"
import { ErrorState } from "@/components/feedback/error-state"
import { getAttendanceDashboard, getAttendanceStatusLabel } from "@/lib/server/attendance-read-models"
import { getAttendanceForDate, getClassroomStudents } from "@/app/actions/attendance.actions"
import { AttendanceForm } from "./attendance-form"

type AttendancePageProps = { searchParams: Promise<{ date?: string | string[] }> }
const isoDatePattern = /^\d{4}-\d{2}-\d{2}$/
const today = () => new Date().toISOString().slice(0, 10)

export default async function AttendancePage({ searchParams }: AttendancePageProps) {
  const params = await searchParams
  const requestedDate = Array.isArray(params.date) ? params.date[0] : params.date
  const date = requestedDate && isoDatePattern.test(requestedDate) ? requestedDate : today()

  let classroomData: Awaited<ReturnType<typeof getClassroomStudents>>
  try { classroomData = await getClassroomStudents() } catch { return <PageShell size="wide"><ErrorState title="ไม่สามารถโหลดรายชื่อนักเรียนได้" description="กรุณาลองใหม่อีกครั้ง" /></PageShell> }
  const { classroom, students } = classroomData

  let dashboard: Awaited<ReturnType<typeof getAttendanceDashboard>>
  let initialRecords: Awaited<ReturnType<typeof getAttendanceForDate>> = []
  try {
    ;[dashboard, initialRecords] = await Promise.all([
      getAttendanceDashboard(date, classroom?.id),
      classroom ? getAttendanceForDate(classroom.id, date) : Promise.resolve([]),
    ])
  } catch { return <PageShell size="wide"><ErrorState title="ไม่สามารถโหลดข้อมูลการมาเรียนได้" description="กรุณาลองใหม่อีกครั้ง" /></PageShell> }

  const { summary, records } = dashboard
  const dateLabel = new Intl.DateTimeFormat("th-TH", { day: "numeric", month: "long", year: "numeric" }).format(new Date(`${date}T00:00:00`))
  return (
    <PageShell size="wide">
      <PageHeader title="การมาเรียน" description={`ข้อมูลวันที่ ${dateLabel}`} actions={null} />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        <MetricCard title="ทั้งหมด" value={summary.total.toLocaleString()} status="neutral" size="compact" statusLabel="คน" />
        <MetricCard title="มาเรียน" value={summary.present.toLocaleString()} status="success" size="compact" statusLabel={summary.presentRate != null ? `${summary.presentRate}%` : undefined} />
        <MetricCard title="ขาด" value={summary.absent.toLocaleString()} status="danger" size="compact" />
        <MetricCard title="มาสาย" value={summary.late.toLocaleString()} status="info" size="compact" />
        <MetricCard title="ลา / ป่วย" value={(summary.leave + summary.sick).toLocaleString()} status="warning" size="compact" />
      </div>
      {classroom ? <AttendanceForm key={`${classroom.id}:${date}`} classroom={classroom} students={students} initialRecords={initialRecords} dateStr={date} /> : <div className="rounded-xl border border-border bg-card shadow-sm"><div className="border-b border-border p-5"><h2 className="font-semibold">ภาพรวมการมาเรียน</h2><p className="mt-1 text-sm text-muted-foreground">ยังไม่มีห้องเรียนที่คุณสามารถบันทึกได้</p></div>{records.length === 0 ? <div className="p-8"><EmptyState title="ไม่มีข้อมูลการมาเรียนวันนี้" description="ยังไม่มีการบันทึกการมาเรียนสำหรับวันที่เลือก" /></div> : <Overview records={records} />}</div>}
    </PageShell>
  )
}

function Overview({ records }: { records: Awaited<ReturnType<typeof getAttendanceDashboard>>["records"] }) {
  return <div className="overflow-x-auto"><table className="w-full min-w-[620px] text-left text-sm"><thead className="border-b border-border bg-muted/30 text-xs text-muted-foreground"><tr><th className="px-4 py-3">นักเรียน</th><th className="px-4 py-3">ห้อง</th><th className="px-4 py-3">สถานะ</th><th className="px-4 py-3">เวลา</th><th className="px-4 py-3">หมายเหตุ</th></tr></thead><tbody>{records.map((record) => <tr key={record.id} className="border-b border-border last:border-0"><td className="px-4 py-3 font-medium">{record.studentName}</td><td className="px-4 py-3 text-muted-foreground">{record.classroomName ?? "-"}</td><td className="px-4 py-3">{getAttendanceStatusLabel(record.status)}</td><td className="px-4 py-3 text-muted-foreground">{record.checkInTime ?? "-"}</td><td className="px-4 py-3 text-muted-foreground">{record.remark ?? "-"}</td></tr>)}</tbody></table></div>
}
