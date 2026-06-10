import React from "react"

export function GradeLevelSummary() {
  const grades = [
    { name: "ป.3", total: 32, present: { count: 30, pct: 93.8 }, absent: { count: 2, pct: 6.2 }, late: { count: 1, pct: 3.1 } },
    { name: "ป.4", total: 32, present: { count: 29, pct: 90.6 }, absent: { count: 3, pct: 9.4 }, late: { count: 2, pct: 6.3 } },
    { name: "ป.5", total: 32, present: { count: 29, pct: 90.6 }, absent: { count: 2, pct: 6.2 }, late: { count: 3, pct: 9.4 } },
    { name: "ป.6", total: 32, present: { count: 30, pct: 93.8 }, absent: { count: 1, pct: 3.1 }, late: { count: 0, pct: 0.0 } },
  ]

  const total = {
    name: "สรุปโรงเรียน", total: 128, present: { count: 118, pct: 92.2 }, absent: { count: 8, pct: 6.3 }, late: { count: 6, pct: 4.7 }
  }

  return (
    <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
      <div className="flex items-center gap-2 mb-6">
        <h3 className="font-bold text-slate-800 text-sm">สรุปการมาเรียนรายระดับชั้น</h3>
        <span className="text-xs text-slate-500">(เดือนพฤษภาคม 2567)</span>
      </div>

      <div className="flex flex-wrap lg:flex-nowrap justify-between gap-6 overflow-x-auto no-scrollbar pb-2">
        
        {/* Individual Grades */}
        <div className="flex flex-1 gap-6 min-w-max">
          {grades.map((grade, idx) => (
            <div key={idx} className="flex-1 flex flex-col min-w-[140px]">
              <div className="text-sm font-bold text-slate-800">{grade.name}</div>
              <div className="text-xs text-slate-500 mb-3">นักเรียน {grade.total} คน</div>
              
              <div className="flex items-center gap-3">
                {/* SVG Donut */}
                <div className="relative w-12 h-12 shrink-0">
                  <svg viewBox="0 0 42 42" className="w-full h-full transform -rotate-90 overflow-visible">
                    <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="var(--color-slate-100)" strokeWidth="6"></circle>
                    <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="var(--color-emerald-500)" strokeWidth="6" strokeDasharray={`${grade.present.pct} ${100-grade.present.pct}`} strokeDashoffset="0"></circle>
                  </svg>
                </div>
                
                {/* Legends */}
                <div className="flex-1 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" aria-hidden="true"></span>
                      <span className="text-slate-700">มาเรียน</span>
                    </div>
                    <div className="font-bold text-slate-800">{grade.present.count} <span className="font-normal text-slate-400">({grade.present.pct.toFixed(1)}%)</span></div>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500" aria-hidden="true"></span>
                      <span className="text-slate-700">ขาด</span>
                    </div>
                    <div className="font-bold text-slate-800">{grade.absent.count} <span className="font-normal text-slate-400">({grade.absent.pct.toFixed(1)}%)</span></div>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500" aria-hidden="true"></span>
                      <span className="text-slate-700">มาสาย</span>
                    </div>
                    <div className="font-bold text-slate-800">{grade.late.count} <span className="font-normal text-slate-400">({grade.late.pct.toFixed(1)}%)</span></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="hidden lg:block w-px bg-slate-100 mx-2"></div>

        {/* Total School */}
        <div className="flex flex-col min-w-[200px] border-t lg:border-t-0 pt-4 lg:pt-0 border-slate-100 w-full lg:w-auto">
          <div className="text-sm font-bold text-slate-800">{total.name}</div>
          <div className="text-xs text-slate-500 mb-3">นักเรียน {total.total} คน</div>
          
          <div className="flex items-center gap-4">
            {/* Larger Donut */}
            <div className="relative w-16 h-16 shrink-0">
              <svg viewBox="0 0 42 42" className="w-full h-full transform -rotate-90 overflow-visible">
                <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="var(--color-slate-100)" strokeWidth="6"></circle>
                <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="var(--color-emerald-500)" strokeWidth="6" strokeDasharray={`${total.present.pct} ${100-total.present.pct}`} strokeDashoffset="0"></circle>
              </svg>
            </div>
            
            {/* Legends */}
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" aria-hidden="true"></span>
                  <span className="text-slate-700 font-medium">มาเรียน</span>
                </div>
                <div className="font-bold text-slate-800">{total.present.count} <span className="text-xs font-normal text-slate-400">({total.present.pct.toFixed(1)}%)</span></div>
              </div>
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-500" aria-hidden="true"></span>
                  <span className="text-slate-700 font-medium">ขาด</span>
                </div>
                <div className="font-bold text-slate-800">{total.absent.count} <span className="text-xs font-normal text-slate-400">({total.absent.pct.toFixed(1)}%)</span></div>
              </div>
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-500" aria-hidden="true"></span>
                  <span className="text-slate-700 font-medium">มาสาย</span>
                </div>
                <div className="font-bold text-slate-800">{total.late.count} <span className="text-xs font-normal text-slate-400">({total.late.pct.toFixed(1)}%)</span></div>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  )
}
