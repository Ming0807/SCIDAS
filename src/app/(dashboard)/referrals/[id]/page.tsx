import { notFound } from "next/navigation"
import { getReferralDetail } from "@/app/actions/referral.actions"
import { PageHeader, PageShell } from "@/components/dashboard"
import { ReferralDetailView } from "../_components/referral-detail-view"

type ReferralDetailPageProps = {
  params: Promise<{ id: string }>
}

export const metadata = {
  title: "รายละเอียดและแบบบันทึกการส่งต่อนักเรียน | SCIDAS",
  description: "รายละเอียดการส่งต่อนักเรียนและแบบบันทึกการส่งต่อ สพฐ.",
}

export default async function ReferralDetailPage({
  params,
}: ReferralDetailPageProps) {
  const { id } = await params
  const res = await getReferralDetail(id)

  if (!res.ok || !res.data) {
    notFound()
  }

  const referral = res.data

  return (
    <PageShell size="wide" spacing="default">
      <div className="print:hidden">
        <PageHeader
          title={referral.title}
          description={`เคสส่งต่อสำหรับ ${referral.student ? `${referral.student.first_name} ${referral.student.last_name}` : "นักเรียน"} · ปลายทาง: ${referral.target_agency}`}
        />
      </div>

      <ReferralDetailView referral={referral} />
    </PageShell>
  )
}
