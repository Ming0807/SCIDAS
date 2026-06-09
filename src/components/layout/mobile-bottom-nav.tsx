"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Users, Bell, BarChart2, LayoutGrid } from "lucide-react";

export function MobileBottomNav() {
  const pathname = usePathname();

  const navItems = [
    { name: "หน้าหลัก", href: "/", icon: Home },
    { name: "นักเรียน", href: "/students", icon: Users },
    { name: "แจ้งเตือน", href: "/notifications", icon: Bell, badge: 3 },
    { name: "รายงาน", href: "/reports", icon: BarChart2 },
    { name: "เมนู", href: "/menu", icon: LayoutGrid },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex items-center justify-around pb-safe pt-2 px-2 z-50 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
      {navItems.map((item) => {
        const isActive = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href));
        
        return (
          <Link 
            key={item.name} 
            href={item.href}
            className={`flex flex-col items-center justify-center w-16 h-12 gap-1 relative ${isActive ? "text-[#5b21b6]" : "text-slate-400 hover:text-slate-600"}`}
          >
            <div className="relative">
              <item.icon className={`w-5 h-5 ${isActive ? "stroke-[2.5px]" : "stroke-2"}`} />
              {item.badge && (
                <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full min-w-[16px] text-center border-2 border-white">
                  {item.badge}
                </span>
              )}
            </div>
            <span className={`text-[10px] ${isActive ? "font-bold" : "font-medium"}`}>{item.name}</span>
          </Link>
        );
      })}
    </div>
  );
}
