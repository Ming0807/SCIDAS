"use client"

import * as React from "react"
import { LoaderCircle } from "lucide-react"
import { useFormStatus } from "react-dom"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export type SubmitBarAlign = "start" | "end" | "between"

export interface SubmitBarProps
  extends React.ComponentPropsWithoutRef<"div"> {
  submitLabel?: string
  submittingLabel?: string
  secondaryActions?: React.ReactNode
  status?: React.ReactNode
  align?: SubmitBarAlign
  sticky?: boolean
  disabled?: boolean
  pending?: boolean
  form?: string
  submitClassName?: string
}

const alignClassNames: Record<SubmitBarAlign, string> = {
  start: "sm:justify-start",
  end: "sm:justify-end",
  between: "sm:justify-between",
}

export function SubmitBar({
  submitLabel = "Save changes",
  submittingLabel = "Saving",
  secondaryActions,
  status,
  align = "between",
  sticky,
  disabled,
  pending,
  form,
  submitClassName,
  className,
  ...props
}: SubmitBarProps) {
  const formStatus = useFormStatus()
  const isPending = pending ?? formStatus.pending

  return (
    <div
      data-slot="submit-bar"
      className={cn(
        "flex flex-col-reverse gap-3 border-t border-border bg-background py-3 sm:flex-row sm:items-center",
        alignClassNames[align],
        sticky && "sticky bottom-0 z-20",
        className
      )}
      {...props}
    >
      {status ? (
        <div className="flex min-w-0 flex-1 items-center gap-2 text-sm text-muted-foreground">
          {status}
        </div>
      ) : null}

      <div
        className={cn(
          "flex shrink-0 flex-col-reverse gap-2 sm:flex-row sm:items-center",
          !status && align === "between" && "sm:ml-auto"
        )}
      >
        {secondaryActions}
        <Button
          type="submit"
          form={form}
          disabled={disabled || isPending}
          className={submitClassName}
        >
          {isPending ? (
            <LoaderCircle
              aria-hidden="true"
              className="size-4 animate-spin motion-reduce:animate-none"
            />
          ) : null}
          {isPending ? submittingLabel : submitLabel}
        </Button>
      </div>
    </div>
  )
}
