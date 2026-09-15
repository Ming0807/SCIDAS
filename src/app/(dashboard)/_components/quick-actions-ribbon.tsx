import Link from "next/link"
import {
  ArrowUpRight,
  Brain,
  CalendarCheck,
  FileText,
  HeartHandshake,
  Home,
  Sparkles,
} from "lucide-react"

export function QuickActionsRibbon() {
  const actions = [
    {
      title: "เช็คชื่อประจำวัน",
      subtitle: "เวลาเรียน 80% (มส.)",
      href: "/attendance",
      icon: CalendarCheck,
    },
    {
      title: "คัดกรอง SDQ",
      subtitle: "ประเมิน 25 ข้อ 5 ด้าน",
      href: "/screening/sdq",
      icon: Brain,
    },
    {
      title: "บันทึกเยี่ยมบ้าน",
      subtitle: "หลักฐาน สพฐ. 6 หมวด",
      href: "/home-visits/new",
      icon: Home,
    },
    {
      title: "บันทึกพฤติกรรม",
      subtitle: "คะแนนความประพฤติ",
      href: "/behavior/record",
      icon: Sparkles,
    },
    {
      title: "เปิดเคสช่วยเหลือ",
      subtitle: "การให้คำปรึกษา บร.",
      href: "/support/new",
      icon: HeartHandshake,
    },
    {
      title: "พิมพ์รายงาน / SAR",
      subtitle: "เอกสารทางการ 9 ฉบับ",
      href: "/reports",
      icon: FileText,
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
      {actions.map((act) => {
        const Icon = act.icon
        return (
          <Link
            key={act.href}
            href={act.href}
            className="group relative flex flex-col justify-between rounded-xl border border-border bg-card p-3 shadow-2xs transition-all duration-150 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
          >
            <div className="flex items-center justify-between">
              <span className="flex size-8 items-center justify-center rounded-lg bg-muted text-foreground transition-all duration-150 group-hover:bg-primary/10 group-hover:text-primary">
                <Icon className="size-4" />
              </span>
              <span className="flex size-5 items-center justify-center rounded-full text-muted-foreground/60 transition-all duration-150 group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                <ArrowUpRight className="size-3" />
              </span>
            </div>
            <div className="mt-2.5">
              <p className="text-xs font-semibold text-foreground transition-colors group-hover:text-primary leading-tight">
                {act.title}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5 truncate leading-tight">
                {act.subtitle}
              </p>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
