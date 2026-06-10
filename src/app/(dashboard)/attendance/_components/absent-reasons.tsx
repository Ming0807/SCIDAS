import React from "react"
import { Thermometer, Home, Car, HelpCircle } from "lucide-react"

export function AbsentReasons() {
  return (
    <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm h-full min-h-[300px]">
      <div className="flex justify-between items-center mb-5">
        <h3 className="font-bold text-slate-800 text-sm">เหตุผลการขาดเรียนที่พบบ่อย</h3>
        <a href="#" className="text-xs text-blue-600 hover:underline">ดูทั้งหมด</a>
      </div>

      <div className="space-y-4">
        
        {/* Item 1 */}
        <div className="flex items-center justify-between group">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-pink-50 flex items-center justify-center shrink-0">
              <Thermometer className="w-4 h-4 text-pink-500" />
            </div>
            <span className="text-sm font-medium text-slate-700">ป่วย</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-800">3 คน</span>
            <span className="text-xs text-slate-400 w-12 text-right">(37.5%)</span>
          </div>
        </div>

        {/* Item 2 */}
        <div className="flex items-center justify-between group">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center shrink-0">
              <Home className="w-4 h-4 text-orange-500" />
            </div>
            <span className="text-sm font-medium text-slate-700">กิจกรรมครอบครัว</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-800">2 คน</span>
            <span className="text-xs text-slate-400 w-12 text-right">(25.0%)</span>
          </div>
        </div>

        {/* Item 3 */}
        <div className="flex items-center justify-between group">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
              <Car className="w-4 h-4 text-blue-500" />
            </div>
            <span className="text-sm font-medium text-slate-700">ไม่มีพาหนะ</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-800">2 คน</span>
            <span className="text-xs text-slate-400 w-12 text-right">(25.0%)</span>
          </div>
        </div>

        {/* Item 4 */}
        <div className="flex items-center justify-between group">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center shrink-0">
              <HelpCircle className="w-4 h-4 text-purple-500" />
            </div>
            <span className="text-sm font-medium text-slate-700">ไม่ทราบสาเหตุ</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-800">1 คน</span>
            <span className="text-xs text-slate-400 w-12 text-right">(12.5%)</span>
          </div>
        </div>

      </div>
    </div>
  )
}
