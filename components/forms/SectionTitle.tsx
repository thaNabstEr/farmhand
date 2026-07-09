import * as React from "react"
import { cn } from "@/lib/utils"

export type SectionTitleProps = React.HTMLAttributes<HTMLHeadingElement>;

export function SectionTitle({ className, children, ...props }: SectionTitleProps) {
  return (
    <h4
      className={cn(
        "text-[10px] font-bold text-neutral-400 dark:text-neutral-500 tracking-widest uppercase select-none pb-2 border-b border-neutral-100 dark:border-neutral-900",
        className
      )}
      {...props}
    >
      {children}
    </h4>
  )
}
