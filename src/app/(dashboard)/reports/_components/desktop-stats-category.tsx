import React from "react"

export function DesktopStatsCategory() {
  return (
    <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm h-full flex flex-col">
      <h3 className="text-sm font-bold text-slate-800 mb-6">สถิติจำแนกตามด้าน</h3>
      
      <div className="flex flex-col xl:flex-row gap-6 items-center justify-center flex-1">
        
        {/* Donut Chart */}
        <div className="relative w-[180px] h-[180px] shrink-0">
          <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
            {/* Red 28.97% */}
            <circle cx="50" cy="50" r="40" fill="none" stroke="#ef4444" strokeWidth="20" strokeDasharray="28.97 71.03" strokeDashoffset="0" />
            {/* Orange 22.12% */}
            <circle cx="50" cy="50" r="40" fill="none" stroke="#f97316" strokeWidth="20" strokeDasharray="22.12 77.88" strokeDashoffset="-28.97" />
            {/* Yellow 19.94% */}
            <circle cx="50" cy="50" r="40" fill="none" stroke="#eab308" strokeWidth="20" strokeDasharray="19.94 80.06" strokeDashoffset="-51.09" />
            {/* Green 14.64% */}
            <circle cx="50" cy="50" r="40" fill="none" stroke="#22c55e" strokeWidth="20" strokeDasharray="14.64 85.36" strokeDashoffset="-71.03" />
            {/* Blue 9.33% */}
            <circle cx="50" cy="50" r="40" fill="none" stroke="#3b82f6" strokeWidth="20" strokeDasharray="9.33 90.67" strokeDashoffset="-85.67" />
            {/* Purple 4.98% */}
            <circle cx="50" cy="50" r="40" fill="none" stroke="#a855f7" strokeWidth="20" strokeDasharray="5 95" strokeDashoffset="-95" />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <svg className="w-6 h-6 text-slate-400 mb-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/></svg>
            <span className="text-xs font-bold text-slate-700">รวม 642 คน</span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex-1 w-full max-w-[200px]">
          <table className="w-full text-left text-xs">
            <tbody className="divide-y divide-slate-50">
              <tr>
                <td className="py-2.5">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-sm bg-red-500 shrink-0"></div>
                    <span className="text-slate-700 font-medium">ผลการเรียน</span>
                  </div>
                </td>
                <td className="py-2.5 text-right font-bold text-slate-800">186</td>
                <td className="py-2.5 text-right font-medium text-slate-500">28.97%</td>
              </tr>
              <tr>
                <td className="py-2.5">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-sm bg-orange-500 shrink-0"></div>
                    <span className="text-slate-700 font-medium">พฤติกรรม</span>
                  </div>
                </td>
                <td className="py-2.5 text-right font-bold text-slate-800">142</td>
                <td className="py-2.5 text-right font-medium text-slate-500">22.12%</td>
              </tr>
              <tr>
                <td className="py-2.5">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-sm bg-yellow-400 shrink-0"></div>
                    <span className="text-slate-700 font-medium">ครอบครัว</span>
                  </div>
                </td>
                <td className="py-2.5 text-right font-bold text-slate-800">128</td>
                <td className="py-2.5 text-right font-medium text-slate-500">19.94%</td>
              </tr>
              <tr>
                <td className="py-2.5">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-sm bg-green-500 shrink-0"></div>
                    <span className="text-slate-700 font-medium">สุขภาพกาย/ใจ</span>
                  </div>
                </td>
                <td className="py-2.5 text-right font-bold text-slate-800">94</td>
                <td className="py-2.5 text-right font-medium text-slate-500">14.64%</td>
              </tr>
              <tr>
                <td className="py-2.5">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-sm bg-blue-500 shrink-0"></div>
                    <span className="text-slate-700 font-medium">เศรษฐกิจ</span>
                  </div>
                </td>
                <td className="py-2.5 text-right font-bold text-slate-800">60</td>
                <td className="py-2.5 text-right font-medium text-slate-500">9.33%</td>
              </tr>
              <tr>
                <td className="py-2.5">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-sm bg-purple-500 shrink-0"></div>
                    <span className="text-slate-700 font-medium">อื่นๆ</span>
                  </div>
                </td>
                <td className="py-2.5 text-right font-bold text-slate-800">32</td>
                <td className="py-2.5 text-right font-medium text-slate-500">4.98%</td>
              </tr>
            </tbody>
          </table>
        </div>

      </div>
    </div>
  )
}
