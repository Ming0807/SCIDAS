"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BookMarked, Home } from "lucide-react"
import { getSidebarNavigation, isNavigationItemActive } from "@/lib/navigation"
import { cn } from "@/lib/utils"

export function Sidebar({
  role,
  schoolName,
}: {
  role?: string | null
  schoolName?: string | null
}) {
  const pathname = usePathname()
  const currentNavItems = getSidebarNavigation(role)

  return (
    <aside className="w-[280px] h-full flex-shrink-0 bg-brand-deep-blue text-slate-300 flex flex-col">
      {/* Brand */}
      <div className="py-6 px-6 border-b border-white/5 flex flex-row items-center gap-4">
        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shrink-0 border-[3px] border-amber-400">
          <BookMarked className="h-6 w-6 text-brand-deep-blue" />
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-sm text-white leading-tight">
            ระบบวิเคราะห์และดูแล
          </span>
          <span className="font-bold text-sm text-white leading-tight">
            ช่วยเหลือนักเรียนรายบุคคล
          </span>
          <span className="text-micro text-slate-300 mt-1">
            สำหรับโรงเรียนขนาดเล็ก
          </span>
        </div>
      </div>

      {/* Nav Links */}
      <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
        <nav className="space-y-1">
          {currentNavItems.map((item) => {
            const Icon = item.icon
            const isActive = isNavigationItemActive(pathname, item.href)

            return (
              <Link
                key={item.key}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium group",
                  isActive
                    ? "bg-brand-bright-blue text-white shadow-sm"
                    : "text-slate-300 hover:bg-white/10 hover:text-white",
                )}
              >
                <Icon
                  className={cn(
                    "h-5 w-5 transition-transform duration-200",
                    isActive ? "scale-110" : "group-hover:scale-110",
                  )}
                />
                {item.label}
              </Link>
            )
          })}
        </nav>
      </div>

      {/* School footer */}
      <div className="p-6 border-t border-white/5">
        <div className="flex flex-row items-center gap-3">
          <div className="w-8 h-8 rounded-md bg-white/10 flex items-center justify-center shrink-0">
            <Home className="h-4 w-4 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-white">
              {schoolName ?? "กำลังโหลด..."}
            </span>
            <span className="text-xs text-slate-400">SCIDAS</span>
          </div>
        </div>
      </div>
    </aside>
  )
}
