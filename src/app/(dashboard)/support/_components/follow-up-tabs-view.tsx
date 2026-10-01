"use client"

import { useState } from "react"
import Link from "next/link"
import { CalendarClock, CheckSquare, ListChecks } from "lucide-react"

import { DataTable, type DataTableColumn } from "@/components/data"
import { StatusBadge } from "@/components/dashboard"
import { EmptyState } from "@/components/feedback"
import { ActionStatusControls } from "@/components/care"
import { formatThaiShortDate } from "@/lib/student-care-formatters"
import type { ActionQueueItem } from "@/lib/server/student-care-read-models"
import type {
  UnifiedFollowUpItem,
  UnifiedFollowUpSourceType,
} from "@/lib/server/unified-followup-read-models"

function getPriorityTone(priority: ActionQueueItem["priority"]) {
  if (priority === "critical" || priority === "high") return "high-risk"
  if (priority === "medium") return "watch"
  return "normal"
}

function getPriorityLabel(priority: ActionQueueItem["priority"]) {
  const labels: Record<ActionQueueItem["priority"], string> = {
    low: "ต่ำ",
    medium: "กลาง",
    high: "สูง",
    critical: "เร่งด่วน",
  }
  return labels[priority]
}

function getActionStatusLabel(status: ActionQueueItem["status"]) {
  const labels: Record<ActionQueueItem["status"], string> = {
    todo: "รอดำเนินการ",
    in_progress: "กำลังทำ",
    done: "ปิดแล้ว",
    cancelled: "ยกเลิก",
  }
  return labels[status]
}

function getActionStatusTone(status: ActionQueueItem["status"]) {
  if (status === "done") return "normal"
  if (status === "in_progress") return "info"
  if (status === "cancelled") return "neutral"
  return "watch"
}

const actionColumns: Array<DataTableColumn<ActionQueueItem>> = [
  {
    id: "title",
    header: "งานดูแล",
    className: "min-w-64",
    cell: (item) => (
      <div className="min-w-0 space-y-1">
        <p className="truncate font-medium text-foreground">{item.title}</p>
        <p className="truncate text-sm text-muted-foreground">
          {item.studentName ?? "ไม่ระบุนักเรียน"} / {item.category}
        </p>
      </div>
    ),
  },
  {
    id: "priority",
    header: "ความสำคัญ",
    cell: (item) => (
      <StatusBadge
        status={getPriorityTone(item.priority)}
        label={getPriorityLabel(item.priority)}
        size="sm"
      />
    ),
  },
  {
    id: "due",
    header: "กำหนด",
    cell: (item) => (
      <span className="text-muted-foreground">{formatThaiShortDate(item.dueDate)}</span>
    ),
  },
  {
    id: "status",
    header: "สถานะ",
    cell: (item) => (
      <StatusBadge
        status={getActionStatusTone(item.status)}
        label={getActionStatusLabel(item.status)}
        size="sm"
      />
    ),
  },
  {
    id: "actions",
    header: "จัดการ",
    align: "right",
    sticky: "right",
    cell: (item) => <ActionStatusControls item={item} />,
  },
]

const unifiedFollowUpColumns: Array<DataTableColumn<UnifiedFollowUpItem>> = [
  {
    id: "title",
    header: "รายการติดตาม",
    className: "min-w-64",
    cell: (item) => (
      <div className="min-w-0 space-y-1">
        <Link
          href={item.linkHref}
          className="truncate font-medium text-foreground hover:text-primary block"
        >
          {item.title}
        </Link>
        <p className="truncate text-xs text-muted-foreground">
          {item.studentName}
          {item.classroomName ? ` (${item.classroomName})` : ""}
          {item.detail ? ` · ${item.detail}` : ""}
        </p>
      </div>
    ),
  },
  {
    id: "source",
    header: "ที่มา",
    cell: (item) => {
      const sourceMap: Record<UnifiedFollowUpSourceType, { label: string; tone: string }> = {
        action_item: { label: "งานดูแล", tone: "info" },
        support_followup: { label: "นัดติดตามเคส", tone: "watch" },
        idp_goal: { label: "เป้าหมาย IDP", tone: "primary" },
        idp_plan: { label: "ทบทวนแผน", tone: "high-risk" },
      }
      const s = sourceMap[item.sourceType] ?? { label: item.sourceType, tone: "neutral" }
      return <StatusBadge status={s.tone} label={s.label} size="sm" />
    },
  },
  {
    id: "due",
    header: "กำหนด",
    cell: (item) => {
      const dueLabel = formatThaiShortDate(item.dueDate)
      if (item.dueStatus === "overdue") {
        return (
          <span className="font-semibold text-rose-600 dark:text-rose-400">
            {dueLabel} (เกินกำหนด)
          </span>
        )
      }
      if (item.dueStatus === "due_today") {
        return (
          <span className="font-semibold text-amber-600 dark:text-amber-400">
            {dueLabel} (วันนี้)
          </span>
        )
      }
      return <span className="text-muted-foreground">{dueLabel}</span>
    },
  },
  {
    id: "priority",
    header: "ความสำคัญ",
    cell: (item) => {
      const isUrgent = item.priority === "critical" || item.priority === "high"
      return (
        <StatusBadge
          status={isUrgent ? "high-risk" : item.priority === "medium" ? "watch" : "normal"}
          label={
            item.priority === "critical"
              ? "เร่งด่วน"
              : item.priority === "high"
                ? "สูง"
                : item.priority === "medium"
                  ? "ปานกลาง"
                  : "ต่ำ"
          }
          size="sm"
        />
      )
    },
  },
  {
    id: "actions",
    header: "เปิดดู",
    align: "right",
    sticky: "right",
    cell: (item) => (
      <Link href={item.linkHref} className="text-xs font-medium text-primary hover:underline">
        เปิดรายการ →
      </Link>
    ),
  },
]

