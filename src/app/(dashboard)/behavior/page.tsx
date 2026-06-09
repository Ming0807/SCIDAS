import React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Activity, BarChart3, TrendingUp, AlertTriangle, Plus, CheckCircle2 } from "lucide-react"
import Link from "next/link"

export default function BehaviorOverviewPage() {
  const recentBehaviors = [
    { id: 1, student: "Alice Johnson", type: "Positive", description: "Helped a classmate with math", date: "Today", points: "+5" },
    { id: 2, student: "Bob Smith", type: "Negative", description: "Disruptive during assembly", date: "Yesterday", points: "-2" },
    { id: 3, student: "Charlie Davis", type: "Positive", description: "Excellent participation", date: "Yesterday", points: "+3" },
    { id: 4, student: "Diana Prince", type: "Positive", description: "Completed extra credit", date: "May 10", points: "+5" },
  ]

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">บันทึกพฤติกรรม</h1>
          <p className="text-slate-500 mt-1">ภาพรวมพฤติกรรมนักเรียน คะแนนบวกและลบ</p>
        </div>
        <Link href="/behavior/record">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            บันทึกพฤติกรรมใหม่
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">คะแนนบวกรวม</CardTitle>
            <Activity className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">+1,240</div>
            <p className="text-xs text-slate-500 mt-1 flex items-center">
              <TrendingUp className="h-3 w-3 mr-1 text-emerald-500" />
              <span className="text-emerald-500 font-medium">+12%</span> จากเดือนที่แล้ว
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">คะแนนลบรวม</CardTitle>
            <AlertTriangle className="h-4 w-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">42</div>
            <p className="text-xs text-slate-500 mt-1 flex items-center">
              <TrendingUp className="h-3 w-3 mr-1 text-rose-500" />
              <span className="text-rose-500 font-medium">+4%</span> จากเดือนที่แล้ว
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">สัดส่วนเชิงบวก</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">96.7%</div>
            <p className="text-xs text-slate-500 mt-1">
              จากพฤติกรรมทั้งหมด
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">เคสที่ต้องดูแล</CardTitle>
            <BarChart3 className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">12</div>
            <p className="text-xs text-slate-500 mt-1">
              ต้องการการดูแลทันที
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-7">
        <Card className="col-span-4 hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle>แนวโน้มพฤติกรรม</CardTitle>
            <CardDescription>พฤติกรรมบวกและลบในสัปดาห์นี้</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full rounded-md border border-slate-100 bg-slate-50/50 p-4 flex items-end justify-between gap-2">
              {[40, 70, 45, 90, 65, 85, 100].map((h, i) => (
                <div key={i} className="flex flex-col justify-end items-center gap-2 w-full h-full">
                  <div className="w-full flex justify-center gap-1 items-end h-[80%]">
                    <div className="bg-emerald-400 w-1/3 rounded-t-sm transition-all hover:bg-emerald-500" style={{ height: `${h}%` }} title={`Positive: ${h}`}></div>
                    <div className="bg-rose-400 w-1/3 rounded-t-sm transition-all hover:bg-rose-500" style={{ height: `${Math.max(10, 100 - h - 10)}%` }} title={`Negative: ${Math.max(10, 100 - h - 10)}`}></div>
                  </div>
                  <span className="text-xs text-slate-500 font-medium">{`Day ${i + 1}`}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3 hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle>ประวัติล่าสุด</CardTitle>
            <CardDescription>การบันทึกพฤติกรรมล่าสุดโดยคุณครู</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-4">
                <TabsTrigger value="all">ทั้งหมด</TabsTrigger>
                <TabsTrigger value="positive">เชิงบวก</TabsTrigger>
                <TabsTrigger value="negative">เชิงลบ</TabsTrigger>
              </TabsList>
              <TabsContent value="all" className="space-y-4">
                {recentBehaviors.map((behavior) => (
                  <div key={behavior.id} className="flex items-center justify-between border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-semibold text-slate-900">{behavior.student}</span>
                      <span className="text-xs text-slate-500">{behavior.description}</span>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Badge variant={behavior.type === 'Positive' ? 'default' : 'destructive'} className={behavior.type === 'Positive' ? 'bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20' : 'bg-rose-500/10 text-rose-700 hover:bg-rose-500/20'}>
                        {behavior.type === 'Positive' ? 'พฤติกรรมบวก' : 'พฤติกรรมลบ'}
                      </Badge>
                      <span className="text-xs font-medium text-slate-400">{behavior.date}</span>
                    </div>
                  </div>
                ))}
              </TabsContent>
              <TabsContent value="positive" className="text-sm text-slate-500 py-4 text-center">
                พฤติกรรมบวก
              </TabsContent>
              <TabsContent value="negative" className="text-sm text-slate-500 py-4 text-center">
                พฤติกรรมลบ
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
