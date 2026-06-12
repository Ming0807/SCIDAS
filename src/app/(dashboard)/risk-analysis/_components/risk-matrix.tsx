import React from "react"
import { Info } from "lucide-react"

type RiskCounts = {
  high: number
  watch: number
  normal: number
  total: number
}

export function RiskMatrix({ riskCounts }: { riskCounts?: RiskCounts | null }) {
  return (
    <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex-1 flex flex-col xl:flex-row gap-6 xl:items-stretch min-w-0">
      
      <div className="flex-1 flex flex-col min-w-0">
        <h3 className="text-sm font-bold text-slate-800 mb-6">แผนภาพความเสี่ยง (Risk Matrix)</h3>
        
        <div className="flex relative mt-4 ml-10">
          
          {/* Y Axis Label */}
          <div className="absolute -left-10 top-0 bottom-6 flex flex-col justify-between py-4 w-16 items-start">
            <span className="text-xs font-semibold text-slate-700 mb-2 -ml-2 whitespace-nowrap">ผลกระทบ</span>
            <span className="text-xs text-slate-600">5 สูงมาก</span>
            <span className="text-xs text-slate-600">4 สูง</span>
            <span className="text-xs text-slate-600">3 ปานกลาง</span>
            <span className="text-xs text-slate-600">2 น้อย</span>
            <span className="text-xs text-slate-600">1 น้อยมาก</span>
          </div>

          <div className="flex-1 ml-8">
            {/* Grid 5x5 */}
            <div className="grid grid-cols-5 grid-rows-5 h-[240px] gap-0.5">
              {/* Row 5 */}
              <div className="bg-green-200 hover:opacity-80 transition-opacity cursor-pointer flex items-center justify-center font-bold text-sm text-slate-700">2</div>
              <div className="bg-yellow-200 hover:opacity-80 transition-opacity cursor-pointer flex items-center justify-center font-bold text-sm text-slate-700">3</div>
              <div className="bg-yellow-400 hover:opacity-80 transition-opacity cursor-pointer flex items-center justify-center font-bold text-sm text-slate-700">5</div>
              <div className="bg-red-400 hover:opacity-80 transition-opacity cursor-pointer flex items-center justify-center font-bold text-sm text-white">7</div>
              <div className="bg-red-500 hover:opacity-80 transition-opacity cursor-pointer flex items-center justify-center font-bold text-sm text-white">12</div>
              
              {/* Row 4 */}
              <div className="bg-green-300 hover:opacity-80 transition-opacity cursor-pointer flex items-center justify-center font-bold text-sm text-slate-700">1</div>
              <div className="bg-yellow-200 hover:opacity-80 transition-opacity cursor-pointer flex items-center justify-center font-bold text-sm text-slate-700">4</div>
              <div className="bg-yellow-400 hover:opacity-80 transition-opacity cursor-pointer flex items-center justify-center font-bold text-sm text-slate-700">7</div>
              <div className="bg-orange-400 hover:opacity-80 transition-opacity cursor-pointer flex items-center justify-center font-bold text-sm text-white">9</div>
              <div className="bg-red-500 hover:opacity-80 transition-opacity cursor-pointer flex items-center justify-center font-bold text-sm text-white">16</div>

              {/* Row 3 */}
              <div className="bg-green-300 hover:opacity-80 transition-opacity cursor-pointer flex items-center justify-center font-bold text-sm text-slate-700">6</div>
              <div className="bg-yellow-200 hover:opacity-80 transition-opacity cursor-pointer flex items-center justify-center font-bold text-sm text-slate-700">9</div>
              <div className="bg-yellow-400 hover:opacity-80 transition-opacity cursor-pointer flex items-center justify-center font-bold text-sm text-slate-700">13</div>
              <div className="bg-orange-400 hover:opacity-80 transition-opacity cursor-pointer flex items-center justify-center font-bold text-sm text-white">16</div>
              <div className="bg-red-500 hover:opacity-80 transition-opacity cursor-pointer flex items-center justify-center font-bold text-sm text-white">21</div>

              {/* Row 2 */}
              <div className="bg-green-400 hover:opacity-80 transition-opacity cursor-pointer flex items-center justify-center font-bold text-sm text-slate-700">12</div>
              <div className="bg-green-300 hover:opacity-80 transition-opacity cursor-pointer flex items-center justify-center font-bold text-sm text-slate-700">15</div>
              <div className="bg-yellow-200 hover:opacity-80 transition-opacity cursor-pointer flex items-center justify-center font-bold text-sm text-slate-700">18</div>
              <div className="bg-yellow-400 hover:opacity-80 transition-opacity cursor-pointer flex items-center justify-center font-bold text-sm text-slate-700">9</div>
              <div className="bg-orange-400 hover:opacity-80 transition-opacity cursor-pointer flex items-center justify-center font-bold text-sm text-white">11</div>

              {/* Row 1 */}
              <div className="bg-green-500 hover:opacity-80 transition-opacity cursor-pointer flex items-center justify-center font-bold text-sm text-white">20</div>
              <div className="bg-green-400 hover:opacity-80 transition-opacity cursor-pointer flex items-center justify-center font-bold text-sm text-slate-700">18</div>
              <div className="bg-green-300 hover:opacity-80 transition-opacity cursor-pointer flex items-center justify-center font-bold text-sm text-slate-700">16</div>
              <div className="bg-lime-200 hover:opacity-80 transition-opacity cursor-pointer flex items-center justify-center font-bold text-sm text-slate-700">7</div>
              <div className="bg-yellow-200 hover:opacity-80 transition-opacity cursor-pointer flex items-center justify-center font-bold text-sm text-slate-700">3</div>
            </div>

            {/* X Axis Label */}
            <div className="flex justify-between mt-2 pt-1 text-center font-medium">
              <div className="flex-1 text-xs text-slate-600">1 น้อยมาก</div>
              <div className="flex-1 text-xs text-slate-600">2 น้อย</div>
              <div className="flex-1 text-xs text-slate-600">3 ปานกลาง</div>
              <div className="flex-1 text-xs text-slate-600">4 สูง</div>
              <div className="flex-1 text-xs text-slate-600">5 สูงมาก</div>
            </div>
            <div className="text-center mt-2 text-xs font-semibold text-slate-700">โอกาสที่จะเกิด</div>
          </div>
        </div>
      </div>

      <div className="w-px bg-slate-100 hidden xl:block mx-2"></div>

      {/* Legend & Summary */}
      <div className="xl:w-[220px] shrink-0 flex flex-col mt-6 xl:mt-0 justify-between">
        
        <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 h-full flex flex-col">
          <h4 className="text-sm font-semibold text-slate-900 mb-4">ระดับความเสี่ยง</h4>
          
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                <span className="text-xs font-semibold text-slate-900">เสี่ยงสูง (16-25)</span>
              </div>
              <span className="text-xs font-semibold text-slate-900">{riskCounts?.high ?? "-"} คน</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-400"></div>
                <span className="text-xs font-medium text-slate-700">เสี่ยงปานกลาง (8-14)</span>
              </div>
              <span className="text-xs font-semibold text-slate-900">{riskCounts?.watch ?? "-"} คน</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                <span className="text-xs font-medium text-slate-700">เสี่ยงต่ำ (1-7)</span>
              </div>
              <span className="text-xs font-semibold text-slate-900">{riskCounts?.normal ?? "-"} คน</span>
            </div>
          </div>

          <div className="mt-auto pt-5 border-t border-slate-200">
            <div className="text-xs text-slate-500 font-medium mb-2">เกณฑ์การประเมิน</div>
            <div className="text-xs text-slate-600 mb-4 leading-relaxed">พิจารณาจาก โอกาสที่จะเกิด × ผลกระทบ</div>
            <button className="w-full py-2 px-3 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors flex items-center justify-center gap-2 shadow-sm">
              ดูเกณฑ์การประเมิน
              <Info className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>

    </div>
  )
}
