import React from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"

export default function RecordBehaviorPage() {
  return (
    <div className="flex flex-col gap-6 p-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/behavior">
          <Button variant="outline" size="icon" className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Record Behavior</h1>
          <p className="text-slate-500 mt-1">Submit a new behavior log for a student.</p>
        </div>
      </div>

      <Card className="hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle>Behavior Details</CardTitle>
          <CardDescription>Fill out the form below to record a behavior incident or merit.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Student</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select student..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="alice">Alice Johnson</SelectItem>
                  <SelectItem value="bob">Bob Smith</SelectItem>
                  <SelectItem value="charlie">Charlie Davis</SelectItem>
                  <SelectItem value="diana">Diana Prince</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Behavior Type</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select type..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="positive">Positive (Merit)</SelectItem>
                  <SelectItem value="negative">Negative (Demerit)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Incident Category</label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select category..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="academic">Academic Excellence</SelectItem>
                <SelectItem value="helpfulness">Helpfulness</SelectItem>
                <SelectItem value="disruption">Class Disruption</SelectItem>
                <SelectItem value="tardiness">Tardiness</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Date & Time</label>
              <Input type="datetime-local" className="w-full" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Points Modifier</label>
              <Input type="number" placeholder="e.g., 5 or -2" className="w-full" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Description / Notes</label>
            <Textarea 
              placeholder="Provide context about what happened..." 
              className="min-h-[100px] resize-none"
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between border-t border-slate-100 pt-6">
          <Link href="/behavior">
            <Button variant="ghost">Cancel</Button>
          </Link>
          <Button className="gap-2">
            <Save className="h-4 w-4" />
            Save Record
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
