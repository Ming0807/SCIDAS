import React from "react"
import { ChevronRight } from "lucide-react"

export function TopRiskStudents() {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100 flex-1 flex flex-col min-w-0">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[14px] font-bold text-slate-800">นักเรียนที่มีความเสี่ยงสูงสุด</h3>
        <button className="text-[11px] font-bold text-blue-600 flex items-center hover:text-blue-700">
          ดูทั้งหมด
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex-1 overflow-x-auto">
        <table className="w-full text-left min-w-[500px]">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="py-2.5 px-3 text-[11px] font-medium text-slate-500 rounded-tl-lg">นักเรียน</th>
              <th className="py-2.5 px-3 text-[11px] font-medium text-slate-500 text-center">ระดับความเสี่ยง</th>
              <th className="py-2.5 px-3 text-[11px] font-medium text-slate-500">ปัจจัยเสี่ยงหลัก</th>
              <th className="py-2.5 px-3 text-[11px] font-medium text-slate-500 text-center rounded-tr-lg">คะแนนรวม</th>
              <th className="py-2.5 w-8"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 text-[12px]">
            {/* Student 1 */}
            <tr className="hover:bg-slate-50/50 transition-colors group cursor-pointer">
              <td className="py-3 px-3">
                <div className="flex items-center gap-2.5">
                  <img src="https://api.dicebear.com/7.x/notionists/svg?seed=boy1" alt="Avatar" className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 shrink-0" />
                  <div className="flex flex-col min-w-0">
                    <span className="font-bold text-slate-800 line-clamp-1 break-all">เด็กชายธนวัฒน์ ใจดี</span>
                    <span className="text-[10px] text-slate-500">ม.2/1 เลขที่ 5</span>
                  </div>
                </div>
              </td>
              <td className="py-3 px-3 text-center">
                <span className="text-[11px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-100">เสี่ยงสูง</span>
              </td>
              <td className="py-3 px-3 text-[11px] text-slate-600 font-medium">ผลการเรียน, พฤติกรรม, การมาเรียน</td>
              <td className="py-3 px-3 text-center">
                <span className="font-bold text-slate-800">20</span><span className="text-[10px] text-slate-400 font-normal">/25</span>
              </td>
              <td className="py-3 pr-2 text-right">
                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 ml-auto" />
              </td>
            </tr>

            {/* Student 2 */}
            <tr className="hover:bg-slate-50/50 transition-colors group cursor-pointer">
              <td className="py-3 px-3">
                <div className="flex items-center gap-2.5">
                  <img src="https://api.dicebear.com/7.x/notionists/svg?seed=girl1" alt="Avatar" className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 shrink-0" />
                  <div className="flex flex-col min-w-0">
                    <span className="font-bold text-slate-800 line-clamp-1 break-all">เด็กหญิงกนกวรรณ ศรีสุข</span>
                    <span className="text-[10px] text-slate-500">ม.3/2 เลขที่ 12</span>
                  </div>
                </div>
              </td>
              <td className="py-3 px-3 text-center">
                <span className="text-[11px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-100">เสี่ยงสูง</span>
              </td>
              <td className="py-3 px-3 text-[11px] text-slate-600 font-medium">ครอบครัว, พฤติกรรม</td>
              <td className="py-3 px-3 text-center">
                <span className="font-bold text-slate-800">18</span><span className="text-[10px] text-slate-400 font-normal">/25</span>
              </td>
              <td className="py-3 pr-2 text-right">
                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 ml-auto" />
              </td>
            </tr>

            {/* Student 3 */}
            <tr className="hover:bg-slate-50/50 transition-colors group cursor-pointer">
              <td className="py-3 px-3">
                <div className="flex items-center gap-2.5">
                  <img src="https://api.dicebear.com/7.x/notionists/svg?seed=boy2" alt="Avatar" className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 shrink-0" />
                  <div className="flex flex-col min-w-0">
                    <span className="font-bold text-slate-800 line-clamp-1 break-all">เด็กชายศราวุฒิ มั่นคง</span>
                    <span className="text-[10px] text-slate-500">ม.1/3 เลขที่ 8</span>
                  </div>
                </div>
              </td>
              <td className="py-3 px-3 text-center">
                <span className="text-[11px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-100">เสี่ยงสูง</span>
              </td>
              <td className="py-3 px-3 text-[11px] text-slate-600 font-medium">การมาเรียน, ผลการเรียน</td>
              <td className="py-3 px-3 text-center">
                <span className="font-bold text-slate-800">17</span><span className="text-[10px] text-slate-400 font-normal">/25</span>
              </td>
              <td className="py-3 pr-2 text-right">
                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 ml-auto" />
              </td>
            </tr>

            {/* Student 4 */}
            <tr className="hover:bg-slate-50/50 transition-colors group cursor-pointer border-b border-slate-50">
              <td className="py-3 px-3">
                <div className="flex items-center gap-2.5">
                  <img src="https://api.dicebear.com/7.x/notionists/svg?seed=girl2" alt="Avatar" className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 shrink-0" />
                  <div className="flex flex-col min-w-0">
                    <span className="font-bold text-slate-800 line-clamp-1 break-all">เด็กหญิงปภาวรินทร์ จันทร์ดี</span>
                    <span className="text-[10px] text-slate-500">ม.2/4 เลขที่ 21</span>
                  </div>
                </div>
              </td>
              <td className="py-3 px-3 text-center">
                <span className="text-[11px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-100">เสี่ยงสูง</span>
              </td>
              <td className="py-3 px-3 text-[11px] text-slate-600 font-medium">พฤติกรรม, อารมณ์</td>
              <td className="py-3 px-3 text-center">
                <span className="font-bold text-slate-800">16</span><span className="text-[10px] text-slate-400 font-normal">/25</span>
              </td>
              <td className="py-3 pr-2 text-right">
                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 ml-auto" />
              </td>
            </tr>

            {/* Student 5 */}
            <tr className="hover:bg-slate-50/50 transition-colors group cursor-pointer">
              <td className="py-3 px-3">
                <div className="flex items-center gap-2.5">
                  <img src="https://api.dicebear.com/7.x/notionists/svg?seed=boy3" alt="Avatar" className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 shrink-0" />
                  <div className="flex flex-col min-w-0">
                    <span className="font-bold text-slate-800 line-clamp-1 break-all">เด็กชายณัฐวุฒิ ทองคำ</span>
                    <span className="text-[10px] text-slate-500">ม.3/1 เลขที่ 3</span>
                  </div>
                </div>
              </td>
              <td className="py-3 px-3 text-center">
                <span className="text-[11px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-100">เสี่ยงสูง</span>
              </td>
              <td className="py-3 px-3 text-[11px] text-slate-600 font-medium">ผลการเรียน, การมาเรียน</td>
              <td className="py-3 px-3 text-center">
                <span className="font-bold text-slate-800">15</span><span className="text-[10px] text-slate-400 font-normal">/25</span>
              </td>
              <td className="py-3 pr-2 text-right">
                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 ml-auto" />
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100">
        <button className="w-full py-2 bg-indigo-50/50 hover:bg-indigo-50 border border-indigo-100 text-indigo-600 font-bold text-[12px] rounded-xl transition-colors">
          ดูรายชื่อนักเรียนทั้งหมด
        </button>
      </div>

    </div>
  )
}
