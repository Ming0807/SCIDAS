"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid } from "lucide-react";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  getActiveNavigationItem,
  getMobilePrimaryNavigation,
  getModuleMenuNavigation,
  isNavigationItemActive,
} from "@/lib/navigation";
import { cn } from "@/lib/utils";

export function MobileBottomNav() {
  const pathname = usePathname();
  const navItems = getMobilePrimaryNavigation();
  const moduleMenuItems = getModuleMenuNavigation();
  const activeItem = getActiveNavigationItem(pathname);
  const isMenuActive = Boolean(
    activeItem && !activeItem.placements.includes("mobilePrimary")
  );

  return (
    <Sheet>
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border flex items-center justify-around pb-safe pt-2 px-2 z-50 shadow-lg">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = isNavigationItemActive(pathname, item.href);
          const badge = item.key === "notifications" ? 3 : undefined;

          return (
            <Link
              key={item.key}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex flex-col items-center justify-center w-16 h-12 gap-1 relative rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                isActive ? "text-primary" : "text-slate-400 hover:text-slate-600"
              )}
            >
              <div className="relative">
                <Icon className={cn("w-5 h-5", isActive ? "stroke-[2.5px]" : "stroke-2")} />
                {badge ? (
                  <span className="absolute -top-1.5 -right-1.5 bg-destructive text-white text-micro font-bold px-1.5 py-0.5 rounded-full min-w-4 text-center border-2 border-card">
                    {badge}
                  </span>
                ) : null}
              </div>
              <span className={cn("text-micro", isActive ? "font-bold" : "font-medium")}>
                {item.mobileLabel ?? item.label}
              </span>
            </Link>
          );
        })}

        <SheetTrigger
          render={
            <button
              type="button"
              aria-label="เปิดเมนูทั้งหมด"
              className={cn(
                "flex flex-col items-center justify-center w-16 h-12 gap-1 relative rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                isMenuActive ? "text-primary" : "text-slate-400 hover:text-slate-600"
              )}
            />
          }
        >
          <LayoutGrid className={cn("w-5 h-5", isMenuActive ? "stroke-[2.5px]" : "stroke-2")} />
          <span className={cn("text-micro", isMenuActive ? "font-bold" : "font-medium")}>
            เมนู
          </span>
        </SheetTrigger>
      </div>

      <SheetContent
        side="bottom"
        className="gap-0 rounded-t-xl border-t border-border p-0 pb-safe"
      >
        <SheetHeader className="border-b border-border px-5 py-4">
          <SheetTitle>เมนูทั้งหมด</SheetTitle>
          <SheetDescription className="sr-only">
            เลือกโมดูลที่ต้องการใช้งาน
          </SheetDescription>
        </SheetHeader>
        <div className="grid grid-cols-3 gap-2 overflow-y-auto p-4 max-h-[60vh]">
          {moduleMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = isNavigationItemActive(pathname, item.href);

            return (
              <SheetClose
                key={item.key}
                render={
                  <Link
                    href={item.href}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "flex min-h-20 flex-col items-center justify-center gap-2 rounded-xl border px-2 py-3 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      isActive
                        ? "border-primary/30 bg-accent text-accent-foreground"
                        : "border-border bg-card text-slate-600 hover:bg-muted hover:text-foreground"
                    )}
                  />
                }
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs font-medium leading-tight">{item.label}</span>
              </SheetClose>
            );
          })}
        </div>
      </SheetContent>
    </Sheet>
  );
}
