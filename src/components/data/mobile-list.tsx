import * as React from "react"

import { cn } from "@/lib/utils"

export interface MobileListProps<TData>
  extends Omit<React.ComponentPropsWithoutRef<"section">, "children" | "title"> {
  items: TData[]
  getItemKey: (item: TData, index: number) => React.Key
  renderItem: (item: TData, index: number) => React.ReactNode
  title?: React.ReactNode
  summary?: React.ReactNode
  toolbar?: React.ReactNode
  footer?: React.ReactNode
  emptyState?: React.ReactNode
}

export function MobileList<TData>({
  items,
  getItemKey,
  renderItem,
  title,
  summary,
  toolbar,
  footer,
  emptyState,
  className,
  ...props
}: MobileListProps<TData>) {
  return (
    <section
      data-slot="mobile-list"
      className={cn("flex flex-col gap-3", className)}
      {...props}
    >
      {(title || summary || toolbar) && (
        <div className="flex flex-col gap-3">
          {(title || summary) && (
            <div className="flex min-w-0 items-end justify-between gap-3">
              <div className="min-w-0 space-y-1">
                {title ? (
                  <h2 className="text-base font-semibold text-foreground">
                    {title}
                  </h2>
                ) : null}
                {summary ? (
                  <div className="text-sm text-muted-foreground">{summary}</div>
                ) : null}
              </div>
            </div>
          )}
          {toolbar}
        </div>
      )}

      {items.length > 0 ? (
        <div className="space-y-3">
          {items.map((item, index) => (
            <React.Fragment key={getItemKey(item, index)}>
              {renderItem(item, index)}
            </React.Fragment>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card p-6">
          {emptyState}
        </div>
      )}

      {footer}
    </section>
  )
}
