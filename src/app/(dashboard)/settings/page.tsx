import React from "react"
import { Clock, Mail, Phone, Shield } from "lucide-react"

import { PageShell } from "@/components/dashboard/page-shell"
import { PageHeader } from "@/components/dashboard/page-header"
import { ErrorState } from "@/components/feedback/error-state"
import { getUserProfile } from "@/lib/server/settings-read-models"
import { formatThaiDateTime } from "@/lib/student-care-formatters"

export default async function SettingsPage() {
  let profile: Awaited<ReturnType<typeof getUserProfile>>

  try {
    profile = await getUserProfile()
  } catch {
    return (
      <PageShell>
        <ErrorState
          title="ไม่สามารถโหลดข้อมูลผู้ใช้ได้"
          description="กรุณาลองใหม่อีกครั้ง หรือตรวจสอบการเชื่อมต่อ"
        />
      </PageShell>
    )
  }

  return (
    <PageShell>
      <PageHeader
        title="ตั้งค่า"
        description="จัดการการตั้งค่าระบบ และข้อมูลส่วนตัว"
      />

      {/* Main Grid Layout */}
      <div className="flex flex-col xl:flex-row gap-6">
        {/* Left Column — Settings Sections */}
        <div className="flex-1 min-w-0 space-y-6">
          {/* General Settings */}
          <section className="bg-card rounded-xl border border-border shadow-sm p-6">
            <h2 className="text-base font-semibold text-foreground mb-4">
              ข้อมูลทั่วไป
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground">
                  ชื่อ
                </label>
                <p className="text-sm font-medium text-foreground mt-1">
                  {profile.firstName}
                </p>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">
                  นามสกุล
                </label>
                <p className="text-sm font-medium text-foreground mt-1">
                  {profile.lastName}
                </p>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">
                  บทบาท
                </label>
                <p className="text-sm font-medium text-foreground mt-1">
                  {profile.roleLabel}
                </p>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">
                  โรงเรียน
                </label>
                <p className="text-sm font-medium text-foreground mt-1">
                  {profile.schoolName ?? "-"}
                </p>
              </div>
            </div>
          </section>

          {/* Contact Section */}
          <section className="bg-card rounded-xl border border-border shadow-sm p-6">
            <h2 className="text-base font-semibold text-foreground mb-4">
              ข้อมูลติดต่อ
            </h2>
            <div className="flex flex-col gap-4 text-sm">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
                <span className="text-muted-foreground w-24">อีเมล</span>
                <span className="text-foreground font-medium">
                  {profile.email ?? "-"}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-muted-foreground shrink-0" />
                <span className="text-muted-foreground w-24">เบอร์โทรศัพท์</span>
                <span className="text-foreground font-medium">
                  {profile.phone ?? "-"}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-muted-foreground shrink-0" />
                <span className="text-muted-foreground w-24">
                  เข้าสู่ระบบล่าสุด
                </span>
                <span className="text-foreground font-medium">
                  {profile.lastSignIn
                    ? formatThaiDateTime(profile.lastSignIn)
                    : "-"}
                </span>
              </div>
            </div>
          </section>

          {/* Security Banner */}
          <div className="bg-primary/90 rounded-xl p-8 text-primary-foreground relative overflow-hidden flex items-center justify-between">
            <div className="relative z-10 max-w-sm">
              <h3 className="text-xl font-bold mb-2">
                ระบบปลอดภัย มั่นใจได้
              </h3>
              <p className="text-primary-foreground/80 text-sm">
                ข้อมูลได้รับการปกป้องตามมาตรฐานความปลอดภัย
              </p>
            </div>
            <div className="w-24 h-24 rounded-full border-4 border-primary-foreground/20 flex items-center justify-center relative z-10 shrink-0">
              <Shield className="w-10 h-10 text-primary-foreground/60" />
            </div>
          </div>
        </div>

        {/* Right Column — Profile Card */}
        <div className="xl:w-[320px] shrink-0">
          <div className="bg-card rounded-xl border border-border shadow-sm p-6">
            <h3 className="text-sm font-semibold text-foreground mb-6">
              ข้อมูลบัญชีผู้ใช้
            </h3>

            <div className="flex flex-col items-center mb-6">
              <div className="w-20 h-20 rounded-full bg-muted border-4 border-background shadow-sm overflow-hidden mb-4 flex items-center justify-center">
                {profile.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={profile.avatarUrl}
                    alt={profile.fullName}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <span className="text-2xl font-bold text-muted-foreground">
                    {profile.firstName.charAt(0)}
                    {profile.lastName.charAt(0)}
                  </span>
                )}
              </div>
              <h4 className="text-base font-semibold text-foreground">
                {profile.fullName}
              </h4>
              <span className="text-sm text-muted-foreground">
                {profile.roleLabel}
              </span>
              {profile.schoolName ? (
                <span className="text-xs text-muted-foreground">
                  {profile.schoolName}
                </span>
              ) : null}
            </div>

            <div className="flex flex-col gap-4 text-sm">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
                <span className="text-muted-foreground truncate">
                  {profile.email ?? "-"}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-muted-foreground shrink-0" />
                <span className="text-muted-foreground">
                  {profile.phone ?? "-"}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-muted-foreground shrink-0" />
                <span className="text-muted-foreground text-xs">
                  {profile.lastSignIn
                    ? formatThaiDateTime(profile.lastSignIn)
                    : "-"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  )
}
