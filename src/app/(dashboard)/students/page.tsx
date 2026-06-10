import React from "react"
import { StudentFilters } from "./_components/student-filters"
import { StudentTable } from "./_components/student-table"
import { ClassSummary } from "./_components/class-summary"
import { StudentProfilePanel } from "./_components/student-profile-panel"
import { MobileStudents } from "./_components/mobile-students"

export default function StudentsPage() {
  return (
    <>
      {/* Mobile PWA View */}
      <div className="md:hidden block">
        <MobileStudents />
      </div>

      {/* Desktop Responsive View */}
      <div className="hidden md:flex p-4 sm:p-6 lg:p-8 bg-slate-50 min-h-[calc(100vh-64px)] flex-col">
        
        {/* Page Header (Search & Actions) */}
        <div className="mb-2 shrink-0">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">ข้อมูลนักเรียนและการจัดการ</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">จัดการข้อมูลนักเรียน บันทึก แก้ไข และติดตามข้อมูลรายบุคคล</p>
        </div>

        <div className="mt-4 sm:mt-6 flex-1 flex flex-col min-h-0">
          <div className="shrink-0">
            <StudentFilters />
          </div>

          {/* Master-Detail Layout 
              To handle Desktop Zoom (Ctrl+/Ctrl-) gracefully, 
              we avoid hardcoded fixed heights. Instead, we use flex-1 and min-h-0.
          */}
          <div className="flex flex-col xl:flex-row gap-6 flex-1 min-h-0">
            
            {/* Left Panel: Table & Summary */}
            <div className="xl:flex-[2] flex flex-col min-h-[500px] xl:min-h-0 gap-6 min-w-0">
              <div className="flex-1 min-h-[400px] min-w-0">
                <StudentTable />
              </div>
              <div className="shrink-0 min-w-0">
                <ClassSummary />
              </div>
            </div>

            {/* Right Panel: Profile Detail */}
            <div className="xl:flex-[1] min-h-[600px] xl:min-h-0 min-w-0">
              <StudentProfilePanel />
            </div>

          </div>
        </div>

      </div>
    </>
  )
}
