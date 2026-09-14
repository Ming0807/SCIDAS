"use client"

import { useState } from "react"
import { Calendar, Home, MapPin, Printer, User, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { formatThaiShortDate } from "@/lib/student-care-formatters"
import type { HomeVisitRecord } from "@/lib/server/home-visit-read-models"
import type { StudentAttachmentItem } from "@/lib/server/student-care-read-models"

interface HomeVisitPrintableCardProps {
  record: HomeVisitRecord
  attachments?: StudentAttachmentItem[]
}

function getHousingLabel(condition: HomeVisitRecord["housingCondition"]) {
  const labels = {
    good: "ดี มีความมั่นคง ปลอดภัย และถูกสุขลักษณะ",
    moderate: "พอใช้ สภาพปานกลาง มีความปลอดภัยพอสมควร",
    poor: "ควรดูแล ต้องปรับปรุงสภาพแวดล้อมหรือสุขอนามัย",
    critical: "เร่งดูแล ทรุดโทรม หรือมีความเสี่ยงต่อสวัสดิภาพ",
  }
  return condition ? labels[condition] : "ไม่ระบุ"
}

export function HomeVisitPrintableCard({
  record,
  attachments = [],
}: HomeVisitPrintableCardProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handlePrint = () => {
    window.print()
  }

  // Combine images from record.images and image attachments
  const allImages = [
    ...record.images.map((img) => ({ url: img.imageUrl, caption: img.caption })),
    ...attachments
      .filter((a) => a.mimeType?.startsWith("image/") && a.downloadUrl)
      .map((a) => ({ url: a.downloadUrl as string, caption: a.fileName })),
  ]

  return (
    <>
      {/* Print Trigger Button */}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="gap-1.5 text-xs font-medium print:hidden"
      >
        <Printer className="size-4 text-muted-foreground" />
        <span>พิมพ์แบบเยี่ยมบ้าน (สพฐ.)</span>
      </Button>

      {/* Modal Dialog */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm print:static print:inset-auto print:bg-white print:p-0">
          <div className="flex max-h-[90vh] w-full max-w-4xl flex-col rounded-2xl border border-border bg-card shadow-2xl print:max-h-none print:w-full print:max-w-none print:rounded-none print:border-0 print:shadow-none">
            {/* Modal Controls (Hidden in Print) */}
            <div className="flex items-center justify-between border-b border-border p-4 print:hidden">
              <div className="flex items-center gap-2">
                <Printer className="size-5 text-primary" />
                <h3 className="text-base font-semibold text-foreground">
                  พิมพ์แบบบันทึกการเยี่ยมบ้านนักเรียน (สพฐ.)
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="default"
                  size="sm"
                  onClick={handlePrint}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold"
                >
                  <Printer className="size-4" />
                  <span>สั่งพิมพ์เอกสาร</span>
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="size-8 p-0 text-muted-foreground hover:text-foreground"
                >
                  <X className="size-4" />
                </Button>
              </div>
            </div>

            {/* Document Sheet */}
            <div className="flex-1 overflow-y-auto p-8 print:overflow-visible print:p-6 text-foreground bg-background">
              <div className="space-y-6">
                {/* Official Header */}
                <div className="text-center space-y-1 border-b-2 border-primary/20 pb-4">
                  <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                    สำนักงานคณะกรรมการการศึกษาขั้นพื้นฐาน • กระทรวงศึกษาธิการ
                  </p>
                  <h1 className="text-xl font-bold tracking-tight text-foreground">
                    แบบบันทึกการเยี่ยมบ้านนักเรียน รายบุคคล
                  </h1>
                  <p className="text-xs text-muted-foreground">
                    ตามแนวทางการดำเนินงานระบบการดูแลช่วยเหลือนักเรียนในสถานศึกษา
                  </p>
                </div>

                {/* Section 1: General Student Information */}
                <section className="space-y-3 rounded-lg border border-border bg-muted/10 p-4 text-xs">
                  <h2 className="text-sm font-bold text-foreground flex items-center gap-1.5 border-b border-border/60 pb-2">
                    <User className="size-4 text-primary" />
                    ส่วนที่ 1: ข้อมูลทั่วไปของนักเรียนและการเยี่ยมบ้าน
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div>
                      <span className="text-muted-foreground">ชื่อ - สกุล นักเรียน: </span>
                      <strong className="text-foreground">{record.studentName}</strong>
                    </div>
                    <div>
                      <span className="text-muted-foreground">รหัสนักเรียน: </span>
                      <strong className="text-foreground">{record.studentCode}</strong>
                    </div>
                    <div>
                      <span className="text-muted-foreground">ครูผู้เยี่ยมบ้าน: </span>
                      <strong className="text-foreground">{record.visitorName}</strong>
                    </div>
                    <div>
                      <span className="text-muted-foreground">วันที่เยี่ยมบ้าน: </span>
                      <strong className="text-foreground">{formatThaiShortDate(record.visitDate)}</strong>
                    </div>
                    <div>
                      <span className="text-muted-foreground">เวลาที่เยี่ยม: </span>
                      <strong className="text-foreground">{record.visitTime ? record.visitTime.slice(0, 5) : "ไม่ระบุ"} น.</strong>
                    </div>
                    <div>
                      <span className="text-muted-foreground">สถานะผลการเยี่ยม: </span>
                      <strong className="text-foreground">
                        {record.status === "urgent" ? "เร่งดูแลช่วยเหลือ" : record.status === "follow_up" ? "ต้องติดตามต่อเนื่อง" : "เยี่ยมเรียบร้อย (ปกติ)"}
                      </strong>
                    </div>
                  </div>
                </section>

                {/* Section 2: Environment & Housing */}
                <section className="space-y-3 rounded-lg border border-border bg-muted/10 p-4 text-xs">
                  <h2 className="text-sm font-bold text-foreground flex items-center gap-1.5 border-b border-border/60 pb-2">
                    <Home className="size-4 text-primary" />
                    ส่วนที่ 2: สภาพแวดล้อมที่อยู่อาศัยและการเดินทาง
                  </h2>
                  <div className="space-y-2">
                    <div>
                      <span className="text-muted-foreground">ที่อยู่ที่เยี่ยมบ้าน: </span>
                      <span className="text-foreground font-medium">{record.address ?? "ไม่ระบุที่อยู่"}</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div>
                        <span className="text-muted-foreground">สภาพบ้านและสิ่งแวดล้อม: </span>
                        <strong className="text-foreground">{getHousingLabel(record.housingCondition)}</strong>
                      </div>
                      <div>
                        <span className="text-muted-foreground">การเดินทางมาโรงเรียน: </span>
                        <strong className="text-foreground">{record.travelDifficulty ? "มีความยากลำบากในการเดินทาง" : "เดินทางสะดวก ปกติ"}</strong>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Section 3: Family & Relations */}
                <section className="space-y-3 rounded-lg border border-border bg-muted/10 p-4 text-xs">
                  <h2 className="text-sm font-bold text-foreground flex items-center gap-1.5 border-b border-border/60 pb-2">
                    <MapPin className="size-4 text-primary" />
                    ส่วนที่ 3: ข้อมูลครอบครัว ความสัมพันธ์ และการดูแล
                  </h2>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">สภาพปัญหาครอบครัว/เศรษฐกิจ: </span>
                      <strong className={record.hasFamilyProblem ? "text-rose-700" : "text-emerald-700"}>
                        {record.hasFamilyProblem ? "พบประเด็นปัญหาที่ควรได้รับการสนับสนุน" : "ไม่พบปัญหาความขัดแย้งหรือภาระวิกฤต"}
                      </strong>
                    </div>
                    {record.familyProblemDetail && (
                      <div className="rounded-md bg-background p-2.5 border border-border text-muted-foreground">
                        <span className="font-semibold text-foreground">รายละเอียดปัญหาครอบครัว: </span>
                        {record.familyProblemDetail}
                      </div>
                    )}
                    <div className="flex items-center gap-2 pt-1">
                      <span className="text-muted-foreground">ความต้องการติดตามดูแลต่อเนื่อง: </span>
                      <strong className={record.followUpNeeded ? "text-amber-700" : "text-muted-foreground"}>
                        {record.followUpNeeded ? "จำเป็นต้องติดตามอย่างใกล้ชิด" : "ยังไม่มีความจำเป็นต้องติดตามพิเศษ"}
                      </strong>
                    </div>
                    {record.followUpDetail && (
                      <div className="rounded-md bg-background p-2.5 border border-border text-muted-foreground">
                        <span className="font-semibold text-foreground">แผนการติดตาม: </span>
                        {record.followUpDetail}
                      </div>
                    )}
                  </div>
                </section>

                {/* Section 4: Teacher Assessment & Recommendations */}
                <section className="space-y-3 rounded-lg border border-border bg-muted/10 p-4 text-xs">
                  <h2 className="text-sm font-bold text-foreground flex items-center gap-1.5 border-b border-border/60 pb-2">
                    <Calendar className="size-4 text-primary" />
                    ส่วนที่ 4: สรุปผลการประเมินและแนวทางการดูแลช่วยเหลือของครูที่ปรึกษา
                  </h2>
                  <div className="space-y-2">
                    <div>
                      <p className="text-muted-foreground font-medium mb-1">ผลการประเมินโดยรวม:</p>
                      <div className="rounded-md bg-background p-3 border border-border text-foreground leading-relaxed">
                        {record.overallAssessment || "ครูที่ปรึกษาได้เข้าพบผู้ปกครองและเยี่ยมบ้านตามขั้นตอนเรียบร้อย นักเรียนมีสัมพันธภาพที่ดีกับสมาชิกในครอบครัวและมีพัฒนาการตามเกณฑ์"}
                      </div>
                    </div>
                    {record.suggestions && (
                      <div>
                        <p className="text-muted-foreground font-medium mb-1">ข้อเสนอแนะและแนวทางส่งเสริม:</p>
                        <div className="rounded-md bg-background p-3 border border-border text-foreground leading-relaxed">
                          {record.suggestions}
                        </div>
                      </div>
                    )}
                  </div>
                </section>

                {/* Section 5: Photo Gallery (if any) */}
                {allImages.length > 0 && (
                  <section className="space-y-3 rounded-lg border border-border bg-muted/10 p-4 text-xs">
                    <h2 className="text-sm font-bold text-foreground border-b border-border/60 pb-2">
                      ส่วนที่ 5: ภาพถ่ายประกอบการเยี่ยมบ้าน
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
                      {allImages.slice(0, 3).map((img, idx) => (
                        <div key={idx} className="space-y-1 rounded-md border border-border bg-background p-2">
                          <div className="aspect-4/3 w-full overflow-hidden rounded bg-muted">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={img.url}
                              alt={img.caption ?? `ภาพที่ ${idx + 1}`}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          {img.caption && (
                            <p className="text-center text-xs text-muted-foreground truncate">{img.caption}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Section 6: Official 3-Party Signatures */}
                <div className="pt-8 border-t-2 border-border/80">
                  <p className="text-center text-xs font-semibold text-muted-foreground mb-8">
                    ขอรับรองว่าข้อความข้างต้นเป็นความจริงทุกประการ
                  </p>
                  <div className="grid grid-cols-3 gap-4 text-center text-xs">
                    {/* 1. Parent/Guardian */}
                    <div className="space-y-12">
                      <p className="font-medium text-muted-foreground">ลงชื่อ..................................................</p>
                      <div>
                        <p className="font-semibold text-foreground">(..................................................)</p>
                        <p className="text-muted-foreground">ผู้ปกครองนักเรียน (ผู้ให้ข้อมูล)</p>
                        <p className="text-muted-foreground">วันที่ ......./......./.......</p>
                      </div>
                    </div>

                    {/* 2. Homeroom Teacher */}
                    <div className="space-y-12">
                      <p className="font-medium text-muted-foreground">ลงชื่อ..................................................</p>
                      <div>
                        <p className="font-semibold text-foreground">({record.visitorName})</p>
                        <p className="text-muted-foreground">ครูที่ปรึกษา / ผู้เยี่ยมบ้าน</p>
                        <p className="text-muted-foreground">วันที่ ......./......./.......</p>
                      </div>
                    </div>

                    {/* 3. School Principal */}
                    <div className="space-y-12">
                      <p className="font-medium text-muted-foreground">ลงชื่อ..................................................</p>
                      <div>
                        <p className="font-semibold text-foreground">(..................................................)</p>
                        <p className="text-muted-foreground">ผู้อำนวยการสถานศึกษา</p>
                        <p className="text-muted-foreground">วันที่ ......./......./.......</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
