import Link from "next/link"
import {
  Activity,
  ArrowLeft,
  Download,
  Lock,
  RefreshCw,
  ShieldCheck,
} from "lucide-react"

import { getAuditLogsAction } from "@/app/actions/audit.actions"
import { MetricCard, PageHeader, PageShell } from "@/components/dashboard"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { AuditLogsViewer } from "./_components/audit-logs-viewer"

export const metadata = {
  title: "บันทึกความปลอดภัยและการตรวจสอบ (PDPA Audit Logs) | SCIDAS",
  description: "ระบบบันทึกประวัติการเข้าถึง แก้ไข และส่งออกข้อมูล ตามพระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล (PDPA)",
}

type SearchParams = Promise<{
  action?: string
  tableName?: string
  q?: string
}>

export default async function AuditLogsPage({
  searchParams,
}: {
  searchParams?: SearchParams
}) {
  const params = searchParams ? await searchParams : {}
  const res = await getAuditLogsAction({
    action: params.action,
    tableName: params.tableName,
    search: params.q,
  })

  if (!res.ok || !res.data) {
    return (
      <PageShell size="wide" spacing="default">
        <PageHeader
          title="บันทึกความปลอดภัยและการตรวจสอบ (PDPA Audit Logs)"
          description="การตรวจสอบสิทธิ์การเข้าถึงข้อมูลส่วนบุคคลตาม พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล"
          actions={
            <Link
              href="/settings"
              className={cn(buttonVariants({ variant: "outline" }))}
            >
              <ArrowLeft className="size-4 mr-1.5" />
              กลับหน้าตั้งค่า
            </Link>
          }
        />

        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-8 text-center dark:border-rose-900 dark:bg-rose-950/40">
          <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 dark:bg-rose-900 dark:text-rose-200">
            <Lock className="size-6" />
          </div>
          <h2 className="mt-3 text-base font-semibold text-rose-900 dark:text-rose-100">
            จำกัดการเข้าถึงเฉพาะผู้บริหารและผู้ดูแลระบบ
          </h2>
          <p className="mt-1 text-xs text-rose-700 dark:text-rose-300 max-w-md mx-auto">
            {res.message}
          </p>
          <div className="mt-4">
            <Link
              href="/"
              className={cn(buttonVariants({ variant: "default", size: "sm" }), "text-xs")}
            >
              กลับหน้าหลัก
            </Link>
          </div>
        </div>
      </PageShell>
    )
  }

  const { items, metrics, total } = res.data

  return (
    <PageShell size="wide" spacing="default">
      <PageHeader
        title="บันทึกความปลอดภัยและการตรวจสอบ (PDPA Audit Logs)"
        description="ประวัติการเข้าถึงข้อมูล บันทึกการแก้ไข/ลบ และการส่งออกรายงาน เพื่อความโปร่งใสและปฏิบัติตาม พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล"
        actions={
          <Link
            href="/settings"
            className={cn(buttonVariants({ variant: "outline" }))}
          >
            <ArrowLeft className="size-4 mr-1.5" />
            กลับหน้าตั้งค่า
          </Link>
        }
      />

      {/* Security KPI Metrics */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="บันทึกกิจกรรมทั้งหมด"
          value={`${total} รายการ`}
          description="บันทึกความปลอดภัยที่เก็บถาวร"
          icon={Activity}
          status="normal"
          size="compact"
        />
        <MetricCard
          title="การแก้ไขและลบข้อมูล"
          value={`${metrics.mutationEvents} ครั้ง`}
          description="INSERT, UPDATE, DELETE"
          icon={RefreshCw}
          status="watch"
          size="compact"
        />
        <MetricCard
          title="การส่งออกรายงาน"
          value={`${metrics.exportEvents} ครั้ง`}
          description="การดาวน์โหลดเอกสาร ปพ. / PDF / Excel"
          icon={Download}
          status="info"
          size="compact"
        />
        <MetricCard
          title="สถานะความคุ้มครอง PDPA"
          value="ผ่านเกณฑ์ 100%"
          description="Mask ข้อมูลอ่อนไหวอัตโนมัติ"
          icon={ShieldCheck}
          status="normal"
          size="compact"
        />
      </div>

      {/* Interactive Audit Logs Explorer */}
      <AuditLogsViewer logs={items} />
    </PageShell>
  )
}
