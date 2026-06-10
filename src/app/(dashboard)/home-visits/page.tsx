"use client"

import * as React from "react"
import Link from "next/link"
import { Plus, MapPin, Calendar, Clock, Search, Filter } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const mockVisits = [
  {
    id: 1,
    studentName: "Alex Mercer",
    date: "2026-06-05",
    time: "14:30",
    location: "123 Main St, Springfield",
    status: "Completed",
    purpose: "Routine Follow-up",
    image: "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: 2,
    studentName: "Sarah Connor",
    date: "2026-06-08",
    time: "10:00",
    location: "456 Elm St, Springfield",
    status: "Scheduled",
    purpose: "Behavioral Intervention",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: 3,
    studentName: "John Doe",
    date: "2026-06-10",
    time: "09:00",
    location: "789 Pine St, Springfield",
    status: "Pending",
    purpose: "Attendance Check",
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: 4,
    studentName: "Emily Davis",
    date: "2026-06-12",
    time: "15:00",
    location: "321 Oak St, Springfield",
    status: "Scheduled",
    purpose: "Academic Support",
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=400&q=80"
  }
]

export default function HomeVisitsGallery() {
  const [searchTerm, setSearchTerm] = React.useState("")

  const filteredVisits = mockVisits.filter((visit) =>
    visit.studentName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-emerald-100 text-emerald-800 border-emerald-200"
      case "Scheduled":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "Pending":
        return "bg-amber-100 text-amber-800 border-amber-200"
      default:
        return "bg-slate-100 text-slate-800 border-slate-200"
    }
  }

  return (
    <div className="flex flex-col gap-8 p-6 md:p-8 max-w-7xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">บันทึกการเยี่ยมบ้าน</h1>
          <p className="text-slate-500 mt-1">จัดการและติดตามข้อมูลการเยี่ยมบ้านนักเรียน</p>
        </div>
        <Link href="/home-visits/new">
          <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700">
            <Plus className="h-4 w-4" />
            เพิ่มบันทึกเยี่ยมบ้าน
          </Button>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-slate-100">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="ค้นหาชื่อนักเรียน..."
            className="pl-9 bg-slate-50 border-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline" className="w-full sm:w-auto gap-2">
          <Filter className="h-4 w-4" />
          ตัวกรอง
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredVisits.map((visit) => (
          <Card key={visit.id} className="overflow-hidden group hover:shadow-lg transition-all duration-300 border-slate-200/60">
            <div className="relative h-48 overflow-hidden bg-slate-100">
              <img
                src={visit.image}
                alt={`เยี่ยมบ้าน ${visit.studentName}`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-3 right-3">
                <Badge variant="outline" className={`shadow-sm backdrop-blur-md bg-white/90 ${getStatusColor(visit.status)}`}>
                  {visit.status === 'Completed' ? 'เสร็จสิ้น' : visit.status === 'Scheduled' ? 'นัดหมายแล้ว' : 'รอดำเนินการ'}
                </Badge>
              </div>
            </div>
            
            <CardHeader className="p-5 pb-2">
              <h3 className="font-semibold text-lg text-slate-900 line-clamp-1">{visit.studentName}</h3>
              <p className="text-sm text-indigo-600 font-medium">{visit.purpose}</p>
            </CardHeader>
            
            <CardContent className="p-5 pt-2 pb-4 space-y-3">
              <div className="flex items-center text-slate-500 text-sm">
                <Calendar className="h-4 w-4 mr-2 text-slate-400" />
                <span>{new Date(visit.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                <span className="mx-2">•</span>
                <Clock className="h-4 w-4 mr-1 text-slate-400" />
                <span>{visit.time}</span>
              </div>
              
              <div className="flex items-start text-slate-500 text-sm">
                <MapPin className="h-4 w-4 mr-2 mt-0.5 text-slate-400 shrink-0" />
                <span className="line-clamp-2 leading-tight">{visit.location}</span>
              </div>
            </CardContent>
            
            <CardFooter className="p-5 pt-0 border-t border-slate-50 mt-2">
              <Button variant="ghost" className="w-full text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50">
                ดูรายละเอียด
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      
      {filteredVisits.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-xl border border-slate-200 border-dashed">
          <div className="h-20 w-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
            <Search className="h-8 w-8 text-slate-300" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900">ไม่พบข้อมูล</h3>
          <p className="text-slate-500 max-w-sm mt-1">ไม่พบข้อมูลการเยี่ยมบ้านที่ตรงกับการค้นหาของคุณ</p>
        </div>
      )}
    </div>
  )
}
