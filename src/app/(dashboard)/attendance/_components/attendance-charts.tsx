import React from "react"
import { ChevronDown } from "lucide-react"

export function AttendanceCharts() {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      
      {/* Line Chart */}
      <div className="bg-white rounded-2xl p-5 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] border border-slate-100 flex flex-col h-full min-h-[300px]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-slate-800 text-sm">แนวโน้มการมาเรียนรายเดือน</h3>
          <div className="relative">
            <select className="appearance-none bg-slate-50 border border-slate-200 text-slate-600 text-xs font-medium rounded-lg pl-3 pr-7 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>6 เดือนล่าสุด</option>
              <option>ปีการศึกษา 2567</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
              <ChevronDown className="h-3 w-3" />
            </div>
          </div>
        </div>

        <div className="flex justify-center gap-4 text-[10px] sm:text-xs font-medium mb-6">
          <div className="flex items-center gap-1.5 text-slate-600"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> มาเรียน</div>
          <div className="flex items-center gap-1.5 text-slate-600"><span className="w-2 h-2 rounded-full bg-red-500"></span> ขาดเรียน</div>
          <div className="flex items-center gap-1.5 text-slate-600"><span className="w-2 h-2 rounded-full bg-amber-500"></span> ลา</div>
          <div className="flex items-center gap-1.5 text-slate-600"><span className="w-2 h-2 rounded-full bg-blue-500"></span> มาสาย</div>
        </div>

        {/* Mock Line Chart with SVG */}
        <div className="flex-1 relative w-full mt-auto">
          {/* Y Axis Labels */}
          <div className="absolute left-0 top-0 bottom-6 flex flex-col justify-between text-[10px] text-slate-400 font-medium z-10 w-6">
            <span>100</span>
            <span>80</span>
            <span>60</span>
            <span>40</span>
            <span>20</span>
            <span>0</span>
          </div>

          <div className="pl-8 h-full w-full relative">
            {/* Grid lines */}
            <div className="absolute inset-0 pl-8 pb-6 flex flex-col justify-between">
              <div className="w-full h-px bg-slate-100"></div>
              <div className="w-full h-px bg-slate-100"></div>
              <div className="w-full h-px bg-slate-100"></div>
              <div className="w-full h-px bg-slate-100"></div>
              <div className="w-full h-px bg-slate-100"></div>
              <div className="w-full h-px bg-slate-200"></div>
            </div>

            {/* SVG Chart */}
            <svg viewBox="0 0 400 150" className="w-full h-[calc(100%-24px)] overflow-visible relative z-10" preserveAspectRatio="none">
              {/* Green Line (มาเรียน) */}
              <polyline fill="none" stroke="#10b981" strokeWidth="2" points="10,20 86,22 162,25 238,22 314,18 390,15" />
              {/* Data points */}
              <circle cx="10" cy="20" r="3" fill="#10b981" />
              <circle cx="86" cy="22" r="3" fill="#10b981" />
              <circle cx="162" cy="25" r="3" fill="#10b981" />
              <circle cx="238" cy="22" r="3" fill="#10b981" />
              <circle cx="314" cy="18" r="3" fill="#10b981" />
              <circle cx="390" cy="15" r="3" fill="#10b981" />

              {/* Red Line (ขาด) */}
              <polyline fill="none" stroke="#ef4444" strokeWidth="2" points="10,130 86,128 162,132 238,125 314,128 390,122" />
              <circle cx="10" cy="130" r="3" fill="#ef4444" />
              <circle cx="86" cy="128" r="3" fill="#ef4444" />
              <circle cx="162" cy="132" r="3" fill="#ef4444" />
              <circle cx="238" cy="125" r="3" fill="#ef4444" />
              <circle cx="314" cy="128" r="3" fill="#ef4444" />
              <circle cx="390" cy="122" r="3" fill="#ef4444" />

              {/* Orange Line (ลา) */}
              <polyline fill="none" stroke="#f59e0b" strokeWidth="2" points="10,140 86,138 162,142 238,138 314,140 390,135" />
              <circle cx="10" cy="140" r="3" fill="#f59e0b" />
              <circle cx="86" cy="138" r="3" fill="#f59e0b" />
              <circle cx="162" cy="142" r="3" fill="#f59e0b" />
              <circle cx="238" cy="138" r="3" fill="#f59e0b" />
              <circle cx="314" cy="140" r="3" fill="#f59e0b" />
              <circle cx="390" cy="135" r="3" fill="#f59e0b" />

              {/* Blue Line (มาสาย) */}
              <polyline fill="none" stroke="#3b82f6" strokeWidth="2" points="10,145 86,145 162,146 238,143 314,145 390,142" />
              <circle cx="10" cy="145" r="3" fill="#3b82f6" />
              <circle cx="86" cy="145" r="3" fill="#3b82f6" />
              <circle cx="162" cy="146" r="3" fill="#3b82f6" />
              <circle cx="238" cy="143" r="3" fill="#3b82f6" />
              <circle cx="314" cy="145" r="3" fill="#3b82f6" />
              <circle cx="390" cy="142" r="3" fill="#3b82f6" />
            </svg>

            {/* X Axis Labels */}
            <div className="absolute left-8 right-0 bottom-0 flex justify-between text-[10px] text-slate-400 font-medium">
              <span className="w-10 text-center -ml-5">ธ.ค. 66</span>
              <span className="w-10 text-center -ml-5">ม.ค. 67</span>
              <span className="w-10 text-center -ml-5">ก.พ. 67</span>
              <span className="w-10 text-center -ml-5">มี.ค. 67</span>
              <span className="w-10 text-center -ml-5">เม.ย. 67</span>
              <span className="w-10 text-center -ml-5 text-slate-700 font-bold">พ.ค. 67</span>
            </div>
          </div>
        </div>
      </div>

      {/* Donut Chart */}
      <div className="bg-white rounded-2xl p-5 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] border border-slate-100 flex flex-col h-full min-h-[300px]">
        <h3 className="font-bold text-slate-800 text-sm mb-6">สัดส่วนสถานะการมาเรียนวันนี้</h3>
        
        <div className="flex flex-col sm:flex-row xl:flex-col 2xl:flex-row items-center justify-center gap-6 xl:gap-4 2xl:gap-8 flex-1 w-full">
          {/* Donut Graphic */}
          <div className="relative w-32 h-32 sm:w-40 sm:h-40 shrink-0">
            {/* SVG Donut Chart */}
            <svg viewBox="0 0 42 42" className="w-full h-full transform -rotate-90 overflow-visible">
              {/* Background circle */}
              <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#f1f5f9" strokeWidth="6"></circle>
              {/* Segments (Stroke dasharray is percentage, rest is 100-percentage) */}
              {/* Green (มาเรียน) - 87.5% */}
              <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#10b981" strokeWidth="6" strokeDasharray="87.5 12.5" strokeDashoffset="0"></circle>
              {/* Red (ขาด) - 6.3% -> start at 87.5 -> offset = 100-87.5 = 12.5 */}
              <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#ef4444" strokeWidth="6" strokeDasharray="6.3 93.7" strokeDashoffset="-87.5"></circle>
              {/* Orange (ลา) - 1.5% -> offset = -(87.5+6.3) = -93.8 */}
              <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#f59e0b" strokeWidth="6" strokeDasharray="1.5 98.5" strokeDashoffset="-93.8"></circle>
              {/* Blue (สาย) - 4.7% -> offset = -(87.5+6.3+1.5) = -95.3 */}
              <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#3b82f6" strokeWidth="6" strokeDasharray="4.7 95.3" strokeDashoffset="-95.3"></circle> 
            </svg>
            
            {/* Center Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl sm:text-2xl font-bold text-slate-800">128</span>
              <span className="text-[10px] sm:text-xs text-slate-500 font-medium">คน</span>
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-col gap-3 w-full sm:w-auto">
            
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0"></span>
                <span className="text-sm text-slate-700 font-medium">มาเรียน</span>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-slate-800">118 คน</div>
                <div className="text-[10px] text-slate-400">(92.2%)</div>
              </div>
            </div>

            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 shrink-0"></span>
                <span className="text-sm text-slate-700 font-medium">ขาดเรียน</span>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-slate-800">8 คน</div>
                <div className="text-[10px] text-slate-400">(6.3%)</div>
              </div>
            </div>

            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0"></span>
                <span className="text-sm text-slate-700 font-medium">ลา</span>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-slate-800">2 คน</div>
                <div className="text-[10px] text-slate-400">(1.5%)</div>
              </div>
            </div>

            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0"></span>
                <span className="text-sm text-slate-700 font-medium">มาสาย</span>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-slate-800">6 คน</div>
                <div className="text-[10px] text-slate-400">(4.7%)</div>
              </div>
            </div>

          </div>
        </div>

      </div>

    </div>
  )
}
