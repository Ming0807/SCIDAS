import React from "react"
import { MobileRiskHeader } from "./mobile-risk-header"
import { MobileOverallRisk } from "./mobile-overall-risk"
import { MobileRiskBenchmark } from "./mobile-risk-benchmark"
import { MobileRiskSpiderChart } from "./mobile-risk-spider-chart"
import { MobileRiskFactors } from "./mobile-risk-factors"
import { MobileRiskGuidelines } from "./mobile-risk-guidelines"
import { MobileSupportHistory } from "./mobile-support-history"

export function MobileRiskProfile({
  riskScore,
  riskLevel,
}: {
  riskScore?: number | null
  riskLevel?: string | null
}) {
  return (
    <div className="bg-slate-50 min-h-screen relative pb-10">
      <MobileRiskHeader />
      
      <div className="max-w-md mx-auto">
        <div className="px-4 py-5">
          <MobileOverallRisk riskScore={riskScore} riskLevel={riskLevel} />
        </div>
        
        <div className="px-4 mb-6">
          <MobileRiskBenchmark />
        </div>

        <div className="px-4 mb-6">
          <MobileRiskSpiderChart />
        </div>

        <div className="px-4 mb-6">
          <MobileRiskFactors />
        </div>

        <MobileRiskGuidelines />
        
        <MobileSupportHistory />
      </div>

    </div>
  )
}
