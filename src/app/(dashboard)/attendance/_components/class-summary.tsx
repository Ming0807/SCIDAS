import React from "react"

export function ClassSummary() {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] border border-slate-100">
      <h3 className="font-bold text-slate-800 text-sm mb-4">สรุปตามห้องเรียน</h3>
      
      <table className="w-full text-left text-xs mb-4">
        <thead className="text-slate-500 font-medium border-b border-slate-100">
          <tr>
            <th className="pb-2 font-normal">ห้องเรียน</th>
            <th className="pb-2 font-normal text-center w-32">มาเรียน (%)</th>
            <th className="pb-2 font-normal text-center w-16">ขาด (คน)</th>
            <th className="pb-2 font-normal text-center w-20">มาสาย (คน)</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          
          {/* ป.3 */}
          <tr>
            <td className="py-2.5 font-medium text-slate-700">ป.3</td>
            <td className="py-2.5 px-2">
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: '94.1%' }}></div>
                </div>
                <span className="text-[10px] text-slate-500 font-medium w-8">94.1%</span>
              </div>
            </td>
            <td className="py-2.5 text-center font-bold text-slate-700">2</td>
            <td className="py-2.5 text-center font-bold text-slate-700">1</td>
          </tr>

          {/* ป.4 */}
          <tr>
            <td className="py-2.5 font-medium text-slate-700">ป.4</td>
            <td className="py-2.5 px-2">
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: '91.7%' }}></div>
                </div>
                <span className="text-[10px] text-slate-500 font-medium w-8">91.7%</span>
              </div>
            </td>
            <td className="py-2.5 text-center font-bold text-slate-700">3</td>
            <td className="py-2.5 text-center font-bold text-slate-700">2</td>
          </tr>

          {/* ป.5 */}
          <tr>
            <td className="py-2.5 font-medium text-slate-700">ป.5</td>
            <td className="py-2.5 px-2">
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: '90.2%' }}></div>
                </div>
                <span className="text-[10px] text-slate-500 font-medium w-8">90.2%</span>
              </div>
            </td>
            <td className="py-2.5 text-center font-bold text-slate-700">2</td>
            <td className="py-2.5 text-center font-bold text-slate-700">3</td>
          </tr>

          {/* ป.6 */}
          <tr>
            <td className="py-2.5 font-medium text-slate-700">ป.6</td>
            <td className="py-2.5 px-2">
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: '92.3%' }}></div>
                </div>
                <span className="text-[10px] text-slate-500 font-medium w-8">92.3%</span>
              </div>
            </td>
            <td className="py-2.5 text-center font-bold text-slate-700">1</td>
            <td className="py-2.5 text-center font-bold text-slate-700">0</td>
          </tr>

        </tbody>
      </table>

      <button className="w-full text-center text-xs font-medium text-blue-600 hover:text-blue-700 py-2 border-t border-slate-100">
        ดูรายงานตามห้องเรียน
      </button>

    </div>
  )
}
