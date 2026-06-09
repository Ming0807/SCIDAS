import React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Plus, FileText, UserCircle, Clock, AlertCircle } from "lucide-react"
import Link from "next/link"

export default function SupportCasesPage() {
  const supportCases = [
    { id: "CAS-001", student: "สมชาย ใจดี", type: "สอนเสริมวิชาการ", status: "Active", priority: "High", date: "12 พ.ค. 2026", assignedTo: "ครูสมชาย" },
    { id: "CAS-002", student: "สมศรี เรียนดี", type: "ให้คำปรึกษา", status: "Pending", priority: "Medium", date: "14 พ.ค. 2026", assignedTo: "รอผู้รับผิดชอบ" },
    { id: "CAS-003", student: "ชูใจ น่ารัก", type: "ปรับพฤติกรรม", status: "Resolved", priority: "Low", date: "28 เม.ย. 2026", assignedTo: "ครูสมศรี" },
    { id: "CAS-004", student: "มานะ ขยัน", type: "สนับสนุนครอบครัว", status: "Active", priority: "High", date: "15 พ.ค. 2026", assignedTo: "ผอ.โรงเรียน" },
    { id: "CAS-005", student: "ปิติ ดีใจ", type: "สอนเสริมวิชาการ", status: "Pending", priority: "Low", date: "16 พ.ค. 2026", assignedTo: "รอผู้รับผิดชอบ" },
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Active": return <Badge className="bg-blue-500/10 text-blue-700 hover:bg-blue-500/20">กำลังช่วยเหลือ</Badge>
      case "Pending": return <Badge className="bg-amber-500/10 text-amber-700 hover:bg-amber-500/20">รอดำเนินการ</Badge>
      case "Resolved": return <Badge className="bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20">แก้ไขแล้ว</Badge>
      default: return <Badge variant="outline">{status}</Badge>
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "High": return <AlertCircle className="h-4 w-4 text-rose-500" />
      case "Medium": return <Clock className="h-4 w-4 text-amber-500" />
      case "Low": return <UserCircle className="h-4 w-4 text-slate-400" />
      default: return null
    }
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">ระบบส่งต่อและช่วยเหลือ</h1>
          <p className="text-slate-500 mt-1">จัดการเคสส่งต่อนักเรียน, ให้คำปรึกษา และให้ความช่วยเหลือ</p>
        </div>
        <Link href="/support/new">
          <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700">
            <Plus className="h-4 w-4" />
            เปิดเคสใหม่
          </Button>
        </Link>
      </div>

      <Card className="hover:shadow-md transition-shadow border-slate-200">
        <CardHeader className="pb-4">
          <CardTitle>รายการเคสทั้งหมด</CardTitle>
          <CardDescription>ดูและจัดการเคสทั้งหมดที่กำลังช่วยเหลือ, รอดำเนินการ, หรือแก้ไขแล้ว</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
              <Input placeholder="ค้นหาชื่อนักเรียน หรือรหัสเคส..." className="pl-9" />
            </div>
            <div className="flex gap-2">
              <Select defaultValue="all">
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="สถานะ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">สถานะทั้งหมด</SelectItem>
                  <SelectItem value="active">กำลังช่วยเหลือ</SelectItem>
                  <SelectItem value="pending">รอดำเนินการ</SelectItem>
                  <SelectItem value="resolved">แก้ไขแล้ว</SelectItem>
                </SelectContent>
              </Select>
              <Select defaultValue="all">
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="ประเภท" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">ประเภททั้งหมด</SelectItem>
                  <SelectItem value="academic">วิชาการ</SelectItem>
                  <SelectItem value="behavioral">พฤติกรรม</SelectItem>
                  <SelectItem value="counseling">ให้คำปรึกษา</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-md border border-slate-200">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow>
                  <TableHead className="w-[100px]">รหัสเคส</TableHead>
                  <TableHead>นักเรียน</TableHead>
                  <TableHead>ประเภท</TableHead>
                  <TableHead>ความเร่งด่วน</TableHead>
                  <TableHead>สถานะ</TableHead>
                  <TableHead>วันที่</TableHead>
                  <TableHead>ผู้รับผิดชอบ</TableHead>
                  <TableHead className="text-right">จัดการ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {supportCases.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium text-slate-900">{c.id}</TableCell>
                    <TableCell className="font-semibold text-slate-700">{c.student}</TableCell>
                    <TableCell className="text-slate-600">{c.type}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getPriorityIcon(c.priority)}
                        <span className="text-sm text-slate-600">
                          {c.priority === "High" ? "สูง" : c.priority === "Medium" ? "ปานกลาง" : "ต่ำ"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(c.status)}</TableCell>
                    <TableCell className="text-slate-500 text-sm">{c.date}</TableCell>
                    <TableCell className="text-slate-600 text-sm">{c.assignedTo}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" className="h-8 gap-1 text-slate-500 hover:text-slate-900">
                        <FileText className="h-3 w-3" />
                        ดูรายละเอียด
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
