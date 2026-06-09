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
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Search, BookOpen, Target, Calendar } from "lucide-react";
import Link from "next/link";

const idpList = [
  { id: "IDP-001", studentName: "สมชาย ใจดี", studentId: "STU-001", grade: "ม.3/1", status: "กำลังดำเนินการ", goal: "ปรับปรุงผลการเรียนวิชาคณิตศาสตร์", date: "2024-05-15" },
  { id: "IDP-002", studentName: "หญิงรัก เรียนเก่ง", studentId: "STU-002", grade: "ม.2/4", status: "เสร็จสิ้น", goal: "แก้ไขพฤติกรรมมาสาย", date: "2024-04-10" },
  { id: "IDP-003", studentName: "วินัย ขยัน", studentId: "STU-003", grade: "ม.1/2", status: "รอการประเมิน", goal: "พัฒนาทักษะทางสังคม", date: "2024-05-01" },
];

export default function DevelopmentPlansPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">แผนพัฒนารายบุคคล (IDP)</h2>
        <div className="flex items-center space-x-2">
          <Link href="/development-plans/create">
            <Button>
              <Plus className="mr-2 h-4 w-4" /> สร้างแผนพัฒนา
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">แผนทั้งหมด</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">124</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">กำลังดำเนินการ</CardTitle>
            <Target className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">85</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ประเมินแล้ว</CardTitle>
            <Calendar className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">39</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex flex-1 items-center space-x-2">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="ค้นหาชื่อ หรือ รหัสนักเรียน..."
              className="w-full pl-8"
            />
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>รายการแผนพัฒนารายบุคคล</CardTitle>
          <CardDescription>การติดตามและประเมินผลแผนพัฒนาของนักเรียนในความดูแล</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>รหัสแผน</TableHead>
                <TableHead>ชื่อ-สกุล</TableHead>
                <TableHead>เป้าหมายหลัก</TableHead>
                <TableHead>สถานะ</TableHead>
                <TableHead>วันที่สร้าง</TableHead>
                <TableHead className="text-right">การจัดการ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {idpList.map((plan) => (
                <TableRow key={plan.id}>
                  <TableCell className="font-medium">{plan.id}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span>{plan.studentName}</span>
                      <span className="text-xs text-muted-foreground">{plan.studentId} • {plan.grade}</span>
                    </div>
                  </TableCell>
                  <TableCell>{plan.goal}</TableCell>
                  <TableCell>
                    <Badge 
                      variant={plan.status === "เสร็จสิ้น" ? "default" : plan.status === "กำลังดำเนินการ" ? "secondary" : "outline"}
                      className={plan.status === "เสร็จสิ้น" ? "bg-green-500" : plan.status === "กำลังดำเนินการ" ? "bg-blue-100 text-blue-800" : ""}
                    >
                      {plan.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{plan.date}</TableCell>
                  <TableCell className="text-right">
                    <Link href={`/development-plans/${plan.id}`}>
                      <Button variant="outline" size="sm">
                        ดูรายละเอียด
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
