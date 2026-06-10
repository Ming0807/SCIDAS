import * as React from "react"

import { cn } from "@/lib/utils"

export interface PageHeaderProps
  extends Omit<React.ComponentPropsWithoutRef<"header">, "title"> {
  title: React.ReactNode
  description?: React.ReactNode
  breadcrumbs?: React.ReactNode
  metadata?: React.ReactNode
  actions?: React.ReactNode
}

export function PageHeader({
  title,
  description,
  breadcrumbs,
  metadata,
  actions,
  className,
  ...props
}: PageHeaderProps) {
  return (
    <header
      data-slot="page-header"
      className={cn("flex flex-col gap-4 border-b border-border pb-5", className)}
      {...props}
    >
      {breadcrumbs ? (
        <div data-slot="page-header-breadcrumbs" className="min-w-0">
          {breadcrumbs}
        </div>
      ) : null}

      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0 space-y-2">
          {metadata ? (
            <div
              data-slot="page-header-metadata"
              className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground"
            >
              {metadata}
            </div>
          ) : null}
          <h1 className="text-balance text-2xl font-semibold leading-tight text-foreground md:text-3xl">
            {title}
          </h1>
          {description ? (
            <div className="max-w-3xl text-pretty text-sm leading-6 text-muted-foreground md:text-base">
              {description}
            </div>
          ) : null}
        </div>

        {actions ? (
          <div
            data-slot="page-header-actions"
            className="flex shrink-0 flex-wrap items-center gap-2 md:justify-end"
          >
            {actions}
          </div>
        ) : null}
      </div>
    </header>
  )
}
