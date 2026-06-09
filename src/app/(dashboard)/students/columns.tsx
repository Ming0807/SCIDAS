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
  riskStatus: "ต่ำ" | "ปานกลาง" | "สูง"
}

export const columns: ColumnDef<Student>[] = [
  {
    accessorKey: "name",
    header: "ชื่อนักเรียน",
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
    accessorKey: "ระดับชั้น",
    header: "ระดับชั้น",
  },
  {
    accessorKey: "เปอร์เซ็นต์เข้าเรียน",
    header: "เปอร์เซ็นต์เข้าเรียน",
    cell: ({ row }) => {
      const att = row.original.attendance
      return <span>{att}%</span>
    }
  },
  {
    accessorKey: "riskStatus",
    header: "สถานะความเสี่ยง",
    cell: ({ row }) => {
      const risk = row.original.riskStatus
      return (
        <Badge variant={risk === "สูง" ? "destructive" : risk === "ปานกลาง" ? "secondary" : "default"}>
          {risk}
        </Badge>
      )
    }
  }
]
