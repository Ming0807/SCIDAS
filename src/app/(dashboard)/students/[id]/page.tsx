import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export default async function StudentProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const student = {
    id: id,
    name: "Alice Johnson",
    grade: "10th",
    attendance: 95,
    riskStatus: "Low",
    bio: "Alice is an excellent student who consistently participates in class."
  }

  return (
    <div className="container mx-auto py-10 space-y-8">
      <div className="flex items-center gap-6">
        <Avatar className="h-24 w-24">
          <AvatarFallback className="text-3xl">{student.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{student.name}</h1>
          <p className="text-muted-foreground">Grade: {student.grade} | ID: {student.id}</p>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:w-[400px]">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="academics">Academics</TabsTrigger>
          <TabsTrigger value="behavior">Behavior</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Student Overview</CardTitle>
              <CardDescription>General information and current risk status.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <p><strong>Risk Status:</strong> {student.riskStatus}</p>
              <p><strong>Bio:</strong> {student.bio}</p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="attendance">
          <Card>
            <CardHeader>
              <CardTitle>Attendance</CardTitle>
              <CardDescription>Recent attendance records.</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Current Attendance Rate: {student.attendance}%</p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="academics">
          <Card>
            <CardHeader>
              <CardTitle>Academics</CardTitle>
              <CardDescription>Grades and performance metrics.</CardDescription>
            </CardHeader>
            <CardContent>
              <p>GPA: 3.8</p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="behavior">
          <Card>
            <CardHeader>
              <CardTitle>Behavior</CardTitle>
              <CardDescription>Behavioral incidents and notes.</CardDescription>
            </CardHeader>
            <CardContent>
              <p>No recent incidents recorded.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
