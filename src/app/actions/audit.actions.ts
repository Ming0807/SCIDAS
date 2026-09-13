"use server"

import type { ActionResult } from "@/lib/server/action-result"
import { actionFail, actionOk } from "@/lib/server/action-result"
import { getCurrentUserContext } from "@/lib/server/current-user"
import type { Database, Json } from "@/types/database.types"
import { createClient } from "@/utils/supabase/server"

export type AuditAction = Database["public"]["Enums"]["audit_action"]

export type AuditLogItem = {
  id: string
  action: AuditAction
  table_name: string
  record_id: string | null
  school_id: string | null
  user_id: string | null
  actor_name: string | null
  actor_role: string | null
  ip_address: string | null
  user_agent: string | null
  old_data: Json | null
  new_data: Json | null
  created_at: string
}

export type AuditFilterParams = {
  action?: string
  tableName?: string
  search?: string
  limit?: number
  offset?: number
}

export type AuditMetrics = {
  totalEvents: number
  mutationEvents: number
  exportEvents: number
  authEvents: number
}

export type AuditLogsResponse = {
  items: AuditLogItem[]
  metrics: AuditMetrics
  total: number
}

const AUDIT_ACCESS_ROLES = new Set(["admin", "director"])

export async function getAuditLogsAction(
  filters?: AuditFilterParams,
): Promise<ActionResult<AuditLogsResponse>> {
  try {
    const context = await getCurrentUserContext()
    if (!context.schoolId) {
      return actionFail("UNAUTHORIZED", "กรุณาเข้าสู่ระบบก่อนดำเนินการ")
    }

    if (!AUDIT_ACCESS_ROLES.has(context.role)) {
      return actionFail(
        "FORBIDDEN",
        "คุณไม่มีสิทธิ์เข้าถึงบันทึกการตรวจสอบความปลอดภัยและ PDPA (เฉพาะผู้ดูแลระบบและผู้บริหารเท่านั้น)",
      )
    }

    const client = await createClient()
    const limit = filters?.limit ?? 50
    const offset = filters?.offset ?? 0

    let query = client
      .from("audit_logs")
      .select(
        `
        id,
        action,
        table_name,
        record_id,
        school_id,
        user_id,
        ip_address,
        user_agent,
        old_data,
        new_data,
        created_at,
        actor:profiles!audit_logs_user_id_fkey(first_name, last_name, role)
      `,
        { count: "exact" },
      )
      .eq("school_id", context.schoolId)
      .order("created_at", { ascending: false })

    if (filters?.action && filters.action !== "ALL") {
      query = query.eq("action", filters.action as AuditAction)
    }

    if (filters?.tableName && filters.tableName !== "ALL") {
      query = query.eq("table_name", filters.tableName)
    }

    query = query.range(offset, offset + limit - 1)

    const { data, count, error } = await query

    if (error) {
      console.error("Error fetching audit logs:", error)
      return actionFail("INTERNAL_ERROR", "ไม่สามารถดึงข้อมูลบันทึกความปลอดภัยได้")
    }

    type RawAuditRow = {
      id: string
      action: AuditAction
      table_name: string
      record_id: string | null
      school_id: string | null
      user_id: string | null
      ip_address: unknown
      user_agent: string | null
      old_data: Json | null
      new_data: Json | null
      created_at: string
      actor: {
        first_name: string
        last_name: string
        role: string
      } | null
    }

    const rows = (data as unknown as RawAuditRow[]) ?? []

    const items: AuditLogItem[] = rows
      .map((row) => ({
        id: row.id,
        action: row.action,
        table_name: row.table_name,
        record_id: row.record_id,
        school_id: row.school_id,
        user_id: row.user_id,
        actor_name: row.actor ? `${row.actor.first_name} ${row.actor.last_name}` : "ระบบอัตโนมัติ",
        actor_role: row.actor?.role ?? null,
        ip_address: typeof row.ip_address === "string" ? row.ip_address : null,
        user_agent: row.user_agent,
        old_data: row.old_data,
        new_data: row.new_data,
        created_at: row.created_at,
      }))
      .filter((item) => {
        if (!filters?.search) return true
        const s = filters.search.toLowerCase()
        return (
          item.table_name.toLowerCase().includes(s) ||
          (item.actor_name && item.actor_name.toLowerCase().includes(s)) ||
          (item.record_id && item.record_id.toLowerCase().includes(s)) ||
          item.action.toLowerCase().includes(s)
        )
      })

    // Calculate metrics
    const totalEvents = count ?? items.length
    const mutationEvents = items.filter((i) =>
      ["INSERT", "UPDATE", "DELETE"].includes(i.action),
    ).length
    const exportEvents = items.filter((i) => i.action === "EXPORT").length
    const authEvents = items.filter((i) =>
      ["LOGIN", "LOGOUT"].includes(i.action),
    ).length

    return actionOk("ดึงข้อมูลบันทึกความปลอดภัยสำเร็จ", {
      data: {
        items,
        total: totalEvents,
        metrics: {
          totalEvents,
          mutationEvents,
          exportEvents,
          authEvents,
        },
      },
    })
  } catch (error) {
    console.error("Unexpected error in getAuditLogsAction:", error)
    return actionFail("INTERNAL_ERROR", "เกิดข้อผิดพลาดในการดึงบันทึกความปลอดภัย")
  }
}
