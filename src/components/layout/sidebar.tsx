"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Home,
  Users, 
  CalendarCheck, 
  BookOpen, 
  Smile, 
  BarChart2, 
  HeartHandshake, 
  ClipboardList, 
  FileText,
  Settings,
  ArrowLeftRight,
  BookMarked
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { title: "ภาพรวม", href: "/", icon: Home },
  { title: "นักเรียน", href: "/students", icon: Users },
  { title: "การมาเรียน", href: "/attendance", icon: CalendarCheck },
  { title: "ผลการเรียน", href: "/academics", icon: BookOpen },
  { title: "พฤติกรรม", href: "/behavior", icon: Smile },
  { title: "วิเคราะห์ความเสี่ยง", href: "/risk-analysis", icon: BarChart2 },
  { title: "ดูแลช่วยเหลือ", href: "/support", icon: HeartHandshake },
  { title: "แผนพัฒนารายบุคคล", href: "/development-plans", icon: ClipboardList },
  { title: "รายงาน", href: "/reports", icon: FileText },
  { title: "ตั้งค่า", href: "/settings", icon: Settings },
];

const STUDENT_NAV_ITEMS = [
  { title: "ภาพรวม", href: "/", icon: Home },
  { title: "การตั้งค่า", href: "/settings", icon: Settings },
];

export function Sidebar({ role }: { role?: string | null }) {
  const pathname = usePathname();

  const currentNavItems = role === "student" ? STUDENT_NAV_ITEMS : NAV_ITEMS;

  return (
    <aside className="w-[280px] flex-shrink-0 bg-[#0f2e60] text-slate-300 hidden md:flex flex-col">
      <div className="py-6 px-6 border-b border-white/5 flex flex-row items-center gap-4">
        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shrink-0 border-[3px] border-amber-400">
          <BookMarked className="h-6 w-6 text-[#0f2e60]" />
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-sm text-white leading-tight">ระบบวิเคราะห์และดูแล</span>
          <span className="font-bold text-sm text-white leading-tight">ช่วยเหลือนักเรียนรายบุคคล</span>
          <span className="text-[10px] text-slate-300 mt-1">สำหรับโรงเรียนขนาดเล็ก</span>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
        <nav className="space-y-1">
          {currentNavItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href + "/"));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium group",
                  isActive 
                    ? "bg-[#1d4ed8] text-white shadow-sm" 
                    : "text-slate-300 hover:bg-white/10 hover:text-white"
                )}
              >
                <item.icon 
                  className={cn(
                    "h-5 w-5 transition-transform duration-200", 
                    isActive ? "scale-110" : "group-hover:scale-110"
                  )} 
                />
                {item.title}
              </Link>
            );
          })}
        </nav>
      </div>
      
      <div className="p-6 border-t border-white/5">
        <div className="flex flex-row items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-md bg-white/10 flex items-center justify-center shrink-0">
            <Home className="h-4 w-4 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-white">โรงเรียนบ้านหนองแค</span>
            <span className="text-[11px] text-slate-400">สพป.ชัยภูมิ เขต 1</span>
          </div>
        </div>
        <button className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg border border-white/20 text-xs font-medium text-slate-300 hover:bg-white/10 hover:text-white transition-colors">
          <ArrowLeftRight className="h-3.5 w-3.5" />
          เปลี่ยนโรงเรียน
        </button>
      </div>
    </aside>
  );
}
