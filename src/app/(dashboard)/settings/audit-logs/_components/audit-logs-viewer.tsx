"use client"

import { useState } from "react"
import {
  Activity,
  ChevronDown,
  ChevronRight,
  Clock,
  Database,
  Download,
  FileSpreadsheet,
  LogIn,
  LogOut,
  PlusCircle,
  RefreshCw,
  Search,
  ShieldCheck,
  Trash2,
  User,
} from "lucide-react"

import type { AuditAction, AuditLogItem } from "@/app/actions/audit.actions"
import { Input } from "@/components/ui/input"

function getActionBadge(action: AuditAction) {
  switch (action) {
    case "INSERT":
      return {
        label: "เพิ่มข้อมูล",
        icon: PlusCircle,
        color: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800",
      }
    case "UPDATE":
      return {
        label: "แก้ไขข้อมูล",
        icon: RefreshCw,
        color: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800",
      }
    case "DELETE":
      return {
        label: "ลบข้อมูล",
        icon: Trash2,
        color: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800",
      }
    case "EXPORT":
      return {
        label: "ส่งออกข้อมูล",
        icon: Download,
        color: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800",
      }
    case "LOGIN":
      return {
        label: "เข้าสู่ระบบ",
        icon: LogIn,
        color: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800",
      }
    case "LOGOUT":
      return {
        label: "ออกจากระบบ",
        icon: LogOut,
        color: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
      }
    case "IMPORT":
      return {
        label: "นำเข้าข้อมูล",
        icon: FileSpreadsheet,
        color: "bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-800",
      }
    default:
      return {
        label: action,
        icon: Activity,
        color: "bg-muted text-muted-foreground border-border",
      }
  }
}

