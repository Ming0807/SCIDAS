import Link from "next/link"
import {
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
      color: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800",
    },
    {
      title: "คัดกรอง SDQ",
      subtitle: "ประเมิน 25 ข้อ 5 ด้าน",
      href: "/screening/sdq",
      icon: Brain,
      color: "text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/40 border-sky-200 dark:border-sky-800",
    },
    {
      title: "บันทึกเยี่ยมบ้าน",
      subtitle: "หลักฐาน 6 หมวด สพฐ.",
      href: "/home-visits/new",
      icon: Home,
      color: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800",
    },
    {
      title: "บันทึกพฤติกรรม",
      subtitle: "คะแนนฐาน 100",
      href: "/behavior/record",
      icon: Sparkles,
      color: "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800",
    },
    {
      title: "เปิดเคสช่วยเหลือ",
      subtitle: "แบบ บร. & ให้คำปรึกษา",
      href: "/support/new",
      icon: HeartHandshake,
      color: "text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800",
    },
    {
      title: "พิมพ์รายงาน / SAR",
      subtitle: "เอกสาร สพฐ. 9 ฉบับ",
      href: "/reports",
      icon: FileText,
      color: "text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800",
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
            className="group flex flex-col justify-between rounded-xl border border-border bg-card p-3.5 shadow-xs transition-all hover:border-primary/40 hover:shadow-sm"
          >
            <div className="flex items-center justify-between">
              <span className={`flex size-8 items-center justify-center rounded-lg border ${act.color}`}>
                <Icon className="size-4" />
              </span>
            </div>
            <div className="mt-2.5">
              <p className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
                {act.title}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5 truncate">
                {act.subtitle}
              </p>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
