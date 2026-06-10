import * as React from "react"

import { cn } from "@/lib/utils"

export interface PageToolbarProps
  extends React.ComponentPropsWithoutRef<"div"> {
  label?: string
  search?: React.ReactNode
  filters?: React.ReactNode
  actions?: React.ReactNode
  summary?: React.ReactNode
}

export function PageToolbar({
  label = "Page controls",
  search,
  filters,
  actions,
  summary,
  children,
  className,
  ...props
}: PageToolbarProps) {
  return (
    <div
      data-slot="page-toolbar"
      role="toolbar"
      aria-label={label}
      className={cn(
        "flex flex-col gap-3 rounded-xl border border-border bg-card p-3 text-card-foreground",
        className
      )}
      {...props}
    >
      {summary ? (
        <div className="text-sm text-muted-foreground">{summary}</div>
      ) : null}

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          {search ? <div className="min-w-56 flex-1">{search}</div> : null}
          {filters ? (
            <div className="flex flex-wrap items-center gap-2">{filters}</div>
          ) : null}
          {children}
        </div>

        {actions ? (
          <div className="flex shrink-0 flex-wrap items-center gap-2 lg:justify-end">
            {actions}
          </div>
        ) : null}
      </div>
    </div>
  )
}
