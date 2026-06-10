import React from "react"
import { MobileAdminHeader } from "./mobile-admin-header"
import { MobileAdminSidebar } from "./mobile-admin-sidebar"
import { MobileAdminBasicSettings } from "./mobile-admin-basic-settings"

export function MobileSettingsProfile() {
  return (
    <div className="bg-slate-50 min-h-screen relative pb-6 flex flex-col">
      <MobileAdminHeader />
      
      <div className="flex flex-col md:flex-row flex-1 w-full max-w-5xl mx-auto md:px-4">
        
        {/* Mobile/Tablet Sidebar */}
        <div className="md:w-[240px] shrink-0 border-b md:border-b-0 md:border-r border-slate-200 bg-white md:bg-transparent">
          <MobileAdminSidebar />
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-x-hidden">
          <MobileAdminBasicSettings />
        </div>

      </div>

    </div>
  )
}
