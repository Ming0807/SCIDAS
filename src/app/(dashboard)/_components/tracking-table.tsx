import React from "react"

export function TrackingTable() {
  return (
    <div className="col-span-1 lg:col-span-7 rounded-2xl bg-white shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] border border-slate-100 p-6 flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-sm font-bold text-slate-800">นักเรียนที่ควรติดตามวันนี้</h3>
        <button className="text-[11px] text-blue-600 font-medium hover:underline">ดูทั้งหมด</button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-100 text-slate-500">
              <th className="pb-3 font-medium">ชื่อ</th>
              <th className="pb-3 font-medium">ชั้น</th>
              <th className="pb-3 font-medium">ความเสี่ยง</th>
              <th className="pb-3 font-medium">สาเหตุ</th>
              <th className="pb-3 font-medium text-right pr-2">สถานะ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            
            <tr className="group hover:bg-slate-50/50">
              <td className="py-3 flex items-center gap-3">
                <img src="https://api.dicebear.com/7.x/notionists/svg?seed=boy1" className="w-7 h-7 rounded-full bg-slate-100" alt="Avatar"/>
                <span className="font-semibold text-slate-800">เด็กชายกฤษดา ใจดี</span>
              </td>
              <td className="py-3 text-slate-600">ป.5</td>
              <td className="py-3"><span className="text-red-600 font-medium">เสี่ยงสูง</span></td>
              <td className="py-3 text-slate-600">ขาดเรียนต่อเนื่อง 5 วัน</td>
              <td className="py-3 text-right">
                <span className="inline-flex items-center px-2 py-1 rounded-md text-[10px] font-medium bg-purple-50 text-purple-600">รอการช่วยเหลือ</span>
              </td>
            </tr>

            <tr className="group hover:bg-slate-50/50">
              <td className="py-3 flex items-center gap-3">
                <img src="https://api.dicebear.com/7.x/notionists/svg?seed=girl1" className="w-7 h-7 rounded-full bg-slate-100" alt="Avatar"/>
                <span className="font-semibold text-slate-800">เด็กหญิงอริสรา คำดี</span>
              </td>
              <td className="py-3 text-slate-600">ป.4</td>
              <td className="py-3"><span className="text-amber-500 font-medium">เฝ้าระวัง</span></td>
              <td className="py-3 text-slate-600">ผลการเรียนต่ำ</td>
              <td className="py-3 text-right">
                <span className="inline-flex items-center px-2 py-1 rounded-md text-[10px] font-medium bg-blue-50 text-blue-600">กำลังติดตาม</span>
              </td>
            </tr>

            <tr className="group hover:bg-slate-50/50">
              <td className="py-3 flex items-center gap-3">
                <img src="https://api.dicebear.com/7.x/notionists/svg?seed=boy2" className="w-7 h-7 rounded-full bg-slate-100" alt="Avatar"/>
                <span className="font-semibold text-slate-800">เด็กชายศุภชัย รักเรียน</span>
              </td>
              <td className="py-3 text-slate-600">ป.6</td>
              <td className="py-3"><span className="text-amber-500 font-medium">เฝ้าระวัง</span></td>
              <td className="py-3 text-slate-600">พฤติกรรมไม่เหมาะสม</td>
              <td className="py-3 text-right">
                <span className="inline-flex items-center px-2 py-1 rounded-md text-[10px] font-medium bg-blue-50 text-blue-600">กำลังติดตาม</span>
              </td>
            </tr>

            <tr className="group hover:bg-slate-50/50">
              <td className="py-3 flex items-center gap-3">
                <img src="https://api.dicebear.com/7.x/notionists/svg?seed=girl2" className="w-7 h-7 rounded-full bg-slate-100" alt="Avatar"/>
                <span className="font-semibold text-slate-800">เด็กหญิงพิมพ์ชนก แสนดี</span>
              </td>
              <td className="py-3 text-slate-600">ป.3</td>
              <td className="py-3"><span className="text-amber-500 font-medium">เฝ้าระวัง</span></td>
              <td className="py-3 text-slate-600">ผลการเรียนต่ำ</td>
              <td className="py-3 text-right">
                <span className="inline-flex items-center px-2 py-1 rounded-md text-[10px] font-medium bg-purple-50 text-purple-600">รอการช่วยเหลือ</span>
              </td>
            </tr>

            <tr className="group hover:bg-slate-50/50">
              <td className="py-3 flex items-center gap-3">
                <img src="https://api.dicebear.com/7.x/notionists/svg?seed=boy3" className="w-7 h-7 rounded-full bg-slate-100" alt="Avatar"/>
                <span className="font-semibold text-slate-800">เด็กชายธนวัฒน์ สีสด</span>
              </td>
              <td className="py-3 text-slate-600">ป.5</td>
              <td className="py-3"><span className="text-red-600 font-medium">เสี่ยงสูง</span></td>
              <td className="py-3 text-slate-600">ขาดเรียนต่อเนื่อง 7 วัน</td>
              <td className="py-3 text-right">
                <span className="inline-flex items-center px-2 py-1 rounded-md text-[10px] font-medium bg-purple-50 text-purple-600">รอการช่วยเหลือ</span>
              </td>
            </tr>

          </tbody>
        </table>
      </div>
    </div>
  )
}