export function FollowUpTabsView({
  actionQueue,
  unifiedQueue,
}: {
  actionQueue: ActionQueueItem[]
  unifiedQueue: UnifiedFollowUpItem[]
}) {
  const [activeTab, setActiveTab] = useState<"unified" | "actions">("unified")
  const [sourceFilter, setSourceFilter] = useState<string>("all")

  const filteredUnified =
    sourceFilter === "all"
      ? unifiedQueue
      : unifiedQueue.filter((item) => item.sourceType === sourceFilter)

  return (
    <div className="space-y-4">
      {/* Tab Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("unified")}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              activeTab === "unified"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <CalendarClock className="size-3.5" />
            กล่องรวมการติดตามผล ({unifiedQueue.length.toLocaleString("th-TH")})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("actions")}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              activeTab === "actions"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <CheckSquare className="size-3.5" />
            คิวงานดูแลเฉพาะหน้า ({actionQueue.length.toLocaleString("th-TH")})
          </button>
        </div>

        {activeTab === "unified" ? (
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-muted-foreground mr-1">ที่มา:</span>
            {[
              { id: "all", label: "ทั้งหมด" },
              { id: "action_item", label: "งานดูแล" },
              { id: "support_followup", label: "นัดติดตามเคส" },
              { id: "idp_goal", label: "เป้าหมาย IDP" },
              { id: "idp_plan", label: "ทบทวนแผน" },
            ].map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setSourceFilter(s.id)}
                className={`rounded-md px-2 py-0.5 text-xs font-medium transition-colors ${
                  sourceFilter === s.id
                    ? "bg-primary/10 text-primary font-semibold"
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      {activeTab === "unified" ? (
        <DataTable
          className="min-h-[460px]"
          columns={unifiedFollowUpColumns}
          data={filteredUnified}
          emptyState={
            <EmptyState
              title="ไม่มีรายการติดตามที่ต้องดำเนินการ"
              description="เมื่อมีนัดหมายติดตามเคส งานดูแล หรือแผน IDP ระบบจะรวบรวมไว้ตรงนี้"
            />
          }
          getRowKey={(item) => item.id}
          toolbar={
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0 space-y-0.5">
                <h2 className="text-sm font-semibold text-foreground">
                  กล่องรวมการติดตามผล (Unified Follow-up Inbox)
                </h2>
                <p className="text-xs text-muted-foreground">
                  รวมนัดติดตามเคสช่วยเหลือ เป้าหมาย IDP และงานดูแลตามกำหนดเวลา
                </p>
              </div>
              <Link
                href="/students?status=high"
                className="text-xs font-medium text-primary hover:underline"
              >
                ดูนักเรียนเสี่ยงสูง
              </Link>
            </div>
          }
        />
      ) : (
        <DataTable
          className="min-h-[460px]"
          columns={actionColumns}
          data={actionQueue}
          emptyState={
            <EmptyState
              title="ยังไม่มีงานดูแลค้าง"
              description="เมื่อตรวจพบความเสี่ยงหรือสร้างเคส ระบบจะรวมงานที่ต้องติดตามไว้ตรงนี้"
            />
          }
          getRowKey={(item) => item.id}
          toolbar={
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0 space-y-0.5">
                <h2 className="text-sm font-semibold text-foreground">คิวงานดูแลเฉพาะหน้า</h2>
                <p className="text-xs text-muted-foreground">
                  เริ่มงานหรือปิดงานได้จากตารางนี้ แล้วหน้าที่เกี่ยวข้องจะอัปเดตตาม
                </p>
              </div>
              <Link
                href="/students?status=high"
                className="text-xs font-medium text-primary hover:underline"
              >
                ดูนักเรียนเสี่ยงสูง
              </Link>
            </div>
          }
        />
      )}
    </div>
  )
}
