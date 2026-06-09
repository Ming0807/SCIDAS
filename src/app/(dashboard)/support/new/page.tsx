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
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Open New Support Case</h1>
          <p className="text-slate-500 mt-1">Initiate a support or intervention request for a student.</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle>Case Information</CardTitle>
              <CardDescription>Provide details about the student and the support needed.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Select Student</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Search and select student..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="alice">Alice Johnson</SelectItem>
                    <SelectItem value="bob">Bob Smith</SelectItem>
                    <SelectItem value="charlie">Charlie Davis</SelectItem>
                    <SelectItem value="diana">Diana Prince</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Support Category</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="academic">Academic Tutoring</SelectItem>
                      <SelectItem value="behavioral">Behavioral Intervention</SelectItem>
                      <SelectItem value="counseling">Counseling Services</SelectItem>
                      <SelectItem value="family">Family Support</SelectItem>
                      <SelectItem value="health">Health & Wellness</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Priority Level</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low - Monitor</SelectItem>
                      <SelectItem value="medium">Medium - Action Required</SelectItem>
                      <SelectItem value="high">High - Urgent Intervention</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Case Title / Brief Summary</label>
                <Input placeholder="e.g., Struggling with advanced math concepts" className="w-full" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Detailed Description & Context</label>
                <Textarea 
                  placeholder="Provide comprehensive background information, triggers, previous attempts at resolution, and any other relevant context..." 
                  className="min-h-[150px] resize-y"
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t border-slate-100 pt-6">
              <Link href="/support">
                <Button variant="ghost">Cancel</Button>
              </Link>
              <Button className="gap-2">
                <Send className="h-4 w-4" />
                Submit Case
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
              <CardTitle className="text-lg">Assignment</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Assign To Staff (Optional)</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Leave unassigned..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="smith">Mr. Smith (Counselor)</SelectItem>
                    <SelectItem value="lee">Ms. Lee (Behavioral Specialist)</SelectItem>
                    <SelectItem value="evans">Dr. Evans (Psychologist)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-slate-500 mt-1">If left unassigned, this case will be routed to the general queue for triage.</p>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
              <CardTitle className="text-lg">Notifications</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div className="flex items-start space-x-3">
                <input type="checkbox" id="notify-parents" className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600" />
                <label htmlFor="notify-parents" className="text-sm text-slate-700">
                  <span className="font-medium block">Notify Parents/Guardians</span>
                  <span className="text-slate-500 text-xs">Send an automated email alert about this case creation.</span>
                </label>
              </div>
              <div className="flex items-start space-x-3">
                <input type="checkbox" id="notify-teachers" defaultChecked className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600" />
                <label htmlFor="notify-teachers" className="text-sm text-slate-700">
                  <span className="font-medium block">Notify Homeroom Teacher</span>
                  <span className="text-slate-500 text-xs">Keep the primary teacher in the loop.</span>
                </label>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
