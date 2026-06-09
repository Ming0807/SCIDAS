
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Users, 
  CalendarCheck, 
  GraduationCap, 
  HeartHandshake, 
  Home as HomeIcon, 
  Activity, 
  ShieldAlert, 
  Target, 
  Settings 
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Students", href: "/students", icon: Users },
  { title: "Attendance", href: "/attendance", icon: CalendarCheck },
  { title: "Academics", href: "/academics", icon: GraduationCap },
  { title: "Behavior", href: "/behavior", icon: Activity },
  { title: "Home Visits", href: "/home-visits", icon: HomeIcon },
  { title: "Support", href: "/support", icon: HeartHandshake },
  { title: "Risk Analysis", href: "/risk-analysis", icon: ShieldAlert },
  { title: "Dev Plans", href: "/development-plans", icon: Target },
  { title: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 flex-shrink-0 border-r border-border bg-card hidden md:flex flex-col">
      <div className="h-16 flex items-center px-6 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold">
            S
          </div>
          <span className="font-bold text-lg tracking-tight">SCIDAS</span>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        <div className="text-xs font-medium text-muted-foreground mb-4 px-3 uppercase tracking-wider">
          Main Menu
        </div>
        <nav className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200 text-sm font-medium group",
                  isActive 
                    ? "bg-primary/10 text-primary" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon 
                  className={cn(
                    "h-4 w-4 transition-transform duration-200", 
                    isActive ? "scale-110" : "group-hover:scale-110"
                  )} 
                />
                {item.title}
              </Link>
            );
          })}
        </nav>
      </div>
      
      <div className="p-4 border-t border-border">
        <div className="bg-muted/50 p-3 rounded-lg border border-border/50">
          <p className="text-xs font-medium text-foreground">Teacher Portal</p>
          <p className="text-micro text-muted-foreground mt-1">Version 1.0.0</p>
        </div>
      </div>
    </aside>
  );
}

