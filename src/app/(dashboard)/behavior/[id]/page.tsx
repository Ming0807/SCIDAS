import React from "react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, Calendar, User } from "lucide-react"

import { PageShell } from "@/components/dashboard/page-shell"
import { StatusBadge } from "@/components/dashboard/status-badge"
import { ErrorState } from "@/components/feedback/error-state"
import {
  getBehaviorRecordById,
  getBehaviorRecordsByStudentId,
  getBehaviorTypeLabel,
  type BehaviorRecordItem,
} from "@/lib/server/behavior-read-models"
import { formatGradeLevel, getStudentInitials } from "@/lib/student-care-formatters"
import { cn } from "@/lib/utils"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function BehaviorDetailPage({ params }: PageProps) {
  const { id } = await params

  let studentRecords: BehaviorRecordItem[] = []

  let record: BehaviorRecordItem | null
  try {
    record = await getBehaviorRecordById(id)
  } catch {
    return (
      <PageShell>
        <ErrorState
          title="ไม่สามารถโหลดข้อมูลพฤติกรรมได้"
          description="กรุณาลองใหม่อีกครั้ง"
        />
      </PageShell>
    )
  }

  if (!record) notFound()

  try {
    studentRecords = await getBehaviorRecordsByStudentId(record.studentId, 10)
  } catch {
    // non-critical — continue without related records
  }

  const isPositive = record.behaviorType === "positive"
  const isNegative = record.behaviorType === "negative"
  const statusTone = isPositive ? "success" : isNegative ? "danger" : "neutral"
  const initials = getStudentInitials(record.studentName)

  return (
    <PageShell>
      {/* Back link */}
      <Link
        href="/behavior"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        กลับไปภาพรวมพฤติกรรม
      </Link>

      {/* Record detail card */}
      <div className="bg-card rounded-xl border border-border shadow-sm p-6 mb-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <span
              className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold shrink-0",
                isPositive
                  ? "bg-emerald-100 text-emerald-700"
                  : isNegative
                    ? "bg-red-100 text-red-700"
                    : "bg-muted text-muted-foreground",
              )}
              aria-hidden="true"
            >
              {initials}
            </span>
            <div>
              <h1 className="text-xl font-semibold text-foreground">
                {record.studentName}
              </h1>
              <p className="text-sm text-muted-foreground">
                {record.studentClass
                  ? `ชั้น ${record.studentClass}`
                  : formatGradeLevel("ไม่ระบุ")}
              </p>
            </div>
          </div>
          <StatusBadge
            status={statusTone}
            label={getBehaviorTypeLabel(record.behaviorType)}
            size="default"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">วันที่:</span>
            <span className="font-medium text-foreground">{record.date}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">คะแนน:</span>
            <span
              className={cn(
                "font-semibold",
                record.points > 0
                  ? "text-emerald-600"
                  : record.points < 0
                    ? "text-red-600"
                    : "text-muted-foreground",
              )}
            >
              {record.points > 0 ? "+" : ""}
              {record.points}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <User className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">ผู้บันทึก:</span>
            <span className="font-medium text-foreground">
              {record.reportedByName ?? "-"}
            </span>
          </div>
          {record.category ? (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">หมวดหมู่:</span>
              <span className="font-medium text-foreground">
                {record.category}
              </span>
            </div>
          ) : null}
          {record.severity ? (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">ระดับความรุนแรง:</span>
              <span className="font-medium text-foreground">
                {record.severity}
              </span>
            </div>
          ) : null}
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">แจ้งผู้ปกครอง:</span>
            <span className="font-medium text-foreground">
              {record.parentNotified ? "แจ้งแล้ว" : "ยังไม่ได้แจ้ง"}
            </span>
          </div>
        </div>

        <div className="border-t border-border pt-4">
          <h2 className="text-sm font-semibold text-foreground mb-2">
            รายละเอียด
          </h2>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
            {record.description || "ไม่มีรายละเอียด"}
          </p>
        </div>

        {record.actionTaken ? (
          <div className="border-t border-border pt-4 mt-4">
            <h2 className="text-sm font-semibold text-foreground mb-2">
              การดำเนินการ
            </h2>
            <p className="text-sm text-muted-foreground">
              {record.actionTaken}
            </p>
          </div>
        ) : null}
      </div>

      {/* Student's other records */}
      {studentRecords.length > 0 ? (
        <div className="bg-card rounded-xl border border-border shadow-sm p-5">
          <h2 className="text-base font-semibold text-foreground mb-4">
            บันทึกพฤติกรรมอื่นของนักเรียนนี้
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[500px]">
              <thead>
                <tr className="border-b border-border text-xs font-semibold text-muted-foreground">
                  <th className="py-2 px-3">วันที่</th>
                  <th className="py-2 px-3">ประเภท</th>
                  <th className="py-2 px-3">รายละเอียด</th>
                  <th className="py-2 px-3 text-right">คะแนน</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {studentRecords.map((r) => (
                  <tr
                    key={r.id}
                    className={cn(
                      "border-b border-border hover:bg-muted/30 transition-colors",
                      r.id === record.id && "bg-muted/20",
                    )}
                  >
                    <td className="py-2 px-3 text-muted-foreground whitespace-nowrap">
                      {r.date}
                    </td>
                    <td className="py-2 px-3 whitespace-nowrap">
                      <StatusBadge
                        status={
                          r.behaviorType === "positive"
                            ? "success"
                            : r.behaviorType === "negative"
                              ? "danger"
                              : "neutral"
                        }
                        label={getBehaviorTypeLabel(r.behaviorType)}
                        size="sm"
                      />
                    </td>
                    <td className="py-2 px-3 text-foreground max-w-xs truncate">
                      {r.description}
                    </td>
                    <td
                      className={cn(
                        "py-2 px-3 text-right font-semibold whitespace-nowrap",
                        r.points > 0
                          ? "text-emerald-600"
                          : r.points < 0
                            ? "text-red-600"
                            : "text-muted-foreground",
                      )}
                    >
                      {r.points > 0 ? "+" : ""}
                      {r.points}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </PageShell>
  )
}
