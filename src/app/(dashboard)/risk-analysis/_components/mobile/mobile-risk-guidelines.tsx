import React from "react"
import Link from "next/link"
import { ChevronRight, Users, MessageCircle, BookOpen, BarChart } from "lucide-react"

export function MobileRiskGuidelines() {
  return (
    <div className="px-4 mb-6">
      <h3 className="text-sm font-bold text-slate-800 mb-4">แนวทางการช่วยเหลือที่แนะนำ</h3>

      <div className="flex overflow-x-auto gap-3 pb-4 no-scrollbar -mx-4 px-4">
        
        <Link href="/support" className="bg-red-50/80 rounded-xl p-4 border border-red-100 shrink-0 w-[150px] flex flex-col justify-between group cursor-pointer hover:bg-red-100 transition-colors block">
          <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center mb-3">
            <Users className="w-6 h-6 text-red-500" />
          </div>
          <div className="flex flex-col">
            <h4 className="text-sm font-bold text-red-700 mb-1 leading-tight">1. เฝ้าระวังใกล้ชิด</h4>
            <p className="text-xs text-red-600/80 leading-snug">ติดตามการมาเรียน<br/>อย่างต่อเนื่อง</p>
          </div>
          <ChevronRight className="w-4 h-4 text-red-400 mt-2 self-end group-hover:translate-x-1 transition-transform" />
        </Link>

        <Link href="/support" className="bg-orange-50/80 rounded-xl p-4 border border-orange-100 shrink-0 w-[150px] flex flex-col justify-between group cursor-pointer hover:bg-orange-100 transition-colors block">
          <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center mb-3">
            <MessageCircle className="w-6 h-6 text-orange-500" />
          </div>
          <div className="flex flex-col">
            <h4 className="text-sm font-bold text-orange-700 mb-1 leading-tight">2. พูดคุยให้คำปรึกษา</h4>
            <p className="text-xs text-orange-600/80 leading-snug">นัดพูดคุยกับนักเรียน<br/>และผู้ปกครอง</p>
          </div>
          <ChevronRight className="w-4 h-4 text-orange-400 mt-2 self-end group-hover:translate-x-1 transition-transform" />
        </Link>

        <Link href="/development-plans" className="bg-green-50/80 rounded-xl p-4 border border-green-100 shrink-0 w-[150px] flex flex-col justify-between group cursor-pointer hover:bg-green-100 transition-colors block">
          <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center mb-3">
            <BookOpen className="w-6 h-6 text-green-500" />
          </div>
          <div className="flex flex-col">
            <h4 className="text-sm font-bold text-green-700 mb-1 leading-tight">3. วางแผนการช่วยเหลือ</h4>
            <p className="text-xs text-green-600/80 leading-snug">จัดทำแผนพัฒนารายบุคคล<br/>และติดตามผล</p>
          </div>
          <ChevronRight className="w-4 h-4 text-green-400 mt-2 self-end group-hover:translate-x-1 transition-transform" />
        </Link>

        <Link href="/support" className="bg-blue-50/80 rounded-xl p-4 border border-blue-100 shrink-0 w-[150px] flex flex-col justify-between group cursor-pointer hover:bg-blue-100 transition-colors block">
          <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center mb-3">
            <BarChart className="w-6 h-6 text-blue-500" />
          </div>
          <div className="flex flex-col">
            <h4 className="text-sm font-bold text-blue-700 mb-1 leading-tight">4. ติดตามและประเมินผล</h4>
            <p className="text-xs text-blue-600/80 leading-snug">ประเมินผลทุก<br/>2 สัปดาห์</p>
          </div>
          <ChevronRight className="w-4 h-4 text-blue-400 mt-2 self-end group-hover:translate-x-1 transition-transform" />
        </Link>

      </div>
    </div>
  )
}
