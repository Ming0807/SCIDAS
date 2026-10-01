"use client"

import { useMemo, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import {
  AlertCircle,
  Briefcase,
  CheckCircle2,
  GraduationCap,
  Layers,
  Phone,
  RefreshCw,
  Search,
  Shield,
  ShieldAlert,
  Trash2,
  UserCheck,
  UserCog,
  UserPlus,
  Users,
  UserX,
} from "lucide-react"
import { toast } from "sonner"

import {
  assignHomeroomTeacherAction,
  inviteStaffAction,
  removeStaffAction,
  updateStaffRoleAction,
  updateStaffStatusAction,
} from "@/app/actions/staff.actions"
import { MetricCard } from "@/components/dashboard/metric-card"
import { Button } from "@/components/ui/button"
import type {
  ClassroomAssignmentOption,
  StaffManagementData,
  StaffMemberItem,
  StaffRole,
} from "@/lib/staff-constants"
import { STAFF_ROLE_LABELS, STAFF_ROLES } from "@/lib/staff-constants"
import { StaffWorkloadOverview } from "./staff-workload-overview"

const ALL_ROLES: StaffRole[] = [...STAFF_ROLES]

export function StaffManager({ initialData }: { initialData?: StaffManagementData | null }) {
  const router = useRouter()
  const classrooms = useMemo(() => initialData?.classrooms ?? [], [initialData?.classrooms])
  const staffList = useMemo(() => initialData?.staff ?? [], [initialData?.staff])
  const metrics = initialData?.metrics ?? {
    totalStaff: 0,
    activeStaff: 0,
    teachersCount: 0,
    counselorsCount: 0,
    leadershipCount: 0,
    unassignedHomeroomsCount: 0,
  }
  const canManage = initialData?.canManage ?? false
  const currentUserRole = initialData?.currentUserRole ?? ""
  const currentProfileId = initialData?.currentProfileId ?? null

  const [activeTab, setActiveTab] = useState<"directory" | "assignments">("directory")
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("ALL")
  const [statusFilter, setStatusFilter] = useState<string>("ALL")
  const [editingStaff, setEditingStaff] = useState<StaffMemberItem | null>(null)
  const [newRole, setNewRole] = useState<StaffRole>("subject_teacher")
  const [roleError, setRoleError] = useState<string | null>(null)

  // Invite form state
  const [showInvite, setShowInvite] = useState(false)
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteFirstName, setInviteFirstName] = useState("")
  const [inviteLastName, setInviteLastName] = useState("")
  const [inviteRole, setInviteRole] = useState<StaffRole>("subject_teacher")
  const [inviteError, setInviteError] = useState<string | null>(null)
  const [inviteResult, setInviteResult] = useState<{ tempPassword: string } | null>(null)
  const isAdmin = currentUserRole === "admin"

  // For assignment edits
  const [classroomAssignments, setClassroomAssignments] = useState<
    Record<string, { homeroomTeacherId: string | null; coTeacherId: string | null }>
  >(() => {
    const map: Record<string, { homeroomTeacherId: string | null; coTeacherId: string | null }> = {}
    for (const c of classrooms) {
      map[c.id] = {
        homeroomTeacherId: c.homeroomTeacherId,
        coTeacherId: c.coTeacherId,
      }
    }
    return map
  })

  const [isPending, startTransition] = useTransition()

  // Filtered staff list
  const filteredStaff = useMemo(() => {
    return (staffList ?? []).filter((s) => {
      if (!s) return false
      const name = (s.fullName ?? "").toLowerCase()
      const email = (s.email ?? "").toLowerCase()
      const dept = (s.department ?? "").toLowerCase()
      const pos = (s.position ?? "").toLowerCase()
      const q = (search ?? "").toLowerCase().trim()

      const matchesSearch =
        q === "" ||
        name.includes(q) ||
        email.includes(q) ||
        dept.includes(q) ||
        pos.includes(q)

      const matchesRole = roleFilter === "ALL" || s.role === roleFilter
      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "ACTIVE" && s.isActive) ||
        (statusFilter === "INACTIVE" && !s.isActive)

      return matchesSearch && matchesRole && matchesStatus
    })
  }, [staffList, search, roleFilter, statusFilter])

  // Handlers
  const handleOpenRoleModal = (staff: StaffMemberItem) => {
    setEditingStaff(staff)
    setNewRole(ALL_ROLES.includes(staff.role as StaffRole) ? (staff.role as StaffRole) : "subject_teacher")
    setRoleError(null)
  }

  const handleSaveRole = () => {
    if (!editingStaff) return
    setRoleError(null)
    startTransition(async () => {
      const res = await updateStaffRoleAction({
        profileId: editingStaff.id,
        newRole,
      })
      if (res.ok) {
        toast.success(res.message)
        setEditingStaff(null)
        router.refresh()
      } else {
        setRoleError(res.message)
        toast.error(res.message)
      }
    })
  }

  const handleToggleStatus = (staff: StaffMemberItem) => {
    const actionText = staff.isActive ? "ระงับการใช้งาน" : "เปิดใช้งาน"
    if (!confirm(`ยืนยันการ${actionText} บัญชีของ ${staff.fullName}?`)) return

    startTransition(async () => {
      const res = await updateStaffStatusAction({
        profileId: staff.id,
        isActive: !staff.isActive,
      })
      if (res.ok) {
        toast.success(res.message)
        router.refresh()
      } else {
        toast.error(res.message)
      }
    })
  }

  const handleInvite = () => {
    setInviteError(null)
    setInviteResult(null)
    startTransition(async () => {
      const res = await inviteStaffAction({
        email: inviteEmail,
        firstName: inviteFirstName,
        lastName: inviteLastName,
        role: inviteRole,
      })
      if (res.ok && res.data) {
        toast.success(res.message)
        setInviteResult({ tempPassword: res.data.tempPassword })
        setInviteEmail("")
        setInviteFirstName("")
        setInviteLastName("")
        router.refresh()
      } else {
        setInviteError(res.message)
        toast.error(res.message)
      }
    })
  }

  const handleRemove = (staff: StaffMemberItem) => {
    if (!confirm(`ยืนยันการลบบัญชีของ ${staff.fullName}? บัญชีจะเข้าไม่ได้อีก แต่ประวัติการทำงานเดิมยังอยู่`)) return

    startTransition(async () => {
      const res = await removeStaffAction({ profileId: staff.id })
      if (res.ok) {
        toast.success(res.message)
        router.refresh()
      } else {
        toast.error(res.message)
      }
    })
  }

  const handleSaveHomeroomAssignment = (classroom: ClassroomAssignmentOption) => {
    const assignment = classroomAssignments[classroom.id]
    if (!assignment) return

    startTransition(async () => {
      const res = await assignHomeroomTeacherAction({
        classroomId: classroom.id,
        homeroomTeacherId: assignment.homeroomTeacherId,
        coTeacherId: assignment.coTeacherId,
      })
      if (res.ok) {
        toast.success(res.message)
        router.refresh()
      } else {
        toast.error(res.message)
      }
    })
  }

  const handleHomeroomSelectChange = (
    classroomId: string,
    field: "homeroomTeacherId" | "coTeacherId",
    value: string,
  ) => {
    const teacherId = value === "NONE" ? null : value
    setClassroomAssignments((prev) => ({
      ...prev,
      [classroomId]: {
        homeroomTeacherId: field === "homeroomTeacherId" ? teacherId : prev[classroomId]?.homeroomTeacherId ?? null,
        coTeacherId: field === "coTeacherId" ? teacherId : prev[classroomId]?.coTeacherId ?? null,
      },
    }))
  }

  return (
    <div className="space-y-6">
      {/* Top Metrics Cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="บุคลากรทั้งหมด"
          value={`${metrics.totalStaff} คน`}
          description={`เปิดใช้งาน ${metrics.activeStaff} คน`}
          icon={Users}
          status="normal"
          size="compact"
        />
        <MetricCard
          title="ครูผู้สอน / ครูประจำชั้น"
          value={`${metrics.teachersCount} คน`}
          description="รับผิดชอบการสอนและดูแลนักเรียน"
          icon={GraduationCap}
          status="normal"
          size="compact"
        />
        <MetricCard
          title="ครูแนะแนว (Counselors)"
          value={`${metrics.counselorsCount} คน`}
          description="ดูแลการให้คำปรึกษาและเคสส่งต่อ"
          icon={UserCheck}
          status="normal"
          size="compact"
        />
        <MetricCard
          title="ห้องเรียนที่ยังไม่มีครูประจำชั้น"
          value={`${metrics.unassignedHomeroomsCount} ห้อง`}
          description={
            metrics.unassignedHomeroomsCount > 0
              ? "ต้องการการมอบหมายเร่งด่วน"
              : "มอบหมายครบทุกห้องแล้ว"
          }
          icon={AlertCircle}
          status={metrics.unassignedHomeroomsCount > 0 ? "high-risk" : "normal"}
          size="compact"
        />
      </div>

      {/* Homeroom Coverage Banner & Teacher Workload Card */}
      <StaffWorkloadOverview
        classrooms={classrooms}
        staffList={staffList}
        onGoToAssignments={() => setActiveTab("assignments")}
      />

      {/* Tabs Switcher */}
      <div className="flex border-b border-border" role="tablist" aria-label="จัดการบุคลากร">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "directory"}
          onClick={() => setActiveTab("directory")}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
            activeTab === "directory"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Users className="size-4" />
          รายชื่อบุคลากรและสิทธิ์ ({staffList.length})
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "assignments"}
          onClick={() => setActiveTab("assignments")}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
            activeTab === "assignments"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Layers className="size-4" />
          มอบหมายครูประจำชั้นรายห้อง ({classrooms.length})
          {metrics.unassignedHomeroomsCount > 0 && (
            <span className="rounded-full bg-rose-100 px-1.5 py-0.5 text-xs font-semibold text-rose-700 dark:bg-rose-950 dark:text-rose-300">
              {metrics.unassignedHomeroomsCount}
            </span>
          )}
        </button>
      </div>

      {/* Tab 1: Staff Directory */}
      {activeTab === "directory" && (
        <div className="space-y-4">
          {canManage ? (
            <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
              <button
                type="button"
                onClick={() => setShowInvite((v) => !v)}
                className="flex w-full items-center justify-between gap-2 text-left"
              >
                <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <UserPlus className="size-4 text-primary" />
                  เพิ่มบุคลากรใหม่
                </span>
                <span className="text-xs text-muted-foreground">{showInvite ? "ซ่อนฟอร์ม" : "แสดงฟอร์ม"}</span>
              </button>

              {showInvite ? (
                <div className="mt-3 space-y-3 border-t border-border pt-3">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="block space-y-1.5">
                      <span className="text-xs font-medium text-foreground">อีเมล <span className="text-destructive">*</span></span>
                      <input
                        type="email"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        placeholder="teacher@school.ac.th"
                        disabled={isPending}
                        className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </label>
                    <label className="block space-y-1.5">
                      <span className="text-xs font-medium text-foreground">บทบาทสิทธิ์</span>
                      <select
                        value={inviteRole}
                        onChange={(e) => setInviteRole(e.target.value as StaffRole)}
                        disabled={isPending}
                        className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      >
                        {ALL_ROLES.map((r) => (
                          <option key={r} value={r}>
                            {STAFF_ROLE_LABELS[r]}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="block space-y-1.5">
                      <span className="text-xs font-medium text-foreground">ชื่อ <span className="text-destructive">*</span></span>
                      <input
                        type="text"
                        value={inviteFirstName}
                        onChange={(e) => setInviteFirstName(e.target.value)}
                        placeholder="เช่น สมชาย"
                        disabled={isPending}
                        className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </label>
                    <label className="block space-y-1.5">
                      <span className="text-xs font-medium text-foreground">นามสกุล <span className="text-destructive">*</span></span>
                      <input
                        type="text"
                        value={inviteLastName}
                        onChange={(e) => setInviteLastName(e.target.value)}
                        placeholder="เช่น ใจดี"
                        disabled={isPending}
                        className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </label>
                  </div>

                  {inviteError ? (
                    <p role="alert" className="text-xs font-medium text-destructive">
                      {inviteError}
                    </p>
                  ) : null}

                  {inviteResult ? (
                    <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-3 text-xs text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200">
                      <p className="font-semibold">สร้างบัญชีเรียบร้อย — รหัสผ่านชั่วคราว (แสดงครั้งเดียว):</p>
                      <p className="mt-1 font-mono text-sm font-bold tracking-wider">{inviteResult.tempPassword}</p>
                      <p className="mt-1">แจ้งให้เจ้าตัวเข้าสู่ระบบแล้วเปลี่ยนรหัสผ่านทันที</p>
                    </div>
                  ) : null}

                  <Button type="button" size="sm" disabled={isPending} onClick={handleInvite} className="gap-1.5">
                    <UserPlus className="size-3.5" />
                    {isPending ? "กำลังสร้างบัญชี..." : "สร้างบัญชีบุคลากร"}
                  </Button>
                </div>
              ) : null}
            </div>
          ) : null}

          {/* Filter Toolbar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <label htmlFor="staff-search" className="sr-only">
                ค้นหาบุคลากร
              </label>
              <input
                id="staff-search"
                type="text"
                placeholder="ค้นหาตามชื่อ, อีเมล, กลุ่มสาระ หรือตำแหน่ง..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-input bg-background pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="rounded-xl border border-input bg-background px-3 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="ALL">ทุกบทบาทสิทธิ์</option>
                {ALL_ROLES.map((r) => (
                  <option key={r} value={r}>
                    {STAFF_ROLE_LABELS[r]}
                  </option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-xl border border-input bg-background px-3 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="ALL">ทุกสถานะ</option>
                <option value="ACTIVE">เปิดใช้งาน (Active)</option>
                <option value="INACTIVE">ระงับการใช้งาน (Inactive)</option>
              </select>
            </div>
          </div>

          {/* Staff Cards / List */}
          {filteredStaff.length === 0 ? (
            <div className="rounded-2xl border border-border bg-card p-12 text-center">
              <UserX className="mx-auto size-10 text-muted-foreground/60" />
              <h3 className="mt-3 text-sm font-semibold text-foreground">ไม่พบบุคลากรตามเงื่อนไขที่เลือก</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                ลองปรับเปลี่ยนคำค้นหาหรือตัวกรองบทบาทสิทธิ์
              </p>
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {filteredStaff.map((staff) => {
                const isSelf = currentProfileId
                  ? staff.id === currentProfileId
                  : staff.id === staffList.find((s) => s.role === currentUserRole)?.id

                return (
                  <div
                    key={staff.id}
                    className={`rounded-2xl border p-4 shadow-xs transition-all flex flex-col justify-between ${
                      staff.isActive
                        ? "border-border bg-card hover:border-primary/40"
                        : "border-border/60 bg-muted/30 opacity-75"
                    }`}
                  >
                    <div className="space-y-3">
                      {/* Header row */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary font-semibold text-sm">
                            {(staff?.firstName || staff?.fullName || "ค").slice(0, 1)}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                              {staff?.fullName || "ไม่ระบุชื่อ"}
                              {!staff.isActive && (
                                <span className="rounded-md bg-rose-100 px-1.5 py-0.2 text-xs text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                                  ระงับ
                                </span>
                              )}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {staff?.position || staff?.department || "บุคลากรการศึกษา"}
                            </p>
                          </div>
                        </div>

                        <span
                          className={`inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-xs font-medium ${
                            staff.role === "admin"
                              ? "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300"
                              : staff.role === "director"
                                ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300"
                                : staff.role === "counselor"
                                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                                  : staff.role === "homeroom_teacher"
                                    ? "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                                    : "bg-muted text-muted-foreground"
                          }`}
                        >
                          <Shield className="size-3" />
                          {staff?.roleLabel || staff?.role || "บุคลากร"}
                        </span>
                      </div>

                      {/* Contact and Department */}
                      <div className="space-y-1 text-xs text-muted-foreground pt-1">
                        {staff.department && (
                          <p className="flex items-center gap-1.5">
                            <Briefcase className="size-3.5 shrink-0" />
                            {staff.department}
                          </p>
                        )}
                        {staff.phone && (
                          <p className="flex items-center gap-1.5">
                            <Phone className="size-3.5 shrink-0" />
                            {staff.phone}
                          </p>
                        )}
                      </div>

                      {/* Assigned Homerooms */}
                      <div className="pt-2 border-t border-border">
                        <p className="text-xs font-medium text-foreground mb-1.5">
                          ห้องเรียนที่ดูแลรับผิดชอบ:
                        </p>
                        {(!staff.assignedClassrooms || staff.assignedClassrooms.length === 0) ? (
                          <p className="text-xs text-muted-foreground italic">
                            ไม่ได้เป็นครูประจำชั้นห้องใด
                          </p>
                        ) : (
                          <div className="flex flex-wrap gap-1">
                            {(staff.assignedClassrooms ?? []).map((ac) => (
                              <span
                                key={ac.classroomId}
                                className={`rounded-md px-2 py-0.5 text-xs font-medium ${
                                  ac.assignmentType === "homeroom"
                                    ? "bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300"
                                    : "bg-muted text-muted-foreground"
                                }`}
                              >
                                {ac.classroomName}{" "}
                                {ac.assignmentType === "homeroom" ? "(ที่ปรึกษาหลัก)" : "(ร่วม)"}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions bar */}
                    {canManage && (
                      <div className="pt-3 mt-3 border-t border-border flex items-center justify-between gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={isPending}
                          onClick={() => handleOpenRoleModal(staff)}
                          className="text-xs gap-1 h-8 flex-1"
                        >
                          <UserCog className="size-3.5" />
                          เปลี่ยนบทบาทสิทธิ์
                        </Button>

                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          disabled={isPending || isSelf}
                          onClick={() => handleToggleStatus(staff)}
                          className={`text-xs h-8 px-2.5 ${
                            staff.isActive
                              ? "text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                              : "text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                          }`}
                          title={isSelf ? "ไม่สามารถระงับบัญชีของตนเองได้" : undefined}
                        >
                          {staff.isActive ? "ระงับ" : "เปิดใช้"}
                        </Button>

                        {isAdmin && !isSelf ? (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            disabled={isPending}
                            onClick={() => handleRemove(staff)}
                            className="text-xs h-8 px-2.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            title="ลบบัญชีผู้ใช้ (เฉพาะผู้ดูแลระบบ)"
                          >
                            <Trash2 className="size-3.5" />
                            ลบ
                          </Button>
                        ) : null}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Homeroom Assignments */}
      {activeTab === "assignments" && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-4">
              <div>
                <h3 className="text-base font-semibold text-foreground">
                  กำหนดครูประจำชั้นและครูผู้ช่วย (Homeroom & Co-Teacher)
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  ครูประจำชั้นจะได้รับสิทธิ์เข้าถึงข้อมูลระเบียน เช็คชื่อ บันทึกพฤติกรรม และคัดกรอง SDQ ของนักเรียนในห้องนั้นๆ
                </p>
              </div>

              {metrics.unassignedHomeroomsCount > 0 && (
                <div className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-3 py-1.5 rounded-xl border border-amber-200 dark:border-amber-800/50 font-medium">
                  <ShieldAlert className="size-4 shrink-0" />
                  ยังขาดครูประจำชั้น {metrics.unassignedHomeroomsCount} ห้อง
                </div>
              )}
            </div>

            <div className="divide-y divide-border mt-2">
              {classrooms.map((room) => {
                const currentAssignment = classroomAssignments[room.id] || {
                  homeroomTeacherId: room.homeroomTeacherId,
                  coTeacherId: room.coTeacherId,
                }

                const isModified =
                  currentAssignment.homeroomTeacherId !== room.homeroomTeacherId ||
                  currentAssignment.coTeacherId !== room.coTeacherId

                return (
                  <div
                    key={room.id}
                    className="py-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                  >
                    <div className="space-y-1 min-w-[200px]">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-foreground">
                          {room.name}
                        </span>
                        {!currentAssignment.homeroomTeacherId && (
                          <span className="rounded-md bg-rose-100 px-1.5 py-0.5 text-xs font-semibold text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                            ยังไม่มีครูประจำชั้น
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        ระดับชั้น: ม.{room.gradeLevel} ห้อง {room.section}
                      </p>
                    </div>

                    <div className="flex-1 grid gap-3 sm:grid-cols-2 max-w-2xl">
                      {/* Homeroom teacher select */}
                      <div>
                        <label className="block text-xs font-medium text-foreground mb-1">
                          ครูประจำชั้น (ที่ปรึกษาหลัก)
                        </label>
                        <select
                          disabled={!canManage || isPending}
                          value={currentAssignment.homeroomTeacherId ?? "NONE"}
                          onChange={(e) =>
                            handleHomeroomSelectChange(room.id, "homeroomTeacherId", e.target.value)
                          }
                          className="w-full rounded-xl border border-input bg-background px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
                        >
                          <option value="NONE">-- ยังไม่ระบุ --</option>
                          {(staffList ?? [])
                            .filter((s) => s && s.isActive)
                            .map((s) => (
                              <option key={s.id} value={s.id}>
                                {s.fullName || "ไม่ระบุชื่อ"} ({s.roleLabel || s.role || "บุคลากร"})
                              </option>
                            ))}
                        </select>
                      </div>

                      {/* Co-teacher select */}
                      <div>
                        <label className="block text-xs font-medium text-foreground mb-1">
                          ครูที่ปรึกษาร่วม / ครูผู้ช่วย
                        </label>
                        <select
                          disabled={!canManage || isPending}
                          value={currentAssignment.coTeacherId ?? "NONE"}
                          onChange={(e) =>
                            handleHomeroomSelectChange(room.id, "coTeacherId", e.target.value)
                          }
                          className="w-full rounded-xl border border-input bg-background px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
                        >
                          <option value="NONE">-- ไม่มี / ไม่ระบุ --</option>
                          {(staffList ?? [])
                            .filter((s) => s && s.isActive)
                            .map((s) => (
                              <option key={s.id} value={s.id}>
                                {s.fullName || "ไม่ระบุชื่อ"} ({s.roleLabel || s.role || "บุคลากร"})
                              </option>
                            ))}
                        </select>
                      </div>
                    </div>

                    {/* Action button */}
                    {canManage && (
                      <div className="flex items-center justify-end">
                        <Button
                          type="button"
                          size="sm"
                          variant={isModified ? "default" : "outline"}
                          disabled={isPending || !isModified}
                          onClick={() => handleSaveHomeroomAssignment(room)}
                          className="text-xs gap-1.5 h-8 min-w-[90px]"
                        >
                          {isPending ? (
                            <RefreshCw className="size-3.5 animate-spin" />
                          ) : (
                            <CheckCircle2 className="size-3.5" />
                          )}
                          {isModified ? "บันทึก" : "บันทึกแล้ว"}
                        </Button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Role Edit Modal */}
      {editingStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl space-y-4">
            <div>
              <h3 className="text-base font-semibold text-foreground">
                ปรับเปลี่ยนบทบาทและสิทธิ์ของบุคลากร
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                กำหนดสิทธิ์การเข้าถึงข้อมูลของ <strong>{editingStaff.fullName}</strong>
              </p>
            </div>

            {currentProfileId === editingStaff.id && currentUserRole === "admin" && (
              <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-3 text-xs text-amber-700 dark:text-amber-400 flex items-start gap-2">
                <AlertCircle className="size-4 shrink-0 mt-0.5" />
                <span>คุณกำลังดูบัญชีตนเอง: ระบบไม่อนุญาตให้ลดสิทธิ์ผู้ดูแลระบบ (admin) ของตนเองเพื่อความปลอดภัย</span>
              </div>
            )}

            {roleError && (
              <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-3 text-xs text-destructive flex items-start gap-2">
                <AlertCircle className="size-4 shrink-0 mt-0.5" />
                <span>{roleError}</span>
              </div>
            )}

            <div className="space-y-2">
              <label className="block text-xs font-medium text-foreground">
                เลือกบทบาทสิทธิ์ใหม่:
              </label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as StaffRole)}
                className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {ALL_ROLES.map((r) => (
                  <option key={r} value={r}>
                    {STAFF_ROLE_LABELS[r]}
                  </option>
                ))}
              </select>
            </div>

            <div className="rounded-xl bg-muted/60 p-3 text-xs text-muted-foreground space-y-1">
              <p className="font-medium text-foreground">คำอธิบายสิทธิ์:</p>
              <p>• <strong>ผู้ดูแลระบบ / ผู้อำนวยการ</strong>: เข้าถึงทุกเมนู บันทึกความปลอดภัย และจัดการบุคลากร</p>
              <p>• <strong>ครูแนะแนว</strong>: จัดการเคสส่งต่อ ให้คำปรึกษา และดูแบบประเมิน SDQ ทุกห้อง</p>
              <p>• <strong>ครูที่ปรึกษา</strong>: เช็คชื่อ คัดกรอง และดูนักเรียนในห้องที่ตนเองรับผิดชอบ</p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isPending}
                onClick={() => setEditingStaff(null)}
                className="text-xs"
              >
                ยกเลิก
              </Button>
              <Button
                type="button"
                size="sm"
                disabled={isPending || newRole === editingStaff.role}
                onClick={handleSaveRole}
                className="text-xs gap-1.5"
              >
                {isPending && <RefreshCw className="size-3.5 animate-spin" />}
                ยืนยันการเปลี่ยนสิทธิ์
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
