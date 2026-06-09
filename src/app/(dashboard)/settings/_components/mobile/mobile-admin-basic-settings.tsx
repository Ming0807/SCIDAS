import React from "react"
import { Settings, Shield, Clock, HardDrive, PhoneCall, Check, Upload } from "lucide-react"

export function MobileAdminBasicSettings() {
  return (
    <div className="px-4 py-4 w-full max-w-2xl mx-auto flex flex-col gap-6">
      
      {/* Title */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <h2 className="text-[18px] font-bold text-slate-800">การตั้งค่าพื้นฐาน</h2>
          <span className="text-[12px] text-slate-500">จัดการการตั้งค่าทั่วไปของระบบ</span>
        </div>
        <button className="hidden md:flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-[12px] font-bold hover:bg-indigo-700 shadow-sm">
          <Settings className="w-3.5 h-3.5" />
          บันทึกการตั้งค่า
        </button>
      </div>

      {/* 1. System Info */}
      <div className="bg-white rounded-2xl p-5 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center shrink-0">
            <Settings className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="flex flex-col">
            <h3 className="text-[13px] font-bold text-slate-800">ข้อมูลระบบ</h3>
            <span className="text-[10px] text-slate-500">จัดการข้อมูลพื้นฐานของระบบ</span>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
            <label className="text-[12px] font-medium text-slate-700 md:w-1/3 shrink-0">ชื่อระบบ</label>
            <input type="text" defaultValue="ระบบดูแลช่วยเหลือนักเรียน" className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-[13px] text-slate-800 focus:outline-none focus:border-indigo-500" />
          </div>
          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
            <label className="text-[12px] font-medium text-slate-700 md:w-1/3 shrink-0">ชื่อย่อระบบ</label>
            <input type="text" defaultValue="SLS" className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-[13px] text-slate-800 focus:outline-none focus:border-indigo-500" />
          </div>
          <div className="flex flex-col md:flex-row md:items-start gap-2 md:gap-4 mt-2">
            <label className="text-[12px] font-medium text-slate-700 md:w-1/3 shrink-0 mt-2">โลโก้ระบบ</label>
            <div className="flex items-center gap-4 w-full">
              <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center shrink-0 shadow-inner">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div className="flex flex-col gap-1">
                <button className="w-max flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-600 text-[11px] font-bold rounded-lg border border-indigo-100 hover:bg-indigo-100">
                  <Upload className="w-3 h-3" /> เปลี่ยนโลโก้
                </button>
                <span className="text-[10px] text-slate-400">ขนาดแนะนำ 512x512 px (PNG)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. General Settings */}
      <div className="bg-white rounded-2xl p-5 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center shrink-0">
            <Settings className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="flex flex-col">
            <h3 className="text-[13px] font-bold text-slate-800">การตั้งค่าทั่วไป</h3>
            <span className="text-[10px] text-slate-500">ตั้งค่าพฤติกรรมการทำงานของระบบ</span>
          </div>
        </div>

        <div className="flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[13px] font-medium text-slate-800">เปิดใช้งานระบบ</span>
              <span className="text-[11px] text-slate-500">เปิดใช้งานระบบสำหรับทุกโรงเรียน</span>
            </div>
            <div className="w-10 h-6 bg-indigo-600 rounded-full relative cursor-pointer shadow-inner shrink-0">
              <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[13px] font-medium text-slate-800">อนุญาตการสมัครสมาชิกจากโรงเรียน</span>
              <span className="text-[11px] text-slate-500">ให้โรงเรียนสามารถสมัครใช้งานระบบได้</span>
            </div>
            <div className="w-10 h-6 bg-indigo-600 rounded-full relative cursor-pointer shadow-inner shrink-0">
              <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[13px] font-medium text-slate-800">เปิดใช้งานโหมดบำรุงรักษา</span>
              <span className="text-[11px] text-slate-500">ปิดระบบชั่วคราวเพื่อปรับปรุงและบำรุงรักษา</span>
            </div>
            <div className="w-10 h-6 bg-slate-200 rounded-full relative cursor-pointer shadow-inner shrink-0">
              <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Date & Time Settings */}
      <div className="bg-white rounded-2xl p-5 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center shrink-0">
            <Clock className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="flex flex-col">
            <h3 className="text-[13px] font-bold text-slate-800">การตั้งค่าวันเวลา</h3>
            <span className="text-[10px] text-slate-500">ตั้งค่าวันเวลาและรูปแบบการแสดงผล</span>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
            <label className="text-[12px] font-medium text-slate-700 md:w-1/3 shrink-0">เขตเวลา</label>
            <select className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-[13px] text-slate-800 focus:outline-none focus:border-indigo-500 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2394a3b8%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[position:right_8px_center] bg-[length:16px]">
              <option>(GMT+07:00) กรุงเทพมหานคร</option>
            </select>
          </div>
          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
            <label className="text-[12px] font-medium text-slate-700 md:w-1/3 shrink-0">รูปแบบวันที่</label>
            <select className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-[13px] text-slate-800 focus:outline-none focus:border-indigo-500 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2394a3b8%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[position:right_8px_center] bg-[length:16px]">
              <option>31/12/2567 (ว/ด/ป)</option>
            </select>
          </div>
          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
            <label className="text-[12px] font-medium text-slate-700 md:w-1/3 shrink-0">รูปแบบเวลา</label>
            <select className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-[13px] text-slate-800 focus:outline-none focus:border-indigo-500 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2394a3b8%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[position:right_8px_center] bg-[length:16px]">
              <option>24 ชั่วโมง (14:30)</option>
            </select>
          </div>
        </div>
      </div>

      {/* 4. Upload Settings */}
      <div className="bg-white rounded-2xl p-5 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center shrink-0">
            <HardDrive className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="flex flex-col">
            <h3 className="text-[13px] font-bold text-slate-800">การตั้งค่าอัปโหลดไฟล์</h3>
            <span className="text-[10px] text-slate-500">กำหนดขนาดและประเภทไฟล์ที่อนุญาต</span>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
            <label className="text-[12px] font-medium text-slate-700 md:w-1/3 shrink-0">ขนาดไฟล์สูงสุด</label>
            <select className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-[13px] text-slate-800 focus:outline-none focus:border-indigo-500 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2394a3b8%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[position:right_8px_center] bg-[length:16px]">
              <option>10 MB</option>
            </select>
          </div>
          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
            <label className="text-[12px] font-medium text-slate-700 md:w-1/3 shrink-0">ประเภทไฟล์ที่อนุญาต</label>
            <select className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-[13px] text-slate-800 focus:outline-none focus:border-indigo-500 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2394a3b8%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[position:right_8px_center] bg-[length:16px]">
              <option>jpg, jpeg, png, pdf, doc, docx, xls, xlsx</option>
            </select>
          </div>
          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mt-2">
            <label className="text-[12px] font-medium text-slate-700 md:w-1/3 shrink-0">พื้นที่เก็บข้อมูลทั้งหมด</label>
            <div className="flex flex-col w-full gap-1.5 pt-1">
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-600 rounded-full" style={{ width: '45.2%' }}></div>
              </div>
              <div className="text-right text-[10px] text-slate-500">45.2 GB จาก 100 GB (45%)</div>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Contact Info */}
      <div className="bg-white rounded-2xl p-5 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100 mb-4">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center shrink-0">
            <PhoneCall className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="flex flex-col">
            <h3 className="text-[13px] font-bold text-slate-800">ข้อมูลติดต่อระบบ</h3>
            <span className="text-[10px] text-slate-500">ข้อมูลสำหรับการติดต่อและการแจ้งเตือน</span>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
            <label className="text-[12px] font-medium text-slate-700 md:w-1/3 shrink-0">อีเมลสำหรับติดต่อ</label>
            <input type="email" defaultValue="admin@sls-system.or.th" className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-[13px] text-slate-800 focus:outline-none focus:border-indigo-500" />
          </div>
          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
            <label className="text-[12px] font-medium text-slate-700 md:w-1/3 shrink-0">เบอร์โทรศัพท์</label>
            <input type="tel" defaultValue="02-123-4567" className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-[13px] text-slate-800 focus:outline-none focus:border-indigo-500" />
          </div>
          <div className="flex flex-col md:flex-row md:items-start gap-2 md:gap-4">
            <label className="text-[12px] font-medium text-slate-700 md:w-1/3 shrink-0 pt-2">ที่อยู่</label>
            <textarea className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-[13px] text-slate-800 focus:outline-none focus:border-indigo-500 resize-none h-16" defaultValue="สำนักงานเขตพื้นที่การศึกษา กรุงเทพมหานคร 10300" />
          </div>
        </div>
      </div>

      {/* Bottom Action Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-2">
        <span className="text-[11px] text-slate-500 text-center md:text-left">อัปเดตล่าสุด: 1 พ.ค. 2567 14:30 น. โดย แอดมิน</span>
        <button className="w-full md:w-auto px-6 py-3 bg-indigo-600 text-white text-[13px] font-bold rounded-xl hover:bg-indigo-700 shadow-sm flex items-center justify-center gap-2">
          <Check className="w-4 h-4" />
          บันทึกการเปลี่ยนแปลง
        </button>
      </div>

    </div>
  )
}
