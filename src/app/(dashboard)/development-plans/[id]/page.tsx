import { getDevelopmentPlanById, getDevelopmentGoals, getDevelopmentActivities } from "@/app/actions/idp.actions"
import type { DevelopmentActivity } from "@/app/actions/idp.actions"
import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ChevronLeft, Calendar, User, FileText, CheckCircle2, Circle, Clock } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { th } from "date-fns/locale"

interface PageProps {
  params: Promise<{ id: string }>
}

type PlanPerson = {
  first_name: string | null
  last_name: string | null
}

const firstOrSelf = <T,>(value: T | T[] | null | undefined) => Array.isArray(value) ? value[0] : value

export default async function DevelopmentPlanDetailsPage({ params }: PageProps) {
  const { id } = await params
  
  const plan = await getDevelopmentPlanById(id)
  
  if (!plan) {
    notFound()
  }

  const goals = await getDevelopmentGoals(id)
  
  // Fetch activities for each goal
  // Normally we might do a join, but let's fetch them in parallel for the goals
  const activitiesByGoal = await Promise.all(
    goals.map(async (goal) => {
      const activities = await getDevelopmentActivities(goal.id)
      return { goalId: goal.id, activities }
    })
  )
  
  const activitiesMap = activitiesByGoal.reduce((acc, curr) => {
    acc[curr.goalId] = curr.activities
    return acc
  }, {} as Record<string, DevelopmentActivity[]>)

  const student = firstOrSelf(plan.student as PlanPerson | PlanPerson[] | null | undefined)
  const creator = firstOrSelf(plan.creator as PlanPerson | PlanPerson[] | null | undefined)

  return (
    <div className="space-y-6">
      {/* Header with back button */}
      <div className="flex items-center gap-4">
        <Link 
          href="/development-plans" 
          className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white hover:bg-slate-100"
        >
          <ChevronLeft className="h-4 w-4" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-semibold tracking-tight text-slate-800">
              {plan.title}
            </h2>
            <Badge 
              variant="outline" 
              className={
                plan.status === 'completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                plan.status === 'active' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                plan.status === 'cancelled' ? 'bg-red-50 text-red-600 border-red-200' :
                'bg-slate-50 text-slate-600 border-slate-200'
              }
            >
              {plan.status === 'draft' && 'ฉบับร่าง'}
              {plan.status === 'active' && 'กำลังดำเนินการ'}
              {plan.status === 'completed' && 'เสร็จสิ้น'}
              {plan.status === 'cancelled' && 'ยกเลิก'}
            </Badge>
          </div>
        </div>
      </div>

      {/* Overview Card */}
      <Card className="rounded-xl shadow-sm border-slate-200">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            <div className="space-y-1">
              <p className="text-sm font-medium text-slate-500 flex items-center gap-2">
                <User className="h-4 w-4" /> นักเรียน
              </p>
              <p className="text-base font-medium text-slate-900">
                {student?.first_name} {student?.last_name}
              </p>
            </div>
            
            <div className="space-y-1">
              <p className="text-sm font-medium text-slate-500 flex items-center gap-2">
                <Calendar className="h-4 w-4" /> ระยะเวลา
              </p>
              <p className="text-base font-medium text-slate-900">
                {format(new Date(plan.start_date), 'd MMM yy', { locale: th })} - {format(new Date(plan.end_date), 'd MMM yy', { locale: th })}
              </p>
            </div>

            <div className="space-y-1">
              <p className="text-sm font-medium text-slate-500 flex items-center gap-2">
                <FileText className="h-4 w-4" /> ผู้จัดทำ
              </p>
              <p className="text-base font-medium text-slate-900">
                {creator?.first_name} {creator?.last_name}
              </p>
            </div>
            
            <div className="space-y-1">
              <p className="text-sm font-medium text-slate-500 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" /> ความก้าวหน้าโดยรวม
              </p>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-600 rounded-full" 
                    style={{ width: `${plan.overall_progress || 0}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-slate-700">
                  {plan.overall_progress || 0}%
                </span>
              </div>
            </div>
          </div>
          
          {plan.description && (
            <div className="mt-6 pt-6 border-t border-slate-100">
              <h4 className="text-sm font-medium text-slate-900 mb-2">รายละเอียด</h4>
              <p className="text-sm text-slate-600 whitespace-pre-wrap">{plan.description}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="goals" className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
          <TabsTrigger value="goals">เป้าหมาย</TabsTrigger>
          <TabsTrigger value="activities">กิจกรรม</TabsTrigger>
          <TabsTrigger value="evaluation">การประเมิน</TabsTrigger>
        </TabsList>
        
        {/* Goals Tab */}
        <TabsContent value="goals" className="mt-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-slate-800">เป้าหมายการพัฒนา</h3>
            <Button size="sm" disabled title="ฟีเจอร์นี้กำลังพัฒนา">เพิ่มเป้าหมาย</Button>
          </div>
          
          {goals.length > 0 ? (
            <div className="space-y-4">
              {goals.map((goal) => (
                <Card key={goal.id} className="rounded-xl shadow-sm border-slate-200">
                  <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/50">
                    <div className="flex justify-between items-start">
                      <div className="flex gap-3">
                        <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-medium text-sm">
                          {goal.goal_number}
                        </div>
                        <div>
                          <CardTitle className="text-base text-slate-800">{goal.title}</CardTitle>
                          <CardDescription className="mt-1">{goal.description}</CardDescription>
                        </div>
                      </div>
                      <Badge 
                        variant="outline" 
                        className={
                          goal.status === 'achieved' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                          goal.status === 'in_progress' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                          'bg-slate-50 text-slate-600 border-slate-200'
                        }
                      >
                        {goal.status === 'not_started' && 'รอดำเนินการ'}
                        {goal.status === 'in_progress' && 'กำลังดำเนินการ'}
                        {goal.status === 'achieved' && 'บรรลุเป้าหมาย'}
                        {goal.status === 'cancelled' && 'ยกเลิก'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-slate-500 mb-1">หมวดหมู่</p>
                        <p className="text-sm font-medium">{goal.category || '-'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 mb-1">สถานะปัจจุบัน</p>
                        <p className="text-sm font-medium">{goal.current_value || '-'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 mb-1">เป้าหมายที่คาดหวัง</p>
                        <p className="text-sm font-medium">{goal.target_value || '-'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 mb-1">กำหนดเสร็จสิ้น</p>
                        <p className="text-sm font-medium">
                          {goal.target_date ? format(new Date(goal.target_date), 'd MMM yy', { locale: th }) : '-'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <p className="text-xs font-medium text-slate-500 min-w-[60px]">ความก้าวหน้า</p>
                      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${goal.status === 'achieved' ? 'bg-emerald-500' : 'bg-blue-600'}`}
                          style={{ width: `${goal.progress || 0}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-slate-700 w-8 text-right">
                        {goal.progress || 0}%
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="rounded-xl border-dashed border-slate-300 bg-slate-50">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                  <CheckCircle2 className="h-6 w-6 text-slate-400" />
                </div>
                <h3 className="text-lg font-medium text-slate-800">ยังไม่มีเป้าหมาย</h3>
                <p className="text-sm text-slate-500 mt-1 mb-4">เพิ่มเป้าหมายเพื่อเริ่มติดตามการพัฒนา</p>
                <Button size="sm" disabled title="ฟีเจอร์นี้กำลังพัฒนา">เพิ่มเป้าหมายแรก</Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Activities Tab */}
        <TabsContent value="activities" className="mt-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-slate-800">กิจกรรมที่เกี่ยวข้อง</h3>
            <Button size="sm" variant="outline" disabled title="ฟีเจอร์นี้กำลังพัฒนา">เพิ่มกิจกรรม</Button>
          </div>
          
          <Card className="rounded-xl shadow-sm border-slate-200 overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow>
                  <TableHead className="w-[40px]"></TableHead>
                  <TableHead>กิจกรรม</TableHead>
                  <TableHead>เป้าหมายที่เกี่ยวข้อง</TableHead>
                  <TableHead>ระยะเวลา</TableHead>
                  <TableHead>ผู้รับผิดชอบ</TableHead>
                  <TableHead>สถานะ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {goals.flatMap(goal => activitiesMap[goal.id] || []).length > 0 ? (
                  goals.flatMap(goal => (
                    (activitiesMap[goal.id] || []).map((activity) => (
                      <TableRow key={activity.id}>
                        <TableCell>
                          {activity.is_completed ? (
                            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                          ) : (
                            <Circle className="h-5 w-5 text-slate-300" />
                          )}
                        </TableCell>
                        <TableCell className="font-medium text-slate-900">
                          {activity.title}
                          {activity.description && (
                            <p className="text-xs text-slate-500 font-normal mt-0.5">{activity.description}</p>
                          )}
                        </TableCell>
                        <TableCell className="text-slate-600">
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-xs font-medium">
                            เป้าหมายที่ {goal.goal_number}
                          </span>
                        </TableCell>
                        <TableCell className="text-slate-600">
                          <div className="flex items-center gap-1.5 text-xs">
                            <Clock className="h-3.5 w-3.5" />
                            {activity.start_date ? format(new Date(activity.start_date), 'd MMM', { locale: th }) : '?'} 
                            {' - '} 
                            {activity.end_date ? format(new Date(activity.end_date), 'd MMM', { locale: th }) : '?'}
                          </div>
                        </TableCell>
                        <TableCell className="text-slate-600">
                          {activity.responsible_person || '-'}
                        </TableCell>
                        <TableCell>
                          {activity.is_completed ? (
                            <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-200">เสร็จสิ้น</Badge>
                          ) : (
                            <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200">รอรับการประเมิน</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-slate-500">
                      ไม่พบกิจกรรมในแผนพัฒนานี้
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
        
        {/* Evaluation Tab */}
        <TabsContent value="evaluation" className="mt-6">
          <Card className="rounded-xl border-dashed border-slate-300 bg-slate-50">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                <FileText className="h-6 w-6 text-slate-400" />
              </div>
              <h3 className="text-lg font-medium text-slate-800">ยังไม่มีการประเมิน</h3>
              <p className="text-sm text-slate-500 mt-1 mb-4">การประเมินจะสามารถทำได้เมื่อดำเนินกิจกรรมแล้วเสร็จ</p>
              <Button size="sm" variant="outline" disabled title="ฟีเจอร์นี้กำลังพัฒนา">เพิ่มบันทึกการประเมิน</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
