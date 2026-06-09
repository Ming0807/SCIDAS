import React from "react"
import { Eye, Download, MoreVertical } from "lucide-react"

export function DesktopLatestReports() {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[14px] font-bold text-slate-800">รายงานล่าสุด</h3>
      </div>

      <div className="flex-1 overflow-x-auto no-scrollbar">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="pb-3 text-[11px] font-medium text-slate-500">ชื่อรายงาน</th>
              <th className="pb-3 text-[11px] font-medium text-slate-500">ประเภท</th>
              <th className="pb-3 text-[11px] font-medium text-slate-500">วันที่สร้าง</th>
              <th className="pb-3 text-[11px] font-medium text-slate-500">สร้างโดย</th>
              <th className="pb-3 text-[11px] font-medium text-slate-500">การเข้าถึง</th>
              <th className="pb-3 text-[11px] font-medium text-slate-500 text-center">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 text-[11px]">
            {/* Report 1 */}
            <tr className="hover:bg-slate-50/50 transition-colors group cursor-pointer">
              <td className="py-3 pr-4 font-bold text-slate-700 whitespace-nowrap">รายงานสรุปผลการดูแลช่วยเหลือ ภาคเรียนที่ 1/2567</td>
              <td className="py-3 pr-4 text-slate-600">รายงานสรุป</td>
              <td className="py-3 pr-4 text-slate-600 whitespace-nowrap">20 พ.ค. 2567</td>
              <td className="py-3 pr-4 text-slate-600 whitespace-nowrap">นางสาวจันทร์จิรา</td>
              <td className="py-3 pr-4 text-slate-600">ครูที่ปรึกษา</td>
              <td className="py-3">
                <div className="flex items-center justify-center gap-3">
                  <button className="text-indigo-600 hover:text-indigo-800"><Eye className="w-4 h-4" /></button>
                  <button className="text-indigo-600 hover:text-indigo-800"><Download className="w-4 h-4" /></button>
                  <button className="text-slate-400 hover:text-slate-600"><MoreVertical className="w-4 h-4" /></button>
                </div>
              </td>
            </tr>

            {/* Report 2 */}
            <tr className="hover:bg-slate-50/50 transition-colors group cursor-pointer">
              <td className="py-3 pr-4 font-bold text-slate-700 whitespace-nowrap">รายงานนักเรียนกลุ่มเสี่ยงด้านพฤติกรรม</td>
              <td className="py-3 pr-4 text-slate-600">รายงานกลุ่มเสี่ยง</td>
              <td className="py-3 pr-4 text-slate-600 whitespace-nowrap">18 พ.ค. 2567</td>
              <td className="py-3 pr-4 text-slate-600 whitespace-nowrap">นางสาวจันทร์จิรา</td>
              <td className="py-3 pr-4 text-slate-600">ครูที่ปรึกษา</td>
              <td className="py-3">
                <div className="flex items-center justify-center gap-3">
                  <button className="text-indigo-600 hover:text-indigo-800"><Eye className="w-4 h-4" /></button>
                  <button className="text-indigo-600 hover:text-indigo-800"><Download className="w-4 h-4" /></button>
                  <button className="text-slate-400 hover:text-slate-600"><MoreVertical className="w-4 h-4" /></button>
                </div>
              </td>
            </tr>

            {/* Report 3 */}
            <tr className="hover:bg-slate-50/50 transition-colors group cursor-pointer">
              <td className="py-3 pr-4 font-bold text-slate-700 whitespace-nowrap">รายงานผลการพัฒนารายบุคคล (Individual Plan)</td>
              <td className="py-3 pr-4 text-slate-600">รายงานพัฒนา</td>
              <td className="py-3 pr-4 text-slate-600 whitespace-nowrap">15 พ.ค. 2567</td>
              <td className="py-3 pr-4 text-slate-600 whitespace-nowrap">นางสาวจันทร์จิรา</td>
              <td className="py-3 pr-4 text-slate-600">ครูที่ปรึกษา</td>
              <td className="py-3">
                <div className="flex items-center justify-center gap-3">
                  <button className="text-indigo-600 hover:text-indigo-800"><Eye className="w-4 h-4" /></button>
                  <button className="text-indigo-600 hover:text-indigo-800"><Download className="w-4 h-4" /></button>
                  <button className="text-slate-400 hover:text-slate-600"><MoreVertical className="w-4 h-4" /></button>
                </div>
              </td>
            </tr>

            {/* Report 4 */}
            <tr className="hover:bg-slate-50/50 transition-colors group cursor-pointer">
              <td className="py-3 pr-4 font-bold text-slate-700 whitespace-nowrap">รายงานการให้คำปรึกษารายกรณี</td>
              <td className="py-3 pr-4 text-slate-600">รายงานการให้คำปรึกษา</td>
              <td className="py-3 pr-4 text-slate-600 whitespace-nowrap">10 พ.ค. 2567</td>
              <td className="py-3 pr-4 text-slate-600 whitespace-nowrap">นางสาวจันทร์จิรา</td>
              <td className="py-3 pr-4 text-slate-600">ครูที่ปรึกษา</td>
              <td className="py-3">
                <div className="flex items-center justify-center gap-3">
                  <button className="text-indigo-600 hover:text-indigo-800"><Eye className="w-4 h-4" /></button>
                  <button className="text-indigo-600 hover:text-indigo-800"><Download className="w-4 h-4" /></button>
                  <button className="text-slate-400 hover:text-slate-600"><MoreVertical className="w-4 h-4" /></button>
                </div>
              </td>
            </tr>

            {/* Report 5 */}
            <tr className="hover:bg-slate-50/50 transition-colors group cursor-pointer border-b border-slate-50">
              <td className="py-3 pr-4 font-bold text-slate-700 whitespace-nowrap">รายงานสรุปสำหรับผู้บริหาร</td>
              <td className="py-3 pr-4 text-slate-600">รายงานสำหรับผู้บริหาร</td>
              <td className="py-3 pr-4 text-slate-600 whitespace-nowrap">5 พ.ค. 2567</td>
              <td className="py-3 pr-4 text-slate-600 whitespace-nowrap">นางสาวจันทร์จิรา</td>
              <td className="py-3 pr-4 text-slate-600">ผู้บริหาร</td>
              <td className="py-3">
                <div className="flex items-center justify-center gap-3">
                  <button className="text-indigo-600 hover:text-indigo-800"><Eye className="w-4 h-4" /></button>
                  <button className="text-indigo-600 hover:text-indigo-800"><Download className="w-4 h-4" /></button>
                  <button className="text-slate-400 hover:text-slate-600"><MoreVertical className="w-4 h-4" /></button>
                </div>
              </td>
            </tr>

          </tbody>
        </table>
      </div>

      <div className="mt-auto pt-4 flex justify-center">
        <button className="px-6 py-2 border border-indigo-100 text-indigo-600 font-bold text-[12px] rounded-xl hover:bg-indigo-50 transition-colors">
          ดูรายงานทั้งหมด
        </button>
      </div>
    </div>
  )
}
