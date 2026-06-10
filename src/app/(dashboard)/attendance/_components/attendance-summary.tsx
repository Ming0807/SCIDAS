import { ClipboardList, Clock, UserCheck, XCircle } from "lucide-react"

import { MetricCard } from "@/components/dashboard"

import { attendanceSummary } from "./attendance-data"

export function AttendanceSummary() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <MetricCard
        title="มาเรียน"
        value={attendanceSummary.present}
        description={`${attendanceSummary.presentRate}% ของนักเรียนทั้งหมด`}
        icon={UserCheck}
        status="success"
        size="compact"
      />
      <MetricCard
        title="ขาดเรียน"
        value={attendanceSummary.absent}
        description="ต้องติดตามสาเหตุและผู้รับผิดชอบ"
        icon={XCircle}
        status="danger"
        size="compact"
      />
      <MetricCard
        title="ลา"
        value={attendanceSummary.leave}
        description="บันทึกพร้อมเหตุผลครบถ้วน"
        icon={ClipboardList}
        status="warning"
        size="compact"
      />
      <MetricCard
        title="มาสาย"
        value={attendanceSummary.late}
        description="ตรวจแนวโน้มรายบุคคล"
        icon={Clock}
        status="info"
        size="compact"
      />
    </div>
  )
}
