import React from "react"
import { Eye, Edit2, ChevronLeft, ChevronRight } from "lucide-react"

export function AttendanceTable() {
  return (
    <div className="bg-white rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] border border-slate-100 flex flex-col h-full min-h-[400px] overflow-hidden">
      
      <div className="p-4 sm:p-5 border-b border-slate-100 flex justify-between items-center">
        <h3 className="font-bold text-slate-800 text-sm">รายการการมาเรียนวันนี้</h3>
      </div>

      <div className="flex-1 overflow-auto">
        <table className="w-full text-left text-[13px] whitespace-nowrap">
          <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100 sticky top-0 z-20">
            <tr>
              <th className="px-4 py-3 text-center w-12">#</th>
              <th className="px-4 py-3">รูป/ชื่อ</th>
              <th className="px-4 py-3">รหัสนักเรียน</th>
              <th className="px-4 py-3">ชั้น</th>
              <th className="px-4 py-3">สถานะ</th>
              <th className="px-4 py-3">เวลาเข้าเรียน</th>
              <th className="px-4 py-3">หมายเหตุ</th>
              <th className="px-4 py-3">ผู้บันทึก</th>
              <th className="px-4 py-3 text-center sticky right-0 bg-slate-50 shadow-[-4px_0_10px_rgba(0,0,0,0.02)] z-10">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            
            {/* Row 1 */}
            <tr className="hover:bg-slate-50 group">
              <td className="px-4 py-3 text-center text-slate-500">1</td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <img src="https://api.dicebear.com/7.x/notionists/svg?seed=boy1" className="w-7 h-7 rounded-full bg-slate-200 shrink-0" alt="Avatar"/>
                  <span className="font-semibold text-slate-800">เด็กชายกฤษฎา ใจดี</span>
                </div>
              </td>
              <td className="px-4 py-3 text-slate-600">66001</td>
              <td className="px-4 py-3 text-slate-600">ป.5</td>
              <td className="px-4 py-3">
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">มาเรียน</span>
              </td>
              <td className="px-4 py-3 text-slate-600">07:58 น.</td>
              <td className="px-4 py-3 text-slate-400">-</td>
              <td className="px-4 py-3 text-slate-600">ครูประจำชั้น</td>
              <td className="px-4 py-3 sticky right-0 bg-white group-hover:bg-slate-50 shadow-[-4px_0_10px_rgba(0,0,0,0.02)] z-10">
                <div className="flex items-center justify-center gap-1">
                  <button className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-md bg-blue-50/50 border border-blue-100"><Eye className="w-3.5 h-3.5" /></button>
                  <button className="px-2 py-1.5 text-slate-600 hover:bg-slate-100 rounded-md bg-white border border-slate-200 flex items-center gap-1 text-[11px] font-medium"><Edit2 className="w-3 h-3" /> แก้ไข</button>
                </div>
              </td>
            </tr>

            {/* Row 2 */}
            <tr className="hover:bg-slate-50 group">
              <td className="px-4 py-3 text-center text-slate-500">2</td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <img src="https://api.dicebear.com/7.x/notionists/svg?seed=girl1" className="w-7 h-7 rounded-full bg-slate-200 shrink-0" alt="Avatar"/>
                  <span className="font-semibold text-slate-800">เด็กหญิงวริศรา คำดี</span>
                </div>
              </td>
              <td className="px-4 py-3 text-slate-600">66002</td>
              <td className="px-4 py-3 text-slate-600">ป.4</td>
              <td className="px-4 py-3">
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-blue-50 text-blue-600 border border-blue-100">มาสาย</span>
              </td>
              <td className="px-4 py-3 text-slate-600">08:19 น.</td>
              <td className="px-4 py-3 text-slate-600">ติดธุระส่วนตัว</td>
              <td className="px-4 py-3 text-slate-600">ครูประจำชั้น</td>
              <td className="px-4 py-3 sticky right-0 bg-white group-hover:bg-slate-50 shadow-[-4px_0_10px_rgba(0,0,0,0.02)] z-10">
                <div className="flex items-center justify-center gap-1">
                  <button className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-md bg-blue-50/50 border border-blue-100"><Eye className="w-3.5 h-3.5" /></button>
                  <button className="px-2 py-1.5 text-slate-600 hover:bg-slate-100 rounded-md bg-white border border-slate-200 flex items-center gap-1 text-[11px] font-medium"><Edit2 className="w-3 h-3" /> แก้ไข</button>
                </div>
              </td>
            </tr>

            {/* Row 3 */}
            <tr className="hover:bg-slate-50 group">
              <td className="px-4 py-3 text-center text-slate-500">3</td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <img src="https://api.dicebear.com/7.x/notionists/svg?seed=boy2" className="w-7 h-7 rounded-full bg-slate-200 shrink-0" alt="Avatar"/>
                  <span className="font-semibold text-slate-800">เด็กชายพนมภัทร รักษ์มั่นคง</span>
                </div>
              </td>
              <td className="px-4 py-3 text-slate-600">66003</td>
              <td className="px-4 py-3 text-slate-600">ป.6</td>
              <td className="px-4 py-3">
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-red-50 text-red-600 border border-red-100">ขาด</span>
              </td>
              <td className="px-4 py-3 text-slate-400">-</td>
              <td className="px-4 py-3 text-slate-600">ป่วย</td>
              <td className="px-4 py-3 text-slate-600">ครูประจำชั้น</td>
              <td className="px-4 py-3 sticky right-0 bg-white group-hover:bg-slate-50 shadow-[-4px_0_10px_rgba(0,0,0,0.02)] z-10">
                <div className="flex items-center justify-center gap-1">
                  <button className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-md bg-blue-50/50 border border-blue-100"><Eye className="w-3.5 h-3.5" /></button>
                  <button className="px-2 py-1.5 text-slate-600 hover:bg-slate-100 rounded-md bg-white border border-slate-200 flex items-center gap-1 text-[11px] font-medium"><Edit2 className="w-3 h-3" /> แก้ไข</button>
                </div>
              </td>
            </tr>

            {/* Row 4 */}
            <tr className="hover:bg-slate-50 group">
              <td className="px-4 py-3 text-center text-slate-500">4</td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <img src="https://api.dicebear.com/7.x/notionists/svg?seed=girl2" className="w-7 h-7 rounded-full bg-slate-200 shrink-0" alt="Avatar"/>
                  <span className="font-semibold text-slate-800">เด็กหญิงญาดาเพชร เพชรดี</span>
                </div>
              </td>
              <td className="px-4 py-3 text-slate-600">66004</td>
              <td className="px-4 py-3 text-slate-600">ป.3</td>
              <td className="px-4 py-3">
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-amber-50 text-amber-600 border border-amber-100">ลา</span>
              </td>
              <td className="px-4 py-3 text-slate-400">-</td>
              <td className="px-4 py-3 text-slate-600">กิจกรรมครอบครัว</td>
              <td className="px-4 py-3 text-slate-600">ครูประจำชั้น</td>
              <td className="px-4 py-3 sticky right-0 bg-white group-hover:bg-slate-50 shadow-[-4px_0_10px_rgba(0,0,0,0.02)] z-10">
                <div className="flex items-center justify-center gap-1">
                  <button className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-md bg-blue-50/50 border border-blue-100"><Eye className="w-3.5 h-3.5" /></button>
                  <button className="px-2 py-1.5 text-slate-600 hover:bg-slate-100 rounded-md bg-white border border-slate-200 flex items-center gap-1 text-[11px] font-medium"><Edit2 className="w-3 h-3" /> แก้ไข</button>
                </div>
              </td>
            </tr>

            {/* Row 5 */}
            <tr className="hover:bg-slate-50 group">
              <td className="px-4 py-3 text-center text-slate-500">5</td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <img src="https://api.dicebear.com/7.x/notionists/svg?seed=boy3" className="w-7 h-7 rounded-full bg-slate-200 shrink-0" alt="Avatar"/>
                  <span className="font-semibold text-slate-800">เด็กชายพงศกร ไชยมั่น</span>
                </div>
              </td>
              <td className="px-4 py-3 text-slate-600">66005</td>
              <td className="px-4 py-3 text-slate-600">ป.5</td>
              <td className="px-4 py-3">
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">มาเรียน</span>
              </td>
              <td className="px-4 py-3 text-slate-600">07:54 น.</td>
              <td className="px-4 py-3 text-slate-400">-</td>
              <td className="px-4 py-3 text-slate-600">ครูประจำชั้น</td>
              <td className="px-4 py-3 sticky right-0 bg-white group-hover:bg-slate-50 shadow-[-4px_0_10px_rgba(0,0,0,0.02)] z-10">
                <div className="flex items-center justify-center gap-1">
                  <button className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-md bg-blue-50/50 border border-blue-100"><Eye className="w-3.5 h-3.5" /></button>
                  <button className="px-2 py-1.5 text-slate-600 hover:bg-slate-100 rounded-md bg-white border border-slate-200 flex items-center gap-1 text-[11px] font-medium"><Edit2 className="w-3 h-3" /> แก้ไข</button>
                </div>
              </td>
            </tr>

            {/* Row 6 */}
            <tr className="hover:bg-slate-50 group">
              <td className="px-4 py-3 text-center text-slate-500">6</td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <img src="https://api.dicebear.com/7.x/notionists/svg?seed=girl3" className="w-7 h-7 rounded-full bg-slate-200 shrink-0" alt="Avatar"/>
                  <span className="font-semibold text-slate-800">เด็กหญิงปภัสสร อำนาจแย้ม</span>
                </div>
              </td>
              <td className="px-4 py-3 text-slate-600">66006</td>
              <td className="px-4 py-3 text-slate-600">ป.4</td>
              <td className="px-4 py-3">
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">มาเรียน</span>
              </td>
              <td className="px-4 py-3 text-slate-600">07:50 น.</td>
              <td className="px-4 py-3 text-slate-400">-</td>
              <td className="px-4 py-3 text-slate-600">ครูประจำชั้น</td>
              <td className="px-4 py-3 sticky right-0 bg-white group-hover:bg-slate-50 shadow-[-4px_0_10px_rgba(0,0,0,0.02)] z-10">
                <div className="flex items-center justify-center gap-1">
                  <button className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-md bg-blue-50/50 border border-blue-100"><Eye className="w-3.5 h-3.5" /></button>
                  <button className="px-2 py-1.5 text-slate-600 hover:bg-slate-100 rounded-md bg-white border border-slate-200 flex items-center gap-1 text-[11px] font-medium"><Edit2 className="w-3 h-3" /> แก้ไข</button>
                </div>
              </td>
            </tr>

          </tbody>
        </table>
      </div>

      <div className="p-4 border-t border-slate-100 flex items-center justify-between">
        <span className="text-xs text-slate-500">แสดง 1-6 จาก 128 รายการ</span>
        <div className="flex items-center gap-2">
          <button className="p-1.5 rounded text-slate-400 hover:bg-slate-100"><ChevronLeft className="w-4 h-4" /></button>
          <div className="flex gap-1">
            <button className="w-7 h-7 rounded flex items-center justify-center bg-blue-50 text-blue-600 text-xs font-bold border border-blue-100">1</button>
            <button className="w-7 h-7 rounded flex items-center justify-center hover:bg-slate-50 text-slate-600 text-xs font-medium">2</button>
            <button className="w-7 h-7 rounded flex items-center justify-center hover:bg-slate-50 text-slate-600 text-xs font-medium">3</button>
            <button className="w-7 h-7 rounded flex items-center justify-center hover:bg-slate-50 text-slate-600 text-xs font-medium">4</button>
            <button className="w-7 h-7 rounded flex items-center justify-center hover:bg-slate-50 text-slate-600 text-xs font-medium">5</button>
            <span className="w-7 h-7 flex items-center justify-center text-slate-400 text-xs">...</span>
            <button className="w-7 h-7 rounded flex items-center justify-center hover:bg-slate-50 text-slate-600 text-xs font-medium">21</button>
          </div>
          <button className="p-1.5 rounded text-slate-600 hover:bg-slate-100"><ChevronRight className="w-4 h-4" /></button>
          <select className="ml-2 bg-white border border-slate-200 text-slate-600 text-xs rounded-md px-2 py-1 focus:outline-none">
            <option>6 / หน้า</option>
            <option>10 / หน้า</option>
          </select>
        </div>
      </div>

    </div>
  )
}
