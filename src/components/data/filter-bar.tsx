import * as React from "react"

import { cn } from "@/lib/utils"

export interface FilterBarProps
  extends Omit<React.ComponentPropsWithoutRef<"div">, "title"> {
  title?: React.ReactNode
  summary?: React.ReactNode
  search?: React.ReactNode
  filters?: React.ReactNode
  activeFilters?: React.ReactNode
  clearAction?: React.ReactNode
  actions?: React.ReactNode
}

export function FilterBar({
  title,
  summary,
  search,
  filters,
  activeFilters,
  clearAction,
  actions,
  children,
  className,
  ...props
}: FilterBarProps) {
  return (
    <div
      data-slot="filter-bar"
      className={cn(
        "flex flex-col gap-3 rounded-xl border border-border bg-card p-3 text-card-foreground",
        className
      )}
      {...props}
    >
      {(title || summary || actions) && (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 space-y-1">
            {title ? (
              <h2 className="text-sm font-medium text-foreground">{title}</h2>
            ) : null}
            {summary ? (
              <div className="text-sm text-muted-foreground">{summary}</div>
            ) : null}
          </div>
          {actions ? (
            <div className="flex shrink-0 flex-wrap items-center gap-2">
              {actions}
            </div>
          ) : null}
        </div>
      )}

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        {search ? <div className="min-w-56 flex-1">{search}</div> : null}
        {filters ? (
          <div className="flex flex-wrap items-center gap-2">{filters}</div>
        ) : null}
        {children}
      </div>

      {(activeFilters || clearAction) && (
        <div className="flex flex-col gap-2 border-t border-border pt-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">{activeFilters}</div>
          {clearAction ? (
            <div className="flex shrink-0 items-center">{clearAction}</div>
          ) : null}
        </div>
      )}
    </div>
  )
}
