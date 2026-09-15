"use client"

import {
  Bell,
  Building,
  Calendar,
  ChevronDown,
  Loader2,
  LogOut,
  Menu,
  Search,
  Settings,
  ShieldCheck,
  Users,
  BookOpen,
} from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { toast } from "sonner"

import { signOutAction } from "@/app/actions/auth.actions"
import { CommandPalette } from "@/components/layout/command-palette"
import { Sidebar } from "@/components/layout/sidebar"
import { useRealtime } from "@/components/providers/realtime-provider"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { getNavigationLabel } from "@/lib/navigation"
import { cn } from "@/lib/utils"
import { createClient } from "@/utils/supabase/client"

type ProfileProps = {
  fullName: string
  firstName: string
  lastName: string
  roleLabel: string
  schoolName: string | null
  avatarUrl: string | null
  email?: string | null
}

export function Header({
  role,
  profile,
  unreadCount: initialUnreadCount = 0,
}: {
  role?: string | null
  profile?: ProfileProps | null
  unreadCount?: number
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [paletteOpen, setPaletteOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)

  const { unreadNotificationsCount } = useRealtime()
  const unreadCount = unreadNotificationsCount ?? initialUnreadCount
  const schoolName = profile?.schoolName ?? null
  const pageTitle = getNavigationLabel(pathname) ?? "ระบบดูแลช่วยเหลือนักเรียน"
  const initials = profile
    ? (profile.firstName.charAt(0) + profile.lastName.charAt(0)).toUpperCase()
    : "?"

  const isAdminOrDirector = role === "admin" || role === "director"
  const canAccessStaff = isAdminOrDirector || role === "counselor"

  // Shortcut Ctrl+K and /
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setPaletteOpen((prev) => !prev)
        return
      }

      if (
        e.key === "/" &&
        !["INPUT", "TEXTAREA", "SELECT"].includes(
          (document.activeElement as HTMLElement | null)?.tagName ?? ""
        )
      ) {
        e.preventDefault()
        setPaletteOpen(true)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  // Close user menu on outside click or Escape
  useEffect(() => {
    if (!userMenuOpen) return

    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false)
      }
    }

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setUserMenuOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    document.addEventListener("touchstart", handleClickOutside)
    document.addEventListener("keydown", handleEscape)

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("touchstart", handleClickOutside)
      document.removeEventListener("keydown", handleEscape)
    }
  }, [userMenuOpen])

  const handleSignOut = async () => {
    try {
      setIsLoggingOut(true)
      setUserMenuOpen(false)
      toast.loading("กำลังออกจากระบบ...")

      // Client-side session clear
      try {
        const supabase = createClient()
        await supabase.auth.signOut()
      } catch {
        // Continue to server action
      }

      // Server-side action to clear cookies and redirect
      await signOutAction()
    } catch {
      // Fallback redirect
      router.push("/login")
      router.refresh()
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <header className="sticky top-0 z-30 flex h-14 md:h-20 w-full items-center justify-between px-4 md:px-8 bg-card border-b border-border">
      <div className="flex items-center gap-4 lg:hidden">
        <Sheet>
          <SheetTrigger
            render={
              <button className="text-muted-foreground hover:text-foreground transition-colors">
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
          {pageTitle}
        </h1>
      </div>

      <div className="flex items-center gap-3 shrink-0 min-w-0">
        {/* Global Search / Command Palette Trigger */}
        <button
          type="button"
          onClick={() => setPaletteOpen(true)}
          className="flex items-center gap-2 h-9 px-3 rounded-full border border-border bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground text-xs transition-colors shrink-0 cursor-pointer"
          aria-label="เปิดค้นหาด่วน (Ctrl+K)"
        >
          <Search className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">ค้นหาด่วน...</span>
          <kbd className="rounded border border-border bg-card px-1.5 py-0.5 font-mono text-xs text-muted-foreground">
            Ctrl K
          </kbd>
        </button>

        {/* Today's date */}
        <div className="hidden 2xl:flex items-center gap-2 h-9 px-4 rounded-full border border-border bg-card shrink-0">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium text-muted-foreground">
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
          className="relative p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors group"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 ? (
            <span className="absolute top-0.5 right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-micro font-bold text-destructive-foreground ring-2 ring-card">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          ) : null}
          <span className="sr-only">การแจ้งเตือน</span>
        </Link>

        {/* Profile Dropdown Menu */}
        <div className="relative pl-2 border-l border-border" ref={userMenuRef}>
          <button
            type="button"
            onClick={() => setUserMenuOpen((prev) => !prev)}
            className="flex items-center gap-3 p-1.5 -m-1.5 rounded-full hover:bg-muted/80 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 text-left cursor-pointer group"
            aria-expanded={userMenuOpen}
            aria-haspopup="menu"
            aria-label="เมนูผู้ใช้งาน"
          >
            <div className="h-9 w-9 rounded-full bg-primary/10 border border-border flex items-center justify-center shrink-0 overflow-hidden group-hover:border-primary/40 transition-colors">
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
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold text-foreground leading-none">
                  {profile?.fullName ?? "กำลังโหลด..."}
                </span>
                <ChevronDown
                  className={cn(
                    "h-3.5 w-3.5 text-muted-foreground transition-transform duration-200",
                    userMenuOpen && "rotate-180"
                  )}
                />
              </div>
              <span className="text-xs text-muted-foreground mt-1.5 leading-none">
                {profile?.roleLabel ?? ""}
                {profile?.schoolName ? ` · ${profile.schoolName}` : ""}
              </span>
            </div>
          </button>

          {/* User Menu Dropdown Panel */}
          {userMenuOpen && (
            <div
              className="absolute right-0 top-full mt-2 w-72 rounded-2xl border border-border bg-card p-2 shadow-xl ring-1 ring-black/5 z-50 animate-in fade-in-0 zoom-in-95 duration-150"
              role="menu"
              aria-orientation="vertical"
              aria-label="ตัวเลือกผู้ใช้งาน"
            >
              {/* User summary card */}
              <div className="p-3 bg-muted/40 rounded-xl border border-border/50 mb-1.5">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 overflow-hidden font-bold text-primary">
                    {profile?.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={profile.avatarUrl}
                        alt={profile.fullName}
                        className="h-full w-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      initials
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-foreground truncate">
                      {profile?.fullName ?? "ผู้ใช้งาน"}
                    </p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-micro font-semibold bg-primary/10 text-primary border border-primary/20">
                        {profile?.roleLabel ?? "ผู้ใช้งาน"}
                      </span>
                    </div>
                    {profile?.email ? (
                      <p className="text-xs text-muted-foreground truncate mt-1">
                        {profile.email}
                      </p>
                    ) : null}
                  </div>
                </div>
                {profile?.schoolName ? (
                  <div className="mt-2.5 pt-2 border-t border-border/40 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Building className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    <span className="truncate">{profile.schoolName}</span>
                  </div>
                ) : null}
              </div>

              {/* Navigation links */}
              <div className="space-y-0.5">
                <Link
                  href="/settings"
                  onClick={() => setUserMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-foreground hover:bg-muted transition-colors group"
                >
                  <Settings className="size-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                  <span>ข้อมูลส่วนตัวและการตั้งค่า</span>
                </Link>

                {canAccessStaff && (
                  <Link
                    href="/settings/staff"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-foreground hover:bg-muted transition-colors group"
                  >
                    <Users className="size-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                    <span>จัดการบุคลากรและครูประจำชั้น</span>
                  </Link>
                )}

                {isAdminOrDirector && (
                  <Link
                    href="/settings/academic"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-foreground hover:bg-muted transition-colors group"
                  >
                    <BookOpen className="size-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                    <span>โครงสร้างวิชาการและห้องเรียน</span>
                  </Link>
                )}

                {role === "admin" && (
                  <Link
                    href="/settings/audit-logs"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-foreground hover:bg-muted transition-colors group"
                  >
                    <ShieldCheck className="size-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                    <span>บันทึกความปลอดภัย (Audit Logs)</span>
                  </Link>
                )}
              </div>

              <div className="border-t border-border my-1.5" />

              {/* Logout button */}
              <button
                type="button"
                onClick={handleSignOut}
                disabled={isLoggingOut}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50 cursor-pointer text-left"
              >
                {isLoggingOut ? (
                  <Loader2 className="size-4 animate-spin text-destructive" />
                ) : (
                  <LogOut className="size-4 text-destructive" />
                )}
                <span>{isLoggingOut ? "กำลังออกจากระบบ..." : "ออกจากระบบ (Log Out)"}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <CommandPalette isOpen={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </header>
  )
}
