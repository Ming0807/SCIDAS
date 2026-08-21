import { notFound } from "next/navigation"

import { getDevelopmentPlanById } from "@/app/actions/idp.actions"
import { ErrorState } from "@/components/feedback/error-state"
import { PageHeader } from "@/components/dashboard/page-header"
import { PageShell } from "@/components/dashboard/page-shell"
import { getCurrentUserContext } from "@/lib/server/current-user"

import { PlanForm } from "../../_components/plan-form"
import { canEditDevelopmentPlans } from "../../_lib/permissions"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditDevelopmentPlanPage({ params }: PageProps) {
  const { id } = await params
  let plan: Awaited<ReturnType<typeof getDevelopmentPlanById>>
  let context: Awaited<ReturnType<typeof getCurrentUserContext>>
  try {
    ;[plan, context] = await Promise.all([
      getDevelopmentPlanById(id),
      getCurrentUserContext(),
    ])
  } catch {
    return <PageShell><ErrorState title="ไม่สามารถโหลดแผนพัฒนาได้" description="กรุณาลองใหม่อีกครั้ง" /></PageShell>
  }
  if (!plan) notFound()

  if (!canEditDevelopmentPlans(context.role)) {
    return <PageShell><ErrorState title="คุณไม่มีสิทธิ์แก้ไขแผนพัฒนา" description="เฉพาะผู้ดูแลระบบ ครูที่ปรึกษา และครูแนะแนวเท่านั้นที่แก้ไขแผนได้" /></PageShell>
  }

  if (plan.status === "completed" || plan.status === "cancelled") {
    return <PageShell><ErrorState title="แผนนี้ถูกล็อกการแก้ไข" description="แผนที่เสร็จสิ้นหรือยกเลิกแล้วเปิดดูได้อย่างเดียว เพื่อรักษาประวัติการดูแล" /></PageShell>
  }

  return (
    <PageShell>
      <PageHeader title="แก้ไขแผนพัฒนารายบุคคล" description="แก้ไขรายละเอียดของแผนเดิม โดยนักเรียนและภาคเรียนจะคงเดิมเพื่อรักษาประวัติการดูแล" />
      <PlanForm mode="edit" plan={plan} />
    </PageShell>
  )
}
