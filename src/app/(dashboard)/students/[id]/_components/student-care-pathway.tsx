import Link from "next/link"
import {
  ArrowUpRight,
  FileCheck2,
  HeartHandshake,
  Home,
  Send,
  ShieldAlert,
  Sparkles,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/dashboard"
import type { StudentCareProfile } from "@/lib/server/student-care-read-models"
import { getStudentRiskLabel, getStudentRiskTone } from "@/lib/student-care-formatters"

interface StudentCarePathwayProps {
  profile: StudentCareProfile
}

export function StudentCarePathway({ profile }: StudentCarePathwayProps) {
  const riskTone = getStudentRiskTone(profile.riskLevel)
  const riskLabel = getStudentRiskLabel(profile.riskLevel)

  const steps = [
    {
      stepNumber: 1,
      title: "รู้จักรายบุคคล",
      subtitle: "ข้อมูลพื้นฐาน & เยี่ยมบ้าน",
      icon: Home,
      statusLabel: "บันทึกข้อมูลแล้ว",
      statusTone: "normal" as const,
      description: `การเดินทาง ${profile.travelMethod ?? "ไม่ระบุ"} · ${profile.distanceToSchoolKm ? `${profile.distanceToSchoolKm} กม.` : "ไม่ระบุระยะทาง"}`,
      primaryAction: {
        label: "ดูการเยี่ยมบ้าน",
        href: `/home-visits?studentId=${profile.studentId}`,
      },
    },
    {
      stepNumber: 2,
      title: "การคัดกรอง",
      subtitle: "SDQ & การประเมินความเสี่ยง",
      icon: ShieldAlert,
      statusLabel: riskLabel,
      statusTone: riskTone,
      description: `คะแนนความเสี่ยง ${profile.riskScore.toLocaleString("th-TH")} · แนวโน้ม ${profile.riskTrend || "คงที่"}`,
      primaryAction: {
        label: "คัดกรอง SDQ",
        href: `/screening/sdq/${profile.studentId}`,
      },
      secondaryAction: {
        label: "ศูนย์คัดกรอง",
        href: `/screening?studentId=${profile.studentId}`,
      },
    },
    {
      stepNumber: 3,
      title: "ส่งเสริมและพัฒนา",
      subtitle: "แผนพัฒนา IDP & พฤติกรรม",
      icon: Sparkles,
      statusLabel: `${profile.activePlanCount} แผนพัฒนา`,
      statusTone: profile.activePlanCount > 0 ? ("info" as const) : ("neutral" as const),
      description: `เป้าหมายการพัฒนาและเสริมสร้างศักยภาพผู้เรียน`,
      primaryAction: {
        label: "แผนพัฒนา IDP",
        href: `/development-plans?studentId=${profile.studentId}`,
      },
      secondaryAction: {
        label: "คะแนนพฤติกรรม",
        href: `/behavior?studentId=${profile.studentId}`,
      },
    },
    {
      stepNumber: 4,
      title: "ป้องกัน & ช่วยเหลือ",
      subtitle: "เคสช่วยเหลือ & ให้คำปรึกษา",
      icon: HeartHandshake,
      statusLabel: `${profile.openSupportCount} เคสเปิดอยู่`,
      statusTone: profile.openSupportCount > 0 ? ("watch" as const) : ("normal" as const),
      description: `งานดูแลที่เปิดอยู่ ${profile.openActionCount} รายการ`,
      primaryAction: {
        label: "เปิดเคสช่วยเหลือ",
        href: `/support/new?studentId=${profile.studentId}`,
      },
      secondaryAction: {
        label: "ดูเคสทั้งหมด",
        href: `/support?studentId=${profile.studentId}`,
      },
    },
    {
      stepNumber: 5,
      title: "การส่งต่อ",
      subtitle: "ส่งต่อภายใน & สหวิชาชีพ",
      icon: Send,
      statusLabel: "ครูแนะแนว/ภายนอก",
      statusTone: "neutral" as const,
      description: `ส่งต่อไปยังผู้เชี่ยวชาญ โรงพยาบาล หรือหน่วยงานเฉพาะทาง`,
      primaryAction: {
        label: "สร้างเคสส่งต่อ",
        href: `/referrals/new?studentId=${profile.studentId}`,
      },
      secondaryAction: {
        label: "ประวัติส่งต่อ",
        href: `/referrals?studentId=${profile.studentId}`,
      },
    },
  ]

  return (
    <section className="rounded-xl border border-border bg-card p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <FileCheck2 className="size-4" />
            </div>
            <h2 className="text-base font-semibold text-foreground">
              เส้นทางระบบการดูแลช่วยเหลือนักเรียน 5 ขั้นตอน (สพฐ.)
            </h2>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            ติดตามและเข้าถึงกระบวนการดูแลช่วยเหลือผู้เรียนรายบุคคลตามระเบียบกระทรวงศึกษาธิการ
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">สถานะภาพรวม:</span>
          <StatusBadge status={riskTone} label={riskLabel} size="sm" />
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {steps.map((step) => {
          const Icon = step.icon
          return (
            <div
              key={step.stepNumber}
              className="flex flex-col justify-between rounded-lg border border-border/80 bg-background p-3.5 transition-colors hover:border-primary/40 hover:bg-muted/10"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="flex size-5 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                    {step.stepNumber}
                  </span>
                  <StatusBadge status={step.statusTone} label={step.statusLabel} size="sm" />
                </div>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5 font-semibold text-foreground text-sm">
                    <Icon className="size-3.5 text-muted-foreground shrink-0" />
                    <span className="truncate">{step.title}</span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{step.subtitle}</p>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>

              <div className="mt-4 flex flex-col gap-1.5 border-t border-border/50 pt-3">
                <Button
                  nativeButton={false}
                  variant="outline"
                  size="sm"
                  className="w-full justify-between text-xs h-7 px-2 font-medium"
                  render={<Link href={step.primaryAction.href} />}
                >
                  <span>{step.primaryAction.label}</span>
                  <ArrowUpRight className="size-3 text-muted-foreground" />
                </Button>
                {step.secondaryAction ? (
                  <Button
                    nativeButton={false}
                    variant="ghost"
                    size="sm"
                    className="w-full justify-between text-xs h-6 px-2 text-muted-foreground hover:text-foreground"
                    render={<Link href={step.secondaryAction.href} />}
                  >
                    <span>{step.secondaryAction.label}</span>
                    <ArrowUpRight className="size-3" />
                  </Button>
                ) : null}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
