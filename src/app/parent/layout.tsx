import Link from "next/link"
import { redirect } from "next/navigation"
import { HeartHandshake } from "lucide-react"

import { getCurrentUserContext } from "@/lib/server/current-user"

import { ParentLogoutButton } from "./_components/parent-logout-button"

export default async function ParentLayout({ children }: { children: React.ReactNode }) {
  let role: string | null = null
  try {
    role = (await getCurrentUserContext()).role
  } catch {
    redirect("/login")
  }

  if (role !== "parent") {
    redirect("/")
  }

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <header className="sticky top-0 z-10 border-b border-border bg-card/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between px-4 py-3">
          <Link href="/parent" className="flex items-center gap-2">
            <span className="inline-flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <HeartHandshake aria-hidden="true" className="size-4.5" />
            </span>
            <span className="leading-tight">
              <span className="block text-sm font-bold text-foreground">พอร์ทัลผู้ปกครอง</span>
              <span className="block text-xs text-muted-foreground">ติดตามบุตรหลานของท่าน</span>
            </span>
          </Link>
          <ParentLogoutButton />
        </div>
      </header>
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-5 pb-10">{children}</main>
    </div>
  )
}
