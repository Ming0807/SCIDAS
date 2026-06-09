import React from "react"
import { ChevronLeft, ChevronRight, BookOpen, Users, CircleDot } from "lucide-react"

export function IdpTimeline() {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100 flex flex-col h-full overflow-hidden">
      
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-[14px] font-bold text-slate-800">แผนการดำเนินกิจกรรม (พ.ค. 2567)</h3>
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-50 border border-slate-100 rounded-lg p-0.5">
            <button className="px-3 py-1 text-[11px] font-bold text-white bg-indigo-600 rounded-md shadow-sm">สัปดาห์</button>
            <button className="px-3 py-1 text-[11px] font-medium text-slate-500 hover:text-slate-800">เดือน</button>
            <button className="px-3 py-1 text-[11px] font-medium text-slate-500 hover:text-slate-800">รายการ</button>
          </div>
        </div>
      </div>

      <div className="flex-1 w-full overflow-x-auto no-scrollbar relative">
        <div className="min-w-[600px]">
          {/* Header row */}
          <div className="flex items-center border-b border-slate-100 pb-2 mb-4">
            <div className="w-12 shrink-0 flex justify-center text-slate-400">
              <ChevronLeft className="w-4 h-4 cursor-pointer hover:text-slate-600" />
            </div>
            <div className="flex-1 grid grid-cols-4 text-center">
              <div className="text-[11px] font-bold text-slate-500">13 - 19 พ.ค.</div>
              <div className="text-[11px] font-bold text-white bg-indigo-500 rounded-full py-0.5 mx-4 shadow-sm">20 - 26 พ.ค.</div>
              <div className="text-[11px] font-bold text-slate-500">27 พ.ค. - 2 มิ.ย.</div>
              <div className="text-[11px] font-bold text-slate-500">3 - 9 มิ.ย.</div>
            </div>
            <div className="w-12 shrink-0 flex justify-center text-slate-400">
              <ChevronRight className="w-4 h-4 cursor-pointer hover:text-slate-600" />
            </div>
          </div>

          {/* Timeline Grid Background */}
          <div className="absolute top-[40px] bottom-0 left-[48px] right-[48px] grid grid-cols-4 z-0 opacity-40">
            <div className="border-l border-r border-slate-100/50"></div>
            <div className="border-r border-slate-100/50 bg-slate-50/30"></div>
            <div className="border-r border-slate-100/50"></div>
            <div className="border-r border-slate-100/50"></div>
          </div>

          {/* Rows */}
          <div className="relative z-10 flex flex-col gap-4">
            
            {/* Row 1 */}
            <div className="flex items-center h-12">
              <div className="w-12 shrink-0 text-[10px] font-bold text-slate-500 text-center">จ. 20</div>
              <div className="flex-1 relative h-full">
                {/* Event 1 */}
                <div className="absolute top-1 bottom-1 left-[25%] right-[50%] bg-emerald-50 border border-emerald-200/60 rounded-lg p-1.5 flex items-center gap-2 shadow-sm hover:shadow-md transition-shadow cursor-pointer z-20">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                    <CircleDot className="w-3 h-3 text-emerald-600" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[10px] font-bold text-emerald-800 truncate">นัดหมายผู้ปกครอง</span>
                    <span className="text-[9px] text-emerald-600">15:00 - 16:00 น.</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Row 2 */}
            <div className="flex items-center h-12">
              <div className="w-12 shrink-0 text-[10px] font-bold text-slate-500 text-center">อ. 21</div>
              <div className="flex-1 relative h-full">
                {/* Event 2 */}
                <div className="absolute top-1 bottom-1 left-[40%] right-[25%] bg-blue-50 border border-blue-200/60 rounded-lg p-1.5 flex items-center gap-2 shadow-sm hover:shadow-md transition-shadow cursor-pointer z-20">
                  <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                    <BookOpen className="w-3 h-3 text-blue-600" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[10px] font-bold text-blue-800 truncate">ติวเสริมคณิตศาสตร์</span>
                    <span className="text-[9px] text-blue-600">13:30 - 15:00 น.</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Row 3 */}
            <div className="flex items-center h-12">
              <div className="w-12 shrink-0 text-[10px] font-bold text-slate-500 text-center">พ. 22</div>
              <div className="flex-1 relative h-full">
                {/* Empty */}
              </div>
            </div>

            {/* Row 4 */}
            <div className="flex items-center h-12">
              <div className="w-12 shrink-0 text-[10px] font-bold text-slate-500 text-center">พฤ. 23</div>
              <div className="flex-1 relative h-full">
                {/* Event 3 */}
                <div className="absolute top-1 bottom-1 left-[25%] right-[50%] bg-indigo-50 border border-indigo-200/60 rounded-lg p-1.5 flex items-center gap-2 shadow-sm hover:shadow-md transition-shadow cursor-pointer z-20">
                  <div className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                    <BookOpen className="w-3 h-3 text-indigo-600" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[10px] font-bold text-indigo-800 truncate">ฝึกอ่านหนังสือ</span>
                    <span className="text-[9px] text-indigo-600">07:30 - 08:00 น.</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Row 5 */}
            <div className="flex items-center h-12">
              <div className="w-12 shrink-0 text-[10px] font-bold text-slate-500 text-center">ศ. 24</div>
              <div className="flex-1 relative h-full">
                {/* Event 4 spanning multiple days theoretically */}
                <div className="absolute top-1 bottom-1 left-[50%] right-[0%] bg-orange-50 border border-orange-200/60 rounded-lg p-1.5 flex items-center justify-center gap-2 shadow-sm hover:shadow-md transition-shadow cursor-pointer z-20">
                  <div className="w-5 h-5 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                    <Users className="w-3 h-3 text-orange-600" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[10px] font-bold text-orange-800 truncate">ติดตามพฤติกรรมในชั้นเรียน</span>
                    <span className="text-[9px] text-orange-600">ตลอดวัน</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center flex-wrap gap-4 mt-6 pt-4 border-t border-slate-100">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
          <span className="text-[10px] text-slate-500 font-medium">ให้คำปรึกษา</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
          <span className="text-[10px] text-slate-500 font-medium">การเรียน/ติวเสริม</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
          <span className="text-[10px] text-slate-500 font-medium">ทักษะการอ่าน</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-orange-500"></div>
          <span className="text-[10px] text-slate-500 font-medium">พฤติกรรม</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-slate-400"></div>
          <span className="text-[10px] text-slate-500 font-medium">อื่นๆ</span>
        </div>
      </div>

    </div>
  )
}
