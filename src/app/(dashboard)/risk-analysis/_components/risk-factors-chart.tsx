import React from "react"

export function RiskFactorsChart() {
  return (
    <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col xl:flex-row gap-6 min-w-0">
      <div className="flex-1 flex flex-col h-full relative pb-4 min-w-0">
        <h3 className="text-[14px] font-bold text-slate-800 mb-6">ปัจจัยเสี่ยงที่พบ</h3>
        
        <div className="flex items-center justify-center flex-1 relative mb-4">
          <svg viewBox="0 0 100 100" className="w-[180px] h-[180px] transform -rotate-90 drop-shadow-sm">
            {/* Red - ผลการเรียน */}
            <circle cx="50" cy="50" r="40" fill="none" stroke="#ef4444" strokeWidth="16" strokeDasharray="29 71" strokeDashoffset="0" />
            {/* Orange - การมาเรียน */}
            <circle cx="50" cy="50" r="40" fill="none" stroke="#f97316" strokeWidth="16" strokeDasharray="22 78" strokeDashoffset="-29" />
            {/* Yellow - พฤติกรรม */}
            <circle cx="50" cy="50" r="40" fill="none" stroke="#eab308" strokeWidth="16" strokeDasharray="20 80" strokeDashoffset="-51" />
            {/* Green - ครอบครัว */}
            <circle cx="50" cy="50" r="40" fill="none" stroke="#22c55e" strokeWidth="16" strokeDasharray="15 85" strokeDashoffset="-71" />
            {/* Blue - สุขภาพ */}
            <circle cx="50" cy="50" r="40" fill="none" stroke="#3b82f6" strokeWidth="16" strokeDasharray="9 91" strokeDashoffset="-86" />
            {/* Purple - เศรษฐกิจ */}
            <circle cx="50" cy="50" r="40" fill="none" stroke="#a855f7" strokeWidth="16" strokeDasharray="5 95" strokeDashoffset="-95" />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <svg className="w-6 h-6 text-slate-400 mb-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
            <span className="text-[10px] text-slate-500 font-medium">สัดส่วนปัจจัยเสี่ยง</span>
          </div>
        </div>

        <div className="text-[9px] text-slate-400 font-medium text-center absolute bottom-0 left-0 right-0">
          * นักเรียน 1 คน อาจมีหลายปัจจัยเสี่ยง
        </div>
      </div>

      <div className="w-px bg-slate-100 hidden xl:block"></div>

      <div className="xl:w-[240px] shrink-0 mt-6 xl:mt-0">
        <table className="w-full text-left text-[11px]">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="pb-2 font-bold text-slate-700">ปัจจัยเสี่ยง</th>
              <th className="pb-2 font-bold text-slate-700 text-right w-20">จำนวนนักเรียน</th>
              <th className="pb-2 font-bold text-slate-700 text-right w-16">ร้อยละ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            <tr>
              <td className="py-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm bg-red-500 shrink-0"></div>
                  <span className="text-slate-600 font-medium">ผลการเรียน</span>
                </div>
              </td>
              <td className="py-2.5 text-right font-medium text-slate-700">186</td>
              <td className="py-2.5 text-right font-bold text-red-600">28.97%</td>
            </tr>
            <tr>
              <td className="py-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm bg-orange-500 shrink-0"></div>
                  <span className="text-slate-600 font-medium">การมาเรียน</span>
                </div>
              </td>
              <td className="py-2.5 text-right font-medium text-slate-700">142</td>
              <td className="py-2.5 text-right font-bold text-orange-500">22.12%</td>
            </tr>
            <tr>
              <td className="py-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm bg-yellow-400 shrink-0"></div>
                  <span className="text-slate-600 font-medium">พฤติกรรม</span>
                </div>
              </td>
              <td className="py-2.5 text-right font-medium text-slate-700">128</td>
              <td className="py-2.5 text-right font-bold text-yellow-600">19.94%</td>
            </tr>
            <tr>
              <td className="py-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm bg-green-500 shrink-0"></div>
                  <span className="text-slate-600 font-medium">ครอบครัว</span>
                </div>
              </td>
              <td className="py-2.5 text-right font-medium text-slate-700">94</td>
              <td className="py-2.5 text-right font-bold text-green-500">14.64%</td>
            </tr>
            <tr>
              <td className="py-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm bg-blue-500 shrink-0"></div>
                  <span className="text-slate-600 font-medium">สุขภาพกาย/ใจ</span>
                </div>
              </td>
              <td className="py-2.5 text-right font-medium text-slate-700">60</td>
              <td className="py-2.5 text-right font-bold text-blue-500">9.33%</td>
            </tr>
            <tr>
              <td className="py-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm bg-purple-500 shrink-0"></div>
                  <span className="text-slate-600 font-medium">เศรษฐกิจ</span>
                </div>
              </td>
              <td className="py-2.5 text-right font-medium text-slate-700">32</td>
              <td className="py-2.5 text-right font-bold text-purple-500">4.98%</td>
            </tr>
          </tbody>
        </table>
      </div>

    </div>
  )
}
