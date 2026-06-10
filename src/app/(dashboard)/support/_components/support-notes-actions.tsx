import React from "react"
import { CheckCircle2, Circle } from "lucide-react"

export function SupportNotesActions() {
  return (
    <div className="flex flex-col xl:flex-row gap-4 h-full">
      
      {/* Notes */}
      <div className="bg-[#fef9c3]/50 rounded-xl p-5 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-[#fef08a] flex-1 flex flex-col relative overflow-hidden">
        {/* Lined paper effect */}
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(transparent, transparent 27px, rgba(202, 138, 4, 0.1) 28px)', marginTop: '40px' }}></div>
        
        <h3 className="text-sm font-semibold text-amber-900 mb-3 relative z-10">หมายเหตุ</h3>
        <p className="text-sm text-amber-800 leading-[28px] relative z-10">
          นักเรียนมีพัฒนาการที่ดีขึ้นในด้านพฤติกรรมและการส่งงาน แต่ยังต้องเน้นการเพิ่มผลการเรียนในวิชาคณิตศาสตร์และวิทยาศาสตร์
        </p>
      </div>

      {/* Next Actions */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex-[1.5] flex flex-col h-full">
        <h3 className="text-sm font-semibold text-slate-800 mb-4">สิ่งที่ต้องดำเนินการต่อไป</h3>

        <div className="flex flex-col gap-3 flex-1">
          <div className="flex items-start gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100/50">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-semibold text-slate-700 line-through opacity-70">ติดตามผลการเรียน วิชาคณิตศาสตร์</div>
              <div className="text-xs text-slate-400">ภายใน 31 พ.ค. 2567</div>
            </div>
          </div>

          <div className="flex items-start gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100/50">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-semibold text-slate-700 line-through opacity-70">นัดหมายผู้ปกครองเข้าพบ</div>
              <div className="text-xs text-slate-400">ภายใน 5 มิ.ย. 2567</div>
            </div>
          </div>

          <div className="flex items-start gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
            <Circle className="w-5 h-5 text-slate-300 shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-semibold text-slate-800">ประเมินพฤติกรรมรายเดือน</div>
              <div className="text-xs text-slate-500">ภายใน 15 มิ.ย. 2567</div>
            </div>
          </div>
        </div>

        <button className="w-full flex items-center justify-center py-2.5 text-xs font-semibold text-slate-500 border border-slate-200 rounded-xl mt-4 hover:bg-slate-50 transition-colors">
          ดูแผนงานทั้งหมด
        </button>

      </div>

    </div>
  )
}
