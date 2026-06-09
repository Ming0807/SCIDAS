import React from "react"

export function RiskCharts() {
  return (
    <>
      {/* Line Chart */}
      <div className="col-span-1 lg:col-span-6 rounded-2xl bg-white shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] border border-slate-100 p-6 flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-sm font-bold text-slate-800">แนวโน้มความเสี่ยงรายเดือน</h3>
          <select className="text-[11px] border border-slate-200 rounded-md px-2 py-1 bg-slate-50 text-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500">
            <option>6 เดือนล่าสุด</option>
          </select>
        </div>
        <div className="flex-1 w-full bg-white relative min-h-[180px] flex flex-col">
          <div className="flex justify-center gap-6 text-[11px] font-medium mb-4">
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#10b981]"></span><span className="text-slate-600">ปกติ</span></div>
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]"></span><span className="text-slate-600">เฝ้าระวัง</span></div>
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#ef4444]"></span><span className="text-slate-600">เสี่ยงสูง</span></div>
          </div>
          <div className="flex-1 relative border-l border-b border-slate-200 ml-6 pb-6 mt-2">
            <div className="absolute left-[-24px] top-0 text-[10px] text-slate-400">100</div>
            <div className="absolute left-[-20px] top-[25%] text-[10px] text-slate-400">80</div>
            <div className="absolute left-[-20px] top-[50%] text-[10px] text-slate-400">60</div>
            <div className="absolute left-[-20px] top-[75%] text-[10px] text-slate-400">40</div>
            <div className="absolute left-[-20px] top-[100%] text-[10px] text-slate-400">20</div>
            <div className="absolute left-[-16px] bottom-[-6px] text-[10px] text-slate-400">0</div>

            <div className="absolute w-full border-t border-slate-100 top-[25%]"></div>
            <div className="absolute w-full border-t border-slate-100 top-[50%]"></div>
            <div className="absolute w-full border-t border-slate-100 top-[75%]"></div>
            <div className="absolute w-full border-t border-slate-100 top-[100%]"></div>
            
            <div className="absolute bottom-[-24px] w-full flex justify-between text-[10px] text-slate-500 px-4">
              <span>ธ.ค. 66</span><span>ม.ค. 67</span><span>ก.พ. 67</span><span>มี.ค. 67</span><span>เม.ย. 67</span><span>พ.ค. 67</span>
            </div>
            
            <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
              <polyline fill="none" stroke="#10b981" strokeWidth="2" points="20,30 80,32 140,25 200,35 260,33 320,30" />
              <circle cx="20" cy="30" r="3" fill="#10b981" />
              <circle cx="80" cy="32" r="3" fill="#10b981" />
              <circle cx="140" cy="25" r="3" fill="#10b981" />
              <circle cx="200" cy="35" r="3" fill="#10b981" />
              <circle cx="260" cy="33" r="3" fill="#10b981" />
              <circle cx="320" cy="30" r="3" fill="#10b981" />

              <polyline fill="none" stroke="#f59e0b" strokeWidth="2" points="20,110 80,95 140,105 200,90 260,85 320,83" />
              <circle cx="20" cy="110" r="3" fill="#f59e0b" />
              <circle cx="80" cy="95" r="3" fill="#f59e0b" />
              <circle cx="140" cy="105" r="3" fill="#f59e0b" />
              <circle cx="200" cy="90" r="3" fill="#f59e0b" />
              <circle cx="260" cy="85" r="3" fill="#f59e0b" />
              <circle cx="320" cy="83" r="3" fill="#f59e0b" />

              <polyline fill="none" stroke="#ef4444" strokeWidth="2" points="20,165 80,155 140,165 200,150 260,148 320,148" />
              <circle cx="20" cy="165" r="3" fill="#ef4444" />
              <circle cx="80" cy="155" r="3" fill="#ef4444" />
              <circle cx="140" cy="165" r="3" fill="#ef4444" />
              <circle cx="200" cy="150" r="3" fill="#ef4444" />
              <circle cx="260" cy="148" r="3" fill="#ef4444" />
              <circle cx="320" cy="148" r="3" fill="#ef4444" />
            </svg>
          </div>
        </div>
      </div>

      {/* Donut Chart */}
      <div className="col-span-1 lg:col-span-3 rounded-2xl bg-white shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] border border-slate-100 p-6 flex flex-col">
        <h3 className="text-sm font-bold text-slate-800 mb-6">สัดส่วนระดับความเสี่ยง</h3>
        <div className="flex-1 flex flex-col justify-center gap-6">
          <div className="relative w-32 h-32 mx-auto">
            <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
              <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#ef4444" strokeWidth="4" strokeDasharray="5.5 94.5" strokeDashoffset="0"></circle>
              <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#f59e0b" strokeWidth="4" strokeDasharray="14.1 85.9" strokeDashoffset="-5.5"></circle>
              <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#10b981" strokeWidth="4" strokeDasharray="80.4 19.6" strokeDashoffset="-19.6"></circle>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-bold text-slate-800 leading-none">128</span>
              <span className="text-[10px] text-slate-500 mt-0.5">คน</span>
            </div>
          </div>
          
          <div className="space-y-3 px-2">
            <div className="flex justify-between items-center text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#10b981]"></span>
                <span className="text-slate-600 font-medium">ปกติ</span>
              </div>
              <div className="text-right">
                <span className="font-bold text-slate-800 mr-2">103 คน</span>
                <span className="text-slate-400 text-[10px]">(80.5%)</span>
              </div>
            </div>
            <div className="flex justify-between items-center text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#f59e0b]"></span>
                <span className="text-slate-600 font-medium">เฝ้าระวัง</span>
              </div>
              <div className="text-right">
                <span className="font-bold text-slate-800 mr-2">18 คน</span>
                <span className="text-slate-400 text-[10px]">(14.1%)</span>
              </div>
            </div>
            <div className="flex justify-between items-center text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#ef4444]"></span>
                <span className="text-slate-600 font-medium">เสี่ยงสูง</span>
              </div>
              <div className="text-right">
                <span className="font-bold text-slate-800 mr-2">7 คน</span>
                <span className="text-slate-400 text-[10px]">(5.5%)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
