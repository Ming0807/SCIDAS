"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { LayoutGrid, Loader2, LogOut } from "lucide-react";

import { signOutAction } from "@/app/actions/auth.actions";
import { useRealtime } from "@/components/providers/realtime-provider";
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
import { createClient } from "@/utils/supabase/client";

export function MobileBottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { unreadNotificationsCount } = useRealtime();
  const navItems = getMobilePrimaryNavigation();
  const moduleMenuItems = getModuleMenuNavigation();
  const activeItem = getActiveNavigationItem(pathname);
  const isMenuActive = Boolean(
    activeItem && !activeItem.placements.includes("mobilePrimary")
  );

  const handleSignOut = async () => {
    try {
      setIsLoggingOut(true);
      try {
        const supabase = createClient();
        await supabase.auth.signOut();
      } catch {
        // Continue to server action
      }
      await signOutAction();
    } catch {
      router.push("/login");
      router.refresh();
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <Sheet>
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border flex items-center justify-around pb-safe pt-2 px-2 z-50 shadow-lg">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = isNavigationItemActive(pathname, item.href);
          const badge =
            item.key === "notifications" && unreadNotificationsCount > 0
              ? unreadNotificationsCount > 99
                ? "99+"
                : unreadNotificationsCount
              : undefined;

          return (
            <Link
              key={item.key}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex flex-col items-center justify-center w-16 h-12 gap-1 relative rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
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
                "flex flex-col items-center justify-center w-16 h-12 gap-1 relative rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer",
                isMenuActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
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
        <div className="grid grid-cols-3 gap-2 overflow-y-auto p-4 max-h-[50vh]">
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
                        : "border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
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

        {/* Mobile logout action */}
        <div className="p-4 border-t border-border bg-muted/20">
          <button
            type="button"
            onClick={handleSignOut}
            disabled={isLoggingOut}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold text-destructive bg-destructive/10 hover:bg-destructive/20 transition-colors disabled:opacity-50 cursor-pointer"
          >
            {isLoggingOut ? (
              <Loader2 className="h-4 w-4 animate-spin text-destructive" />
            ) : (
              <LogOut className="h-4 w-4 text-destructive" />
            )}
            <span>{isLoggingOut ? "กำลังออกจากระบบ..." : "ออกจากระบบ (Log Out)"}</span>
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
