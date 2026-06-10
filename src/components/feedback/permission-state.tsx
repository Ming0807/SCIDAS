import * as React from "react"
import { ShieldAlert, type LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"

export interface PermissionStateProps
  extends Omit<React.ComponentPropsWithoutRef<"div">, "title"> {
  icon?: LucideIcon
  title?: React.ReactNode
  description?: React.ReactNode
  action?: React.ReactNode
}

export function PermissionState({
  icon: Icon = ShieldAlert,
  title = "Permission required",
  description,
  action,
  className,
  ...props
}: PermissionStateProps) {
  return (
    <div
      data-slot="permission-state"
      className={cn(
        "flex min-h-56 flex-col items-center justify-center gap-4 rounded-xl border border-border bg-card p-6 text-center text-card-foreground",
        className
      )}
      {...props}
    >
      <span className="inline-flex size-10 items-center justify-center rounded-lg bg-amber-50 text-amber-800 ring-1 ring-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:ring-amber-900/60">
        <Icon aria-hidden="true" className="size-5" />
      </span>
      <div className="max-w-md space-y-1">
        <p className="text-sm font-medium text-foreground">{title}</p>
        {description ? (
          <div className="text-sm leading-6 text-muted-foreground">
            {description}
          </div>
        ) : null}
      </div>
      {action ? <div className="flex flex-wrap justify-center gap-2">{action}</div> : null}
    </div>
  )
}
