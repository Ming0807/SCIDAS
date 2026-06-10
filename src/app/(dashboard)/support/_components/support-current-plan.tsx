import React from "react"
import { Calendar, CheckCircle2, ChevronRight } from "lucide-react"

export function SupportCurrentPlan() {
  return (
    <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col h-full">
      <h3 className="text-sm font-semibold text-slate-800 mb-5">แผนการช่วยเหลือปัจจุบัน</h3>

      <div className="flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="text-sm font-semibold text-slate-800">แผนที่ 1/2567</div>
            <div className="text-xs text-slate-500 flex items-center gap-1 mt-1">
              <Calendar className="w-3 h-3" />
              เริ่มวันที่ 15 พ.ค. 2567
            </div>
          </div>
          <span className="px-2.5 py-1 bg-emerald-50 text-emerald-600 text-xs font-semibold rounded-md border border-emerald-100/50">
            กำลังดำเนินการ
          </span>
        </div>

        <div className="mb-5">
          <div className="text-xs font-semibold text-slate-500 mb-1">เป้าหมาย</div>
          <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-100">
            พัฒนาผลการเรียนและปรับพฤติกรรมให้เหมาะสม
          </p>
        </div>

        <div className="mb-6">
          <div className="text-xs font-semibold text-slate-500 mb-2">แนวทางการช่วยเหลือ</div>
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center text-xs">
              <div className="flex items-center gap-2 text-slate-700 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                ให้คำปรึกษารายบุคคล
              </div>
              <span className="text-slate-500 text-xs">ทุกสัปดาห์</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <div className="flex items-center gap-2 text-slate-700 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                ติดตามผลการเรียน
              </div>
              <span className="text-slate-500 text-xs">สัปดาห์ละครั้ง</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <div className="flex items-center gap-2 text-slate-700 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                ประสานผู้ปกครอง
              </div>
              <span className="text-slate-500 text-xs">ทุก 2 สัปดาห์</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <div className="flex items-center gap-2 text-slate-700 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                กิจกรรมเสริมสร้างทักษะอารมณ์
              </div>
              <span className="text-slate-500 text-xs">เข้าร่วมแล้ว 3 ครั้ง</span>
            </div>
          </div>
        </div>

      </div>

      <button className="w-full flex items-center justify-center gap-1 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors mt-auto">
        ดูรายละเอียดแผน
        <ChevronRight className="w-4 h-4" />
      </button>

    </div>
  )
}
