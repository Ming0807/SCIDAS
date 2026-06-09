import React from "react"
import { CalendarCheck, BookOpen, Target } from "lucide-react"

export function BottomMiniCharts() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      
      {/* การมาเรียนวันนี้ */}
      <div className="rounded-2xl bg-white shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] border border-slate-100 p-5">
        <div className="flex items-center gap-2 mb-4">
          <CalendarCheck className="h-4 w-4 text-emerald-500" />
          <h3 className="text-sm font-bold text-slate-800">การมาเรียนวันนี้</h3>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex gap-4">
            <div>
              <div className="text-[10px] text-slate-500 mb-0.5">มาเรียน</div>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-bold text-slate-800">118</span>
                <span className="text-[10px] font-medium text-slate-800">คน</span>
              </div>
              <div className="text-[10px] text-slate-400">92.2%</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-500 mb-0.5">ขาดเรียน</div>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-bold text-slate-800">8</span>
                <span className="text-[10px] font-medium text-slate-800">คน</span>
              </div>
              <div className="text-[10px] text-slate-400">6.3%</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-500 mb-0.5">ลาป่วย/ลากิจ</div>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-bold text-slate-800">2</span>
                <span className="text-[10px] font-medium text-slate-800">คน</span>
              </div>
              <div className="text-[10px] text-slate-400">1.5%</div>
            </div>
          </div>
          <div className="w-12 h-12 relative">
            <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
              <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#10b981" strokeWidth="6" strokeDasharray="92.2 7.8" strokeDashoffset="0"></circle>
              <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#ef4444" strokeWidth="6" strokeDasharray="6.3 93.7" strokeDashoffset="-92.2"></circle>
              <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#f59e0b" strokeWidth="6" strokeDasharray="1.5 98.5" strokeDashoffset="-98.5"></circle>
            </svg>
          </div>
        </div>
      </div>

      {/* ผลการเรียนเฉลี่ย */}
      <div className="rounded-2xl bg-white shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] border border-slate-100 p-5">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="h-4 w-4 text-blue-500" />
          <h3 className="text-sm font-bold text-slate-800">ผลการเรียนเฉลี่ย</h3>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex gap-4">
            <div>
              <div className="text-[10px] text-slate-500 mb-0.5">เฉลี่ยรวม</div>
              <div className="text-xl font-bold text-slate-800 leading-tight mt-0.5">2.78</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-500 mb-0.5">สูงกว่า 3.00</div>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-bold text-slate-800">28</span>
                <span className="text-[10px] font-medium text-slate-800">คน</span>
              </div>
              <div className="text-[10px] text-slate-400">21.9%</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-500 mb-0.5">2.00 - 3.00</div>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-bold text-slate-800">68</span>
                <span className="text-[10px] font-medium text-slate-800">คน</span>
              </div>
              <div className="text-[10px] text-slate-400">53.1%</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-500 mb-0.5">ต่ำกว่า 2.00</div>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-bold text-slate-800">32</span>
                <span className="text-[10px] font-medium text-slate-800">คน</span>
              </div>
              <div className="text-[10px] text-slate-400">25.0%</div>
            </div>
          </div>
          <div className="w-12 h-12 relative shrink-0">
            <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
              <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#3b82f6" strokeWidth="6" strokeDasharray="53.1 46.9" strokeDashoffset="0"></circle>
              <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#f59e0b" strokeWidth="6" strokeDasharray="25 75" strokeDashoffset="-53.1"></circle>
              <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#10b981" strokeWidth="6" strokeDasharray="21.9 78.1" strokeDashoffset="-78.1"></circle>
            </svg>
          </div>
        </div>
      </div>

      {/* กิจกรรมแผนพัฒนา */}
      <div className="rounded-2xl bg-white shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] border border-slate-100 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Target className="h-4 w-4 text-purple-500" />
          <h3 className="text-sm font-bold text-slate-800">กิจกรรมแผนพัฒนา</h3>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex gap-6">
            <div>
              <div className="text-[10px] text-slate-500 mb-0.5">แผนทั้งหมด</div>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-bold text-slate-800">23</span>
                <span className="text-[10px] font-medium text-slate-800">แผน</span>
              </div>
            </div>
            <div>
              <div className="text-[10px] text-slate-500 mb-0.5">กำลังดำเนินการ</div>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-bold text-slate-800">18</span>
                <span className="text-[10px] font-medium text-slate-800">แผน</span>
              </div>
              <div className="text-[10px] text-slate-400">78.3%</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-500 mb-0.5">เสร็จสิ้น</div>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-bold text-slate-800">5</span>
                <span className="text-[10px] font-medium text-slate-800">แผน</span>
              </div>
              <div className="text-[10px] text-slate-400">21.7%</div>
            </div>
          </div>
          <div className="w-12 h-12 relative shrink-0">
            <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
              <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#8b5cf6" strokeWidth="6" strokeDasharray="78.3 21.7" strokeDashoffset="0"></circle>
              <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#10b981" strokeWidth="6" strokeDasharray="21.7 78.3" strokeDashoffset="-78.3"></circle>
            </svg>
          </div>
        </div>
      </div>

    </div>
  )
}
