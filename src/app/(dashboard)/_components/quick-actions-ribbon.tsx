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
import { cn } from "@/lib/utils"

export function QuickActionsRibbon() {
  const actions = [
    {
      title: "เช็คชื่อประจำวัน",
      subtitle: "เวลาเรียน 80% (มส.)",
      href: "/attendance",
      icon: CalendarCheck,
      iconTone: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
    },
    {
      title: "คัดกรอง SDQ",
      subtitle: "ประเมิน 25 ข้อ 5 ด้าน",
      href: "/screening/sdq",
      icon: Brain,
      iconTone: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
    },
    {
      title: "บันทึกเยี่ยมบ้าน",
      subtitle: "หลักฐาน 6 หมวด",
      href: "/home-visits/new",
      icon: Home,
      iconTone: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    },
    {
      title: "บันทึกพฤติกรรม",
      subtitle: "คะแนนฐาน 100",
      href: "/behavior/record",
      icon: Sparkles,
      iconTone: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
    },
    {
      title: "เปิดเคสช่วยเหลือ",
      subtitle: "บันทึกการให้คำปรึกษา",
      href: "/support/new",
      icon: HeartHandshake,
      iconTone: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
    },
    {
      title: "พิมพ์รายงาน / SAR",
      subtitle: "เอกสาร สพฐ. 9 ฉบับ",
      href: "/reports",
      icon: FileText,
      iconTone: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {actions.map((act) => {
        const Icon = act.icon
        return (
          <Link
            key={act.href}
            href={act.href}
            className="group relative flex flex-col justify-between rounded-2xl border border-border bg-card p-3.5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
          >
            <div className="flex items-center justify-between">
              <span className={cn("flex size-9 items-center justify-center rounded-xl transition-all duration-200 group-hover:scale-105", act.iconTone)}>
                <Icon className="size-4.5" />
              </span>
              <span className="flex size-6 items-center justify-center rounded-full text-muted-foreground/50 transition-all duration-200 group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                <ArrowUpRight className="size-3.5" />
              </span>
            </div>
            <div className="mt-3">
              <div className="flex items-center gap-1.5">
                <p className="text-xs font-semibold text-foreground transition-colors group-hover:text-primary leading-tight">
                  {act.title}
                </p>
              </div>
              <p className="text-micro text-muted-foreground mt-1 truncate leading-tight">
                {act.subtitle}
              </p>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
