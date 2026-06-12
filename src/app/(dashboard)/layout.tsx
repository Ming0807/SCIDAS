import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav"
import { getUserRole } from "@/utils/supabase/server"
import { getUserProfile } from "@/lib/server/settings-read-models"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const role = await getUserRole()

  let profile: Awaited<ReturnType<typeof getUserProfile>> | null = null
  try {
    profile = await getUserProfile()
  } catch {
    // fallback — header shows minimal UI
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background md:bg-slate-50">
      <div className="hidden md:block">
        <Sidebar role={role} schoolName={profile?.schoolName ?? null} />
      </div>
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="hidden md:block">
          <Header
            role={role}
            profile={
              profile
                ? {
                    fullName: profile.fullName,
                    firstName: profile.firstName,
                    lastName: profile.lastName,
                    roleLabel: profile.roleLabel,
                    schoolName: profile.schoolName,
                    avatarUrl: profile.avatarUrl,
                  }
                : null
            }
          />
        </div>
        <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
          <div className="h-full animate-fade-in w-full max-w-full">
            {children}
          </div>
        </main>
      </div>
      <MobileBottomNav />
    </div>
  )
}
