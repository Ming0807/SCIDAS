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
      badge: "รายวัน",
    },
    {
      title: "คัดกรอง SDQ",
      subtitle: "ประเมิน 25 ข้อ 5 ด้าน",
      href: "/screening/sdq",
      icon: Brain,
      badge: "สพฐ.",
    },
    {
      title: "บันทึกเยี่ยมบ้าน",
      subtitle: "หลักฐาน 6 หมวด",
      href: "/home-visits/new",
      icon: Home,
      badge: "ภาคสนาม",
    },
    {
      title: "บันทึกพฤติกรรม",
      subtitle: "คะแนนฐาน 100",
      href: "/behavior/record",
      icon: Sparkles,
      badge: "คะแนนความประพฤติ",
    },
    {
      title: "เปิดเคสช่วยเหลือ",
      subtitle: "บันทึกการให้คำปรึกษา",
      href: "/support/new",
      icon: HeartHandshake,
      badge: "ส่งต่อ",
    },
    {
      title: "พิมพ์รายงาน / SAR",
      subtitle: "เอกสาร สพฐ. 9 ฉบับ",
      href: "/reports",
      icon: FileText,
      badge: "ส่งออก",
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
              <span className="flex size-9 items-center justify-center rounded-xl bg-muted/70 text-muted-foreground transition-colors group-hover:bg-primary/10 group-hover:text-primary">
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
