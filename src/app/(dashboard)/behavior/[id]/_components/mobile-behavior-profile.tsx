import React from "react"
import { MobileBehaviorHeader } from "./mobile/mobile-behavior-header"
import { MobileBehaviorOverview } from "./mobile/mobile-behavior-overview"
import { MobileBehaviorTrend } from "./mobile/mobile-behavior-trend"
import { MobileBehaviorStats } from "./mobile/mobile-behavior-stats"
import { MobileBehaviorRecent } from "./mobile/mobile-behavior-recent"

export function MobileBehaviorProfile() {
  return (
    <div className="flex flex-col bg-slate-50 min-h-[calc(100vh-64px)] font-sans pb-20 max-w-md mx-auto">
      <MobileBehaviorHeader />
      <MobileBehaviorOverview />
      <MobileBehaviorTrend />
      <MobileBehaviorStats />
      <MobileBehaviorRecent />
    </div>
  )
}
