
"use client";

import { Bell, Search, Menu, User } from "lucide-react";
import { Breadcrumb } from "./breadcrumb";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);

  // You would typically use an intersection observer or scroll listener here
  // to toggle the isScrolled state for a subtle shadow effect.
  
  return (
    <header className={cn(
      "sticky top-0 z-30 flex h-16 w-full items-center justify-between px-4 sm:px-6",
      "bg-background/80 backdrop-blur-md transition-all duration-200 border-b",
      isScrolled ? "border-border shadow-sm" : "border-border/40"
    )}>
      <div className="flex items-center gap-4 lg:hidden">
        <button className="text-muted-foreground hover:text-foreground transition-colors">
          <Menu className="h-5 w-5" />
          <span className="sr-only">เปิดปิดเมนูด้านข้าง</span>
        </button>
      </div>
      
      <div className="hidden lg:flex flex-1">
        <Breadcrumb />
      </div>

      <div className="flex items-center gap-4 sm:gap-6">
        <div className="relative hidden sm:block">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="search"
            placeholder="ค้นหานักเรียน..."
            className="h-9 w-64 rounded-md border border-input bg-background px-8 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-all duration-200"
          />
        </div>
        
        <button className="relative text-muted-foreground hover:text-foreground transition-colors group">
          <Bell className="h-5 w-5 group-hover:animate-scale-in" />
          <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-destructive border border-background"></span>
          <span className="sr-only">การแจ้งเตือน</span>
        </button>

        <div className="h-8 w-8 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center border border-border cursor-pointer hover:ring-2 hover:ring-ring hover:ring-offset-2 transition-all">
          <User className="h-4 w-4" />
        </div>
      </div>
    </header>
  );
}

