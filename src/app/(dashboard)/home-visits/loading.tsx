import { PageShell } from "@/components/dashboard"

export default function HomeVisitsLoading() {
  return (
    <PageShell size="wide" spacing="default">
      <div className="space-y-4" aria-busy="true" aria-label="กำลังโหลดข้อมูลเยี่ยมบ้าน">
        <div className="h-8 w-56 animate-pulse rounded-md bg-muted" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="h-24 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
        <div className="h-48 animate-pulse rounded-xl bg-muted" />
      </div>
    </PageShell>
  )
}
