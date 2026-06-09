import { getStudentById } from "@/app/actions/student.actions"
import { notFound } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default async function StudentProfilePage({ params }: { params: { id: string } }) {
  const student = await getStudentById(params.id)

  if (!student) {
    notFound()
  }

  const fullName = `${student.prefix || ''}${student.first_name} ${student.last_name}`

  return (
    <div className="container mx-auto py-10 space-y-8">
      {/* Profile Header */}
      <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center text-3xl font-bold text-primary">
            {student.first_name.charAt(0)}
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{fullName}</h1>
            <p className="text-muted-foreground flex items-center gap-2 mt-1">
              รหัสนักเรียน: {student.student_code}
              <Badge variant={student.status === "active" ? "default" : "secondary"}>
                {student.status === "active" ? "กำลังศึกษา" : student.status}
              </Badge>
            </p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:w-[400px]">
          <TabsTrigger value="overview">ข้อมูลพื้นฐาน</TabsTrigger>
          <TabsTrigger value="attendance">การเข้าเรียน</TabsTrigger>
          <TabsTrigger value="academics">ผลการเรียน</TabsTrigger>
          <TabsTrigger value="behavior">พฤติกรรม</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>ข้อมูลพื้นฐาน</CardTitle>
              <CardDescription>รายละเอียดข้อมูลส่วนตัวของนักเรียน</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">เพศ</p>
                  <p>{student.gender === 'male' ? 'ชาย' : student.gender === 'female' ? 'หญิง' : 'อื่นๆ'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">วันเกิด</p>
                  <p>{student.date_of_birth ? new Date(student.date_of_birth).toLocaleDateString('th-TH') : '-'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">หมู่เลือด</p>
                  <p>{student.blood_type || "-"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="attendance" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>การเข้าเรียน</CardTitle>
              <CardDescription>สถิติการเข้าเรียนในภาคเรียนปัจจุบัน (กำลังพัฒนา...)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[200px] flex items-center justify-center border border-dashed rounded-md">
                <p className="text-muted-foreground">เร็วๆ นี้</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="academics" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>ผลการเรียน</CardTitle>
              <CardDescription>ผลการเรียนและทักษะพื้นฐาน (กำลังพัฒนา...)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[200px] flex items-center justify-center border border-dashed rounded-md">
                <p className="text-muted-foreground">เร็วๆ นี้</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="behavior" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>พฤติกรรมและการช่วยเหลือ</CardTitle>
              <CardDescription>บันทึกพฤติกรรมและการให้คำปรึกษา (กำลังพัฒนา...)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[200px] flex items-center justify-center border border-dashed rounded-md">
                <p className="text-muted-foreground">เร็วๆ นี้</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
