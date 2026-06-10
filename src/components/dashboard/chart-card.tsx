import * as React from "react"
import { BarChart3 } from "lucide-react"

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  getStatusToneClassNames,
  type StatusTone,
} from "@/lib/design/status"
import { cn } from "@/lib/utils"

export type ChartCardHeight = "sm" | "md" | "lg"

export type ChartLegendItem = {
  label: React.ReactNode
  value?: React.ReactNode
  tone?: StatusTone | string
  indicatorClassName?: string
}

export interface ChartCardProps
  extends Omit<React.ComponentPropsWithoutRef<typeof Card>, "title"> {
  title: React.ReactNode
  description?: React.ReactNode
  actions?: React.ReactNode
  legend?: ChartLegendItem[]
  height?: ChartCardHeight
  isLoading?: boolean
  isEmpty?: boolean
  emptyTitle?: React.ReactNode
  emptyDescription?: React.ReactNode
  contentClassName?: string
  chartClassName?: string
}

const heightClassNames: Record<ChartCardHeight, string> = {
  sm: "h-56",
  md: "h-64",
  lg: "h-80",
}

export function ChartCard({
  title,
  description,
  actions,
  legend,
  height = "md",
  isLoading,
  isEmpty,
  emptyTitle = "No chart data",
  emptyDescription = "Adjust filters or try again after more records are available.",
  contentClassName,
  chartClassName,
  children,
  className,
  ...props
}: ChartCardProps) {
  return (
    <Card
      data-slot="chart-card"
      className={cn("min-h-0", className)}
      {...props}
    >
      <CardHeader className="gap-1">
        <CardTitle>{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
        {actions ? <CardAction>{actions}</CardAction> : null}
      </CardHeader>

      <CardContent className={cn("flex flex-1 flex-col gap-4", contentClassName)}>
        {legend?.length ? (
          <div
            data-slot="chart-card-legend"
            className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground"
          >
            {legend.map((item, index) => (
              <div
                key={index}
                className="inline-flex min-w-0 items-center gap-2"
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    "size-2 rounded-full",
                    getStatusToneClassNames(item.tone).indicator,
                    item.indicatorClassName
                  )}
                />
                <span className="truncate">{item.label}</span>
                {item.value ? (
                  <span className="font-medium text-foreground">
                    {item.value}
                  </span>
                ) : null}
              </div>
            ))}
          </div>
        ) : null}

        <div
          data-slot="chart-card-body"
          className={cn(
            "min-h-0 w-full overflow-hidden rounded-lg bg-muted/30",
            heightClassNames[height],
            chartClassName
          )}
        >
          {isLoading ? (
            <div className="flex h-full flex-col justify-end gap-2 p-4">
              <Skeleton className="h-8 w-1/3" />
              <Skeleton className="h-24 w-full" />
              <div className="grid grid-cols-4 gap-2">
                <Skeleton className="h-12" />
                <Skeleton className="h-20" />
                <Skeleton className="h-16" />
                <Skeleton className="h-28" />
              </div>
            </div>
          ) : isEmpty ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
              <span className="inline-flex size-10 items-center justify-center rounded-lg bg-background text-muted-foreground ring-1 ring-border">
                <BarChart3 aria-hidden="true" className="size-5" />
              </span>
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">
                  {emptyTitle}
                </p>
                {emptyDescription ? (
                  <p className="max-w-md text-sm leading-6 text-muted-foreground">
                    {emptyDescription}
                  </p>
                ) : null}
              </div>
            </div>
          ) : (
            children
          )}
        </div>
      </CardContent>
    </Card>
  )
}
