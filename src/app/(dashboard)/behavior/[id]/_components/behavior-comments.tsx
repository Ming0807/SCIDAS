import React from "react"
import { Quote, Edit3 } from "lucide-react"

export function BehaviorComments() {
  return (
    <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col h-full">
      <h3 className="text-[13px] font-bold text-slate-800 mb-4">ความคิดเห็นของครูที่ปรึกษา</h3>

      <div className="flex-1 flex flex-col bg-indigo-50/50 rounded-xl p-4 border border-indigo-100/50 relative">
        <Quote className="w-8 h-8 text-indigo-200 absolute top-3 left-3 rotate-180" />
        
        <p className="text-[12px] text-slate-700 leading-relaxed relative z-10 pl-6 pt-2">
          นักเรียนมีพฤติกรรมโดยรวมอยู่ในเกณฑ์ดี มีความรับผิดชอบ ช่วยเหลือเพื่อน และให้ความร่วมมือในกิจกรรมต่างๆ ควรพัฒนาในเรื่องของการรักษาวินัยในห้องเรียนและการตรงต่อเวลา
        </p>

        <div className="mt-4 flex items-center gap-3">
          <img src="https://api.dicebear.com/7.x/notionists/svg?seed=teacher2" alt="Teacher" className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200" />
          <div className="flex flex-col">
            <span className="text-[11px] font-bold text-slate-800">นางสาวจันทร์จิรา พรมดี</span>
            <span className="text-[9px] text-slate-500">ครูที่ปรึกษา • 20 พฤษภาคม 2567</span>
          </div>
        </div>
      </div>

      <button className="w-full mt-4 flex items-center justify-center gap-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[11px] font-bold py-2.5 rounded-xl transition-colors">
        <Edit3 className="w-3.5 h-3.5" />
        เพิ่มความคิดเห็น
      </button>
    </div>
  )
}
