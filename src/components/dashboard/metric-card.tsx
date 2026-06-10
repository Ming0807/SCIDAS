import * as React from "react"
import {
  Minus,
  TrendingDown,
  TrendingUp,
  type LucideIcon,
} from "lucide-react"

import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  getStatusToneClassNames,
  type StatusTone,
} from "@/lib/design/status"
import { cn } from "@/lib/utils"

import { StatusBadge } from "./status-badge"

export type MetricCardSize = "compact" | "default"
export type MetricTrend = "up" | "down" | "neutral"

export type MetricDelta = {
  value: React.ReactNode
  label?: React.ReactNode
  trend?: MetricTrend
  tone?: StatusTone | string
}

export interface MetricCardProps
  extends Omit<React.ComponentPropsWithoutRef<typeof Card>, "size" | "title"> {
  title: React.ReactNode
  value: React.ReactNode
  description?: React.ReactNode
  delta?: MetricDelta
  icon?: LucideIcon
  status?: StatusTone | string
  statusLabel?: React.ReactNode
  action?: React.ReactNode
  footer?: React.ReactNode
  size?: MetricCardSize
  isLoading?: boolean
}

const valueClassNames: Record<MetricCardSize, string> = {
  compact: "text-xl",
  default: "text-2xl",
}

const iconSizeClassNames: Record<MetricCardSize, string> = {
  compact: "size-8 [&_svg]:size-4",
  default: "size-9 [&_svg]:size-4",
}

const trendIconMap: Record<MetricTrend, LucideIcon> = {
  up: TrendingUp,
  down: TrendingDown,
  neutral: Minus,
}

export function MetricCard({
  title,
  value,
  description,
  delta,
  icon: Icon,
  status,
  statusLabel,
  action,
  footer,
  size = "default",
  isLoading,
  className,
  ...props
}: MetricCardProps) {
  const toneClassNames = getStatusToneClassNames(status ?? "neutral")
  const TrendIcon = trendIconMap[delta?.trend ?? "neutral"]
  const deltaToneClassNames = getStatusToneClassNames(
    delta?.tone ??
      (delta?.trend === "down"
        ? "danger"
        : delta?.trend === "up"
          ? "success"
          : "neutral")
  )

  if (isLoading) {
    return (
      <Card
        data-slot="metric-card"
        size={size === "compact" ? "sm" : "default"}
        className={cn("min-h-32", className)}
        {...props}
      >
        <CardHeader>
          <Skeleton className="h-4 w-28" />
          <CardAction>
            <Skeleton className="size-8" />
          </CardAction>
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-4 w-36" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card
      data-slot="metric-card"
      size={size === "compact" ? "sm" : "default"}
      className={cn("min-h-32", className)}
      {...props}
    >
      <CardHeader className="gap-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {(Icon || action) && (
          <CardAction className="flex items-center gap-2">
            {Icon ? (
              <span
                aria-hidden="true"
                className={cn(
                  "inline-flex shrink-0 items-center justify-center rounded-lg",
                  iconSizeClassNames[size],
                  toneClassNames.icon
                )}
              >
                <Icon />
              </span>
            ) : null}
            {action}
          </CardAction>
        )}
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="flex min-w-0 flex-wrap items-end gap-2">
          <p
            className={cn(
              "break-words font-semibold leading-none text-foreground tabular-nums",
              valueClassNames[size]
            )}
          >
            {value}
          </p>
          {status || statusLabel ? (
            <StatusBadge status={status} label={statusLabel} size="sm" />
          ) : null}
        </div>

        {description ? (
          <div className="text-sm leading-6 text-muted-foreground">
            {description}
          </div>
        ) : null}

        {delta ? (
          <div
            className={cn(
              "inline-flex w-fit items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium",
              deltaToneClassNames.badge
            )}
          >
            <TrendIcon aria-hidden="true" className="size-3" />
            <span>{delta.value}</span>
            {delta.label ? <span>{delta.label}</span> : null}
          </div>
        ) : null}

        {footer ? (
          <div className="border-t border-border pt-3 text-sm text-muted-foreground">
            {footer}
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
