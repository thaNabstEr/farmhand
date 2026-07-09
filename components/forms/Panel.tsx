import * as React from "react"
import { cn } from "@/lib/utils"

export interface PanelProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  headerActions?: React.ReactNode;
  widthClass?: string;
  scrollable?: boolean;
}

export function Panel({
  title,
  headerActions,
  widthClass = "w-80",
  scrollable = true,
  className,
  children,
  ...props
}: PanelProps) {
  return (
    <div
      className={cn(
        "flex flex-col bg-card border-neutral-200/80 dark:border-neutral-800/80 h-full shrink-0 transition-colors duration-200",
        widthClass,
        className
      )}
      {...props}
    >
      {/* Optional Panel Header */}
      {(title || headerActions) && (
        <div className="h-12 px-4 flex items-center justify-between border-b border-neutral-200/60 dark:border-neutral-800/60 shrink-0">
          {title && (
            <h3 className="text-xs font-bold text-neutral-800 dark:text-neutral-200 tracking-wider uppercase">
              {title}
            </h3>
          )}
          {headerActions && (
            <div className="flex items-center gap-1.5 shrink-0">
              {headerActions}
            </div>
          )}
        </div>
      )}

      {/* Panel Contents */}
      <div
        className={cn(
          "flex-1 min-h-0",
          scrollable ? "overflow-y-auto p-4 space-y-4 scrollbar-thin" : "p-4"
        )}
      >
        {children}
      </div>
    </div>
  )
}
