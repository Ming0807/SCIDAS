"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import Link from "next/link"

export type Student = {
  id: string
  name: string
  grade: string
  attendance: number
  riskStatus: "Low" | "Medium" | "High"
}

export const columns: ColumnDef<Student>[] = [
  {
    accessorKey: "name",
    header: "Student",
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarFallback>{row.original.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <Link href={/students/ + row.original.id} className="font-medium hover:underline">
            {row.original.name}
          </Link>
        </div>
      )
    },
  },
  {
    accessorKey: "grade",
    header: "Grade",
  },
  {
    accessorKey: "attendance",
    header: "Attendance",
    cell: ({ row }) => {
      const att = row.original.attendance
      return <span>{att}%</span>
    }
  },
  {
    accessorKey: "riskStatus",
    header: "Risk Status",
    cell: ({ row }) => {
      const risk = row.original.riskStatus
      return (
        <Badge variant={risk === "High" ? "destructive" : risk === "Medium" ? "secondary" : "default"}>
          {risk}
        </Badge>
      )
    }
  }
]
