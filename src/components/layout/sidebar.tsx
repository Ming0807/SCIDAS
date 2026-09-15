"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState } from "react"
import { BookMarked, Home, Loader2, LogOut } from "lucide-react"

import { signOutAction } from "@/app/actions/auth.actions"
import { getSidebarNavigation, isNavigationItemActive } from "@/lib/navigation"
import { cn } from "@/lib/utils"
import { createClient } from "@/utils/supabase/client"

export function Sidebar({
  role,
  schoolName,
}: {
  role?: string | null
  schoolName?: string | null
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const currentNavItems = getSidebarNavigation(role)

  const handleSignOut = async () => {
    try {
      setIsLoggingOut(true)
      try {
        const supabase = createClient()
        await supabase.auth.signOut()
      } catch {
        // Continue to server action
      }
      await signOutAction()
    } catch {
      router.push("/login")
      router.refresh()
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <aside className="w-[280px] h-full flex-shrink-0 bg-brand-deep-blue text-slate-300 flex flex-col select-none">
      {/* Brand */}
      <div className="py-4.5 px-5 border-b border-white/5 flex flex-row items-center gap-3.5 shrink-0">
        <div className="w-11 h-11 bg-white rounded-full flex items-center justify-center shrink-0 border-[2.5px] border-amber-400 shadow-xs">
          <BookMarked className="h-5.5 w-5.5 text-brand-deep-blue" />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="font-bold text-sm text-white leading-tight truncate">
            ระบบวิเคราะห์และดูแล
          </span>
          <span className="font-bold text-sm text-white leading-tight truncate">
            ช่วยเหลือนักเรียนรายบุคคล
          </span>
          <span className="text-micro text-slate-300 mt-0.5 truncate">
            สำหรับโรงเรียนขนาดเล็ก
          </span>
        </div>
      </div>

      {/* Nav Links */}
      <div className="flex-1 overflow-y-auto no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden py-3 px-3 space-y-0.5">
        <nav className="space-y-0.5">
          {currentNavItems.map((item) => {
            const Icon = item.icon
            const isActive = isNavigationItemActive(pathname, item.href)

            return (
              <Link
                key={item.key}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3.5 px-3 py-2.5 rounded-xl transition-all duration-150 text-xs sm:text-sm font-medium group",
                  isActive
                    ? "bg-brand-bright-blue text-white shadow-xs font-semibold"
                    : "text-slate-300 hover:bg-white/10 hover:text-white",
                )}
              >
                <Icon
                  className={cn(
                    "h-4.5 w-4.5 shrink-0 transition-transform duration-150",
                    isActive ? "scale-105" : "group-hover:scale-105",
                  )}
                />
                <span className="truncate">{item.label}</span>
              </Link>
            )
          })}
        </nav>
      </div>

      {/* School footer & quick logout */}
      <div className="p-3.5 border-t border-white/5 flex flex-col gap-2 shrink-0">
        <div className="flex flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className="w-8 h-8 rounded-md bg-white/10 flex items-center justify-center shrink-0">
              <Home className="h-4 w-4 text-white" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-medium text-white truncate">
                {schoolName ?? "กำลังโหลด..."}
              </span>
              <span className="text-micro text-slate-400">SCIDAS</span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleSignOut}
            disabled={isLoggingOut}
            title="ออกจากระบบ"
            aria-label="ออกจากระบบ"
            className="p-2 rounded-lg text-slate-400 hover:text-red-300 hover:bg-white/10 transition-colors shrink-0 disabled:opacity-50 cursor-pointer"
          >
            {isLoggingOut ? (
              <Loader2 className="h-4 w-4 animate-spin text-red-300" />
            ) : (
              <LogOut className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>
    </aside>
  )
}
