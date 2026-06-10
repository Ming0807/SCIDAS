import * as React from "react"

import { cn } from "@/lib/utils"

export type SectionVariant = "plain" | "surface"
export type SectionTitleElement = "h2" | "h3"

export interface SectionProps
  extends Omit<React.ComponentPropsWithoutRef<"section">, "title"> {
  title?: React.ReactNode
  description?: React.ReactNode
  actions?: React.ReactNode
  variant?: SectionVariant
  titleAs?: SectionTitleElement
  headerClassName?: string
  contentClassName?: string
}

const variantClassNames: Record<SectionVariant, string> = {
  plain: "gap-4",
  surface: "gap-4 rounded-xl border border-border bg-card p-4 text-card-foreground md:p-5",
}

export function Section({
  title,
  description,
  actions,
  variant = "plain",
  titleAs = "h2",
  headerClassName,
  contentClassName,
  className,
  children,
  ...props
}: SectionProps) {
  const TitleTag = titleAs

  return (
    <section
      data-slot="section"
      data-variant={variant}
      className={cn("flex flex-col", variantClassNames[variant], className)}
      {...props}
    >
      {title || description || actions ? (
        <div
          data-slot="section-header"
          className={cn(
            "flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between",
            headerClassName
          )}
        >
          <div className="min-w-0 space-y-1">
            {title ? (
              <TitleTag className="text-balance text-lg font-semibold leading-snug text-foreground">
                {title}
              </TitleTag>
            ) : null}
            {description ? (
              <div className="max-w-3xl text-pretty text-sm leading-6 text-muted-foreground">
                {description}
              </div>
            ) : null}
          </div>

          {actions ? (
            <div className="flex shrink-0 flex-wrap items-center gap-2 sm:justify-end">
              {actions}
            </div>
          ) : null}
        </div>
      ) : null}

      <div data-slot="section-content" className={cn("min-w-0", contentClassName)}>
        {children}
      </div>
    </section>
  )
}
