"use client"

import { useState, useTransition } from "react"
import { Loader2, Save, Settings2 } from "lucide-react"

import {
  updateRiskWeightsAction,
  type RiskWeightItem,
} from "@/app/actions/risk.actions"
import {
  RISK_WEIGHT_FACTOR_KEYS,
  RISK_WEIGHT_LABELS,
} from "@/lib/risk-weight-constants"
import { ActionFeedback } from "@/components/forms"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { ActionResult } from "@/lib/server/action-result"

export function RiskWeightsForm({ initialWeights }: { initialWeights: RiskWeightItem[] }) {
  const [values, setValues] = useState<Record<string, string>>(() => {
    const map: Record<string, string> = {}
    for (const item of initialWeights) {
      map[item.factorKey] = String(item.weight)
    }
    return map
  })
  const [pending, startTransition] = useTransition()
  const [result, setResult] = useState<ActionResult<{ count: number }> | null>(null)

  function handleSave() {
    const weights = RISK_WEIGHT_FACTOR_KEYS.map((key) => ({
      factor_key: key,
      weight: Number(values[key] ?? "0"),
    }))

    const invalid = weights.some(
      (item) => !Number.isInteger(item.weight) || item.weight < 0 || item.weight > 100,
    )
    if (invalid) {
      setResult({
        ok: false,
        code: "VALIDATION_ERROR",
        message: "น้ำหนักต้องเป็นจำนวนเต็มตั้งแต่ 0 ถึง 100",
      })
      return
    }

    startTransition(async () => {
      const res = await updateRiskWeightsAction(weights)
      setResult(res)
    })
  }

  return (
    <section aria-label="น้ำหนักปัจจัยเสี่ยง" className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="mb-1 flex items-center gap-2">
        <span className="inline-flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Settings2 className="size-4.5" aria-hidden="true" />
        </span>
        <div>
          <h2 className="text-base font-semibold text-foreground">น้ำหนักปัจจัยเสี่ยง</h2>
          <p className="text-xs text-muted-foreground">
            เฉพาะผู้บริหาร — คะแนนรวมสูงสุด 100 ระดับเฝ้าระวังเริ่ม 31 เสี่ยงสูงเริ่ม 61
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {RISK_WEIGHT_FACTOR_KEYS.map((key) => (
          <label key={key} className="block space-y-1.5">
            <span className="text-xs font-medium text-foreground">{RISK_WEIGHT_LABELS[key]}</span>
            <Input
              type="number"
              min={0}
              max={100}
              step={1}
              value={values[key] ?? ""}
              onChange={(e) => setValues((prev) => ({ ...prev, [key]: e.target.value }))}
              aria-label={`น้ำหนัก${RISK_WEIGHT_LABELS[key]}`}
              className="h-9 text-sm"
            />
          </label>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Button onClick={handleSave} disabled={pending} size="sm" className="gap-1.5">
          {pending ? <Loader2 className="size-3.5 animate-spin" /> : <Save className="size-3.5" />}
          {pending ? "กำลังบันทึก..." : "บันทึกน้ำหนัก"}
        </Button>
        <ActionFeedback result={result} />
      </div>
    </section>
  )
}
