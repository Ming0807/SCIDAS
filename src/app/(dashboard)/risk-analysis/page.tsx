"use client";

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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { AlertTriangle, TrendingUp, Users, Activity, Eye } from "lucide-react";
import Link from "next/link";

const riskData = [
  { name: "ปกติ (Normal)", value: 650, color: "#10b981" },
  { name: "เฝ้าระวัง (Watch)", value: 120, color: "#f59e0b" },
  { name: "เสี่ยง (Risk)", value: 45, color: "#ef4444" },
];

const trendData = [
  { month: "พ.ค.", risk: 50, watch: 110 },
  { month: "มิ.ย.", risk: 48, watch: 115 },
  { month: "ก.ค.", risk: 45, watch: 120 },
  { month: "ส.ค.", risk: 52, watch: 125 },
  { month: "ก.ย.", risk: 45, watch: 120 },
];

const highRiskStudents = [
  { id: "STU-001", name: "สมชาย ใจดี", grade: "ม.3/1", riskScore: 85, factors: ["การมาเรียน", "ผลการเรียน"] },
  { id: "STU-002", name: "หญิงรัก เรียนเก่ง", grade: "ม.2/4", riskScore: 78, factors: ["พฤติกรรม"] },
  { id: "STU-003", name: "วินัย ขยัน", grade: "ม.1/2", riskScore: 75, factors: ["การมาเรียน", "เศรษฐกิจ"] },
  { id: "STU-004", name: "กล้าหาญ ชาญชัย", grade: "ม.5/1", riskScore: 72, factors: ["ผลการเรียน"] },
];

export default function RiskAnalysisPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">ระบบเตือนภัยล่วงหน้า (Early Warning System)</h2>
        <div className="flex items-center space-x-2">
          <Button>คำนวณความเสี่ยงใหม่</Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">นักเรียนทั้งหมด</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">815</div>
            <p className="text-xs text-muted-foreground">คน ในระบบ</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">กลุ่มเสี่ยงสูง</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">45</div>
            <p className="text-xs text-muted-foreground">-10% จากเดือนที่แล้ว</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">กลุ่มเฝ้าระวัง</CardTitle>
            <Activity className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">120</div>
            <p className="text-xs text-muted-foreground">+5% จากเดือนที่แล้ว</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">คะแนนความเสี่ยงเฉลี่ย</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">14.2</div>
            <p className="text-xs text-muted-foreground">คะแนนเต็ม 100</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>แนวโน้มจำนวนนักเรียนกลุ่มเสี่ยง</CardTitle>
            <CardDescription>ข้อมูลย้อนหลัง 5 เดือน</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="risk" name="กลุ่มเสี่ยง" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="watch" name="กลุ่มเฝ้าระวัง" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>สัดส่วนความเสี่ยงทั้งหมด</CardTitle>
            <CardDescription>การจำแนกกลุ่มนักเรียนตามระดับความเสี่ยง</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={riskData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {riskData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>รายชื่อนักเรียนที่มีความเสี่ยงสูง</CardTitle>
          <CardDescription>นักเรียนที่ต้องการความช่วยเหลือเร่งด่วน</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>รหัสนักเรียน</TableHead>
                <TableHead>ชื่อ-สกุล</TableHead>
                <TableHead>ชั้นเรียน</TableHead>
                <TableHead>คะแนนความเสี่ยง</TableHead>
                <TableHead>ปัจจัยเสี่ยงหลัก</TableHead>
                <TableHead className="text-right">การจัดการ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {highRiskStudents.map((student) => (
                <TableRow key={student.id}>
                  <TableCell className="font-medium">{student.id}</TableCell>
                  <TableCell>{student.name}</TableCell>
                  <TableCell>{student.grade}</TableCell>
                  <TableCell>
                    <Badge variant="destructive">{student.riskScore}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1 flex-wrap">
                      {student.factors.map(factor => (
                        <Badge key={factor} variant="outline" className="text-xs">{factor}</Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Link href={`/development-plans/create?studentId=${student.id}`}>
                      <Button variant="ghost" size="icon">
                        <Eye className="h-4 w-4" />
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
