import * as React from "react"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"

export type DataTableColumn<TData> = {
  id: string
  header: React.ReactNode
  cell: (row: TData, index: number) => React.ReactNode
  className?: string
  headerClassName?: string
  align?: "left" | "center" | "right"
  sticky?: "left" | "right"
}

export interface DataTableProps<TData>
  extends Omit<React.ComponentPropsWithoutRef<"div">, "children"> {
  data: TData[]
  columns: Array<DataTableColumn<TData>>
  getRowKey: (row: TData, index: number) => React.Key
  toolbar?: React.ReactNode
  footer?: React.ReactNode
  emptyState?: React.ReactNode
  rowClassName?: (row: TData, index: number) => string | undefined
  isLoading?: boolean
}

const alignClassNames = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
}

const stickyClassNames = {
  left: "sticky left-0 z-10 border-r border-border bg-card",
  right: "sticky right-0 z-10 border-l border-border bg-card",
}

export function DataTable<TData>({
  data,
  columns,
  getRowKey,
  toolbar,
  footer,
  emptyState,
  rowClassName,
  isLoading,
  className,
  ...props
}: DataTableProps<TData>) {
  const hasRows = data.length > 0

  return (
    <div
      data-slot="data-table"
      className={cn(
        "flex min-h-0 flex-col overflow-hidden rounded-xl border border-border bg-card text-card-foreground",
        className
      )}
      {...props}
    >
      {toolbar ? (
        <div className="border-b border-border bg-muted/40 px-4 py-3">
          {toolbar}
        </div>
      ) : null}

      <div className="min-h-0 flex-1 overflow-auto">
        <Table className="min-w-full">
          <TableHeader className="sticky top-0 z-20 bg-card">
            <TableRow className="hover:bg-transparent">
              {columns.map((column) => (
                <TableHead
                  key={column.id}
                  className={cn(
                    "h-11 px-4 text-xs font-medium text-muted-foreground",
                    alignClassNames[column.align ?? "left"],
                    column.sticky && stickyClassNames[column.sticky],
                    column.headerClassName
                  )}
                >
                  {column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {hasRows && !isLoading
              ? data.map((row, rowIndex) => (
                  <TableRow
                    key={getRowKey(row, rowIndex)}
                    className={cn("group", rowClassName?.(row, rowIndex))}
                  >
                    {columns.map((column) => (
                      <TableCell
                        key={column.id}
                        className={cn(
                          "px-4 py-3 text-sm",
                          alignClassNames[column.align ?? "left"],
                          column.sticky && stickyClassNames[column.sticky],
                          column.sticky && "group-hover:bg-muted",
                          column.className
                        )}
                      >
                        {column.cell(row, rowIndex)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              : null}
          </TableBody>
        </Table>

        {!hasRows || isLoading ? (
          <div className="flex min-h-64 items-center justify-center p-6">
            {emptyState}
          </div>
        ) : null}
      </div>

      {footer ? (
        <div className="border-t border-border px-4 py-3">{footer}</div>
      ) : null}
    </div>
  )
}
