import * as React from "react"
import { AlertCircle, type LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"

export interface ErrorStateProps
  extends Omit<React.ComponentPropsWithoutRef<"div">, "title"> {
  icon?: LucideIcon
  title?: React.ReactNode
  description?: React.ReactNode
  details?: React.ReactNode
  action?: React.ReactNode
}

export function ErrorState({
  icon: Icon = AlertCircle,
  title = "Something went wrong",
  description,
  details,
  action,
  className,
  ...props
}: ErrorStateProps) {
  return (
    <div
      data-slot="error-state"
      role="alert"
      className={cn(
        "flex flex-col gap-4 rounded-xl border border-red-200 bg-red-50 p-4 text-red-900 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-100",
        className
      )}
      {...props}
    >
      <div className="flex gap-3">
        <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg bg-background text-red-700 ring-1 ring-red-200 dark:text-red-300 dark:ring-red-900/60">
          <Icon aria-hidden="true" className="size-5" />
        </span>
        <div className="min-w-0 space-y-1">
          <p className="text-sm font-medium">{title}</p>
          {description ? (
            <div className="text-sm leading-6 text-red-800 dark:text-red-200">
              {description}
            </div>
          ) : null}
          {details ? (
            <div className="pt-1 text-sm leading-6 text-red-800 dark:text-red-200">
              {details}
            </div>
          ) : null}
        </div>
      </div>
      {action ? <div className="flex flex-wrap gap-2 pl-12">{action}</div> : null}
    </div>
  )
}
