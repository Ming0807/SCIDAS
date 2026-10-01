"use client"

import * as React from "react"
import { Phone, Mail, Building, Clock, Copy, Check, UserCheck, MessageSquare } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import type { ParentTeacherContact } from "@/lib/server/parent-read-models"

interface ParentTeacherContactDialogProps {
  teacherContact: ParentTeacherContact | null
  classroomName: string | null
}

export function ParentTeacherContactDialog({
  teacherContact,
  classroomName,
}: ParentTeacherContactDialogProps) {
  const [open, setOpen] = React.useState(false)
  const [copiedKey, setCopiedKey] = React.useState<string | null>(null)

  const handleCopy = (text: string, key: string, label: string) => {
    navigator.clipboard.writeText(text)
    setCopiedKey(key)
    toast.success(`คัดลอก ${label} เรียบร้อยแล้ว`)
    setTimeout(() => {
      setCopiedKey(null)
    }, 2000)
  }

  const homeroom = teacherContact?.homeroomTeacher
  const coTeacher = teacherContact?.coTeacher
  const school = teacherContact?.schoolContact

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            variant="outline"
            size="sm"
            className="inline-flex items-center gap-1.5 rounded-lg border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted"
          >
            <Phone className="size-3.5 text-primary" />
            <span>ติดต่อครูประจำชั้น</span>
          </Button>
        }
      />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base font-semibold">
            <UserCheck className="size-5 text-primary" />
            <span>ช่องทางติดต่อครูและโรงเรียน</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {classroomName ? `ห้องเรียน ${classroomName} · ` : ""}
            สำหรับปรึกษาเรื่องการเรียน พฤติกรรม หรือความต้องการพิเศษของนักเรียน
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-1 text-sm">
          {/* Homeroom Teacher */}
          <div className="rounded-lg border border-border bg-muted/30 p-3.5 space-y-2.5">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="inline-block rounded bg-primary/10 px-1.5 py-0.5 text-xs font-medium text-primary">
                  {homeroom?.position ?? "ครูประจำชั้น"}
                </span>
                <p className="mt-1 font-semibold text-foreground">
                  {homeroom?.name || "ครูประจำชั้น (อยู่ระหว่างจัดสรร)"}
                </p>
              </div>
            </div>

            {homeroom?.phone ? (
              <div className="flex items-center justify-between gap-2 pt-1 border-t border-border/60">
                <a
                  href={`tel:${homeroom.phone}`}
                  className="inline-flex items-center gap-2 text-xs font-medium text-primary hover:underline"
                >
                  <Phone className="size-3.5" />
                  <span>{homeroom.phone}</span>
                </a>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                  onClick={() => handleCopy(homeroom.phone!, "teacher_phone", "เบอร์โทรครู")}
                >
                  {copiedKey === "teacher_phone" ? (
                    <Check className="size-3 text-emerald-600" />
                  ) : (
                    <Copy className="size-3" />
                  )}
                  <span className="ml-1">คัดลอก</span>
                </Button>
              </div>
            ) : null}

            {homeroom?.email ? (
              <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-2 truncate">
                  <Mail className="size-3.5 shrink-0" />
                  <span className="truncate">{homeroom.email}</span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                  onClick={() => handleCopy(homeroom.email!, "teacher_email", "อีเมลครู")}
                >
                  {copiedKey === "teacher_email" ? (
                    <Check className="size-3 text-emerald-600" />
                  ) : (
                    <Copy className="size-3" />
                  )}
                  <span className="ml-1">คัดลอก</span>
                </Button>
              </div>
            ) : null}
          </div>

          {/* Co-teacher (if present) */}
          {coTeacher ? (
            <div className="rounded-lg border border-border bg-muted/20 p-3 space-y-2">
              <span className="inline-block rounded bg-muted px-1.5 py-0.5 text-xs font-medium text-muted-foreground">
                {coTeacher.position ?? "ครูประจำชั้นร่วม"}
              </span>
              <p className="font-medium text-foreground">{coTeacher.name}</p>
              {coTeacher.phone ? (
                <div className="flex items-center justify-between gap-2 pt-1 border-t border-border/60">
                  <a
                    href={`tel:${coTeacher.phone}`}
                    className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
                  >
                    <Phone className="size-3.5" />
                    <span>{coTeacher.phone}</span>
                  </a>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                    onClick={() => handleCopy(coTeacher.phone!, "co_phone", "เบอร์โทรครูร่วม")}
                  >
                    {copiedKey === "co_phone" ? (
                      <Check className="size-3 text-emerald-600" />
                    ) : (
                      <Copy className="size-3" />
                    )}
                    <span className="ml-1">คัดลอก</span>
                  </Button>
                </div>
              ) : null}
            </div>
          ) : null}

          {/* School Contact Card */}
          <div className="rounded-lg border border-border bg-card p-3 space-y-2 text-xs">
            <div className="flex items-center gap-2 font-medium text-foreground">
              <Building className="size-4 text-primary" />
              <span>{school?.name || "สำนักงานโรงเรียน"}</span>
            </div>
            {school?.phone ? (
              <div className="flex items-center justify-between gap-2 text-muted-foreground">
                <span>โทรศัพท์ส่วนกลาง: {school.phone}</span>
                <a
                  href={`tel:${school.phone}`}
                  className="font-medium text-primary hover:underline"
                >
                  โทรออก
                </a>
              </div>
            ) : null}
            {school?.address ? (
              <p className="text-muted-foreground leading-relaxed">
                ที่อยู่: {school.address}
              </p>
            ) : null}
            <div className="flex items-center gap-1.5 text-muted-foreground pt-1 border-t border-border/60">
              <Clock className="size-3.5 text-muted-foreground shrink-0" />
              <span>เวลาติดต่อทำการ: จันทร์ – ศุกร์ 08:30 – 16:30 น.</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-border pt-3">
          <p className="text-xs text-muted-foreground">
            หากมีเหตุฉุกเฉินนอกเวลาทำการ กรุณาติดต่อสายด่วนโรงเรียน
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setOpen(false)}
          >
            ปิด
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
