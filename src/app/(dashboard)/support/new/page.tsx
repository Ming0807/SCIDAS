import React from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Send } from "lucide-react"
import Link from "next/link"
import { getStudents } from "@/app/actions/student.actions"
import { getProfiles, createSupportRecordFormAction } from "@/app/actions/support.actions"

export default async function NewSupportCasePage() {
  const students = await getStudents()
  const profiles = await getProfiles()

  return (
    <div className="flex flex-col gap-6 p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/support">
          <Button variant="outline" size="icon" className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">เปิดเคสส่งต่อและช่วยเหลือ</h1>
          <p className="text-slate-500 mt-1">สร้างคำขอแจ้งเตือนส่งต่อและช่วยเหลือสำหรับนักเรียน</p>
        </div>
      </div>

      <form action={createSupportRecordFormAction}>
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
                  <Select name="student_id" required>
                    <SelectTrigger>
                      <SelectValue placeholder="ค้นหาและเลือกนักเรียน..." />
                    </SelectTrigger>
                    <SelectContent>
                      {students.map((student) => (
                        <SelectItem key={student.id} value={student.id}>
                          {student.first_name} {student.last_name} ({student.student_code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">หมวดหมู่ความช่วยเหลือ</label>
                    <Select name="support_type" required>
                      <SelectTrigger>
                        <SelectValue placeholder="เลือกหมวดหมู่..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="academic">ด้านวิชาการ</SelectItem>
                        <SelectItem value="behavioral">ด้านพฤติกรรม</SelectItem>
                        <SelectItem value="emotional">ด้านจิตใจ/อารมณ์</SelectItem>
                        <SelectItem value="financial">ด้านเศรษฐกิจ</SelectItem>
                        <SelectItem value="health">ด้านสุขภาพ</SelectItem>
                        <SelectItem value="family">ด้านครอบครัว</SelectItem>
                        <SelectItem value="social">ด้านสังคม</SelectItem>
                        <SelectItem value="other">อื่นๆ</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">ระดับความเร่งด่วน</label>
                    <Select name="priority" required>
                      <SelectTrigger>
                        <SelectValue placeholder="เลือกระดับความเร่งด่วน..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">ต่ำ - เฝ้าระวัง</SelectItem>
                        <SelectItem value="medium">ปานกลาง - ต้องดำเนินการ</SelectItem>
                        <SelectItem value="high">สูง - ต้องการความช่วยเหลือด่วน</SelectItem>
                        <SelectItem value="critical">วิกฤต - ต้องดำเนินการทันที</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">หัวข้อ / สรุปเคสโดยย่อ</label>
                  <Input name="title" placeholder="เช่น มีปัญหาในการเรียนคณิตศาสตร์ขั้นสูง" className="w-full" required />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">รายละเอียดเพิ่มเติม</label>
                  <Textarea 
                    name="description"
                    placeholder="ให้ข้อมูลพื้นฐาน สาเหตุ สิ่งที่เคยลองแก้ไขมาแล้ว และบริบทอื่นๆ ที่เกี่ยวข้อง..." 
                    className="min-h-[150px] resize-y"
                    required
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-between border-t border-slate-100 pt-6">
                <Link href="/support">
                  <Button type="button" variant="ghost">ยกเลิก</Button>
                </Link>
                <Button type="submit" className="gap-2 bg-indigo-600 hover:bg-indigo-700">
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
                  <Select name="assigned_to">
                    <SelectTrigger>
                      <SelectValue placeholder="ปล่อยว่างไว้ (มอบหมายตนเอง)..." />
                    </SelectTrigger>
                    <SelectContent>
                      {profiles.map(profile => (
                        <SelectItem key={profile.id} value={profile.id}>
                          {profile.first_name} {profile.last_name} {profile.position ? `(${profile.position})` : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-slate-500 mt-1">หากไม่ระบุ ระบบจะกำหนดให้ผู้เปิดเคสเป็นผู้รับผิดชอบเบื้องต้น</p>
                </div>
              </CardContent>
            </Card>


          </div>
        </div>
      </form>
    </div>
  )
}
