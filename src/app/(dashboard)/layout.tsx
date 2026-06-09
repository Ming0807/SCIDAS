
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { getUserRole } from "@/utils/supabase/server";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const role = await getUserRole();

  return (
    <div className="flex h-screen overflow-hidden bg-background md:bg-[#f8fafc]">
      <div className="hidden md:block">
        <Sidebar role={role} />
      </div>
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="hidden md:block">
          <Header role={role} />
        </div>
        <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
          <div className="h-full animate-fade-in w-full max-w-full">
            {children}
          </div>
        </main>
      </div>
      <MobileBottomNav />
    </div>
  );
}

