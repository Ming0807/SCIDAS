import React from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Send } from "lucide-react"
import Link from "next/link"

export default function NewSupportCasePage() {
  return (
    <div className="flex flex-col gap-6 p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/support">
          <Button variant="outline" size="icon" className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">เปิดเคสส่งต่อและช่วยเหลือ</h1>
          <p className="text-slate-500 mt-1">สร้างคำขอแจ้งเตือนส่งต่อและช่วยเหลือสำหรับนักเรียน</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle>ข้อมูลเคส</CardTitle>
              <CardDescription>ระบุรายละเอียดของนักเรียนและความช่วยเหลือที่ต้องการ</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">เลือกนักเรียน</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="ค้นหาและเลือกนักเรียน..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="STU-001">สมชาย ใจดี</SelectItem>
                    <SelectItem value="STU-002">สมศรี เรียนดี</SelectItem>
                    <SelectItem value="STU-003">ชูใจ น่ารัก</SelectItem>
                    <SelectItem value="STU-004">มานะ ขยัน</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">หมวดหมู่ความช่วยเหลือ</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="เลือกหมวดหมู่..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="academic">สอนเสริมวิชาการ</SelectItem>
                      <SelectItem value="behavioral">ปรับพฤติกรรม</SelectItem>
                      <SelectItem value="counseling">ให้คำปรึกษา</SelectItem>
                      <SelectItem value="family">สนับสนุนครอบครัว</SelectItem>
                      <SelectItem value="health">สุขภาพและอนามัย</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">ระดับความเร่งด่วน</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="เลือกระดับความเร่งด่วน..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">ต่ำ - เฝ้าระวัง</SelectItem>
                      <SelectItem value="medium">ปานกลาง - ต้องดำเนินการ</SelectItem>
                      <SelectItem value="high">สูง - ต้องการความช่วยเหลือด่วน</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">หัวข้อ / สรุปเคสโดยย่อ</label>
                <Input placeholder="เช่น มีปัญหาในการเรียนคณิตศาสตร์ขั้นสูง" className="w-full" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">รายละเอียดเพิ่มเติม</label>
                <Textarea 
                  placeholder="ให้ข้อมูลพื้นฐาน สาเหตุ สิ่งที่เคยลองแก้ไขมาแล้ว และบริบทอื่นๆ ที่เกี่ยวข้อง..." 
                  className="min-h-[150px] resize-y"
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t border-slate-100 pt-6">
              <Link href="/support">
                <Button variant="ghost">ยกเลิก</Button>
              </Link>
              <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700">
                <Send className="h-4 w-4" />
                เปิดเคส
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
              <CardTitle className="text-lg">การมอบหมาย</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">มอบหมายให้บุคลากร (ไม่บังคับ)</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="ปล่อยว่างไว้..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="smith">ครูสมชาย (ครูแนะแนว)</SelectItem>
                    <SelectItem value="lee">ครูสมศรี (ฝ่ายปกครอง)</SelectItem>
                    <SelectItem value="evans">ผอ.โรงเรียน</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-slate-500 mt-1">หากไม่ระบุ เคสจะถูกส่งเข้าคิวรวมส่วนกลางเพื่อรอจัดสรร</p>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
              <CardTitle className="text-lg">การแจ้งเตือน</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div className="flex items-start space-x-3">
                <input type="checkbox" id="notify-parents" className="mt-1 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600" />
                <label htmlFor="notify-parents" className="text-sm text-slate-700">
                  <span className="font-medium block">แจ้งผู้ปกครอง</span>
                  <span className="text-slate-500 text-xs">ส่งอีเมลอัตโนมัติแจ้งผู้ปกครองเกี่ยวกับการเปิดเคสนี้</span>
                </label>
              </div>
              <div className="flex items-start space-x-3">
                <input type="checkbox" id="notify-teachers" defaultChecked className="mt-1 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600" />
                <label htmlFor="notify-teachers" className="text-sm text-slate-700">
                  <span className="font-medium block">แจ้งครูประจำชั้น</span>
                  <span className="text-slate-500 text-xs">แจ้งเตือนให้ครูประจำชั้นรับทราบถึงเคสนี้</span>
                </label>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
