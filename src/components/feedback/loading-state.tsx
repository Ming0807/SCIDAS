import * as React from "react"

import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

export type LoadingStateVariant = "inline" | "surface"

export interface LoadingStateProps
  extends React.ComponentPropsWithoutRef<"div"> {
  label?: string
  description?: React.ReactNode
  rows?: number
  variant?: LoadingStateVariant
}

export function LoadingState({
  label = "Loading",
  description,
  rows = 3,
  variant = "surface",
  className,
  ...props
}: LoadingStateProps) {
  return (
    <div
      data-slot="loading-state"
      role="status"
      aria-label={label}
      className={cn(
        "space-y-4",
        variant === "surface" &&
          "rounded-xl border border-border bg-card p-4 text-card-foreground",
        className
      )}
      {...props}
    >
      <div className="space-y-2">
        <Skeleton className="h-4 w-32" />
        {description ? (
          <div className="text-sm leading-6 text-muted-foreground">
            {description}
          </div>
        ) : (
          <Skeleton className="h-4 w-48" />
        )}
      </div>

      <div className="space-y-2">
        {Array.from({ length: rows }).map((_, index) => (
          <Skeleton
            key={index}
            className={cn("h-10 w-full", index === rows - 1 && "w-2/3")}
          />
        ))}
      </div>
    </div>
  )
}
