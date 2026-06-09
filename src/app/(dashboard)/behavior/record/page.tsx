import React from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"
import { getStudents } from "@/app/actions/student.actions"
import { createBehaviorRecord } from "@/app/actions/behavior.actions"

export default async function RecordBehaviorPage() {
  const students = await getStudents()

  return (
    <div className="flex flex-col gap-6 p-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/behavior">
          <Button variant="outline" size="icon" className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">บันทึกพฤติกรรม</h1>
          <p className="text-slate-500 mt-1">เพิ่มข้อมูลพฤติกรรมเชิงบวกหรือเชิงลบของนักเรียน</p>
        </div>
      </div>

      <Card className="hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle>รายละเอียดพฤติกรรม</CardTitle>
          <CardDescription>กรอกข้อมูลฟอร์มด้านล่างเพื่อบันทึกพฤติกรรมของนักเรียน</CardDescription>
        </CardHeader>
        <form action={createBehaviorRecord}>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">ชื่อนักเรียน</label>
                <Select name="student_id" required>
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกนักเรียน..." />
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
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">ประเภทพฤติกรรม</label>
                <Select name="behavior_type" required>
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกประเภท..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="positive">เชิงบวก (+)</SelectItem>
                    <SelectItem value="negative">เชิงลบ (-)</SelectItem>
                    <SelectItem value="neutral">ทั่วไป</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">หมวดหมู่</label>
              <Select name="category" required>
                <SelectTrigger>
                  <SelectValue placeholder="เลือกหมวดหมู่..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="academic">ผลการเรียนโดดเด่น / ทุ่มเท</SelectItem>
                  <SelectItem value="helpfulness">มีน้ำใจช่วยเหลือ</SelectItem>
                  <SelectItem value="discipline">ระเบียบวินัย</SelectItem>
                  <SelectItem value="disruption">ก่อกวนในชั้นเรียน</SelectItem>
                  <SelectItem value="tardiness">มาสาย / ขาดเรียน</SelectItem>
                  <SelectItem value="other">อื่นๆ</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">วันที่</label>
                <Input type="date" name="date" className="w-full" required defaultValue={new Date().toISOString().split('T')[0]} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">คะแนน (บวก/หัก)</label>
                <Input type="number" name="points" placeholder="เช่น 5 หรือ -2" className="w-full" required />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">รายละเอียดเพิ่มเติม</label>
              <Textarea 
                name="description"
                placeholder="อธิบายเหตุการณ์ที่เกิดขึ้น..." 
                className="min-h-[100px] resize-none"
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between border-t border-slate-100 pt-6">
            <Link href="/behavior">
              <Button type="button" variant="ghost">ยกเลิก</Button>
            </Link>
            <Button type="submit" className="gap-2">
              <Save className="h-4 w-4" />
              บันทึกข้อมูล
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
