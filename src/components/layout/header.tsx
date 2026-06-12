"use client"

import { Bell, Menu, Calendar } from "lucide-react"
import Link from "next/link"
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Sidebar } from "@/components/layout/sidebar"

type ProfileProps = {
  fullName: string
  firstName: string
  lastName: string
  roleLabel: string
  schoolName: string | null
  avatarUrl: string | null
}

export function Header({
  role,
  profile,
  unreadCount = 0,
}: {
  role?: string | null
  profile?: ProfileProps | null
  unreadCount?: number
}) {
  const schoolName = profile?.schoolName ?? null
  const initials = profile
    ? (profile.firstName.charAt(0) + profile.lastName.charAt(0)).toUpperCase()
    : "?"

  return (
    <header className="sticky top-0 z-30 flex h-14 md:h-20 w-full items-center justify-between px-4 md:px-8 bg-white border-b border-slate-100">
      <div className="flex items-center gap-4 lg:hidden">
        <Sheet>
          <SheetTrigger
            render={
              <button className="text-slate-500 hover:text-slate-900 transition-colors">
                <Menu className="h-5 w-5" />
                <span className="sr-only">เปิดปิดเมนูด้านข้าง</span>
              </button>
            }
          />
          <SheetContent side="left" className="p-0 w-[280px]">
            <SheetTitle className="sr-only">เมนูหลัก</SheetTitle>
            <SheetDescription className="sr-only">เมนูนำทางหลักของระบบ</SheetDescription>
            <Sidebar role={role} schoolName={schoolName} />
          </SheetContent>
        </Sheet>
      </div>

      <div className="hidden lg:flex items-center min-w-0 shrink-0">
        <h1 className="text-xl font-bold text-foreground tracking-tight truncate">
          ภาพรวมระบบ
        </h1>
      </div>

      <div className="flex items-center gap-4 shrink-0 min-w-0">
        {/* Today's date */}
        <div className="hidden 2xl:flex items-center gap-2 h-9 px-4 rounded-full border border-slate-200 bg-white shrink-0">
          <Calendar className="h-4 w-4 text-slate-400" />
          <span className="text-sm font-medium text-slate-600">
            {new Intl.DateTimeFormat("th-TH", {
              day: "numeric",
              month: "long",
              year: "numeric",
            }).format(new Date())}
          </span>
        </div>

        {/* Notification bell — real link */}
        <Link
          href="/notifications"
          className="relative p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-colors group"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 ? (
            <span className="absolute top-0.5 right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white ring-2 ring-white">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          ) : null}
          <span className="sr-only">การแจ้งเตือน</span>
        </Link>

        {/* Profile — real data or fallback */}
        <div className="flex items-center gap-3 pl-2 border-l border-slate-100">
          <div className="h-9 w-9 rounded-full bg-primary/10 border border-border flex items-center justify-center shrink-0 overflow-hidden">
            {profile?.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.avatarUrl}
                alt={profile.fullName}
                className="h-full w-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <span className="text-sm font-bold text-primary">{initials}</span>
            )}
          </div>
          <div className="hidden xl:flex flex-col items-start shrink-0">
            <span className="text-sm font-bold text-slate-800 leading-none">
              {profile?.fullName ?? "กำลังโหลด..."}
            </span>
            <span className="text-xs text-muted-foreground mt-1.5 leading-none">
              {profile?.roleLabel ?? ""}
              {profile?.schoolName ? ` · ${profile.schoolName}` : ""}
            </span>
          </div>
        </div>
      </div>
    </header>
  )
}
