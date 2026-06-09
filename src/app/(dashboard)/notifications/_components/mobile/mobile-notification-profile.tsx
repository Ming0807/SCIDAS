import React from "react"
import { MobileNotificationHeader } from "./mobile-notification-header"
import { MobileNotificationList } from "./mobile-notification-list"

export function MobileNotificationProfile() {
  return (
    <div className="bg-[#f8fafc] min-h-screen relative">
      <MobileNotificationHeader />
      
      <div className="max-w-md mx-auto pt-2">
        <MobileNotificationList />
      </div>

    </div>
  )
}
