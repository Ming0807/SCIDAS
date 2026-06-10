import React from "react"
import { ChevronRight, Phone, Mail } from "lucide-react"

export function MobileSupportTeam() {
  return (
    <div className="px-4 mb-20">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-slate-800">ผู้เกี่ยวข้อง</h3>
        <button className="flex items-center gap-0.5 text-xs font-semibold text-blue-600">
          ดูทั้งหมด
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex overflow-x-auto gap-3 pb-4 no-scrollbar -mx-4 px-4">
        
        {/* Team 1 */}
        <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-sm shrink-0 w-[160px] flex flex-col items-center text-center">
          <img src="https://api.dicebear.com/7.x/notionists/svg?seed=teacher2" alt="Avatar" className="w-12 h-12 rounded-full bg-slate-100 border border-slate-200 mb-2" />
          <div className="text-xs font-semibold text-slate-800 w-full truncate">ครูสุรินทร์ จิรา</div>
          <div className="text-xs text-slate-500 mb-3">ครูที่ปรึกษา</div>
          <div className="flex items-center gap-3">
            <button className="text-slate-400 hover:text-slate-600">
              <Phone className="w-4 h-4" />
            </button>
            <button className="text-slate-400 hover:text-slate-600">
              <Mail className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Team 2 */}
        <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-sm shrink-0 w-[160px] flex flex-col items-center text-center">
          <img src="https://api.dicebear.com/7.x/notionists/svg?seed=teacher1" alt="Avatar" className="w-12 h-12 rounded-full bg-slate-100 border border-slate-200 mb-2" />
          <div className="text-xs font-semibold text-slate-800 w-full truncate">ครูสมชาย ใจดี</div>
          <div className="text-xs text-slate-500 mb-3">ครูแนะแนว</div>
          <div className="flex items-center gap-3">
            <button className="text-slate-400 hover:text-slate-600">
              <Phone className="w-4 h-4" />
            </button>
            <button className="text-slate-400 hover:text-slate-600">
              <Mail className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Team 3 */}
        <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-sm shrink-0 w-[160px] flex flex-col items-center text-center">
          <img src="https://api.dicebear.com/7.x/notionists/svg?seed=parent1" alt="Avatar" className="w-12 h-12 rounded-full bg-slate-100 border border-slate-200 mb-2" />
          <div className="text-xs font-semibold text-slate-800 w-full truncate">นางสาวพัชราภรณ์ ใจดี</div>
          <div className="text-xs text-slate-500 mb-3">ผู้ปกครอง</div>
          <div className="flex items-center gap-3">
            <button className="text-slate-400 hover:text-slate-600">
              <Phone className="w-4 h-4" />
            </button>
            <button className="text-slate-400 hover:text-slate-600">
              <Mail className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
