import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, CalendarDays, CheckCircle2, ClipboardList, FileText, Plus, UserRound } from "lucide-react"

import { getDevelopmentActivities, getDevelopmentEvaluations, getDevelopmentGoals, getDevelopmentPlanById } from "@/app/actions/idp.actions"
import type { DevelopmentActivity, DevelopmentEvaluation, DevelopmentGoal } from "@/app/actions/idp.actions"
import { PageHeader } from "@/components/dashboard/page-header"
import { PageShell } from "@/components/dashboard/page-shell"
import { StatusBadge } from "@/components/dashboard/status-badge"
import { EmptyState } from "@/components/feedback/empty-state"
import { ErrorState } from "@/components/feedback/error-state"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getCurrentUserContext } from "@/lib/server/current-user"
import { getPlanStatusLabel, getPlanStatusTone } from "@/lib/server/idp-read-models"

import { ActivityForm } from "../_components/activity-form"
import { DeleteControl } from "../_components/delete-controls"
import { EvaluationForm } from "../_components/evaluation-form"
import { GoalForm } from "../_components/goal-form"
import { PlanDetailActions } from "../_components/plan-detail-actions"
import { canEditDevelopmentEvaluations, canEditDevelopmentPlans } from "../_lib/permissions"

interface PageProps { params: Promise<{ id: string }> }
type Person = { first_name: string | null; last_name: string | null; student_code?: string | null }
const firstOrSelf = <T,>(value: T | T[] | null | undefined) => Array.isArray(value) ? value[0] : value
const dateFormatter = new Intl.DateTimeFormat("th-TH", { day: "numeric", month: "short", year: "numeric" })

function formatDate(value: string | null | undefined) {
  if (!value) return "ไม่ระบุ"
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : dateFormatter.format(date)
}

function displayName(person: Person | null | undefined) {
  return `${person?.first_name ?? ""} ${person?.last_name ?? ""}`.trim() || "ไม่ระบุ"
}

function goalStatusLabel(status: DevelopmentGoal["status"]) {
  return { not_started: "ยังไม่เริ่ม", in_progress: "กำลังดำเนินการ", achieved: "บรรลุเป้าหมาย", not_achieved: "ยังไม่บรรลุ", cancelled: "ยกเลิก" }[status]
}

function goalStatusTone(status: DevelopmentGoal["status"]) {
  return status === "achieved" ? "success" : status === "in_progress" ? "info" : status === "cancelled" || status === "not_achieved" ? "danger" : "neutral"
}

function evaluatorName(evaluation: DevelopmentEvaluation) {
  const evaluator = (evaluation as DevelopmentEvaluation & { evaluator?: Person | Person[] | null }).evaluator
  return displayName(firstOrSelf(evaluator))
}

