import * as React from "react"
import Link from "next/link"
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react"

import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface PaginationProps
  extends React.ComponentPropsWithoutRef<"nav"> {
  page: number
  totalPages: number
  totalItems?: number
  pageSize?: number
  pageSizeLabel?: React.ReactNode
  getPageHref?: (page: number) => string
}

function getVisiblePages(page: number, totalPages: number) {
  const pages = new Set([1, totalPages, page - 1, page, page + 1])
  return Array.from(pages)
    .filter((item) => item >= 1 && item <= totalPages)
    .sort((a, b) => a - b)
}

function PaginationControl({
  page,
  currentPage,
  disabled,
  label,
  getPageHref,
  children,
}: {
  page: number
  currentPage: number
  disabled?: boolean
  label: string
  getPageHref?: (page: number) => string
  children: React.ReactNode
}) {
  const isCurrent = page === currentPage
  const href = !disabled && !isCurrent ? getPageHref?.(page) : undefined
  const className = cn(
    buttonVariants({
      variant: isCurrent ? "default" : "outline",
      size: "icon-sm",
    }),
    "size-8"
  )

  if (href) {
    return (
      <Link aria-label={label} className={className} href={href}>
        {children}
      </Link>
    )
  }

  return (
    <Button
      aria-current={isCurrent ? "page" : undefined}
      aria-label={label}
      disabled={disabled || isCurrent}
      size="icon-sm"
      variant={isCurrent ? "default" : "outline"}
      className="size-8"
    >
      {children}
    </Button>
  )
}

export function Pagination({
  page,
  totalPages,
  totalItems,
  pageSize,
  pageSizeLabel,
  getPageHref,
  className,
  ...props
}: PaginationProps) {
  const safeTotalPages = Math.max(totalPages, 1)
  const safePage = Math.min(Math.max(page, 1), safeTotalPages)
  const firstItem =
    totalItems && pageSize ? (safePage - 1) * pageSize + 1 : undefined
  const lastItem =
    totalItems && pageSize
      ? Math.min(safePage * pageSize, totalItems)
      : undefined
  const visiblePages = getVisiblePages(safePage, safeTotalPages)

  return (
    <nav
      aria-label="Pagination"
      data-slot="pagination"
      className={cn(
        "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between",
        className
      )}
      {...props}
    >
      <div className="text-sm text-muted-foreground">
        {firstItem && lastItem && totalItems ? (
          <span>
            แสดง {firstItem}-{lastItem} จาก {totalItems}
          </span>
        ) : (
          <span>
            หน้า {safePage} จาก {safeTotalPages}
          </span>
        )}
        {pageSizeLabel ? <span> · {pageSizeLabel}</span> : null}
      </div>

      <div className="flex items-center gap-1">
        <PaginationControl
          disabled={safePage <= 1}
          getPageHref={getPageHref}
          label="ไปหน้าแรก"
          page={1}
          currentPage={safePage}
        >
          <ChevronsLeft />
        </PaginationControl>
        <PaginationControl
          disabled={safePage <= 1}
          getPageHref={getPageHref}
          label="ไปหน้าก่อนหน้า"
          page={safePage - 1}
          currentPage={safePage}
        >
          <ChevronLeft />
        </PaginationControl>

        {visiblePages.map((visiblePage, index) => {
          const previousPage = visiblePages[index - 1]
          const needsGap = previousPage && visiblePage - previousPage > 1

          return (
            <React.Fragment key={visiblePage}>
              {needsGap ? (
                <span className="flex size-8 items-center justify-center text-sm text-muted-foreground">
                  ...
                </span>
              ) : null}
              <PaginationControl
                getPageHref={getPageHref}
                label={`ไปหน้า ${visiblePage}`}
                page={visiblePage}
                currentPage={safePage}
              >
                <span className="text-sm">{visiblePage}</span>
              </PaginationControl>
            </React.Fragment>
          )
        })}

        <PaginationControl
          disabled={safePage >= safeTotalPages}
          getPageHref={getPageHref}
          label="ไปหน้าถัดไป"
          page={safePage + 1}
          currentPage={safePage}
        >
          <ChevronRight />
        </PaginationControl>
        <PaginationControl
          disabled={safePage >= safeTotalPages}
          getPageHref={getPageHref}
          label="ไปหน้าสุดท้าย"
          page={safeTotalPages}
          currentPage={safePage}
        >
          <ChevronsRight />
        </PaginationControl>
      </div>
    </nav>
  )
}
