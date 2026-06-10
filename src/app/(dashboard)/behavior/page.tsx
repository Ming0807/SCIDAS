import React from "react"
import { Bell, ChevronRight, Plus, Search, TrendingUp, ThumbsUp, ThumbsDown, AlertCircle } from "lucide-react"
import Link from "next/link"

export default function BehaviorDashboardPage() {
  return (
    <div className="flex p-4 sm:p-6 lg:p-8 bg-slate-50 min-h-[calc(100vh-64px)] flex-col overflow-x-hidden">
      
      {/* Breadcrumb & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div className="flex flex-col">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">ภาพรวมพฤติกรรมนักเรียน</h1>
          <div className="flex items-center gap-2 mt-1 text-[13px] text-slate-500 font-medium">
            <Link href="/" className="hover:text-blue-600">หน้าหลัก</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-slate-800">พฤติกรรม</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button className="hidden sm:flex items-center justify-center gap-1.5 bg-[#4f46e5] hover:bg-[#4338ca] text-white text-[13px] font-bold py-2 px-4 rounded-lg transition-colors shadow-sm">
            <Plus className="w-4 h-4" />
            บันทึกพฤติกรรม
          </button>
          
          <div className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-[13px] font-medium text-slate-700 shadow-sm flex items-center gap-2 cursor-pointer hover:bg-slate-50">
            ภาคเรียนที่ 1/2567
            <ChevronRight className="w-3.5 h-3.5 rotate-90 text-slate-400" />
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col min-h-0">
        
        {/* Top Summary Cards */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div className="text-[12px] font-bold text-slate-500 mb-2">บันทึกพฤติกรรมทั้งหมด</div>
            <div className="flex items-end justify-between">
              <div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-slate-800 leading-none">1,245</span>
                  <span className="text-[12px] text-slate-500">ครั้ง</span>
                </div>
                <div className="flex items-center gap-1 text-[11px] font-medium text-emerald-600 mt-2">
                  <TrendingUp className="w-3.5 h-3.5" />
                  +12% จากเดือนที่แล้ว
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div className="text-[12px] font-bold text-emerald-600 mb-2">พฤติกรรมเชิงบวก</div>
            <div className="flex items-end justify-between">
              <div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-slate-800 leading-none">980</span>
                  <span className="text-[12px] text-slate-500">ครั้ง</span>
                </div>
                <div className="text-[11px] font-medium text-emerald-600 mt-2">คิดเป็น 78.7%</div>
              </div>
              <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500">
                <ThumbsUp className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="bg-rose-50 p-5 rounded-xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-rose-100 flex flex-col justify-between relative overflow-hidden">
            <div className="text-[12px] font-bold text-rose-800 mb-2 relative z-10">พฤติกรรมเชิงลบ</div>
            <div className="flex items-end justify-between relative z-10">
              <div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-rose-700 leading-none">265</span>
                  <span className="text-[12px] text-rose-600">ครั้ง</span>
                </div>
                <div className="text-[11px] font-medium text-rose-600 mt-2">คิดเป็น 21.3%</div>
              </div>
              <div className="w-12 h-12 rounded-full bg-white/50 flex items-center justify-center text-rose-500">
                <ThumbsDown className="w-6 h-6" />
              </div>
            </div>
          </div>
          
          <div className="bg-amber-50 p-5 rounded-xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-amber-100 flex flex-col justify-between">
            <div className="text-[12px] font-bold text-amber-800 mb-2">นักเรียนที่ต้องติดตามพิเศษ</div>
            <div className="flex items-end justify-between">
              <div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-amber-700 leading-none">12</span>
                  <span className="text-[12px] text-amber-600">คน</span>
                </div>
                <div className="text-[11px] font-medium text-amber-600 mt-2">มีพฤติกรรมลบซ้ำซ้อน</div>
              </div>
              <div className="w-12 h-12 rounded-full bg-white/50 flex items-center justify-center text-amber-500">
                <AlertCircle className="w-6 h-6" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          
          {/* Recent Behaviors List */}
          <div className="xl:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col min-h-0">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-[15px] font-bold text-slate-800">บันทึกพฤติกรรมล่าสุด</h2>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="ค้นหานักเรียน..." 
                  className="pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-[#4f46e5]/20 focus:border-[#4f46e5] w-48 sm:w-64 transition-all"
                />
              </div>
            </div>
            
            <div className="p-0 overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="border-b border-slate-100 text-[12px] font-bold text-slate-500 bg-slate-50/50">
                    <th className="py-3 px-5 font-bold whitespace-nowrap">นักเรียน</th>
                    <th className="py-3 px-5 font-bold whitespace-nowrap">ประเภท</th>
                    <th className="py-3 px-5 font-bold whitespace-nowrap">พฤติกรรม</th>
                    <th className="py-3 px-5 font-bold hidden md:table-cell whitespace-nowrap">วันที่/เวลา</th>
                    <th className="py-3 px-5 font-bold text-center whitespace-nowrap">จัดการ</th>
                  </tr>
                </thead>
                <tbody className="text-[13px]">
                  {[
                    { id: 1, name: "เด็กชายธนวัฒน์ ใจดี", class: "ม.2/1", type: "positive", behavior: "ช่วยเหลืองานครู", date: "วันนี้ 10:30 น." },
                    { id: 2, name: "เด็กหญิงสมศรี รักเรียน", class: "ม.1/2", type: "negative", behavior: "มาสาย", date: "วันนี้ 08:15 น." },
                    { id: 3, name: "เด็กชายพีรพล ช่างคิด", class: "ม.3/4", type: "positive", behavior: "ตั้งใจเรียน", date: "เมื่อวาน 14:00 น." },
                    { id: 4, name: "เด็กหญิงวิภาดา แสนดี", class: "ม.2/2", type: "negative", behavior: "ไม่ส่งการบ้าน", date: "เมื่อวาน 09:30 น." },
                    { id: 5, name: "เด็กชายเอกภพ ทองแท้", class: "ม.1/1", type: "positive", behavior: "เก็บของได้นำมาส่ง", date: "12 พ.ค. 2567" },
                  ].map((record, index) => (
                    <tr key={index} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 px-5 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=student${index}`} alt="avatar" className="w-8 h-8 rounded-full bg-slate-100" />
                          <div>
                            <div className="font-bold text-slate-800">{record.name}</div>
                            <div className="text-[11px] text-slate-500">ชั้น {record.class}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-5 whitespace-nowrap">
                        {record.type === "positive" ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-emerald-50 text-emerald-600 text-[11px] font-bold">
                            <ThumbsUp className="w-3 h-3" />
                            เชิงบวก
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-rose-50 text-rose-600 text-[11px] font-bold">
                            <ThumbsDown className="w-3 h-3" />
                            เชิงลบ
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-5 text-slate-700 font-medium whitespace-nowrap">{record.behavior}</td>
                      <td className="py-3 px-5 text-slate-500 hidden md:table-cell whitespace-nowrap">{record.date}</td>
                      <td className="py-3 px-5 text-center whitespace-nowrap">
                        <Link href={`/behavior/${record.id}`} className="text-[#4f46e5] hover:text-[#4338ca] font-bold text-[12px] bg-blue-50 px-3 py-1.5 rounded hover:bg-blue-100 transition-colors inline-block">
                          ดูข้อมูล
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="p-4 border-t border-slate-100 text-center">
              <button className="text-[13px] font-bold text-slate-500 hover:text-slate-800 transition-colors">
                ดูประวัติทั้งหมด
              </button>
            </div>
          </div>

          {/* Top Students / Leaderboard */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col p-5">
            <h2 className="text-[15px] font-bold text-slate-800 mb-4">นักเรียนที่ได้รับคำชมสูงสุด</h2>
            <div className="flex flex-col gap-4">
              {[
                { name: "เด็กหญิงพรพิมล ศรีทอง", class: "ม.3/1", points: 24 },
                { name: "เด็กชายจิรายุ ภักดี", class: "ม.2/3", points: 18 },
                { name: "เด็กหญิงศิริกัญญา ใจรักษ์", class: "ม.1/1", points: 15 },
                { name: "เด็กชายกฤษณะ พูนทรัพย์", class: "ม.2/2", points: 14 },
                { name: "เด็กหญิงกนกวรรณ มีสุข", class: "ม.1/3", points: 12 },
              ].map((student, i) => (
                <div key={i} className="flex items-center justify-between group cursor-pointer hover:bg-slate-50 p-2 -mx-2 rounded-lg transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold flex items-center justify-center shrink-0">
                      {i + 1}
                    </div>
                    <div>
                      <div className="font-bold text-slate-800 text-[13px] group-hover:text-[#4f46e5] transition-colors line-clamp-1 break-all">{student.name}</div>
                      <div className="text-[11px] text-slate-500">ชั้น {student.class}</div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end shrink-0 pl-2">
                    <div className="text-[13px] font-bold text-emerald-600">{student.points}</div>
                    <div className="text-[10px] text-slate-400">ครั้ง</div>
                  </div>
                </div>
              ))}
            </div>
            
            <button className="mt-auto pt-4 text-[13px] font-bold text-[#4f46e5] hover:text-[#4338ca] text-left transition-colors">
              ดูอันดับทั้งหมด →
            </button>
          </div>
          
        </div>
      </div>
    </div>
  )
}
