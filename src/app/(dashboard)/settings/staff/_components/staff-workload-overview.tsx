"use client"

import * as React from "react"
import {
  AlertTriangle,
  CheckCircle2,
  Users,
  GraduationCap,
  Layers,
  ArrowRight,
  ShieldAlert,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import type { ClassroomAssignmentOption, StaffMemberItem } from "@/lib/staff-constants"

interface StaffWorkloadOverviewProps {
  classrooms: ClassroomAssignmentOption[]
  staffList: StaffMemberItem[]
  onGoToAssignments: () => void
}

export function StaffWorkloadOverview({
  classrooms,
  staffList,
  onGoToAssignments,
}: StaffWorkloadOverviewProps) {
  const totalRooms = classrooms.length
  const assignedRooms = classrooms.filter((c) => Boolean(c.homeroomTeacherId)).length
  const unassignedRooms = totalRooms - assignedRooms
  const coveragePercent = totalRooms > 0 ? Math.round((assignedRooms / totalRooms) * 100) : 100

  // Workload calculations
  const homeroomTeachers = staffList.filter((s) =>
    s.assignedClassrooms.some((a) => a.assignmentType === "homeroom"),
  )
  const coTeachersAssigned = classrooms.filter((c) => Boolean(c.coTeacherId)).length

  const multiRoomTeachers = staffList.filter(
    (s) => s.assignedClassrooms.filter((a) => a.assignmentType === "homeroom").length > 1,
  )

  const avgRoomsPerTeacher =
    homeroomTeachers.length > 0 ? (assignedRooms / homeroomTeachers.length).toFixed(1) : "0"

  return (
    <div className="space-y-4">
      {/* 1. Homeroom Coverage Banner */}
      <div
        className={`rounded-xl border p-4 shadow-sm transition-colors ${
          coveragePercent === 100 && totalRooms > 0
            ? "border-emerald-300 dark:border-emerald-800/50 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-950 dark:text-emerald-200"
            : "border-amber-300 dark:border-amber-800/50 bg-amber-50/60 dark:bg-amber-950/20 text-amber-950 dark:text-amber-200"
        }`}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            {coveragePercent === 100 && totalRooms > 0 ? (
              <CheckCircle2 className="size-5 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
            ) : (
              <AlertTriangle className="size-5 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
            )}
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h4 className="font-semibold text-sm">
                  ความครอบคลุมครูประจำชั้น: {assignedRooms}/{totalRooms} ห้อง ({coveragePercent}%)
                </h4>
                <span
                  className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${
                    coveragePercent === 100 && totalRooms > 0
                      ? "bg-emerald-200/60 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200"
                      : "bg-amber-200/60 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200"
                  }`}
                >
                  {coveragePercent === 100 && totalRooms > 0 ? "ครบถ้วน" : `ขาดอีก ${unassignedRooms} ห้อง`}
                </span>
              </div>
              <p className="text-xs leading-relaxed text-muted-foreground">
                {coveragePercent === 100 && totalRooms > 0
                  ? "ทุกห้องเรียนมีครูประจำชั้นดูแลครบถ้วนแล้ว พร้อมสำหรับการบันทึกการมาเรียนและระบบดูแลช่วยเหลือนักเรียน"
                  : `ยังมีห้องเรียนที่ยังไม่ได้มอบหมายครูประจำชั้น ${unassignedRooms} ห้อง กรุณามอบหมายให้ครบถ้วนเพื่อป้องกันข้อมูลการดูแลนักเรียนตกหล่น`}
              </p>
            </div>
          </div>

          {unassignedRooms > 0 ? (
            <Button
              type="button"
              size="sm"
              onClick={onGoToAssignments}
              className="shrink-0 gap-1.5 text-xs bg-amber-600 hover:bg-amber-700 text-white dark:bg-amber-500 dark:hover:bg-amber-600"
            >
              <span>มอบหมายครูประจำชั้นทันที</span>
              <ArrowRight className="size-3.5" />
            </Button>
          ) : null}
        </div>

        {/* Progress bar */}
        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted/60">
          <div
            className={`h-full transition-all duration-300 ${
              coveragePercent === 100 ? "bg-emerald-500" : "bg-amber-500"
            }`}
            style={{ width: `${coveragePercent}%` }}
          />
        </div>
      </div>

      {/* 2. Teacher Workload Distribution Card */}
      <div className="rounded-xl border border-border bg-card p-4 text-card-foreground shadow-sm space-y-3">
        <div className="flex items-center justify-between gap-2 border-b border-border/60 pb-2.5">
          <div className="flex items-center gap-2">
            <Layers className="size-4 text-primary" />
            <h4 className="font-semibold text-sm">การกระจายภาระงานครู (Teacher Workload Distribution)</h4>
          </div>
          <span className="text-xs text-muted-foreground">
            คำนวณจากห้องเรียนที่เปิดใช้งาน {totalRooms} ห้อง
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-1">
            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
              <GraduationCap className="size-3.5 text-primary" />
              ครูประจำชั้น
            </p>
            <p className="text-lg font-bold text-foreground">
              {homeroomTeachers.length} <span className="text-xs font-normal text-muted-foreground">คน</span>
            </p>
            <p className="text-xs text-muted-foreground">
              เฉลี่ย {avgRoomsPerTeacher} ห้อง/คน
            </p>
          </div>

          <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-1">
            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Users className="size-3.5 text-primary" />
              ครูประจำชั้นร่วม
            </p>
            <p className="text-lg font-bold text-foreground">
              {coTeachersAssigned} <span className="text-xs font-normal text-muted-foreground">ห้อง</span>
            </p>
            <p className="text-xs text-muted-foreground">
              {totalRooms > 0 ? `${Math.round((coTeachersAssigned / totalRooms) * 100)}% ของห้องเรียน` : "-"}
            </p>
          </div>

          <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-1">
            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
              <ShieldAlert className="size-3.5 text-primary" />
              ภาระงานซ้ำซ้อน
            </p>
            <p
              className={`text-lg font-bold ${
                multiRoomTeachers.length > 0 ? "text-amber-600 dark:text-amber-400" : "text-foreground"
              }`}
            >
              {multiRoomTeachers.length}{" "}
              <span className="text-xs font-normal text-muted-foreground">คน</span>
            </p>
            <p className="text-xs text-muted-foreground">
              {multiRoomTeachers.length > 0 ? "รับผิดชอบ > 1 ห้อง" : "ไม่มีครูภาระซ้อน"}
            </p>
          </div>

          <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-1">
            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
              <AlertTriangle className="size-3.5 text-primary" />
              ห้องที่ขาดครู
            </p>
            <p
              className={`text-lg font-bold ${
                unassignedRooms > 0 ? "text-rose-600 dark:text-rose-400" : "text-emerald-600"
              }`}
            >
              {unassignedRooms} <span className="text-xs font-normal text-muted-foreground">ห้อง</span>
            </p>
            <p className="text-xs text-muted-foreground">
              {unassignedRooms === 0 ? "พร้อมใช้งาน 100%" : "ต้องการการจัดสรร"}
            </p>
          </div>
        </div>

        {multiRoomTeachers.length > 0 ? (
          <div className="rounded-lg bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/70 dark:border-amber-800/40 p-2.5 text-xs text-amber-900 dark:text-amber-200">
            <span className="font-semibold">ข้อสังเกตภาระงาน: </span>
            ครูที่รับผิดชอบมากกว่า 1 ห้องเรียน:{" "}
            {multiRoomTeachers.map((t) => `${t.fullName} (${t.assignedClassrooms.length} ห้อง)`).join(", ")}
          </div>
        ) : null}
      </div>
    </div>
  )
}
