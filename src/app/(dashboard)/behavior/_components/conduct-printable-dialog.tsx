"use client"

import { Award, Printer, ShieldAlert, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import type { StudentConductItem } from "@/lib/behavior-constants"

interface ConductPrintableDialogProps {
  isOpen: boolean
  onClose: () => void
  student: StudentConductItem
  docType: "notice" | "certificate"
}

export function ConductPrintableDialog({
  isOpen,
  onClose,
  student,
  docType,
}: ConductPrintableDialogProps) {
  if (!isOpen) return null

  const handlePrint = () => {
    window.print()
  }

  const currentDateThai = new Intl.DateTimeFormat("th-TH", {
    dateStyle: "long",
  }).format(new Date())

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-2 sm:p-4 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-3xl rounded-2xl bg-card border border-border shadow-2xl overflow-hidden my-auto max-h-[95vh] flex flex-col">
        {/* Modal Controls Bar (Hidden during print) */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/30 print:hidden shrink-0">
          <div className="flex items-center gap-2">
            {docType === "notice" ? (
              <ShieldAlert className="size-5 text-rose-600" />
            ) : (
              <Award className="size-5 text-emerald-600" />
            )}
            <div>
              <h3 className="text-base font-semibold text-foreground">
                {docType === "notice"
                  ? "หนังสือแจ้งการตัดคะแนนความประพฤติถึงผู้ปกครอง"
                  : "ใบรับรองความประพฤติและการทำความดี"}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                นักเรียน: {student.studentName} ({student.studentClass || "ไม่ระบุห้อง"})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              onClick={handlePrint}
              size="sm"
              className="text-xs gap-1.5"
            >
              <Printer className="size-4" />
              สั่งพิมพ์เอกสาร (Print)
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="text-xs gap-1"
            >
              <X className="size-4" />
              ปิด
            </Button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="p-8 overflow-y-auto flex-1 bg-white text-slate-900 print:p-0 print:m-0 font-sans leading-relaxed">
          <style dangerouslySetInnerHTML={{ __html: "@media print { @page { size: A4 portrait; margin: 12mm; } }" }} />
          {docType === "notice" ? (
            /* Document A: Notice to Parents */
            <div className="space-y-6 text-xs text-slate-800">
              <div className="text-center space-y-1 pb-4 border-b-2 border-slate-900">
                <h1 className="text-base font-bold text-slate-950">
                  หนังสือแจ้งเตือนการตัดคะแนนความประพฤตินักเรียน
                </h1>
                <p className="text-xs text-slate-700">
                  ตามระเบียบกระทรวงศึกษาธิการ ว่าด้วยการลงโทษนักเรียนและนักศึกษา พ.ศ. ๒๕๔๘
                </p>
                <p className="text-xs text-slate-600 pt-1">
                  วันที่ออกหนังสือ: {currentDateThai}
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <p>
                  <strong>เรื่อง:</strong> แจ้งคะแนนความประพฤติคงเหลือและการร่วมมือปรับปรุงพฤติกรรม
                </p>
                <p>
                  <strong>เรียน:</strong> ผู้ปกครองของ <strong>{student.studentName}</strong> (ห้อง {student.studentClass || "ไม่ระบุ"})
                </p>
                <p className="indent-8 text-justify">
                  ด้วยกลุ่มบริหารกิจการนักเรียนและงานวินัยสถานศึกษา ได้ดำเนินการติดตามและประเมินความประพฤติของนักเรียนในความปกครองของท่าน เพื่อส่งเสริมระเบียบวินัยและความปลอดภัยตามแนวทางระบบดูแลช่วยเหลือนักเรียน สพฐ.
                </p>
                <p className="indent-8 text-justify">
                  สถานศึกษาขอเรียนแจ้งว่า ปัจจุบันนักเรียนมีสถิติการถูกตัดคะแนนความประพฤติสะสม <strong>{student.deductedPoints} คะแนน</strong> (มีคะแนนจิตอาสา/ความดีบวกเพิ่ม {student.addedPoints} คะแนน) ส่งผลให้มีคะแนนความประพฤติคงเหลือ <strong>{student.finalScore} / ๑๐๐ คะแนน</strong> ซึ่งจัดอยู่ในเกณฑ์ <strong>&quot;{student.tierLabel}&quot;</strong>
                </p>
                <p className="indent-8 text-justify">
                  จึงใคร่ขอความอนุเคราะห์จากท่านผู้ปกครองร่วมกำกับดูแลและประสานงานกับครูประจำชั้น เพื่อหาแนวทางส่งเสริมและปรับพฤติกรรมเชิงบวกร่วมกันต่อไป
                </p>
              </div>

              {/* 3 Signatures */}
              <div className="pt-8 grid grid-cols-3 gap-6 text-center text-micro text-slate-800 break-inside-avoid">
                <div className="space-y-12">
                  <p>ลงชื่อ....................................................</p>
                  <div>
                    <p>(....................................................)</p>
                    <p className="text-slate-600 mt-0.5">ครูประจำชั้น / ครูที่ปรึกษา</p>
                  </div>
                </div>

                <div className="space-y-12">
                  <p>ลงชื่อ....................................................</p>
                  <div>
                    <p>(....................................................)</p>
                    <p className="text-slate-600 mt-0.5">หัวหน้างานกิจการนักเรียน</p>
                  </div>
                </div>

                <div className="space-y-12">
                  <p>ลงชื่อ....................................................</p>
                  <div>
                    <p>(....................................................)</p>
                    <p className="text-slate-600 mt-0.5">ผู้อำนวยการสถานศึกษา</p>
                  </div>
                </div>
              </div>

              {/* Tear-off slip for parents */}
              <div className="mt-8 pt-4 border-t-2 border-dashed border-slate-400 break-inside-avoid">
                <p className="text-center font-bold text-micro text-slate-600 mb-2">
                  (ส่วนล่างสำหรับตัดส่งคืนสถานศึกษา)
                </p>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-300 space-y-3">
                  <p className="font-semibold">
                    ใบตอบรับการรับทราบผลคะแนนความประพฤติของนักเรียน
                  </p>
                  <p className="indent-6">
                    ข้าพเจ้า (นาย/นาง/นางสาว).................................................................... ผู้ปกครองของ <strong>{student.studentName}</strong> ได้รับทราบผลคะแนนความประพฤติคงเหลือ {student.finalScore} คะแนน เรียบร้อยแล้ว และยินดีให้ความร่วมมือกับทางสถานศึกษา
                  </p>
                  <div className="pt-2 text-right">
                    <p>ลงชื่อ.................................................................... ผู้ปกครอง</p>
                    <p className="text-slate-500 mt-0.5">วันที่............/............/............</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Document B: Certificate of Good Conduct */
            <div className="p-6 border-4 border-double border-slate-700 rounded-2xl space-y-6 text-center text-slate-900">
              <div className="space-y-2 pt-4">
                <div className="inline-flex size-14 items-center justify-center rounded-full bg-amber-50 text-amber-600 border border-amber-300">
                  <Award className="size-8" />
                </div>
                <h1 className="text-xl font-bold tracking-tight text-slate-950">
                  ใบรับรองความประพฤติและคุณงามความดี
                </h1>
                <p className="text-xs text-slate-600">
                  ระบบดูแลช่วยเหลือนักเรียน สำนักงานคณะกรรมการการศึกษาขั้นพื้นฐาน (สพฐ.)
                </p>
              </div>

              <div className="py-4 space-y-4 text-sm leading-relaxed max-w-lg mx-auto">
                <p className="text-xs text-slate-700">
                  หนังสือฉบับนี้ให้ไว้เพื่อรับรองว่า
                </p>
                <h2 className="text-lg font-bold text-slate-950 underline decoration-slate-400">
                  {student.studentName}
                </h2>
                <p className="text-xs text-slate-800">
                  นักเรียนชั้น <strong>{student.studentClass || "ไม่ระบุ"}</strong>
                </p>
                <p className="text-xs text-slate-700 indent-6 text-justify">
                  เป็นผู้มีความประพฤติดี มีระเบียบวินัย ปฏิบัติตามกฎของสถานศึกษาอย่างเคร่งครัด ได้รับการประเมินคะแนนความประพฤติรวม <strong>{student.finalScore} / ๑๐๐ คะแนน</strong> อยู่ในเกณฑ์ <strong>&quot;{student.tierLabel}&quot;</strong> และไม่มีประวัติการกระทำผิดวินัยร้ายแรงใดๆ
                </p>
                <p className="text-xs text-slate-700">
                  ให้ไว้ ณ วันที่ {currentDateThai}
                </p>
              </div>

              <div className="pt-8 pb-4 grid grid-cols-2 gap-8 text-center text-xs text-slate-800">
                <div className="space-y-12">
                  <p>ลงชื่อ....................................................</p>
                  <div>
                    <p>(....................................................)</p>
                    <p className="text-slate-600 mt-0.5">ครูประจำชั้น / ครูที่ปรึกษา</p>
                  </div>
                </div>

                <div className="space-y-12">
                  <p>ลงชื่อ....................................................</p>
                  <div>
                    <p>(....................................................)</p>
                    <p className="text-slate-600 mt-0.5">ผู้อำนวยการสถานศึกษา</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
