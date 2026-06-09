import React from "react"
import { Plus, TrendingUp, ThumbsUp, ThumbsDown, Smile } from "lucide-react"

export function StudentProfileHeader() {
  return (
    <div className="flex flex-col xl:flex-row xl:items-stretch justify-between gap-4 mb-6">
      
      {/* Profile Info */}
      <div className="flex flex-col bg-white p-5 rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100 xl:w-[320px] shrink-0 h-full">
        <div className="flex items-center gap-4 mb-4">
          <img src="https://api.dicebear.com/7.x/notionists/svg?seed=boy1" alt="Avatar" className="w-16 h-16 rounded-full bg-slate-100 shrink-0 border border-slate-200" />
          <div className="flex flex-col">
            <h2 className="text-[16px] font-bold text-slate-800">เด็กชายธนวัฒน์ ใจดี</h2>
            <div className="text-[12px] text-slate-500 mb-1">ชั้น ม.2/1 เลขที่ 5</div>
            <div className="text-[11px] text-slate-500 bg-slate-50 px-2 py-0.5 rounded w-max border border-slate-100">รหัส 12345</div>
          </div>
        </div>
        
        <div className="mt-auto border-t border-slate-100 pt-4 flex flex-col gap-2">
          <div className="flex items-center justify-between text-[12px]">
            <span className="text-slate-500">ผู้ปกครอง:</span>
            <span className="font-medium text-slate-700">นายสมชาย ใจดี</span>
          </div>
          <div className="flex items-center justify-between text-[12px]">
            <span className="text-slate-500">เบอร์โทรติดต่อ:</span>
            <span className="font-medium text-slate-700">081-234-5678</span>
          </div>
          <div className="flex items-center justify-between text-[12px]">
            <span className="text-slate-500">สถานะความเสี่ยง:</span>
            <span className="font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded">เฝ้าระวัง</span>
          </div>
        </div>
      </div>

      {/* Summary Cards Row */}
      <div className="flex-1 grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-2 2xl:grid-cols-4 gap-4">
        
        {/* Card 1: Overall */}
        <div className="bg-white p-4 rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100 flex flex-col justify-between">
          <div className="text-[11px] font-bold text-slate-500 mb-2">ภาพรวมพฤติกรรม</div>
          <div className="flex items-end justify-between">
            <div>
              <div className="text-xl font-bold text-slate-800">ดี</div>
              <div className="flex items-center gap-1 text-[10px] font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded mt-1">
                แนวโน้มดีขึ้น
                <TrendingUp className="w-3 h-3" />
              </div>
            </div>
            <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500">
              <Smile className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Card 2: Total */}
        <div className="bg-white p-4 rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100 flex flex-col justify-between">
          <div className="text-[11px] font-bold text-slate-500 mb-2">บันทึกพฤติกรรมทั้งหมด</div>
          <div className="flex items-end justify-between">
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-slate-800 leading-none">18</span>
                <span className="text-[11px] text-slate-500">ครั้ง</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-2">ในภาคเรียนนี้</div>
            </div>
          </div>
        </div>

        {/* Card 3: Positive */}
        <div className="bg-white p-4 rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100 flex flex-col justify-between">
          <div className="text-[11px] font-bold text-slate-500 mb-2">พฤติกรรมเชิงบวก</div>
          <div className="flex items-end justify-between">
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-slate-800 leading-none">14</span>
                <span className="text-[11px] text-slate-500">ครั้ง</span>
              </div>
              <div className="text-[10px] font-medium text-emerald-600 mt-2">77.78%</div>
            </div>
            <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500">
              <ThumbsUp className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Card 4: Negative */}
        <div className="bg-rose-50 p-4 rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-rose-100 flex flex-col justify-between relative overflow-hidden">
          {/* Add Record Button positioned above this card in layout, but absolute inside here for design if needed? No, button is outside in layout. */}
          <div className="text-[11px] font-bold text-rose-800 mb-2 relative z-10">พฤติกรรมเชิงลบ</div>
          <div className="flex items-end justify-between relative z-10">
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-rose-700 leading-none">4</span>
                <span className="text-[11px] text-rose-600">ครั้ง</span>
              </div>
              <div className="text-[10px] font-medium text-rose-600 mt-2">22.22%</div>
            </div>
            <div className="w-10 h-10 rounded-full bg-white/50 flex items-center justify-center text-rose-500">
              <ThumbsDown className="w-5 h-5" />
            </div>
          </div>
        </div>

      </div>

    </div>
  )
}
