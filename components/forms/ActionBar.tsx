import * as React from "react"
import { cn } from "@/lib/utils"

export type ActionBarProps = React.HTMLAttributes<HTMLDivElement>;

export function ActionBar({ className, ...props }: ActionBarProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 p-2 bg-neutral-50 dark:bg-neutral-900/20 border border-neutral-200/50 dark:border-neutral-800/25 rounded-button shadow-card",
        className
      )}
      {...props}
    />
  )
}
