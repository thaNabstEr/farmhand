import * as React from "react"
import { cn } from "@/lib/utils"

export type StatusType = "success" | "warning" | "error" | "info" | "neutral";

export interface StatusBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  status: StatusType;
  label: string;
}

export function StatusBadge({ status, label, className, ...props }: StatusBadgeProps) {
  const statusStyles = {
    success: "bg-success/10 text-success border-success/20 dark:bg-success/15 dark:text-green-400 dark:border-success/30",
    warning: "bg-warning/10 text-warning border-warning/20 dark:bg-warning/15 dark:text-amber-400 dark:border-warning/30",
    error: "bg-error/10 text-error border-error/20 dark:bg-error/15 dark:text-red-400 dark:border-error/30",
    info: "bg-info/10 text-info border-info/20 dark:bg-info/15 dark:text-blue-400 dark:border-info/30",
    neutral: "bg-neutral-100 text-neutral-600 border-neutral-200 dark:bg-neutral-800/50 dark:text-neutral-300 dark:border-neutral-700/50",
  };

  const dotStyles = {
    success: "bg-success dark:bg-green-400",
    warning: "bg-warning dark:bg-amber-400",
    error: "bg-error dark:bg-red-400",
    info: "bg-info dark:bg-blue-400",
    neutral: "bg-neutral-400 dark:bg-neutral-500",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border transition-colors",
        statusStyles[status],
        className
      )}
      {...props}
    >
      <span className={cn("size-1.5 rounded-full shrink-0 animate-pulse", dotStyles[status])} />
      {label}
    </span>
  )
}
