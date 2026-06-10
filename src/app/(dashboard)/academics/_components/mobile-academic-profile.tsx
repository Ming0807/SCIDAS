import React from "react"
import { ChevronLeft, Filter, Download, Book, CheckCircle, XCircle, GraduationCap, ChevronDown, AlignJustify, Grid, ChevronRight, TrendingUp } from "lucide-react"

export function MobileAcademicProfile() {
  const subjects = [
    { name: "ค22101 คณิตศาสตร์พื้นฐาน", teacher: "ครูสุภาวดี มีสุข", credits: 2.0, grade: 4, score: 92 },
    { name: "อ22101 ภาษาไทย", teacher: "ครูจันทร์จิรา ทรงดี", credits: 2.0, grade: 4, score: 89 },
    { name: "ว22101 วิทยาศาสตร์และเทคโนโลยี", teacher: "ครูศิริวรรณ ใจงาม", credits: 2.0, grade: 3.5, score: 85 },
    { name: "ส22101 สังคมศึกษา ศาสนาและวัฒนธรรม", teacher: "ครูพงศ์ศิริ ปัญญา", credits: 2.0, grade: 3, score: 78 },
    { name: "พ22101 สุขศึกษาและพลศึกษา", teacher: "ครูเอกชัย แข็งแรง", credits: 1.0, grade: 4, score: 95 },
    { name: "ศ22101 ศิลปะ", teacher: "ครูอรทัย นิลศิริ", credits: 1.0, grade: 3.5, score: 87 },
  ]

  const getGradeColor = (grade: number) => {
    if (grade === 4) return "text-emerald-500 bg-emerald-50 border-emerald-100"
    if (grade >= 3.5) return "text-blue-500 bg-blue-50 border-blue-100"
    if (grade >= 3) return "text-amber-500 bg-amber-50 border-amber-100"
    if (grade >= 2) return "text-orange-500 bg-orange-50 border-orange-100"
    return "text-red-500 bg-red-50 border-red-100"
  }

  return (
    <div className="flex flex-col bg-slate-50 min-h-screen font-sans pb-20">
      
      {/* Top Header */}
      <div className="flex items-center justify-between px-4 pt-6 pb-4 bg-white sticky top-0 z-20 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
        <button className="p-2 -ml-2">
          <ChevronLeft className="w-6 h-6 text-slate-800" />
        </button>
        <span className="text-base font-semibold text-slate-900">ผลการเรียน</span>
        <button className="flex items-center gap-1.5 text-blue-600 text-sm font-semibold px-2 py-1 bg-blue-50 rounded-lg">
          <Filter className="w-4 h-4" />
          ตัวกรอง
        </button>
      </div>

      {/* Student Profile Header */}
      <div className="bg-white px-5 pt-4 pb-0">
        <div className="flex items-center gap-4 mb-5">
          <div className="relative">
            <img src="https://api.dicebear.com/7.x/notionists/svg?seed=boy1" alt="Avatar" className="w-16 h-16 rounded-full bg-slate-100 border-2 border-white shadow-md" />
            <div className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full"></div>
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-semibold text-slate-900 leading-tight mb-1">เด็กชายธนวัฒน์ ใจดี</h2>
            <div className="text-sm text-slate-500 mb-2">ม.2/1 เลขที่ 5</div>
            <span className="px-2 py-0.5 bg-[#e0e7ff] text-[#4f46e5] text-xs font-semibold rounded">กำลังศึกษา</span>
          </div>
          
          <div className="text-right flex flex-col items-end">
            <div className="text-xs font-medium text-slate-500 mb-0.5">เกรดเฉลี่ย (GPA)</div>
            <div className="flex items-center gap-1 mb-1">
              <span className="text-2xl font-semibold text-[#4f46e5] leading-none">3.48</span>
            </div>
            <div className="flex gap-0.5 mb-1 text-yellow-400">
              <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
              <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
              <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
              <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
              <svg className="w-3 h-3 fill-slate-200" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
            </div>
            <div className="text-xs font-medium text-slate-500">อันดับที่ 12 / 28 คน</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex justify-between border-b border-slate-100 px-1 overflow-x-auto no-scrollbar">
          <button className="pb-3 px-2 text-sm font-semibold text-[#4f46e5] border-b-2 border-[#4f46e5] whitespace-nowrap">ภาพรวม</button>
          <button className="pb-3 px-2 text-sm font-medium text-slate-500 whitespace-nowrap">รายวิชา</button>
          <button className="pb-3 px-2 text-sm font-medium text-slate-500 whitespace-nowrap">รายภาคเรียน</button>
          <button className="pb-3 px-2 text-sm font-medium text-slate-500 whitespace-nowrap">พัฒนาการ</button>
          <button className="pb-3 px-2 text-sm font-medium text-slate-500 whitespace-nowrap">เปรียบเทียบ</button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        
        {/* Term Selector & Download Button */}
        <div className="flex gap-3">
          <div className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2.5 flex items-center justify-between shadow-sm">
            <span className="text-sm font-semibold text-slate-800">ภาคเรียนที่ 1/2567</span>
            <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          </div>
          <button className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 flex items-center justify-center gap-1.5 shadow-sm text-blue-600 font-semibold text-sm">
            <Download className="w-4 h-4" />
            ดาวน์โหลดรายงาน
          </button>
        </div>

        {/* GPA Hero Card & Trend Chart Grid */}
        <div className="grid grid-cols-1 gap-4">
          
          {/* GPA Donut */}
          <div className="bg-gradient-to-br from-[#8b5cf6] to-[#4f46e5] rounded-3xl p-5 shadow-[0_8px_20px_rgba(79,70,229,0.2)] text-white relative overflow-hidden flex justify-between items-center">
            {/* BG Blurs */}
            <div className="absolute -left-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
            <div className="absolute right-0 bottom-0 w-32 h-32 bg-white/5 rounded-full blur-xl"></div>
            
            <div className="relative z-10 w-28 h-28 shrink-0">
              <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="3" />
                {/* 4.00+ */}
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#a78bfa" strokeWidth="3" strokeDasharray="45 55" strokeDashoffset="0" strokeLinecap="round"/>
                {/* 3.50+ */}
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#60a5fa" strokeWidth="3" strokeDasharray="30 70" strokeDashoffset="-45" strokeLinecap="round"/>
                {/* 2.50+ */}
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#fcd34d" strokeWidth="3" strokeDasharray="15 85" strokeDashoffset="-75" strokeLinecap="round"/>
                {/* 2.00+ */}
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#f97316" strokeWidth="3" strokeDasharray="10 90" strokeDashoffset="-90" strokeLinecap="round"/>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-semibold">3.48</span>
                <span className="text-xs font-medium opacity-80">GPA</span>
              </div>
            </div>

            <div className="relative z-10 pl-4 border-l border-white/20">
              <div className="text-xs font-semibold opacity-90 mb-0.5">สรุปผลการเรียน</div>
              <div className="text-xs opacity-70 mb-3">ภาคเรียนที่ 1/2567</div>
              
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#a78bfa]"></div>
                  <span className="opacity-90 w-16">4.00 ขึ้นไป</span>
                  <span className="font-semibold">7 รายวิชา</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#60a5fa]"></div>
                  <span className="opacity-90 w-16">3.50 - 3.99</span>
                  <span className="font-semibold">5 รายวิชา</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#fcd34d]"></div>
                  <span className="opacity-90 w-16">2.50 - 3.49</span>
                  <span className="font-semibold">2 รายวิชา</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#f97316]"></div>
                  <span className="opacity-90 w-16">2.00 - 2.49</span>
                  <span className="font-semibold">1 รายวิชา</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#ef4444]"></div>
                  <span className="opacity-90 w-16">ต่ำกว่า 2.00</span>
                  <span className="font-semibold">0 รายวิชา</span>
                </div>
              </div>
            </div>
          </div>

          {/* GPA Trend Line Chart */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
            <h3 className="text-xs font-semibold text-slate-800 mb-4">เปรียบเทียบ GPA</h3>
            <div className="flex-1 w-full relative min-h-[90px] flex items-end pb-4 pt-6">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 100 40" preserveAspectRatio="none">
                <path d="M 10,25 L 50,15 L 90,5" fill="none" stroke="#4f46e5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                
                {/* Points */}
                <circle cx="10" cy="25" r="3" fill="#4f46e5" />
                <circle cx="50" cy="15" r="3" fill="#4f46e5" />
                <circle cx="90" cy="5" r="3" fill="#4f46e5" />
                <circle cx="90" cy="5" r="6" fill="#4f46e5" opacity="0.2" />

                {/* Values */}
                <text x="10" y="18" fontSize="4.5" fill="#64748b" textAnchor="middle" fontWeight="bold">3.20</text>
                <text x="50" y="8" fontSize="4.5" fill="#64748b" textAnchor="middle" fontWeight="bold">3.35</text>
                <text x="90" y="-2" fontSize="4.5" fill="#4f46e5" textAnchor="middle" fontWeight="bold">3.48</text>

                {/* Labels */}
                <text x="10" y="40" fontSize="3.5" fill="#94a3b8" textAnchor="middle">ภาคเรียนที่</text>
                <text x="10" y="45" fontSize="3.5" fill="#94a3b8" textAnchor="middle">1/2566</text>
                
                <text x="50" y="40" fontSize="3.5" fill="#94a3b8" textAnchor="middle">ภาคเรียนที่</text>
                <text x="50" y="45" fontSize="3.5" fill="#94a3b8" textAnchor="middle">2/2566</text>
                
                <text x="90" y="40" fontSize="3.5" fill="#4f46e5" textAnchor="middle" fontWeight="bold">ภาคเรียนที่</text>
                <text x="90" y="45" fontSize="3.5" fill="#4f46e5" textAnchor="middle" fontWeight="bold">1/2567</text>
              </svg>
            </div>
            
            <div className="flex items-center gap-1.5 mt-5 bg-emerald-50 rounded-xl px-3 py-2 w-max border border-emerald-100">
              <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-emerald-600 leading-tight">เพิ่มขึ้น 0.13</span>
                <span className="text-[9px] text-emerald-600/70 leading-tight">จากภาคเรียนที่แล้ว</span>
              </div>
            </div>
          </div>
        </div>

        {/* 4 Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
              <Book className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-slate-500 font-semibold mb-0.5">รวมรายวิชา</span>
              <span className="text-xl font-semibold text-slate-800 leading-none mb-0.5">15</span>
              <span className="text-[9px] text-slate-400">รายวิชา</span>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-emerald-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-slate-500 font-semibold mb-0.5">ผ่านเกณฑ์</span>
              <span className="text-xl font-semibold text-slate-800 leading-none mb-0.5">14</span>
              <span className="text-[9px] text-slate-400">รายวิชา</span>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-red-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-50 text-red-500 flex items-center justify-center shrink-0">
              <XCircle className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-slate-500 font-semibold mb-0.5">ไม่ผ่านเกณฑ์</span>
              <span className="text-xl font-semibold text-slate-800 leading-none mb-0.5">1</span>
              <span className="text-[9px] text-slate-400">รายวิชา</span>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-purple-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-500 flex items-center justify-center shrink-0">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-slate-500 font-semibold mb-0.5">หน่วยกิตรวม</span>
              <span className="text-xl font-semibold text-slate-800 leading-none mb-0.5">30</span>
              <span className="text-[9px] text-slate-400">หน่วยกิต</span>
            </div>
          </div>
        </div>

        {/* Subjects List */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-4 px-1">
            <h3 className="text-sm font-semibold text-slate-900">ผลการเรียนรายวิชา</h3>
            <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
              <button className="p-1.5 bg-white text-slate-800 rounded shadow-sm"><AlignJustify className="w-4 h-4" /></button>
              <button className="p-1.5 text-slate-400 rounded hover:bg-white/50"><Grid className="w-4 h-4" /></button>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100">
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 w-[55%]">รายวิชา</th>
                  <th className="px-2 py-3 text-xs font-semibold text-slate-500 text-center w-[15%]">หน่วยกิต</th>
                  <th className="px-2 py-3 text-xs font-semibold text-slate-500 text-center w-[15%]">เกรด</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 text-right w-[15%]">คะแนน</th>
                </tr>
              </thead>
              <tbody>
                {subjects.map((subj, i) => (
                  <tr key={i} className="border-b border-slate-50 last:border-none">
                    <td className="px-4 py-3.5">
                      <div className="text-xs font-semibold text-slate-800 leading-tight mb-1">{subj.name}</div>
                      <div className="text-xs text-slate-500">{subj.teacher}</div>
                    </td>
                    <td className="px-2 py-3.5 text-center text-xs font-semibold text-slate-600">{subj.credits.toFixed(1)}</td>
                    <td className="px-2 py-3.5 text-center">
                      <span className={`inline-flex items-center justify-center w-6 h-6 rounded text-xs font-semibold border ${getGradeColor(subj.grade)}`}>
                        {subj.grade}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <span className="text-xs font-semibold text-slate-800">{subj.score}</span>
                        <ChevronRight className="w-3 h-3 text-slate-300" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button className="w-full py-4 text-xs font-semibold text-blue-600 hover:bg-slate-50 flex items-center justify-center gap-1 border-t border-slate-50 transition-colors">
              ดูทั้งหมด (15 รายวิชา)
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Development Bottom Card */}
        <div className="mt-4 bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded bg-purple-50 flex items-center justify-center text-purple-600">
                <TrendingUp className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-slate-800">พัฒนาการผลการเรียน</h3>
            </div>
            <button className="text-xs font-semibold text-blue-600 border border-blue-100 rounded-lg px-2.5 py-1.5 hover:bg-blue-50">
              ดูพัฒนาการรายวิชา
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2 divide-x divide-slate-100">
            <div className="flex flex-col items-center text-center">
              <span className="text-xs text-slate-500 font-semibold mb-1">คะแนนเฉลี่ย</span>
              <span className="text-xl font-semibold text-slate-800 mb-1">85.2%</span>
              <div className="flex items-center gap-1 text-[9px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
                เพิ่มขึ้น 3.6%
              </div>
            </div>
            <div className="flex flex-col items-center text-center">
              <span className="text-xs text-slate-500 font-semibold mb-1">เกรดเฉลี่ย</span>
              <span className="text-xl font-semibold text-slate-800 mb-1">3.48</span>
              <div className="flex items-center gap-1 text-[9px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
                เพิ่มขึ้น 0.13
              </div>
            </div>
            <div className="flex flex-col items-center text-center">
              <span className="text-xs text-slate-500 font-semibold mb-1">อันดับในห้อง</span>
              <span className="text-xl font-semibold text-slate-800 mb-1">12 / 28</span>
              <div className="flex items-center gap-1 text-[9px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
                ดีขึ้น 4 อันดับ
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  )
}
