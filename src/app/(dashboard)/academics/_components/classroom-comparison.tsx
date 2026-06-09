import React from "react"
import { ChevronDown } from "lucide-react"

export function ClassroomComparison() {
  const subjects = ["ภาษาไทย", "คณิตศาสตร์", "ภาษาอังกฤษ", "วิทยาศาสตร์", "สังคมศึกษา", "สุขศึกษา", "ศิลปะ", "การงานฯ", "เฉลี่ยรวม"]
  const classes = [
    { name: "ม.2/1", scores: [3.35, 3.28, 3.05, 2.95, 2.70, 2.60, 3.40, 2.85, 3.02] },
    { name: "ม.2/2", scores: [3.20, 3.05, 2.95, 2.85, 2.60, 2.55, 3.25, 2.75, 2.90] },
    { name: "ม.2/3", scores: [3.10, 2.88, 2.80, 2.70, 2.55, 2.45, 3.10, 2.60, 2.77] },
    { name: "ม.2/4", scores: [2.95, 2.70, 2.60, 2.55, 2.40, 2.40, 3.00, 2.45, 2.63] },
  ]

  const getColor = (score: number) => {
    if (score >= 3.0) return "bg-emerald-100 text-emerald-800"
    if (score >= 2.5) return "bg-amber-100 text-amber-800"
    return "bg-rose-100 text-rose-800"
  }

  return (
    <div className="bg-white rounded-2xl p-5 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100 flex flex-col h-full overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-slate-800">เปรียบเทียบผลการเรียนเฉลี่ยรายวิชา รายห้องเรียน</h3>
        <button className="flex items-center gap-1 text-[11px] font-medium text-slate-500 bg-slate-50 px-2 py-1 rounded border border-slate-100 hover:bg-slate-100">
          ม.2
          <ChevronDown className="w-3 h-3" />
        </button>
      </div>

      <div className="flex-1 overflow-x-auto no-scrollbar">
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead>
            <tr>
              <th className="px-3 py-2 text-[10px] font-bold text-slate-500 border-b border-slate-100 w-[10%]">ห้องเรียน</th>
              {subjects.map((subject, idx) => (
                <th key={idx} className="px-2 py-2 text-[10px] font-bold text-slate-500 border-b border-slate-100 text-center">{subject}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {classes.map((cls, idx) => (
              <tr key={idx} className="border-b border-slate-50 last:border-none">
                <td className="px-3 py-2.5 text-[11px] font-bold text-slate-700">{cls.name}</td>
                {cls.scores.map((score, sIdx) => (
                  <td key={sIdx} className="px-1 py-1 text-center">
                    <div className={`text-[10px] font-bold py-1 px-1.5 rounded-md w-full inline-block ${getColor(score)}`}>
                      {score.toFixed(2)}
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
