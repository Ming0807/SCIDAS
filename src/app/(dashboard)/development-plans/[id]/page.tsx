import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChevronLeft, Save, CheckCircle, Clock, Target } from "lucide-react";
import Link from "next/link";

export default function DevelopmentPlanDetailsPage({ params }: { params: { id: string } }) {
  // Mock data for display
  const plan = {
    id: params.id,
    studentName: "สมชาย ใจดี",
    studentId: "STU-001",
    grade: "ม.3/1",
    status: "กำลังดำเนินการ",
    createdAt: "15 พ.ค. 2024",
    goal: "เพิ่มผลการเรียนวิชาคณิตศาสตร์ให้ผ่านเกณฑ์",
    strategies: [
      "เรียนเสริมหลังเลิกเรียนสัปดาห์ละ 2 วัน",
      "ส่งงานที่ค้างให้ครบ",
      "ติดตามโดยครูที่ปรึกษาอย่างใกล้ชิด"
    ],
    evaluations: [
      { date: "30 พ.ค. 2024", note: "นักเรียนส่งงานมากขึ้น แต่ยังต้องปรับปรุงความเข้าใจ", evaluator: "ครูสมศรี" },
      { date: "15 มิ.ย. 2024", note: "สอบย่อยครั้งล่าสุดได้คะแนน 65/100 ดีขึ้น", evaluator: "ครูสมชาย" }
    ]
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center space-x-4">
        <Link href="/development-plans">
          <Button variant="ghost" size="icon">
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex flex-1 items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">แผนพัฒนา: {plan.id}</h2>
            <p className="text-muted-foreground">สร้างเมื่อ {plan.createdAt}</p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-sm py-1 px-3">
              {plan.status}
            </Badge>
            <Button>
              <Save className="mr-2 h-4 w-4" /> บันทึกการแก้ไข
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="md:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>ข้อมูลนักเรียน</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center space-y-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage src="/placeholder-avatar.jpg" alt={plan.studentName} />
                  <AvatarFallback className="text-2xl">{plan.studentName.substring(0, 2)}</AvatarFallback>
                </Avatar>
                <div className="text-center">
                  <h3 className="text-xl font-bold">{plan.studentName}</h3>
                  <p className="text-muted-foreground">รหัส: {plan.studentId}</p>
                  <p className="text-sm font-medium mt-1">ชั้น {plan.grade}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>ปัจจัยความเสี่ยง (EWS)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">การมาเรียน</span>
                  <Badge variant="destructive">เสี่ยงสูง</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">ผลการเรียน</span>
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">เฝ้าระวัง</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>แผนพัฒนาตนเองรายบุคคล (IDP)</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="details" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="details">รายละเอียดแผน</TabsTrigger>
                  <TabsTrigger value="evaluation">บันทึกการประเมินผล</TabsTrigger>
                </TabsList>
                
                <TabsContent value="details" className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold flex items-center">
                      <Target className="mr-2 h-4 w-4 text-blue-500" /> เป้าหมายการพัฒนา
                    </h4>
                    <p className="text-sm p-3 bg-muted rounded-md">{plan.goal}</p>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold flex items-center">
                      <CheckCircle className="mr-2 h-4 w-4 text-green-500" /> วิธีการ/กิจกรรมการพัฒนา
                    </h4>
                    <ul className="list-disc pl-5 space-y-1 text-sm">
                      {plan.strategies.map((strategy, idx) => (
                        <li key={idx}>{strategy}</li>
                      ))}
                    </ul>
                  </div>
                </TabsContent>

                <TabsContent value="evaluation" className="space-y-4 pt-4">
                  <div className="space-y-4">
                    {plan.evaluations.map((evalItem, idx) => (
                      <div key={idx} className="flex gap-4 p-3 border rounded-md">
                        <div className="mt-0.5">
                          <Clock className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium">{evalItem.date}</p>
                            <span className="text-xs text-muted-foreground">โดย {evalItem.evaluator}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">{evalItem.note}</p>
                        </div>
                      </div>
                    ))}

                    <div className="pt-4 border-t">
                      <h4 className="text-sm font-semibold mb-2">เพิ่มผลการประเมิน</h4>
                      <Textarea placeholder="บันทึกผลการพัฒนา..." className="min-h-[100px]" />
                      <Button className="mt-2" size="sm">บันทึก</Button>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
