import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav"
import { RealtimeProvider } from "@/components/providers/realtime-provider"
import { getUserRole } from "@/utils/supabase/server"
import { getUserProfile } from "@/lib/server/settings-read-models"
import { getNotificationCounts } from "@/lib/server/notification-read-models"
import { getCurrentUserContext } from "@/lib/server/current-user"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const role = await getUserRole()

  let profile: Awaited<ReturnType<typeof getUserProfile>> | null = null
  let unreadCount = 0
  let contextSchoolId: string | null = null
  let contextUserId: string | null = null

  try {
    const [p, n, ctx] = await Promise.all([
      getUserProfile(),
      getNotificationCounts().catch(() => ({ total: 0, unread: 0, byType: {} as Record<string, number> })),
      getCurrentUserContext().catch(() => null),
    ])
    profile = p
    unreadCount = n.unread
    contextSchoolId = ctx?.schoolId ?? null
    contextUserId = ctx?.userId ?? null
  } catch {
    // fallback
  }

  return (
    <RealtimeProvider
      initialUnreadCount={unreadCount}
      schoolId={contextSchoolId}
      userId={contextUserId}
    >
      <div className="flex h-screen overflow-hidden bg-background md:bg-slate-50">
        <div className="hidden md:block">
          <Sidebar role={role} schoolName={profile?.schoolName ?? null} />
        </div>
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <Header
            role={role}
            unreadCount={unreadCount}
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
          <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
            <div className="h-full animate-fade-in w-full max-w-full">
              {children}
            </div>
          </main>
        </div>
        <MobileBottomNav />
      </div>
    </RealtimeProvider>
  )
}
