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
    { id: "CAS-001", student: "Alice Johnson", type: "Academic Tutoring", status: "Active", priority: "High", date: "May 12, 2026", assignedTo: "Mr. Smith" },
    { id: "CAS-002", student: "Bob Smith", type: "Counseling", status: "Pending", priority: "Medium", date: "May 14, 2026", assignedTo: "Unassigned" },
    { id: "CAS-003", student: "Charlie Davis", type: "Behavioral Intervention", status: "Resolved", priority: "Low", date: "Apr 28, 2026", assignedTo: "Ms. Lee" },
    { id: "CAS-004", student: "Diana Prince", type: "Family Support", status: "Active", priority: "High", date: "May 15, 2026", assignedTo: "Dr. Evans" },
    { id: "CAS-005", student: "Eve Adams", type: "Academic Tutoring", status: "Pending", priority: "Low", date: "May 16, 2026", assignedTo: "Unassigned" },
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Active": return <Badge className="bg-blue-500/10 text-blue-700 hover:bg-blue-500/20">{status}</Badge>
      case "Pending": return <Badge className="bg-amber-500/10 text-amber-700 hover:bg-amber-500/20">{status}</Badge>
      case "Resolved": return <Badge className="bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20">{status}</Badge>
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
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Support & Interventions</h1>
          <p className="text-slate-500 mt-1">Manage student support cases, counseling, and interventions.</p>
        </div>
        <Link href="/support/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Case
          </Button>
        </Link>
      </div>

      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-4">
          <CardTitle>Case Directory</CardTitle>
          <CardDescription>View and manage all active, pending, and resolved support cases.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
              <Input placeholder="Search student or case ID..." className="pl-9" />
            </div>
            <div className="flex gap-2">
              <Select defaultValue="all">
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
              <Select defaultValue="all">
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="academic">Academic</SelectItem>
                  <SelectItem value="behavioral">Behavioral</SelectItem>
                  <SelectItem value="counseling">Counseling</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-md border border-slate-200">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow>
                  <TableHead className="w-[100px]">Case ID</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
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
                        <span className="text-sm text-slate-600">{c.priority}</span>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(c.status)}</TableCell>
                    <TableCell className="text-slate-500 text-sm">{c.date}</TableCell>
                    <TableCell className="text-slate-600 text-sm">{c.assignedTo}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" className="h-8 gap-1 text-slate-500 hover:text-slate-900">
                        <FileText className="h-3 w-3" />
                        View
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
