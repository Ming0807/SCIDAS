import React from "react"
import { Phone, Mail } from "lucide-react"

export function SupportTeam() {
  return (
    <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col h-full">
      <h3 className="text-sm font-semibold text-slate-800 mb-5">ทีมงานที่เกี่ยวข้อง</h3>

      <div className="flex flex-col gap-4 flex-1">
        
        {/* Team Member 1 */}
        <div className="flex items-center justify-between gap-3">
          <img src="https://api.dicebear.com/7.x/notionists/svg?seed=teacher2" alt="Avatar" className="w-10 h-10 rounded-full bg-slate-100" />
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-slate-800 truncate">นางสาวจันทร์จิรา พรมดี</div>
            <div className="text-xs text-slate-500">ครูที่ปรึกษา</div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button className="w-7 h-7 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-600 flex items-center justify-center transition-colors">
              <Phone className="w-3.5 h-3.5" />
            </button>
            <button className="w-7 h-7 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-600 flex items-center justify-center transition-colors">
              <Mail className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Team Member 2 */}
        <div className="flex items-center justify-between gap-3">
          <img src="https://api.dicebear.com/7.x/notionists/svg?seed=teacher1" alt="Avatar" className="w-10 h-10 rounded-full bg-slate-100" />
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-slate-800 truncate">นางสาวศิริพร แก้วสนิท</div>
            <div className="text-xs text-slate-500">ครูแนะแนว</div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button className="w-7 h-7 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-600 flex items-center justify-center transition-colors">
              <Phone className="w-3.5 h-3.5" />
            </button>
            <button className="w-7 h-7 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-600 flex items-center justify-center transition-colors">
              <Mail className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Team Member 3 */}
        <div className="flex items-center justify-between gap-3">
          <img src="https://api.dicebear.com/7.x/notionists/svg?seed=parent1" alt="Avatar" className="w-10 h-10 rounded-full bg-slate-100" />
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-slate-800 truncate">นายสมชาย ใจดี</div>
            <div className="text-xs text-slate-500">ผู้ปกครอง</div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button className="w-7 h-7 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-600 flex items-center justify-center transition-colors">
              <Phone className="w-3.5 h-3.5" />
            </button>
            <button className="w-7 h-7 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-600 flex items-center justify-center transition-colors">
              <Mail className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Team Member 4 */}
        <div className="flex items-center justify-between gap-3">
          <img src="https://api.dicebear.com/7.x/notionists/svg?seed=doctor1" alt="Avatar" className="w-10 h-10 rounded-full bg-slate-100" />
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-slate-800 truncate">นางพัชราภรณ์ สุขใจ</div>
            <div className="text-xs text-slate-500">นักจิตวิทยาโรงเรียน</div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button className="w-7 h-7 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-600 flex items-center justify-center transition-colors">
              <Phone className="w-3.5 h-3.5" />
            </button>
            <button className="w-7 h-7 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-600 flex items-center justify-center transition-colors">
              <Mail className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>

      <button className="w-full flex items-center justify-center py-2.5 text-xs font-semibold text-slate-500 border border-slate-200 rounded-xl mt-5 hover:bg-slate-50 transition-colors">
        เพิ่มผู้เกี่ยวข้อง
      </button>

    </div>
  )
}
