import * as React from "react"

import { cn } from "@/lib/utils"

export type PageShellSize = "default" | "wide" | "full"
export type PageShellSpacing = "compact" | "default" | "loose"

export interface PageShellProps
  extends React.ComponentPropsWithoutRef<"main"> {
  size?: PageShellSize
  spacing?: PageShellSpacing
}

const sizeClassNames: Record<PageShellSize, string> = {
  default: "max-w-7xl",
  wide: "max-w-screen-2xl",
  full: "max-w-none",
}

const spacingClassNames: Record<PageShellSpacing, string> = {
  compact: "gap-4 pt-4",
  default: "gap-6 pt-5 md:pt-6",
  loose: "gap-8 pt-6 md:pt-8",
}

export function PageShell({
  className,
  size = "default",
  spacing = "default",
  ...props
}: PageShellProps) {
  return (
    <main
      data-slot="page-shell"
      className={cn(
        "mx-auto flex min-h-dvh w-full flex-col bg-background px-4 pb-24 sm:px-6 lg:px-8 lg:pb-8",
        sizeClassNames[size],
        spacingClassNames[spacing],
        className
      )}
      {...props}
    />
  )
}
