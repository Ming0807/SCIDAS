import React from "react"
import { Edit2, Users, Printer, Trash2, Settings, Eye, MoreHorizontal, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"

export function StudentTable() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-full overflow-hidden min-h-[400px]">
      
      {/* Tabs Header - Swipeable on mobile */}
      <div className="flex border-b border-slate-100 px-2 overflow-x-auto no-scrollbar">
        <button className="px-4 py-3 sm:py-4 text-xs sm:text-sm font-semibold text-blue-600 border-b-2 border-blue-600 flex items-center gap-2 whitespace-nowrap">
          รายการทั้งหมด
          <span className="bg-blue-50 text-blue-600 py-0.5 px-2 rounded-full text-[10px] font-bold">128</span>
        </button>
        <button className="px-4 py-3 sm:py-4 text-xs sm:text-sm font-medium text-slate-500 hover:text-slate-700 flex items-center gap-2 whitespace-nowrap">
          รอตรวจสอบ
          <span className="bg-orange-50 text-orange-600 py-0.5 px-2 rounded-full text-[10px] font-bold">12</span>
        </button>
        <button className="px-4 py-3 sm:py-4 text-xs sm:text-sm font-medium text-slate-500 hover:text-slate-700 flex items-center gap-2 whitespace-nowrap">
          ติดตาม
          <span className="bg-slate-100 text-slate-600 py-0.5 px-2 rounded-full text-[10px] font-bold">18</span>
        </button>
        <button className="px-4 py-3 sm:py-4 text-xs sm:text-sm font-medium text-slate-500 hover:text-slate-700 flex items-center gap-2 whitespace-nowrap">
          ย้ายออก
          <span className="bg-slate-100 text-slate-600 py-0.5 px-2 rounded-full text-[10px] font-bold">5</span>
        </button>
      </div>

      {/* Bulk Actions Toolbar - Scrollable if needed */}
      <div className="px-4 py-3 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between bg-slate-50/50 gap-3">
        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar w-full sm:w-auto pb-1 sm:pb-0">
          <label className="flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0">
            <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
            <span className="text-xs sm:text-sm font-medium text-slate-700">เลือกทั้งหมด (0)</span>
          </label>
          <div className="h-4 w-px bg-slate-300 mx-1 shrink-0"></div>
          <button className="flex items-center gap-1.5 text-xs sm:text-[13px] text-slate-500 hover:text-slate-800 disabled:opacity-50 whitespace-nowrap shrink-0" disabled>
            <Edit2 className="w-3.5 h-3.5" /> แก้ไข
          </button>
          <button className="flex items-center gap-1.5 text-xs sm:text-[13px] text-slate-500 hover:text-slate-800 disabled:opacity-50 whitespace-nowrap shrink-0" disabled>
            <Users className="w-3.5 h-3.5" /> กำหนดครูที่ปรึกษา
          </button>
          <button className="flex items-center gap-1.5 text-xs sm:text-[13px] text-slate-500 hover:text-slate-800 disabled:opacity-50 whitespace-nowrap shrink-0" disabled>
            <Settings className="w-3.5 h-3.5" /> เปลี่ยนห้องเรียน
          </button>
          <button className="flex items-center gap-1.5 text-xs sm:text-[13px] text-slate-500 hover:text-slate-800 disabled:opacity-50 whitespace-nowrap shrink-0" disabled>
            <Printer className="w-3.5 h-3.5" /> พิมพ์บัตร
          </button>
          <button className="flex items-center gap-1.5 text-xs sm:text-[13px] text-red-500 hover:text-red-700 disabled:opacity-50 whitespace-nowrap shrink-0" disabled>
            <Trash2 className="w-3.5 h-3.5" /> ลบ
          </button>
        </div>
        <div className="hidden sm:block">
          <button className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-md">
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Table Content */}
      <div className="flex-1 overflow-x-auto overflow-y-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-white sticky top-0 z-10 shadow-sm">
            <tr className="border-b border-slate-200 text-slate-500">
              <th className="px-4 py-3 font-medium w-12 text-center bg-white"></th>
              <th className="px-4 py-3 font-medium bg-white">นักเรียน</th>
              <th className="px-4 py-3 font-medium bg-white">เลขประจำตัว</th>
              <th className="px-4 py-3 font-medium bg-white">ชั้นเรียน</th>
              <th className="px-4 py-3 font-medium bg-white">สถานะ</th>
              <th className="px-4 py-3 font-medium bg-white">ผู้ปกครอง</th>
              <th className="px-4 py-3 font-medium bg-white">เบอร์โทร</th>
              <th className="px-4 py-3 font-medium text-center bg-white sticky right-0 shadow-[-4px_0_10px_rgba(0,0,0,0.02)]">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            
            {/* Row 1 (Selected/Active) */}
            <tr className="bg-blue-50/50 hover:bg-blue-50 group transition-colors">
              <td className="px-4 py-3 text-center">
                <input type="checkbox" checked readOnly className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <img src="https://api.dicebear.com/7.x/notionists/svg?seed=boy1" className="w-8 h-8 rounded-full bg-slate-200 shrink-0" alt="Avatar"/>
                  <span className="font-semibold text-slate-800">เด็กชายกฤษฎา ใจดี</span>
                </div>
              </td>
              <td className="px-4 py-3 text-slate-600">12345</td>
              <td className="px-4 py-3 text-slate-600">ป.5/1</td>
              <td className="px-4 py-3">
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-600">ปกติ</span>
              </td>
              <td className="px-4 py-3 text-slate-600">นางสาวอรพิน ใจดี</td>
              <td className="px-4 py-3 text-slate-600">089-123-4567</td>
              <td className="px-4 py-3 sticky right-0 bg-blue-50 group-hover:bg-blue-50 shadow-[-4px_0_10px_rgba(0,0,0,0.02)]">
                <div className="flex items-center justify-center gap-2">
                  <button className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-md"><Eye className="w-4 h-4" /></button>
                  <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md"><Edit2 className="w-4 h-4" /></button>
                  <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md"><MoreHorizontal className="w-4 h-4" /></button>
                </div>
              </td>
            </tr>

            {/* Row 2 */}
            <tr className="hover:bg-slate-50 group transition-colors">
              <td className="px-4 py-3 text-center">
                <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <img src="https://api.dicebear.com/7.x/notionists/svg?seed=girl1" className="w-8 h-8 rounded-full bg-slate-200 shrink-0" alt="Avatar"/>
                  <span className="font-medium text-slate-800">เด็กหญิงธัญญารัตน์ ฟ้าใส</span>
                </div>
              </td>
              <td className="px-4 py-3 text-slate-600">12346</td>
              <td className="px-4 py-3 text-slate-600">ป.5/1</td>
              <td className="px-4 py-3">
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-50 text-amber-600">ติดตาม</span>
              </td>
              <td className="px-4 py-3 text-slate-600">นายวิวัฒน์ ฟ้าใส</td>
              <td className="px-4 py-3 text-slate-600">081-234-5678</td>
              <td className="px-4 py-3 sticky right-0 bg-white group-hover:bg-slate-50 shadow-[-4px_0_10px_rgba(0,0,0,0.02)] transition-colors">
                <div className="flex items-center justify-center gap-2">
                  <button className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md"><Eye className="w-4 h-4" /></button>
                  <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md"><Edit2 className="w-4 h-4" /></button>
                  <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md"><MoreHorizontal className="w-4 h-4" /></button>
                </div>
              </td>
            </tr>

            {/* Row 3 */}
            <tr className="hover:bg-slate-50 group transition-colors">
              <td className="px-4 py-3 text-center">
                <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <img src="https://api.dicebear.com/7.x/notionists/svg?seed=boy2" className="w-8 h-8 rounded-full bg-slate-200 shrink-0" alt="Avatar"/>
                  <span className="font-medium text-slate-800">เด็กชายณัฐพล ศรีสุข</span>
                </div>
              </td>
              <td className="px-4 py-3 text-slate-600">12347</td>
              <td className="px-4 py-3 text-slate-600">ป.5/1</td>
              <td className="px-4 py-3">
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-50 text-red-600">เสี่ยงสูง</span>
              </td>
              <td className="px-4 py-3 text-slate-600">นางสุภาพร ศรีสุข</td>
              <td className="px-4 py-3 text-slate-600">087-345-6789</td>
              <td className="px-4 py-3 sticky right-0 bg-white group-hover:bg-slate-50 shadow-[-4px_0_10px_rgba(0,0,0,0.02)] transition-colors">
                <div className="flex items-center justify-center gap-2">
                  <button className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md"><Eye className="w-4 h-4" /></button>
                  <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md"><Edit2 className="w-4 h-4" /></button>
                  <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md"><MoreHorizontal className="w-4 h-4" /></button>
                </div>
              </td>
            </tr>

            {/* Row 4 */}
            <tr className="hover:bg-slate-50 group transition-colors">
              <td className="px-4 py-3 text-center">
                <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <img src="https://api.dicebear.com/7.x/notionists/svg?seed=girl2" className="w-8 h-8 rounded-full bg-slate-200 shrink-0" alt="Avatar"/>
                  <span className="font-medium text-slate-800">เด็กหญิงปริมลุข อินทร์แก้ว</span>
                </div>
              </td>
              <td className="px-4 py-3 text-slate-600">12348</td>
              <td className="px-4 py-3 text-slate-600">ป.5/2</td>
              <td className="px-4 py-3">
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-600">ปกติ</span>
              </td>
              <td className="px-4 py-3 text-slate-600">นางจันทิมา อินทร์แก้ว</td>
              <td className="px-4 py-3 text-slate-600">090-456-7890</td>
              <td className="px-4 py-3 sticky right-0 bg-white group-hover:bg-slate-50 shadow-[-4px_0_10px_rgba(0,0,0,0.02)] transition-colors">
                <div className="flex items-center justify-center gap-2">
                  <button className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md"><Eye className="w-4 h-4" /></button>
                  <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md"><Edit2 className="w-4 h-4" /></button>
                  <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md"><MoreHorizontal className="w-4 h-4" /></button>
                </div>
              </td>
            </tr>

            {/* Row 5 */}
            <tr className="hover:bg-slate-50 group transition-colors">
              <td className="px-4 py-3 text-center">
                <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <img src="https://api.dicebear.com/7.x/notionists/svg?seed=boy3" className="w-8 h-8 rounded-full bg-slate-200 shrink-0" alt="Avatar"/>
                  <span className="font-medium text-slate-800">เด็กชายธนวัฒน์ คำปา</span>
                </div>
              </td>
              <td className="px-4 py-3 text-slate-600">12349</td>
              <td className="px-4 py-3 text-slate-600">ป.5/2</td>
              <td className="px-4 py-3">
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-50 text-amber-600">ติดตาม</span>
              </td>
              <td className="px-4 py-3 text-slate-600">นายสมชาย คำปา</td>
              <td className="px-4 py-3 text-slate-600">093-567-8901</td>
              <td className="px-4 py-3 sticky right-0 bg-white group-hover:bg-slate-50 shadow-[-4px_0_10px_rgba(0,0,0,0.02)] transition-colors">
                <div className="flex items-center justify-center gap-2">
                  <button className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md"><Eye className="w-4 h-4" /></button>
                  <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md"><Edit2 className="w-4 h-4" /></button>
                  <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md"><MoreHorizontal className="w-4 h-4" /></button>
                </div>
              </td>
            </tr>

          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="px-4 py-3 sm:py-4 border-t border-slate-100 flex flex-col sm:flex-row flex-wrap items-center justify-between gap-4">
        <div className="text-xs sm:text-sm text-slate-600 flex items-center justify-between w-full sm:w-auto gap-4">
          <span className="whitespace-nowrap">แสดง 1 - 10 จาก 128</span>
          <div className="flex items-center gap-2">
            <select className="border border-slate-200 rounded-md px-2 py-1 text-xs sm:text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-500">
              <option>10 ต่อหน้า</option>
              <option>20 ต่อหน้า</option>
              <option>50 ต่อหน้า</option>
            </select>
          </div>
        </div>
        
        <div className="flex items-center justify-center gap-1 w-full sm:w-auto">
          <button className="p-1.5 rounded text-slate-400 hover:bg-slate-100 disabled:opacity-50" disabled>
            <ChevronsLeft className="w-4 h-4" />
          </button>
          <button className="p-1.5 rounded text-slate-400 hover:bg-slate-100 disabled:opacity-50" disabled>
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <div className="flex items-center mx-1 sm:mx-2">
            <button className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded bg-blue-600 text-white text-xs sm:text-sm font-medium">1</button>
            <button className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded text-slate-600 hover:bg-slate-100 text-xs sm:text-sm font-medium">2</button>
            <button className="w-7 h-7 sm:w-8 sm:h-8 hidden sm:flex items-center justify-center rounded text-slate-600 hover:bg-slate-100 text-xs sm:text-sm font-medium">3</button>
            <span className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-slate-400 text-xs sm:text-sm">...</span>
            <button className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded text-slate-600 hover:bg-slate-100 text-xs sm:text-sm font-medium">13</button>
          </div>

          <button className="p-1.5 rounded text-slate-600 hover:bg-slate-100">
            <ChevronRight className="w-4 h-4" />
          </button>
          <button className="p-1.5 rounded text-slate-600 hover:bg-slate-100">
            <ChevronsRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
