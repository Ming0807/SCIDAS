import React from "react"
import { ChevronRight } from "lucide-react"

export function MobileSupportHistory() {
  return (
    <div className="px-4 mb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[13px] font-bold text-slate-800">ประวัติการช่วยเหลือ</h3>
        <button className="flex items-center gap-0.5 text-[11px] font-bold text-indigo-600">
          ดูทั้งหมด
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left min-w-[400px]">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="py-2.5 px-3 text-[10px] font-medium text-slate-500">วันที่</th>
                <th className="py-2.5 px-3 text-[10px] font-medium text-slate-500">การดำเนินการ</th>
                <th className="py-2.5 px-3 text-[10px] font-medium text-slate-500">ผู้ดำเนินการ</th>
                <th className="py-2.5 px-3 text-[10px] font-medium text-slate-500">ผลการติดตาม</th>
                <th className="py-2.5 w-8"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-[11px]">
              <tr className="hover:bg-slate-50 transition-colors">
                <td className="py-3 px-3 text-slate-600 whitespace-nowrap">15 เม.ย. 2567</td>
                <td className="py-3 px-3 font-medium text-slate-800">พูดคุยนักเรียนรายบุคคล</td>
                <td className="py-3 px-3 text-slate-600">ครูประจำชั้น</td>
                <td className="py-3 px-3 text-slate-600">นักเรียนเปิดใจมากขึ้น</td>
                <td className="py-3 pr-2 text-right">
                  <ChevronRight className="w-4 h-4 text-slate-300" />
                </td>
              </tr>
              <tr className="hover:bg-slate-50 transition-colors">
                <td className="py-3 px-3 text-slate-600 whitespace-nowrap">2 เม.ย. 2567</td>
                <td className="py-3 px-3 font-medium text-slate-800">เชิญผู้ปกครองพบ</td>
                <td className="py-3 px-3 text-slate-600">ครูที่ปรึกษา</td>
                <td className="py-3 px-3 text-slate-600">รับทราบปัญหา</td>
                <td className="py-3 pr-2 text-right">
                  <ChevronRight className="w-4 h-4 text-slate-300" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
