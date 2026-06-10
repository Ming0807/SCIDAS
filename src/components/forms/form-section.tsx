import * as React from "react"

import { cn } from "@/lib/utils"

export interface FormSectionProps
  extends Omit<React.ComponentPropsWithoutRef<"section">, "title"> {
  title: React.ReactNode
  description?: React.ReactNode
  actions?: React.ReactNode
  footer?: React.ReactNode
  contentClassName?: string
}

export function FormSection({
  title,
  description,
  actions,
  footer,
  contentClassName,
  className,
  children,
  ...props
}: FormSectionProps) {
  return (
    <section
      data-slot="form-section"
      className={cn(
        "flex flex-col gap-4 rounded-xl border border-border bg-card p-4 text-card-foreground md:p-5",
        className
      )}
      {...props}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-1">
          <h2 className="text-base font-semibold leading-snug text-foreground">
            {title}
          </h2>
          {description ? (
            <div className="max-w-3xl text-sm leading-6 text-muted-foreground">
              {description}
            </div>
          ) : null}
        </div>
        {actions ? (
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            {actions}
          </div>
        ) : null}
      </div>

      <div
        data-slot="form-section-content"
        className={cn("grid gap-4", contentClassName)}
      >
        {children}
      </div>

      {footer ? (
        <div className="border-t border-border pt-4 text-sm leading-6 text-muted-foreground">
          {footer}
        </div>
      ) : null}
    </section>
  )
}
