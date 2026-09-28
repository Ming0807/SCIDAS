import React from "react"
import Link from "next/link"
import { ChevronRight, Users, MessageCircle, BookOpen, BarChart } from "lucide-react"
import { cn } from "@/lib/utils"

const guidelines = [
  {
    href: "/support",
    title: "1. เฝ้าระวังใกล้ชิด",
    description: "ติดตามการมาเรียนอย่างต่อเนื่อง",
    icon: Users,
    tone: "text-red-700 dark:text-red-300",
    box: "bg-red-100 dark:bg-red-950/50",
    card: "bg-red-50/80 border-red-100 hover:bg-red-100 dark:bg-red-950/30 dark:border-red-900/60 dark:hover:bg-red-950/50",
    chevron: "text-red-400",
  },
  {
    href: "/support",
    title: "2. พูดคุยให้คำปรึกษา",
    description: "นัดพูดคุยกับนักเรียนและผู้ปกครอง",
    icon: MessageCircle,
    tone: "text-orange-700 dark:text-orange-300",
    box: "bg-orange-100 dark:bg-orange-950/50",
    card: "bg-orange-50/80 border-orange-100 hover:bg-orange-100 dark:bg-orange-950/30 dark:border-orange-900/60 dark:hover:bg-orange-950/50",
    chevron: "text-orange-400",
  },
  {
    href: "/development-plans",
    title: "3. วางแผนการช่วยเหลือ",
    description: "จัดทำแผนพัฒนารายบุคคลและติดตามผล",
    icon: BookOpen,
    tone: "text-green-700 dark:text-green-300",
    box: "bg-green-100 dark:bg-green-950/50",
    card: "bg-green-50/80 border-green-100 hover:bg-green-100 dark:bg-green-950/30 dark:border-green-900/60 dark:hover:bg-green-950/50",
    chevron: "text-green-400",
  },
  {
    href: "/support",
    title: "4. ติดตามและประเมินผล",
    description: "ประเมินผลทุก 2 สัปดาห์",
    icon: BarChart,
    tone: "text-blue-700 dark:text-blue-300",
    box: "bg-blue-100 dark:bg-blue-950/50",
    card: "bg-blue-50/80 border-blue-100 hover:bg-blue-100 dark:bg-blue-950/30 dark:border-blue-900/60 dark:hover:bg-blue-950/50",
    chevron: "text-blue-400",
  },
]

export function MobileRiskGuidelines() {
  return (
    <div className="px-4 mb-6">
      <h3 className="text-sm font-bold text-foreground mb-4">แนวทางการช่วยเหลือที่แนะนำ</h3>

      <div className="flex overflow-x-auto gap-3 pb-4 no-scrollbar -mx-4 px-4">
        {guidelines.map((g) => {
          const Icon = g.icon
          return (
            <Link
              key={g.title}
              href={g.href}
              className={cn(
                "rounded-xl p-4 border shrink-0 w-[150px] flex flex-col justify-between group cursor-pointer transition-colors",
                g.card,
              )}
            >
              <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center mb-3", g.box)}>
                <Icon className={cn("w-6 h-6", g.tone)} />
              </div>
              <div className="flex flex-col">
                <h4 className={cn("text-sm font-bold mb-1 leading-tight", g.tone)}>{g.title}</h4>
                <p className="text-xs text-muted-foreground leading-snug">{g.description}</p>
              </div>
              <ChevronRight className={cn("w-4 h-4 mt-2 self-end group-hover:translate-x-1 transition-transform", g.chevron)} />
            </Link>
          )
        })}
      </div>
    </div>
  )
}