export default async function DevelopmentPlanDetailsPage({ params }: PageProps) {
  const { id } = await params
  const [plan, context] = await Promise.all([
    getDevelopmentPlanById(id),
    getCurrentUserContext(),
  ])
  if (!plan) notFound()

  let goals: DevelopmentGoal[] = []
  let evaluations: DevelopmentEvaluation[] = []
  let activitiesByGoal: Record<string, DevelopmentActivity[]> = {}
  try {
    const [goalRows, evaluationRows] = await Promise.all([getDevelopmentGoals(id), getDevelopmentEvaluations(id)])
    goals = goalRows
    evaluations = evaluationRows
    const activityRows = await Promise.all(goals.map(async (goal) => [goal.id, await getDevelopmentActivities(goal.id)] as const))
    activitiesByGoal = Object.fromEntries(activityRows)
  } catch {
    return <PageShell><ErrorState title="โหลดรายละเอียดรายการย่อยไม่สำเร็จ" description="ข้อมูลแผนยังเปิดดูได้ แต่ไม่สามารถโหลดเป้าหมาย กิจกรรม หรือการประเมินได้ในขณะนี้" /></PageShell>
  }

  const student = firstOrSelf(plan.student as Person | Person[] | null | undefined)
  const creator = firstOrSelf(plan.creator as Person | Person[] | null | undefined)
  const activities = Object.values(activitiesByGoal).flat()
  const totalProgress = Math.max(0, Math.min(100, plan.overall_progress ?? 0))
  const isFrozen = plan.status === "completed" || plan.status === "cancelled"
  const canMutatePlan = !isFrozen && canEditDevelopmentPlans(context.role)
  const canMutateEvaluations = !isFrozen && canEditDevelopmentEvaluations(context.role)

  return (
    <PageShell size="wide">
      <PageHeader
        breadcrumbs={<Link href="/development-plans" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft aria-hidden="true" className="size-4" />แผนพัฒนารายบุคคล</Link>}
        title={plan.title}
        description={plan.description ?? "ติดตามเป้าหมาย กิจกรรม และผลการประเมินของนักเรียนในแผนเดียว"}
        metadata={<StatusBadge status={getPlanStatusTone(plan.status)} label={getPlanStatusLabel(plan.status)} size="sm" />}
        actions={<PlanDetailActions planId={id} status={plan.status} canEdit={canMutatePlan} />}
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4" aria-label="ข้อมูลสรุปแผน">
        <Card size="sm"><CardContent className="flex items-start gap-3"><UserRound className="mt-0.5 size-4 text-primary" aria-hidden="true" /><div><p className="text-xs text-muted-foreground">นักเรียน</p><p className="mt-1 text-sm font-medium">{displayName(student)}</p><p className="text-xs text-muted-foreground">{student?.student_code ?? "ไม่ระบุรหัส"}</p></div></CardContent></Card>
        <Card size="sm"><CardContent className="flex items-start gap-3"><CalendarDays className="mt-0.5 size-4 text-primary" aria-hidden="true" /><div><p className="text-xs text-muted-foreground">ช่วงเวลา</p><p className="mt-1 text-sm font-medium">{formatDate(plan.start_date)} - {formatDate(plan.end_date)}</p><p className="text-xs text-muted-foreground">{plan.semester?.semester === "semester_1" ? "ภาคเรียนที่ 1" : plan.semester?.semester === "semester_2" ? "ภาคเรียนที่ 2" : "ไม่ระบุภาคเรียน"}</p></div></CardContent></Card>
        <Card size="sm"><CardContent className="flex items-start gap-3"><FileText className="mt-0.5 size-4 text-primary" aria-hidden="true" /><div><p className="text-xs text-muted-foreground">ผู้จัดทำ</p><p className="mt-1 text-sm font-medium">{displayName(creator)}</p><p className="text-xs text-muted-foreground">สร้างเมื่อ {formatDate(plan.created_at)}</p></div></CardContent></Card>
        <Card size="sm"><CardContent className="flex items-start gap-3"><CheckCircle2 className="mt-0.5 size-4 text-primary" aria-hidden="true" /><div className="min-w-0 flex-1"><div className="flex items-center justify-between gap-2"><p className="text-xs text-muted-foreground">ความก้าวหน้า</p><span className="text-sm font-semibold">{totalProgress}%</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-muted" role="progressbar" aria-valuenow={totalProgress} aria-valuemin={0} aria-valuemax={100} aria-label="ความก้าวหน้าโดยรวม"><div className="h-full rounded-full bg-primary transition-[width]" style={{ width: `${totalProgress}%` }} /></div></div></CardContent></Card>
      </section>

      <Tabs defaultValue="goals" className="w-full">
        <TabsList className="grid w-full grid-cols-3 sm:w-fit">
          <TabsTrigger value="goals">เป้าหมาย ({goals.length})</TabsTrigger>
          <TabsTrigger value="activities">กิจกรรม ({activities.length})</TabsTrigger>
          <TabsTrigger value="evaluation">การประเมิน ({evaluations.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="goals" className="mt-5 space-y-4">
          {canMutatePlan ? <Card><CardHeader><CardTitle className="flex items-center gap-2"><ClipboardList aria-hidden="true" className="size-5 text-primary" />เป้าหมายการพัฒนา</CardTitle><CardDescription>กำหนดผลลัพธ์ที่ต้องการเห็นและอัปเดตความก้าวหน้าเป็นระยะ</CardDescription></CardHeader><CardContent><GoalForm planId={id} /></CardContent></Card> : null}
          {goals.length === 0 ? <EmptyState icon={ClipboardList} title="ยังไม่มีเป้าหมาย" description={canMutatePlan ? "เพิ่มเป้าหมายแรกเพื่อให้ทีมเริ่มติดตามการพัฒนาได้" : isFrozen ? "แผนนี้ถูกล็อก จึงไม่สามารถเพิ่มเป้าหมายได้" : "คุณไม่มีสิทธิ์เพิ่มเป้าหมายในแผนนี้"} size="compact" /> : <div className="space-y-4">{goals.map((goal) => <Card key={goal.id}><CardHeader className="gap-3 border-b border-border"><div className="flex items-start justify-between gap-3"><div className="flex min-w-0 items-start gap-3"><span className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-sm font-semibold text-primary">{goal.goal_number}</span><div className="min-w-0"><CardTitle className="text-base">{goal.title}</CardTitle><CardDescription className="mt-1 whitespace-pre-wrap">{goal.description ?? "ยังไม่มีรายละเอียด"}</CardDescription></div></div><div className="flex shrink-0 items-center gap-2"><StatusBadge status={goalStatusTone(goal.status)} label={goalStatusLabel(goal.status)} size="sm" />{canMutatePlan ? <DeleteControl kind="goal" id={goal.id} /> : null}</div></div><div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted-foreground"><span>{goal.category ?? "ไม่ระบุหมวดหมู่"}</span><span>เป้าหมาย: {goal.target_value ?? "ไม่ระบุ"}</span><span>ครบกำหนด: {formatDate(goal.target_date)}</span></div></CardHeader><CardContent className="space-y-4"><div className="flex items-center gap-3"><span className="w-20 shrink-0 text-xs text-muted-foreground">ความก้าวหน้า</span><div className="h-2 flex-1 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${Math.max(0, Math.min(100, goal.progress ?? 0))}%` }} /></div><span className="w-10 text-right text-xs font-medium">{goal.progress ?? 0}%</span></div>{canMutatePlan ? <details className="group"><summary className="cursor-pointer text-sm font-medium text-primary outline-none focus-visible:underline">แก้ไขเป้าหมาย</summary><div className="mt-3"><GoalForm planId={id} goal={goal} /></div></details> : null}<div className="rounded-lg border border-border bg-muted/20 p-3"><div className="mb-3 flex items-center justify-between gap-2"><div><h4 className="text-sm font-semibold">กิจกรรมของเป้าหมายนี้</h4><p className="text-xs text-muted-foreground">{(activitiesByGoal[goal.id] ?? []).length} รายการ</p></div>{canMutatePlan ? <Plus aria-hidden="true" className="size-4 text-muted-foreground" /> : null}</div>{canMutatePlan ? <ActivityForm goalId={goal.id} /> : null}{(activitiesByGoal[goal.id] ?? []).length ? <div className="mt-3 space-y-2">{(activitiesByGoal[goal.id] ?? []).map((activity) => <div key={activity.id} className="flex flex-col gap-3 rounded-md border border-border bg-background p-3"><div className="flex items-start justify-between gap-3"><div className="flex min-w-0 gap-2"><span className="mt-0.5 text-muted-foreground" aria-hidden="true">{activity.is_completed ? "✓" : "○"}</span><div className="min-w-0"><p className="text-sm font-medium">{activity.title}</p><p className="mt-1 text-xs text-muted-foreground">{activity.description ?? "ไม่มีรายละเอียด"}</p><p className="mt-1 text-xs text-muted-foreground">{formatDate(activity.start_date)} - {formatDate(activity.end_date)} · {activity.responsible_person ?? "ไม่ระบุผู้รับผิดชอบ"}</p></div></div><div className="flex shrink-0 items-center gap-2"><Badge variant={activity.is_completed ? "default" : "outline"}>{activity.is_completed ? "เสร็จแล้ว" : "รอดำเนินการ"}</Badge>{canMutatePlan ? <DeleteControl kind="activity" id={activity.id} /> : null}</div></div>{canMutatePlan ? <details><summary className="cursor-pointer text-sm font-medium text-primary outline-none focus-visible:underline">แก้ไขกิจกรรม</summary><div className="mt-3"><ActivityForm goalId={goal.id} activity={activity} /></div></details> : null}</div>)}</div> : null}</div></CardContent></Card>)}</div>}
        </TabsContent>

        <TabsContent value="activities" className="mt-5 space-y-4">
          <Card><CardHeader><CardTitle>กิจกรรมทั้งหมด</CardTitle><CardDescription>รวมกิจกรรมจากทุกเป้าหมายในแผนนี้</CardDescription></CardHeader><CardContent>{activities.length === 0 ? <EmptyState title="ยังไม่มีกิจกรรม" description={canMutatePlan ? "เพิ่มกิจกรรมจากแต่ละเป้าหมายในแท็บเป้าหมาย" : isFrozen ? "แผนนี้ถูกล็อก จึงไม่สามารถเพิ่มกิจกรรมได้" : "คุณไม่มีสิทธิ์เพิ่มกิจกรรมในแผนนี้"} size="compact" /> : <div className="space-y-2">{goals.flatMap((goal) => (activitiesByGoal[goal.id] ?? []).map((activity) => <div key={activity.id} className="flex flex-col gap-3 rounded-lg border border-border p-3 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-sm font-medium">{activity.title}</p><p className="mt-1 text-xs text-muted-foreground">เป้าหมายที่ {goal.goal_number} · {formatDate(activity.start_date)} - {formatDate(activity.end_date)}</p></div><Badge variant={activity.is_completed ? "default" : "outline"}>{activity.is_completed ? "เสร็จแล้ว" : "รอดำเนินการ"}</Badge></div>))}</div>}</CardContent></Card>
        </TabsContent>

        <TabsContent value="evaluation" className="mt-5 space-y-4">
          {canMutateEvaluations ? <Card><CardHeader><CardTitle>บันทึกการประเมิน</CardTitle><CardDescription>สรุปผลที่เกิดขึ้นจริงและกำหนดทิศทางการดูแลรอบถัดไป</CardDescription></CardHeader><CardContent><EvaluationForm planId={id} /></CardContent></Card> : null}
          {evaluations.length === 0 ? <EmptyState icon={FileText} title="ยังไม่มีการประเมิน" description={canMutateEvaluations ? "เพิ่มการประเมินเมื่อมีข้อมูลผลการดำเนินงานเพียงพอ" : isFrozen ? "แผนนี้ถูกล็อก จึงไม่สามารถเพิ่มการประเมินได้" : "คุณไม่มีสิทธิ์เพิ่มการประเมินในแผนนี้"} size="compact" /> : <div className="space-y-3">{evaluations.map((evaluation) => <Card key={evaluation.id}><CardHeader className="gap-3 border-b border-border"><div className="flex items-start justify-between gap-3"><div><CardTitle className="text-base">รอบที่ {evaluation.evaluation_round} · {formatDate(evaluation.evaluation_date)}</CardTitle><CardDescription className="mt-1">ผู้ประเมิน: {evaluatorName(evaluation)}</CardDescription></div><div className="flex items-center gap-2"><Badge variant={evaluation.continue_plan ? "default" : "outline"}>{evaluation.continue_plan ? "ดำเนินแผนต่อ" : "ปิดแผน"}</Badge>{canMutateEvaluations ? <DeleteControl kind="evaluation" id={evaluation.id} /> : null}</div></div></CardHeader><CardContent className="space-y-4"><div><p className="text-xs font-medium text-muted-foreground">ผลการประเมินโดยรวม</p><p className="mt-1 whitespace-pre-wrap text-sm leading-6">{evaluation.overall_result}</p></div><div className="grid gap-4 text-sm sm:grid-cols-3"><div><p className="text-xs text-muted-foreground">จุดแข็ง</p><p className="mt-1 whitespace-pre-wrap">{evaluation.strengths ?? "ไม่ระบุ"}</p></div><div><p className="text-xs text-muted-foreground">สิ่งที่ควรพัฒนา</p><p className="mt-1 whitespace-pre-wrap">{evaluation.areas_for_improvement ?? "ไม่ระบุ"}</p></div><div><p className="text-xs text-muted-foreground">ข้อเสนอแนะ</p><p className="mt-1 whitespace-pre-wrap">{evaluation.recommendations ?? "ไม่ระบุ"}</p></div></div>{canMutateEvaluations ? <details><summary className="cursor-pointer text-sm font-medium text-primary outline-none focus-visible:underline">แก้ไขการประเมิน</summary><div className="mt-3"><EvaluationForm planId={id} evaluation={evaluation} /></div></details> : null}</CardContent></Card>)}</div>}
        </TabsContent>
      </Tabs>
    </PageShell>
  )
}
