import { Clock, Mail, Shield } from "lucide-react"

import { ErrorState } from "@/components/feedback/error-state"
import { PageHeader } from "@/components/dashboard/page-header"
import { PageShell } from "@/components/dashboard/page-shell"
import { formatThaiDateTime } from "@/lib/student-care-formatters"
import { getUserProfile } from "@/lib/server/settings-read-models"

import { ProfileSettingsForm } from "./settings-forms"

export default async function SettingsPage() {
  const profile = await loadUserProfile()
  if (!profile) {
    return <PageShell><ErrorState title="ไม่สามารถโหลดการตั้งค่าได้" description="กรุณาลองใหม่อีกครั้ง หรือตรวจสอบการเชื่อมต่อ" /></PageShell>
  }

  return (
      <PageShell>
        <PageHeader title="ตั้งค่า" description="จัดการข้อมูลส่วนตัวและการตั้งค่าที่บันทึกไว้สำหรับบัญชีของคุณ" />
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="min-w-0 space-y-6">
            <section className="rounded-xl border border-border bg-card p-5 shadow-sm sm:p-6" aria-labelledby="profile-settings-title">
              <div className="mb-5">
                <h2 id="profile-settings-title" className="text-base font-semibold">ข้อมูลส่วนตัว</h2>
                <p className="mt-1 text-sm text-muted-foreground">แก้ไขได้เฉพาะข้อมูลของผู้ใช้ปัจจุบัน</p>
              </div>
              <ProfileSettingsForm profile={profile} />
            </section>

          </div>

          <aside className="space-y-6">
            <section className="rounded-xl border border-border bg-card p-5 shadow-sm" aria-labelledby="account-summary-title">
              <h2 id="account-summary-title" className="text-base font-semibold">ข้อมูลบัญชี</h2>
              <div className="mt-5 flex items-center gap-3">
                <Avatar url={profile.avatarUrl} name={profile.fullName} />
                <div className="min-w-0"><p className="truncate font-semibold">{profile.fullName || "ไม่ระบุชื่อ"}</p><p className="truncate text-sm text-muted-foreground">{profile.roleLabel}</p></div>
              </div>
              <dl className="mt-5 space-y-3 text-sm">
                <InfoRow icon={Mail} label="อีเมล" value={profile.email ?? "-"} />
                <InfoRow icon={Shield} label="โรงเรียน" value={profile.schoolName ?? "-"} />
                <InfoRow icon={Clock} label="เข้าสู่ระบบล่าสุด" value={profile.lastSignIn ? formatThaiDateTime(profile.lastSignIn) : "-"} />
              </dl>
              <p className="mt-5 border-t border-border pt-4 text-xs leading-5 text-muted-foreground">บทบาท โรงเรียน และสถานะการใช้งานเปลี่ยนได้โดยผู้ดูแลระบบเท่านั้น</p>
            </section>
          </aside>
        </div>
      </PageShell>
  )
}

async function loadUserProfile() {
  try {
    return await getUserProfile()
  } catch {
    return null
  }
}

function Avatar({ url, name }: { url: string | null; name: string }) {
  if (!url) return <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-muted text-lg font-semibold text-muted-foreground">{name.slice(0, 1) || "?"}</div>
  // Profile avatar URLs are user-editable and cannot be passed to next/image without remote host config.
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={url} alt={name} className="size-14 rounded-full border border-border object-cover" referrerPolicy="no-referrer" />
}

function InfoRow({ icon: Icon, label, value }: { icon: typeof Mail; label: string; value: string }) {
  return <div className="flex min-w-0 items-start gap-3"><Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" /><dt className="w-24 shrink-0 text-muted-foreground">{label}</dt><dd className="min-w-0 break-words font-medium">{value}</dd></div>
}
