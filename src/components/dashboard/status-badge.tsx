import * as React from "react"
import {
  AlertTriangle,
  CheckCircle2,
  Circle,
  CircleDot,
  Eye,
  Info,
  ShieldAlert,
  XCircle,
  type LucideIcon,
} from "lucide-react"

import {
  getStatusTone,
  getStatusToneClassNames,
  getStatusToneLabel,
  type StatusTone,
} from "@/lib/design/status"
import { cn } from "@/lib/utils"

export type StatusBadgeSize = "sm" | "default"

export interface StatusBadgeProps
  extends React.ComponentPropsWithoutRef<"span"> {
  status?: StatusTone | string
  label?: React.ReactNode
  showIcon?: boolean
  size?: StatusBadgeSize
}

const statusIcons: Record<StatusTone, LucideIcon> = {
  neutral: Circle,
  primary: CircleDot,
  info: Info,
  success: CheckCircle2,
  normal: CheckCircle2,
  warning: AlertTriangle,
  watch: Eye,
  danger: XCircle,
  "high-risk": ShieldAlert,
}

const sizeClassNames: Record<StatusBadgeSize, string> = {
  sm: "min-h-5 px-1.5 py-0.5 text-xs [&_svg]:size-3",
  default: "min-h-6 px-2 py-0.5 text-xs [&_svg]:size-3.5",
}

export function StatusBadge({
  status = "neutral",
  label,
  showIcon = true,
  size = "default",
  className,
  ...props
}: StatusBadgeProps) {
  const tone = getStatusTone(status)
  const Icon = statusIcons[tone]

  return (
    <span
      data-slot="status-badge"
      data-status={tone}
      className={cn(
        "inline-flex w-fit shrink-0 items-center gap-1 rounded-full border font-medium leading-none whitespace-nowrap",
        sizeClassNames[size],
        getStatusToneClassNames(tone).badge,
        className
      )}
      {...props}
    >
      {showIcon ? <Icon aria-hidden="true" /> : null}
      <span>{label ?? getStatusToneLabel(tone)}</span>
    </span>
  )
}
