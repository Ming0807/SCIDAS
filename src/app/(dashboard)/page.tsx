import React from "react"
import { Users, ClipboardCheck, AlertTriangle, HandHeart } from "lucide-react"

export default function DashboardPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">แดชบอร์ดภาพรวม</h1>
        <p className="text-muted-foreground">ระบบสารสนเทศเพื่อวิเคราะห์และดูแลช่วยเหลือนักเรียน</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border bg-card text-card-foreground shadow">
          <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">นักเรียนทั้งหมด</h3>
            <Users className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="p-6 pt-0">
            <div className="text-2xl font-bold">245</div>
            <p className="text-xs text-muted-foreground">+4 คนจากเทอมที่แล้ว</p>
          </div>
        </div>
        
        <div className="rounded-xl border bg-card text-card-foreground shadow">
          <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">เข้าเรียนวันนี้</h3>
            <ClipboardCheck className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="p-6 pt-0">
            <div className="text-2xl font-bold">96.3%</div>
            <p className="text-xs text-muted-foreground">สูงกว่าค่าเฉลี่ยสัปดาห์นี้</p>
          </div>
        </div>

        <div className="rounded-xl border bg-card text-card-foreground shadow">
          <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">กลุ่มเสี่ยง</h3>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </div>
          <div className="p-6 pt-0">
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">รอการประเมินซ้ำ 3 คน</p>
          </div>
        </div>

        <div className="rounded-xl border bg-card text-card-foreground shadow">
          <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Case ช่วยเหลือ</h3>
            <HandHeart className="h-4 w-4 text-amber-500" />
          </div>
          <div className="p-6 pt-0">
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">รอดำเนินการ 2 เคส</p>
          </div>
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="rounded-xl border bg-card text-card-foreground shadow col-span-4">
          <div className="flex flex-col space-y-1.5 p-6">
            <h3 className="font-semibold leading-none tracking-tight">แนวโน้มการเข้าเรียน</h3>
            <p className="text-sm text-muted-foreground">สถิติ 30 วันย้อนหลัง</p>
          </div>
          <div className="p-6 pt-0 h-[300px] flex items-center justify-center border-t border-dashed m-6">
            <span className="text-muted-foreground">ส่วนของกราฟการเข้าเรียน (Recharts) จะถูกเพิ่มในเฟส 6</span>
          </div>
        </div>
        
        <div className="rounded-xl border bg-card text-card-foreground shadow col-span-3">
          <div className="flex flex-col space-y-1.5 p-6">
            <h3 className="font-semibold leading-none tracking-tight">งานที่ต้องติดตามล่าสุด</h3>
            <p className="text-sm text-muted-foreground">อัปเดตวันนี้</p>
          </div>
          <div className="p-6 pt-0 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center">
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">ด.ช. สมชาย รักเรียน</p>
                  <p className="text-sm text-muted-foreground">ขาดเรียนติดต่อกัน 3 วัน</p>
                </div>
                <div className="ml-auto font-medium text-sm text-amber-500">เยี่ยมบ้านด่วน</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
