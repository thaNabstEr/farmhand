import * as React from "react"
import { cn } from "@/lib/utils"

export interface Column<T> {
  key: string;
  header: React.ReactNode;
  render?: (row: T) => React.ReactNode;
  align?: "left" | "center" | "right";
  className?: string;
}

export interface DataTableProps<T> extends React.HTMLAttributes<HTMLDivElement> {
  columns: Column<T>[];
  data: T[];
  emptyText?: string;
  onRowClick?: (row: T) => void;
}

export function DataTable<T extends { id: string | number }>({
  columns,
  data,
  emptyText = "No data available",
  onRowClick,
  className,
  ...props
}: DataTableProps<T>) {
  return (
    <div className={cn("w-full overflow-x-auto rounded-card border border-neutral-200/60 dark:border-neutral-800/60 bg-card shadow-card", className)} {...props}>
      <table className="w-full border-collapse text-left text-sm text-neutral-900 dark:text-neutral-100">
        <thead>
          <tr className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/30 font-medium text-neutral-500 dark:text-neutral-400 select-none">
            {columns.map((col, index) => (
              <th
                key={col.key || index}
                scope="col"
                className={cn(
                  "px-6 py-3 text-xs font-semibold uppercase tracking-wider",
                  col.align === "center" && "text-center",
                  col.align === "right" && "text-right",
                  col.className
                )}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-200/80 dark:divide-neutral-800/80">
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-6 py-10 text-center text-sm text-neutral-400 dark:text-neutral-500"
              >
                {emptyText}
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr
                key={row.id || rowIndex}
                onClick={() => onRowClick?.(row)}
                className={cn(
                  "transition-colors",
                  onRowClick ? "hover:bg-neutral-50/70 dark:hover:bg-neutral-900/40 cursor-pointer" : "hover:bg-neutral-50/30 dark:hover:bg-neutral-900/10"
                )}
              >
                {columns.map((col, colIndex) => (
                  <td
                    key={col.key || colIndex}
                    className={cn(
                      "px-6 py-4 whitespace-nowrap align-middle text-sm",
                      col.align === "center" && "text-center",
                      col.align === "right" && "text-right",
                      col.className
                    )}
                  >
                    {col.render ? col.render(row) : ((row as Record<string, unknown>)[col.key] as React.ReactNode)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
