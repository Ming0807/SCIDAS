"use client";

import { Bell, Search, Menu, Calendar } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Sidebar } from "@/components/layout/sidebar";

export function Header({ role }: { role?: string | null }) {
  const [isScrolled, setIsScrolled] = useState(false);

  return (
    <header className={cn(
      "sticky top-0 z-30 flex h-20 w-full items-center justify-between px-8",
      "bg-white transition-all duration-200 border-b border-slate-100",
      isScrolled ? "shadow-sm" : ""
    )}>
      <div className="flex items-center gap-4 lg:hidden">
        <Sheet>
          <SheetTrigger render={<button className="text-slate-500 hover:text-slate-900 transition-colors" />}>
              <Menu className="h-5 w-5" />
              <span className="sr-only">เปิดปิดเมนูด้านข้าง</span>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-[280px]">
            <SheetTitle className="sr-only">เมนูหลัก</SheetTitle>
            <SheetDescription className="sr-only">เมนูนำทางหลักของระบบ</SheetDescription>
            <Sidebar role={role} />
          </SheetContent>
        </Sheet>
      </div>
      
      <div className="hidden lg:flex items-center min-w-0 shrink-0">
        <h1 className="text-[22px] font-bold text-slate-900 tracking-tight truncate">ภาพรวมระบบ</h1>
      </div>

      <div className="flex items-center gap-4 shrink-0 min-w-0">
        <div className="relative hidden md:block">
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="search"
            placeholder="ค้นหานักเรียน, เลขประจำตัว, หรืออื่นๆ"
            className="h-9 w-[200px] lg:w-[240px] xl:w-[280px] rounded-full border border-slate-200 bg-slate-50/50 pl-10 pr-12 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
          <div className="absolute right-2.5 top-2 flex items-center justify-center px-1.5 h-5 rounded-md bg-white border border-slate-200 text-[10px] font-medium text-slate-400 shadow-sm">
            ⌘K
          </div>
        </div>

        <div className="hidden 2xl:flex items-center gap-2 h-9 px-4 rounded-full border border-slate-200 bg-white shrink-0">
          <Calendar className="h-4 w-4 text-slate-400" />
          <span className="text-sm font-medium text-slate-600">ข้อมูล ณ วันที่ 20 พฤษภาคม 2567</span>
        </div>
        
        <button className="relative p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-colors group">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white ring-2 ring-white">
            3
          </span>
          <span className="sr-only">การแจ้งเตือน</span>
        </button>

        <div className="flex items-center gap-3 pl-2 border-l border-slate-100">
          <div className="h-9 w-9 rounded-full bg-slate-100 border border-slate-200 overflow-hidden shrink-0">
            <img src="https://api.dicebear.com/7.x/notionists/svg?seed=teacher" alt="Profile" className="h-full w-full object-cover" />
          </div>
          <div className="flex flex-col items-start hidden xl:flex shrink-0">
            <span className="text-sm font-bold text-slate-800 leading-none">ครูประจำชั้น</span>
            <span className="text-[10px] text-slate-500 mt-1.5 leading-none">ครูโรงเรียนบ้านหนองแค</span>
          </div>
        </div>
      </div>
    </header>
  );
}

