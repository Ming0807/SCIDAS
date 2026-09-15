"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState } from "react"
import { BookMarked, Home, Loader2, LogOut } from "lucide-react"

import { signOutAction } from "@/app/actions/auth.actions"
import { getGroupedSidebarNavigation, isNavigationItemActive } from "@/lib/navigation"
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
  const groupedSections = getGroupedSidebarNavigation(role)

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
    <aside className="w-[272px] h-full flex-shrink-0 bg-slate-950 text-slate-300 flex flex-col select-none border-r border-slate-800/80 font-sans">
      {/* Brand Header */}
      <div className="py-4 px-4 border-b border-white/10 flex flex-col gap-2.5 shrink-0 bg-slate-950">
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shrink-0 shadow-xs border border-white/20">
            <BookMarked className="size-5 text-white" />
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base text-white tracking-tight leading-none font-mono">
                SCIDAS
              </span>
              <span className="px-1.5 py-0.5 rounded text-xs font-bold uppercase bg-blue-500/20 text-blue-300 border border-blue-400/30">
                OBEC
              </span>
            </div>
            <span className="text-xs font-medium text-slate-400 truncate mt-0.5 leading-tight">
              <span>ระบบวิเคราะห์และดูแล</span>
              <span className="block text-xs text-slate-500">ช่วยเหลือนักเรียนรายบุคคล</span>
            </span>
          </div>
        </div>
        {schoolName ? (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/5 text-slate-300 text-xs font-medium truncate">
            <span className="size-1.5 rounded-full bg-emerald-400 shrink-0 animate-pulse" />
            <span className="truncate">{schoolName}</span>
          </div>
        ) : null}
      </div>

      {/* Grouped Navigation Links */}
      <div className="flex-1 overflow-y-auto no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden py-3 px-2.5 space-y-4">
        {groupedSections.map((section) => (
          <div key={section.key} className="space-y-1">
            {role !== "student" && (
              <p className="px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-slate-500 select-none">
                {section.title}
              </p>
            )}
            <nav className="space-y-0.5" aria-label={section.title}>
              {section.items.map((item) => {
                const Icon = item.icon
                const isActive = isNavigationItemActive(pathname, item.href)

                return (
                  <Link
                    key={item.key}
                    href={item.href}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-3 px-2.5 py-2 rounded-lg transition-all duration-150 text-xs font-medium group relative",
                      isActive
                        ? "bg-blue-600 text-white font-semibold shadow-xs"
                        : "text-slate-400 hover:bg-white/5 hover:text-slate-100",
                    )}
                  >
                    <Icon
                      className={cn(
                        "size-4 shrink-0 transition-transform duration-150",
                        isActive ? "scale-105 text-white" : "text-slate-400 group-hover:text-slate-200 group-hover:scale-105",
                      )}
                    />
                    <span className="truncate">{item.label}</span>
                  </Link>
                )
              })}
            </nav>
          </div>
        ))}
      </div>

      {/* School footer & quick logout */}
      <div className="p-3 border-t border-white/10 flex flex-col gap-2 shrink-0 bg-slate-900/60">
        <div className="flex flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className="size-7 rounded-md bg-white/10 flex items-center justify-center shrink-0">
              <Home className="size-3.5 text-slate-300" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-medium text-slate-200 truncate">
                {schoolName ?? "โรงเรียนในระบบ"}
              </span>
              <span className="text-xs text-slate-500 truncate">SCIDAS Care • สพฐ.</span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleSignOut}
            disabled={isLoggingOut}
            title="ออกจากระบบ"
            aria-label="ออกจากระบบ"
            className="p-1.5 rounded-md text-slate-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors shrink-0 disabled:opacity-50 cursor-pointer"
          >
            {isLoggingOut ? (
              <Loader2 className="size-3.5 animate-spin text-rose-300" />
            ) : (
              <LogOut className="size-3.5" />
            )}
          </button>
        </div>
      </div>
    </aside>
  )
}
