import React from "react"
import { Bell, LayoutGrid, MessageSquare, AlertTriangle, BookOpen, Smile, HeartPulse, Calendar as CalendarIcon, Settings, ChevronLeft, ChevronRight } from "lucide-react"

export function DesktopNotificationSidebar() {
  return (
    <div className="flex flex-col gap-6">
      
      {/* Unread Banner */}
      <div className="bg-indigo-600 rounded-xl p-5 text-white relative overflow-hidden shadow-lg shadow-indigo-200">
        <h3 className="text-[14px] font-bold mb-1 relative z-10">ภาพรวมการแจ้งเตือน</h3>
        <div className="flex items-baseline gap-2 relative z-10 mb-1">
          <span className="text-[36px] font-bold leading-none">8</span>
          <span className="text-[12px] text-indigo-100">รายการที่ยังไม่ได้อ่าน</span>
        </div>
        
        {/* Decorative Bell */}
        <div className="absolute -right-4 -bottom-4 opacity-20 transform rotate-12">
          <Bell className="w-32 h-32" fill="currentColor" />
        </div>
        <div className="absolute top-4 right-4 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-[10px] font-bold border-2 border-indigo-500 z-10">
          8
        </div>
      </div>

      {/* Menu Categories */}
      <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-sm">
        <div className="flex flex-col gap-1">
          <button className="flex items-center justify-between p-2.5 rounded-xl text-slate-700 hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-3">
              <LayoutGrid className="w-4 h-4 text-slate-400" />
              <span className="text-[13px] font-medium">ทั้งหมด</span>
            </div>
            <span className="text-[12px] font-bold text-slate-500">32</span>
          </button>
          
          <button className="flex items-center justify-between p-2.5 rounded-xl bg-indigo-50 text-indigo-700 transition-colors">
            <div className="flex items-center gap-3">
              <MessageSquare className="w-4 h-4 text-indigo-500" />
              <span className="text-[13px] font-bold">ยังไม่ได้อ่าน</span>
            </div>
            <span className="text-[12px] font-bold text-indigo-600">8</span>
          </button>

          <button className="flex items-center justify-between p-2.5 rounded-xl text-slate-700 hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-4 h-4 text-orange-500" />
              <span className="text-[13px] font-medium">สำคัญ</span>
            </div>
            <span className="text-[12px] font-bold text-slate-500">3</span>
          </button>

          <button className="flex items-center justify-between p-2.5 rounded-xl text-slate-700 hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-sm bg-green-100 flex items-center justify-center"><BookOpen className="w-3 h-3 text-green-600" /></div>
              <span className="text-[13px] font-medium">ผลการเรียน</span>
            </div>
            <span className="text-[12px] font-bold text-slate-500">6</span>
          </button>

          <button className="flex items-center justify-between p-2.5 rounded-xl text-slate-700 hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-sm bg-blue-100 flex items-center justify-center"><Smile className="w-3 h-3 text-blue-600" /></div>
              <span className="text-[13px] font-medium">พฤติกรรม</span>
            </div>
            <span className="text-[12px] font-bold text-slate-500">5</span>
          </button>

          <button className="flex items-center justify-between p-2.5 rounded-xl text-slate-700 hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-sm bg-purple-100 flex items-center justify-center"><HeartPulse className="w-3 h-3 text-purple-600" /></div>
              <span className="text-[13px] font-medium">การดูแลช่วยเหลือ</span>
            </div>
            <span className="text-[12px] font-bold text-slate-500">7</span>
          </button>

          <button className="flex items-center justify-between p-2.5 rounded-xl text-slate-700 hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-sm bg-yellow-100 flex items-center justify-center"><CalendarIcon className="w-3 h-3 text-yellow-600" /></div>
              <span className="text-[13px] font-medium">การนัดหมาย</span>
            </div>
            <span className="text-[12px] font-bold text-slate-500">4</span>
          </button>

          <button className="flex items-center justify-between p-2.5 rounded-xl text-slate-700 hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-sm bg-slate-100 flex items-center justify-center"><Settings className="w-3 h-3 text-slate-600" /></div>
              <span className="text-[13px] font-medium">ระบบ</span>
            </div>
            <span className="text-[12px] font-bold text-slate-500">7</span>
          </button>
        </div>
      </div>

      {/* Calendar Mini */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
        <h3 className="text-[13px] font-bold text-slate-800 mb-4">ปฏิทินการแจ้งเตือน</h3>
        
        <div className="flex items-center justify-between mb-4">
          <button className="p-1 hover:bg-slate-100 rounded-md transition-colors"><ChevronLeft className="w-4 h-4 text-slate-500" /></button>
          <span className="text-[12px] font-bold text-slate-700">พฤษภาคม 2567</span>
          <button className="p-1 hover:bg-slate-100 rounded-md transition-colors"><ChevronRight className="w-4 h-4 text-slate-500" /></button>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center mb-2">
          {['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'].map(day => (
            <div key={day} className="text-[10px] font-medium text-slate-400 py-1">{day}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-medium text-slate-700">
          <div className="py-1.5 text-slate-300">28</div>
          <div className="py-1.5 text-slate-300">29</div>
          <div className="py-1.5 text-slate-300">30</div>
          <div className="py-1.5">1</div>
          <div className="py-1.5">2</div>
          <div className="py-1.5 relative text-indigo-600 font-bold">
            3
            <div className="absolute bottom-0.5 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-indigo-500 rounded-full"></div>
          </div>
          <div className="py-1.5">4</div>

          <div className="py-1.5">5</div>
          <div className="py-1.5">6</div>
          <div className="py-1.5">7</div>
          <div className="py-1.5 relative text-red-500 font-bold">
            8
            <div className="absolute bottom-0.5 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-red-500 rounded-full"></div>
          </div>
          <div className="py-1.5">9</div>
          <div className="py-1.5">10</div>
          <div className="py-1.5">11</div>

          <div className="py-1.5">12</div>
          <div className="py-1.5">13</div>
          <div className="py-1.5">14</div>
          <div className="py-1.5 bg-indigo-600 text-white rounded-lg shadow-sm">15</div>
          <div className="py-1.5">16</div>
          <div className="py-1.5">17</div>
          <div className="py-1.5">18</div>

          <div className="py-1.5">19</div>
          <div className="py-1.5 relative text-orange-500 font-bold">
            20
            <div className="absolute bottom-0.5 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-orange-500 rounded-full"></div>
          </div>
          <div className="py-1.5">21</div>
          <div className="py-1.5">22</div>
          <div className="py-1.5">23</div>
          <div className="py-1.5">24</div>
          <div className="py-1.5">25</div>
          
          <div className="py-1.5">26</div>
          <div className="py-1.5">27</div>
          <div className="py-1.5">28</div>
          <div className="py-1.5">29</div>
          <div className="py-1.5">30</div>
          <div className="py-1.5">31</div>
          <div className="py-1.5 text-slate-300">1</div>
        </div>

      </div>

    </div>
  )
}