export function AuditLogsViewer({
  logs,
}: {
  logs: AuditLogItem[]
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [filterAction, setFilterAction] = useState<string>("ALL")
  const [filterTable, setFilterTable] = useState<string>("ALL")
  const [searchTerm, setSearchTerm] = useState("")

  const uniqueTables = Array.from(new Set(logs.map((l) => l.table_name))).sort()

  const filteredLogs = logs.filter((log) => {
    if (filterAction !== "ALL" && log.action !== filterAction) return false
    if (filterTable !== "ALL" && log.table_name !== filterTable) return false
    if (searchTerm) {
      const q = searchTerm.toLowerCase()
      const matchActor = log.actor_name?.toLowerCase().includes(q)
      const matchTable = log.table_name.toLowerCase().includes(q)
      const matchRecord = log.record_id?.toLowerCase().includes(q)
      const matchAction = log.action.toLowerCase().includes(q)
      if (!matchActor && !matchTable && !matchRecord && !matchAction) return false
    }
    return true
  })

  return (
    <div className="space-y-4">
      {/* Controls Bar */}
      <div className="rounded-2xl border border-border bg-card p-4 shadow-xs flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {/* Action Filter */}
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="h-9 rounded-xl border border-input bg-background px-3 text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-ring"
          >
            <option value="ALL">กิจกรรมทั้งหมด</option>
            <option value="UPDATE">แก้ไขข้อมูล (UPDATE)</option>
            <option value="INSERT">สร้างข้อมูลใหม่ (INSERT)</option>
            <option value="DELETE">ลบข้อมูล (DELETE)</option>
            <option value="EXPORT">ส่งออกข้อมูล (EXPORT)</option>
            <option value="LOGIN">เข้าสู่ระบบ (LOGIN)</option>
            <option value="LOGOUT">ออกจากระบบ (LOGOUT)</option>
          </select>

          {/* Table Filter */}
          <select
            value={filterTable}
            onChange={(e) => setFilterTable(e.target.value)}
            className="h-9 rounded-xl border border-input bg-background px-3 text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-ring"
          >
            <option value="ALL">ตารางข้อมูลทั้งหมด</option>
            {uniqueTables.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        {/* Search */}
        <div className="relative max-w-sm w-full sm:w-auto">
          <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="ค้นหาผู้กระทำ, ตาราง, Record ID..."
            className="pl-9 h-9 text-xs"
          />
        </div>
      </div>

      {/* Logs Table */}
      <div className="rounded-2xl border border-border bg-card shadow-xs overflow-hidden">
        {filteredLogs.length === 0 ? (
          <div className="p-12 text-center">
            <ShieldCheck className="mx-auto size-10 text-muted-foreground/60" />
            <h3 className="mt-3 text-sm font-semibold text-foreground">ไม่พบรายการบันทึกที่ตรงกับเงื่อนไข</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              ลองปรับเปลี่ยนตัวกรองกิจกรรมหรือคำค้นหาด้านบน
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filteredLogs.map((log) => {
              const badge = getActionBadge(log.action)
              const Icon = badge.icon
              const isExpanded = expandedId === log.id

              return (
                <div key={log.id} className="transition-colors hover:bg-muted/30">
                  <div
                    onClick={() => setExpandedId(isExpanded ? null : log.id)}
                    className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer select-none"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div
                        className={`flex size-8 items-center justify-center rounded-lg border shrink-0 mt-0.5 ${badge.color}`}
                      >
                        <Icon className="size-4" />
                      </div>

                      <div className="space-y-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold border ${badge.color}`}
                          >
                            {badge.label}
                          </span>

                          <span className="font-mono text-xs font-medium text-foreground bg-muted px-2 py-0.5 rounded-md flex items-center gap-1">
                            <Database className="size-3 text-muted-foreground" />
                            {log.table_name}
                          </span>

                          {log.record_id ? (
                            <span className="font-mono text-xs text-muted-foreground truncate max-w-[140px]">
                              ID: {log.record_id.slice(0, 10)}...
                            </span>
                          ) : null}
                        </div>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1 font-medium text-foreground">
                            <User className="size-3 text-muted-foreground" />
                            {log.actor_name}
                            {log.actor_role ? ` (${log.actor_role})` : ""}
                          </span>

                          {log.ip_address ? (
                            <span>IP: {log.ip_address}</span>
                          ) : null}

                          <span className="flex items-center gap-1">
                            <Clock className="size-3" />
                            {new Date(log.created_at).toLocaleString("th-TH", {
                              dateStyle: "medium",
                              timeStyle: "medium",
                            })}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      <span className="text-xs text-muted-foreground hidden sm:inline">
                        {isExpanded ? "ซ่อนรายละเอียด" : "ดูข้อมูล JSON"}
                      </span>
                      {isExpanded ? (
                        <ChevronDown className="size-4 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="size-4 text-muted-foreground" />
                      )}
                    </div>
                  </div>

                  {/* Expanded JSON Data Diff View */}
                  {isExpanded ? (
                    <div className="border-t border-border bg-muted/40 p-4 space-y-3">
                      <div className="flex items-center justify-between text-xs font-semibold text-foreground">
                        <span>รายละเอียดข้อมูลที่มีการเปลี่ยนแปลง (PDPA Sanitized Payload)</span>
                        <span className="text-xs text-muted-foreground">
                          * ข้อมูลส่วนบุคคลสำคัญ (รหัสผ่าน/เลขบัตรประชาชน) ถูก Mask อัตโนมัติ
                        </span>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">
                        {/* Old Data */}
                        <div className="rounded-xl border border-border bg-card p-3 space-y-1.5 overflow-hidden">
                          <span className="text-xs font-semibold text-rose-600 dark:text-rose-400">
                            ข้อมูลก่อนหน้า (Old Data):
                          </span>
                          <pre className="max-h-60 overflow-x-auto overflow-y-auto text-xs font-mono text-muted-foreground p-2 rounded-lg bg-muted/60">
                            {log.old_data
                              ? JSON.stringify(log.old_data, null, 2)
                              : "ไม่มีข้อมูลเดิม (NULL)"}
                          </pre>
                        </div>

                        {/* New Data */}
                        <div className="rounded-xl border border-border bg-card p-3 space-y-1.5 overflow-hidden">
                          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                            ข้อมูลหลังเปลี่ยนแปลง (New Data):
                          </span>
                          <pre className="max-h-60 overflow-x-auto overflow-y-auto text-xs font-mono text-foreground p-2 rounded-lg bg-muted/60">
                            {log.new_data
                              ? JSON.stringify(log.new_data, null, 2)
                              : "ไม่มีข้อมูลใหม่ (NULL)"}
                          </pre>
                        </div>
                      </div>

                      {log.user_agent ? (
                        <p className="text-xs text-muted-foreground pt-1 truncate">
                          <strong>User Agent:</strong> {log.user_agent}
                        </p>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
